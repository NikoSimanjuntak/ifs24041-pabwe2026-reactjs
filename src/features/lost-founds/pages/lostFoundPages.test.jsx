import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showConfirmDialog } from '../../../helpers/toolsHelper';
import { renderWithProviders } from '../../../test-utils';
import * as api from '../api/lostFoundApi';
import DetailPage from './DetailPage';
import HomePage from './HomePage';

vi.mock('../api/lostFoundApi');
vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccessDialog: vi.fn(), showErrorDialog: vi.fn(), showConfirmDialog: vi.fn(),
  formatDate: (d) => `tgl:${d ?? '-'}`,
}));

const me = { id: 1, name: 'Budi' };
const items = [
  { id: 1, user_id: 1, title: 'Dompet cokelat', description: 'Hilang di kantin', status: 'lost', is_completed: 0, cover: 'img/a.png', created_at: '2024-02-28', author: { name: 'Budi', photo: null } },
  { id: 2, user_id: 2, title: 'Kunci motor', description: 'Ditemukan di parkiran', status: 'found', is_completed: 1, cover: null, created_at: '2024-02-27', author: { name: 'Sari', photo: null } },
  { id: 3, user_id: 2, title: 'Payung biru', description: 'Ada di perpustakaan', status: 'found', is_completed: 0, cover: null, created_at: '2024-02-26', author: null },
];
const daily = { stats_losts: { '01-10-2024': 2, '02-10-2024': 0 }, stats_founds: { '01-10-2024': 1, '02-10-2024': 3 } };

beforeEach(() => {
  api.getLostFounds.mockResolvedValue(items);
  api.getLostFoundStatsDaily.mockResolvedValue(daily);
  api.getLostFoundStatsMonthly.mockResolvedValue({});
  Element.prototype.scrollIntoView = vi.fn();
});

const renderHome = (route = '/') => renderWithProviders(<HomePage />, { route, preloadedState: { profile: me } });

