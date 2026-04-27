import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

function renderUserCard(user) {
  return (
    <ResourceRow>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <strong className="block text-base text-slate-900">
            {user.name}
          </strong>
          <p className="truncate text-sm text-slate-500">{user.email}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            user.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {user.isActive ? "Aktif" : "Non Aktif"}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        <p className="text-slate-600">{user.companyName || "-"}</p>
        <p className="text-slate-500">{user.branchName || "-"}</p>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {user.positionTitle ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {user.positionTitle}
          </span>
        ) : null}
        {user.supervisorName ? (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Atasan: {user.supervisorName}
          </span>
        ) : null}
      </div>
    </ResourceRow>
  );
}

export default function UsersPage() {
  const { dashboard, deleteManagedUser } = useDashboard();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Kelola Pengguna</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Halaman index untuk melihat, mengubah, dan menghapus admin cabang
          maupun marketing.
        </p>
      </div>

      <ResourceListPanel
        title="Daftar Admin Cabang"
        items={dashboard?.admins || []}
        emptyText="Belum ada admin cabang."
        headerAction={
          <Button
            className="px-4 py-2"
            onClick={() => navigate("/dashboard/users/new")}
          >
            Tambah Admin
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
        renderItem={renderUserCard}
      />
    </div>
  );
}
