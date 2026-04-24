import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faDownload } from "@fortawesome/free-solid-svg-icons";
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
      rel: "noreferrer",
    };
  }

  return {};
}

function normalizeCompanyName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const COMPANY_BRANDS = {
  1: {
    key: "solid-gold",
    matchName: "pt solid gold berjangka",
    shortName: "SGB",
    logoSrc: null,
  },
  2: {
    key: "riffan",
    matchName: "pt riffan financindo berjangka",
    shortName: "RFB",
    logoSrc: riffanLogo,
  },
  3: {
    key: "kontak-perkasa",
    matchName: "pt kontak perkasa futures",
    shortName: "KPF",
    logoSrc: null,
  },
  4: {
    key: "bestprofit",
    matchName: "pt bestprofit futures",
    shortName: "BPF",
    logoSrc: null,
  },
  5: {
    key: "equityworld",
    matchName: "pt equityworld futures",
    shortName: "EWF",
    logoSrc: null,
  },
};

function getCompanyBrand(company) {
  const companyId = Number(company?.id);

  if (COMPANY_BRANDS[companyId]) {
    return COMPANY_BRANDS[companyId];
  }

  const normalizedName = normalizeCompanyName(company?.name);

  return (
    Object.values(COMPANY_BRANDS).find(
      (candidate) => candidate.matchName === normalizedName,
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
        const response = await apiFetch(
          `/public/ecards/${encodeURIComponent(resolvedSlug)}`,
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
          <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[color:var(--ink)]">
            E-Card tidak tersedia
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--ink-soft)] sm:text-base">
            {error ||
              "Link QR yang Anda buka tidak ditemukan atau sudah dinonaktifkan."}
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
  const headline =
    profile.ecardJobTitle || profile.positionTitle || "Marketing Consultant";
  const companyBrand = getCompanyBrand(company);
  const infoItems = [
    profile.licenseNumber
      ? { id: "license", label: "Nomor Izin", value: profile.licenseNumber }
      : null,
    profile.supervisorName
      ? { id: "supervisor", label: "Atasan", value: profile.supervisorName }
      : null,
    branch.address
      ? { id: "branch-address", label: "Alamat Cabang", value: branch.address }
      : null,
  ].filter(Boolean);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Company Logo */}
      {companyBrand && (
        <div className="absolute left-6 top-6 z-50">
          {companyBrand.logoSrc ? (
            <img
              className="h-14 w-auto object-contain"
              src={companyBrand.logoSrc}
              alt={company.name || "Company logo"}
            />
          ) : (
            <div className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-bold tracking-[0.18em] text-white">
              {companyBrand.shortName}
            </div>
          )}
        </div>
      )}
      <div className="p-4 space-y-4">
        <div
          className="relative min-h-[520px] overflow-hidden rounded-xl bg-white bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${riffanBg})` }}
        >
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center md:justify-end">
            {profile.photo ? (
              <img
                className="h-full max-h-[520px] w-auto object-contain object-bottom"
                src={profile.photo}
                alt={profile.name || "Foto profil"}
              />
            ) : (
              <div className="mb-10 mr-8 flex h-40 w-40 items-center justify-center rounded-full bg-white/80 text-5xl font-black text-slate-700 shadow-lg">
                {getInitials(profile.name) || "EC"}
              </div>
            )}
          </div>

          <div className="absolute bottom-5 z-50 bg-white/70 p-4 rounded-r-xl backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-black drop-shadow-lg">
                {profile.name || "Nama Profil"}
              </h1>
              <div>
                <img src={verifiedBadge} alt="Logo Verified" />
              </div>
            </div>
            <div className="text-red-900">
              <p className="text-xl">{headline}</p>
              <p className="font-bold text-lg">
                {profile.licenseNumber || "Nomor Izin"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <a
            href=""
            className="w-full inline-flex items-center justify-center gap-3 bg-red-600 py-1 px-7 text-white rounded-4xl"
          >
            <FontAwesomeIcon icon={faDownload} className="text-2xl" />{" "}
            <span className="text-center text-wrap w-fit text-lg">
              Download Company Brochure
            </span>
          </a>
          <a
            href=""
            className="w-full inline-flex items-center justify-center gap-3 border border-zinc-300 py-1 px-5 text-red-800 rounded-4xl"
          >
            <FontAwesomeIcon icon={faAddressBook} className="text-2xl" />{" "}
            <span className="text-center text-wrap w-fit text-lg">
              Save Contact
            </span>
          </a>
        </div>
        <div>
          <h5 className="text-2xl font-bold">Profile</h5>
          <p></p>
        </div>
      </div>
    </div>
  );
}
