import { useEffect, useRef, useState } from "react";
import Card from "../../../components/atoms/Card";
import Input from "../../../components/atoms/Input";
import Button from "../../../components/atoms/Button";
import ResourceListPanel from "../../../components/organisms/ResourceListPanel";
import ResourceRow from "../../../components/molecules/ResourceRow";
import { useDashboard } from "../../../context/DashboardContext";
import { JOB_TITLE_OPTIONS } from "../../../config/jobTitles";
import Select from "../../../components/atoms/Select";

const PHOTO_CROP_RATIO = 3 / 4;
const PHOTO_CROP_VIEWPORT_WIDTH = 276;
const PHOTO_CROP_VIEWPORT_HEIGHT = PHOTO_CROP_VIEWPORT_WIDTH / PHOTO_CROP_RATIO;
const PHOTO_CROP_FRAME_WIDTH = PHOTO_CROP_VIEWPORT_WIDTH * 0.72;
const PHOTO_CROP_FRAME_HEIGHT = PHOTO_CROP_FRAME_WIDTH / PHOTO_CROP_RATIO;
const PHOTO_CROP_OUTPUT_WIDTH = 900;
const PHOTO_CROP_OUTPUT_HEIGHT = 1200;
const PHOTO_MAX_FILE_SIZE = 5 * 1024 * 1024;

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

async function loadImageElement(fileUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gambar tidak bisa dibaca."));
    image.src = fileUrl;
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getCropMetrics(naturalWidth, naturalHeight, zoom) {
  const safeWidth = Math.max(naturalWidth || 1, 1);
  const safeHeight = Math.max(naturalHeight || 1, 1);
  const baseScale = Math.max(
    PHOTO_CROP_FRAME_WIDTH / safeWidth,
    PHOTO_CROP_FRAME_HEIGHT / safeHeight,
  );
  const displayedScale = baseScale * zoom;
  const renderedWidth = safeWidth * displayedScale;
  const renderedHeight = safeHeight * displayedScale;

  return {
    displayedScale,
    renderedWidth,
    renderedHeight,
    maxOffsetX: Math.max(0, (renderedWidth - PHOTO_CROP_FRAME_WIDTH) / 2),
    maxOffsetY: Math.max(0, (renderedHeight - PHOTO_CROP_FRAME_HEIGHT) / 2),
  };
}

function clampCropOffsets(offsetX, offsetY, metrics) {
  return {
    offsetX: clamp(offsetX, -metrics.maxOffsetX, metrics.maxOffsetX),
    offsetY: clamp(offsetY, -metrics.maxOffsetY, metrics.maxOffsetY),
  };
}

async function createCroppedPhotoFile({
  sourceUrl,
  sourceName,
  naturalWidth,
  naturalHeight,
  zoom,
  offsetX,
  offsetY,
}) {
  const image = await loadImageElement(sourceUrl);
  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_CROP_OUTPUT_WIDTH;
  canvas.height = PHOTO_CROP_OUTPUT_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Crop gambar tidak tersedia di browser ini.");
  }

  const metrics = getCropMetrics(naturalWidth, naturalHeight, zoom);
  const cropWidth = PHOTO_CROP_FRAME_WIDTH / metrics.displayedScale;
  const cropHeight = PHOTO_CROP_FRAME_HEIGHT / metrics.displayedScale;
  const centerX = naturalWidth / 2 - offsetX / metrics.displayedScale;
  const centerY = naturalHeight / 2 - offsetY / metrics.displayedScale;
  const sourceX = clamp(centerX - cropWidth / 2, 0, naturalWidth - cropWidth);
  const sourceY = clamp(
    centerY - cropHeight / 2,
    0,
    naturalHeight - cropHeight,
  );

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    PHOTO_CROP_OUTPUT_WIDTH,
    PHOTO_CROP_OUTPUT_HEIGHT,
  );

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

  if (!blob) {
    throw new Error("Hasil crop gambar gagal dibuat.");
  }

  const safeName =
    String(sourceName || "profile-photo.png").replace(/\.[^.]+$/, "") ||
    "profile-photo";
  return new File([blob], `${safeName}.png`, { type: "image/png" });
}

