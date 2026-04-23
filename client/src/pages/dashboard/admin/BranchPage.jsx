import Card from "../../../components/atoms/Card";
import { useDashboard } from "../../../context/DashboardContext";

export default function BranchPage() {
  const { dashboard } = useDashboard();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cabang Saya</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ringkasan performa cabang yang sedang Anda kelola.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-sky-50 to-white p-6">
        <h3 className="text-xl font-bold text-slate-900">Detail Cabang</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Nama Cabang
            </p>
            <p className="mt-2 text-base font-bold text-slate-900">{dashboard?.branch?.name}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Kode
            </p>
            <p className="mt-2 text-base font-bold text-slate-900">{dashboard?.branch?.code}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Total E-Card
            </p>
            <p className="mt-2 text-base font-bold text-slate-900">
              {dashboard?.stats?.totalEcards ?? 0}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

