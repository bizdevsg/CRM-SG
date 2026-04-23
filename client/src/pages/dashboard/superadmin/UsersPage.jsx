import { useEffect, useState } from "react";
import Card from "../../../components/atoms/Card";
import Input from "../../../components/atoms/Input";
import Select from "../../../components/atoms/Select";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

export default function UsersPage() {
  const { dashboard, createManagedUser } = useDashboard();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    branchId: ""
  });

  useEffect(() => {
    if (!form.branchId && dashboard?.branches?.length) {
      setForm((current) => ({
        ...current,
        branchId: dashboard.branches[0].id
      }));
    }
  }, [dashboard?.branches, form.branchId]);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const success = await createManagedUser(form);

    if (success) {
      setForm((current) => ({
        ...current,
        name: "",
        email: "",
        password: ""
      }));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Admin Cabang</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Superadmin dapat membuat akun admin cabang atau marketing dari sini.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900">Tambah Pengguna</h3>
          <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama lengkap"
              required
            />
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
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
            <Select name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin Cabang</option>
              <option value="marketing">Marketing</option>
            </Select>
            <Select name="branchId" value={form.branchId} onChange={handleChange} required>
              <option value="">Pilih cabang</option>
              {(dashboard?.branches || []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
            <Button type="submit">Buat Akun</Button>
          </form>
        </Card>

        <ResourceListPanel
          title="Daftar Admin Cabang"
          items={dashboard?.admins || []}
          emptyText="Belum ada admin cabang."
          renderItem={(admin) => (
            <ResourceRow>
              <strong className="text-base text-slate-900">{admin.name}</strong>
              <span>{admin.email}</span>
              <span>{admin.branchName}</span>
            </ResourceRow>
          )}
        />
      </div>
    </div>
  );
}

