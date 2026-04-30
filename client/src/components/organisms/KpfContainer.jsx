import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import verifiedBadge from "../../assets/ic_round-verified.png";
import MediaPlaceholder from "../../assets/MediaPlaceholderKPF.png";
import worldStar from "../../assets/world-star.png";
import tiktokIcon from "../../assets/tiktok-icon.png";
import instagramIcon from "../../assets/instagram-icon.png";
import linkedinIcon from "../../assets/linkedin-icon.png";
import safeAlertFill from "../../assets/safe-alert-fill.png";
import LogoKPF from "../../assets/logo-kpf.png";
import iconBuilding from "../../assets/icon-building.png";
import { byPrefixAndName } from "../../utils/fontawesome";

const SOCIAL_MEDIA_IMAGE_BY_ID = {
  tiktok: tiktokIcon,
  instagram: instagramIcon,
  linkedin: linkedinIcon,
};

const KPF_COMPANY_PROFILE_URL =
  "https://www.youtube.com/embed/QYPPIo2xgJ8?si=hSBci4Y10ltstEyf";

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

function getKpfVideoEmbedUrl(url) {
  const value = String(url || "").trim();

  if (!value) {
    return KPF_COMPANY_PROFILE_URL;
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
          : KPF_COMPANY_PROFILE_URL;
      }
    }

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : KPF_COMPANY_PROFILE_URL;
    }
  } catch {
    return KPF_COMPANY_PROFILE_URL;
  }

  return KPF_COMPANY_PROFILE_URL;
}

