import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faCircleCheck,
  faDownload,
  faFileLines,
  faHouse,
  faLink,
  faPhone,
  faPlay,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import LoadingScreen from "../components/atoms/LoadingScreen";
import { apiFetch } from "../services/api";
import riffanLogo from "../assets/logo-rfb-full.png";
import riffanBg from "../assets/RFB BCG 1.png";
import verifiedBadge from "../assets/ic_round-verified.png";

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

function normalizeMediaUrl(url) {
  if (!url) {
    return "";
  }

  if (/^(https?:|mailto:|tel:)/i.test(url)) {
    return url;
  }

  return `https://${String(url).replace(/^\/+/, "")}`;
}

function createContactData(profile, company) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name || "Marketing Profile"}`,
    profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : "",
    profile.email ? `EMAIL;TYPE=INTERNET:${profile.email}` : "",
    company?.name ? `ORG:${company.name}` : "",
    profile.positionTitle ? `TITLE:${profile.positionTitle}` : "",
    profile.licenseNumber ? `NOTE:License ${profile.licenseNumber}` : "",
    "END:VCARD"
  ].filter(Boolean);

  return `data:text/vcard;charset=utf-8,${encodeURIComponent(lines.join("\n"))}`;
}

function normalizeCompanyName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function shortSocialLabel(label = "") {
  const normalized = label.toLowerCase();

  if (normalized.includes("whatsapp") || normalized.includes("telepon") || normalized.includes("phone")) {
    return "WA";
  }

  if (normalized.includes("instagram")) {
    return "IG";
  }

  if (normalized.includes("linkedin")) {
    return "IN";
  }

  if (normalized.includes("twitter")) {
    return "X";
  }

  if (normalized.includes("email")) {
    return "@";
  }

  return "WEB";
}

const COMPANY_BRANDS = {
  1: {
    key: "solid-gold",
    matchName: "pt solid gold berjangka",
    shortName: "SGB",
    logoSrc: null
  },
  2: {
    key: "riffan",
    matchName: "pt riffan financindo berjangka",
    shortName: "RFB",
    logoSrc: riffanLogo
  },
  3: {
    key: "kontak-perkasa",
    matchName: "pt kontak perkasa futures",
    shortName: "KPF",
    logoSrc: null
  },
  4: {
    key: "bestprofit",
    matchName: "pt bestprofit futures",
    shortName: "BPF",
    logoSrc: null
  },
  5: {
    key: "equityworld",
    matchName: "pt equityworld futures",
    shortName: "EWF",
    logoSrc: null
  }
};

function getCompanyBrand(company) {
  const companyId = Number(company?.id);

  if (COMPANY_BRANDS[companyId]) {
    return COMPANY_BRANDS[companyId];
  }

  const normalizedName = normalizeCompanyName(company?.name);

  return (
    Object.values(COMPANY_BRANDS).find(
      (candidate) => candidate.matchName === normalizedName
    ) || null
  );
}

export default function PublicEcardPage() {
  const { marketingSlug, ecardSlug } = useParams();
  const resolvedSlug = marketingSlug || ecardSlug;
  const [ecard, setEcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPublicEcard() {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch(`/public/ecards/${encodeURIComponent(resolvedSlug)}`);

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
  }, [resolvedSlug]);

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
          <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[color:var(--ink)]">E-Card tidak tersedia</h1>
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
  const companyBrand = getCompanyBrand(company);
  const brochureUrl = normalizeMediaUrl(company.videoUrl);
  const saveContactUrl = createContactData(profile, company);
  const quickSocial = socialMedia.slice(0, 4);
  const legalCertificates = certificates.slice(0, 3);
  const socialLinks = socialMedia.filter((entry) => entry.url);
  const kpis = [
    { id: "years", value: "20", label: "Years Access" },
    { id: "clients", value: "10K+", label: "Valuable Clients" },
    { id: "volume", value: "Top 1", label: "Highest Volume Broker" }
  ];

  return (
    <div className="min-h-screen bg-[#dcdcdc] px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-[430px] rounded-[42px] border border-slate-300/80 bg-[#f7f7f8] p-3 shadow-[0_20px_55px_rgba(16,24,40,0.2)]">
        <div className="overflow-hidden rounded-[34px] bg-white shadow-[0_10px_40px_rgba(15,23,42,0.14)]">
          <div className="relative min-h-[515px] overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${riffanBg})` }}>
            {companyBrand ? (
              <div className="absolute left-4 top-4 z-50">
                {companyBrand.logoSrc ? (
                  <img className="h-11 w-auto object-contain" src={companyBrand.logoSrc} alt={company.name || "Company logo"} />
                ) : (
                  <div className="inline-flex h-11 min-w-14 items-center justify-center rounded-2xl bg-slate-900 px-3 text-xs font-bold tracking-[0.24em] text-white">
                    {companyBrand.shortName}
                  </div>
                )}
              </div>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center md:justify-end">
              {profile.photo ? (
                <img className="h-full max-h-[520px] w-auto object-contain object-bottom" src={profile.photo} alt={profile.name || "Foto profil"} />
              ) : (
                <div className="mb-10 mr-8 flex h-36 w-36 items-center justify-center rounded-full bg-white/80 text-4xl font-black text-slate-700 shadow-lg">
                  {getInitials(profile.name) || "EC"}
                </div>
              )}
            </div>

            <div className="absolute bottom-4 left-0 right-7 z-50 rounded-r-2xl bg-white/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <h1 className="text-[30px] font-bold leading-[1.1] text-black">{profile.name || "Nama Profil"}</h1>
                <img src={verifiedBadge} alt="Logo Verified" className="h-5 w-5" />
              </div>
              <div className="mt-1 text-red-900">
                <p className="text-[28px] leading-tight">{headline}</p>
                <p className="text-[28px] font-bold leading-tight">{profile.licenseNumber || "Nomor Izin"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-4 pb-6 pt-4">
            <div className="grid grid-cols-2 gap-2">
              {brochureUrl ? (
                <a
                  href={brochureUrl}
                  {...renderLinkTarget(brochureUrl)}
                  className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-[26px] bg-red-600 px-3 py-2 text-white"
                >
                  <FontAwesomeIcon icon={faDownload} className="text-lg" />
                  <span className="text-center text-[15px] font-medium leading-tight">Download Company Brochure</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-[26px] bg-red-300 px-3 py-2 text-white"
                >
                  <FontAwesomeIcon icon={faDownload} className="text-lg" />
                  <span className="text-center text-[15px] font-medium leading-tight">Download Company Brochure</span>
                </button>
              )}

              <a
                href={saveContactUrl}
                download={`${profile.name || "contact"}.vcf`}
                className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-[26px] border border-zinc-300 bg-white px-3 py-2 text-red-800"
              >
                <FontAwesomeIcon icon={faAddressBook} className="text-lg" />
                <span className="text-center text-[15px] font-medium leading-tight">Save Contact</span>
              </a>
            </div>

            <section className="space-y-2">
              <h2 className="text-[17px] font-bold text-slate-900">Profile</h2>
              <p className="text-[13px] leading-5 text-red-700/90">
                {profile.description ||
                  "Specializing in Capital Preservation and growth strategies across high-velocity markets with over 12 years of institutional expertise."}
              </p>
              {quickSocial.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {quickSocial.map((entry) => {
                    const entryUrl = normalizeMediaUrl(entry.url);

                    return (
                      <a
                        key={entry.id}
                        href={entryUrl}
                        {...renderLinkTarget(entryUrl)}
                        className="rounded-xl border border-red-200 bg-red-50 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-red-700"
                      >
                        {shortSocialLabel(entry.label)}
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-slate-900">Legal Integrity</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-700">
                  <FontAwesomeIcon icon={faCircleCheck} />
                  Verified
                </span>
              </div>

              {legalCertificates.length > 0 ? (
                <div className="space-y-2">
                  {legalCertificates.map((certificate) => (
                    <article key={certificate.id} className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
                      {certificate.imagePath ? (
                        <img src={certificate.imagePath} alt={certificate.title} className="h-24 w-full object-cover" />
                      ) : null}
                      <div className="px-3 py-2">
                        <p className="text-[12px] font-semibold text-slate-800">{certificate.title}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">
                  Sertifikat belum ditambahkan.
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-[15px] font-bold text-slate-900">Corporate Heritage</h3>
              <div className="rounded-2xl border border-red-100 bg-red-50/70 px-3 py-3">
                <p className="text-[13px] font-bold text-red-900">{company.name || "PT Rifan Financindo Berjangka"}</p>
                <p className="mt-1 text-[11px] leading-5 text-red-900/90">
                  {company.description ||
                    "Pialang berjangka resmi di Indonesia dengan eksekusi, riset, dan legalitas terverifikasi untuk mendukung kebutuhan klien."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {kpis.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-red-100 bg-white px-2 py-3 text-center">
                    <p className="text-[18px] font-black text-red-700">{item.value}</p>
                    <p className="mt-1 text-[10px] font-semibold leading-tight text-slate-600">{item.label}</p>
                  </div>
                ))}
              </div>

              <a
                href={brochureUrl || "#"}
                {...renderLinkTarget(brochureUrl || "")}
                className="relative block overflow-hidden rounded-2xl border border-slate-200"
              >
                <img src={riffanBg} alt="Corporate video" className="h-28 w-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/35" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-600 shadow-lg">
                    <FontAwesomeIcon icon={faPlay} />
                  </span>
                </div>
              </a>
            </section>

            {socialLinks.length > 0 ? (
              <section className="space-y-3">
                <h3 className="text-[15px] font-bold text-slate-900">My Social Media</h3>
                <div className="space-y-2 rounded-2xl bg-red-900 p-3">
                  {socialLinks.map((entry) => {
                    const entryUrl = normalizeMediaUrl(entry.url);

                    return (
                      <a
                        key={entry.id}
                        href={entryUrl}
                        {...renderLinkTarget(entryUrl)}
                        className="inline-flex w-full items-center justify-between rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white"
                      >
                        <span className="text-[12px] font-semibold">{entry.label}</span>
                        <FontAwesomeIcon icon={faLink} className="text-[11px]" />
                      </a>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-red-200 bg-red-50 px-3 py-3">
              <p className="text-[11px] font-semibold text-red-800">Anti Fraud Notice</p>
              <p className="mt-1 text-[10px] leading-5 text-red-900/85">
                PT Rifan Financindo Berjangka tidak pernah meminta transfer dana pribadi atas nama karyawan. Pastikan transaksi hanya melalui rekening resmi perusahaan.
              </p>
            </section>

            <div className="sticky bottom-0 z-20 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-sm">
              <div className="grid grid-cols-4 gap-1 text-center text-[10px] text-slate-500">
                <div className="rounded-xl bg-red-50 py-1 text-red-600">
                  <FontAwesomeIcon icon={faHouse} className="mb-1 block text-base" />
                  Home
                </div>
                <div className="rounded-xl py-1">
                  <FontAwesomeIcon icon={faUser} className="mb-1 block text-base" />
                  Profile
                </div>
                <div className="rounded-xl py-1">
                  <FontAwesomeIcon icon={faFileLines} className="mb-1 block text-base" />
                  Legal
                </div>
                <div className="rounded-xl py-1">
                  <FontAwesomeIcon icon={faPhone} className="mb-1 block text-base" />
                  Contact
                </div>
              </div>
            </div>

            <p className="pb-1 text-center text-[10px] text-slate-400">Powered by SG E-Card</p>
          </div>
        </div>
      </div>
    </div>
  );
}
