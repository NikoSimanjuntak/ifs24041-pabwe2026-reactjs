import { Link, useLocation } from 'react-router-dom';
import { FiBarChart2, FiGrid, FiUser, FiUsers, FiX } from 'react-icons/fi';

export const MENU = [
  { key: 'home', label: 'Laporan', to: '/', icon: FiGrid },
  { key: 'stats', label: 'Statistik', to: '/#statistik', icon: FiBarChart2 },
  { key: 'users', label: 'Pengguna', to: '/users', icon: FiUsers },
  { key: 'profile', label: 'Profil saya', to: '/profile', icon: FiUser },
];

const isActive = (key, { pathname, hash }) => {
  if (key === 'stats') return pathname === '/' && hash === '#statistik';
  if (key === 'home') return (pathname === '/' && hash !== '#statistik') || pathname.startsWith('/lost-founds');
  return pathname.startsWith(`/${key}`);
};

export default function SidebarComponent({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {open && <div data-testid="sidebar-backdrop" onClick={onClose} className="fixed inset-0 z-40 bg-ink/50 lg:hidden" />}
      <aside aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-white p-4 pt-20 transition-transform lg:top-0 lg:z-20 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button type="button" onClick={onClose} aria-label="Tutup menu" className="btn btn-ghost absolute right-3 top-3 !p-2 lg:hidden">
          <FiX className="h-5 w-5" />
        </button>
        <nav className="space-y-1">
          {MENU.map(({ key, label, to, icon: Icon }) => {
            const active = isActive(key, location);
            return (
              <Link key={key} to={to} onClick={onClose} aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${active ? 'bg-ink text-white' : 'text-ink-soft hover:bg-paper hover:text-ink'}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
