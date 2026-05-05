import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import Card from "../../../components/atoms/Card";
import { useDashboard } from "../../../context/DashboardContext";

const EMPTY_COMPANY_LABEL = "Belum ada data";

function createAdminGroup(companyName, admins) {
  const branches = new Set(
    admins.map((admin) => admin.branchName).filter(Boolean),
  );

  return {
    companyName,
    admins,
    totalAdmins: admins.length,
    activeAdmins: admins.filter((admin) => admin.isActive).length,
    inactiveAdmins: admins.filter((admin) => !admin.isActive).length,
    totalBranches: branches.size,
  };
}

function getAdminGroups(admins, companies) {
  const adminBuckets = new Map();

  (admins || []).forEach((admin) => {
    const companyId = String(admin.companyId || "").trim();
    const companyName =
      String(admin.companyName || "").trim() || EMPTY_COMPANY_LABEL;
    const groupKey = companyId || companyName;
    const currentGroup = adminBuckets.get(groupKey) || {
      companyId,
      companyName,
      admins: [],
    };

    currentGroup.admins.push(admin);
    adminBuckets.set(groupKey, currentGroup);
  });

  const seededGroups = (companies || []).map((company) => {
    const companyId = String(company.id || "").trim();
    const companyName =
      String(company.name || "").trim() || EMPTY_COMPANY_LABEL;
    const bucket = adminBuckets.get(companyId) || adminBuckets.get(companyName);

    if (bucket) {
      adminBuckets.delete(companyId);
      adminBuckets.delete(companyName);
    }

    return createAdminGroup(companyName, bucket?.admins || []);
  });

  const remainingGroups = Array.from(adminBuckets.values()).map((bucket) =>
    createAdminGroup(bucket.companyName, bucket.admins),
  );

  return [...seededGroups, ...remainingGroups];
}

function AdminCard({ admin, onEdit, onDelete }) {
  return (
    <article className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-lg font-semibold uppercase tracking-[-0.02em] text-slate-900 sm:text-xl">
            {admin.name}
          </h3>
          <p className="mt-2 truncate text-sm text-slate-600">
            {admin.email}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-semibold ${
            admin.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          <span className="block h-2 w-2 rounded-full bg-green-400 shadow-sm" />
          {admin.isActive ? "Aktif" : "Non Aktif"}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <p className="font-medium text-slate-700">{admin.branchName || "-"}</p>
        <p className="text-slate-500">{admin.supervisorName || "Tanpa atasan"}</p>
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

export default function UsersPage() {
  const { dashboard, deleteManagedUser } = useDashboard();
  const navigate = useNavigate();
  const admins = dashboard?.admins || [];
  const companies = dashboard?.companies || [];
  const adminGroups = useMemo(
    () => getAdminGroups(admins, companies),
    [admins, companies],
  );
  const [activeCompanyName, setActiveCompanyName] = useState("");

  useEffect(() => {
    if (!adminGroups.length) {
      setActiveCompanyName("");
      return;
    }

    const hasActiveGroup = adminGroups.some(
      (group) => group.companyName === activeCompanyName,
    );

    if (!hasActiveGroup) {
      setActiveCompanyName(adminGroups[0].companyName);
    }
  }, [activeCompanyName, adminGroups]);

  const activeGroup =
    adminGroups.find((group) => group.companyName === activeCompanyName) ||
    adminGroups[0] ||
    null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Cabang</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Daftar admin cabang dengan tampilan per PT agar lebih cepat melihat
            persebaran admin di tiap cabang.
          </p>
        </div>

        <Button
          className="w-full px-4 py-2 sm:w-auto"
          onClick={() => navigate("/dashboard/users/new")}
        >
          Tambah Admin
        </Button>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-slate-100/80 p-2 shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
        {!adminGroups.length ? (
          <p className="rounded-[18px] bg-white px-6 py-6 text-sm leading-6 text-slate-500">
            Belum ada data.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[26px] bg-slate-50 p-2 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {adminGroups.map((group) => {
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
                    {activeGroup?.totalAdmins || 0} admin terdaftar untuk
                    company ini.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-center text-xs font-semibold text-slate-700">
                    Cabang: {activeGroup?.totalBranches || 0}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-center text-xs font-semibold text-emerald-700">
                    Aktif: {activeGroup?.activeAdmins || 0}
                  </span>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-center text-xs font-semibold text-rose-700">
                    Non Aktif: {activeGroup?.inactiveAdmins || 0}
                  </span>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-center text-xs font-semibold text-white">
                    Total Admin: {activeGroup?.totalAdmins || 0}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {activeGroup?.admins.length ? (
                  activeGroup.admins.map((admin) => (
                    <AdminCard
                      key={admin.id}
                      admin={admin}
                      onEdit={() =>
                        navigate(`/dashboard/users/${admin.id}/edit`)
                      }
                      onDelete={() => deleteManagedUser(admin.id)}
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
