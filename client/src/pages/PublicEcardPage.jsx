import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faBuilding,
  faCheckCircle,
  faDownload,
  faGlobe,
  faScaleBalanced,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import LoadingScreen from "../components/atoms/LoadingScreen";
import { apiFetch } from "../services/api";
import riffanLogo from "../assets/logo-rfb-full.png";
import commodityIcon from "../assets/commodity-icon.png";
import OilIcon from "../assets/oil-icon.png";
import indexIcon from "../assets/index-icon.png";
import ForexIcon from "../assets/forex-icon.png";
import riffanBg from "../assets/RFB BCG 1.png";
import verifiedBadge from "../assets/ic_round-verified.png";
import certificatesExample from "../assets/SERTIF-RFB-PATL 1.png";
import googleMapIcon from "../assets/google-map-icon.png";
import MediaPlaceholder from "../assets/MediaPlaceholder.png";
import worldStar from "../assets/world-star.png";
import tiktokIcon from "../assets/tiktok-icon.png";
import instagramIcon from "../assets/instagram-icon.png";
import linkedinIcon from "../assets/linkedin-icon.png";
import safeAlertFill from "../assets/safe-alert-fill.png";

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

const SOCIAL_MEDIA_IMAGE_BY_ID = {
  tiktok: tiktokIcon,
  instagram: instagramIcon,
  linkedin: linkedinIcon,
};

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
  const companyVideoUrl = normalizePublicLink(company.videoUrl);
  const socialMediaItems = socialMedia.filter(
    (item) =>
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

  return (
    <div className="bg-green-50/50">
      <div className="relative min-h-screen max-w-md mx-auto overflow-x-hidden bg-slate-50">
        <div className="fixed bottom-0 z-50 w-full max-w-md">
          <div className="rounded-t-3xl border border-white bg-white p-3 shadow-[0_-10px_15px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="grid grid-cols-4 gap-2">
              {SECTION_NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSectionNavigate(item.id)}
                    aria-current={isActive ? "true" : "false"}
                    className={`flex flex-col items-center justify-center rounded-2xl px-2 py-3 text-center transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-red-900 text-white shadow-[0_14px_28px_rgba(127,29,29,0.28)]"
                        : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={item.icon}
                      className={`text-[1.35rem] ${isActive ? "text-white" : "text-zinc-400"}`}
                    />
                    <span className="mt-2 text-sm font-bold leading-tight sm:text-[15px]">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-32">
          <section
            className="p-4 space-y-4"
            id="profile"
            ref={registerSection("profile")}
          >
            {/* Company Logo */}
            {companyBrand && (
              <div className="absolute left-6 top-6 z-50">
                {companyBrand.logoSrc ? (
                  <img
                    className="h-12 w-auto object-contain"
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
                  <h1 className="text-xl md:text-2xl font-bold text-black drop-shadow-lg">
                    {profile.name || "Nama Profil"}
                  </h1>
                  <div>
                    <img
                      src={verifiedBadge}
                      alt="Logo Verified"
                      className="h-5 md:h-6"
                    />
                  </div>
                </div>
                <div className="text-red-900">
                  <p className="md:text-lg">{headline}</p>
                  <p className="font-bold text-lg">
                    {profile.licenseNumber || "Nomor Izin"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={companyVideoUrl || "#"}
                onClick={
                  companyVideoUrl
                    ? undefined
                    : (event) => event.preventDefault()
                }
                className="w-full inline-flex items-center justify-center gap-3 bg-red-600 py-2 px-7 text-white rounded-xl"
                {...renderLinkTarget(companyVideoUrl)}
              >
                <FontAwesomeIcon icon={faDownload} className="text-2xl" />{" "}
                <span className="text-center text-wrap w-fit md:text-lg">
                  Download Company Brochure
                </span>
              </a>

              <a
                href={vcardHref}
                download={`${vcardName || "contact"}.vcf`}
                className="w-full inline-flex items-center justify-center gap-3 border border-zinc-300 py-2 px-5 text-red-800 rounded-xl"
              >
                <FontAwesomeIcon icon={faAddressBook} className="text-2xl" />{" "}
                <span className="text-center text-wrap w-fit md:text-lg">
                  Save Contact
                </span>
              </a>
            </div>

            <div className="mt-5">
              <h5 className="text-2xl font-bold">Profile</h5>
              <p className="md:text-lg text-justify">
                {profile.description || "Tidak ada deskripsi profil."}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-7">
              {infoItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center justify-center border border-red-300 bg-red-100 p-2 aspect-square rounded-3xl text-center"
                >
                  <img src={item.img} alt={item.label} className="h-10" />
                  <p className="mt-2 md:text-xl font-semibold text-black">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="legality"
            ref={registerSection("legality")}
            className="bg-zinc-200 p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-2xl font-bold">Legal Integrity</h5>
              <div className="bg-green-200 py-1 px-2 w-fit rounded-full border border-green-400 text-green-800">
                Verified <FontAwesomeIcon icon={faCheckCircle} />
              </div>
            </div>

            <div className="mt-7">
              <div className="rounded-3xl overflow-hidden bg-white p-2 shadow">
                <img
                  src={certificateImageSrc}
                  alt={certificateImageAlt}
                  className="w-full rounded-2xl overflow-hidden"
                />
              </div>
            </div>
          </section>

          <section
            id="corporate"
            ref={registerSection("corporate")}
            className="scroll-mt-28 p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-2xl font-bold">Corporate Heritage</h5>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <h6 className="font-bold text-xl text-red-800">
                  PT. Riffan Financindo Berjangka
                </h6>

                <p className="md:text-lg text-justify">
                  Pialang berjangka resmi yang diawasi BAPPEBTI, OJK, dan BI,
                  menghadirkan layanan investasi yang aman, terpercaya, dan
                  profesional. Didukung pengalaman lebih dari 20 tahun, kami
                  menjadi salah satu pelaku utama di industri Perdagangan
                  Berjangka Komoditi di Indonesia.
                </p>
              </div>

              <div className="flex items-start gap-1">
                <img src={googleMapIcon} alt="Google Map" className="h-fit" />
                <p className="text-sm md:text-base">
                  {branch.address || "Alamat cabang belum tersedia."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-0.5 rounded-3xl shadow text-center overflow-hidden">
                {corporateStats.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white flex flex-col items-center justify-center"
                  >
                    <h5 className="text-2xl md:text-3xl text-red-800 font-bold break-words">
                      {item.value}
                    </h5>
                    <p className="font-semibold text-zinc-400 md:text-xl">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl overflow-hidden">
                {companyVideoUrl ? (
                  <a
                    href={companyVideoUrl}
                    {...renderLinkTarget(companyVideoUrl)}
                  >
                    <img src={MediaPlaceholder} alt="Media Placeholder" />
                  </a>
                ) : (
                  <img src={MediaPlaceholder} alt="Media Placeholder" />
                )}
              </div>
            </div>
          </section>

          <section
            id="social-media"
            ref={registerSection("social-media")}
            className="scroll-mt-28 p-4"
          >
            <div className="bg-linear-to-r from-red-800 to-red-700 p-7 rounded-3xl">
              <div className="flex items-center gap-2 text-center w-fit mx-auto">
                <img src={worldStar} alt="World Star" />
                <h5 className="text-xl md:text-2xl font-bold text-white">
                  My Social Media
                </h5>
              </div>

              <div className="space-y-4 mt-7">
                {socialMediaItems.length ? (
                  socialMediaItems.map((item) => {
                    const socialIcon = SOCIAL_MEDIA_IMAGE_BY_ID[item.id];
                    const socialUrl = normalizePublicLink(item.url);
                    const isClickable = Boolean(socialUrl);

                    return (
                      <a
                        key={item.id}
                        href={socialUrl || "#"}
                        onClick={
                          isClickable
                            ? undefined
                            : (event) => event.preventDefault()
                        }
                        className="block rounded-full bg-red-100/20 border border-red-200/50 p-4"
                        {...renderLinkTarget(socialUrl)}
                      >
                        <div className="mx-auto w-fit flex items-center gap-2 text-white">
                          {socialIcon ? (
                            <img
                              src={socialIcon}
                              alt={`${item.label} Icon`}
                              className="h-5"
                            />
                          ) : (
                            <FontAwesomeIcon icon={faGlobe} className="h-5" />
                          )}
                          <p className="text-sm md:text-base">
                            {item.username ||
                              getSocialMediaDisplayValue(
                                item.value || item.url,
                              )}
                          </p>
                        </div>
                      </a>
                    );
                  })
                ) : (
                  <div className="rounded-full bg-red-100/20 border border-red-200/50 p-4">
                    <div className="mx-auto w-fit flex items-center gap-2 text-white">
                      <FontAwesomeIcon icon={faGlobe} className="h-5" />
                      <p>Belum ada social media</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="p-4">
            <div className="bg-red-50 p-7 rounded-3xl border border-red-200">
              <div className="flex items-center gap-2">
                <img src={safeAlertFill} alt="Alert Icon" className="h-7" />
                <h6 className="font-bold text-xl text-red-900">
                  Anti-Fraud Notice
                </h6>
              </div>
              <p className="mt-5 md:text-lg text-justify">
                PT Rifan Financindo Berjangka tidak pernah meminta transfer bank
                pribadi. Semua transaksi harus masuk ke rekening terpisah atas
                nama PT Rifan Financindo Berjangka.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
