import SummaryCardsGrid from "../../components/organisms/SummaryCardsGrid";
import QuickAccessPanel from "../../components/organisms/QuickAccessPanel";
import SystemSummaryPanel from "../../components/organisms/SystemSummaryPanel";
import { useDashboard } from "../../context/DashboardContext";

export default function OverviewPage() {
  const { summaryCards } = useDashboard();

  return (
    <div className="space-y-8">
      {/* <section className="relative overflow-hidden rounded-[34px] border border-[color:var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(16,32,51,0.06)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(47,111,237,0.12),transparent_70%)]" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_320px] xl:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--teal)]">
              Dashboard Overview
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[color:var(--ink)]">
              Workspace e-card yang kini lebih terang, tajam, dan nyaman dipakai.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--ink-soft)]">
              Semua halaman sekarang memakai fondasi putih yang lebih bersih, dengan aksen visual yang ringan
              agar fokus tetap ke data, aksi cepat, dan pengelolaan e-card sehari-hari.
            </p>
          </div>
          <div className="rounded-[28px] border border-[color:var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--ink-soft)]">
              Fokus Hari Ini
            </p>
            <p className="mt-3 text-lg font-bold text-[color:var(--ink)]">
              Pantau resource utama dan lanjutkan pekerjaan tanpa terdistraksi warna latar yang berat.
            </p>
          </div>
        </div>
      </section> */}

      <section>
        <SummaryCardsGrid cards={summaryCards} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_340px]">
        <QuickAccessPanel />
        <SystemSummaryPanel />
      </div>
    </div>
  );
}
