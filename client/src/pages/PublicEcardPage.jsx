import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faGlobe,
  faScaleBalanced,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import BestprofitContainer from "../components/organisms/BestprofitContainer";
import EquityworldContainer from "../components/organisms/EquityworldContainer";
import KpfContainer from "../components/organisms/KpfContainer";
import RfbContainer from "../components/organisms/RfbContainer";
import SolidGoldContainer from "../components/organisms/SolidGoldContainer";
import LoadingScreen from "../components/atoms/LoadingScreen";
import { apiFetch } from "../services/api";
import riffanLogo from "../assets/logo-rfb-full.png";
import commodityIcon from "../assets/commodity-icon.png";
import OilIcon from "../assets/oil-icon.png";
import indexIcon from "../assets/index-icon.png";
import ForexIcon from "../assets/forex-icon.png";
import certificatesExample from "../assets/SERTIF-RFB-PATL 1.png";

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

function normalizePublicLink(url) {
  const value = String(url || "").trim();

  if (!value) {
    return "";
  }

  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function escapeVcardValue(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function getSocialMediaDisplayValue(value) {
  return String(value || "")
    .replace(/^(https?:\/\/)/i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/g, "");
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

const SECTION_NAV_ITEMS = [
  { id: "profile", label: "Profile", icon: faUser },
  { id: "legality", label: "Legality", icon: faScaleBalanced },
  { id: "corporate", label: "Corporate", icon: faBuilding },
  { id: "social-media", label: "Social Media", icon: faGlobe },
];

function getCompanyContainer(companyKey) {
  switch (companyKey) {
    case "solid-gold":
      return SolidGoldContainer;
    case "kontak-perkasa":
      return KpfContainer;
    case "bestprofit":
      return BestprofitContainer;
    case "equityworld":
      return EquityworldContainer;
    case "riffan":
    default:
      return RfbContainer;
  }
}

export default function PublicEcardPage() {
  const { marketingSlug, ecardSlug } = useParams();
  const resolvedSlug = marketingSlug || ecardSlug;
  const [ecard, setEcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const sectionRefs = useRef({});

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

  useEffect(() => {
    if (!ecard) {
      return undefined;
    }

    setActiveSection("profile");

    const requestedSectionId = window.location.hash.replace("#", "");
    const requestedSection = sectionRefs.current[requestedSectionId];

    if (requestedSection) {
      setTimeout(() => {
        handleSectionNavigate(requestedSectionId);
      }, 0);
    }

    const sections = SECTION_NAV_ITEMS.map(
      (item) => sectionRefs.current[item.id],
    ).filter(Boolean);

    if (!sections.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          )[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -52% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [ecard]);

  function registerSection(sectionId) {
    return (node) => {
      if (node) {
        sectionRefs.current[sectionId] = node;
      }
    };
  }

  function handleSectionNavigate(sectionId) {
    const targetSection = sectionRefs.current[sectionId];

    if (!targetSection) {
      return;
    }

    setActiveSection(sectionId);

    const topOffset = 116;
    const targetTop =
      targetSection.getBoundingClientRect().top + window.scrollY - topOffset;

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${sectionId}`,
    );
    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  }

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
  const CompanyContainer = getCompanyContainer(companyBrand?.key);
  const companyVideoUrl = normalizePublicLink(company.videoUrl);
  const socialMediaItems = socialMedia.filter((item) =>
    ["instagram", "tiktok", "twitter", "linkedin"].includes(item.id),
  );
  const infoItems = [
    {
      id: "Gold",
      label: "Gold",
      img: commodityIcon,
    },
    {
      id: "Oil",
      label: "Oil",
      img: OilIcon,
    },
    {
      id: "Index",
      label: "Index",
      img: indexIcon,
    },
    {
      id: "Forex",
      label: "Forex",
      img: ForexIcon,
    },
  ];
  const corporateStats = [
    {
      id: "company",
      value: "20+",
      label: "Years Active",
    },
    {
      id: "branch",
      value: "10k+",
      label: "Active Clients",
    },
    {
      id: "email",
      value: "10",
      label: "Branch Offices",
    },
    {
      id: "supervisor",
      value: "Top 1",
      label: "Highest Volume Broker",
    },
  ];
  const certificateImageSrc = certificates[0]?.imagePath || certificatesExample;
  const certificateImageAlt = certificates[0]?.title || "Sertifikat";
  const vcardName = (profile.name || ecard.slug || "contact")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const vcardContent = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    profile.name ? `FN:${escapeVcardValue(profile.name)}` : null,
    headline ? `TITLE:${escapeVcardValue(headline)}` : null,
    company.name ? `ORG:${escapeVcardValue(company.name)}` : null,
    profile.phone ? `TEL;TYPE=CELL:${escapeVcardValue(profile.phone)}` : null,
    profile.email ? `EMAIL:${escapeVcardValue(profile.email)}` : null,
    branch.address
      ? `ADR;TYPE=WORK:;;${escapeVcardValue(branch.address)};;;;`
      : null,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
  const vcardHref = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcardContent)}`;

  function getCompanyBackground(companyKey) {
    switch (companyKey) {
      case "solid-gold":
        return "bg-gradient-to-br from-yellow-50 to-yellow-100";

      case "riffan":
        return "bg-gradient-to-br from-blue-50 to-blue-100";

      case "kontak-perkasa":
        return "bg-gradient-to-br from-green-50 to-green-100";

      case "bestprofit":
        return "bg-gradient-to-br from-sky-50 to-sky-100";

      case "equityworld":
        return "bg-gradient-to-br from-red-50 to-red-100";

      default:
        return "bg-white";
    }
  }

  return (
    <div className={getCompanyBackground(companyBrand?.key)}>
      <CompanyContainer
        activeSection={activeSection}
        sectionNavItems={SECTION_NAV_ITEMS}
        onSectionNavigate={handleSectionNavigate}
        registerSection={registerSection}
        companyBrand={companyBrand}
        company={company}
        profile={profile}
        headline={headline}
        companyVideoUrl={companyVideoUrl}
        vcardHref={vcardHref}
        vcardName={vcardName}
        infoItems={infoItems}
        certificateImageSrc={certificateImageSrc}
        certificateImageAlt={certificateImageAlt}
        branch={branch}
        corporateStats={corporateStats}
        socialMediaItems={socialMediaItems}
      />
    </div>
  );
}
