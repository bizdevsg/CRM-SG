import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

export default function CertificatesPage() {
  const { dashboard, deleteCertificate } = useDashboard();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Sertifikat</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Halaman index sertifikat untuk melihat, mengubah, dan menghapus sertifikat Anda.
        </p>
      </div>

      <ResourceListPanel
        title="Sertifikat Saya"
        items={dashboard?.resources?.certificates || []}
        emptyText="Belum ada sertifikat."
        headerAction={
          <Button className="px-4 py-2" onClick={() => navigate("/dashboard/certificates/new")}>
            Tambah Sertifikat
          </Button>
        }
        onDelete={deleteCertificate}
        renderActions={(entry) => (
          <Button
            variant="secondary"
            className="px-4 py-2"
            onClick={() => navigate(`/dashboard/certificates/${entry.id}/edit`)}
          >
            Edit
          </Button>
        )}
        renderItem={(entry) => (
          <ResourceRow>
            {entry.imagePath ? (
              <img
                src={entry.imagePath}
                alt={entry.title}
                className="mb-3 h-40 w-full rounded-2xl object-cover"
              />
            ) : null}
            <strong className="text-base text-slate-900">{entry.title}</strong>
          </ResourceRow>
        )}
      />
    </div>
  );
}
