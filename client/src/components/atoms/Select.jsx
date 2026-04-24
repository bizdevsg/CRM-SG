import { cn } from "../../utils/cn";

export default function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition focus:border-[color:var(--teal)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(22,105,122,0.08)] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-slate-500",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
