/** Field bersama untuk AddModal & ChangeModal. */
export default function ReportFields({ values, errors, onChange }) {
  return (
    <>
      <div>
        <span className="label">Jenis laporan</span>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Jenis laporan">
          {[['lost', 'Barang hilang'], ['found', 'Barang ditemukan']].map(([val, text]) => (
            <label key={val}
              className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-semibold ${values.status === val ? (val === 'lost' ? 'border-lost bg-lost-soft text-lost' : 'border-found bg-found-soft text-found') : 'border-line text-ink-soft'}`}>
              <input type="radio" name="status" value={val} checked={values.status === val} onChange={onChange.status} className="sr-only" />
              {text}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="lf-title" className="label">Judul</label>
        <input id="lf-title" className="field" value={values.title} onChange={onChange.title} placeholder="Contoh: Dompet cokelat" />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="lf-description" className="label">Deskripsi</label>
        <textarea id="lf-description" rows={4} className="field" value={values.description} onChange={onChange.description}
          placeholder="Ciri-ciri barang, lokasi, dan waktu kejadian" />
        {errors.description && <p className="field-error">{errors.description}</p>}
      </div>
    </>
  );
}

export const validateReport = ({ title, description }) => {
  const errors = {};
  if (!title.trim()) errors.title = 'Judul wajib diisi.';
  if (!description.trim()) errors.description = 'Deskripsi wajib diisi.';
  return errors;
};
