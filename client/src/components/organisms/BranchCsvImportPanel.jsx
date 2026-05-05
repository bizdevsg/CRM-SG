import { useMemo, useState } from "react";
import Button from "../atoms/Button";
import Card from "../atoms/Card";
import Input from "../atoms/Input";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../context/DashboardContext";
import { apiFetch } from "../../services/api";

const HEADER_NAME_BY_KEY = {
  companyid: "companyId",
  companyname: "companyName",
  perusahaan: "companyName",
  branchname: "name",
  cabang: "name",
  name: "name",
  nama: "name",
  address: "address",
  alamat: "address",
};

const TEMPLATE_HEADERS = ["companyName", "name", "address"];

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

function parseCsvLineWithDelimiter(line, delimiter) {
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

    if (character === delimiter && !insideQuotes) {
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

function tryUnwrapSingleQuotedCell(line) {
  const value = String(line || "");

  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/""/g, '"');
  }

  return value;
}

function parseCsvLine(line, delimiter) {
  const parsedCells = parseCsvLineWithDelimiter(line, delimiter);

  if (parsedCells.length === 1) {
    const unwrappedLine = tryUnwrapSingleQuotedCell(line);

    if (unwrappedLine !== line && unwrappedLine.includes(delimiter)) {
      return parseCsvLineWithDelimiter(unwrappedLine, delimiter);
    }
  }

  return parsedCells;
}

function detectCsvDelimiter(line) {
  const candidates = [",", ";", "\t"];
  let selectedDelimiter = ",";
  let highestCellCount = 0;

  candidates.forEach((delimiter) => {
    const cells = parseCsvLine(line, delimiter);

    if (cells.length > highestCellCount) {
      highestCellCount = cells.length;
      selectedDelimiter = delimiter;
    }
  });

  return selectedDelimiter;
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

  const delimiter = detectCsvDelimiter(meaningfulLines[0]);
  const rawHeaders = parseCsvLine(meaningfulLines[0], delimiter).map((header) =>
    canonicalizeHeader(header)
  );

  const rows = meaningfulLines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line, delimiter);
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

function escapeCsvCell(value) {
  const stringValue = String(value || "");

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function buildTemplateCsv(companies) {
  const sampleCompanyName = companies?.[0]?.name || "PT Contoh";
  const sampleValues = [sampleCompanyName, "Cabang Bandung", "Jl. Asia Afrika No. 10, Bandung"];

  return `${TEMPLATE_HEADERS.join(",")}\n${sampleValues.map(escapeCsvCell).join(",")}\n`;
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

function buildImportPreview({ parsedFile, companies, branches }) {
  if (!parsedFile) {
    return null;
  }

  const headers = parsedFile.headers || [];
  const headerSet = new Set(headers);
  const headerErrors = [];
  const validationErrors = [];
  const readyEntries = [];
  const seenBranchKeys = new Map();

  ["name", "address"].forEach((header) => {
    if (!headerSet.has(header)) {
      headerErrors.push(`Kolom \`${header}\` wajib ada pada file CSV.`);
    }
  });

  if (!headerSet.has("companyId") && !headerSet.has("companyName")) {
    headerErrors.push("Kolom `companyId` atau `companyName` wajib ada pada file CSV.");
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
    const address = rowValues.address || "";
    const resolvedCompany = findCompany(companies, rowValues.companyId, rowValues.companyName);

    if (!name || !address) {
      rowErrors.push("Nama cabang dan alamat wajib diisi.");
    }

    if (!resolvedCompany) {
      rowErrors.push("Perusahaan tidak ditemukan.");
    }

    const branchKey = resolvedCompany
      ? `${resolvedCompany.id}:${normalizeLookup(name)}`
      : `unknown:${normalizeLookup(name)}`;

    if (resolvedCompany) {
      const existingBranch = (branches || []).find(
        (branch) =>
          String(branch.companyId) === String(resolvedCompany.id) &&
          normalizeLookup(branch.name) === normalizeLookup(name)
      );

      if (existingBranch) {
        rowErrors.push("Cabang dengan nama yang sama pada PT ini sudah ada.");
      }
    }

    if (seenBranchKeys.has(branchKey)) {
      rowErrors.push(`Cabang duplikat dengan baris ${seenBranchKeys.get(branchKey)}.`);
    } else {
      seenBranchKeys.set(branchKey, row.rowNumber);
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
        companyId: Number(resolvedCompany.id),
        name,
        address,
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

export default function BranchCsvImportPanel({
  companies,
  branches,
  onImportSuccess = null,
}) {
  const { token } = useAuth();
  const { reloadDashboard, setFeedback } = useDashboard();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [parsedFile, setParsedFile] = useState(null);
  const [panelError, setPanelError] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);

  const preview = useMemo(
    () =>
      buildImportPreview({
        parsedFile,
        companies,
        branches,
      }),
    [parsedFile, companies, branches]
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
    const csvContent = buildTemplateCsv(companies);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = downloadUrl;
    anchor.download = "template-import-cabang.csv";
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

    const importedRows = [];
    const failedRows = [...preview.validationErrors];

    try {
      for (const entry of preview.readyEntries) {
        try {
          await apiFetch("/management/branches", {
            method: "POST",
            token,
            body: entry.payload,
          });

          importedRows.push({
            rowNumber: entry.rowNumber,
            name: entry.payload.name,
          });
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

      setFeedback({
        error:
          failureCount > 0
            ? `Import selesai sebagian. ${importedRows.length} berhasil, ${failureCount} gagal.`
            : "",
        success:
          failureCount === 0
            ? `Import selesai. ${importedRows.length} cabang berhasil ditambahkan.`
            : "",
      });
      setImportResult({
        totalRows: preview.totalRows,
        importedRows,
        failedRows,
      });

      if (importedRows.length && failureCount === 0 && onImportSuccess) {
        onImportSuccess({
          totalRows: preview.totalRows,
          importedRows,
          failedRows,
        });
      }
    } finally {
      setImporting(false);
    }
  }

  const visibleFailures = importResult?.failedRows?.slice(0, 6) || [];

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Import Cabang via CSV</h3>
          <p className="text-sm leading-6 text-slate-500">
            Unggah banyak cabang sekaligus, lalu sistem akan membuatkannya ke PT yang sesuai.
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
          {TEMPLATE_HEADERS.join(", ")}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Kolom wajib: <strong>companyName</strong> atau <strong>companyId</strong>,{" "}
          <strong>name</strong>, dan <strong>address</strong>.
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
        <Input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
        <Button className="px-5" onClick={handleImport} disabled={importing || !parsedFile}>
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
              <p className="text-sm font-semibold text-slate-700">
                Contoh baris yang perlu diperbaiki:
              </p>
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
            {importResult.importedRows.length} cabang berhasil ditambahkan dari {importResult.totalRows}{" "}
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
    </Card>
  );
}