describe('HomePage', () => {
  it('menampilkan ringkasan statistik, grafik, dan daftar laporan', async () => {
    renderHome();
    expect(await screen.findByText('Dompet cokelat')).toBeInTheDocument();
    const section = screen.getByRole('region', { name: 'Ringkasan statistik' });
    expect(within(section).getByText('Total laporan').nextSibling).toHaveTextContent('3');
    expect(within(section).getByText('Barang hilang').nextSibling).toHaveTextContent('1');
    expect(within(section).getByText('Barang ditemukan').nextSibling).toHaveTextContent('2');
    expect(within(section).getByText('Selesai').nextSibling).toHaveTextContent('1');
    expect(await screen.findByRole('img', { name: 'Grafik laporan harian' })).toBeInTheDocument();
  });
  it('menampilkan pesan bila statistik harian kosong', async () => {
    api.getLostFoundStatsDaily.mockResolvedValue({});
    renderHome();
    expect(await screen.findByText('Belum ada data statistik.')).toBeInTheDocument();
  });
  it('filter jenis, status penyelesaian, dan live search', async () => {
    renderHome();
    await screen.findByText('Dompet cokelat');
    const list = screen.getByRole('region', { name: 'Daftar laporan' });

    await userEvent.click(within(screen.getByRole('group', { name: 'Filter jenis' })).getByText('Ditemukan'));
    expect(within(list).queryByText('Dompet cokelat')).not.toBeInTheDocument();
    expect(within(list).getByText('Kunci motor')).toBeInTheDocument();

    await userEvent.click(within(screen.getByRole('group', { name: 'Filter status' })).getByText('Diproses'));
    expect(within(list).queryByText('Kunci motor')).not.toBeInTheDocument();
    expect(within(list).getByText('Payung biru')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Cari laporan'), 'zzz');
    expect(screen.getByText('Tidak ada laporan yang cocok')).toBeInTheDocument();
  });
  it('live search berdasarkan kata kunci', async () => {
    renderHome();
    await screen.findByText('Dompet cokelat');
    await userEvent.type(screen.getByLabelText('Cari laporan'), 'parkiran');
    expect(screen.getByText('Kunci motor')).toBeInTheDocument();
    expect(screen.queryByText('Payung biru')).not.toBeInTheDocument();
  });
  it('filter "Laporan saya" memanggil API dengan is_me=1', async () => {
    renderHome();
    await screen.findByText('Dompet cokelat');
    await userEvent.click(screen.getByLabelText('Laporan saya'));
    await waitFor(() => expect(api.getLostFounds).toHaveBeenLastCalledWith({ is_me: 1 }));
  });
  it('aksi cepat hanya muncul pada laporan milik sendiri', async () => {
    renderHome();
    await screen.findByText('Dompet cokelat');
    expect(screen.getByLabelText('Hapus Dompet cokelat')).toBeInTheDocument();
    expect(screen.queryByLabelText('Hapus Kunci motor')).not.toBeInTheDocument();
  });
  it('aksi cepat: selesaikan laporan', async () => {
    api.putLostFound.mockResolvedValue({});
    renderHome();
    await screen.findByText('Dompet cokelat');
    await userEvent.click(screen.getByRole('button', { name: /Selesaikan/ }));
    await waitFor(() => expect(api.putLostFound).toHaveBeenCalledWith(1, expect.objectContaining({ is_completed: 1 })));
    await waitFor(() => expect(api.getLostFounds).toHaveBeenCalledTimes(2));
  });
  it('aksi cepat: hapus (dikonfirmasi & dibatalkan)', async () => {
    api.deleteLostFound.mockResolvedValue({});
    renderHome();
    await screen.findByText('Dompet cokelat');
    showConfirmDialog.mockResolvedValueOnce(false);
    await userEvent.click(screen.getByLabelText('Hapus Dompet cokelat'));
    expect(api.deleteLostFound).not.toHaveBeenCalled();
    showConfirmDialog.mockResolvedValueOnce(true);
    await userEvent.click(screen.getByLabelText('Hapus Dompet cokelat'));
    await waitFor(() => expect(api.deleteLostFound).toHaveBeenCalledWith(1));
  });
  it('aksi cepat: ubah data lewat ChangeModal dan tambah laporan lewat AddModal', async () => {
    api.putLostFound.mockResolvedValue({});
    api.postLostFound.mockResolvedValue(10);
    renderHome();
    await screen.findByText('Dompet cokelat');

    await userEvent.click(screen.getByLabelText('Ubah Dompet cokelat'));
    expect(screen.getByRole('dialog', { name: 'Ubah laporan' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /Tambah laporan/ }));
    await userEvent.type(screen.getByLabelText('Judul'), 'Tas');
    await userEvent.type(screen.getByLabelText('Deskripsi'), 'Tas hitam');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan laporan' }));
    await waitFor(() => expect(api.postLostFound).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('menampilkan spinner saat memuat dan menggulir ke #statistik', async () => {
    api.getLostFounds.mockImplementation(() => new Promise(() => {}));
    renderHome('/#statistik');
    expect(await screen.findByText('Memuat laporan…')).toBeInTheDocument();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});

describe('DetailPage', () => {
  const full = { ...items[0], created_at: '2024-02-28T07:49:32Z', author: { name: 'Budi', photo: null } };
  const renderDetail = (profile = me) => renderWithProviders(
    <Routes>
      <Route path="/lost-founds/:id" element={<DetailPage />} />
      <Route path="/" element={<p>Beranda</p>} />
    </Routes>,
    { route: '/lost-founds/1', preloadedState: { profile } },
  );

  it('menampilkan detail lengkap laporan beserta aksi pemilik', async () => {
    api.getLostFoundById.mockResolvedValue(full);
    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Dompet cokelat' })).toBeInTheDocument();
    expect(screen.getByAltText('Dompet cokelat')).toHaveAttribute('src', 'https://open-api.delcom.org/img/a.png');
    expect(screen.getByText('Hilang di kantin')).toBeInTheDocument();
    expect(screen.getByText('Masih diproses')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ganti cover/ })).toBeInTheDocument();
    expect(api.getLostFoundById).toHaveBeenCalledWith('1');
  });
  it('menyembunyikan aksi untuk bukan pemilik dan menampilkan placeholder tanpa cover', async () => {
    api.getLostFoundById.mockResolvedValue({ ...full, user_id: 9, cover: null, is_completed: 1, author: null });
    renderDetail();
    await screen.findByRole('heading', { name: 'Dompet cokelat' });
    expect(screen.queryByRole('button', { name: /Hapus/ })).not.toBeInTheDocument();
    expect(screen.getByText('Belum ada foto cover')).toBeInTheDocument();
    expect(screen.getByText('Selesai', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText('Anonim')).toBeInTheDocument();
  });
  it('menampilkan keadaan tidak ditemukan saat gagal memuat', async () => {
    api.getLostFoundById.mockRejectedValue(new Error('404'));
    renderDetail();
    expect(await screen.findByText('Laporan tidak ditemukan')).toBeInTheDocument();
  });
  it('menampilkan spinner saat memuat', () => {
    api.getLostFoundById.mockImplementation(() => new Promise(() => {}));
    renderDetail();
    expect(screen.getByText('Memuat detail…')).toBeInTheDocument();
  });
  it('mengubah data & cover lewat modal lalu memuat ulang', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:x'); URL.revokeObjectURL = vi.fn();
    api.getLostFoundById.mockResolvedValue(full);
    api.putLostFound.mockResolvedValue({});
    api.postLostFoundCover.mockResolvedValue({});
    renderDetail();
    await screen.findByRole('heading', { name: 'Dompet cokelat' });

    await userEvent.click(screen.getByRole('button', { name: /Ubah data/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(api.putLostFound).toHaveBeenCalled());
    await waitFor(() => expect(api.getLostFoundById).toHaveBeenCalledTimes(2));

    await userEvent.click(await screen.findByRole('button', { name: /Ganti cover/ }));
    await userEvent.upload(screen.getByLabelText(/Pilih gambar/), new File(['x'], 'c.png', { type: 'image/png' }));
    await userEvent.click(screen.getByRole('button', { name: 'Unggah cover' }));
    await waitFor(() => expect(api.postLostFoundCover).toHaveBeenCalled());
  });
  it('menghapus laporan lalu kembali ke beranda; batal tidak menghapus', async () => {
    api.getLostFoundById.mockResolvedValue(full);
    api.deleteLostFound.mockResolvedValue({});
    renderDetail();
    await screen.findByRole('heading', { name: 'Dompet cokelat' });
    showConfirmDialog.mockResolvedValueOnce(false);
    fireEvent.click(screen.getByRole('button', { name: /Hapus/ }));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(api.deleteLostFound).not.toHaveBeenCalled();
    showConfirmDialog.mockResolvedValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: /Hapus/ }));
    expect(await screen.findByText('Beranda')).toBeInTheDocument();
    expect(api.deleteLostFound).toHaveBeenCalledWith('1');
  });
});
