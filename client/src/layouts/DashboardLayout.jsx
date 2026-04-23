import { Outlet, useNavigate } from "react-router-dom";
import SidebarNavigation from "../components/organisms/SidebarNavigation";
import DashboardTopbar from "../components/organisms/DashboardTopbar";
import StatusAlert from "../components/atoms/StatusAlert";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../context/DashboardContext";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { feedback, reloadDashboard } = useDashboard();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <SidebarNavigation user={user} />

        <main className="min-w-0 flex-1">
          <DashboardTopbar user={user} onRefresh={reloadDashboard} onLogout={handleLogout} />

          <div className="space-y-8 px-6 py-6 lg:px-8">
            <StatusAlert error={feedback.error} success={feedback.success} />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

