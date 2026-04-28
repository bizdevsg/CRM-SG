function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 120)
    .replace(/^-+|-+$/g, "");
}

export function buildAutomaticEcardSlug(profile) {
  const slugSource = [profile?.licenseNumber, profile?.fullName || profile?.name]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");

  return slugify(slugSource || profile?.username || "marketing");
}

export function getIncompleteEcardFields(profile) {
  const fields = [
    { label: "Nama lengkap", value: profile?.fullName || profile?.name },
    { label: "Email", value: profile?.email },
    { label: "Nomor izin", value: profile?.licenseNumber },
    { label: "Jabatan e-card atau jabatan asli", value: profile?.ecardJobTitle || profile?.positionTitle },
    { label: "Deskripsi profil", value: profile?.description },
    { label: "Nomor telepon", value: profile?.phone },
    { label: "Foto profil", value: profile?.photo },
    { label: "Perusahaan", value: profile?.companyName },
    { label: "Cabang", value: profile?.branchName },
  ];

  return fields
    .filter((field) => !String(field.value || "").trim())
    .map((field) => field.label);
}
