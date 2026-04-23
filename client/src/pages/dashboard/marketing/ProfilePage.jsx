import { useState } from "react";
import Card from "../../../components/atoms/Card";
import Input from "../../../components/atoms/Input";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

export default function ProfilePage() {
  const { dashboard, addBiodata, deleteBiodata, addSocialMedia, deleteSocialMedia } =
    useDashboard();
  const [biodataForm, setBiodataForm] = useState({ label: "", value: "" });
  const [socialForm, setSocialForm] = useState({ platform: "", url: "" });

  function handleBiodataChange(event) {
    setBiodataForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function handleSocialChange(event) {
    setSocialForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleBiodataSubmit(event) {
    event.preventDefault();
    const success = await addBiodata(biodataForm);
    if (success) {
      setBiodataForm({ label: "", value: "" });
    }
  }

  async function handleSocialSubmit(event) {
    event.preventDefault();
    const success = await addSocialMedia(socialForm);
    if (success) {
      setSocialForm({ platform: "", url: "" });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Biodata</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Kelola biodata pribadi dan social media yang muncul di E-Card.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900">Tambah Biodata</h3>
          <form className="mt-5 grid gap-3" onSubmit={handleBiodataSubmit}>
            <Input
              name="label"
              value={biodataForm.label}
              onChange={handleBiodataChange}
              placeholder="Label biodata"
              required
            />
            <Input
              name="value"
              value={biodataForm.value}
              onChange={handleBiodataChange}
              placeholder="Isi biodata"
              required
            />
            <Button type="submit">Simpan Biodata</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900">Tambah Social Media</h3>
          <form className="mt-5 grid gap-3" onSubmit={handleSocialSubmit}>
            <Input
              name="platform"
              value={socialForm.platform}
              onChange={handleSocialChange}
              placeholder="Platform"
              required
            />
            <Input
              name="url"
              value={socialForm.url}
              onChange={handleSocialChange}
              placeholder="URL profile"
              required
            />
            <Button type="submit">Simpan Social Media</Button>
          </form>
        </Card>

        <ResourceListPanel
          title="Biodata Saya"
          items={dashboard?.resources?.biodata || []}
          emptyText="Belum ada biodata."
          onDelete={deleteBiodata}
          renderItem={(entry) => (
            <ResourceRow>
              <strong className="text-base text-slate-900">{entry.label}</strong>
              <span>{entry.value}</span>
            </ResourceRow>
          )}
        />

        <ResourceListPanel
          title="Social Media Saya"
          items={dashboard?.resources?.socialMedia || []}
          emptyText="Belum ada social media."
          onDelete={deleteSocialMedia}
          renderItem={(entry) => (
            <ResourceRow>
              <strong className="text-base text-slate-900">{entry.platform}</strong>
              <span className="break-all">{entry.url}</span>
            </ResourceRow>
          )}
        />
      </div>
    </div>
  );
}

