import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiCamera, FiEdit2, FiImage, FiTrash2 } from 'react-icons/fi';
import Avatar from '../../../components/Avatar';
import Spinner from '../../../components/Spinner';
import StatusBadge from '../../../components/StatusBadge';
import { assetUrl } from '../../../helpers/apiHelper';
import { formatDate, showConfirmDialog } from '../../../helpers/toolsHelper';
import ChangeCoverModal from '../modals/ChangeCoverModal';
import ChangeModal from '../modals/ChangeModal';
import { asyncLostFound, asyncLostFoundDelete } from '../states/action';

export default function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lostFound = useSelector((s) => s.lostFound);
  const isLoading = useSelector((s) => s.isLostFound);
  const profile = useSelector((s) => s.profile);
  const [modal, setModal] = useState(null); // 'change' | 'cover' | null

  useEffect(() => {
    dispatch(asyncLostFound(id));
  }, [dispatch, id]);

  const reload = () => dispatch(asyncLostFound(id));

  const handleDelete = async () => {
    const ok = await showConfirmDialog('Laporan ini akan dihapus permanen.', { title: 'Hapus laporan?', confirmText: 'Ya, hapus' });
    if (ok && (await dispatch(asyncLostFoundDelete(id)))) navigate('/', { replace: true });
  };

  const back = (
    <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink">
      <FiArrowLeft /> Kembali ke daftar
    </Link>
  );

  if (isLoading && !lostFound) return <div className="mx-auto max-w-4xl">{back}<h1 className="sr-only">Detail laporan</h1><Spinner label="Memuat detail…" /></div>;
  if (!lostFound) {
    return (
      <div className="mx-auto max-w-4xl">
        {back}
        <div className="panel py-16 text-center">
          <h1 className="text-xl font-bold">Laporan tidak ditemukan</h1>
          <p className="mt-1 text-sm text-ink-soft">Laporan mungkin sudah dihapus atau tautannya keliru.</p>
        </div>
      </div>
    );
  }

  const cover = assetUrl(lostFound.cover);
  const isOwner = profile?.id === lostFound.user_id;

  return (
    <div className="mx-auto max-w-4xl">
      {back}
      <article className="panel overflow-hidden">
        <div className="relative grid min-h-[16rem] place-items-center bg-ink/5">
          {cover ? (
            <img src={cover} alt={lostFound.title} className="max-h-[30rem] w-full object-contain" />
          ) : (
            <span className="flex flex-col items-center gap-2 py-16 text-sm text-ink-soft"><FiImage className="h-9 w-9" /> Belum ada foto cover</span>
          )}
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <StatusBadge status={lostFound.status} completed={Boolean(lostFound.is_completed)} />
              <h1 className="mt-3 text-3xl font-extrabold">{lostFound.title}</h1>
            </div>
            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-ghost" onClick={() => setModal('cover')}><FiCamera /> Ganti cover</button>
                <button type="button" className="btn btn-ghost" onClick={() => setModal('change')}><FiEdit2 /> Ubah data</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}><FiTrash2 /> Hapus</button>
              </div>
            )}
          </div>

          <dl className="grid gap-4 rounded-xl bg-paper p-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold text-ink-soft">Pelapor</dt>
              <dd className="mt-1.5 flex items-center gap-2 text-sm font-bold">
                <Avatar name={lostFound.author?.name ?? 'Anonim'} photo={lostFound.author?.photo} size="h-7 w-7" />
                {lostFound.author?.name ?? 'Anonim'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-ink-soft">Tanggal lapor</dt>
              <dd className="mt-1.5 text-sm font-bold">{formatDate(lostFound.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-ink-soft">Status penyelesaian</dt>
              <dd className="mt-1.5 text-sm font-bold">{lostFound.is_completed ? 'Selesai' : 'Masih diproses'}</dd>
            </div>
          </dl>

          <section>
            <h2 className="text-lg font-bold">Deskripsi</h2>
            <p className="mt-2 max-w-prose whitespace-pre-line leading-relaxed text-ink-soft">{lostFound.description}</p>
          </section>
        </div>
      </article>

      {modal === 'change' && <ChangeModal lostFound={lostFound} onClose={() => setModal(null)} onChanged={reload} />}
      {modal === 'cover' && <ChangeCoverModal lostFound={lostFound} onClose={() => setModal(null)} onChanged={reload} />}
    </div>
  );
}