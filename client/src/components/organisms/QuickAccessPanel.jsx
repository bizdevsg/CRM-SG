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
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-bold text-slate-900">Akses Cepat</h2>
      </div>
      <div className="divide-y divide-slate-200">
        {config.menu.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.to)}
            className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50"
          >
            <QuickAccessItem item={item} />
            <span className="text-sm font-medium text-slate-500">Buka</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

