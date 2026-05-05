import { useEffect, useState } from "react";
import Select from "../atoms/Select";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import SubmitConfirmationModal from "../atoms/SubmitConfirmationModal";
import useSubmitConfirmation from "../../hooks/useSubmitConfirmation";

export default function BranchForm({
  companies,
  initialValues,
  onSubmit,
  submitLabel,
}) {
  const [form, setForm] = useState(initialValues);
  const {
    isConfirmationOpen,
    isSubmittingConfirmation,
    requestConfirmation,
    closeConfirmation,
    confirmSubmission,
  } = useSubmitConfirmation();

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (!form.companyId && companies.length) {
      setForm((current) => ({
        ...current,
        companyId: String(companies[0].id)
      }));
    }
  }, [companies, form.companyId]);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    requestConfirmation(async () => {
      await onSubmit({
        ...form,
        companyId: Number(form.companyId),
      });
    });
  }

  return (
    <>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <Select
          name="companyId"
          value={form.companyId}
          onChange={handleChange}
          required
        >
          <option value="">Pilih perusahaan</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </Select>
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nama cabang"
          required
        />
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Alamat cabang"
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
          required
        />
        <Button type="submit" disabled={isSubmittingConfirmation}>
          {submitLabel}
        </Button>
      </form>
      <SubmitConfirmationModal
        open={isConfirmationOpen}
        title="Simpan data cabang?"
        message="Nama cabang, perusahaan, dan alamat akan disimpan. Pastikan informasinya sudah benar."
        confirmLabel={submitLabel}
        onConfirm={confirmSubmission}
        onCancel={closeConfirmation}
        submitting={isSubmittingConfirmation}
      />
    </>
  );
}
