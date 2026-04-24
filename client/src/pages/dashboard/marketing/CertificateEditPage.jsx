import { Navigate, useNavigate, useParams } from "react-router-dom";
import Card from "../../../components/atoms/Card";
import LoadingScreen from "../../../components/atoms/LoadingScreen";
import CertificateForm from "../../../components/organisms/CertificateForm";
import { useDashboard } from "../../../context/DashboardContext";

export default function CertificateEditPage() {
  const { certificateId } = useParams();
  const { dashboard, loading, updateCertificate } = useDashboard();
  const navigate = useNavigate();
  const certificate = (dashboard?.resources?.certificates || []).find(
    (item) => String(item.id) === String(certificateId)
  );

  async function handleSubmit(payload) {
    const success = await updateCertificate(certificateId, payload);

    if (success) {
      navigate("/dashboard/certificates");
    }
  }

  if (loading && !certificate) {
    return <LoadingScreen message="Memuat sertifikat..." />;
  }

  if (!certificate) {
    return <Navigate to="/dashboard/certificates" replace />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Edit Sertifikat</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Perbarui sertifikat milik Anda.
        </p>
      </div>

      <Card className="p-6">
        <CertificateForm
          initialValues={{
            title: certificate.title || "",
            imagePath: certificate.imagePath || ""
          }}
          onSubmit={handleSubmit}
          submitLabel="Perbarui Sertifikat"
        />
      </Card>
    </div>
  );
}
