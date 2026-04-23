export default function LoadingScreen({ message, tone = "light" }) {
  const palette =
    tone === "dark" ? "bg-slate-950 text-slate-200" : "bg-slate-100 text-slate-600";

  return (
    <div className={`flex min-h-screen items-center justify-center px-6 text-sm font-medium ${palette}`}>
      {message}
    </div>
  );
}

