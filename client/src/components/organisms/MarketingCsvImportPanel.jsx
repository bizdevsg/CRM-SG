import { useMemo, useState } from "react";
import Button from "../atoms/Button";
import Card from "../atoms/Card";
import Input from "../atoms/Input";
import { JOB_TITLE_OPTIONS } from "../../config/jobTitles";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../context/DashboardContext";
import { apiFetch } from "../../services/api";

const HEADER_NAME_BY_KEY = {
  name: "name",
  fullname: "name",
  nama: "name",
  username: "username",
  email: "email",
  password: "password",
  nik: "nik",
  isactive: "isActive",
  status: "isActive",
  licensenumber: "licenseNumber",
  nomorizin: "licenseNumber",
  positiontitle: "positionTitle",
  jabatan: "positionTitle",
  supervisoremail: "supervisorEmail",
  supervisorusername: "supervisorUsername",
  companyid: "companyId",
  companyname: "companyName",
  perusahaan: "companyName",
  branchid: "branchId",
  branchname: "branchName",
  cabang: "branchName",
};

const ADMIN_TEMPLATE_HEADERS = [
  "name",
  "username",
  "email",
  "password",
  "nik",
  "isActive",
  "licenseNumber",
  "positionTitle",
  "supervisorEmail",
];

const SUPERADMIN_TEMPLATE_HEADERS = [
  "name",
  "username",
  "email",
  "password",
  "companyName",
  "branchName",
  "nik",
  "isActive",
  "licenseNumber",
  "positionTitle",
  "supervisorEmail",
];

function normalizeLookup(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeHeaderKey(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function canonicalizeHeader(value) {
  const normalizedKey = normalizeHeaderKey(value);
  return HEADER_NAME_BY_KEY[normalizedKey] || String(value || "").trim();
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (character === "," && !insideQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  if (insideQuotes) {
    throw new Error("Format CSV tidak valid. Pastikan tanda kutip ditutup dengan benar.");
  }

  cells.push(current);
  return cells;
}

function parseCsv(text) {
  const rawLines = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");
  const meaningfulLines = rawLines.filter((line) => line.trim() !== "");

  if (!meaningfulLines.length) {
    throw new Error("File CSV kosong.");
  }

  const rawHeaders = parseCsvLine(meaningfulLines[0]).map((header) =>
    canonicalizeHeader(header)
  );

  const rows = meaningfulLines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const row = {};

    rawHeaders.forEach((header, headerIndex) => {
      row[header] = String(cells[headerIndex] || "").trim();
    });

    return {
      rowNumber: index + 2,
      values: row,
    };
  });

  return {
    headers: rawHeaders,
    rows,
  };
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("File CSV tidak bisa dibaca."));
    reader.readAsText(file);
  });
}

function parseIsActive(value) {
  const normalizedValue = normalizeLookup(value);

  if (!normalizedValue) {
    return "true";
  }

  if (["true", "1", "yes", "y", "aktif"].includes(normalizedValue)) {
    return "true";
  }

  if (["false", "0", "no", "n", "nonaktif", "non-aktif"].includes(normalizedValue)) {
    return "false";
  }

  return null;
}

