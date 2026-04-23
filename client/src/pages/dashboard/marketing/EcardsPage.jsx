import { useState } from "react";
import Card from "../../../components/atoms/Card";
import Input from "../../../components/atoms/Input";
import Button from "../../../components/atoms/Button";
import { useDashboard } from "../../../context/DashboardContext";

export default function EcardsPage() {
  const { dashboard, createEcard, deleteEcard } = useDashboard();
  const [form, setForm] = useState({
    title: "",
    slug: ""
  });

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const success = await createEcard(form);
    if (success) {
      setForm({
        title: "",
        slug: ""
      });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">E-Card QR</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Generator QR code untuk E-Card Anda.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900">Buat E-Card QR</h3>
          <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Judul e-card"
              required
            />
            <Input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="Slug opsional"
            />
            <Button type="submit">Generate QR</Button>
          </form>
        </Card>

        <Card>
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">E-Card Saya</h2>
          </div>
          {(dashboard?.resources?.ecards || []).length === 0 ? (
            <p className="px-6 py-5 text-sm leading-6 text-slate-500">Belum ada e-card.</p>
          ) : (
            <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
              {dashboard.resources.ecards.map((ecard) => (
                <div
                  key={ecard.id}
                  className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                >
                  <img
                    className="w-full rounded-3xl bg-white p-3"
                    src={ecard.qrCodeDataUrl}
                    alt={`QR Code ${ecard.title}`}
                  />
                  <div className="grid gap-1 text-sm text-slate-600">
                    <strong className="text-base text-slate-900">{ecard.title}</strong>
                    <span className="break-all">{ecard.publicUrl}</span>
                  </div>
                  <Button variant="ghost" className="px-4 py-2" onClick={() => deleteEcard(ecard.id)}>
                    Hapus QR
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

