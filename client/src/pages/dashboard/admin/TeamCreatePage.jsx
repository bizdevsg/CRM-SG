import { useNavigate } from "react-router-dom";
import Card from "../../../components/atoms/Card";
import ManagedUserForm from "../../../components/organisms/ManagedUserForm";
import { useDashboard } from "../../../context/DashboardContext";
import { useAuth } from "../../../context/AuthContext";

export default function TeamCreatePage() {
  const { dashboard, createMarketing } = useDashboard();
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    const success = await createMarketing(payload);

    if (success) {
      navigate("/dashboard/team");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tambah Marketing</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Buat akun marketing baru untuk cabang yang Anda kelola.
        </p>
      </div>

      <Card className="p-6">
        <ManagedUserForm
          companies={dashboard?.companies || []}
          branches={dashboard?.branches || []}
          users={[...(dashboard?.marketingTeam || []), ...(user ? [user] : [])]}
          initialValues={{
            name: "",
            username: "",
            email: "",
            password: "",
            nik: "",
            licenseNumber: "",
            positionTitle: "",
            role: "marketing",
            companyId: String(user?.companyId || ""),
            branchId: String(user?.branchId || ""),
            supervisorId: ""
          }}
          onSubmit={handleSubmit}
          submitLabel="Simpan Marketing"
          fixedRole="marketing"
          fixedCompanyId={user?.companyId || null}
          fixedBranchId={user?.branchId || null}
        />
      </Card>
    </div>
  );
}
