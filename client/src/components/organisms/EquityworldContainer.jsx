import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import verifiedBadge from "../../assets/Icon-verif.png";
import googleMapIcon from "../../assets/google-map-icon.png";
import MediaPlaceholder from "../../assets/MediaPlaceholderEWF.png";
import worldStar from "../../assets/world-star.png";
import tiktokIcon from "../../assets/tiktokLogo.png";
import instagramIcon from "../../assets/instagram icon vector_8704817.png";
import linkedinIcon from "../../assets/linkedinLogo.png";
import xLogo from "../../assets/xLogo.png";
import { byPrefixAndName } from "../../utils/fontawesome";
import logoEWF from "../../assets/logoEWF.png";
import shield1 from "../../assets/shield1.png";
import shield2 from "../../assets/shield2.png";

const SOCIAL_MEDIA_IMAGE_BY_ID = {
  tiktok: tiktokIcon,
  instagram: instagramIcon,
  linkedin: linkedinIcon,
};

const SOCIAL_MEDIA_NAME_BY_ID = {
  tiktok: "TikTok",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "Twitter/X",
};

const EQUITYWORLD_COMPANY_PROFILE_URL =
  "https://www.youtube.com/embed/fiUy4yg_fac?si=I7YJC8rey56LINPj";

const infoItemsEwf = [
  {
    id: "Gold",
    label: "Gold Trading",
  },
  {
    id: "Oil",
    label: "Indices",
  },
  {
    id: "Index",
    label: "Risk Hedging",
  },
  {
    id: "Forex",
    label: "Forex Strategy",
  },
];

const WhyChooseMe = [
  {
    id: 1,
    icon: "chart-line",
    title: "Real-time Insights",
    dsc: "Akses langsung ke data pasar dan makalah penelitian institusional setiap hari.",
  },
  {
    id: 2,
    icon: "headset",
    title: "24/7 Priority Support",
    dsc: "Bantuan khusus untuk pelaksanaan perdagangan dan manajemen akun.",
  },
];

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

function getSocialMediaDisplayValue(value) {
  return String(value || "")
    .replace(/^(https?:\/\/)/i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/g, "");
}

function getEquityworldVideoEmbedUrl(url) {
  const value = String(url || "").trim();

  if (!value) {
    return EQUITYWORLD_COMPANY_PROFILE_URL;
  }

  try {
    const parsedUrl = new URL(value);
    const hostname = parsedUrl.hostname.replace(/^www\./i, "").toLowerCase();

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsedUrl.pathname.startsWith("/embed/")) {
        return value;
      }

      if (parsedUrl.pathname === "/watch") {
        const videoId = parsedUrl.searchParams.get("v");
        return videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : EQUITYWORLD_COMPANY_PROFILE_URL;
      }
    }

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : EQUITYWORLD_COMPANY_PROFILE_URL;
    }
  } catch {
    return EQUITYWORLD_COMPANY_PROFILE_URL;
  }

  return EQUITYWORLD_COMPANY_PROFILE_URL;
}

