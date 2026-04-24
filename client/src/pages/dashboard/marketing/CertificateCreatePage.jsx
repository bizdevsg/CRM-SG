import { useNavigate } from "react-router-dom";
import Card from "../../../components/atoms/Card";
import CertificateForm from "../../../components/organisms/CertificateForm";
import { useDashboard } from "../../../context/DashboardContext";

export default function CertificateCreatePage() {
  const { addCertificate } = useDashboard();
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    const success = await addCertificate(payload);

    if (success) {
      navigate("/dashboard/certificates");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tambah Sertifikat</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Tambahkan sertifikat baru untuk profil e-card Anda.
        </p>
      </div>

      <Card className="p-6">
        <CertificateForm
          initialValues={{ title: "", imagePath: "" }}
          onSubmit={handleSubmit}
          submitLabel="Simpan Sertifikat"
        />
      </Card>
    </div>
  );
}
