import Input from "../atoms/Input";
import Button from "../atoms/Button";
import { buildAutomaticEcardSlug, getIncompleteEcardFields } from "../../utils/ecardProfile";

export default function EcardForm({ profile, onSubmit, submitLabel }) {
  const nextSlug = buildAutomaticEcardSlug(profile);
  const incompleteFields = getIncompleteEcardFields(profile);
  const isComplete = incompleteFields.length === 0;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isComplete) {
      return;
    }

    await onSubmit({});
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-800">
        Slug publik akan dibuat otomatis dari <strong>nomor izin + nama</strong>, lalu QR code akan
        mengarah ke slug tersebut.
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Preview Slug Otomatis
        <Input value={nextSlug} readOnly />
      </label>

      {isComplete ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
          Data utama profil sudah lengkap. QR e-card siap digenerate.
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          QR e-card belum bisa dibuat. Lengkapi dulu: {incompleteFields.join(", ")}.
        </div>
      )}

      <Button type="submit" disabled={!isComplete}>
        {submitLabel}
      </Button>
    </form>
  );
}
