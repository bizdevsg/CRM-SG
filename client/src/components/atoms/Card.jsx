import { cn } from "../../utils/cn";

export default function Card({ children, className }) {
  return (
    <section
      className={cn(
        "rounded-[30px] border border-[color:var(--line)] bg-[color:var(--paper)] shadow-[0_20px_60px_rgba(107,80,35,0.08)] backdrop-blur-sm",
        className
      )}
    >
      {children}
    </section>
  );
}
