import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { findMenuItemByPath, getRoleDashboardConfig } from "../../config/dashboardNavigation";
import Button from "../atoms/Button";

export default function DashboardTopbar({ user, onRefresh, onLogout }) {
  const location = useLocation();
  const [clock, setClock] = useState(() => new Date());
  const config = getRoleDashboardConfig(user?.role);
  const currentMenu = findMenuItemByPath(user?.role, location.pathname);

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{currentMenu?.label || config.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{config.subtitle}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-right text-sm font-semibold text-slate-700">
            {clock.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            })}
          </p>
          <p className="text-right text-sm text-slate-500">
            {clock.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </p>
          <Button variant="secondary" onClick={onRefresh}>
            Refresh
          </Button>
          <Button variant="ghost" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

