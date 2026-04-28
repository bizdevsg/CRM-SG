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
import LogoKPF from "../../assets/logo-kpf.png";

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
                <FontAwesomeIcon icon={faDownload} className="text-2xl" />
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
                <FontAwesomeIcon icon={faAddressBook} className="text-2xl" />
              </div>
              <p className="w-fit text-center text-wrap font-semibold md:text-lg">
                Save Contact
              </p>
            </a>
          </div>

          <div className="mt-5 space-y-2">
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

          <div className="mt-7 grid grid-cols-4 gap-2">
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
          </div>
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

          <p className="text-4xl font-semibold text-center">
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

          <p className="text-4xl font-semibold text-center">
            Financial Stewardship You Can Trust
          </p>

          <div className="bg-zinc-800 text-white p-7 rounded-4xl space-y-3">
            <p className="font-bold text-xl">PT Kontakperkasa Futures</p>
            <p className="text-xl">
              PT Kontakperkasa Futures, pialang berjangka resmi sejak 2000 yang
              diawasi BAPPEBTI, OJK, dan Bank Indonesia, hadir dengan layanan
              trading aman, profesional, dan terpercaya untuk memaksimalkan
              peluang investasi Anda.
            </p>
            <div className="flex gap-3 items-center">
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

          <div className="space-y-8">
            <div className="space-y-2">
              <h6 className="text-xl font-bold text-emerald-800">
                {company?.name || "Profil Perusahaan"}
              </h6>
              <p className="text-justify md:text-lg">
                {company?.description ||
                  "Isi desain dan copy Kontak Perkasa Futures nanti kamu bisa bedakan di sini."}
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
                  <h5 className="break-words text-2xl font-bold text-emerald-800 md:text-3xl">
                    {item.value}
                  </h5>
                  <p className="font-semibold text-zinc-400 md:text-xl">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-3xl">
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
                          <FontAwesomeIcon icon={faGlobe} className="h-5" />
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
                    <FontAwesomeIcon icon={faGlobe} className="h-5" />
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
    </div>
  );
}
