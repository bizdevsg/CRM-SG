import { Navigate, useNavigate, useParams } from "react-router-dom";
import Card from "../../../components/atoms/Card";
import LoadingScreen from "../../../components/atoms/LoadingScreen";
import ManagedUserForm from "../../../components/organisms/ManagedUserForm";
import { useDashboard } from "../../../context/DashboardContext";

export default function UserEditPage() {
  const { userId } = useParams();
  const { dashboard, loading, updateManagedUser } = useDashboard();
  const navigate = useNavigate();
  const allUsers = [...(dashboard?.admins || []), ...(dashboard?.marketingTeam || [])];
  const user = allUsers.find((item) => String(item.id) === String(userId));

  async function handleSubmit(payload) {
    const success = await updateManagedUser(userId, payload);

    if (success) {
      navigate("/dashboard/users");
    }
  }

  if (loading && !user) {
    return <LoadingScreen message="Memuat pengguna..." />;
  }

  if (!user) {
    return <Navigate to="/dashboard/users" replace />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Edit Pengguna</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Perbarui data akun admin cabang atau marketing.
        </p>
      </div>

      <Card className="p-6">
        <ManagedUserForm
          companies={dashboard?.companies || []}
          branches={dashboard?.branches || []}
          users={allUsers}
          initialValues={{
            name: user.name || "",
            username: user.username || "",
            email: user.email || "",
            password: "",
            nik: user.nik || "",
            licenseNumber: user.licenseNumber || "",
            positionTitle: user.positionTitle || "",
            role: user.role || "marketing",
            companyId: String(user.companyId || ""),
            branchId: String(user.branchId || ""),
            supervisorId: String(user.supervisorId || "")
          }}
          currentUserId={user.id}
          onSubmit={handleSubmit}
          submitLabel="Perbarui Pengguna"
          requirePassword={false}
        />
      </Card>
    </div>
  );
}
