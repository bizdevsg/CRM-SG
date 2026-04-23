import { useState } from "react";
import Card from "../../../components/atoms/Card";
import Input from "../../../components/atoms/Input";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

export default function CertificatesPage() {
  const { dashboard, addCertificate, deleteCertificate } = useDashboard();
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    year: ""
  });

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const success = await addCertificate(form);
    if (success) {
      setForm({
        title: "",
        issuer: "",
        year: ""
      });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Sertifikat</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Tambahkan sertifikat profesional untuk memperkuat profil Anda.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900">Tambah Sertifikat</h3>
          <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Nama sertifikat"
              required
            />
            <Input
              name="issuer"
              value={form.issuer}
              onChange={handleChange}
              placeholder="Penerbit"
              required
            />
            <Input
              name="year"
              value={form.year}
              onChange={handleChange}
              placeholder="Tahun"
              required
            />
            <Button type="submit">Simpan Sertifikat</Button>
          </form>
        </Card>

        <ResourceListPanel
          title="Sertifikat Saya"
          items={dashboard?.resources?.certificates || []}
          emptyText="Belum ada sertifikat."
          onDelete={deleteCertificate}
          renderItem={(entry) => (
            <ResourceRow>
              <strong className="text-base text-slate-900">{entry.title}</strong>
              <span>{entry.issuer}</span>
              <span>{entry.year}</span>
            </ResourceRow>
          )}
        />
      </div>
    </div>
  );
}

