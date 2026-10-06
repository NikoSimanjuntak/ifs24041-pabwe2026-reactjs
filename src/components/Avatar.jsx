import { useState } from 'react';
import { assetUrl } from '../helpers/apiHelper';

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

/** Foto pengguna dengan fallback inisial bila gambar kosong/gagal dimuat. */
export default function Avatar({ name, photo, size = 'h-10 w-10', className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = assetUrl(photo);

  if (!src || failed || src.includes('/default/')) {
    return (
      <span
        aria-label={name}
        className={`${size} ${className} inline-flex shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white`}
      >
        {initials(name)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className={`${size} ${className} shrink-0 rounded-full object-cover`}
    />
  );
}
