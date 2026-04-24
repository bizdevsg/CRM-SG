export default function SystemSummaryItem({ label, value }) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/80 px-4 py-4 shadow-[0_10px_22px_rgba(107,80,35,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-[color:var(--ink)]">{value}</p>
    </div>
  );
}
