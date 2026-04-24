export default function StatusAlert({ error, success }) {
  if (error) {
    return (
      <div className="rounded-[24px] border border-rose-200/80 bg-rose-50/90 px-5 py-4 text-sm text-rose-700 shadow-[0_10px_25px_rgba(190,24,93,0.08)]">
        {error}
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-[24px] border border-emerald-200/80 bg-emerald-50/90 px-5 py-4 text-sm text-emerald-700 shadow-[0_10px_25px_rgba(22,163,74,0.08)]">
        {success}
      </div>
    );
  }

  return null;
}
