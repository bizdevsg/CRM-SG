export default function LoadingScreen({ message, tone = "light" }) {
  const palette =
    tone === "dark"
      ? "bg-slate-950 text-slate-200"
      : "bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_24%),linear-gradient(180deg,#fbf7ef_0%,#f3e9d7_100%)] text-[color:var(--ink-soft)]";

  return (
    <div className={`flex min-h-screen items-center justify-center px-6 text-sm font-medium ${palette}`}>
      {message}
    </div>
  );
}
