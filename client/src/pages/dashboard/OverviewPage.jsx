import SummaryCardsGrid from "../../components/organisms/SummaryCardsGrid";
import QuickAccessPanel from "../../components/organisms/QuickAccessPanel";
import SystemSummaryPanel from "../../components/organisms/SystemSummaryPanel";
import { useDashboard } from "../../context/DashboardContext";

export default function OverviewPage() {
  const { summaryCards } = useDashboard();

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ringkasan utama menu dan resource yang tersedia di sidebar.
          </p>
        </div>
        <SummaryCardsGrid cards={summaryCards} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_340px]">
        <QuickAccessPanel />
        <SystemSummaryPanel />
      </div>
    </div>
  );
}

