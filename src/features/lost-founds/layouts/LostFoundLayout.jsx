import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAccessToken } from '../../../helpers/apiHelper';
import { asyncAuthLogout } from '../../auth/states/action';
import { asyncProfile } from '../../users/states/action';
import { showConfirmDialog } from '../../../helpers/toolsHelper';
import Spinner from '../../../components/Spinner';
import NavbarComponent from '../components/NavbarComponent';
import SidebarComponent from '../components/SidebarComponent';

/** Shell dashboard + route guard: verifikasi token dan muat sesi profil. */
export default function LostFoundLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthLogin = useSelector((state) => state.isAuthLogin);
  const profile = useSelector((state) => state.profile);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const hasToken = Boolean(getAccessToken());

  const loadProfile = useCallback(async () => {
    setLoadFailed(false);
    const result = await dispatch(asyncProfile());
    if (result === 'unauthorized') dispatch(asyncAuthLogout()); // token ditolak server
    else if (!result) setLoadFailed(true); // gangguan sesaat: sesi dipertahankan
  }, [dispatch]);

  useEffect(() => {
    if (!hasToken || !isAuthLogin) return;
    loadProfile();
  }, [hasToken, isAuthLogin, loadProfile]);

  const handleLogout = async () => {
    const ok = await showConfirmDialog('Kamu akan keluar dari akun ini.', {
      title: 'Keluar dari akun?',
      confirmText: 'Ya, keluar',
    });
    if (ok) {
      await dispatch(asyncAuthLogout());
      navigate('/auth/login', { replace: true });
    }
  };

  if (!hasToken || !isAuthLogin) return <Navigate to="/auth/login" replace />;
  if (!profile && loadFailed) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-extrabold">Sesi belum dapat dimuat</h1>
          <p className="mt-2 text-sm text-ink-soft">Koneksi ke server bermasalah. Akunmu tetap masuk.</p>
          <button type="button" className="btn btn-primary mt-5" onClick={loadProfile}>Coba lagi</button>
        </div>
      </div>
    );
  }
  if (!profile) {
    return (
      <>
        <h1 className="sr-only">Lost &amp; Found</h1>
        <Spinner label="Menyiapkan sesi…" className="min-h-screen" />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <NavbarComponent profile={profile} onToggleSidebar={() => setSidebarOpen((v) => !v)} onLogout={handleLogout} />
      <SidebarComponent open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="px-4 py-8 lg:ml-64 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}