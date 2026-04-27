export default function LoadingScreen({ message, tone = "light" }) {
  const palette =
    tone === "dark"
      ? "bg-slate-950 text-slate-200"
      : "bg-[radial-gradient(circle_at_top_left,rgba(47,111,237,0.1),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_18%),linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] text-[color:var(--ink-soft)]";

  return (
    <div className={`flex min-h-screen items-center justify-center px-6 text-sm font-medium ${palette}`}>
      {message}
    </div>
  );
}
