import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../services/api";

const DashboardContext = createContext(null);

function buildSummaryCards(role, dashboard) {
  const stats = dashboard?.stats || {};

  if (role === "superadmin") {
    return [
      {
        label: "Perusahaan",
        value: stats.totalCompanies ?? 0,
        description: "Total PT yang terdaftar pada platform e-card.",
        icon: "branch",
        tint: "bg-sky-50 text-sky-600"
      },
      {
        label: "Cabang",
        value: stats.totalBranches ?? 0,
        description: "Jumlah cabang aktif lintas seluruh perusahaan.",
        icon: "branch",
        tint: "bg-amber-50 text-amber-600"
      },
      {
        label: "Admin Cabang",
        value: stats.totalAdmins ?? 0,
        description: "Admin cabang yang mengelola marketing pada tiap PT.",
        icon: "shield",
        tint: "bg-emerald-50 text-emerald-600"
      },
      {
        label: "Marketing",
        value: stats.totalMarketing ?? 0,
        description: "Total akun marketing yang siap membuat e-card.",
        icon: "users",
        tint: "bg-fuchsia-50 text-fuchsia-600"
      }
    ];
  }

  if (role === "admin") {
    return [
      {
        label: "Marketing",
        value: stats.totalMarketing ?? 0,
        description: "Jumlah marketing aktif pada cabang yang Anda kelola.",
        icon: "users",
        tint: "bg-sky-50 text-sky-600"
      },
      {
        label: "Sertifikat",
        value: stats.totalCertificates ?? 0,
        description: "Sertifikat yang dimiliki tim marketing cabang Anda.",
        icon: "certificate",
        tint: "bg-amber-50 text-amber-600"
      },
      {
        label: "E-Card",
        value: stats.totalEcards ?? 0,
        description: "QR e-card yang sudah dibuat oleh tim marketing cabang.",
        icon: "qr",
        tint: "bg-emerald-50 text-emerald-600"
      }
    ];
  }

  return [
    {
      label: "Biodata",
      value: stats.biodataCount ?? 0,
      description: "Jumlah data profil utama yang sudah terisi.",
      icon: "profile",
      tint: "bg-sky-50 text-sky-600"
    },
    {
      label: "Social Media",
      value: stats.socialMediaCount ?? 0,
      description: "Akun social media yang siap tampil pada e-card.",
      icon: "link",
      tint: "bg-amber-50 text-amber-600"
    },
    {
      label: "Sertifikat",
      value: stats.certificateCount ?? 0,
      description: "Sertifikat milik Anda yang sudah tersimpan.",
      icon: "certificate",
      tint: "bg-emerald-50 text-emerald-600"
    },
    {
      label: "E-Card",
      value: stats.ecardCount ?? 0,
      description: "QR code e-card yang sudah berhasil dibuat.",
      icon: "qr",
      tint: "bg-fuchsia-50 text-fuchsia-600"
    }
  ];
}