function buildTemplateCsv(mode, companies, branches, fixedCompanyId, fixedBranchId) {
  const templateHeaders =
    mode === "superadmin" ? SUPERADMIN_TEMPLATE_HEADERS : ADMIN_TEMPLATE_HEADERS;
  const activeCompany = (companies || []).find(
    (company) => String(company.id) === String(fixedCompanyId || "")
  );
  const activeBranch = (branches || []).find(
    (branch) => String(branch.id) === String(fixedBranchId || "")
  );
  const sampleCompanyName = activeCompany?.name || companies?.[0]?.name || "Nama PT";
  const sampleBranchName =
    activeBranch?.name ||
    branches?.find((branch) =>
      fixedCompanyId
        ? String(branch.companyId) === String(fixedCompanyId)
        : String(branch.companyId) === String(companies?.[0]?.id || "")
    )?.name ||
    "Nama Cabang";
  const sampleValues =
    mode === "superadmin"
      ? [
          "Rina Pratama",
          "rina.pratama",
          "rina.pratama@example.com",
          "password123",
          sampleCompanyName,
          sampleBranchName,
          "3174XXXXXXXXXXXX",
          "true",
          "BAPPEBTI-001",
          "Business Consultant (BC)",
          "",
        ]
      : [
          "Rina Pratama",
          "rina.pratama",
          "rina.pratama@example.com",
          "password123",
          "3174XXXXXXXXXXXX",
          "true",
          "BAPPEBTI-001",
          "Business Consultant (BC)",
          "",
        ];

  return `${templateHeaders.join(",")}\n${sampleValues.map(escapeCsvCell).join(",")}\n`;
}

