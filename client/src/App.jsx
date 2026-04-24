import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/atoms/LoadingScreen";
import { useAuth } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import DashboardLayout from "./layouts/DashboardLayout";
import OverviewPage from "./pages/dashboard/OverviewPage";
import BranchPage from "./pages/dashboard/admin/BranchPage";
import TeamPage from "./pages/dashboard/admin/TeamPage";
import TeamCreatePage from "./pages/dashboard/admin/TeamCreatePage";
import TeamEditPage from "./pages/dashboard/admin/TeamEditPage";
import BranchCreatePage from "./pages/dashboard/superadmin/BranchCreatePage";
import BranchEditPage from "./pages/dashboard/superadmin/BranchEditPage";
import CertificatesPage from "./pages/dashboard/marketing/CertificatesPage";
import CertificateCreatePage from "./pages/dashboard/marketing/CertificateCreatePage";
import CertificateEditPage from "./pages/dashboard/marketing/CertificateEditPage";
import EcardsPage from "./pages/dashboard/marketing/EcardsPage";
import EcardCreatePage from "./pages/dashboard/marketing/EcardCreatePage";
import EcardEditPage from "./pages/dashboard/marketing/EcardEditPage";
import ProfilePage from "./pages/dashboard/marketing/ProfilePage";
import BranchesPage from "./pages/dashboard/superadmin/BranchesPage";
import MarketingPage from "./pages/dashboard/superadmin/MarketingPage";
import UserCreatePage from "./pages/dashboard/superadmin/UserCreatePage";
import UserEditPage from "./pages/dashboard/superadmin/UserEditPage";
import UsersPage from "./pages/dashboard/superadmin/UsersPage";
import LoginPage from "./pages/LoginPage";
import PublicEcardPage from "./pages/PublicEcardPage";

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
      <Route path="/:companySlug/:branchCode/:ecardSlug" element={<PublicEcardPage />} />
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
          path="branches/new"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <BranchCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="branches/:branchId/edit"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <BranchEditPage />
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
          path="users/new"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <UserCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="users/:userId/edit"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <UserEditPage />
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
          path="team/new"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TeamCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="team/:userId/edit"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TeamEditPage />
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
          path="certificates/new"
          element={
            <ProtectedRoute allowedRoles={["marketing"]}>
              <CertificateCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="certificates/:certificateId/edit"
          element={
            <ProtectedRoute allowedRoles={["marketing"]}>
              <CertificateEditPage />
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
        <Route
          path="ecards/new"
          element={
            <ProtectedRoute allowedRoles={["marketing"]}>
              <EcardCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="ecards/:ecardId/edit"
          element={
            <ProtectedRoute allowedRoles={["marketing"]}>
              <EcardEditPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
