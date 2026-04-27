import riffanBg from "../assets/RFB BCG 1.png";

export default function RfbContainer({
  photoProfile,
  name,
  jabatan,
  licenseNumber,
}) {
  return (
    <div className="relative min-h-screen max-w-md mx-auto overflow-x-hidden bg-slate-50">
      <div className="space-y-4 mb-32">
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
                  alt="PT. Riffan Financindo Berjangka Logo"
                />
              ) : (
                <div className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-bold tracking-[0.18em] text-white">
                  RFB
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
                  src={photo}
                  alt={name || "Foto profil"}
                />
              ) : (
                <div className="mb-10 mr-8 flex h-40 w-40 items-center justify-center rounded-full bg-white/80 text-5xl font-black text-slate-700 shadow-lg">
                  {getInitials(name) || "EC"}
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
                <p className="text-xl">{jabatan}</p>
                <p className="font-bold text-lg">
                  {licenseNumber || "Nomor Izin"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <a
              href={companyVideoUrl || "#"}
              onClick={
                companyVideoUrl ? undefined : (event) => event.preventDefault()
              }
              className="w-full inline-flex items-center justify-center gap-3 bg-red-600 py-1 px-7 text-white rounded-4xl"
              {...renderLinkTarget(companyVideoUrl)}
            >
              <FontAwesomeIcon icon={faDownload} className="text-2xl" />{" "}
              <span className="text-center text-wrap w-fit text-lg">
                Download Company Brochure
              </span>
            </a>
            <a
              href={vcardHref}
              download={`${vcardName || "contact"}.vcf`}
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
            <p className="text-lg text-justify">
              {profile.description || "Tidak ada deskripsi profil."}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {infoItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center justify-center border border-red-300 bg-red-100 p-2 aspect-square rounded-3xl text-center"
              >
                <img src={item.img} alt={item.label} className="h-10" />
                <p className="mt-2 text-xl font-semibold text-black">
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

              <p className="text-lg text-justify">
                Pialang berjangka resmi yang diawasi BAPPEBTI, OJK, dan BI,
                menghadirkan layanan investasi yang aman, terpercaya, dan
                profesional. Didukung pengalaman lebih dari 20 tahun, kami
                menjadi salah satu pelaku utama di industri Perdagangan
                Berjangka Komoditi di Indonesia.
              </p>
            </div>

            <div className="flex items-start gap-1">
              <img src={googleMapIcon} alt="Google Map" className="h-fit" />
              <p>{branch.address || "Alamat cabang belum tersedia."}</p>
            </div>

            <div className="grid grid-cols-2 gap-0.5 rounded-3xl shadow text-center overflow-hidden">
              {corporateStats.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white flex flex-col items-center justify-center"
                >
                  <h5 className="text-3xl text-red-800 font-bold break-words">
                    {item.value}
                  </h5>
                  <p className="font-semibold text-zinc-400 text-xl">
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
              <h5 className="text-2xl font-bold text-white">My Social Media</h5>
            </div>

            <div className="space-y-4 mt-7">
              {socialMediaItems.length ? (
                socialMediaItems.map((item) => {
                  const socialIcon = SOCIAL_MEDIA_IMAGE_BY_ID[item.id];
                  const socialUrl = normalizePublicLink(item.url);

                  return (
                    <a
                      key={item.id}
                      href={socialUrl}
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
                        <p>
                          {getSocialMediaDisplayValue(item.value || item.url)}
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
            <p className="mt-2 text-lg text-justify">
              PT Rifan Financindo Berjangka tidak pernah meminta transfer bank
              pribadi. Semua transaksi harus masuk ke rekening terpisah atas
              nama PT Rifan Financindo Berjangka.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
