import { useState } from "react";
import Card from "../../../components/atoms/Card";
import Input from "../../../components/atoms/Input";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

export default function BranchesPage() {
  const { dashboard, createBranch } = useDashboard();
  const [form, setForm] = useState({ name: "", code: "" });

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const success = await createBranch(form);

    if (success) {
      setForm({ name: "", code: "" });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cabang</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Kelola seluruh cabang yang ada dalam sistem E-Card.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900">Tambah Cabang</h3>
          <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama cabang"
              required
            />
            <Input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Kode cabang"
              required
            />
            <Button type="submit">Simpan Cabang</Button>
          </form>
        </Card>

        <ResourceListPanel
          title="Daftar Cabang"
          items={dashboard?.branches || []}
          emptyText="Belum ada cabang."
          renderItem={(branch) => (
            <ResourceRow>
              <strong className="text-base text-slate-900">{branch.name}</strong>
              <span>Kode: {branch.code}</span>
              <span>Admin: {branch.adminCount}</span>
              <span>Marketing: {branch.marketingCount}</span>
              <span>E-Card: {branch.ecardCount}</span>
            </ResourceRow>
          )}
        />
      </div>
    </div>
  );
}

