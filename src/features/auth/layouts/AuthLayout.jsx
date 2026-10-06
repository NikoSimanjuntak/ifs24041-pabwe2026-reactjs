import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logo from '../../../components/Logo';

export default function AuthLayout() {
  const isAuthLogin = useSelector((state) => state.isAuthLogin);

  if (isAuthLogin) return <Navigate to="/" replace />;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <Logo light />
        <div className="max-w-md">
          <p className="font-display text-5xl font-extrabold leading-[1.05]">
            Barangmu hilang? Laporkan, lalu temukan kembali.
          </p>
          <p className="mt-5 text-base leading-relaxed text-slate-300">
            Satu tempat untuk melaporkan barang yang hilang dan barang yang kamu temukan
            di sekitar kampus.
          </p>
        </div>
        <ul className="flex gap-3 text-sm font-semibold">
          <li className="rounded-full bg-lost px-4 py-1.5">Kehilangan</li>
          <li className="rounded-full bg-found px-4 py-1.5">Penemuan</li>
          <li className="rounded-full bg-tag px-4 py-1.5 text-ink">Selesai</li>
        </ul>
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[28px] border-white/5" />
      </aside>
      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}