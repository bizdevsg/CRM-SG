import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faCheckCircle,
  faDownload,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import verifiedBadge from "../../assets/ic_round-verified.png";
import googleMapIcon from "../../assets/google-map-icon.png";
import MediaPlaceholder from "../../assets/MediaPlaceholder.png";
import worldStar from "../../assets/world-star.png";
import tiktokIcon from "../../assets/tiktok-icon.png";
import instagramIcon from "../../assets/instagram-icon.png";
import linkedinIcon from "../../assets/linkedin-icon.png";
import safeAlertFill from "../../assets/safe-alert-fill.png";

const SOCIAL_MEDIA_IMAGE_BY_ID = {
  tiktok: tiktokIcon,
  instagram: instagramIcon,
  linkedin: linkedinIcon,
};

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
  return (
    <div
      data-company-theme="solid-gold"
      className="relative mx-auto min-h-screen max-w-md overflow-x-hidden bg-white"
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
                      ? "bg-amber-600 text-white shadow-[0_14px_28px_rgba(217,119,6,0.28)]"
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
        <section className="space-y-4 p-4" id="profile" ref={registerSection("profile")}>
          {companyBrand ? (
            <div className="absolute left-6 top-6 z-50">
              {companyBrand.logoSrc ? (
                <img
                  className="h-12 w-auto object-contain"
                  src={companyBrand.logoSrc}
                  alt={company?.name || "Company logo"}
                />
              ) : (
                <div className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-2xl bg-amber-500 px-4 text-sm font-bold tracking-[0.18em] text-white">
                  {companyBrand.shortName}
                </div>
              )}
            </div>
          ) : null}

          <div className="relative min-h-[520px] overflow-hidden rounded-xl bg-[linear-gradient(145deg,rgba(217,119,6,0.22)_0%,rgba(255,251,235,0.96)_42%,rgba(255,255,255,0.98)_100%)]">
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

            <div className="absolute bottom-5 z-50 rounded-r-xl bg-white/70 p-4 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-black drop-shadow-lg md:text-2xl">
                  {profile?.name || "Nama Profil"}
                </h1>
                <div>
                  <img src={verifiedBadge} alt="Logo Verified" className="h-5 md:h-6" />
                </div>
              </div>
              <div className="text-amber-700">
                <p className="md:text-lg">{headline}</p>
                <p className="text-lg font-bold">
                  {profile?.licenseNumber || "Nomor Izin"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href={companyVideoUrl || "#"}
              onClick={companyVideoUrl ? undefined : (event) => event.preventDefault()}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-amber-500 px-7 py-2 text-white"
              {...renderLinkTarget(companyVideoUrl)}
            >
              <FontAwesomeIcon icon={faDownload} className="text-2xl" />
              <span className="w-fit text-center text-wrap md:text-lg">
                Download Company Brochure
              </span>
            </a>

            <a
              href={vcardHref}
              download={`${vcardName || "contact"}.vcf`}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-amber-200 px-5 py-2 text-amber-700"
            >
              <FontAwesomeIcon icon={faAddressBook} className="text-2xl" />
              <span className="w-fit text-center text-wrap md:text-lg">
                Save Contact
              </span>
            </a>
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
                className="aspect-square rounded-3xl border border-amber-200 bg-amber-50 p-2 text-center"
              >
                <div className="flex h-full flex-col items-center justify-center">
                  <img src={item.img} alt={item.label} className="h-10" />
                  <p className="mt-2 font-semibold text-black md:text-xl">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="legality" ref={registerSection("legality")} className="space-y-4 bg-amber-50/80 p-4">
          <div className="flex items-center justify-between">
            <h5 className="text-2xl font-bold">Legal Integrity</h5>
            <div className="w-fit rounded-full border border-amber-300 bg-amber-100 px-2 py-1 text-amber-800">
              Verified <FontAwesomeIcon icon={faCheckCircle} />
            </div>
          </div>

          <div className="mt-7">
            <div className="overflow-hidden rounded-3xl bg-white p-2 shadow">
              <img src={certificateImageSrc} alt={certificateImageAlt} className="w-full overflow-hidden rounded-2xl" />
            </div>
          </div>
        </section>

        <section id="corporate" ref={registerSection("corporate")} className="scroll-mt-28 space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h5 className="text-2xl font-bold">Corporate Heritage</h5>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <h6 className="text-xl font-bold text-amber-700">{company?.name || "Profil Perusahaan"}</h6>
              <p className="text-justify md:text-lg">
                {company?.description || "Isi desain dan copy Solid Gold nanti kamu bisa bedakan di sini."}
              </p>
            </div>

            <div className="flex items-start gap-1">
              <img src={googleMapIcon} alt="Google Map" className="h-fit" />
              <p className="text-sm md:text-base">{branch?.address || "Alamat cabang belum tersedia."}</p>
            </div>

            <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-3xl text-center shadow">
              {corporateStats.map((item) => (
                <div key={item.id} className="flex flex-col items-center justify-center bg-white p-4">
                  <h5 className="break-words text-2xl font-bold text-amber-700 md:text-3xl">{item.value}</h5>
                  <p className="font-semibold text-zinc-400 md:text-xl">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-3xl">
              {companyVideoUrl ? (
                <a href={companyVideoUrl} {...renderLinkTarget(companyVideoUrl)}>
                  <img src={MediaPlaceholder} alt="Media Placeholder" />
                </a>
              ) : (
                <img src={MediaPlaceholder} alt="Media Placeholder" />
              )}
            </div>
          </div>
        </section>

        <section id="social-media" ref={registerSection("social-media")} className="scroll-mt-28 p-4">
          <div className="rounded-3xl bg-linear-to-r from-amber-700 to-orange-500 p-7 text-white">
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
                      className="block rounded-full border border-amber-100/50 bg-white/15 p-4"
                      {...renderLinkTarget(socialUrl)}
                    >
                      <div className="mx-auto flex w-fit items-center gap-2">
                        {socialIcon ? (
                          <img src={socialIcon} alt={`${item.label} Icon`} className="h-5" />
                        ) : (
                          <FontAwesomeIcon icon={faGlobe} className="h-5" />
                        )}
                        <p>{getSocialMediaDisplayValue(item.value || item.url)}</p>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="rounded-full border border-amber-100/50 bg-white/15 p-4">
                  <div className="mx-auto flex w-fit items-center gap-2">
                    <FontAwesomeIcon icon={faGlobe} className="h-5" />
                    <p>Belum ada social media</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="p-4">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-7">
            <div className="flex items-center gap-2">
              <img src={safeAlertFill} alt="Alert Icon" className="h-7" />
              <h6 className="text-xl font-bold text-amber-800">Anti-Fraud Notice</h6>
            </div>
            <p className="mt-2 text-justify md:text-lg">
              {company?.name || "Perusahaan ini"} tidak pernah meminta transfer ke rekening pribadi.
              Semua transaksi harus mengikuti prosedur resmi perusahaan dan hanya dilakukan melalui rekening yang
              terverifikasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
