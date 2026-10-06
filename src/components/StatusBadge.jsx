export const STATUS_LABEL = { lost: 'Hilang', found: 'Ditemukan' };

/** Lencana jenis laporan (hilang / ditemukan) + status selesai. */
export default function StatusBadge({ status, completed = false }) {
  const tone =
    status === 'lost' ? 'bg-lost-soft text-lost' : 'bg-found-soft text-found';
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>
        {STATUS_LABEL[status] ?? status}
      </span>
      {completed ? (
        <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">Selesai</span>
      ) : null}
    </span>
  );
}