export default function KpfContainer({
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
  infoItems,
  certificateImageSrc,
  certificateImageAlt,
  branch,
  corporateStats,
  socialMediaItems,
}) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const videoPreviewUrl = getKpfVideoEmbedUrl(companyVideoUrl);
  const hasVideoSource = Boolean(videoPreviewUrl);

  return (
    <div
      data-company-theme="kontak-perkasa"
      className="relative mx-auto min-h-screen max-w-md overflow-x-hidden bg-zinc-50"
    >
      <div className="fixed bottom-0 z-50 w-full max-w-md">
        <div className="rounded-t-3xl border border-white bg-white p-3 shadow-[0_-10px_15px_rgba(0,0,0,0.25)] backdrop-blur">
          <div className="grid grid-cols-4 gap-2">
            {sectionNavItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSectionNavigate(item.id)}
                  aria-current={isActive ? "true" : "false"}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl px-2 py-3 text-center transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-[0_14px_28px_rgba(4,120,87,0.28)]"
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

      <div className="mb-32 space-y-6">
        <section
          className="space-y-4 p-4"
          id="profile"
          ref={registerSection("profile")}
        >
          {companyBrand ? (
            <div className="flex items-center justify-center">
              <img
                className="h-12 w-auto object-contain"
                src={LogoKPF}
                alt={company?.name || "Company logo"}
              />
            </div>
          ) : null}

          <div className="relative min-h-[520px] overflow-hidden rounded-xl bg-zinc-400">
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center md:justify-end">
              {profile?.photo ? (
                <img
                  className="h-full max-h-[520px] w-auto object-contain object-bottom"
                  src={profile.photo}
                  alt={profile?.name || "Foto profil"}
                />
              ) : (
                <div className="mb-10 mr-8 flex h-40 w-40 items-center justify-center rounded-full bg-white/80 text-5xl font-black text-slate-700 shadow-lg">
                  {getInitials(profile?.name) || "EC"}
                </div>
              )}
            </div>

            <div className="absolute bottom-0 z-50 w-full pb-10 bg-linear-0 from-emerald-900/70 via-emerald-900/50 to-transparent p-4 pt-10 text-white">
              <div className="flex items-center gap-1 bg-sky-500 rounded-full w-fit px-2 py-0.5">
                <img src={verifiedBadge} alt="Logo Verified" className="h-4" />
                <p className="uppercase font-bold text-white">Verified</p>
              </div>
              <h1 className="text-2xl font-bold drop-shadow-lg md:text-2xl">
                {profile?.name || "Nama Profil"}
              </h1>
              <div className="">
                <p className="md:text-lg">{headline}</p>
                <p className="text-xl font-bold">
                  {profile?.licenseNumber || "Nomor Izin"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1.25fr_1fr] gap-2">
            <a
              href={companyVideoUrl || "#"}
              onClick={
                companyVideoUrl ? undefined : (event) => event.preventDefault()
              }
              className="inline-flex flex-col w-full items-center justify-center gap-1 rounded-xl border border-emerald-200 px-5 py-2 text-emerald-800"
              {...renderLinkTarget(companyVideoUrl)}
            >
              <div className="p-2 aspect-square rounded-full bg-emerald-100 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={byPrefixAndName.fas.download}
                  className="text-2xl"
                />
              </div>
              <p className="w-fit text-center text-wrap font-semibold md:text-lg">
                Download Company Brochure
              </p>
            </a>

            <a
              href={vcardHref}
              download={`${vcardName || "contact"}.vcf`}
              className="inline-flex flex-col w-full items-center justify-center gap-1 rounded-xl bg-emerald-700 px-7 py-2 text-white"
            >
              <div className="p-2 aspect-square rounded-full bg-emerald-600/50 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={byPrefixAndName.fas["address-book"]}
                  className="text-2xl"
                />
              </div>
              <p className="w-fit text-center text-wrap font-semibold md:text-lg">
                Save Contact
              </p>
            </a>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="border border-zinc-300 text-center rounded-2xl p-4">
              <FontAwesomeIcon
                icon={byPrefixAndName.fas.award}
                className="text-2xl text-[#705D00]"
              />
              <div className="mt-1">
                <h6 className="font-bold text-lg text-emerald-800">12+</h6>
                <p className="text-sm">Years Experience</p>
              </div>
            </div>
            <div className="border border-zinc-300 text-center rounded-2xl p-4">
              <FontAwesomeIcon
                icon={byPrefixAndName.fas["people-line"]}
                className="text-2xl text-[#705D00]"
              />
              <div className="mt-1">
                <h6 className="font-bold text-lg text-emerald-800">1000+</h6>
                <p className="text-sm">Clients</p>
              </div>
            </div>
            <div className="border border-zinc-300 text-center rounded-2xl p-4">
              <FontAwesomeIcon
                icon={byPrefixAndName.fas.shield}
                className="text-2xl text-[#705D00]"
              />
              <div className="mt-1">
                <h6 className="font-bold text-lg text-emerald-800">
                  Regulator
                </h6>
                <p className="text-sm">Bappebti</p>
              </div>
            </div>
          </div>

          <div className="mt-7 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 border-2 rounded-full border-emerald-800" />
              <h6 className="uppercase text-emerald-800 font-semibold text-xl">
                Executive Bio
              </h6>
            </div>
            <h5 className="text-2xl font-bold text-center">
              Precision in High- Yield Markets
            </h5>
            <p className="text-justify md:text-lg">
              {profile?.description || "Tidak ada deskripsi profil."}
            </p>
          </div>

          {/* <div className="mt-7 grid grid-cols-4 gap-2">
            {infoItems.map((item) => (
              <div
                key={item.id}
                className="aspect-square rounded-3xl border border-emerald-200 bg-emerald-50 p-2 text-center"
              >
                <div className="flex h-full flex-col items-center justify-center">
                  <img src={item.img} alt={item.label} className="h-10" />
                  <p className="mt-2 font-semibold text-black md:text-xl">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div> */}
        </section>

        <section
          id="legality"
          ref={registerSection("legality")}
          className="space-y-4 bg-white rounded-3xl shadow-[0_0_5px_rgba(0,0,0,0.25)] p-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-10 border-2 rounded-full border-emerald-800" />
            <h6 className="uppercase text-emerald-800 font-semibold text-xl">
              LEGAL VERIFICATION
            </h6>
          </div>

          <p className="text-2xl font-semibold text-center">
            Licensed financial stewardship you can rely on.
          </p>

          <div className="mt-7">
            <div className="overflow-hidden rounded-3xl bg-zinc-50 p-2 shadow">
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
          <div className="flex items-center gap-2">
            <div className="w-10 border-2 rounded-full border-emerald-800" />
            <h6 className="uppercase text-emerald-800 font-semibold text-xl">
              corporate heritage
            </h6>
          </div>

          <p className="text-3xl font-semibold text-center">
            Financial Stewardship You Can Trust
          </p>

          <div className="relative bg-zinc-800 text-white p-7 rounded-4xl space-y-3">
            <img
              src={iconBuilding}
              alt="Company Logo"
              className="mx-auto w-50 absolute top-0 right-0"
            />
            <p className="font-bold text-xl">PT Kontakperkasa Futures</p>
            <p className="text-lg">
              PT Kontakperkasa Futures, pialang berjangka resmi sejak 2000 yang
              diawasi BAPPEBTI, OJK, dan Bank Indonesia, hadir dengan layanan
              trading aman, profesional, dan terpercaya untuk memaksimalkan
              peluang investasi Anda.
            </p>
            <div className="mt-7 flex gap-3 items-center">
              <div>
                <h6 className="text-yellow-500 text-2xl font-semibold">#1</h6>
                <p className="text-lg text-zinc-300 uppercase">Top Broker</p>
              </div>

              <div className="w-px bg-zinc-600 self-stretch " />

              <div>
                <h6 className="text-yellow-500 text-2xl font-semibold">12</h6>
                <p className="text-lg text-zinc-300 uppercase">Branches</p>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-3">
            <div className="p-2 border-2 border-zinc-300 rounded-xl">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={byPrefixAndName.fas["shield-alt"]}
                  className="text-2xl text-[#705D00]"
                />
                <span>JFX Member</span>
              </div>
            </div>
            <div className="p-2 border-2 border-zinc-300 rounded-xl">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={byPrefixAndName.far["circle-check"]}
                  className="text-2xl text-[#705D00]"
                />
                <span>KBI Member</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
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
          </div>
        </section>

        <section
          id="social-media"
          ref={registerSection("social-media")}
          className="scroll-mt-28 p-4"
        >
          <div className="rounded-3xl bg-linear-to-r from-emerald-800 to-teal-600 p-7 text-white">
            <div className="mx-auto flex w-fit items-center gap-2 text-center">
              <img src={worldStar} alt="World Star" />
              <h5 className="text-2xl font-bold">My Social Media</h5>
            </div>

            <div className="mt-7 space-y-4">
              {socialMediaItems.length ? (
                socialMediaItems.map((item) => {
                  const socialIcon = SOCIAL_MEDIA_IMAGE_BY_ID[item.id];
                  const socialUrl = normalizePublicLink(item.url);

                  return (
                    <a
                      key={item.id}
                      href={socialUrl}
                      className="block rounded-full border border-emerald-100/50 bg-white/15 p-4"
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
                <div className="rounded-full border border-emerald-100/50 bg-white/15 p-4">
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
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7">
            <div className="flex items-center gap-2">
              <img src={safeAlertFill} alt="Alert Icon" className="h-7" />
              <h6 className="text-xl font-bold text-emerald-800">
                Anti-Fraud Notice
              </h6>
            </div>
            <p className="mt-2 text-justify md:text-lg">
              {company?.name || "Perusahaan ini"} tidak pernah meminta transfer
              ke rekening pribadi. Semua transaksi harus mengikuti prosedur
              resmi perusahaan dan hanya dilakukan melalui rekening yang
              terverifikasi.
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
                className="flex cursor-pointer items-center justify-end rounded-full text-emerald-700 shadow-[0_10px_24px_rgba(4,120,87,0.3)] transition hover:scale-105"
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
                  title={`${company?.name || "KPF"} Company Profile`}
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
