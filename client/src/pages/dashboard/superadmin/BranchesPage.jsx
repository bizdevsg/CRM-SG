import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

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
        renderItem={(branch) => (
          <ResourceRow>
            <strong className="text-base text-slate-900">{branch.name}</strong>
            <span>{branch.companyName}</span>
            <span>{branch.address}</span>
            <span>Admin: {branch.adminCount}</span>
            <span>Marketing: {branch.marketingCount}</span>
            <span>E-Card: {branch.ecardCount}</span>
          </ResourceRow>
        )}
      />
    </div>
  );
}
