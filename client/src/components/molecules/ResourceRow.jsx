export default function ResourceRow({ children }) {
  return (
    <div className="flex h-full flex-col gap-2 text-sm leading-6 text-[color:var(--ink-soft)]">
      {children}
    </div>
  );
}
