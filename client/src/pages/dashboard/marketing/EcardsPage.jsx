import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

export default function EcardsPage() {
  const { dashboard, deleteEcard } = useDashboard();
  const navigate = useNavigate();
  const ecards = dashboard?.resources?.ecards || [];
  const hasEcard = ecards.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">E-Card QR</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Setiap marketing hanya memiliki 1 QR e-card untuk profil publiknya.
        </p>
      </div>

      <ResourceListPanel
        title="QR E-Card Saya"
        items={ecards}
        emptyText="QR e-card belum dibuat."
        headerAction={
          hasEcard ? null : (
            <Button
              className="px-4 py-2"
              onClick={() => navigate("/dashboard/ecards/new")}
            >
              Generate QR
            </Button>
          )
        }
        onDelete={deleteEcard}
        renderActions={(ecard) => (
          <Button
            variant="secondary"
            className="px-4 py-2"
            onClick={() => navigate(`/dashboard/ecards/${ecard.id}/edit`)}
          >
            Edit
          </Button>
        )}
        renderItem={(ecard) => (
          <ResourceRow>
            <div className="flex items-center gap-4">
              <img
                className="mb-3 rounded-3xl bg-white p-3 h-50 w-50"
                src={ecard.qrCodeDataUrl}
                alt={`QR Code ${ecard.title}`}
              />
              <div className="flex flex-col">
                <strong className="text-base text-slate-900">
                  {ecard.title}
                </strong>
                <span className="break-all">{ecard.publicUrl}</span>
                <span>Slug: {ecard.slug}</span>
              </div>
            </div>
          </ResourceRow>
        )}
      />
    </div>
  );
}
