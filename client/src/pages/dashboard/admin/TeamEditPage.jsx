import { Navigate, useNavigate, useParams } from "react-router-dom";
import Card from "../../../components/atoms/Card";
import LoadingScreen from "../../../components/atoms/LoadingScreen";
import ManagedUserForm from "../../../components/organisms/ManagedUserForm";
import { useDashboard } from "../../../context/DashboardContext";
import { useAuth } from "../../../context/AuthContext";

export default function TeamEditPage() {
  const { userId } = useParams();
  const { dashboard, loading, updateMarketing } = useDashboard();
  const { user } = useAuth();
  const navigate = useNavigate();
  const marketing = (dashboard?.marketingTeam || []).find((item) => String(item.id) === String(userId));

  async function handleSubmit(payload) {
    const success = await updateMarketing(userId, payload);

    if (success) {
      navigate("/dashboard/team");
    }
  }

  if (loading && !marketing) {
    return <LoadingScreen message="Memuat marketing..." />;
  }

  if (!marketing) {
    return <Navigate to="/dashboard/team" replace />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Edit Marketing</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Perbarui akun marketing pada cabang Anda.
        </p>
      </div>

      <Card className="p-6">
        <ManagedUserForm
          companies={dashboard?.companies || []}
          branches={dashboard?.branches || []}
          users={[...(dashboard?.marketingTeam || []), ...(user ? [user] : [])]}
          initialValues={{
            name: marketing.name || "",
            username: marketing.username || "",
            email: marketing.email || "",
            password: "",
            nik: marketing.nik || "",
            isActive: String(marketing.isActive ?? true),
            licenseNumber: marketing.licenseNumber || "",
            positionTitle: marketing.positionTitle || "",
            role: "marketing",
            companyId: String(user?.companyId || ""),
            branchId: String(user?.branchId || ""),
            supervisorId: String(marketing.supervisorId || "")
          }}
          currentUserId={marketing.id}
          onSubmit={handleSubmit}
          submitLabel="Perbarui Marketing"
          fixedRole="marketing"
          fixedCompanyId={user?.companyId || null}
          fixedBranchId={user?.branchId || null}
          requirePassword={false}
        />
      </Card>
    </div>
  );
}
