import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../api/lostFoundApi';
import { renderWithProviders } from '../../../test-utils';
import AddModal from './AddModal';
import ChangeCoverModal from './ChangeCoverModal';
import ChangeModal from './ChangeModal';

vi.mock('../api/lostFoundApi');
vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccessDialog: vi.fn(), showErrorDialog: vi.fn(), showConfirmDialog: vi.fn(), formatDate: (d) => String(d),
}));

const item = { id: 5, title: 'Dompet', description: 'Cokelat', status: 'lost', is_completed: 0, cover: null };

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});

describe('AddModal', () => {
  it('validasi: judul & deskripsi wajib', async () => {
    renderWithProviders(<AddModal onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Simpan laporan' }));
    expect(screen.getByText('Judul wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi wajib diisi.')).toBeInTheDocument();
    expect(api.postLostFound).not.toHaveBeenCalled();
  });
  it('mengirim laporan baru lalu menutup modal', async () => {
    api.postLostFound.mockResolvedValue(9);
    const onClose = vi.fn(); const onAdded = vi.fn();
    const { store } = renderWithProviders(<AddModal onClose={onClose} onAdded={onAdded} />);
    await userEvent.click(screen.getByLabelText('Barang ditemukan'));
    await userEvent.type(screen.getByLabelText('Judul'), ' Kunci ');
    await userEvent.type(screen.getByLabelText('Deskripsi'), 'Dekat kantin');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan laporan' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.postLostFound).toHaveBeenCalledWith({ title: 'Kunci', description: 'Dekat kantin', status: 'found' });
    expect(onAdded).toHaveBeenCalledWith(9);
    expect(store.getState().isLostFoundAdded).toBe(true);
  });
  it('tetap terbuka saat gagal; ESC, klik latar, dan tombol batal menutup', async () => {
    api.postLostFound.mockRejectedValue(new Error('gagal'));
    const onClose = vi.fn();
    renderWithProviders(<AddModal onClose={onClose} />);
    await userEvent.type(screen.getByLabelText('Judul'), 'A');
    await userEvent.type(screen.getByLabelText('Deskripsi'), 'B');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan laporan' }));
    await waitFor(() => expect(api.postLostFound).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement);
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});

describe('ChangeModal', () => {
  it('terisi data awal dan mengirim perubahan termasuk status selesai', async () => {
    api.putLostFound.mockResolvedValue({});
    const onClose = vi.fn(); const onChanged = vi.fn();
    renderWithProviders(<ChangeModal lostFound={item} onClose={onClose} onChanged={onChanged} />);
    expect(screen.getByLabelText('Judul')).toHaveValue('Dompet');
    await userEvent.clear(screen.getByLabelText('Judul'));
    await userEvent.type(screen.getByLabelText('Judul'), 'Dompet hitam');
    await userEvent.click(screen.getByRole('switch', { name: 'Tandai sebagai selesai' }));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.putLostFound).toHaveBeenCalledWith(5, expect.objectContaining({ title: 'Dompet hitam', is_completed: 1 }));
    expect(onChanged).toHaveBeenCalled();
  });
  it('validasi field kosong', async () => {
    renderWithProviders(<ChangeModal lostFound={item} onClose={vi.fn()} />);
    await userEvent.clear(screen.getByLabelText('Deskripsi'));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    expect(screen.getByText('Deskripsi wajib diisi.')).toBeInTheDocument();
    expect(api.putLostFound).not.toHaveBeenCalled();
  });
  it('tidak menutup saat server menolak', async () => {
    api.putLostFound.mockRejectedValue(new Error('x'));
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal lostFound={{ ...item, is_completed: 1 }} onClose={onClose} />);
    expect(screen.getByRole('switch')).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(api.putLostFound).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('ChangeCoverModal', () => {
  const png = () => new File(['x'], 'c.png', { type: 'image/png' });

  it('wajib memilih gambar sebelum mengunggah', async () => {
    renderWithProviders(<ChangeCoverModal lostFound={item} onClose={vi.fn()} />);
    expect(screen.getByText('Belum ada gambar')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Unggah cover' }));
    expect(screen.getByText('Pilih gambar terlebih dahulu.')).toBeInTheDocument();
  });
  it('menampilkan pratinjau langsung lalu mengunggah', async () => {
    api.postLostFoundCover.mockResolvedValue({});
    const onClose = vi.fn(); const onChanged = vi.fn();
    renderWithProviders(<ChangeCoverModal lostFound={item} onClose={onClose} onChanged={onChanged} />);
    const file = png();
    await userEvent.upload(screen.getByLabelText(/Pilih gambar/), file);
    expect(await screen.findByAltText('Pratinjau cover')).toHaveAttribute('src', 'blob:preview');
    await userEvent.click(screen.getByRole('button', { name: 'Unggah cover' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.postLostFoundCover).toHaveBeenCalledWith(5, file);
    expect(onChanged).toHaveBeenCalled();
  });
  it('menolak file non-gambar dan file terlalu besar', async () => {
    renderWithProviders(<ChangeCoverModal lostFound={{ ...item, cover: 'img/a.png' }} onClose={vi.fn()} />);
    expect(screen.getByAltText('Pratinjau cover')).toHaveAttribute('src', 'https://open-api.delcom.org/img/a.png');
    const input = screen.getByLabelText(/Pilih gambar/);
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] } });
    expect(await screen.findByText('File harus berupa gambar.')).toBeInTheDocument();
    const big = png();
    Object.defineProperty(big, 'size', { value: 3 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [big] } });
    expect(await screen.findByText('Ukuran gambar maksimal 2 MB.')).toBeInTheDocument();
    fireEvent.change(input, { target: { files: [] } });
  });
});
