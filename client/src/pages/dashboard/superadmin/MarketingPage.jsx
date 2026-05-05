import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import Card from "../../../components/atoms/Card";
import { useDashboard } from "../../../context/DashboardContext";

const EMPTY_COMPANY_LABEL = "Belum ada data";

function createMarketingGroup(companyName, members) {
  const branches = new Set(
    members.map((member) => member.branchName).filter(Boolean),
  );

  return {
    companyName,
    members,
    totalMarketing: members.length,
    activeMarketing: members.filter((member) => member.isActive).length,
    inactiveMarketing: members.filter((member) => !member.isActive).length,
    totalBranches: branches.size,
    totalCertificates: members.reduce(
      (sum, member) => sum + Number(member.certificateCount || 0),
      0,
    ),
    totalEcards: members.reduce(
      (sum, member) => sum + Number(member.ecardCount || 0),
      0,
    ),
  };
}

function getMarketingGroups(marketingTeam, companies) {
  const marketingBuckets = new Map();

  (marketingTeam || []).forEach((member) => {
    const companyId = String(member.companyId || "").trim();
    const companyName =
      String(member.companyName || "").trim() || EMPTY_COMPANY_LABEL;
    const groupKey = companyId || companyName;
    const currentGroup = marketingBuckets.get(groupKey) || {
      companyId,
      companyName,
      members: [],
    };

    currentGroup.members.push(member);
    marketingBuckets.set(groupKey, currentGroup);
  });

  const seededGroups = (companies || []).map((company) => {
    const companyId = String(company.id || "").trim();
    const companyName =
      String(company.name || "").trim() || EMPTY_COMPANY_LABEL;
    const bucket =
      marketingBuckets.get(companyId) || marketingBuckets.get(companyName);

    if (bucket) {
      marketingBuckets.delete(companyId);
      marketingBuckets.delete(companyName);
    }

    return createMarketingGroup(companyName, bucket?.members || []);
  });

  const remainingGroups = Array.from(marketingBuckets.values()).map((bucket) =>
    createMarketingGroup(bucket.companyName, bucket.members),
  );

  return [...seededGroups, ...remainingGroups];
}

function MarketingCard({ marketing, onEdit, onDelete }) {
  return (
    <article className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-lg font-semibold uppercase tracking-[-0.02em] text-slate-900 sm:text-xl">
            {marketing.name}
          </h3>
          <p className="mt-2 truncate text-sm text-slate-600">
            {marketing.email}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-semibold ${
            marketing.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          <span className="block h-2 w-2 rounded-full bg-green-400 shadow-sm" />
          {marketing.isActive ? "Aktif" : "Non Aktif"}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <p className="font-medium text-slate-700">{marketing.branchName || "-"}</p>
        <p className="text-slate-500">
          {marketing.supervisorName || "Tanpa atasan"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(marketing.ecardJobTitle || marketing.positionTitle) ? (
          <span className="rounded-full bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
            {marketing.ecardJobTitle || marketing.positionTitle}
          </span>
        ) : null}
        <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">
          Sertifikat: {marketing.certificateCount ?? 0}
        </span>
        <span className="rounded-full bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-700">
          E-Card: {marketing.ecardCount ?? 0}
        </span>
      </div>

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
    </article>
  );
}

export default function MarketingPage() {
  const { dashboard, deleteManagedUser } = useDashboard();
  const navigate = useNavigate();
  const marketingTeam = dashboard?.marketingTeam || [];
  const companies = dashboard?.companies || [];
  const marketingGroups = useMemo(
    () => getMarketingGroups(marketingTeam, companies),
    [marketingTeam, companies],
  );
  const [activeCompanyName, setActiveCompanyName] = useState("");

  useEffect(() => {
    if (!marketingGroups.length) {
      setActiveCompanyName("");
      return;
    }

    const hasActiveGroup = marketingGroups.some(
      (group) => group.companyName === activeCompanyName,
    );

    if (!hasActiveGroup) {
      setActiveCompanyName(marketingGroups[0].companyName);
    }
  }, [activeCompanyName, marketingGroups]);

  const activeGroup =
    marketingGroups.find((group) => group.companyName === activeCompanyName) ||
    marketingGroups[0] ||
    null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Marketing</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Daftar marketing dengan tampilan per PT agar lebih cepat melihat
            persebaran tim di tiap cabang.
          </p>
        </div>

        <Button
          className="w-full px-4 py-2 sm:w-auto"
          onClick={() => navigate("/dashboard/marketing/new")}
        >
          Tambah Marketing
        </Button>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-slate-100/80 p-2 shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
        {!marketingGroups.length ? (
          <p className="rounded-[18px] bg-white px-6 py-6 text-sm leading-6 text-slate-500">
            Belum ada data.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[26px] bg-slate-50 p-2 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {marketingGroups.map((group) => {
                  const isActive =
                    group.companyName === activeGroup?.companyName;

                  return (
                    <button
                      key={group.companyName}
                      type="button"
                      className={`min-h-[60px] min-w-[220px] rounded-[16px] px-5 py-3 text-center text-sm font-semibold leading-5 transition sm:min-w-[250px] lg:min-w-0 lg:flex-1 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)]"
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
                    {activeGroup?.totalMarketing || 0} marketing terdaftar untuk
                    company ini.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-center text-xs font-semibold text-slate-700">
                    Cabang: {activeGroup?.totalBranches || 0}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-center text-xs font-semibold text-emerald-700">
                    Aktif: {activeGroup?.activeMarketing || 0}
                  </span>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-center text-xs font-semibold text-rose-700">
                    Non Aktif: {activeGroup?.inactiveMarketing || 0}
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-center text-xs font-semibold text-amber-700">
                    Sertifikat: {activeGroup?.totalCertificates || 0}
                  </span>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-center text-xs font-semibold text-white">
                    E-Card: {activeGroup?.totalEcards || 0}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {activeGroup?.members.length ? (
                  activeGroup.members.map((marketing) => (
                    <MarketingCard
                      key={marketing.id}
                      marketing={marketing}
                      onEdit={() =>
                        navigate(`/dashboard/marketing/${marketing.id}/edit`)
                      }
                      onDelete={() => deleteManagedUser(marketing.id)}
                    />
                  ))
                ) : (
                  <p className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-sm text-slate-500 xl:col-span-2">
                    Belum ada data.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
