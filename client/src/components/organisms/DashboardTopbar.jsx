import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  findMenuItemByPath,
  getRoleDashboardConfig,
} from "../../config/dashboardNavigation";
import Button from "../atoms/Button";
import Icon from "../atoms/Icon";

function resolveHeaderContent(pathname, currentMenu, fallbackTitle, fallbackSubtitle) {
  if (pathname === "/dashboard/users/new") {
    return {
      title: "Tambah Admin",
      subtitle: "Buat akun admin cabang baru untuk PT dan cabang tertentu."
    };
  }

  if (pathname === "/dashboard/marketing/new") {
    return {
      title: "Tambah Marketing",
      subtitle: "Buat akun marketing baru untuk PT dan cabang tertentu."
    };
  }

  if (/^\/dashboard\/users\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: "Edit User",
      subtitle: "Perbarui data akun admin cabang atau marketing yang sudah terdaftar."
    };
  }

  return {
    title: currentMenu?.label || fallbackTitle,
    subtitle: fallbackSubtitle
  };
}

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
  const headerContent = resolveHeaderContent(
    location.pathname,
    currentMenu,
    config.title,
    config.subtitle
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[rgba(255,255,255,0.82)] px-5 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-start gap-3">
          <Button
            variant="secondary"
            className="px-3 py-3 lg:hidden"
            onClick={onOpenSidebar}
            aria-label="Buka sidebar"
          >
            <Icon name="menu" className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--teal)] md:hidden">
              Workspace
            </p>
            <h1 className="text-2xl font-black tracking-[-0.03em] text-[color:var(--ink)]">
              {headerContent.title}
            </h1>
            <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-[color:var(--ink-soft)] md:block">
              {headerContent.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-[color:var(--line)] bg-white/90 px-4 py-2 text-right shadow-[0_10px_30px_rgba(16,32,51,0.05)] md:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
              Live
            </p>
            <p className="mt-1 text-sm font-bold text-[color:var(--ink)]">
              {clock.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>
          <Button variant="ghost" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
