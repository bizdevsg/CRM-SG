import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

function CertificateCard({ entry }) {
  return (
    <ResourceRow>
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--line)] bg-slate-100/70">
        <div>
          {entry.imagePath ? (
            <img
              src={entry.imagePath}
              alt={entry.title || "Sertifikat"}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center px-4 text-center text-sm font-medium text-slate-500">
              Preview sertifikat belum tersedia
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-4 pt-20">
          <strong className="block text-base text-white">
            {entry.title || "Tanpa judul"}
          </strong>
        </div>
      </div>
    </ResourceRow>
  );
}

export default function CertificatesPage() {
  const { dashboard, deleteCertificate } = useDashboard();
  const navigate = useNavigate();
  const certificates = dashboard?.resources?.certificates || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sertifikat</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Halaman index sertifikat untuk melihat, mengubah, dan menghapus
            sertifikat Anda.
          </p>
        </div>

        <Button
          className="w-full px-4 py-2 sm:w-auto"
          onClick={() => navigate("/dashboard/certificates/new")}
        >
          Tambah Sertifikat
        </Button>
      </div>

      <ResourceListPanel
        title="Sertifikat Saya"
        items={certificates}
        emptyText="Belum ada sertifikat."
        headerAction={
          <Button
            className="w-full px-4 py-2 sm:w-auto"
            onClick={() => navigate("/dashboard/certificates/new")}
          >
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
        renderItem={(entry) => <CertificateCard entry={entry} />}
      />
    </div>
  );
}
