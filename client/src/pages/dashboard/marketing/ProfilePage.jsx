import { useEffect, useState } from "react";
import Card from "../../../components/atoms/Card";
import Input from "../../../components/atoms/Input";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";
import { JOB_TITLE_OPTIONS } from "../../../config/jobTitles";
import Select from "../../../components/atoms/Select";

async function readImageDimensions(fileUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.width, height: image.height });
    image.onerror = () => reject(new Error("Gambar tidak bisa dibaca."));
    image.src = fileUrl;
  });
}

async function hasTransparentPixels(fileUrl, width, height) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (!context) {
        reject(new Error("Validasi gambar tidak tersedia di browser ini."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);

      const { data } = context.getImageData(0, 0, width, height);

      for (let index = 3; index < data.length; index += 4) {
        if (data[index] < 255) {
          resolve(true);
          return;
        }
      }

      resolve(false);
    };

    image.onerror = () => reject(new Error("Gambar tidak bisa dibaca."));
    image.src = fileUrl;
  });
}

export default function ProfilePage() {
  const { dashboard, updateProfile, updateSocialMedia } = useDashboard();
  const [profileForm, setProfileForm] = useState({
    username: "",
    fullName: "",
    email: "",
    nik: "",
    licenseNumber: "",
    positionTitle: "",
    ecardJobTitle: "",
    description: "",
    phone: "",
    photo: ""
  });
  const [socialMediaForm, setSocialMediaForm] = useState({
    instagramUsername: "",
    instagramUrl: "",
    tiktokUsername: "",
    tiktokUrl: "",
    twitterUsername: "",
    twitterUrl: "",
    linkedinUsername: "",
    linkedinUrl: ""
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    const profile = dashboard?.resources?.profile;

    if (!profile) {
      return;
    }

    setProfileForm({
      username: profile.username || "",
      fullName: profile.fullName || "",
      email: profile.email || "",
      nik: profile.nik || "",
      licenseNumber: profile.licenseNumber || "",
      positionTitle: profile.positionTitle || "",
      ecardJobTitle: profile.ecardJobTitle || "",
      description: profile.description || "",
      phone: profile.phone || "",
      photo: profile.photo || ""
    });
    setSocialMediaForm({
      instagramUsername: profile.instagramUsername || "",
      instagramUrl: profile.instagram || "",
      tiktokUsername: profile.tiktokUsername || "",
      tiktokUrl: profile.tiktok || "",
      twitterUsername: profile.twitterUsername || "",
      twitterUrl: profile.twitter || "",
      linkedinUsername: profile.linkedinUsername || "",
      linkedinUrl: profile.linkedin || "",
    });
    setPhotoFile(null);
    setPhotoPreview(profile.photo || "");
    setPhotoError("");
  }, [dashboard?.resources?.profile]);

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  function handleProfileChange(event) {
    setProfileForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function handleSocialMediaChange(event) {
    setSocialMediaForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0] || null;

    if (photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(profileForm.photo || "");
      setPhotoError("");
      return;
    }

    if (file.type !== "image/png") {
      event.target.value = "";
      setPhotoFile(null);
      setPhotoPreview(profileForm.photo || "");
      setPhotoError("Photo profile harus file PNG transparan dengan rasio potret 3:4.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const dimensions = await readImageDimensions(objectUrl).catch((error) => {
      setPhotoError(error.message);
      return null;
    });

    if (!dimensions) {
      URL.revokeObjectURL(objectUrl);
      event.target.value = "";
      setPhotoFile(null);
      setPhotoPreview(profileForm.photo || "");
      return;
    }

    if (dimensions.height <= dimensions.width) {
      URL.revokeObjectURL(objectUrl);
      event.target.value = "";
      setPhotoFile(null);
      setPhotoPreview(profileForm.photo || "");
      setPhotoError("Photo profile harus potret dengan rasio 3:4.");
      return;
    }

    if (Math.abs(dimensions.width / dimensions.height - 3 / 4) > 0.01) {
      URL.revokeObjectURL(objectUrl);
      event.target.value = "";
      setPhotoFile(null);
      setPhotoPreview(profileForm.photo || "");
      setPhotoError("Photo profile harus potret dengan rasio 3:4.");
      return;
    }

    const transparent = await hasTransparentPixels(
      objectUrl,
      dimensions.width,
      dimensions.height
    ).catch((error) => {
      setPhotoError(error.message);
      return null;
    });

    if (transparent === null) {
      URL.revokeObjectURL(objectUrl);
      event.target.value = "";
      setPhotoFile(null);
      setPhotoPreview(profileForm.photo || "");
      return;
    }

    if (!transparent) {
      URL.revokeObjectURL(objectUrl);
      event.target.value = "";
      setPhotoFile(null);
      setPhotoPreview(profileForm.photo || "");
      setPhotoError("Photo profile harus PNG background transparan.");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(objectUrl);
    setPhotoError("");
  }

  function handlePhotoReset() {
    if (photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(null);
    setPhotoPreview("");
    setPhotoError("");
    setProfileForm((current) => ({
      ...current,
      photo: ""
    }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    const formData = new FormData();

    Object.entries(profileForm).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });

    if (photoFile) {
      formData.append("photoFile", photoFile);
    }

    const success = await updateProfile(formData);

    if (success) {
      setPhotoFile(null);
    }
  }

  async function handleSocialMediaSubmit(event) {
    event.preventDefault();
    await updateSocialMedia(socialMediaForm);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Biodata</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Kelola biodata marketing dan social media Anda dari form yang sudah dipisah.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900">Profil Marketing</h3>
          <form className="mt-5 grid gap-3" onSubmit={handleProfileSubmit}>
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Username, nama, email, NIK, nomor izin, dan jabatan asli hanya bisa diubah oleh admin atau superadmin.
            </p>
            <Input
              name="username"
              value={profileForm.username}
              onChange={handleProfileChange}
              placeholder="Username"
              required
              disabled
            />
            <Input
              name="fullName"
              value={profileForm.fullName}
              onChange={handleProfileChange}
              placeholder="Nama lengkap"
              required
              disabled
            />
            <Input
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              placeholder="Email"
              required
              disabled
            />
            <Input
              name="nik"
              value={profileForm.nik}
              onChange={handleProfileChange}
              placeholder="NIK"
              disabled
            />
            <Input
              name="licenseNumber"
              value={profileForm.licenseNumber}
              onChange={handleProfileChange}
              placeholder="Nomor izin"
              disabled
            />
            <Select
              name="positionTitle"
              value={profileForm.positionTitle}
              onChange={handleProfileChange}
              disabled
            >
              <option value="">Pilih jabatan asli</option>
              {JOB_TITLE_OPTIONS.map((jobTitle) => (
                <option key={jobTitle} value={jobTitle}>
                  {jobTitle}
                </option>
              ))}
            </Select>
            <Select
              name="ecardJobTitle"
              value={profileForm.ecardJobTitle}
              onChange={handleProfileChange}
            >
              <option value="">Pilih jabatan untuk e-card</option>
              {JOB_TITLE_OPTIONS.map((jobTitle) => (
                <option key={jobTitle} value={jobTitle}>
                  {jobTitle}
                </option>
              ))}
            </Select>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Photo Profile</p>
              <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex h-32 w-24 items-center justify-center overflow-hidden rounded-3xl bg-slate-200">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                      No Photo
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <Input type="file" accept="image/png" onChange={handlePhotoChange} />
                  {photoError ? <p className="text-xs font-medium text-rose-600">{photoError}</p> : null}
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" variant="ghost" className="px-4 py-2" onClick={handlePhotoReset}>
                      Hapus Foto
                    </Button>
                    <p className="text-xs leading-5 text-slate-500">
                      Wajib PNG background transparan dengan rasio potret 3:4. Maksimal 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Input
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
              placeholder="Nomor telepon"
            />
            <textarea
              name="description"
              value={profileForm.description}
              onChange={handleProfileChange}
              placeholder="Deskripsi untuk e-card"
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
            />
            <Button type="submit">Simpan Profil</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900">Social Media Marketing</h3>
          <form className="mt-5 grid gap-3" onSubmit={handleSocialMediaSubmit}>
            <p className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              Setiap social media punya username dan URL terpisah agar data e-card lebih lengkap.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                name="instagramUsername"
                value={socialMediaForm.instagramUsername}
                onChange={handleSocialMediaChange}
                placeholder="Username Instagram"
              />
              <Input
                name="instagramUrl"
                value={socialMediaForm.instagramUrl}
                onChange={handleSocialMediaChange}
                placeholder="URL Instagram"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                name="tiktokUsername"
                value={socialMediaForm.tiktokUsername}
                onChange={handleSocialMediaChange}
                placeholder="Username TikTok"
              />
              <Input
                name="tiktokUrl"
                value={socialMediaForm.tiktokUrl}
                onChange={handleSocialMediaChange}
                placeholder="URL TikTok"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                name="twitterUsername"
                value={socialMediaForm.twitterUsername}
                onChange={handleSocialMediaChange}
                placeholder="Username Twitter / X"
              />
              <Input
                name="twitterUrl"
                value={socialMediaForm.twitterUrl}
                onChange={handleSocialMediaChange}
                placeholder="URL Twitter / X"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                name="linkedinUsername"
                value={socialMediaForm.linkedinUsername}
                onChange={handleSocialMediaChange}
                placeholder="Username LinkedIn"
              />
              <Input
                name="linkedinUrl"
                value={socialMediaForm.linkedinUrl}
                onChange={handleSocialMediaChange}
                placeholder="URL LinkedIn"
              />
            </div>
            <Button type="submit">Simpan Social Media</Button>
          </form>
        </Card>

        <ResourceListPanel
          title="Biodata Saya"
          items={dashboard?.resources?.biodata || []}
          emptyText="Profil biodata belum lengkap."
          renderItem={(entry) => (
            <ResourceRow>
              <strong className="text-base text-slate-900">{entry.label}</strong>
              <span>{entry.value}</span>
            </ResourceRow>
          )}
        />

        <ResourceListPanel
          title="Social Media Saya"
          items={dashboard?.resources?.socialMedia || []}
          emptyText="Belum ada social media."
          renderItem={(entry) => (
            <ResourceRow>
              <strong className="text-base text-slate-900">{entry.platform}</strong>
              <span>{entry.username || "-"}</span>
              <span className="break-all">{entry.url || "-"}</span>
            </ResourceRow>
          )}
        />
      </div>
    </div>
  );
}
