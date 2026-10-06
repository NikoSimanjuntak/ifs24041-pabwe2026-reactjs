import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch } from 'react-icons/fi';
import Avatar from '../../../components/Avatar';
import { formatDate } from '../../../helpers/toolsHelper';
import useInput from '../../../hooks/useInput';
import { asyncUsers } from '../states/action';

export default function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector((s) => s.users);
  const profile = useSelector((s) => s.profile);
  const [keyword, onKeywordChange] = useInput('');

  useEffect(() => {
    dispatch(asyncUsers());
  }, [dispatch]);

  const visible = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return users.filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q));
  }, [users, keyword]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Pengguna</h1>
        <p className="mt-1 text-sm text-ink-soft">{users.length} akun terdaftar di sistem.</p>
      </div>
      <div className="relative max-w-md">
        <FiSearch aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="search" aria-label="Cari pengguna" placeholder="Cari nama atau email…" value={keyword}
          onChange={onKeywordChange} className="field !pl-10" />
      </div>

      {visible.length === 0 ? (
        <div className="panel py-14 text-center text-sm text-ink-soft">Tidak ada pengguna yang cocok.</div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((u) => (
            <li key={u.id} className="panel flex items-center gap-4 p-4">
              <Avatar name={u.name} photo={u.photo} size="h-12 w-12" />
              <div className="min-w-0">
                <p className="truncate font-bold">
                  {u.name}
                  {profile?.id === u.id && <span className="ml-2 rounded-full bg-tag px-2 py-0.5 text-[11px] font-bold">Kamu</span>}
                </p>
                <p className="truncate text-sm text-ink-soft">{u.email}</p>
                <p className="text-xs text-ink-soft">Bergabung {formatDate(u.created_at, { withTime: false })}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
