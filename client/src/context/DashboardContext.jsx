import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../services/api";

const DashboardContext = createContext(null);

function buildSummaryCards(role, dashboard) {
  const stats = dashboard?.stats || {};

  if (role === "superadmin") {
    return [
      {
        label: "Cabang",
        value: stats.totalBranches ?? 0,
        description: "Total cabang aktif yang saat ini dikelola sistem.",
        icon: "branch",
        tint: "bg-sky-50 text-sky-600"
      },
      {
        label: "Admin Cabang",
        value: stats.totalAdmins ?? 0,
        description: "Jumlah admin cabang dengan akses pengelolaan marketing.",
        icon: "shield",
        tint: "bg-amber-50 text-amber-600"
      },
      {
        label: "Marketing",
        value: stats.totalMarketing ?? 0,
        description: "Total akun marketing dari seluruh cabang.",
        icon: "users",
        tint: "bg-emerald-50 text-emerald-600"
      },
      {
        label: "E-Card",
        value: stats.totalEcards ?? 0,
        description: "QR code E-Card yang sudah berhasil dibuat.",
        icon: "qr",
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
        description: "Total sertifikat yang terdaftar pada tim marketing cabang.",
        icon: "certificate",
        tint: "bg-amber-50 text-amber-600"
      },
      {
        label: "E-Card",
        value: stats.totalEcards ?? 0,
        description: "Jumlah E-Card yang dibuat oleh marketing cabang.",
        icon: "qr",
        tint: "bg-emerald-50 text-emerald-600"
      }
    ];
  }

  return [
    {
      label: "Biodata",
      value: stats.biodataCount ?? 0,
      description: "Jumlah biodata pribadi yang tersimpan di profil Anda.",
      icon: "profile",
      tint: "bg-sky-50 text-sky-600"
    },
    {
      label: "Social Media",
      value: stats.socialMediaCount ?? 0,
      description: "Akun media sosial yang siap ditampilkan di E-Card.",
      icon: "link",
      tint: "bg-amber-50 text-amber-600"
    },
    {
      label: "Sertifikat",
      value: stats.certificateCount ?? 0,
      description: "Total sertifikat profesional yang sudah Anda masukkan.",
      icon: "certificate",
      tint: "bg-emerald-50 text-emerald-600"
    },
    {
      label: "E-Card",
      value: stats.ecardCount ?? 0,
      description: "QR code E-Card yang sudah berhasil Anda buat.",
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
      addSocialMedia: (payload) =>
        runAction(
          () =>
            apiFetch("/marketing/me/social-media", {
              method: "POST",
              token,
              body: payload
            }),
          "Social media berhasil ditambahkan."
        ),
      deleteSocialMedia: (entryId) =>
        runAction(
          () =>
            apiFetch(`/marketing/me/social-media/${entryId}`, {
              method: "DELETE",
              token
            }),
          "Social media berhasil dihapus."
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
