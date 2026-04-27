import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

function renderBranchCard(branch) {
  return (
    <ResourceRow>
      <div>
        <strong className="block text-base text-slate-900">{branch.name}</strong>
        <p className="text-sm text-slate-500">{branch.companyName || "-"}</p>
      </div>

      <p className="line-clamp-2 text-sm text-slate-600">{branch.address || "-"}</p>

      <div className="flex flex-wrap gap-2 pt-1">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          Admin: {branch.adminCount}
        </span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Marketing: {branch.marketingCount}
        </span>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
          E-Card: {branch.ecardCount}
        </span>
      </div>
    </ResourceRow>
  );
}

export default function BranchesPage() {
  const { dashboard, deleteBranch } = useDashboard();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cabang</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Halaman index cabang untuk melihat, mengubah, dan menghapus data cabang.
        </p>
      </div>

      <ResourceListPanel
        title="Daftar Cabang"
        items={dashboard?.branches || []}
        emptyText="Belum ada cabang."
        headerAction={
          <Button className="px-4 py-2" onClick={() => navigate("/dashboard/branches/new")}>
            Tambah Cabang
          </Button>
        }
        onDelete={deleteBranch}
        renderActions={(branch) => (
          <Button
            variant="secondary"
            className="px-4 py-2"
            onClick={() => navigate(`/dashboard/branches/${branch.id}/edit`)}
          >
            Edit
          </Button>
        )}
        renderItem={renderBranchCard}
      />
    </div>
  );
}
