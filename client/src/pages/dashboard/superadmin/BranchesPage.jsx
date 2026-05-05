import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import Card from "../../../components/atoms/Card";
import { useDashboard } from "../../../context/DashboardContext";

function getCompanyChip(companyName) {
  const words = String(companyName || "")
    .replace(/[.]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => word.toLowerCase() !== "pt");

  if (!words.length) {
    return "PT";
  }

  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 6)
    .toUpperCase();
}

function getBranchGroups(branches) {
  const groupedBranches = new Map();

  (branches || []).forEach((branch) => {
    const groupKey = branch.companyName || "Tanpa PT";
    const currentGroup = groupedBranches.get(groupKey) || [];
    currentGroup.push(branch);
    groupedBranches.set(groupKey, currentGroup);
  });

  return Array.from(groupedBranches.entries()).map(
    ([companyName, companyBranches]) => ({
      companyName,
      companyChip: getCompanyChip(companyName),
      branches: companyBranches,
      totalBranches: companyBranches.length,
      totalAdmins: companyBranches.reduce(
        (sum, branch) => sum + Number(branch.adminCount || 0),
        0,
      ),
      totalMarketing: companyBranches.reduce(
        (sum, branch) => sum + Number(branch.marketingCount || 0),
        0,
      ),
      totalEcards: companyBranches.reduce(
        (sum, branch) => sum + Number(branch.ecardCount || 0),
        0,
      ),
    }),
  );
}

function BranchCard({ branch, onEdit, onDelete, companyChip }) {
  return (
    <article className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex h-full flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold uppercase tracking-[-0.02em] text-slate-900 sm:text-xl">
            {branch.name}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-slate-600">
            {branch.address || "-"}
          </p>
        </div>

        <div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-3 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(245,158,11,0.22)] transition hover:brightness-95"
              onClick={onEdit}
            >
              Edit
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-3 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(244,63,94,0.22)] transition hover:brightness-95"
              onClick={onDelete}
            >
              Hapus
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
              <span className="block h-4 w-4 rounded-full bg-white shadow-sm" />
              Marketing {branch.marketingCount}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-200 px-3 py-2 text-xs font-semibold text-green-800">
              <span className="block h-4 w-4 rounded-full bg-green-400 shadow-sm" />
              Admin {branch.adminCount}
            </div>
            <div className="inline-flex items-center rounded-full bg-blue-500 px-4 py-2 text-xs font-bold text-white">
              {companyChip} - E-Card {branch.ecardCount}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function BranchesPage() {
  const { dashboard, deleteBranch } = useDashboard();
  const navigate = useNavigate();
  const branchGroups = useMemo(
    () => getBranchGroups(dashboard?.branches || []),
    [dashboard?.branches],
  );
  const [activeCompanyName, setActiveCompanyName] = useState("");

  useEffect(() => {
    if (!branchGroups.length) {
      setActiveCompanyName("");
      return;
    }

    const hasActiveGroup = branchGroups.some(
      (group) => group.companyName === activeCompanyName,
    );

    if (!hasActiveGroup) {
      setActiveCompanyName(branchGroups[0].companyName);
    }
  }, [activeCompanyName, branchGroups]);

  const activeGroup =
    branchGroups.find((group) => group.companyName === activeCompanyName) ||
    branchGroups[0] ||
    null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Cabang</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Halaman index cabang dengan tampilan per PT dan kartu cabang yang
            lebih ringkas.
          </p>
        </div>

        <Button
          className="w-full px-4 py-2 sm:w-auto"
          onClick={() => navigate("/dashboard/branches/new")}
        >
          Tambah Cabang
        </Button>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-slate-100/80 p-2 shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
        {!branchGroups.length ? (
          <p className="rounded-[18px] bg-white px-6 py-6 text-sm leading-6 text-slate-500">
            Belum ada cabang.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[26px] bg-slate-50 p-2 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {branchGroups.map((group) => {
                  const isActive = group.companyName === activeGroup?.companyName;

                  return (
                    <button
                      key={group.companyName}
                      type="button"
                      className={`min-h-[60px] min-w-[220px] rounded-[16px] px-5 py-3 text-center text-sm font-semibold leading-5 transition sm:min-w-[250px] lg:min-w-0 lg:flex-1 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]"
                          : "bg-slate-200/70 text-slate-700 hover:bg-slate-200"
                      }`}
                      onClick={() => setActiveCompanyName(group.companyName)}
                    >
                      {group.companyName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[22px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:p-5">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                    {activeGroup?.companyName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeGroup?.totalBranches || 0} cabang terdaftar untuk PT
                    ini.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-center text-xs font-semibold text-slate-700">
                    Cabang: {activeGroup?.totalBranches || 0}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-center text-xs font-semibold text-emerald-700">
                    Admin: {activeGroup?.totalAdmins || 0}
                  </span>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-center text-xs font-semibold text-sky-700">
                    Marketing: {activeGroup?.totalMarketing || 0}
                  </span>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-center text-xs font-semibold text-white">
                    E-Card: {activeGroup?.totalEcards || 0}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {activeGroup?.branches.map((branch) => (
                  <BranchCard
                    key={branch.id}
                    branch={branch}
                    companyChip={activeGroup.companyChip}
                    onEdit={() =>
                      navigate(`/dashboard/branches/${branch.id}/edit`)
                    }
                    onDelete={() => deleteBranch(branch.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
