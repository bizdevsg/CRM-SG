import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/atoms/LoadingScreen";
import { useAuth } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import DashboardLayout from "./layouts/DashboardLayout";
import OverviewPage from "./pages/dashboard/OverviewPage";
import BranchPage from "./pages/dashboard/admin/BranchPage";
import TeamPage from "./pages/dashboard/admin/TeamPage";
import CertificatesPage from "./pages/dashboard/marketing/CertificatesPage";
import EcardsPage from "./pages/dashboard/marketing/EcardsPage";
import ProfilePage from "./pages/dashboard/marketing/ProfilePage";
import BranchesPage from "./pages/dashboard/superadmin/BranchesPage";
import MarketingPage from "./pages/dashboard/superadmin/MarketingPage";
import UsersPage from "./pages/dashboard/superadmin/UsersPage";
import LoginPage from "./pages/LoginPage";

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Memuat sesi..." tone="dark" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardProvider>
              <DashboardLayout />
            </DashboardProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route
          path="branches"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <BranchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="marketing"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <MarketingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="branch"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BranchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="team"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TeamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute allowedRoles={["marketing"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="certificates"
          element={
            <ProtectedRoute allowedRoles={["marketing"]}>
              <CertificatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="ecards"
          element={
            <ProtectedRoute allowedRoles={["marketing"]}>
              <EcardsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
