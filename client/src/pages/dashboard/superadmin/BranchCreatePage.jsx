import { useNavigate } from "react-router-dom";
import Card from "../../../components/atoms/Card";
import BranchCsvImportPanel from "../../../components/organisms/BranchCsvImportPanel";
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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.95fr)]">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Input Manual</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Isi form berikut jika ingin menambahkan satu cabang secara langsung.
              </p>
            </div>

            <BranchForm
              companies={dashboard?.companies || []}
              initialValues={{ companyId: "", name: "", address: "" }}
              onSubmit={handleSubmit}
              submitLabel="Simpan Cabang"
            />
          </div>
        </Card>

        <BranchCsvImportPanel
          companies={dashboard?.companies || []}
          branches={dashboard?.branches || []}
          onImportSuccess={() => navigate("/dashboard/branches")}
        />
      </div>
    </div>
  );
}
