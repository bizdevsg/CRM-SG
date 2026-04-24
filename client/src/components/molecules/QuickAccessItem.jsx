import Icon from "../atoms/Icon";

export default function QuickAccessItem({ item }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,rgba(22,105,122,0.12),rgba(245,158,11,0.14))] text-[color:var(--teal-deep)]">
        <Icon name={item.icon} className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--ink-soft)]">
          {item.group}
        </p>
        <p className="mt-1 text-base font-semibold text-[color:var(--ink)]">{item.label}</p>
      </div>
    </div>
  );
}
