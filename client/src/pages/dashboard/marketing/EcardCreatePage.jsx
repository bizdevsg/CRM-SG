import { Navigate, useNavigate } from "react-router-dom";
import Card from "../../../components/atoms/Card";
import EcardForm from "../../../components/organisms/EcardForm";
import { useDashboard } from "../../../context/DashboardContext";

export default function EcardCreatePage() {
  const { dashboard, createEcard } = useDashboard();
  const navigate = useNavigate();
  const existingEcard = (dashboard?.resources?.ecards || [])[0];
  const profile = dashboard?.resources?.profile || {};

  async function handleSubmit(payload) {
    const success = await createEcard(payload);

    if (success) {
      navigate("/dashboard/ecards");
    }
  }

  if (existingEcard) {
    return <Navigate to={`/dashboard/ecards/${existingEcard.id}/edit`} replace />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Generate QR E-Card</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Buat satu QR e-card untuk profil publik Anda dengan slug otomatis dari nomor izin dan nama.
        </p>
      </div>

      <Card className="p-6">
        <EcardForm
          profile={profile}
          onSubmit={handleSubmit}
          submitLabel="Generate QR"
        />
      </Card>
    </div>
  );
}
