import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  {
    role: "Superadmin",
    email: "superadmin@example.com",
    password: "password123",
    accent: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    role: "Admin Cabang",
    email: "admin.jakarta@example.com",
    password: "password123",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    role: "Marketing",
    email: "marketing.rina@example.com",
    password: "password123",
    accent: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 placeholder:text-slate-400 transition focus:border-[color:var(--teal)] focus:shadow-[0_0_0_4px_rgba(47,111,237,0.08)]";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "superadmin@example.com",
    password: "password123",
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
      [event.target.name]: event.target.value,
    }));
  }

  function useDemoAccount(account) {
    setForm({
      email: account.email,
      password: account.password,
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,32,51,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,32,51,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute left-[-4rem] top-[-4rem] h-56 w-56 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-3rem] h-64 w-64 rounded-full bg-amber-100 blur-3xl" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <form
          className="grid w-full max-w-5xl overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(16,32,51,0.08)] lg:grid-cols-[1.1fr_0.9fr]"
          onSubmit={handleSubmit}
        >
          <div className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#173a7a_0%,#2f6fed_48%,#7eb4ff_100%)] p-8 text-white lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_24%)]" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-100/90">
                Secure Access
              </p>
              <h1 className="mt-5 max-w-sm text-5xl font-black leading-[1.02] tracking-[-0.05em]">
                Dashboard e-card yang lebih bersih dan fokus.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-blue-50/90">
                Masuk ke workspace untuk mengelola profil marketing, sertifikat, social media, dan QR e-card
                dengan tampilan baru yang lebih ringan dan profesional.
              </p>
            </div>

            <div className="relative mt-10 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100/80">
                Demo Accounts
              </p>
              <div className="grid gap-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => useDemoAccount(account)}
                    className="rounded-2xl border border-white/20 bg-white/12 px-4 py-4 text-left backdrop-blur-sm transition hover:bg-white/18"
                  >
                    <p className="text-sm font-bold">{account.role}</p>
                    <p className="mt-1 text-sm text-blue-50/85">{account.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--teal)]">
                Welcome Back
              </p>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                Masuk ke akun Anda
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                Gunakan akun aktif Anda atau pilih salah satu akun demo di bawah.
              </p>
            </div>

            <div className="mt-5 grid gap-2 lg:hidden">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => useDemoAccount(account)}
                  className={`rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 ${account.accent}`}
                >
                  <p className="text-sm font-bold">{account.role}</p>
                  <p className="mt-1 text-xs opacity-80">{account.email}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-5">
              <label className="block text-sm font-medium text-slate-700">
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

              <label className="block text-sm font-medium text-slate-700">
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
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--teal-deep),var(--teal))] px-4 py-3 font-semibold text-white shadow-[0_20px_45px_rgba(47,111,237,0.22)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Memproses..." : "Login"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