export default function ProfilePage() {
  const { dashboard, updateProfile, updateSocialMedia } = useDashboard();
  const photoInputRef = useRef(null);
  const cropDragRef = useRef(null);
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
    photo: "",
  });
  const [socialMediaForm, setSocialMediaForm] = useState({
    instagramUsername: "",
    instagramUrl: "",
    tiktokUsername: "",
    tiktokUrl: "",
    twitterUsername: "",
    twitterUrl: "",
    linkedinUsername: "",
    linkedinUrl: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoFormatModalMessage, setPhotoFormatModalMessage] = useState("");
  const [cropModal, setCropModal] = useState({
    open: false,
    sourceUrl: "",
    sourceName: "",
    naturalWidth: 0,
    naturalHeight: 0,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const cropMetrics = getCropMetrics(
    cropModal.naturalWidth,
    cropModal.naturalHeight,
    cropModal.zoom,
  );

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
      photo: profile.photo || "",
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

  useEffect(() => {
    return () => {
      if (cropModal.sourceUrl.startsWith("blob:")) {
        URL.revokeObjectURL(cropModal.sourceUrl);
      }
    };
  }, [cropModal.sourceUrl]);

  useEffect(() => {
    if (!cropModal.open) {
      return;
    }

    setCropModal((current) => {
      const nextOffsets = clampCropOffsets(
        current.offsetX,
        current.offsetY,
        cropMetrics,
      );

      if (
        nextOffsets.offsetX === current.offsetX &&
        nextOffsets.offsetY === current.offsetY
      ) {
        return current;
      }

      return {
        ...current,
        ...nextOffsets,
      };
    });
  }, [cropMetrics.maxOffsetX, cropMetrics.maxOffsetY, cropModal.open]);

  function handleProfileChange(event) {
    setProfileForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSocialMediaChange(event) {
    setSocialMediaForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function openPhotoFormatModal(message) {
    setPhotoError(message);
    setPhotoFormatModalMessage(message);
  }

  function closePhotoFormatModal() {
    setPhotoFormatModalMessage("");
  }

  function closeCropModal() {
    setCropModal((current) => ({
      ...current,
      open: false,
      sourceUrl: "",
      sourceName: "",
      naturalWidth: 0,
      naturalHeight: 0,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    }));
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(profileForm.photo || "");
      setPhotoError("");
      return;
    }

    if (file.type !== "image/png") {
      event.target.value = "";
      openPhotoFormatModal("Photo profile harus file PNG transparan.");
      return;
    }

    if (file.size > PHOTO_MAX_FILE_SIZE) {
      event.target.value = "";
      openPhotoFormatModal("Ukuran photo profile maksimal 5MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const dimensions = await readImageDimensions(objectUrl).catch((error) => {
      openPhotoFormatModal(error.message);
      return null;
    });

    if (!dimensions) {
      URL.revokeObjectURL(objectUrl);
      event.target.value = "";
      return;
    }

    const transparent = await hasTransparentPixels(
      objectUrl,
      dimensions.width,
      dimensions.height,
    ).catch((error) => {
      openPhotoFormatModal(error.message);
      return null;
    });

    if (transparent === null) {
      URL.revokeObjectURL(objectUrl);
      event.target.value = "";
      return;
    }

    if (!transparent) {
      URL.revokeObjectURL(objectUrl);
      event.target.value = "";
      openPhotoFormatModal("Photo profile harus PNG background transparan.");
      return;
    }

    setPhotoError("");
    setPhotoFormatModalMessage("");
    setCropModal({
      open: true,
      sourceUrl: objectUrl,
      sourceName: file.name,
      naturalWidth: dimensions.width,
      naturalHeight: dimensions.height,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
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
      photo: "",
    }));
  }

  function handleCropZoomChange(event) {
    const nextZoom = Number(event.target.value);

    setCropModal((current) => {
      const nextMetrics = getCropMetrics(
        current.naturalWidth,
        current.naturalHeight,
        nextZoom,
      );
      const nextOffsets = clampCropOffsets(
        current.offsetX,
        current.offsetY,
        nextMetrics,
      );

      return {
        ...current,
        zoom: nextZoom,
        ...nextOffsets,
      };
    });
  }

  function handleCropPointerDown(event) {
    cropDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initialOffsetX: cropModal.offsetX,
      initialOffsetY: cropModal.offsetY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleCropPointerMove(event) {
    if (
      !cropDragRef.current ||
      cropDragRef.current.pointerId !== event.pointerId
    ) {
      return;
    }

    const deltaX = event.clientX - cropDragRef.current.startX;
    const deltaY = event.clientY - cropDragRef.current.startY;
    const nextOffsets = clampCropOffsets(
      cropDragRef.current.initialOffsetX + deltaX,
      cropDragRef.current.initialOffsetY + deltaY,
      cropMetrics,
    );

    setCropModal((current) => ({
      ...current,
      ...nextOffsets,
    }));
  }

  function handleCropPointerUp(event) {
    if (cropDragRef.current?.pointerId === event.pointerId) {
      cropDragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function handleApplyCrop() {
    try {
      const croppedFile = await createCroppedPhotoFile(cropModal);
      const nextPreview = URL.createObjectURL(croppedFile);

      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }

      setPhotoFile(croppedFile);
      setPhotoPreview(nextPreview);
      setPhotoError("");
      closeCropModal();

      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    } catch (error) {
      openPhotoFormatModal(error.message || "Crop foto gagal diproses.");
    }
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
          Kelola biodata marketing dan social media Anda dari form yang sudah
          dipisah.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900">Profil Marketing</h3>
          <form className="mt-5 grid gap-3" onSubmit={handleProfileSubmit}>
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Username, nama, email, NIK, nomor izin, dan jabatan asli hanya
              bisa diubah oleh admin atau superadmin.
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
              <p className="text-sm font-semibold text-slate-700">
                Photo Profile
              </p>
              <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex h-32 w-24 items-center justify-center overflow-hidden rounded-3xl bg-slate-200">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                      No Photo
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <Input
                    ref={photoInputRef}
                    type="file"
                    accept="image/png"
                    onChange={handlePhotoChange}
                  />
                  {photoError ? (
                    <p className="text-xs font-medium text-rose-600">
                      {photoError}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-4 py-2"
                      onClick={handlePhotoReset}
                    >
                      Hapus Foto
                    </Button>
                    <p className="text-xs leading-5 text-slate-500">
                      Wajib PNG background transparan. Setelah pilih file, foto
                      akan dicrop dalam frame portrait agar seragam. Maksimal
                      5MB.
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
          <h3 className="text-xl font-bold text-slate-900">
            Social Media Marketing
          </h3>
          <form className="mt-5 grid gap-3" onSubmit={handleSocialMediaSubmit}>
            <p className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              Setiap social media punya username dan URL terpisah agar data
              e-card lebih lengkap.
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
              <strong className="text-base text-slate-900">
                {entry.label}
              </strong>
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
              <strong className="text-base text-slate-900">
                {entry.platform}
              </strong>
              <span>{entry.username || "-"}</span>
              <span className="break-all">{entry.url || "-"}</span>
            </ResourceRow>
          )}
        />
      </div>

      {photoFormatModalMessage ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-rose-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">
              Format Foto Tidak Sesuai
            </p>
            <h4 className="mt-3 text-xl font-bold text-slate-900">
              Upload dibatalkan
            </h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {photoFormatModalMessage}
            </p>
            <div className="mt-5 flex justify-end">
              <Button type="button" onClick={closePhotoFormatModal}>
                Mengerti
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {cropModal.open ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/90 p-0 backdrop-blur-sm">
          <div className="flex h-full max-h-screen w-full max-w-md flex-col overflow-hidden bg-[#1c1f24] text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-0 rounded-full border border-white/15 px-3 py-2 text-white hover:bg-white/10"
                  onClick={closeCropModal}
                >
                  Kembali
                </Button>
                <div>
                  <p className="text-sm font-semibold text-white">Edit</p>
                  <p className="text-[11px] text-white/60">Atur posisi wajah dan zoom foto</p>
                </div>
              </div>

              <p className="text-[11px] font-medium text-white/55">
                Frame portrait
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-center px-4 py-5">
              <div className="mx-auto w-full max-w-[320px]">
                <div
                  className="relative mx-auto overflow-hidden rounded-[24px] bg-black/55 shadow-[0_25px_60px_rgba(0,0,0,0.35)]"
                  style={{
                    width: `${PHOTO_CROP_VIEWPORT_WIDTH}px`,
                    height: `${PHOTO_CROP_VIEWPORT_HEIGHT}px`,
                    maxWidth: "100%",
                  }}
                  onPointerDown={handleCropPointerDown}
                  onPointerMove={handleCropPointerMove}
                  onPointerUp={handleCropPointerUp}
                  onPointerCancel={handleCropPointerUp}
                >
                  <img
                    src={cropModal.sourceUrl}
                    alt="Crop preview"
                    draggable="false"
                    className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                    style={{
                      width: `${cropMetrics.renderedWidth}px`,
                      height: `${cropMetrics.renderedHeight}px`,
                      transform: `translate(calc(-50% + ${cropModal.offsetX}px), calc(-50% + ${cropModal.offsetY}px))`,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-slate-950/35" />
                  <div className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-white/28" />
                  <div className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-white/28" />
                  <div className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-white/28" />
                  <div className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-white/28" />
                  <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-white/90" />
                  <div className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-white/90" />
                  <div className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-white/90" />
                  <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-white/90" />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div
                      className="rounded-[28px] border-2 border-white/95 shadow-[0_0_0_999px_rgba(10,14,20,0.5)]"
                      style={{
                        width: `${PHOTO_CROP_FRAME_WIDTH}px`,
                        height: `${PHOTO_CROP_FRAME_HEIGHT}px`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-4 rounded-[24px] border border-white/10 bg-white/6 p-4">
                <div className="flex items-center justify-between text-xs text-white/65">
                  <span>Zoom</span>
                  <span>{cropModal.zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={cropModal.zoom}
                  onChange={handleCropZoomChange}
                  className="w-full accent-[#2d7cff]"
                />
                <p className="text-xs leading-5 text-white/60">
                  Geser foto di area crop sampai wajah ada di posisi yang paling rapi.
                  Hasil akhir akan dibuat dalam frame portrait yang seragam.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 px-4 py-4">
              <Button
                type="button"
                className="w-full rounded-none bg-[#2d7cff] px-4 py-3 text-base font-semibold hover:bg-[#1f66e5]"
                onClick={handleApplyCrop}
              >
                Crop Now
              </Button>
              <button
                type="button"
                onClick={closeCropModal}
                className="mt-3 w-full text-sm font-medium text-white/70 transition hover:text-white"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
