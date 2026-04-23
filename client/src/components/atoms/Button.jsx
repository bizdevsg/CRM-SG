import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "border border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100"
};

export default function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

