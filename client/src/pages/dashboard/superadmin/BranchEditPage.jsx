import { Navigate, useNavigate, useParams } from "react-router-dom";
import Card from "../../../components/atoms/Card";
import LoadingScreen from "../../../components/atoms/LoadingScreen";
import BranchForm from "../../../components/organisms/BranchForm";
import { useDashboard } from "../../../context/DashboardContext";

export default function BranchEditPage() {
  const { branchId } = useParams();
  const { dashboard, loading, updateBranch } = useDashboard();
  const navigate = useNavigate();
  const branch = (dashboard?.branches || []).find((item) => String(item.id) === String(branchId));

  async function handleSubmit(payload) {
    const success = await updateBranch(branchId, payload);

    if (success) {
      navigate("/dashboard/branches");
    }
  }

  if (loading && !branch) {
    return <LoadingScreen message="Memuat cabang..." />;
  }

  if (!branch) {
    return <Navigate to="/dashboard/branches" replace />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Edit Cabang</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Perbarui informasi cabang yang sudah ada.
        </p>
      </div>

      <Card className="p-6">
        <BranchForm
          companies={dashboard?.companies || []}
          initialValues={{
            companyId: String(branch.companyId),
            name: branch.name || "",
            address: branch.address || ""
          }}
          onSubmit={handleSubmit}
          submitLabel="Perbarui Cabang"
        />
      </Card>
    </div>
  );
}
