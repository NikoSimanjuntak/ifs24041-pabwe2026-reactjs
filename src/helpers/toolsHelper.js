import Swal from 'sweetalert2';

const base = {
  confirmButtonColor: '#14213d',
  cancelButtonColor: '#64748b',
};

export const showSuccessDialog = (message, title = 'Berhasil') =>
  Swal.fire({ ...base, icon: 'success', title, text: message, timer: 2200, timerProgressBar: true });

export const showErrorDialog = (message, title = 'Terjadi kesalahan') =>
  Swal.fire({ ...base, icon: 'error', title, text: message });

/** Mengembalikan true bila pengguna menekan tombol konfirmasi. */
export const showConfirmDialog = async (
  message,
  { title = 'Apakah kamu yakin?', confirmText = 'Ya, lanjutkan', cancelText = 'Batal' } = {},
) => {
  const result = await Swal.fire({
    ...base,
    icon: 'warning',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
  return Boolean(result.isConfirmed);
};

/** Format tanggal Indonesia, mis. "28 Februari 2024, 14.49". */
export const formatDate = (value, { withTime = true } = {}) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
};
