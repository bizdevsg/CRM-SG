import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-[color:var(--teal-deep)] text-white shadow-[0_14px_30px_rgba(17,75,95,0.18)] hover:-translate-y-0.5 hover:bg-[color:var(--teal)] disabled:cursor-wait disabled:opacity-70",
  secondary:
    "border border-[color:var(--line)] bg-white/80 text-[color:var(--ink)] hover:-translate-y-0.5 hover:bg-white",
  ghost:
    "border border-amber-200/80 bg-amber-50/90 text-amber-800 hover:-translate-y-0.5 hover:bg-amber-100"
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
        "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
