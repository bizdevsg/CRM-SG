import { getRoleDashboardConfig } from "../../config/dashboardNavigation";
import Card from "../atoms/Card";
import QuickAccessItem from "../molecules/QuickAccessItem";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function QuickAccessPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const config = getRoleDashboardConfig(user?.role);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[color:var(--line)] px-6 py-5">
        <h2 className="text-xl font-bold text-[color:var(--ink)]">Akses Cepat</h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
          Lompat cepat ke menu yang paling sering dipakai tanpa keluar dari alur kerja.
        </p>
      </div>
      <div className="divide-y divide-[color:var(--line)]">
        {config.menu.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.to)}
            className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-white/70"
          >
            <QuickAccessItem item={item} />
            <span className="text-sm font-semibold text-[color:var(--teal-deep)]">Buka</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
