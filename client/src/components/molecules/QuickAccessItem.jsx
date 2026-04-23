import Icon from "../atoms/Icon";

export default function QuickAccessItem({ item }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
        <Icon name={item.icon} className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
          {item.group}
        </p>
        <p className="mt-1 text-base font-semibold text-slate-900">{item.label}</p>
      </div>
    </div>
  );
}

