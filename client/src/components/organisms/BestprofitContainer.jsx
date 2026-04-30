import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import verifiedBadge from "../../assets/logoverif-putih.png";
import googleMapIcon from "../../assets/google-map-icon.png";
import MediaPlaceholder from "../../assets/MediaPlaceholderBPF.png";
import worldStar from "../../assets/world-star.png";
import tiktokIcon from "../../assets/qlementine-icons_tiktok-16.png";
import instagramIcon from "../../assets/mdi_instagram.png";
import linkedinIcon from "../../assets/ri_linkedin-box-fill.png";
import safeAlertFill from "../../assets/mingcute_safe-alert-line.png";
import LogoBPF from "../../assets/logoBPF.png";
import logoBPF2 from "../../assets/LOGO-BPF-2.png";
import { byPrefixAndName } from "../../utils/fontawesome";

const SOCIAL_MEDIA_IMAGE_BY_ID = {
  tiktok: tiktokIcon,
  instagram: instagramIcon,
  linkedin: linkedinIcon,
};

const BESTPROFIT_COMPANY_PROFILE_URL =
  "https://www.youtube.com/embed/H0o0szp8_rE?si=lpVgqHmyNeedN5sc";

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

function getBestprofitVideoEmbedUrl(url) {
  const value = String(url || "").trim();

  if (!value) {
    return BESTPROFIT_COMPANY_PROFILE_URL;
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
          : BESTPROFIT_COMPANY_PROFILE_URL;
      }
    }

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : BESTPROFIT_COMPANY_PROFILE_URL;
    }
  } catch {
    return BESTPROFIT_COMPANY_PROFILE_URL;
  }

  return BESTPROFIT_COMPANY_PROFILE_URL;
}

