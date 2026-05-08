import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import riffanBg from "../../assets/RFB BCG 1.png";
import verifiedBadge from "../../assets/ic_round-verified.png";
import googleMapIcon from "../../assets/google-map-icon.png";
import MediaPlaceholder from "../../assets/MediaPlaceholder.png";
import worldStar from "../../assets/world-star.png";
import tiktokIcon from "../../assets/tiktok-icon.png";
import instagramIcon from "../../assets/instagram-icon.png";
import linkedinIcon from "../../assets/linkedin-icon.png";
import safeAlertFill from "../../assets/safe-alert-fill.png";
import rfbCompanyProfilePdf from "../../assets/brosur-pt/CP-RFB-Mei2026.pdf";
import { byPrefixAndName } from "../../utils/fontawesome";
import PublicJobApplicationSection from "./PublicJobApplicationSection";

const SOCIAL_MEDIA_IMAGE_BY_ID = {
  tiktok: tiktokIcon,
  instagram: instagramIcon,
  linkedin: linkedinIcon,
};

const RFB_COMPANY_PROFILE_URL =
  "https://www.youtube.com/embed/049Pdi7X2Ns?si=YOaaHf_NUW38Yp3g";

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

function getRfbVideoEmbedUrl(url) {
  const value = String(url || "").trim();

  if (!value) {
    return RFB_COMPANY_PROFILE_URL;
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
          : RFB_COMPANY_PROFILE_URL;
      }
    }

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : RFB_COMPANY_PROFILE_URL;
    }
  } catch {
    return RFB_COMPANY_PROFILE_URL;
  }

  return RFB_COMPANY_PROFILE_URL;
}

