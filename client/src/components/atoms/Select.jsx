import { cn } from "../../utils/cn";

export default function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

