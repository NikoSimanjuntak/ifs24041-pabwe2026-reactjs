import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { putAccessToken } from './helpers/apiHelper';
import App from './App';
import { reducer } from './store';
import { getLostFoundStatsDaily, getLostFoundStatsMonthly, getLostFounds } from './features/lost-founds/api/lostFoundApi';
import { getProfile, getUsers } from './features/users/api/userApi';

vi.mock('./features/lost-founds/api/lostFoundApi');
vi.mock('./features/users/api/userApi');
vi.mock('./helpers/toolsHelper', () => ({
  showSuccessDialog: vi.fn(), showErrorDialog: vi.fn(), showConfirmDialog: vi.fn(), formatDate: () => 'tgl',
}));

const mount = (route, loggedIn) => {
  if (loggedIn) putAccessToken('tkn');
  const store = configureStore({ reducer });
  return render(
    <Provider store={store}><MemoryRouter initialEntries={[route]}><App /></MemoryRouter></Provider>,
  );
};

beforeEach(() => {
  getProfile.mockResolvedValue({ id: 1, name: 'Budi', email: 'b@d.id', photo: null });
  getLostFounds.mockResolvedValue([]);
  getLostFoundStatsDaily.mockResolvedValue({});
  getLostFoundStatsMonthly.mockResolvedValue({});
  getUsers.mockResolvedValue([{ id: 1, name: 'Budi', email: 'b@d.id', photo: null, created_at: '2024-01-01' }]);
});

describe('App routing', () => {
  it('/auth diarahkan ke halaman login', () => {
    mount('/auth', false);
    expect(screen.getByRole('heading', { name: 'Masuk ke akunmu' })).toBeInTheDocument();
  });
  it('/auth/register menampilkan formulir registrasi', () => {
    mount('/auth/register', false);
    expect(screen.getByRole('heading', { name: 'Buat akun baru' })).toBeInTheDocument();
  });
  it('rute terproteksi mengalihkan tamu ke login', () => {
    mount('/users', false);
    expect(screen.getByRole('heading', { name: 'Masuk ke akunmu' })).toBeInTheDocument();
  });
  it('pengguna terautentikasi melihat beranda', async () => {
    mount('/', true);
    expect(await screen.findByRole('heading', { name: 'Laporan barang' })).toBeInTheDocument();
  });
  it('/users dan /profile dapat diakses setelah login', async () => {
    const { unmount } = mount('/users', true);
    expect(await screen.findByRole('heading', { name: 'Pengguna' })).toBeInTheDocument();
    unmount();
    mount('/profile', true);
    expect(await screen.findByRole('heading', { name: 'Profil saya' })).toBeInTheDocument();
  });
  it('rute tidak dikenal kembali ke beranda', async () => {
    mount('/tidak-ada', true);
    expect(await screen.findByRole('heading', { name: 'Laporan barang' })).toBeInTheDocument();
  });
});