export default function RfbContainer({
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
  jobApplicationEcardSlug,
}) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [companyProfileModalOpen, setCompanyProfileModalOpen] = useState(false);
  const videoPreviewUrl = getRfbVideoEmbedUrl(companyVideoUrl);
  const hasVideoSource = Boolean(videoPreviewUrl);
  const activeSectionIndex = Math.max(
    sectionNavItems.findIndex((item) => item.id === activeSection),
    0,
  );

  return (
    <div
      data-company-theme="riffan"
      className="relative mx-auto min-h-screen max-w-md overflow-x-hidden bg-zinc-50 font-sans"
    >
      <div className="fixed bottom-0 z-50 w-full max-w-md">
        <div className="rounded-t-3xl border border-white bg-white p-3 shadow-[0_-10px_15px_rgba(0,0,0,0.25)] backdrop-blur">
          <div className="relative grid grid-cols-4 gap-2">
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-0 rounded-2xl bg-red-900 shadow-[0_14px_28px_rgba(127,29,29,0.28)] transition-transform duration-300 ease-out"
              style={{
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
                  className={`relative z-10 flex cursor-pointer flex-col items-center justify-center rounded-2xl px-2 py-3 text-center transition-colors duration-300 ${
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
                  <span className="mt-2 text-xs font-bold leading-tight transition-colors duration-300">
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
              {companyBrand.logoSrc ? (
                <img
                  className="h-12 w-auto object-contain"
                  src={companyBrand.logoSrc}
                  alt={company?.name || "Company logo"}
                />
              ) : (
                <div className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-bold tracking-[0.18em] text-white">
                  {companyBrand.shortName}
                </div>
              )}
            </div>
          ) : null}

          <div
            className="relative min-h-[520px] overflow-hidden rounded-xl bg-white bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${riffanBg})` }}
          >
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

            <div className="absolute bottom-5 z-50 rounded-r-xl bg-white/70 p-4 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-black drop-shadow-lg md:text-2xl">
                  {profile?.name || "Nama Profil"}
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
                <p className="text-lg font-bold">
                  {profile?.licenseNumber || "Nomor Izin"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={rfbCompanyProfilePdf}
              title="Download"
              onClick={(event) => {
                event.preventDefault();
                setCompanyProfileModalOpen(true);
              }}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-red-800 px-7 py-2 text-white cursor-pointer"
            >
              <FontAwesomeIcon
                icon={byPrefixAndName.fas.download}
                className="text-2xl"
              />
              <span className="w-fit text-center font-semibold text-wrap">
                Download Company Profile
              </span>
            </a>

            <a
              href={vcardHref}
              download={`${vcardName || "contact"}.vcf`}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 px-5 py-2 text-red-800 cursor-pointer"
            >
              <FontAwesomeIcon
                icon={byPrefixAndName.fas["address-book"]}
                className="text-2xl"
              />
              <span className="w-fit text-cente font-semibold text-wrap">
                Save Contact
              </span>
            </a>
          </div>

          <div className="mt-5 space-y-4">
            <h5 className="text-2xl font-bold">Profile</h5>
            <p className="text-justify md:text-lg">
              {profile?.description || "Tidak ada deskripsi profil."}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-4 gap-2">
            {infoItems.map((item) => (
              <div
                key={item.id}
                className="aspect-square rounded-3xl border border-red-300 bg-red-100 p-2 text-center"
              >
                <div className="flex h-full flex-col items-center justify-center">
                  <img src={item.img} alt={item.label} className="h-10" />
                  <p className="mt-2 font-semibold text-black md:text-xl">
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
          className="space-y-4 bg-zinc-200 p-4"
        >
          <div className="flex items-center justify-between">
            <h5 className="text-2xl font-bold">Legal Integrity</h5>
            <div className="w-fit rounded-full border border-green-400 bg-green-200 px-2 py-1 font-semibold text-green-800">
              Verified{" "}
              <FontAwesomeIcon icon={byPrefixAndName.far["circle-check"]} />
            </div>
          </div>

          <div className="mt-7">
            {certificates?.length ? (
              <div className="space-y-4">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="overflow-hidden rounded-3xl bg-white p-2 shadow"
                  >
                    <img
                      src={certificate.imagePath}
                      alt={certificate.title || "Sertifikat"}
                      className="w-full overflow-hidden rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            ) : certificateImageSrc ? (
              <div className="overflow-hidden rounded-3xl bg-white p-2 shadow">
                <img
                  src={certificateImageSrc}
                  alt={certificateImageAlt}
                  className="w-full overflow-hidden rounded-2xl"
                />
              </div>
            ) : (
              <div className="rounded-3xl border border-zinc-300 bg-white/80 px-4 py-5 text-sm text-zinc-500">
                Sertifikat belum tersedia.
              </div>
            )}
          </div>
        </section>

        <section
          id="corporate"
          ref={registerSection("corporate")}
          className="scroll-mt-28 space-y-4 p-4"
        >
          <div className="flex items-center justify-between">
            <h5 className="text-2xl font-bold">Corporate Heritage</h5>
          </div>

          <div className="space-y-8 mt-5">
            <div className="space-y-2">
              <h6 className="text-xl font-bold text-red-800">
                {company?.name || "Profil Perusahaan"}
              </h6>

              <p className="">
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
                {branch?.address || "Alamat cabang belum tersedia."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-3xl text-center shadow">
              {corporateStats.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center justify-center bg-white p-4"
                >
                  <h5 className="break-words text-2xl font-bold text-red-700 md:text-3xl">
                    {item.value}
                  </h5>
                  <p className="font-semibold text-zinc-400 md:text-xl">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-3xl">
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                disabled={!hasVideoSource}
                className="relative block w-full overflow-hidden rounded-3xl aspect-video cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition hover:bg-black/28">
                  <div className="flex items-center gap-3 rounded-full bg-white/50 backdrop-blur-xs p-5 h-15 w-15 text-sm font-semibold text-white shadow-lg border border-white">
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
          <div className="rounded-3xl bg-linear-to-r from-red-800 to-red-700 p-7">
            <div className="mx-auto flex w-fit items-center gap-2 text-center">
              <img src={worldStar} alt="World Star" />
              <h5 className="text-2xl font-bold text-white">My Social Media</h5>
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
                      className="block rounded-full border border-red-200/50 bg-red-100/20 p-4"
                      {...renderLinkTarget(socialUrl)}
                    >
                      <div className="mx-auto flex w-fit items-center gap-2 text-white">
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
                <div className="rounded-full border border-red-200/50 bg-red-100/20 p-4">
                  <div className="mx-auto flex w-fit items-center gap-2 text-white">
                    <FontAwesomeIcon
                      icon={byPrefixAndName.fas.globe}
                      className="h-5"
                    />
                    <p>Belum ada social media</p>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setJobModalOpen(true)}
              className="mt-4 block w-full rounded-full border border-red-200/50 bg-red-100/20 p-4 transition hover:bg-red-100/30"
            >
              <div className="mx-auto flex w-fit items-center gap-2 text-white">
                <FontAwesomeIcon icon={byPrefixAndName.fas.briefcase} className="h-5" />
                <p>Loker</p>
              </div>
            </button>
          </div>
        </section>

        <div className="p-4">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-7">
            <div className="flex items-center gap-2">
              <img src={safeAlertFill} alt="Alert Icon" className="h-7" />
              <h6 className="text-xl font-bold text-red-900">
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
                className="flex items-center justify-end rounded-full text-[#dd2c00] shadow-[0_10px_24px_rgba(221,44,0,0.3)] transition hover:scale-105 cursor-pointer"
                aria-label="Tutup video"
              >
                <FontAwesomeIcon
                  icon={byPrefixAndName.fas["circle-xmark"]}
                  className="text-lg"
                />
              </button>
            </div>

            <div className="overflow-hidden rounded-lg bg-slate-950 mt-4 shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
              <div className="aspect-video w-full bg-black">
                <iframe
                  className="block h-full w-full"
                  src={videoPreviewUrl}
                  title={`${company?.name || "RFB"} Company Profile`}
                  allow="autoplay; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {jobModalOpen ? (
        <div
          className="fixed inset-0 z-[91] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setJobModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h6 className="text-lg font-bold text-slate-900">Form Loker</h6>
              <button
                type="button"
                onClick={() => setJobModalOpen(false)}
                className="rounded-full text-red-700 transition hover:scale-105"
                aria-label="Tutup form loker"
              >
                <FontAwesomeIcon icon={byPrefixAndName.fas["circle-xmark"]} className="text-xl" />
              </button>
            </div>
            <PublicJobApplicationSection
              ecardSlug={jobApplicationEcardSlug}
              className=""
              titleClassName="hidden"
              descriptionClassName="mb-3 text-sm text-slate-500"
              errorClassName="text-sm text-rose-600"
              successClassName="text-sm text-emerald-600"
              submitButtonClassName="w-full rounded-xl bg-red-800 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
      ) : null}

      {companyProfileModalOpen ? (
        <div
          className="fixed inset-0 z-[92] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setCompanyProfileModalOpen(false)}
        >
          <div
            className="relative flex h-[92vh] w-full max-w-4xl flex-col rounded-xl bg-white p-3 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:h-[88vh] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <h6 className="text-lg font-bold text-slate-900">Company Profile</h6>
              <button
                type="button"
                onClick={() => setCompanyProfileModalOpen(false)}
                className="flex cursor-pointer items-center justify-end rounded-full text-[#dd2c00] transition hover:scale-105"
                aria-label="Tutup preview company profile"
              >
                <FontAwesomeIcon
                  icon={byPrefixAndName.fas["circle-xmark"]}
                  className="text-xl"
                />
              </button>
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <object
                data={`${rfbCompanyProfilePdf}#view=FitH`}
                type="application/pdf"
                className="h-full w-full"
              >
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="text-sm text-slate-600">
                    Preview PDF tidak didukung di device ini.
                  </p>
                  <a
                    href={rfbCompanyProfilePdf}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Buka Full Screen
                  </a>
                </div>
              </object>
            </div>

            <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-3">
              <a
                href={rfbCompanyProfilePdf}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-800"
              >
                Buka Full
              </a>
              <a
                href={rfbCompanyProfilePdf}
                download="CP-RFB-Mei2026.pdf"
                className="inline-flex items-center justify-center rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
