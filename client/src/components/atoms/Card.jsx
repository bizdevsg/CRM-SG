import { cn } from "../../utils/cn";

export default function Card({ children, className }) {
  return (
    <section
      className={cn(
        "rounded-[30px] border border-[color:var(--line)] bg-[color:var(--paper)] shadow-[0_20px_50px_rgba(16,32,51,0.06)] backdrop-blur-sm",
        className
      )}
    >
      {children}
    </section>
  );
}
