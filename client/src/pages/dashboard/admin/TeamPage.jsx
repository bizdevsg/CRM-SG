import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

export default function TeamPage() {
  const { dashboard, deleteMarketing } = useDashboard();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tim Marketing</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Halaman index marketing cabang untuk melihat, mengubah, dan menghapus akun marketing.
        </p>
      </div>

      <ResourceListPanel
        title="Marketing Cabang"
        items={dashboard?.marketingTeam || []}
        emptyText="Belum ada marketing di cabang ini."
        headerAction={
          <Button className="px-4 py-2" onClick={() => navigate("/dashboard/team/new")}>
            Tambah Marketing
          </Button>
        }
        onDelete={deleteMarketing}
        renderActions={(marketing) => (
          <Button
            variant="secondary"
            className="px-4 py-2"
            onClick={() => navigate(`/dashboard/team/${marketing.id}/edit`)}
          >
            Edit
          </Button>
        )}
        renderItem={(marketing) => (
          <ResourceRow>
            <strong className="text-base text-slate-900">{marketing.name}</strong>
            <span>{marketing.email}</span>
            <span>{marketing.positionTitle || "-"}</span>
            <span>Status: {marketing.isActive ? "Aktif" : "Non Aktif"}</span>
            <span>Sertifikat: {marketing.certificateCount ?? 0}</span>
            <span>E-Card: {marketing.ecardCount ?? 0}</span>
            <span>Atasan: {marketing.supervisorName || "-"}</span>
          </ResourceRow>
        )}
      />
    </div>
  );
}
