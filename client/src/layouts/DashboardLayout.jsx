import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SidebarNavigation from "../components/organisms/SidebarNavigation";
import DashboardTopbar from "../components/organisms/DashboardTopbar";
import StatusAlert from "../components/atoms/StatusAlert";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../context/DashboardContext";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { feedback, reloadDashboard } = useDashboard();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-transparent text-[color:var(--ink)]">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(22,105,122,0.14),transparent_60%)]" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.16),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.09),transparent_68%)] blur-3xl" />
      </div>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <SidebarNavigation
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="relative min-w-0 flex-1">
          <DashboardTopbar
            user={user}
            onRefresh={reloadDashboard}
            onLogout={handleLogout}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          <div className="space-y-8 px-5 py-5 sm:px-6 lg:px-8 lg:py-8">
            <StatusAlert error={feedback.error} success={feedback.success} />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
