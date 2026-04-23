import { useState } from "react";
import Card from "../../../components/atoms/Card";
import Input from "../../../components/atoms/Input";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

export default function TeamPage() {
  const { dashboard, createMarketing } = useDashboard();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const success = await createMarketing(form);

    if (success) {
      setForm({
        name: "",
        email: "",
        password: ""
      });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tim Marketing</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Daftar marketing yang berada di cabang Anda.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900">Tambah Marketing</h3>
          <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama marketing"
              required
            />
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email marketing"
              required
            />
            <Input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              minLength="6"
              required
            />
            <Button type="submit">Buat Marketing</Button>
          </form>
        </Card>

        <ResourceListPanel
          title="Marketing Cabang"
          items={dashboard?.marketingTeam || []}
          emptyText="Belum ada marketing di cabang ini."
          renderItem={(marketing) => (
            <ResourceRow>
              <strong className="text-base text-slate-900">{marketing.name}</strong>
              <span>{marketing.email}</span>
              <span>{marketing.branchName}</span>
            </ResourceRow>
          )}
        />
      </div>
    </div>
  );
}

