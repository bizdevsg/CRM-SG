import { cn } from "../../utils/cn";

export default function Card({ children, className }) {
  return (
    <section className={cn("rounded-[24px] border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </section>
  );
}