export default function EquityworldContainer({
  activeSection,
  sectionNavItems,
  onSectionNavigate,
  registerSection,
  companyBrand,
  company,
  profile,
  headline,
  companyVideoUrl,
  vcardHref,
  vcardName,
  certificateImageSrc,
  certificateImageAlt,
  branch,
  corporateStats,
  socialMediaItems,
}) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const videoPreviewUrl = getEquityworldVideoEmbedUrl(companyVideoUrl);
  const hasVideoSource = Boolean(videoPreviewUrl);
  const activeSectionIndex = Math.max(
    sectionNavItems.findIndex((item) => item.id === activeSection),
    0,
  );

  return (
    <div
      data-company-theme="equityworld"
      className="relative mx-auto min-h-screen max-w-md overflow-x-hidden bg-slate-50"
    >
      <div className="fixed bottom-0 z-50 w-full max-w-md">
        <div className="border border-white bg-white p-3 pt-0 shadow-[0_-10px_15px_rgba(0,0,0,0.25)] backdrop-blur">
          <div className="relative grid grid-cols-4 gap-2 pt-3">
            <div
              className="pointer-events-none absolute left-0 top-0 z-0 rounded-full bg-orange-500 transition-transform duration-300 ease-out"
              style={{
                height: "2px",
                width: "calc(25% - 0.375rem)",
                transform: `translateX(calc(${activeSectionIndex * 100}% + ${
                  activeSectionIndex * 0.5
                }rem))`,
              }}
            />
            {sectionNavItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSectionNavigate(item.id)}
                  aria-current={isActive ? "true" : "false"}
                  className={`relative z-10 flex cursor-pointer flex-col items-center justify-center px-2 py-3 text-center transition-colors duration-300 ${
                    isActive
                      ? "text-orange-500"
                      : "text-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={`text-[1.35rem] transition-colors duration-300 ${
                      isActive ? "text-orange-500" : "text-zinc-400"
                    }`}
                  />
                  <span className="mt-2 text-xs font-bold leading-tight transition-colors duration-300 sm:text-[15px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-32 space-y-6">
        <section
          className="space-y-4 p-4"
          id="profile"
          ref={registerSection("profile")}
        >
          {companyBrand ? (
            <div className="absolute left-6 top-6 z-50">
              <img
                className="h-12 w-auto object-contain"
                src={logoEWF}
                alt={company?.name || "Company logo"}
              />
            </div>
          ) : null}

          <div className="relative min-h-[520px] overflow-hidden rounded-xl bg-linear-60 from-orange-100 to-white border border-amber-500 text-center">
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center md:justify-end">
              {profile?.photo ? (
                <img
                  className="h-full max-h-[520px] w-full object-cover object-top"
                  src={profile.photo}
                  alt={profile?.name || "Foto profil"}
                />
              ) : (
                <div className="mb-10 mr-8 flex h-40 w-40 items-center justify-center rounded-full bg-white/80 text-5xl font-black text-slate-700 shadow-lg">
                  {getInitials(profile?.name) || "EC"}
                </div>
              )}
            </div>

            <div className="absolute w-full bottom-5 z-40 bg-white/80 p-4">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-bold text-black drop-shadow-lg">
                  {profile?.name || "Nama Profil"}
                </h1>
                <div className="bg-white rounded-full p-1 overflow-hidden">
                  <div className="bg-orange-500 rounded-full p-1">
                    <img
                      src={verifiedBadge}
                      alt="Logo Verified"
                      className="h-5 md:h-6"
                    />
                  </div>
                </div>
              </div>
              <div className="text-orange-800">
                <p className="md:text-lg">{headline}</p>
                <div className="flex items-center justify-center gap-3 bg-white w-fit px-5 rounded-full mx-auto mt-2">
                  <FontAwesomeIcon icon={byPrefixAndName.fas["award"]} />
                  <p className="text-lg font-bold">
                    {profile?.licenseNumber || "Nomor Izin"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-center gap-2">
            <a
              href={companyVideoUrl || "#"}
              onClick={
                companyVideoUrl ? undefined : (event) => event.preventDefault()
              }
              className="inline-flex flex-col w-full items-center justify-center gap-3 group"
            >
              <div className="bg-amber-100 p-3 rounded-2xl group-hover:bg-amber-200 transition-all">
                <FontAwesomeIcon
                  icon={byPrefixAndName.fas.download}
                  className="text-2xl text-amber-700"
                />
              </div>
              <span className="w-fit text-center text-wrap">
                Download Company Brochure
              </span>
            </a>

            <a
              href={vcardHref}
              download={`${vcardName || "contact"}.vcf`}
              className="inline-flex flex-col w-full items-center justify-center gap-3 group"
            >
              <div className="bg-zinc-300 p-3 rounded-2xl group-hover:bg-zinc-400 transition-all">
                <FontAwesomeIcon
                  icon={byPrefixAndName.fas["address-book"]}
                  className="text-2xl"
                />
              </div>
              <span className="w-fit text-center text-wrap">
                Save
                <br />
                Contact
              </span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center aspect-square border-2 border-amber-200 bg-white rounded-3xl shadow-lg">
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-[75px] font-bold text-amber-600">
                  12+
                </span>
                <span>Years Experience</span>
              </div>
            </div>

            <div className="text-center aspect-square border-2 border-amber-200 bg-white rounded-3xl shadow-lg">
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-[75px] font-bold text-amber-600">
                  1K+
                </span>
                <span>Consultations</span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h5 className="text-2xl font-semibold">About Me</h5>
            <div className="p-5 bg-white mt-5 rounded-2xl shadow-lg">
              <p className="text-justify md:text-lg">
                {profile?.description || "Tidak ada deskripsi profil."}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {infoItemsEwf.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg py-1 px-4 bg-orange-50 text-center"
                  >
                    <div className="flex h-full flex-col items-center justify-center">
                      <p className="font-semibold text-orange-500">
                        {item.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h5 className="text-2xl font-semibold">Why Choose Me?</h5>

            <div className="space-y-5 mt-7">
              {WhyChooseMe.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-lg bg-white shadow-lg p-4"
                >
                  <div className="py-1.5">
                    <FontAwesomeIcon
                      icon={byPrefixAndName.fas[item.icon]}
                      className="text-xl text-orange-500"
                    />
                  </div>

                  <div>
                    <h6 className="font-bold text-lg">{item.title}</h6>
                    <p className="">{item.dsc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="legality"
          ref={registerSection("legality")}
          className="space-y-4 p-4"
        >
          <div className="flex items-center justify-between">
            <h5 className="text-2xl font-semibold">Certificate</h5>
          </div>

          <div className="mt-7">
            <div className="overflow-hidden rounded-3xl bg-white p-2 shadow-lg">
              <img
                src={certificateImageSrc}
                alt={certificateImageAlt}
                className="w-full overflow-hidden rounded-2xl"
              />
            </div>
          </div>
        </section>

        <section
          id="corporate"
          ref={registerSection("corporate")}
          className="scroll-mt-28 space-y-4 p-4"
        >
          <div className="flex items-center justify-between">
            <h5 className="text-2xl font-semibold">Corporate Heritage</h5>
          </div>

          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-[2.25rem] shadow-[0_20px_40px_rgba(0,0,0,0.14)] bg-neutral-500">
              <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-orange-500/18 blur-[50px]" />
              <div className="relative z-10 space-y-5 px-7 py-8 text-white sm:px-8 sm:py-9">
                <h6 className="text-2xl font-bold leading-tight tracking-[-0.03em]">
                  {company?.name || "Profil Perusahaan"}
                </h6>

                <p className="text-lg leading-[1.4] font-normal text-white/95 sm:max-w-none sm:text-[1.2rem]">
                  PT Equityworld Futures (EWF), pialang berjangka resmi sejak
                  2005 yang diawasi BAPPEBTI, OJK, dan BI, hadir sebagai mitra
                  investasi terpercaya dengan layanan aman, profesional, dan
                  transparan.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl">
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                disabled={!hasVideoSource}
                className="relative block aspect-video w-full overflow-hidden rounded-3xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition hover:bg-black/28">
                  <div className="flex h-15 w-15 items-center justify-center rounded-full border border-white bg-white/50 p-5 text-sm font-semibold text-white shadow-lg backdrop-blur-xs">
                    <FontAwesomeIcon
                      icon={byPrefixAndName.fas.play}
                      className="text-2xl"
                    />
                  </div>
                </div>
                <img
                  src={MediaPlaceholder}
                  alt="Media Placeholder"
                  className="w-full object-cover"
                />
              </button>
            </div>

            <div>
              <div>
                <h1 className="text-2xl font-semibold">Verification Hub</h1>
              </div>

              <div className="mt-5 space-y-3">
                <div className="bg-white flex items-center justify-between p-4 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <img src={shield1} alt="Shield 1" className="w-10 h-10" />
                    </div>

                    <div>
                      <h6 className="font-semibold">Bappebti Verified</h6>
                      <p className="text-zinc-400 text-md">
                        850/BAPPEBTI/SI/12/2005
                      </p>
                    </div>
                  </div>

                  <FontAwesomeIcon
                    icon={byPrefixAndName.fas["circle-check"]}
                    className="text-2xl text-orange-500"
                  />
                </div>

                <div className="bg-white flex items-center justify-between p-4 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-4 rounded-xl">
                      <img src={shield2} alt="Shield 2" className="w-10 h-10" />
                    </div>

                    <div>
                      <h6 className="font-semibold">
                        Indonesian Clearing House Member
                      </h6>
                      <p className="text-zinc-400 text-md">36/AK-KBI/IV/2006</p>
                    </div>
                  </div>

                  <FontAwesomeIcon
                    icon={byPrefixAndName.fas["circle-check"]}
                    className="text-2xl text-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="social-media"
          ref={registerSection("social-media")}
          className="scroll-mt-28 p-4"
        >
          <div className="rounded-3xl">
            <div className="flex w-fit items-center gap-2">
              <h5 className="text-2xl font-semibold">Let's Connect</h5>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-2 items-center">
              {socialMediaItems.length ? (
                socialMediaItems.map((item) => {
                  const socialIcon = SOCIAL_MEDIA_IMAGE_BY_ID[item.id];
                  const socialName = SOCIAL_MEDIA_NAME_BY_ID[item.id];
                  const socialUrl = normalizePublicLink(item.url);

                  return (
                    <a
                      key={item.id}
                      href={socialUrl}
                      className="block rounded-full border border-orange-100 bg-white px-4 py-2"
                      {...renderLinkTarget(socialUrl)}
                    >
                      <div className="mx-auto flex w-fit items-center gap-2">
                        {socialIcon ? (
                          <img
                            src={socialIcon}
                            alt={`${item.label} Icon`}
                            className="h-5"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={byPrefixAndName.fas.globe}
                            className="h-5"
                          />
                        )}
                        <p>{socialName}</p>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="rounded-full border border-orange-100/50 bg-white/15 p-4">
                  <div className="mx-auto flex w-fit items-center gap-2">
                    <FontAwesomeIcon
                      icon={byPrefixAndName.fas.globe}
                      className="h-5"
                    />
                    <p>Belum ada social media</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="p-4">
          <div className="flex items-start gap-4 rounded-3xl border border-orange-200 bg-red-800 p-7 text-white">
            <div className="py-1">
              <FontAwesomeIcon
                icon={byPrefixAndName.fas["triangle-exclamation"]}
                className="text-2xl text-white"
              />
            </div>
            <div>
              <h6 className="text-lg font-bold uppercase">Anti-Fraud Notice</h6>
              <p className="mt-2 text-sm text-justify">
                PT EquityWorld Futures berkomitmen menjaga keamanan dana
                nasabah. Karena itu, setiap transaksi hanya dilakukan melalui
                Segregated Account atas nama PT EquityWorld Futures, bukan
                rekening pribadi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {videoModalOpen && hasVideoSource ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-xl bg-white p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="flex cursor-pointer items-center justify-end rounded-full text-orange-600 shadow-[0_10px_24px_rgba(234,88,12,0.3)] transition hover:scale-105"
                aria-label="Tutup video"
              >
                <FontAwesomeIcon
                  icon={byPrefixAndName.fas["circle-xmark"]}
                  className="text-lg"
                />
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg bg-slate-950 shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
              <div className="aspect-video w-full bg-black">
                <iframe
                  className="block h-full w-full"
                  src={videoPreviewUrl}
                  title={`${company?.name || "Equityworld"} Company Profile`}
                  allow="autoplay; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
