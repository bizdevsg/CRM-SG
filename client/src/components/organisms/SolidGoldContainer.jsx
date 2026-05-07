import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import verifiedBadge from "../../assets/Icon-verif-yellow.png";
import MediaPlaceholder from "../../assets/MediaPlaceholderSGB.png";
import worldStar from "../../assets/world-star.png";
import tiktokIcon from "../../assets/tiktok-icon.png";
import instagramIcon from "../../assets/instagram-icon.png";
import linkedinIcon from "../../assets/linkedin-icon.png";
import safeAlertFill from "../../assets/mingcute_safe-alert-line-sgb.png";
import gedungSgb from "../../assets/gedung-sgb.png";
import { byPrefixAndName } from "../../utils/fontawesome";
import logoSGB from "../../assets/logoSGB.png";
import iconGmaps from "../../assets/logos_google-maps.png";

const SOCIAL_MEDIA_IMAGE_BY_ID = {
  tiktok: tiktokIcon,
  instagram: instagramIcon,
  linkedin: linkedinIcon,
};

const NAV_ITEM_MENU = [
  {
    id: "profile",
    label: "Profile",
    icon: byPrefixAndName.fas.user,
  },
  {
    id: "legality",
    label: "Legality",
    icon: byPrefixAndName.fas["shield-alt"],
  },
  {
    id: "corporate",
    label: "Company",
    icon: byPrefixAndName.fas.briefcase,
  },
  {
    id: "social-media",
    label: "Contact",
    icon: byPrefixAndName.far["address-book"],
  },
];

const DEFAULT_CORPORATE_HIGHLIGHTS = [
  {
    id: 1,
    label: "3",
    description: "Branch",
  },
  {
    id: 2,
    label: "BAPPEBTI",
    description: "Legal",
  },
  {
    id: 3,
    label: "JFX",
    description: "Member",
  },
];

const SGB_COMPANY_PROFILE_URL =
  "https://www.youtube.com/embed/rgtaM3AbCJE?si=8I6VOny6D-teeXvr";

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

