import Card from "../atoms/Card";
import Icon from "../atoms/Icon";

export default function SummaryCard({ label, value, description, icon, tint }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            {label}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`rounded-2xl p-3 ${tint}`}>
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>
    </Card>
  );
}

