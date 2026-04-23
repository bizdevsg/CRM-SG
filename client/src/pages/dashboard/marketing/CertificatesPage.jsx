import { useEffect, useState } from "react";
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });

    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    const success = await addCertificate(formData);
    if (success) {
      setForm({
        title: "",
        issuer: "",
        year: ""
      });
      setImageFile(null);

      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview("");
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Upload Gambar Sertifikat</p>
              <div className="mt-3 space-y-3">
                <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview sertifikat" className="h-40 w-full rounded-2xl object-cover" />
                ) : null}
                <p className="text-xs leading-5 text-slate-500">
                  Format JPG, PNG, atau WEBP. Maksimal 5MB.
                </p>
              </div>
            </div>
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
              {entry.imagePath ? (
                <img
                  src={entry.imagePath}
                  alt={entry.title}
                  className="mb-3 h-40 w-full rounded-2xl object-cover"
                />
              ) : null}
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
