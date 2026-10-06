import { describe, expect, it, vi } from 'vitest';
import Swal from 'sweetalert2';
import { formatDate, showConfirmDialog, showErrorDialog, showSuccessDialog } from './toolsHelper';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) } }));

describe('toolsHelper', () => {
  it('showSuccessDialog & showErrorDialog memanggil Swal dengan ikon yang tepat', () => {
    showSuccessDialog('ok');
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: 'success', text: 'ok' }));
    showErrorDialog('gagal');
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: 'error', text: 'gagal' }));
  });
  it('showConfirmDialog mengembalikan status konfirmasi', async () => {
    expect(await showConfirmDialog('hapus?')).toBe(true);
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog('hapus?')).toBe(false);
  });
  it('formatDate memformat tanggal Indonesia dan menangani nilai tidak valid', () => {
    expect(formatDate('2024-02-28T07:49:32.000000Z', { withTime: false })).toMatch(/2024/);
    expect(formatDate('2024-02-28T07:49:32.000000Z')).toMatch(/Februari 2024/);
    expect(formatDate(null)).toBe('-');
    expect(formatDate('bukan tanggal')).toBe('-');
  });
});
