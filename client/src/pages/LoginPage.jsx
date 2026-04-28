import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 placeholder:text-slate-400 transition focus:border-[color:var(--teal)] focus:shadow-[0_0_0_4px_rgba(47,111,237,0.08)]";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,32,51,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,32,51,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute left-[-4rem] top-[-4rem] h-56 w-56 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-3rem] h-64 w-64 rounded-full bg-amber-100 blur-3xl" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <form
          className="w-full max-w-lg overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(16,32,51,0.08)]"
          onSubmit={handleSubmit}
        >
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--teal)]">
                Welcome Back
              </p>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                Masuk ke akun Anda
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                Gunakan akun aktif Anda untuk masuk ke dashboard.
              </p>
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
