import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  {
    role: "Superadmin",
    email: "superadmin@example.com",
    password: "password123",
    accent: "from-sky-400/30 to-cyan-400/10"
  },
  {
    role: "Admin Cabang",
    email: "admin.jakarta@example.com",
    password: "password123",
    accent: "from-emerald-400/30 to-teal-400/10"
  },
  {
    role: "Marketing",
    email: "marketing.rina@example.com",
    password: "password123",
    accent: "from-amber-300/30 to-orange-400/10"
  }
];

const inputClassName =
  "mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-400/70";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "superadmin@example.com",
    password: "password123"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(event) {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value
    }));
  }

  function useDemoAccount(account) {
    setForm({
      email: account.email,
      password: account.password
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(74,222,128,0.14),transparent_28%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <section className="flex flex-col justify-center gap-6 py-6">
          <div className="inline-flex w-fit items-center rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
            Website E-Card
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Tailwind-ready login untuk Superadmin, Admin Cabang, dan Marketing.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Sistem login ini sudah tersambung ke backend JWT dan RBAC. Pilih akun
              demo untuk langsung melihat dashboard yang berbeda di tiap role.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                className={`group rounded-[28px] border border-white/10 bg-gradient-to-br ${account.accent} p-[1px] text-left shadow-[0_18px_60px_rgba(2,6,23,0.38)] transition hover:-translate-y-1`}
                type="button"
                onClick={() => useDemoAccount(account)}
              >
                <div className="h-full rounded-[27px] bg-slate-900/90 p-5 backdrop-blur">
                  <p className="text-sm font-semibold text-white">{account.role}</p>
                  <p className="mt-3 break-all text-sm text-slate-300">{account.email}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                    {account.password}
                  </p>
                  <span className="mt-6 inline-flex text-sm font-medium text-sky-300 transition group-hover:text-sky-200">
                    Gunakan akun ini
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center py-6">
          <form
            className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/80 p-7 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Secure Access
              </p>
              <h2 className="text-3xl font-bold text-white">Masuk ke dashboard E-Card</h2>
              <p className="text-sm leading-6 text-slate-400">
                Gunakan akun demo di kiri atau isi manual untuk menguji hak akses
                tiap role.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <label className="block text-sm font-medium text-slate-200">
                Email
                <input
                  className={inputClassName}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-200">
                Password
                <input
                  className={inputClassName}
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  required
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              <button
                className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-400 px-4 py-3 font-semibold text-slate-950 shadow-[0_20px_50px_rgba(56,189,248,0.28)] transition hover:bg-sky-300 disabled:cursor-wait disabled:opacity-70"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Memproses..." : "Login"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4 text-sm leading-6 text-slate-300">
              Akun marketing dibuat oleh admin cabang, sedangkan akun admin dikelola
              oleh superadmin.
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
