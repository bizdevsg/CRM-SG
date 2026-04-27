import Card from "../atoms/Card";
import Icon from "../atoms/Icon";

export default function SummaryCard({ label, value, description, icon, tint }) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(47,111,237,0.12),transparent_65%)]" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--ink-soft)]">
            {label}
          </p>
          <h3 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[color:var(--ink)]">{value}</h3>
        </div>
        <div className={`rounded-[22px] p-3 shadow-[0_12px_22px_rgba(15,23,42,0.06)] ${tint}`}>
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[color:var(--ink-soft)]">{description}</p>
    </Card>
  );
}
