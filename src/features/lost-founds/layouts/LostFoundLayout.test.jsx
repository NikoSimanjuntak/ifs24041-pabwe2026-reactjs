import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper';
import { showConfirmDialog } from '../../../helpers/toolsHelper';
import { renderWithProviders } from '../../../test-utils';
import { getProfile } from '../../users/api/userApi';
import LostFoundLayout from './LostFoundLayout';

vi.mock('../../users/api/userApi');
vi.mock('../../../helpers/toolsHelper');

const tree = (
  <Routes>
    <Route path="/" element={<LostFoundLayout />}><Route index element={<p>Konten dashboard</p>} /></Route>
    <Route path="/auth/login" element={<p>Halaman login</p>} />
  </Routes>
);

describe('LostFoundLayout (route guard)', () => {
  beforeEach(() => putAccessToken('tkn'));

  it('mengalihkan ke login tanpa token', () => {
    localStorage.clear();
    renderWithProviders(tree);
    expect(screen.getByText('Halaman login')).toBeInTheDocument();
  });
  it('memuat profil lalu merender navbar, sidebar, dan konten', async () => {
    getProfile.mockResolvedValue({ id: 1, name: 'Budi', photo: null });
    renderWithProviders(tree, { preloadedState: { isAuthLogin: true } });
    expect(screen.getByText('Menyiapkan sesi…')).toBeInTheDocument();
    expect(await screen.findByText('Konten dashboard')).toBeInTheDocument();
    expect(screen.getByText('Budi')).toBeInTheDocument();
    expect(screen.getByLabelText('Navigasi utama')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Buka menu'));
    expect(screen.getByTestId('sidebar-backdrop')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('sidebar-backdrop'));
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();
  });
  it('mengeluarkan sesi bila profil tidak dapat dimuat (token kedaluwarsa)', async () => {
    getProfile.mockRejectedValue(Object.assign(new Error('Unauthenticated.'), { status: 401 }));
    const { store } = renderWithProviders(tree, { preloadedState: { isAuthLogin: true } });
    expect(await screen.findByText('Halaman login')).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
    expect(store.getState().isAuthLogin).toBe(false);
  });
  it('gangguan sesaat (bukan 401): sesi dipertahankan dan bisa dicoba lagi', async () => {
    getProfile.mockRejectedValueOnce(Object.assign(new Error('Server sibuk'), { status: 500 }));
    getProfile.mockResolvedValue({ id: 1, name: 'Budi', photo: null });
    renderWithProviders(tree, { preloadedState: { isAuthLogin: true } });
    expect(await screen.findByText('Sesi belum dapat dimuat')).toBeInTheDocument();
    expect(getAccessToken()).toBe('tkn');
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(await screen.findByText('Konten dashboard')).toBeInTheDocument();
  });
  it('logout: konfirmasi diterima → kembali ke login; ditolak → tetap', async () => {
    getProfile.mockResolvedValue({ id: 1, name: 'Budi', photo: null });
    renderWithProviders(tree, { preloadedState: { isAuthLogin: true } });
    await screen.findByText('Konten dashboard');

    showConfirmDialog.mockResolvedValueOnce(false);
    fireEvent.click(screen.getByLabelText('Menu profil'));
    fireEvent.click(screen.getByRole('menuitem', { name: /Keluar/ }));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Konten dashboard')).toBeInTheDocument();

    showConfirmDialog.mockResolvedValueOnce(true);
    fireEvent.click(screen.getByLabelText('Menu profil'));
    fireEvent.click(screen.getByRole('menuitem', { name: /Keluar/ }));
    expect(await screen.findByText('Halaman login')).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });
});
