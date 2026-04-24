import { useNavigate } from "react-router-dom";
import Card from "../../../components/atoms/Card";
import BranchForm from "../../../components/organisms/BranchForm";
import { useDashboard } from "../../../context/DashboardContext";

export default function BranchCreatePage() {
  const { dashboard, createBranch } = useDashboard();
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    const success = await createBranch(payload);

    if (success) {
      navigate("/dashboard/branches");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tambah Cabang</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Tambahkan cabang baru untuk salah satu perusahaan.
        </p>
      </div>

      <Card className="p-6">
        <BranchForm
          companies={dashboard?.companies || []}
          initialValues={{ companyId: "", name: "", address: "" }}
          onSubmit={handleSubmit}
          submitLabel="Simpan Cabang"
        />
      </Card>
    </div>
  );
}