export default function BestprofitContainer({
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
  certificates,
  certificateImageSrc,
  certificateImageAlt,
  branch,
  corporateStats,
  socialMediaItems,
}) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const videoPreviewUrl = getBestprofitVideoEmbedUrl(companyVideoUrl);
  const hasVideoSource = Boolean(videoPreviewUrl);

  return (
    <div
      data-company-theme="bestprofit"
      className="relative mx-auto min-h-screen max-w-md overflow-x-hidden bg-white"
    >
      <div className="fixed bottom-0 z-50 w-full max-w-md">
        <div className="border border-white bg-white px-3 pb-3 shadow-[0_-10px_15px_rgba(0,0,0,0.25)] backdrop-blur">
          <div className="grid grid-cols-4 gap-2">
            {sectionNavItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSectionNavigate(item.id)}
                  aria-current={isActive ? "true" : "false"}
                  className={`flex cursor-pointer flex-col items-center justify-center px-2 py-3 text-center transition-all duration-200 ${
                    isActive
                      ? "border-t-4 border-sky-700"
                      : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 hover:border-t-4 hover:border-sky-700"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={`text-[1.35rem] ${isActive ? "text-sky-700" : "text-zinc-400"}`}
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
                src={LogoBPF}
                alt={company?.name || "Company logo"}
              />
            </div>
          ) : null}

          <div className="relative min-h-[520px] overflow-hidden rounded-xl bg-sky-100">
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

            <div className="absolute bottom-0 z-50 w-full bg-linear-0 from-sky-900 via-sky-900 to-transparent p-4 pt-10 text-white">
              <div className="flex items-center gap-1 bg-sky-500 rounded-full w-fit px-2 py-0.5">
                <img src={verifiedBadge} alt="Logo Verified" className="h-4" />
                <p className="uppercase font-bold text-white">Verified</p>
              </div>
              <h1 className="text-2xl font-bold drop-shadow-lg md:text-3xl">
                {profile?.name || "Nama Profil"}
              </h1>
              <div className="">
                <p className="md:text-lg">{headline}</p>
                <p className="text-2xl font-bold">
                  {profile?.licenseNumber || "Nomor Izin"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={companyVideoUrl || "#"}
              onClick={
                companyVideoUrl ? undefined : (event) => event.preventDefault()
              }
              className="inline-flex flex-col w-full items-center justify-center gap-1 rounded-xl border border-sky-200 px-5 py-4 text-sky-800 hover:bg-slate-100 transition-all"
              {...renderLinkTarget(companyVideoUrl)}
            >
              <FontAwesomeIcon
                icon={byPrefixAndName.fas.download}
                className="text-2xl"
              />
              <span className="w-fit text-center text-wrap">
                Company Profile Brochure
              </span>
            </a>

            <a
              href={vcardHref}
              download={`${vcardName || "contact"}.vcf`}
              className="inline-flex flex-col w-full items-center justify-center gap-1 rounded-xl bg-sky-900 hover:bg-sky-800 px-7 py-4 text-white transition-all"
            >
              <FontAwesomeIcon
                icon={byPrefixAndName.fas["address-book"]}
                className="text-2xl"
              />
              <span className="w-fit text-center text-wrap md:text-lg">
                Save Contact
              </span>
            </a>
          </div>

          <div className="border-y border-sky-200 py-4">
            <div className="flex items-center justify-between gap-3 px-10">
              <div className="flex flex-col items-center">
                <h6 className="text-red-500 font-semibold">10+</h6>
                <p className="uppercase text-zinc-500 font-bold">Years EXP</p>
              </div>
              <div className="min-h-10 w-px bg-sky-200" />
              <div className="flex flex-col items-center">
                <h6 className="text-red-500 font-semibold">500+</h6>
                <p className="uppercase text-zinc-500 font-bold">CLIENTS</p>
              </div>
              <div className="min-h-10 w-px bg-sky-200" />
              <div className="flex flex-col items-center">
                <h6 className="text-red-500 font-semibold">A+</h6>
                <p className="uppercase text-zinc-500 font-bold">RATING</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h5 className="text-2xl font-bold">Profile</h5>
            <p className="text-justify md:text-lg">
              {profile?.description || "Tidak ada deskripsi profil."}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-4 gap-2">
            {infoItems.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-sky-200 bg-sky-50 py-2 px-3 text-center"
              >
                <div className="flex h-full items-center gap-1 justify-center">
                  <img src={item.img} alt={item.label} className="h-6" />
                  <p className="font-semibold text-black text-sm">
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
          className="space-y-4 m-4 p-4 border border-sky-200 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <h5 className="text-2xl font-bold">Regulatory Status</h5>
          </div>

          <div className="mt-7">
            {certificates?.length ? (
              <div className="space-y-4">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="overflow-hidden rounded-2xl shadow"
                  >
                    <img
                      src={certificate.imagePath}
                      alt={certificate.title || "Sertifikat"}
                      className="h-full overflow-hidden rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-sky-200 bg-white/80 px-4 py-5 text-sm text-slate-500">
                Sertifikat belum tersedia.
              </div>
            )}
          </div>
        </section>

        <section
          id="corporate"
          ref={registerSection("corporate")}
          className="scroll-mt-28 space-y-8 p-4"
        >
          <div className="relative overflow-hidden rounded-[28px] shadow-xl bg-[#073d70]">
            <img
              src={logoBPF2}
              alt="Bestprofit Futures"
              className="pointer-events-none absolute left-0 top-[-200px] h-full w-full object-contain"
            />

            <div className="relative z-10 space-y-7 text-white pt-32 bg-linear-0 from-[#073d70] via-[#073d70] to-[#073d70]/50 p-7">
              <div>
                <h5 className="text-2xl font-extrabold uppercase tracking-wide">
                  Corporate
                </h5>

                <h6 className="mt-2 text-2xl font-bold">
                  {company?.name || "PT Bestprofit Futures"}
                </h6>
              </div>

              <p className="max-w-xl text-lg leading-9 text-white/85">
                PT Bestprofit Futures, pialang berjangka resmi berizin BAPPEBTI
                sejak 2004, hadir dengan 12 kantor di Indonesia untuk memberikan
                layanan perdagangan berjangka yang aman, terpercaya, dan
                profesional bagi kesuksesan investasi Anda.
              </p>

              <div className="h-px w-full bg-white/70" />

              <div className="grid grid-cols-3 items-center text-white">
                <div>
                  <h6 className="text-2xl font-extrabold">10+</h6>
                  <p className="mt-1 text-sm font-medium uppercase tracking-wide text-white/60">
                    Branches
                  </p>
                </div>

                <div className="border-x border-white/70 px-6">
                  <h6 className="text-2xl font-extrabold">24/5</h6>
                  <p className="mt-1 text-sm font-medium uppercase tracking-wide text-white/60">
                    Support
                  </p>
                </div>

                <div className="pl-6">
                  <h6 className="text-2xl font-extrabold">Bappebti</h6>
                  <p className="mt-1 text-sm font-medium uppercase tracking-wide text-white/60">
                    Legality
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-1">
            <img src={googleMapIcon} alt="Google Map" className="h-fit" />
            <p className="text-sm md:text-base">
              {branch?.address || "Alamat cabang belum tersedia."}
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border-2 border-sky-900">
            <button
              type="button"
              onClick={() => setVideoModalOpen(true)}
              disabled={!hasVideoSource}
              className="relative block aspect-video w-full overflow-hidden cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
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
        </section>

        <section
          id="social-media"
          ref={registerSection("social-media")}
          className="scroll-mt-28 p-4"
        >
          <div className="">
            <div className="mx-auto flex w-fit items-center gap-2 text-center">
              <h5 className="text-xl font-bold">CONNECT ON MY SOCIALS</h5>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              {socialMediaItems.length ? (
                socialMediaItems.map((item) => {
                  const socialIcon = SOCIAL_MEDIA_IMAGE_BY_ID[item.id];
                  const socialUrl = normalizePublicLink(item.url);

                  return (
                    <a
                      key={item.id}
                      href={socialUrl}
                      className="block rounded-xl border border-sky-500/50 bg-white/15 p-4"
                      {...renderLinkTarget(socialUrl)}
                    >
                      <div className="mx-auto flex flex-col w-fit items-center gap-2">
                        {socialIcon ? (
                          <img
                            src={socialIcon}
                            alt={`${item.label} Icon`}
                            className="h-7"
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
                <div className="rounded-full border border-sky-100/50 bg-white/15 p-4">
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
          <div className="rounded-3xl border border-red-200 bg-red-50 p-7">
            <div className="flex items-center gap-2">
              <img src={safeAlertFill} alt="Alert Icon" className="h-7" />
              <h6 className="text-xl font-bold text-red-500">
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
                className="flex cursor-pointer items-center justify-end rounded-full text-sky-700 shadow-[0_10px_24px_rgba(3,105,161,0.3)] transition hover:scale-105"
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
                  title={`${company?.name || "Bestprofit"} Company Profile`}
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
