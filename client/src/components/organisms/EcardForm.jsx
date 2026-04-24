import { useEffect, useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";

export default function EcardForm({ initialValues, onSubmit, submitLabel }) {
  const [form, setForm] = useState(initialValues);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Judul QR e-card"
        required
      />
      <Input
        name="slug"
        value={form.slug}
        onChange={handleChange}
        placeholder="Slug publik opsional"
      />
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
