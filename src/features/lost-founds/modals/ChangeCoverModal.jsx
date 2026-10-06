import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiImage } from 'react-icons/fi';
import { assetUrl } from '../../../helpers/apiHelper';
import { asyncLostFoundChangeCover } from '../states/action';
import ModalShell from './ModalShell';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export default function ChangeCoverModal({ lostFound, onClose, onChanged }) {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.isLostFoundChangeCover);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (event) => {
    const picked = event.target.files?.[0];
    if (!picked) return;
    if (!picked.type.startsWith('image/')) return setError('File harus berupa gambar.');
    if (picked.size > MAX_SIZE) return setError('Ukuran gambar maksimal 2 MB.');
    setError('');
    setFile(picked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return setError('Pilih gambar terlebih dahulu.');
    const ok = await dispatch(asyncLostFoundChangeCover(lostFound.id, file));
    if (ok) {
      onChanged?.();
      onClose();
    }
  };

  const shown = preview ?? assetUrl(lostFound.cover);

  return (
    <ModalShell title="Ganti cover" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid aspect-video place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-paper">
          {shown ? (
            <img src={shown} alt="Pratinjau cover" className="h-full w-full object-contain" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-sm text-ink-soft"><FiImage className="h-7 w-7" /> Belum ada gambar</span>
          )}
        </div>
        <div>
          <label htmlFor="cover-file" className="label">Pilih gambar (maks. 2 MB)</label>
          <input id="cover-file" type="file" accept="image/*" onChange={handleFile} className="field" />
          {error && <p className="field-error">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Mengunggah…' : 'Unggah cover'}</button>
        </div>
      </form>
    </ModalShell>
  );
}
