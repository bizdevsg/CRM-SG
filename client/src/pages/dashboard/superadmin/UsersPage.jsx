import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

export default function UsersPage() {
  const { dashboard, deleteManagedUser } = useDashboard();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Kelola Pengguna</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Halaman index untuk melihat, mengubah, dan menghapus admin cabang maupun marketing.
        </p>
      </div>

      <ResourceListPanel
        title="Daftar Admin Cabang"
        items={dashboard?.admins || []}
        emptyText="Belum ada admin cabang."
        headerAction={
          <Button className="px-4 py-2" onClick={() => navigate("/dashboard/users/new")}>
            Tambah Pengguna
          </Button>
        }
        onDelete={deleteManagedUser}
        renderActions={(user) => (
          <Button
            variant="secondary"
            className="px-4 py-2"
            onClick={() => navigate(`/dashboard/users/${user.id}/edit`)}
          >
            Edit
          </Button>
        )}
        renderItem={(user) => (
          <ResourceRow>
            <strong className="text-base text-slate-900">{user.name}</strong>
            <span>{user.email}</span>
            <span>{user.companyName}</span>
            <span>{user.branchName}</span>
            <span>{user.positionTitle || "-"}</span>
            <span>Atasan: {user.supervisorName || "-"}</span>
          </ResourceRow>
        )}
      />

      <ResourceListPanel
        title="Daftar Marketing"
        items={dashboard?.marketingTeam || []}
        emptyText="Belum ada marketing."
        onDelete={deleteManagedUser}
        renderActions={(user) => (
          <Button
            variant="secondary"
            className="px-4 py-2"
            onClick={() => navigate(`/dashboard/users/${user.id}/edit`)}
          >
            Edit
          </Button>
        )}
        renderItem={(user) => (
          <ResourceRow>
            <strong className="text-base text-slate-900">{user.name}</strong>
            <span>{user.email}</span>
            <span>{user.companyName}</span>
            <span>{user.branchName}</span>
            <span>Atasan: {user.supervisorName || "-"}</span>
          </ResourceRow>
        )}
      />
    </div>
  );
}
