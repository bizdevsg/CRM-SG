export const dashboardIcons = {
  dashboard:
    "M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7V11h-7v9Zm0-16v5h7V4h-7Z",
  menu:
    "M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z",
  close:
    "M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.3 1.42 1.42Z",
  branch:
    "M4 20h16v-2H4v2Zm2-4h3V4H6v12Zm5 0h3V8h-3v8Zm5 0h2V6h-2v10Z",
  users:
    "M16 11c1.66 0 2.99-1.57 2.99-3.5S17.66 4 16 4s-3 1.57-3 3.5S14.34 11 16 11Zm-8 0c1.66 0 2.99-1.57 2.99-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.94 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z",
  profile:
    "M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z",
  link:
    "M3.9 12a5 5 0 0 1 5-5h3v2h-3a3 3 0 0 0 0 6h3v2h-3a5 5 0 0 1-5-5Zm6.1 1h4v-2h-4v2Zm5-6h-3v2h3a3 3 0 0 1 0 6h-3v2h3a5 5 0 0 0 0-10Z",
  certificate:
    "M17 3H7a2 2 0 0 0-2 2v14l4-2 4 2 4-2 4 2V5a2 2 0 0 0-2-2Zm-5 9.5-2.5 1.5.66-2.84L8 9.27l2.92-.25L12 6.33l1.08 2.69 2.92.25-2.16 1.89.66 2.84L12 12.5Z",
  qr:
    "M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm10-2h2v2h-2v-2Zm2 2h2v2h-2v-2Zm-2 2h2v2h-2v-2Zm4 0h2v4h-4v-2h2v-2Z",
  shield:
    "M12 2 4 5v6c0 5 3.41 9.69 8 11 4.59-1.31 8-6 8-11V5l-8-3Zm-1 14-4-4 1.41-1.41L11 13.17l5.59-5.59L18 9l-7 7Z",
  chart:
    "M5 9.2h2V19H5V9.2Zm6-4.2h2V19h-2V5Zm6 8h2v6h-2v-6Z"
};

export const dashboardRoleConfig = {
  superadmin: {
    brand: "E-Card Control",
    title: "Dashboard",
    subtitle: "Ringkasan menu yang tersedia di sidebar untuk pengelolaan seluruh resource.",
    menu: [
      {
        id: "overview",
        label: "Beranda",
        group: "Dashboard",
        icon: "dashboard",
        to: "/dashboard"
      },
      {
        id: "branches",
        label: "Cabang",
        group: "Master Data",
        icon: "branch",
        to: "/dashboard/branches"
      },
      {
        id: "users",
        label: "Admin Cabang",
        group: "Master Data",
        icon: "shield",
        to: "/dashboard/users"
      },
      {
        id: "marketing",
        label: "Marketing",
        group: "Master Data",
        icon: "users",
        to: "/dashboard/marketing"
      }
    ]
  },
  admin: {
    brand: "E-Card Branch",
    title: "Dashboard",
    subtitle: "Ringkasan menu cabang dan pengelolaan akun marketing di sidebar.",
    menu: [
      {
        id: "overview",
        label: "Beranda",
        group: "Dashboard",
        icon: "dashboard",
        to: "/dashboard"
      },
      {
        id: "branch",
        label: "Cabang Saya",
        group: "Cabang",
        icon: "branch",
        to: "/dashboard/branch"
      },
      {
        id: "team",
        label: "Tim Marketing",
        group: "Cabang",
        icon: "users",
        to: "/dashboard/team"
      }
    ]
  },
  marketing: {
    brand: "E-Card Workspace",
    title: "Dashboard",
    subtitle: "Kelola identitas, sertifikat, social media, dan QR code dari sidebar.",
    menu: [
      {
        id: "overview",
        label: "Beranda",
        group: "Dashboard",
        icon: "dashboard",
        to: "/dashboard"
      },
      {
        id: "profile",
        label: "Biodata",
        group: "Profil",
        icon: "profile",
        to: "/dashboard/profile"
      },
      {
        id: "certificates",
        label: "Sertifikat",
        group: "Profil",
        icon: "certificate",
        to: "/dashboard/certificates"
      },
      {
        id: "ecards",
        label: "E-Card QR",
        group: "Profil",
        icon: "qr",
        to: "/dashboard/ecards"
      }
    ]
  }
};

export function getRoleDashboardConfig(role) {
  return dashboardRoleConfig[role] || dashboardRoleConfig.marketing;
}

export function getDefaultDashboardPath(role) {
  return getRoleDashboardConfig(role).menu[0]?.to || "/dashboard";
}

export function findMenuItemByPath(role, pathname) {
  const menu = getRoleDashboardConfig(role).menu;

  const exactMatch = menu.find((item) => item.to === pathname);

  if (exactMatch) {
    return exactMatch;
  }

  const prefixMatches = menu
    .filter((item) => item.to !== "/dashboard" && pathname.startsWith(`${item.to}/`))
    .sort((left, right) => right.to.length - left.to.length);

  return prefixMatches[0] || menu[0] || null;
}
