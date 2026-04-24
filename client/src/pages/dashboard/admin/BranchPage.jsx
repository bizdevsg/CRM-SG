import Card from "../../../components/atoms/Card";
import { useDashboard } from "../../../context/DashboardContext";

export default function BranchPage() {
  const { dashboard } = useDashboard();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cabang Saya</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ringkasan detail cabang, PT, dan performa resource marketing yang Anda kelola.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-sky-50 to-white p-6">
        <h3 className="text-xl font-bold text-slate-900">Detail Cabang</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Perusahaan
            </p>
            <p className="mt-2 text-base font-bold text-slate-900">{dashboard?.branch?.companyName}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Nama Cabang
            </p>
            <p className="mt-2 text-base font-bold text-slate-900">{dashboard?.branch?.name}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Kode Cabang
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

        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Alamat Cabang
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{dashboard?.branch?.address}</p>
        </div>
      </Card>
    </div>
  );
}
