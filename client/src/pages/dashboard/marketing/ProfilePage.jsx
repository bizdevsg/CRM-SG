import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import Card from "../../../components/atoms/Card";
import { useDashboard } from "../../../context/DashboardContext";

function getInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function ProfilePhotoPreview({ imageSrc }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200/90 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
      <div className="absolute inset-0 bg-zinc-500" />

      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Preview profile"
          className="relative aspect-[3/4] w-full object-cover object-top"
        />
      ) : (
        <div className="relative flex aspect-[3/4] w-full items-center justify-center">
          <div className="rounded-2xl border border-white/70 bg-white/80 px-5 py-4 text-center shadow-lg backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Preview
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Belum ada foto
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { dashboard } = useDashboard();
  const navigate = useNavigate();
  const profile = dashboard?.resources?.profile || {};
  const socialMediaItems = dashboard?.resources?.socialMedia || [];
  const biodataItems = dashboard?.resources?.biodata || [];
  const profileHeadline =
    profile.ecardJobTitle || profile.positionTitle || "Jabatan belum diatur";
  const profileDetails = [
    { label: "Nomor Izin", value: profile.licenseNumber || "-" },
    { label: "Username", value: profile.username || "-" },
    { label: "NIK", value: profile.nik || "-" },
    { label: "Perusahaan", value: profile.companyName || "-" },
    { label: "Cabang", value: profile.branchName || "-" },
    { label: "Jabatan Asli", value: profile.positionTitle || "-" },
    { label: "Jabatan E-Card", value: profile.ecardJobTitle || "-" },
    { label: "Email", value: profile.email || "-" },
    { label: "Telepon", value: profile.phone || "-" },
    { label: "Atasan", value: profile.supervisorName || "-" },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="w-full max-w-[220px]">
            {profile.photo ? (
              <ProfilePhotoPreview imageSrc={profile.photo} />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-[28px] border border-slate-200 bg-slate-100 text-4xl font-black text-slate-500 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                {getInitials(profile.fullName || profile.name) || "PR"}
              </div>
            )}
          </div>

          <div className="w-full space-y-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                  Profil Marketing
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {profile.fullName || "Nama belum tersedia"}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {profileHeadline}
                </p>
              </div>

              <Button
                className="px-5 py-3"
                onClick={() => navigate("/dashboard/profile/edit")}
              >
                Edit Profil
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {profileDetails.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Deskripsi E-Card
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {profile.description || "Belum ada deskripsi profil."}
              </p>
            </div>

            <div className="mt-10">
              <div className="p-4 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Social Media
                </p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {socialMediaItems.length ? (
                  socialMediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {item.platform}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {item.username || item.value || "-"}
                      </p>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {item.url || "-"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Belum ada social media yang tersimpan.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
