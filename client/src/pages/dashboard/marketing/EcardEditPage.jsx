import { Navigate, useNavigate, useParams } from "react-router-dom";
import Card from "../../../components/atoms/Card";
import LoadingScreen from "../../../components/atoms/LoadingScreen";
import EcardForm from "../../../components/organisms/EcardForm";
import { useDashboard } from "../../../context/DashboardContext";

export default function EcardEditPage() {
  const { ecardId } = useParams();
  const { dashboard, loading, updateEcard } = useDashboard();
  const navigate = useNavigate();
  const ecard = (dashboard?.resources?.ecards || []).find((item) => String(item.id) === String(ecardId));
  const profile = dashboard?.resources?.profile || {};

  async function handleSubmit(payload) {
    const success = await updateEcard(ecardId, payload);

    if (success) {
      navigate("/dashboard/ecards");
    }
  }

  if (loading && !ecard) {
    return <LoadingScreen message="Memuat e-card..." />;
  }

  if (!ecard) {
    return <Navigate to="/dashboard/ecards" replace />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Edit E-Card</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Regenerasi slug dan QR code e-card otomatis dari nomor izin dan nama terbaru Anda.
        </p>
      </div>

      <Card className="p-6">
        <EcardForm
          profile={profile}
          onSubmit={handleSubmit}
          submitLabel="Perbarui QR"
        />
      </Card>
    </div>
  );
}
