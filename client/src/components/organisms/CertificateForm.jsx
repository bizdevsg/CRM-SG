import { useEffect, useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";

export default function CertificateForm({ initialValues, onSubmit, submitLabel }) {
  const [title, setTitle] = useState(initialValues.title || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialValues.imagePath || "");

  useEffect(() => {
    setTitle(initialValues.title || "");
    setImageFile(null);
    setImagePreview(initialValues.imagePath || "");
  }, [initialValues]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : initialValues.imagePath || "");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", title || "");

    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    await onSubmit(formData);
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Nama sertifikat"
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
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
