import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showErrorDialog } from '../../../helpers/toolsHelper';
import { renderWithProviders } from '../../../test-utils';
import * as api from '../api/userApi';
import ProfilePage from './ProfilePage';
import UsersPage from './UsersPage';

vi.mock('../api/userApi');
vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccessDialog: vi.fn(), showErrorDialog: vi.fn(), showConfirmDialog: vi.fn(), formatDate: () => '1 Januari 2024',
}));

const me = { id: 1, name: 'Budi', email: 'budi@del.ac.id', photo: null };

describe('UsersPage', () => {
  const users = [
    { id: 1, name: 'Budi', email: 'budi@del.ac.id', photo: null, created_at: '2024-01-01' },
    { id: 2, name: 'Sari', email: 'sari@del.ac.id', photo: 'img/s.png', created_at: '2024-01-02' },
  ];
  it('memuat dan menampilkan pengguna dengan penanda akun sendiri', async () => {
    api.getUsers.mockResolvedValue(users);
    renderWithProviders(<UsersPage />, { preloadedState: { profile: me } });
    expect(await screen.findByText('Sari')).toBeInTheDocument();
    expect(screen.getByText('Kamu')).toBeInTheDocument();
    expect(screen.getByText('2 akun terdaftar di sistem.')).toBeInTheDocument();
  });
  it('mencari pengguna dan menampilkan keadaan kosong', async () => {
    api.getUsers.mockResolvedValue(users);
    renderWithProviders(<UsersPage />);
    await screen.findByText('Sari');
    await userEvent.type(screen.getByLabelText('Cari pengguna'), 'sari@');
    expect(screen.queryByText('Budi')).not.toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText('Cari pengguna'));
    await userEvent.type(screen.getByLabelText('Cari pengguna'), 'zzz');
    expect(screen.getByText('Tidak ada pengguna yang cocok.')).toBeInTheDocument();
  });
});

describe('ProfilePage', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:foto');
    URL.revokeObjectURL = vi.fn();
    api.getProfile.mockResolvedValue({ ...me, name: 'Budi Baru' });
  });
  const render = () => renderWithProviders(<ProfilePage />, { preloadedState: { profile: me } });

  it('mengisi form dengan data profil dan menyimpan perubahan', async () => {
    api.putProfile.mockResolvedValue({});
    const { store } = render();
    expect(screen.getByLabelText('Nama')).toHaveValue('Budi');
    await userEvent.clear(screen.getByLabelText('Nama'));
    await userEvent.type(screen.getByLabelText('Nama'), 'Budi Baru');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(api.putProfile).toHaveBeenCalledWith({ name: 'Budi Baru', email: 'budi@del.ac.id' }));
    await waitFor(() => expect(store.getState().profile.name).toBe('Budi Baru'));
  });
  it('validasi nama dan email', async () => {
    render();
    await userEvent.clear(screen.getByLabelText('Nama'));
    await userEvent.clear(screen.getByLabelText('Email'));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    expect(screen.getByText('Nama wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Format email tidak valid.')).toBeInTheDocument();
    expect(api.putProfile).not.toHaveBeenCalled();
  });
  it('unggah foto: pratinjau, validasi, dan pengiriman', async () => {
    api.postProfilePhoto.mockResolvedValue({});
    render();
    await userEvent.click(screen.getByRole('button', { name: 'Unggah foto' }));
    expect(screen.getByText('Pilih foto terlebih dahulu.')).toBeInTheDocument();

    const input = screen.getByLabelText(/Pilih foto/);
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] } });
    expect(showErrorDialog).toHaveBeenCalledWith('File harus berupa gambar.');
    const big = new File(['x'], 'b.png', { type: 'image/png' });
    Object.defineProperty(big, 'size', { value: 3 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [big] } });
    expect(showErrorDialog).toHaveBeenCalledWith('Ukuran foto maksimal 2 MB.');
    fireEvent.change(input, { target: { files: [] } });

    const ok = new File(['x'], 'ok.png', { type: 'image/png' });
    await userEvent.upload(input, ok);
    expect(await screen.findByAltText('Pratinjau foto')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Unggah foto' }));
    await waitFor(() => expect(api.postProfilePhoto).toHaveBeenCalledWith(ok));
    await waitFor(() => expect(screen.queryByAltText('Pratinjau foto')).not.toBeInTheDocument());
  });
  it('ganti kata sandi: validasi lalu sukses mengosongkan form', async () => {
    api.putProfilePassword.mockResolvedValue({});
    render();
    await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
    expect(screen.getByText('Kata sandi saat ini wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi baru minimal 6 karakter.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Kata sandi saat ini'), 'lama123');
    await userEvent.type(screen.getByLabelText('Kata sandi baru'), 'baru1234');
    await userEvent.type(screen.getByLabelText('Ulangi kata sandi baru'), 'beda');
    await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
    expect(screen.getByText('Konfirmasi tidak sama.')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Ulangi kata sandi baru'));
    await userEvent.type(screen.getByLabelText('Ulangi kata sandi baru'), 'baru1234');
    await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
    await waitFor(() => expect(api.putProfilePassword).toHaveBeenCalledWith({
      password: 'lama123', new_password: 'baru1234', new_password_confirmation: 'baru1234',
    }));
    await waitFor(() => expect(screen.getByLabelText('Kata sandi saat ini')).toHaveValue(''));
  });
  it('kata sandi ditolak server → form tidak dikosongkan', async () => {
    api.putProfilePassword.mockRejectedValue(new Error('Kata sandi lama salah'));
    render();
    await userEvent.type(screen.getByLabelText('Kata sandi saat ini'), 'salah1');
    await userEvent.type(screen.getByLabelText('Kata sandi baru'), 'baru1234');
    await userEvent.type(screen.getByLabelText('Ulangi kata sandi baru'), 'baru1234');
    await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalled());
    expect(screen.getByLabelText('Kata sandi saat ini')).toHaveValue('salah1');
  });
});
