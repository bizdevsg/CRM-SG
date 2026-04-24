import SummaryCardsGrid from "../../components/organisms/SummaryCardsGrid";
import QuickAccessPanel from "../../components/organisms/QuickAccessPanel";
import SystemSummaryPanel from "../../components/organisms/SystemSummaryPanel";
import { useDashboard } from "../../context/DashboardContext";

export default function OverviewPage() {
  const { summaryCards } = useDashboard();

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,252,246,0.85),rgba(255,245,231,0.92))] p-6 shadow-[0_24px_60px_rgba(107,80,35,0.09)]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_320px] xl:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--teal-deep)]">
              Dashboard Overview
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[color:var(--ink)]">
              Workspace e-card yang lebih rapi, cepat, dan enak dipakai tiap hari.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--ink-soft)]">
              Semua menu inti tetap ada di sidebar, tapi pengalaman visualnya sekarang lebih hangat,
              fokus, dan terasa lebih profesional untuk pengelolaan PT, cabang, marketing, serta QR e-card.
            </p>
          </div>
          <div className="rounded-[28px] border border-[color:var(--line)] bg-white/75 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--ink-soft)]">
              Fokus Hari Ini
            </p>
            <p className="mt-3 text-lg font-bold text-[color:var(--ink)]">
              Pantau resource utama dan lanjutkan pekerjaan dari sidebar tanpa pindah konteks.
            </p>
          </div>
        </div>
      </section>

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
