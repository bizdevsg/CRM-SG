import Card from "../atoms/Card";
import SystemSummaryItem from "../molecules/SystemSummaryItem";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth } from "../../context/AuthContext";

export default function SystemSummaryPanel() {
  const { user } = useAuth();
  const { dashboard } = useDashboard();

  const summaryItems = [
    {
      label: "Role",
      value: user?.role
    },
    {
      label: "Cabang",
      value: user?.branchName || "Semua cabang"
    },
    {
      label: "Total Statistik",
      value: Object.values(dashboard?.stats || {}).reduce((total, current) => {
        return total + Number(current || 0);
      }, 0)
    }
  ];

  return (
    <Card>
      <div className="border-b border-[color:var(--line)] px-6 py-5">
        <h2 className="text-xl font-bold text-[color:var(--ink)]">Ringkasan Sistem</h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
          Snapshot singkat workspace aktif Anda pada sesi ini.
        </p>
      </div>
      <div className="space-y-4 px-6 py-5">
        {summaryItems.map((item) => (
          <SystemSummaryItem key={item.label} {...item} />
        ))}
      </div>
    </Card>
  );
}
