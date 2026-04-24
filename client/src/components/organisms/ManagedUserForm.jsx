import { useEffect, useMemo, useState } from "react";
import Input from "../atoms/Input";
import Select from "../atoms/Select";
import Button from "../atoms/Button";
import { JOB_TITLE_OPTIONS } from "../../config/jobTitles";

function getBranchesByCompany(branches, companyId) {
  return (branches || []).filter((branch) => String(branch.companyId) === String(companyId));
}

function getJobTitleRank(jobTitle) {
  const index = JOB_TITLE_OPTIONS.indexOf(jobTitle);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export default function ManagedUserForm({
  companies,
  branches,
  users,
  initialValues,
  onSubmit,
  submitLabel,
  fixedRole = null,
  fixedCompanyId = null,
  fixedBranchId = null,
  currentUserId = null,
  requirePassword = true
}) {
  const [form, setForm] = useState(initialValues);

  const activeCompanyId = fixedCompanyId || form.companyId;
  const activeRole = fixedRole || form.role;
  const filteredBranches = useMemo(
    () => getBranchesByCompany(branches, activeCompanyId),
    [branches, activeCompanyId]
  );
  const supervisorOptions = useMemo(() => {
    const currentRank = getJobTitleRank(form.positionTitle);

    if (currentRank === Number.MAX_SAFE_INTEGER) {
      return [];
    }

    return (users || [])
      .filter((candidate) => String(candidate.id) !== String(currentUserId || ""))
      .filter((candidate) => String(candidate.companyId || "") === String(activeCompanyId || ""))
      .filter((candidate) => String(candidate.branchId || "") === String((fixedBranchId || form.branchId) || ""))
      .filter((candidate) => getJobTitleRank(candidate.positionTitle) < currentRank)
      .sort((left, right) => {
        const rankDiff = getJobTitleRank(left.positionTitle) - getJobTitleRank(right.positionTitle);

        if (rankDiff !== 0) {
          return rankDiff;
        }

        return String(left.name || "").localeCompare(String(right.name || ""));
      });
  }, [users, currentUserId, activeCompanyId, fixedBranchId, form.branchId, form.positionTitle]);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (!fixedCompanyId && !form.companyId && companies.length) {
      setForm((current) => ({
        ...current,
        companyId: String(companies[0].id)
      }));
    }
  }, [companies, fixedCompanyId, form.companyId]);

  useEffect(() => {
    if (fixedBranchId) {
      setForm((current) => ({
        ...current,
        branchId: String(fixedBranchId)
      }));
      return;
    }

    if (!filteredBranches.length) {
      setForm((current) => ({
        ...current,
        branchId: ""
      }));
      return;
    }

    const currentExists = filteredBranches.some((branch) => String(branch.id) === String(form.branchId));

    if (!currentExists) {
      setForm((current) => ({
        ...current,
        branchId: String(filteredBranches[0].id)
      }));
    }
  }, [filteredBranches, fixedBranchId, form.branchId]);

  useEffect(() => {
    if (!form.supervisorId) {
      return;
    }

    const isValid = supervisorOptions.some(
      (candidate) => String(candidate.id) === String(form.supervisorId)
    );

    if (!isValid) {
      setForm((current) => ({
        ...current,
        supervisorId: ""
      }));
    }
  }, [form.supervisorId, supervisorOptions]);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      ...form,
      role: activeRole,
      companyId: Number(fixedCompanyId || form.companyId),
      branchId: Number(fixedBranchId || form.branchId),
      supervisorId: form.supervisorId ? Number(form.supervisorId) : null,
      password: form.password || undefined
    });
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Nama lengkap"
        required
      />
      <Input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
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
        placeholder={requirePassword ? "Password" : "Password baru opsional"}
        minLength="6"
        required={requirePassword}
      />
      <Input name="nik" value={form.nik} onChange={handleChange} placeholder="NIK" />
      <Input
        name="licenseNumber"
        value={form.licenseNumber}
        onChange={handleChange}
        placeholder="Nomor izin"
      />
      <Select name="positionTitle" value={form.positionTitle} onChange={handleChange}>
        <option value="">Pilih jabatan asli</option>
        {JOB_TITLE_OPTIONS.map((jobTitle) => (
          <option key={jobTitle} value={jobTitle}>
            {jobTitle}
          </option>
        ))}
      </Select>

      {!fixedRole ? (
        <Select name="role" value={form.role} onChange={handleChange}>
          <option value="admin">Admin Cabang</option>
          <option value="marketing">Marketing</option>
        </Select>
      ) : null}

      {!fixedCompanyId ? (
        <Select name="companyId" value={form.companyId} onChange={handleChange} required>
          <option value="">Pilih perusahaan</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </Select>
      ) : null}

      {!fixedBranchId ? (
        <Select name="branchId" value={form.branchId} onChange={handleChange} required>
          <option value="">Pilih cabang</option>
          {filteredBranches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>
      ) : null}

      {["admin", "marketing"].includes(activeRole) ? (
        <Select
          name="supervisorId"
          value={form.supervisorId}
          onChange={handleChange}
          disabled={!form.positionTitle}
        >
          <option value="">
            {!form.positionTitle
              ? "Pilih jabatan user dulu"
              : supervisorOptions.length
                ? "Pilih atasan"
                : "Tidak ada atasan yang lebih tinggi"}
          </option>
          {supervisorOptions.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name} - {candidate.positionTitle || "Tanpa jabatan"}
            </option>
          ))}
        </Select>
      ) : null}

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
