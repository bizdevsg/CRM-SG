import { Navigate, useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import Card from "../../../components/atoms/Card";
import LoadingScreen from "../../../components/atoms/LoadingScreen";
import BusinessCardPreview, {
  downloadEcardBusinessCard,
} from "../../../components/organisms/BusinessCardPreview";
import { useDashboard } from "../../../context/DashboardContext";

export default function EcardPreviewPage() {
  const { ecardId } = useParams();
  const { dashboard, loading, setFeedback } = useDashboard();
  const navigate = useNavigate();
  const profile = dashboard?.resources?.profile || {};
  const ecard = (dashboard?.resources?.ecards || []).find(
    (item) => String(item.id) === String(ecardId),
  );

  async function handleDownload() {
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

  if (loading && !ecard) {
    return <LoadingScreen message="Memuat preview kartu nama..." />;
  }

  if (!ecard) {
    return <Navigate to="/dashboard/ecards" replace />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Preview Kartu Nama
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tinjau hasil kartu nama QR sebelum diunduh.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            className="px-4 py-2"
            onClick={() => navigate("/dashboard/ecards")}
          >
            Kembali
          </Button>
          <Button className="px-4 py-2" onClick={handleDownload}>
            Download Kartu Nama
          </Button>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        <BusinessCardPreview profile={profile} ecard={ecard} />
      </Card>
    </div>
  );
}
