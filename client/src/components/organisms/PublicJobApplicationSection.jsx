import { useState } from "react";
import { apiFetch } from "../../services/api";

const INITIAL_FORM = {
  name: "",
  email: "",
  whatsappNumber: "",
  cvFile: null
};

export default function PublicJobApplicationSection({
  ecardSlug,
  className = "",
  titleClassName = "text-lg font-bold text-white",
  descriptionClassName = "mt-1 text-sm text-white/80",
  errorClassName = "text-sm text-rose-200",
  successClassName = "text-sm text-emerald-200",
  submitButtonClassName = "w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ error: "", success: "" });

    if (!form.name || !form.email || !form.whatsappNumber || !form.cvFile) {
      setFeedback({ error: "Semua field wajib diisi termasuk file CV.", success: "" });
      return;
    }

    if (!ecardSlug) {
      setFeedback({ error: "Slug e-card tidak tersedia.", success: "" });
      return;
    }

    const body = new FormData();
    body.append("name", form.name.trim());
    body.append("email", form.email.trim());
    body.append("whatsappNumber", form.whatsappNumber.trim());
    body.append("cvFile", form.cvFile);

    setSubmitting(true);

    try {
      await apiFetch(`/public/ecards/${encodeURIComponent(ecardSlug)}/job-applications`, {
        method: "POST",
        body
      });
      setForm(INITIAL_FORM);
      setFeedback({ error: "", success: "Lamaran berhasil dikirim." });
    } catch (error) {
      setFeedback({ error: error.message || "Gagal mengirim lamaran.", success: "" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={className}>
      <h5 className={titleClassName}>Loker</h5>
      <p className={descriptionClassName}>Isi data dan upload CV untuk kirim lamaran.</p>

      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nama lengkap"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-white"
        />
        <input
          type="email"
          placeholder="Email aktif"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-white"
        />
        <input
          type="text"
          placeholder="Nomor telepon WhatsApp"
          value={form.whatsappNumber}
          onChange={(event) =>
            setForm((current) => ({ ...current, whatsappNumber: event.target.value }))
          }
          className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-white"
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(event) =>
            setForm((current) => ({ ...current, cvFile: event.target.files?.[0] || null }))
          }
          className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
        />

        {feedback.error ? <p className={errorClassName}>{feedback.error}</p> : null}
        {feedback.success ? <p className={successClassName}>{feedback.success}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className={submitButtonClassName}
        >
          {submitting ? "Mengirim..." : "Kirim Lamaran"}
        </button>
      </form>
    </div>
  );
}
