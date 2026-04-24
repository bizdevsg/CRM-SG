import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  findMenuItemByPath,
  getRoleDashboardConfig,
} from "../../config/dashboardNavigation";
import Button from "../atoms/Button";
import Icon from "../atoms/Icon";

export default function DashboardTopbar({
  user,
  onRefresh,
  onLogout,
  onOpenSidebar,
}) {
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
    <header className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[rgba(251,247,239,0.86)] px-5 py-3.5 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex gap-5 items-center justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="secondary"
            className="px-3 py-3 lg:hidden"
            onClick={onOpenSidebar}
            aria-label="Buka sidebar"
          >
            <Icon name="menu" className="h-5 w-5" />
          </Button>
          <div className="hidden md:block">
            <h1 className="text-2xl font-black tracking-[-0.03em] text-[color:var(--ink)]">
              {currentMenu?.label || config.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--ink-soft)]">
              {config.subtitle}
            </p>
          </div>
        </div>

        <Button variant="ghost" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
