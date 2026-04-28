import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

function renderMarketingCard(marketing) {
  return (
    <ResourceRow>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <strong className="block text-base text-slate-900">{marketing.name}</strong>
          <p className="truncate text-sm text-slate-500">{marketing.email}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            marketing.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {marketing.isActive ? "Aktif" : "Non Aktif"}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        <p className="text-slate-600">{marketing.companyName || "-"}</p>
        <p className="text-slate-500">{marketing.branchName || "-"}</p>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {marketing.positionTitle ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {marketing.positionTitle}
          </span>
        ) : null}
        {marketing.supervisorName ? (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Atasan: {marketing.supervisorName}
          </span>
        ) : null}
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          Sertifikat: {marketing.certificateCount ?? 0}
        </span>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
          E-Card: {marketing.ecardCount ?? 0}
        </span>
      </div>
    </ResourceRow>
  );
}

export default function TeamPage() {
  const navigate = useNavigate();
  const { dashboard, deleteMarketing } = useDashboard();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tim Marketing</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Daftar marketing yang terdaftar pada cabang yang Anda kelola.
        </p>
      </div>

      <ResourceListPanel
        title="Marketing Cabang"
        items={dashboard?.marketingTeam || []}
        emptyText="Belum ada marketing pada cabang ini."
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
        renderItem={renderMarketingCard}
      />
    </div>
  );
}
