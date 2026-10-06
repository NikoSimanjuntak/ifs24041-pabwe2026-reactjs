import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useInput from '../../../hooks/useInput';
import { asyncLostFoundChange } from '../states/action';
import ModalShell from './ModalShell';
import ReportFields, { validateReport } from './ReportFields';

export default function ChangeModal({ lostFound, onClose, onChanged }) {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.isLostFoundChange);
  const [title, onTitle] = useInput(lostFound.title);
  const [description, onDescription] = useInput(lostFound.description);
  const [status, onStatus] = useInput(lostFound.status);
  const [completed, onCompleted] = useInput(Boolean(lostFound.is_completed));
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateReport({ title, description });
    setErrors(found);
    if (Object.keys(found).length) return;

    const ok = await dispatch(
      asyncLostFoundChange(lostFound.id, {
        title: title.trim(), description: description.trim(), status, is_completed: completed ? 1 : 0,
      }),
    );
    if (ok) {
      onChanged?.();
      onClose();
    }
  };

  return (
    <ModalShell title="Ubah laporan" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <ReportFields values={{ title, description, status }} errors={errors}
          onChange={{ title: onTitle, description: onDescription, status: onStatus }} />
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-line px-4 py-3">
          <span className="text-sm font-semibold">Tandai sebagai selesai</span>
          <input type="checkbox" role="switch" aria-label="Tandai sebagai selesai" checked={completed} onChange={onCompleted}
            className="h-5 w-5 accent-[#14213d]" />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Menyimpan…' : 'Simpan perubahan'}</button>
        </div>
      </form>
    </ModalShell>
  );
}
