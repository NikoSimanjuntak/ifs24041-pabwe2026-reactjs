import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiCheckCircle, FiEdit2, FiImage, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import StatusBadge from '../../../components/StatusBadge';
import { assetUrl } from '../../../helpers/apiHelper';
import { formatDate, showConfirmDialog } from '../../../helpers/toolsHelper';
import useInput from '../../../hooks/useInput';
import AddModal from '../modals/AddModal';
import ChangeModal from '../modals/ChangeModal';
import {
  asyncLostFoundChange,
  asyncLostFoundDelete,
  asyncLostFoundStats,
  asyncLostFounds,
} from '../states/action';

const STATUS_FILTERS = [['', 'Semua'], ['lost', 'Hilang'], ['found', 'Ditemukan']];
const DONE_FILTERS = [['', 'Semua'], ['0', 'Diproses'], ['1', 'Selesai']];

const Segmented = ({ label, options, value, onChange }) => (
  <div role="group" aria-label={label} className="inline-flex rounded-lg border border-line bg-white p-1">
    {options.map(([val, text]) => (
      <button key={val} type="button" onClick={() => onChange(val)} aria-pressed={value === val}
        className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${value === val ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}>
        {text}
      </button>
    ))}
  </div>
);

function SummaryCard({ label, value, tone }) {
  return (
    <div className={`panel border-t-4 p-5 ${tone}`}>
      <p className="text-sm font-semibold text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-4xl font-extrabold">{value}</p>
    </div>
  );
}