export function DashboardProvider({ children }) {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  async function loadDashboard() {
    if (!token) {
      setDashboard(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch("/users/dashboard-data", { token });
      setDashboard(response.dashboard);
    } catch (error) {
      setFeedback({
        error: error.message,
        success: ""
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [token]);

  async function runAction(action, successMessage) {
    setFeedback({ error: "", success: "" });

    try {
      await action();
      await loadDashboard();
      setFeedback({ error: "", success: successMessage });
      return true;
    } catch (error) {
      setFeedback({ error: error.message, success: "" });
      return false;
    }
  }

  const value = useMemo(
    () => ({
      dashboard,
      loading,
      feedback,
      setFeedback,
      clearFeedback: () => setFeedback({ error: "", success: "" }),
      reloadDashboard: loadDashboard,
      summaryCards: buildSummaryCards(user?.role, dashboard),
      createBranch: (payload) =>
        runAction(
          () =>
            apiFetch("/management/branches", {
              method: "POST",
              token,
              body: payload
            }),
          "Cabang baru berhasil ditambahkan."
        ),
      updateBranch: (branchId, payload) =>
        runAction(
          () =>
            apiFetch(`/management/branches/${branchId}`, {
              method: "PUT",
              token,
              body: payload
            }),
          "Cabang berhasil diperbarui."
        ),
      deleteBranch: (branchId) =>
        runAction(
          () =>
            apiFetch(`/management/branches/${branchId}`, {
              method: "DELETE",
              token
            }),
          "Cabang berhasil dihapus."
        ),
      createManagedUser: (payload) =>
        runAction(
          () =>
            apiFetch("/management/users", {
              method: "POST",
              token,
              body: payload
            }),
          "Akun baru berhasil dibuat."
        ),
      updateManagedUser: (userId, payload) =>
        runAction(
          () =>
            apiFetch(`/management/users/${userId}`, {
              method: "PUT",
              token,
              body: payload
            }),
          "Akun berhasil diperbarui."
        ),
      deleteManagedUser: (userId) =>
        runAction(
          () =>
            apiFetch(`/management/users/${userId}`, {
              method: "DELETE",
              token
            }),
          "Akun berhasil dihapus."
        ),
      createMarketing: (payload) =>
        runAction(
          () =>
            apiFetch("/management/users", {
              method: "POST",
              token,
              body: payload
            }),
          "Akun marketing cabang berhasil dibuat."
        ),
      updateMarketing: (userId, payload) =>
        runAction(
          () =>
            apiFetch(`/management/users/${userId}`, {
              method: "PUT",
              token,
              body: payload
            }),
          "Akun marketing berhasil diperbarui."
        ),
      deleteMarketing: (userId) =>
        runAction(
          () =>
            apiFetch(`/management/users/${userId}`, {
              method: "DELETE",
              token
            }),
          "Akun marketing berhasil dihapus."
        ),
      updateProfile: (payload) =>
        runAction(
          () =>
            apiFetch("/marketing/me/profile", {
              method: "PUT",
              token,
              body: payload
            }),
          "Profil berhasil diperbarui."
        ),
      updateSocialMedia: (payload) =>
        runAction(
          () =>
            apiFetch("/marketing/me/social-media", {
              method: "PUT",
              token,
              body: payload
            }),
          "Social media berhasil diperbarui."
        ),
      addCertificate: (payload) =>
        runAction(
          () =>
            apiFetch("/marketing/me/certificates", {
              method: "POST",
              token,
              body: payload
            }),
          "Sertifikat berhasil ditambahkan."
        ),
      updateCertificate: (entryId, payload) =>
        runAction(
          () =>
            apiFetch(`/marketing/me/certificates/${entryId}`, {
              method: "PUT",
              token,
              body: payload
            }),
          "Sertifikat berhasil diperbarui."
        ),
      deleteCertificate: (entryId) =>
        runAction(
          () =>
            apiFetch(`/marketing/me/certificates/${entryId}`, {
              method: "DELETE",
              token
            }),
          "Sertifikat berhasil dihapus."
        ),
      createEcard: (payload) =>
        runAction(
          () =>
            apiFetch("/marketing/me/ecards", {
              method: "POST",
              token,
              body: payload
            }),
          "E-Card baru berhasil dibuat."
        ),
      updateEcard: (entryId, payload) =>
        runAction(
          () =>
            apiFetch(`/marketing/me/ecards/${entryId}`, {
              method: "PUT",
              token,
              body: payload
            }),
          "E-Card berhasil diperbarui."
        ),
      deleteEcard: (entryId) =>
        runAction(
          () =>
            apiFetch(`/marketing/me/ecards/${entryId}`, {
              method: "DELETE",
              token
            }),
          "E-Card berhasil dihapus."
        )
    }),
    [dashboard, feedback, loading, token, user?.role]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  return useContext(DashboardContext);
}