function escapeCsvCell(value) {
  const stringValue = String(value || "");

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function findCompany(companies, companyId, companyName) {
  if (companyId) {
    return (companies || []).find((company) => String(company.id) === String(companyId));
  }

  if (companyName) {
    return (companies || []).find(
      (company) => normalizeLookup(company.name) === normalizeLookup(companyName)
    );
  }

  return null;
}

function findBranch(branches, branchId, branchName, companyId) {
  if (branchId) {
    return (branches || []).find((branch) => String(branch.id) === String(branchId));
  }

  if (!branchName) {
    return null;
  }

  return (branches || []).find((branch) => {
    if (companyId && String(branch.companyId) !== String(companyId)) {
      return false;
    }

    return normalizeLookup(branch.name) === normalizeLookup(branchName);
  });
}

function buildImportPreview({
  parsedFile,
  companies,
  branches,
  fixedCompanyId,
  fixedBranchId,
}) {
  if (!parsedFile) {
    return null;
  }

  const headers = parsedFile.headers || [];
  const headerSet = new Set(headers);
  const headerErrors = [];
  const validationErrors = [];
  const readyEntries = [];
  const seenEmails = new Map();
  const seenUsernames = new Map();
  const isFixedBranchMode = Boolean(fixedBranchId);

  ["name", "username", "email", "password"].forEach((header) => {
    if (!headerSet.has(header)) {
      headerErrors.push(`Kolom \`${header}\` wajib ada pada file CSV.`);
    }
  });

  if (!isFixedBranchMode) {
    if (!headerSet.has("branchId") && !headerSet.has("branchName")) {
      headerErrors.push("Kolom `branchId` atau `branchName` wajib ada untuk import lintas cabang.");
    }

    if (!headerSet.has("branchId") && headerSet.has("branchName")) {
      const hasCompanyIdentity = headerSet.has("companyId") || headerSet.has("companyName");

      if (!hasCompanyIdentity) {
        headerErrors.push(
          "Jika memakai `branchName`, tambahkan juga kolom `companyId` atau `companyName`."
        );
      }
    }
  }

  if (headerErrors.length) {
    return {
      totalRows: parsedFile.rows.length,
      headerErrors,
      validationErrors,
      readyEntries,
    };
  }

  parsedFile.rows.forEach((row) => {
    const rowValues = row.values || {};
    const rowErrors = [];
    const name = rowValues.name || "";
    const username = rowValues.username || "";
    const email = rowValues.email || "";
    const password = rowValues.password || "";
    const nik = rowValues.nik || "";
    const licenseNumber = rowValues.licenseNumber || "";
    const positionTitle = rowValues.positionTitle || "";
    const supervisorEmail = rowValues.supervisorEmail || "";
    const supervisorUsername = rowValues.supervisorUsername || "";
    const isActive = parseIsActive(rowValues.isActive);

    if (!name || !username || !email || !password) {
      rowErrors.push("Nama, username, email, dan password wajib diisi.");
    }

    if (password && password.length < 6) {
      rowErrors.push("Password minimal 6 karakter.");
    }

    if (positionTitle && !JOB_TITLE_OPTIONS.includes(positionTitle)) {
      rowErrors.push("Jabatan tidak sesuai daftar yang tersedia.");
    }

    if (rowValues.isActive && isActive === null) {
      rowErrors.push("Nilai isActive hanya boleh true/false, aktif/nonaktif, 1/0, yes/no.");
    }

    let resolvedCompanyId = fixedCompanyId ? Number(fixedCompanyId) : null;
    let resolvedBranch = fixedBranchId
      ? {
          id: Number(fixedBranchId),
          companyId: fixedCompanyId ? Number(fixedCompanyId) : null,
        }
      : null;

    if (!resolvedBranch) {
      const resolvedCompany = findCompany(
        companies,
        rowValues.companyId,
        rowValues.companyName
      );

      if (rowValues.companyId || rowValues.companyName) {
        if (!resolvedCompany) {
          rowErrors.push("Perusahaan tidak ditemukan.");
        } else {
          resolvedCompanyId = resolvedCompany.id;
        }
      }

      resolvedBranch = findBranch(
        branches,
        rowValues.branchId,
        rowValues.branchName,
        resolvedCompanyId
      );

      if (!resolvedBranch) {
        rowErrors.push("Cabang tidak ditemukan.");
      } else if (
        resolvedCompanyId &&
        String(resolvedBranch.companyId) !== String(resolvedCompanyId)
      ) {
        rowErrors.push("Cabang tidak cocok dengan perusahaan yang dipilih.");
      } else {
        resolvedCompanyId = resolvedBranch.companyId;
      }
    } else {
      resolvedCompanyId = resolvedBranch.companyId;
    }

    const normalizedEmail = normalizeLookup(email);
    const normalizedUsername = normalizeLookup(username);

    if (normalizedEmail) {
      if (seenEmails.has(normalizedEmail)) {
        rowErrors.push(`Email duplikat dengan baris ${seenEmails.get(normalizedEmail)}.`);
      } else {
        seenEmails.set(normalizedEmail, row.rowNumber);
      }
    }

    if (normalizedUsername) {
      if (seenUsernames.has(normalizedUsername)) {
        rowErrors.push(`Username duplikat dengan baris ${seenUsernames.get(normalizedUsername)}.`);
      } else {
        seenUsernames.set(normalizedUsername, row.rowNumber);
      }
    }

    if (rowErrors.length) {
      validationErrors.push({
        rowNumber: row.rowNumber,
        message: rowErrors.join(" "),
      });
      return;
    }

    readyEntries.push({
      rowNumber: row.rowNumber,
      payload: {
        name,
        username,
        email,
        password,
        nik,
        isActive,
        licenseNumber,
        positionTitle,
        role: "marketing",
        branchId: Number(resolvedBranch.id),
        companyId: Number(resolvedCompanyId),
        supervisorEmail,
        supervisorUsername,
      },
    });
  });

  return {
    totalRows: parsedFile.rows.length,
    headerErrors,
    validationErrors,
    readyEntries,
  };
}

function findSupervisor(users, entry) {
  const supervisorEmail = normalizeLookup(entry.payload.supervisorEmail);
  const supervisorUsername = normalizeLookup(entry.payload.supervisorUsername);

  if (!supervisorEmail && !supervisorUsername) {
    return null;
  }

  return (users || []).find((candidate) => {
    const isSameBranch =
      String(candidate.companyId || "") === String(entry.payload.companyId || "") &&
      String(candidate.branchId || "") === String(entry.payload.branchId || "");

    if (!isSameBranch) {
      return false;
    }

    if (supervisorEmail && normalizeLookup(candidate.email) === supervisorEmail) {
      return true;
    }

    if (supervisorUsername && normalizeLookup(candidate.username) === supervisorUsername) {
      return true;
    }

    return false;
  });
}

export default function MarketingCsvImportPanel({
  companies,
  branches,
  users,
  fixedCompanyId = null,
  fixedBranchId = null,
}) {
  const { token } = useAuth();
  const { reloadDashboard, setFeedback } = useDashboard();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [parsedFile, setParsedFile] = useState(null);
  const [panelError, setPanelError] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const mode = fixedBranchId ? "admin" : "superadmin";

  const preview = useMemo(
    () =>
      buildImportPreview({
        parsedFile,
        companies,
        branches,
        fixedCompanyId,
        fixedBranchId,
      }),
    [parsedFile, companies, branches, fixedCompanyId, fixedBranchId]
  );

  async function handleFileChange(event) {
    const [file] = Array.from(event.target.files || []);

    setPanelError("");
    setImportResult(null);

    if (!file) {
      setSelectedFileName("");
      setParsedFile(null);
      return;
    }

    try {
      const csvText = await readFileAsText(file);
      const nextParsedFile = parseCsv(csvText);

      setSelectedFileName(file.name);
      setParsedFile(nextParsedFile);
    } catch (error) {
      setSelectedFileName(file.name || "");
      setParsedFile(null);
      setPanelError(error.message);
    }
  }

  function handleDownloadTemplate() {
    const csvContent = buildTemplateCsv(
      mode,
      companies,
      branches,
      fixedCompanyId,
      fixedBranchId
    );
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = downloadUrl;
    anchor.download =
      mode === "superadmin"
        ? "template-import-marketing-superadmin.csv"
        : "template-import-marketing-cabang.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  async function handleImport() {
    setPanelError("");

    if (!preview) {
      setPanelError("Pilih file CSV terlebih dahulu.");
      return;
    }

    if (preview.headerErrors.length) {
      setPanelError(preview.headerErrors[0]);
      return;
    }

    if (!preview.readyEntries.length) {
      const errorMessage =
        preview.validationErrors[0]?.message || "Tidak ada baris valid untuk diimpor.";

      setPanelError(errorMessage);
      setFeedback({
        error: "Import dibatalkan karena semua baris CSV tidak valid.",
        success: "",
      });
      setImportResult({
        totalRows: preview.totalRows,
        importedRows: [],
        failedRows: preview.validationErrors,
      });
      return;
    }

    setImporting(true);

    const knownUsers = [...(users || [])];
    const importedRows = [];
    const failedRows = [...preview.validationErrors];

    try {
      for (const entry of preview.readyEntries) {
        const supervisor = findSupervisor(knownUsers, entry);

        if (
          (entry.payload.supervisorEmail || entry.payload.supervisorUsername) &&
          !supervisor
        ) {
          failedRows.push({
            rowNumber: entry.rowNumber,
            message:
              "Atasan tidak ditemukan pada PT/cabang yang sama. Gunakan supervisorEmail atau supervisorUsername yang sudah terdaftar.",
          });
          continue;
        }

        try {
          const response = await apiFetch("/management/users", {
            method: "POST",
            token,
            body: {
              ...entry.payload,
              supervisorId: supervisor?.id || null,
            },
          });

          importedRows.push({
            rowNumber: entry.rowNumber,
            name: entry.payload.name,
            email: entry.payload.email,
          });

          if (response.user) {
            knownUsers.push(response.user);
          }
        } catch (error) {
          failedRows.push({
            rowNumber: entry.rowNumber,
            message: error.message,
          });
        }
      }

      if (importedRows.length) {
        await reloadDashboard();
      }

      const failureCount = failedRows.length;
      const successMessage =
        failureCount === 0
          ? `Import selesai. ${importedRows.length} akun marketing berhasil ditambahkan.`
          : "";
      const errorMessage =
        failureCount > 0
          ? `Import selesai sebagian. ${importedRows.length} berhasil, ${failureCount} gagal.`
          : "";

      setFeedback({
        error: errorMessage,
        success: successMessage,
      });
      setImportResult({
        totalRows: preview.totalRows,
        importedRows,
        failedRows,
      });
    } finally {
      setImporting(false);
    }
  }

  const templateHeaders =
    mode === "superadmin" ? SUPERADMIN_TEMPLATE_HEADERS : ADMIN_TEMPLATE_HEADERS;
  const visibleFailures = importResult?.failedRows?.slice(0, 6) || [];

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Import Marketing via CSV</h3>
          <p className="text-sm leading-6 text-slate-500">
            Unggah banyak akun marketing sekaligus memakai template CSV yang sudah disiapkan.
          </p>
        </div>

        <Button variant="secondary" className="px-4 py-2" onClick={handleDownloadTemplate}>
          Download Template CSV
        </Button>
      </div>

      <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Header Template
        </p>
        <p className="mt-2 break-all font-mono text-xs leading-6 text-slate-700">
          {templateHeaders.join(", ")}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Kolom wajib: <strong>name</strong>, <strong>username</strong>, <strong>email</strong>,{" "}
          <strong>password</strong>.
          {mode === "superadmin"
            ? " Tambahkan branchName + companyName atau langsung branchId untuk tiap baris."
            : " File akan otomatis masuk ke PT dan cabang admin yang sedang login."}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Kolom <strong>supervisorEmail</strong> atau <strong>supervisorUsername</strong>{" "}
          bersifat opsional, tetapi supervisor harus sudah ada di PT dan cabang yang sama.
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
        <Input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
        <Button
          className="px-5"
          onClick={handleImport}
          disabled={importing || !parsedFile}
        >
          {importing ? "Mengimpor..." : "Import CSV"}
        </Button>
      </div>

      {selectedFileName ? (
        <p className="mt-3 text-sm text-slate-500">File terpilih: {selectedFileName}</p>
      ) : null}

      {panelError ? (
        <div className="mt-4 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {panelError}
        </div>
      ) : null}

      {preview ? (
        <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Total Baris
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">{preview.totalRows}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Siap Import
              </p>
              <p className="mt-2 text-2xl font-black text-emerald-700">
                {preview.readyEntries.length}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                Perlu Diperbaiki
              </p>
              <p className="mt-2 text-2xl font-black text-amber-700">
                {preview.headerErrors.length + preview.validationErrors.length}
              </p>
            </div>
          </div>

          {preview.headerErrors.length ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {preview.headerErrors[0]}
            </div>
          ) : null}

          {preview.validationErrors.length ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">Contoh baris yang perlu diperbaiki:</p>
              <div className="space-y-2">
                {preview.validationErrors.slice(0, 5).map((errorItem) => (
                  <div
                    key={`${errorItem.rowNumber}-${errorItem.message}`}
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                  >
                    Baris {errorItem.rowNumber}: {errorItem.message}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {importResult ? (
        <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4">
          <h4 className="text-base font-bold text-slate-900">Hasil Import</h4>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {importResult.importedRows.length} akun berhasil ditambahkan dari {importResult.totalRows}{" "}
            baris data.
          </p>

          {visibleFailures.length ? (
            <div className="mt-4 space-y-2">
              {visibleFailures.map((failure) => (
                <div
                  key={`${failure.rowNumber}-${failure.message}`}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  Baris {failure.rowNumber}: {failure.message}
                </div>
              ))}
              {importResult.failedRows.length > visibleFailures.length ? (
                <p className="text-sm text-slate-500">
                  Masih ada {importResult.failedRows.length - visibleFailures.length} baris lain yang
                  gagal diproses.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Semua baris berhasil diimpor.
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-4 rounded-[24px] border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm leading-6 text-sky-800">
        Daftar jabatan yang didukung:{" "}
        {JOB_TITLE_OPTIONS.map((jobTitle) => escapeCsvCell(jobTitle)).join(", ")}
      </div>
    </Card>
  );
}
