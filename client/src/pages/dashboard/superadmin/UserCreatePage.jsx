import { useNavigate } from "react-router-dom";
import Card from "../../../components/atoms/Card";
import ManagedUserForm from "../../../components/organisms/ManagedUserForm";
import { useDashboard } from "../../../context/DashboardContext";

export default function UserCreatePage() {
  const { dashboard, createManagedUser } = useDashboard();
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    const success = await createManagedUser(payload);

    if (success) {
      navigate("/dashboard/users");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tambah Pengguna</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Buat akun admin cabang atau marketing untuk PT dan cabang tertentu.
        </p>
      </div>

      <Card className="p-6">
        <ManagedUserForm
          companies={dashboard?.companies || []}
          branches={dashboard?.branches || []}
          users={[...(dashboard?.admins || []), ...(dashboard?.marketingTeam || [])]}
          initialValues={{
            name: "",
            username: "",
            email: "",
            password: "",
            nik: "",
            licenseNumber: "",
            positionTitle: "",
            role: "admin",
            companyId: "",
            branchId: "",
            supervisorId: ""
          }}
          onSubmit={handleSubmit}
          submitLabel="Simpan Pengguna"
        />
      </Card>
    </div>
  );
}
