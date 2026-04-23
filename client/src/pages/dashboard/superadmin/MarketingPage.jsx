import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";

export default function MarketingPage() {
  const { dashboard } = useDashboard();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Marketing</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Daftar seluruh marketing dari semua cabang.
        </p>
      </div>

      <ResourceListPanel
        title="Semua Marketing"
        items={dashboard?.marketingTeam || []}
        emptyText="Belum ada marketing."
        renderItem={(marketing) => (
          <ResourceRow>
            <strong className="text-base text-slate-900">{marketing.name}</strong>
            <span>{marketing.email}</span>
            <span>{marketing.branchName}</span>
          </ResourceRow>
        )}
      />
    </div>
  );
}

