import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useInput from '../../../hooks/useInput';
import { asyncLostFoundAdd } from '../states/action';
import ModalShell from './ModalShell';
import ReportFields, { validateReport } from './ReportFields';

export default function AddModal({ onClose, onAdded }) {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.isLostFoundAdd);
  const [title, onTitle] = useInput('');
  const [description, onDescription] = useInput('');
  const [status, onStatus] = useInput('lost');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateReport({ title, description });
    setErrors(found);
    if (Object.keys(found).length) return;

    const result = await dispatch(asyncLostFoundAdd({ title: title.trim(), description: description.trim(), status }));
    if (result) {
      onAdded?.(result);
      onClose();
    }
  };

  return (
    <ModalShell title="Tambah laporan" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <ReportFields values={{ title, description, status }} errors={errors}
          onChange={{ title: onTitle, description: onDescription, status: onStatus }} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Menyimpan…' : 'Simpan laporan'}</button>
        </div>
      </form>
    </ModalShell>
  );
}
