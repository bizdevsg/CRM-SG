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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(22,105,122,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_32%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
        <section className="flex flex-col justify-center gap-8 py-4">
          <div className="inline-flex w-fit items-center rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--teal-deep)] shadow-[0_10px_24px_rgba(17,75,95,0.08)]">
            Website E-Card
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-black tracking-[-0.05em] text-[color:var(--ink)] sm:text-5xl lg:text-6xl">
              Dashboard e-card yang terasa lebih modern, hangat, dan siap dipakai tim marketing.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[color:var(--ink-soft)] sm:text-lg">
              Kelola perusahaan, cabang, akun marketing, sertifikat, dan QR e-card dari satu
              workspace yang lebih jelas secara visual dan tetap mudah dipelajari.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                className="group rounded-[30px] border border-white/70 bg-white/72 p-5 text-left shadow-[0_20px_45px_rgba(107,80,35,0.08)] transition duration-200 hover:-translate-y-1 hover:bg-white"
                type="button"
                onClick={() => useDemoAccount(account)}
              >
                <div className={`rounded-[22px] bg-gradient-to-br ${account.accent} p-4`}>
                  <p className="text-sm font-semibold text-[color:var(--ink)]">{account.role}</p>
                  <p className="mt-3 break-all text-sm text-[color:var(--ink-soft)]">{account.email}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[color:var(--ink-soft)]/80">
                    {account.password}
                  </p>
                  <span className="mt-6 inline-flex text-sm font-semibold text-[color:var(--teal-deep)]">
                    Gunakan akun ini
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center py-4">
          <form
            className="w-full max-w-md rounded-[34px] border border-white/75 bg-[rgba(18,34,53,0.92)] p-7 text-white shadow-[0_30px_80px_rgba(18,34,53,0.28)] backdrop-blur-xl sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Secure Access
              </p>
              <h2 className="text-3xl font-bold text-white">Masuk ke dashboard E-Card</h2>
              <p className="text-sm leading-6 text-slate-300">
                Pilih akun demo atau masuk manual untuk melihat pengalaman berbeda di tiap role.
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
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f6c667,#f59e0b)] px-4 py-3 font-semibold text-slate-950 shadow-[0_20px_50px_rgba(245,158,11,0.24)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Memproses..." : "Login"}
              </button>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
              Akun marketing dibuat oleh admin cabang, sedangkan akun admin dikelola oleh superadmin.
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
