import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingScreen from "../components/atoms/LoadingScreen";
import { apiFetch } from "../services/api";

function getInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function isExternalUrl(url) {
  return /^https?:\/\//i.test(String(url || ""));
}

function renderLinkTarget(url) {
  if (isExternalUrl(url)) {
    return {
      target: "_blank",
      rel: "noreferrer"
    };
  }

  return {};
}

export default function PublicEcardPage() {
  const { companySlug, branchCode, ecardSlug } = useParams();
  const [ecard, setEcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPublicEcard() {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch(
          `/public/ecards/${encodeURIComponent(companySlug)}/${encodeURIComponent(branchCode)}/${encodeURIComponent(ecardSlug)}`
        );

        if (!ignore) {
          setEcard(response.ecard);
        }
      } catch (requestError) {
        if (!ignore) {
          setEcard(null);
          setError(requestError.message || "E-Card tidak dapat ditampilkan.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPublicEcard();

    return () => {
      ignore = true;
    };
  }, [branchCode, companySlug, ecardSlug]);

  if (loading) {
    return <LoadingScreen message="Menyiapkan e-card publik..." />;
  }

  if (!ecard) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-2xl rounded-[34px] border border-white/70 bg-[rgba(255,252,246,0.88)] p-8 shadow-[0_30px_70px_rgba(18,34,53,0.12)] backdrop-blur-xl">
          <div className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
            Public E-Card
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[color:var(--ink)]">
            E-Card tidak tersedia
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--ink-soft)] sm:text-base">
            {error || "Link QR yang Anda buka tidak ditemukan atau sudah dinonaktifkan."}
          </p>
        </div>
      </div>
    );
  }

  const profile = ecard.profile || {};
  const company = ecard.company || {};
  const branch = ecard.branch || {};
  const certificates = ecard.certificates || [];
  const socialMedia = ecard.socialMedia || [];
  const headline = profile.ecardJobTitle || profile.positionTitle || "Marketing Consultant";
  const infoItems = [
    profile.licenseNumber ? { id: "license", label: "Nomor Izin", value: profile.licenseNumber } : null,
    profile.supervisorName ? { id: "supervisor", label: "Atasan", value: profile.supervisorName } : null,
    branch.address ? { id: "branch-address", label: "Alamat Cabang", value: branch.address } : null
  ].filter(Boolean);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(22,105,122,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.16))]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-4 rounded-[34px] border border-white/70 bg-[rgba(255,252,246,0.78)] p-5 shadow-[0_24px_60px_rgba(18,34,53,0.08)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-white/70 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--teal-deep)]">
              Public E-Card
            </span>
            <span className="inline-flex rounded-full bg-[color:var(--mint)] px-4 py-2 text-xs font-semibold text-[color:var(--teal-deep)]">
              {company.name}
            </span>
            <span className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              {branch.code}
            </span>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-black tracking-[-0.05em] text-[color:var(--ink)] sm:text-4xl lg:text-5xl">
                {profile.name}
              </h1>
              <p className="mt-2 text-lg font-semibold text-[color:var(--teal-deep)] sm:text-xl">
                {headline}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--ink-soft)] sm:text-base">
                {profile.description ||
                  "Profil marketing ini dibuka dari QR code publik untuk memudahkan calon klien melihat informasi kontak dan kredensial."}
              </p>
            </div>

            <a
              className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d8ca0,#114b5f)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(17,75,95,0.24)] transition hover:-translate-y-0.5 hover:brightness-105"
              href={ecard.publicUrl}
            >
              Buka Link Publik
            </a>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
              <article className="rounded-[34px] border border-white/70 bg-[rgba(18,34,53,0.94)] p-6 text-white shadow-[0_28px_70px_rgba(18,34,53,0.24)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Contact Card
                    </p>
                    <h2 className="mt-3 text-2xl font-bold">{profile.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{headline}</p>
                  </div>

                  {profile.photo ? (
                    <img
                      className="h-20 w-20 rounded-[26px] object-cover ring-4 ring-white/10"
                      src={profile.photo}
                      alt={profile.name}
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-white/10 text-2xl font-black text-white ring-4 ring-white/10">
                      {getInitials(profile.name) || "EC"}
                    </div>
                  )}
                </div>

                <div className="mt-8 grid gap-3">
                  {socialMedia.length ? (
                    socialMedia.map((item) => (
                      <a
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 transition hover:border-cyan-300/40 hover:bg-white/10"
                        href={item.url}
                        {...renderLinkTarget(item.url)}
                      >
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                            {item.label}
                          </p>
                          <p className="mt-1 break-all text-sm font-medium text-white">{item.value}</p>
                        </div>
                        <span className="text-sm font-semibold text-cyan-200">Buka</span>
                      </a>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-6 text-slate-300">
                      Belum ada tautan kontak publik yang ditampilkan pada e-card ini.
                    </div>
                  )}
                </div>
              </article>

              <article className="rounded-[34px] border border-white/70 bg-[rgba(255,252,246,0.88)] p-6 shadow-[0_28px_70px_rgba(18,34,53,0.08)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--teal-deep)]">
                  Detail Profil
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[26px] border border-[color:var(--line)] bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                      Perusahaan
                    </p>
                    <p className="mt-3 text-lg font-bold text-[color:var(--ink)]">{company.name}</p>
                    {company.description ? (
                      <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                        {company.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-[26px] border border-[color:var(--line)] bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                      Cabang
                    </p>
                    <p className="mt-3 text-lg font-bold text-[color:var(--ink)]">{branch.name}</p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                      Kode cabang {branch.code}
                    </p>
                  </div>

                  {infoItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[26px] border border-[color:var(--line)] bg-white/70 p-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                        {item.label}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[color:var(--ink)]">{item.value}</p>
                    </div>
                  ))}
                </div>

                {company.videoUrl ? (
                  <a
                    className="mt-5 inline-flex items-center rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 text-sm font-semibold text-[color:var(--teal-deep)] transition hover:-translate-y-0.5 hover:bg-white"
                    href={company.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Lihat video perusahaan
                  </a>
                ) : null}
              </article>
            </div>

            <article className="rounded-[34px] border border-white/70 bg-[rgba(255,252,246,0.84)] p-6 shadow-[0_28px_70px_rgba(18,34,53,0.08)] backdrop-blur-xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--teal-deep)]">
                    Sertifikat
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[color:var(--ink)]">
                    Kredensial yang ditampilkan
                  </h2>
                </div>
                <p className="text-sm text-[color:var(--ink-soft)]">
                  Total {certificates.length} sertifikat publik
                </p>
              </div>

              {certificates.length ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {certificates.map((certificate) => (
                    <div
                      key={certificate.id}
                      className="overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-white shadow-[0_18px_40px_rgba(18,34,53,0.06)]"
                    >
                      {certificate.imagePath ? (
                        <img
                          className="h-48 w-full bg-slate-100 object-cover"
                          src={certificate.imagePath}
                          alt={certificate.title}
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-[linear-gradient(135deg,#d9f4ea,#f4dbc2)] px-6 text-center text-sm font-semibold text-[color:var(--teal-deep)]">
                          Sertifikat tanpa gambar
                        </div>
                      )}

                      <div className="p-5">
                        <p className="text-base font-semibold leading-7 text-[color:var(--ink)]">
                          {certificate.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-dashed border-[color:var(--line)] bg-white/70 px-5 py-8 text-sm leading-7 text-[color:var(--ink-soft)]">
                  Belum ada sertifikat publik yang ditambahkan pada profil ini.
                </div>
              )}
            </article>
          </section>

          <aside className="space-y-6">
            <article className="rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(234,219,200,0.78))] p-6 shadow-[0_24px_60px_rgba(18,34,53,0.08)] backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--teal-deep)]">
                Ringkasan
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                    Nama
                  </p>
                  <p className="mt-2 text-base font-bold text-[color:var(--ink)]">{profile.name}</p>
                </div>
                <div className="rounded-[24px] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                    Jabatan
                  </p>
                  <p className="mt-2 text-base font-bold text-[color:var(--ink)]">{headline}</p>
                </div>
                <div className="rounded-[24px] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                    Link Publik
                  </p>
                  <p className="mt-2 break-all text-sm leading-6 text-[color:var(--ink)]">
                    {ecard.publicUrl}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[34px] border border-white/70 bg-[rgba(18,34,53,0.95)] p-6 text-white shadow-[0_24px_60px_rgba(18,34,53,0.24)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Tentang E-Card
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Halaman ini bisa dibuka langsung dari QR code tanpa login. Informasi yang tampil
                diambil dari profil marketing aktif pada sistem e-card.
              </p>
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
}
