export default function SystemSummaryItem({ label, value }) {
  return (
    <div className="rounded-[24px] border border-[color:var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4 shadow-[0_10px_22px_rgba(16,32,51,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-[color:var(--ink)]">{value}</p>
    </div>
  );
}
