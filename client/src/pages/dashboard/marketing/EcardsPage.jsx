import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import Card from "../../../components/atoms/Card";
import BusinessCardPreview, {
  downloadEcardBusinessCard,
} from "../../../components/organisms/BusinessCardPreview";
import { useDashboard } from "../../../context/DashboardContext";
import { getIncompleteEcardFields } from "../../../utils/ecardProfile";

export default function EcardsPage() {
  const { dashboard, createEcard, deleteEcard, setFeedback } = useDashboard();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const ecards = dashboard?.resources?.ecards || [];
  const profile = dashboard?.resources?.profile || {};
  const hasEcard = ecards.length > 0;
  const incompleteFields = getIncompleteEcardFields(profile);
  const canGenerateEcard = incompleteFields.length === 0;

  async function handleCreateEcard() {
    if (!canGenerateEcard || isGenerating) {
      return;
    }

    setIsGenerating(true);

    try {
      await createEcard({});
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDownloadCard(ecard) {
    try {
      await downloadEcardBusinessCard({ profile, ecard });
      setFeedback({
        error: "",
        success: "Kartu nama QR berhasil diunduh.",
      });
    } catch (error) {
      setFeedback({
        error: error.message || "Gagal mengunduh kartu nama QR.",
        success: "",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">E-Card QR</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Setiap marketing hanya memiliki 1 QR e-card untuk profil publiknya.
          </p>
          {!hasEcard && !canGenerateEcard ? (
            <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              QR belum bisa digenerate. Lengkapi dulu:{" "}
              {incompleteFields.join(", ")}.
            </p>
          ) : null}
        </div>
      </div>

      {!ecards.length ? (
        <Card className="p-6">
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Generate QR E-Card
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Buat QR e-card langsung dari halaman ini dengan slug otomatis
                berdasarkan data profil terbaru Anda.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-800">
              QR akan dibuat otomatis dari data profil Anda yang terbaru.
            </div>

            <Button
              className="w-full sm:w-auto"
              disabled={!canGenerateEcard || isGenerating}
              onClick={handleCreateEcard}
            >
              {isGenerating ? "Memproses..." : "Generate QR"}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {ecards.map((ecard) => (
            <article
              key={ecard.id}
              className="rounded-[26px] border border-[color:var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_14px_35px_rgba(16,32,51,0.05)]"
            >
              {/* <div className="flex flex-col gap-4 border-b border-[color:var(--line)] pb-4 lg:flex-row lg:items-center">
                <img
                  className="h-32 w-32 rounded-3xl border border-[color:var(--line)] bg-white p-3 shadow-[0_12px_24px_rgba(16,32,51,0.05)]"
                  src={ecard.qrCodeDataUrl}
                  alt={`QR Code ${ecard.title}`}
                />

                <div className="min-w-0 flex-1">
                  <strong className="block text-base text-slate-900">
                    {ecard.title}
                  </strong>
                </div>
              </div> */}

              <div className="">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Preview Kartu Nama
                </p>
                <BusinessCardPreview profile={profile} ecard={ecard} compact />
              </div>

              <div className="mt-4 flex flex-wrap gap-3 border-t border-[color:var(--line)] pt-4">
                <Button
                  className="px-4 py-2"
                  onClick={() => handleDownloadCard(ecard)}
                >
                  Download Kartu Nama
                </Button>
                <Button
                  variant="secondary"
                  className="px-4 py-2"
                  onClick={() => navigate(`/dashboard/ecards/${ecard.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  className="px-4 py-2"
                  onClick={() => deleteEcard(ecard.id)}
                >
                  Hapus
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