/** Grafik batang harian sederhana dari GET /lost-founds/stats/daily. */
function DailyChart({ daily }) {
  const lost = daily?.stats_losts ?? {};
  const found = daily?.stats_founds ?? {};
  const days = Object.keys(lost);
  const max = Math.max(1, ...days.flatMap((d) => [lost[d] ?? 0, found[d] ?? 0]));

  if (!days.length) return <p className="py-8 text-center text-sm text-ink-soft">Belum ada data statistik.</p>;
  return (
    <div>
      <div className="flex h-40 items-end gap-3" role="img" aria-label="Grafik laporan harian">
        {days.map((day) => (
          <div key={day} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end justify-center gap-1">
              <span title={`Hilang: ${lost[day] ?? 0}`} style={{ height: `${((lost[day] ?? 0) / max) * 100}%` }} className="w-1/3 min-h-[3px] rounded-t bg-lost" />
              <span title={`Ditemukan: ${found[day] ?? 0}`} style={{ height: `${((found[day] ?? 0) / max) * 100}%` }} className="w-1/3 min-h-[3px] rounded-t bg-found" />
            </div>
            <span className="text-[11px] text-ink-soft">{day.slice(0, 5)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex gap-4 text-xs font-semibold">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-lost" /> Hilang</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-found" /> Ditemukan</span>
      </p>
    </div>
  );
}

function ReportCard({ item, isOwner, onToggleDone, onEdit, onDelete }) {
  const cover = assetUrl(item.cover);
  return (
    <article className="panel flex flex-col overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-2 ${item.status === 'lost' ? 'bg-lost' : 'bg-found'}`}>
        <span aria-hidden="true" className="h-3 w-3 rounded-full bg-paper" />
        <span className="text-xs font-bold text-white">{item.status === 'lost' ? 'Barang hilang' : 'Barang ditemukan'}</span>
      </div>
      <Link to={`/lost-founds/${item.id}`} className="grid aspect-[16/10] place-items-center bg-paper">
        {cover ? <img src={cover} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
          : <FiImage aria-label="Tanpa gambar" className="h-8 w-8 text-slate-300" />}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <StatusBadge status={item.status} completed={Boolean(item.is_completed)} />
        <h3 className="mt-2 text-lg font-bold leading-snug">
          <Link to={`/lost-founds/${item.id}`} className="hover:underline">{item.title}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{item.description}</p>
        <p className="mt-3 text-xs text-ink-soft">{item.author?.name ?? 'Anonim'} · {formatDate(item.created_at, { withTime: false })}</p>
        {isOwner && (
          <div className="mt-4 flex gap-2 border-t border-line pt-3">
            <button type="button" onClick={() => onToggleDone(item)} className="btn btn-ghost flex-1 !px-2 !py-1.5 !text-xs">
              <FiCheckCircle /> {item.is_completed ? 'Buka lagi' : 'Selesaikan'}
            </button>
            <button type="button" aria-label={`Ubah ${item.title}`} onClick={() => onEdit(item)} className="btn btn-ghost !px-2.5 !py-1.5"><FiEdit2 /></button>
            <button type="button" aria-label={`Hapus ${item.title}`} onClick={() => onDelete(item)} className="btn btn-ghost !px-2.5 !py-1.5 text-lost"><FiTrash2 /></button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function HomePage() {
  const dispatch = useDispatch();
  const { hash } = useLocation();
  const { lostFounds, isLostFound, profile, lostFoundStats } = useSelector((s) => ({
    lostFounds: s.lostFounds, isLostFound: s.isLostFound, profile: s.profile, lostFoundStats: s.lostFoundStats,
  }), (a, b) => Object.keys(a).every((k) => a[k] === b[k]));

  const [status, setStatus] = useState('');
  const [done, setDone] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [keyword, onKeywordChange] = useInput('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  const reload = () => dispatch(asyncLostFounds(onlyMine ? { is_me: 1 } : {}));

  useEffect(() => {
    dispatch(asyncLostFounds(onlyMine ? { is_me: 1 } : {}));
  }, [dispatch, onlyMine]);

  useEffect(() => {
    dispatch(asyncLostFoundStats());
  }, [dispatch]);

  useEffect(() => {
    if (hash === '#statistik') document.getElementById('statistik')?.scrollIntoView?.();
  }, [hash, lostFounds]);

  const summary = useMemo(() => ({
    total: lostFounds.length,
    lost: lostFounds.filter((i) => i.status === 'lost').length,
    found: lostFounds.filter((i) => i.status === 'found').length,
    completed: lostFounds.filter((i) => i.is_completed).length,
  }), [lostFounds]);

  const visible = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return lostFounds.filter((i) =>
      (!status || i.status === status) &&
      (!done || String(i.is_completed ? 1 : 0) === done) &&
      (!q || `${i.title} ${i.description}`.toLowerCase().includes(q)));
  }, [lostFounds, status, done, keyword]);

  const handleToggleDone = async (item) => {
    const ok = await dispatch(asyncLostFoundChange(item.id, {
      title: item.title, description: item.description, status: item.status, is_completed: item.is_completed ? 0 : 1,
    }));
    if (ok) reload();
  };

  const handleDelete = async (item) => {
    const confirmed = await showConfirmDialog(`Laporan "${item.title}" akan dihapus permanen.`, {
      title: 'Hapus laporan?', confirmText: 'Ya, hapus',
    });
    if (confirmed && (await dispatch(asyncLostFoundDelete(item.id)))) reload();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Laporan barang</h1>
          <p className="mt-1 text-sm text-ink-soft">Pantau barang hilang dan temuan terbaru.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}><FiPlus /> Tambah laporan</button>
      </div>

      <section id="statistik" aria-label="Ringkasan statistik" className="scroll-mt-24 space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard label="Total laporan" value={summary.total} tone="border-ink" />
          <SummaryCard label="Barang hilang" value={summary.lost} tone="border-lost" />
          <SummaryCard label="Barang ditemukan" value={summary.found} tone="border-found" />
          <SummaryCard label="Selesai" value={summary.completed} tone="border-tag" />
        </div>
        <div className="panel p-5">
          <h2 className="mb-4 text-lg font-bold">Laporan 7 hari terakhir</h2>
          <DailyChart daily={lostFoundStats?.daily} />
        </div>
      </section>

      <section aria-label="Daftar laporan" className="space-y-4">
        <h2 className="sr-only">Daftar laporan</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[14rem] flex-1">
            <FiSearch aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="search" aria-label="Cari laporan" placeholder="Cari judul atau deskripsi…" value={keyword}
              onChange={onKeywordChange} className="field !pl-10" />
          </div>
          <Segmented label="Filter jenis" options={STATUS_FILTERS} value={status} onChange={setStatus} />
          <Segmented label="Filter status" options={DONE_FILTERS} value={done} onChange={setDone} />
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="h-4 w-4 accent-[#14213d]" />
            Laporan saya
          </label>
        </div>

        {isLostFound && !lostFounds.length ? <Spinner label="Memuat laporan…" />
          : visible.length === 0 ? (
            <div className="panel py-16 text-center">
              <p className="font-bold">Tidak ada laporan yang cocok</p>
              <p className="mt-1 text-sm text-ink-soft">Ubah filter pencarian atau buat laporan baru.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => (
                <ReportCard key={item.id} item={item} isOwner={profile?.id === item.user_id}
                  onToggleDone={handleToggleDone} onEdit={setEditing} onDelete={handleDelete} />
              ))}
            </div>
          )}
      </section>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdded={reload} />}
      {editing && <ChangeModal lostFound={editing} onClose={() => setEditing(null)} onChanged={reload} />}
    </div>
  );
}