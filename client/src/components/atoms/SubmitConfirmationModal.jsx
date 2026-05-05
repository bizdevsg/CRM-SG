import { createPortal } from "react-dom";
import Button from "./Button";

export default function SubmitConfirmationModal({
  open,
  title = "Konfirmasi Perubahan",
  message = "Pastikan data yang Anda isi sudah benar sebelum melanjutkan.",
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  submitting = false,
}) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={submitting ? undefined : onCancel}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--teal)]">
          Konfirmasi
        </p>
        <h4 className="mt-3 text-xl font-bold text-slate-900">{title}</h4>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            {cancelLabel}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? "Memproses..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