export default function SolidGoldContainer({
  activeSection,
  onSectionNavigate,
  registerSection,
  company,
  profile,
  headline,
  companyVideoUrl,
  vcardHref,
  vcardName,
  infoItems,
  certificateImageSrc,
  certificateImageAlt,
  branch,
  socialMediaItems,
}) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const corporateHighlights = DEFAULT_CORPORATE_HIGHLIGHTS;
  const videoPreviewUrl = SGB_COMPANY_PROFILE_URL;
  const hasVideoSource = Boolean(videoPreviewUrl);
  const activeSectionIndex = Math.max(
    NAV_ITEM_MENU.findIndex((item) => item.id === activeSection),
    0,
  );
  const corporateHeading = String(
    company?.name || "PT Solid Gold Berjangka",
  ).toUpperCase();

  return (
    <div
      data-company-theme="solid-gold"
      className="relative mx-auto min-h-screen max-w-md overflow-x-hidden bg-neutral-900"
    >
      <div className="fixed bottom-0 z-50 w-full max-w-md">
        <div className="rounded-full p-3 m-4 shadow-[0_-10px_15px_rgba(0,0,0,0.25)] bg-neutral-900/70 backdrop-blur border border-yellow-300/50">
          <div className="relative grid grid-cols-4 gap-2">
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-0 rounded-full border border-yellow-600 shadow-[0_14px_28px_rgba(217,119,6,0.28)] transition-transform duration-300 ease-out"
              style={{
                width: "calc(25% - 0.375rem)",
                transform: `translateX(calc(${activeSectionIndex * 100}% + ${
                  activeSectionIndex * 0.5
                }rem))`,
              }}
            />
            {NAV_ITEM_MENU.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSectionNavigate(item.id)}
                  aria-current={isActive ? "true" : "false"}
                  className={`relative z-10 flex cursor-pointer flex-col items-center justify-center rounded-full px-2 py-3 text-center transition-colors duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={`text-[1.35rem] transition-colors duration-300 ${
                      isActive ? "text-white" : "text-zinc-400"
                    }`}
                  />
                  <span
                    className={`mt-2 text-xs font-bold leading-tight transition-colors duration-300 ${
                      isActive
                        ? "text-yellow-500"
                        : "text-zinc-400 hover:text-zinc-700"
                    }`}
                  >
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
          className="space-y-4"
          id="profile"
          ref={registerSection("profile")}
        >
          <div className="absolute left-0 top-0 z-50">
            <div className="bg-neutral-900 px-5 py-3 rounded-br-2xl">
              <img
                className="h-7 w-auto object-contain"
                src={logoSGB}
                alt={company?.name || "Company logo"}
              />
            </div>
          </div>

          <div className="relative min-h-130 overflow-hidden bg-linear-0 from-neutral-900 to-neutral-400">
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center md:justify-end">
              {profile?.photo ? (
                <img
                  className="h-full max-h-130 w-full object-cover object-top"
                  src={profile.photo}
                  alt={profile?.name || "Foto profil"}
                />
              ) : (
                <div className="mb-10 mr-8 flex h-40 w-40 items-center justify-center rounded-full bg-white/80 text-5xl font-black text-slate-700 shadow-lg">
                  {getInitials(profile?.name) || "EC"}
                </div>
              )}
            </div>

            <div className="absolute bottom-0 z-50 px-4 w-full bg-linear-to-t from-neutral-900 to-transparent py-10">
              <div className="">
                <div className="flex items-center gap-1">
                  <div className="text-black bg-yellow-500 rounded-full w-fit px-3 py-0.5">
                    <p className="font-bold">
                      {profile?.licenseNumber || "Nomor Izin"}
                    </p>
                  </div>

                  <div>
                    <img
                      src={verifiedBadge}
                      alt="Logo Verified"
                      className="h-7"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <h1 className="text-2xl font-bold text-white drop-shadow-lg md:text-2xl">
                    {profile?.name || "Nama Profil"}
                  </h1>
                  <p className="text-lg text-yellow-600">{headline}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center px-4 gap-2">
            <a
              href={companyVideoUrl || "#"}
              onClick={
                companyVideoUrl ? undefined : (event) => event.preventDefault()
              }
              className="inline-flex w-full items-center justify-center gap-3 rounded-full h-full bg-amber-500 px-5 py-5 text-white"
              {...renderLinkTarget(companyVideoUrl)}
            >
              <FontAwesomeIcon
                icon={byPrefixAndName.fas.download}
                className="text-2xl"
              />
              <span className="w-fit text-center text-wrap md:text-lg">
                Brochure
              </span>
            </a>

            <a
              href={vcardHref}
              download={`${vcardName || "contact"}.vcf`}
              className="inline-flex w-full items-center justify-center gap-3 rounded-full h-full bg-neutral-50/50 border border-yellow-500 px-5 py-5 text-white"
            >
              <FontAwesomeIcon
                icon={byPrefixAndName.fas["address-book"]}
                className="text-2xl"
              />
              <span className="w-fit text-center text-wrap md:text-lg">
                Contact
              </span>
            </a>
          </div>

          <div className="bg-neutral-800 mx-4 py-3 px-3 rounded-full border border-yellow-500">
            <div className="flex items-center gap-4">
              <div className="bg-neutral-700 h-10 w-10 aspect-square rounded-full inline-flex">
                <img
                  src={iconGmaps}
                  alt="Logo Gmaps"
                  className="h-6 w-auto object-center object-contain mx-auto my-auto"
                />
              </div>
              {branch?.address ? (
                <p className="leading-5 text-white text-sm mr-3">
                  {branch.address}
                </p>
              ) : (
                "Belum ada alamat"
              )}
            </div>
          </div>

          <div className="mt-5 px-4 text-white">
            <h5 className="text-xl font-medium uppercase">About Me</h5>
            <div className="mt-3 border-l-4 border-yellow-500 pl-3">
              <p className="md:text-lg">
                {profile?.description || "Tidak ada deskripsi profil."}
              </p>
            </div>
          </div>

          <div className="mt-7 px-4 grid grid-cols-4 gap-2">
            {infoItems.map((item) => (
              <div
                key={item.id}
                className="aspect-square rounded-3xl border border-yellow-500 bg-neutral-800 p-2 text-center"
              >
                <div className="flex h-full flex-col items-center justify-center">
                  <img src={item.img} alt={item.label} className="h-10" />
                  <p className="mt-2 font-semibold text-white md:text-xl">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="legality"
          ref={registerSection("legality")}
          className="space-y-4 px-4 mt-20"
        >
          <div className="flex items-center justify-between">
            <h5 className="text-xl font-medium uppercase text-white">
              CERTIFICATIONS
            </h5>
          </div>

          <div className="mt-7">
            <div className="overflow-hidden rounded-3xl bg-neutral-700 border border-yellow-500 p-2 shadow">
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
          className="scroll-mt-28"
        >
          <div className="overflow-hidden rounded-t-[2.25rem] bg-neutral-900 mt-20">
            <div
              className="px-6 pb-7 pt-8 text-white"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(255, 183, 0, 0.92) 0%, rgba(176, 119, 18, 0.78) 34%, rgba(49, 34, 11, 0.82) 63%, oklch(20.5% 0 0) 100%), url(${gedungSgb})`,
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
              }}
            >
              <div className="mx-auto space-y-4 text-center">
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/90">
                    Company Overview
                  </p>
                  <h5 className="text-xl font-bold uppercase leading-tight text-white">
                    {corporateHeading}
                  </h5>
                </div>

                <p className="text-xl text-white/92">
                  PT Solid Gold Berjangka (SGB) adalah pialang berjangka resmi
                  sejak 2002, diawasi BAPPEBTI, berpengalaman 20+ tahun, dan
                  hadir di Jakarta, Semarang, serta Makassar.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                {corporateHighlights.map((item) => (
                  <div key={item.id} className="space-y-1.5">
                    <h6 className="wrap-break-words text-2xl font-bold leading-none text-white">
                      {item.label}
                    </h6>
                    <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/72">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 mt-10">
              <div className="overflow-hidden rounded-3xl">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  disabled={!hasVideoSource}
                  className="relative block aspect-video w-full cursor-pointer overflow-hidden rounded-3xl disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition hover:bg-black/28">
                    <div className="flex h-15 w-15 items-center gap-3 rounded-full border border-white bg-white/50 p-5 text-sm font-semibold text-white shadow-lg backdrop-blur-xs">
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
            </div>
          </div>
        </section>

        <section
          id="social-media"
          ref={registerSection("social-media")}
          className="scroll-mt-28 p-4"
        >
          <div className="text-white">
            <div className="flex w-fit items-center gap-2">
              <h5 className="text-xl font-medium uppercase">Contact</h5>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-2">
              {socialMediaItems.length ? (
                socialMediaItems.map((item) => {
                  const socialIcon = SOCIAL_MEDIA_IMAGE_BY_ID[item.id];
                  const socialUrl = normalizePublicLink(item.url);

                  return (
                    <a
                      key={item.id}
                      href={socialUrl}
                      className="block rounded-full border border-yellow-500/50 bg-neutral-800 p-4"
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
                        <p>
                          {getSocialMediaDisplayValue(item.value || item.url)}
                        </p>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="rounded-full border border-amber-100/50 bg-white/15 p-4">
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
          <div className="rounded-3xl border border-amber-200 bg-yellow-600/50 p-7 text-white">
            <div className="flex items-center gap-2">
              <img src={safeAlertFill} alt="Alert Icon" className="h-7" />
              <h6 className="text-xl font-bold text-yellow-500">
                Anti-Fraud Notice
              </h6>
            </div>
            <p className="mt-2 text-justify md:text-lg">
              {company?.name || "Perusahaan ini"} tidak pernah meminta kata
              sandi akun pribadi atau transfer ke akun individu. Semua transaksi
              harus dilakukan melalui akun terpisah resmi kami.
            </p>
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
                className="flex cursor-pointer items-center justify-end rounded-full text-[#dd2c00] shadow-[0_10px_24px_rgba(221,44,0,0.3)] transition hover:scale-105"
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
                  title={`${company?.name || "SGB"} Company Profile`}
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
