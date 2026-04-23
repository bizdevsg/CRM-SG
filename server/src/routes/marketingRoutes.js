import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import { createImageUpload } from "../middleware/uploadMiddleware.js";
import {
  addCertificateEntry,
  addSocialMediaEntry,
  createEcardEntry,
  getMarketingResources,
  removeCertificateEntry,
  removeEcardEntry,
  removeSocialMediaEntry,
  updateUserProfile
} from "../data/userStore.js";
import { absolutePathToPublicPath, removeUploadedFile } from "../utils/uploadStorage.js";
import { validateProfilePhotoFile } from "../utils/imageValidation.js";

const router = Router();
const profilePhotoUpload = createImageUpload("profile-photos", {
  allowedMimeTypes: ["image/png"],
  invalidTypeMessage: "Photo profile harus file PNG."
});
const certificateImageUpload = createImageUpload("certificate-images");

router.use(authMiddleware);
router.use(authorizeRoles("marketing"));

router.get("/me/resources", async (req, res) => {
  res.json({
    resources: await getMarketingResources(req.user.id)
  });
});

router.put("/me/profile", profilePhotoUpload.single("photoFile"), async (req, res) => {
  const { username, slug, fullName, nickname, photo, jobTitle, licenseNumber, description, phone, email } =
    req.body;
  const uploadedPhotoPath = req.file ? absolutePathToPublicPath(req.file.path) : null;

  if (req.file) {
    try {
      await validateProfilePhotoFile(req.file.path);
    } catch (error) {
      if (uploadedPhotoPath) {
        await removeUploadedFile(uploadedPhotoPath);
      }

      return res.status(400).json({
        message: error.message
      });
    }
  }

  if (!fullName || !email) {
    if (uploadedPhotoPath) {
      await removeUploadedFile(uploadedPhotoPath);
    }

    return res.status(400).json({
      message: "Nama lengkap dan email wajib diisi."
    });
  }

  const profile = await updateUserProfile(req.user.id, {
    username,
    slug,
    fullName,
    nickname,
    photo: uploadedPhotoPath || photo,
    jobTitle,
    licenseNumber,
    description,
    phone,
    email
  });

  return res.json({
    message: "Profil user berhasil diperbarui.",
    user: profile
  });
});

router.post("/me/social-media", async (req, res) => {
  const { platform, url } = req.body;

  if (!platform || !url) {
    return res.status(400).json({
      message: "Platform dan URL social media wajib diisi."
    });
  }

  const entry = await addSocialMediaEntry(req.user.id, { platform, url });

  return res.status(201).json({
    message: "Social media berhasil ditambahkan.",
    entry
  });
});

router.delete("/me/social-media/:entryId", async (req, res) => {
  const removed = await removeSocialMediaEntry(req.user.id, req.params.entryId);

  if (!removed) {
    return res.status(404).json({
      message: "Social media tidak ditemukan."
    });
  }

  return res.json({
    message: "Social media berhasil dihapus."
  });
});

router.post("/me/certificates", certificateImageUpload.single("imageFile"), async (req, res) => {
  const { title, issuer, year } = req.body;
  const uploadedImagePath = req.file ? absolutePathToPublicPath(req.file.path) : null;

  if (!title || !issuer || !year) {
    if (uploadedImagePath) {
      await removeUploadedFile(uploadedImagePath);
    }

    return res.status(400).json({
      message: "Judul, penerbit, dan tahun sertifikat wajib diisi."
    });
  }

  const entry = await addCertificateEntry(req.user.id, {
    title,
    issuer,
    year,
    imagePath: uploadedImagePath
  });

  return res.status(201).json({
    message: "Sertifikat berhasil ditambahkan.",
    entry
  });
});

router.delete("/me/certificates/:entryId", async (req, res) => {
  const removed = await removeCertificateEntry(req.user.id, req.params.entryId);

  if (!removed) {
    return res.status(404).json({
      message: "Sertifikat tidak ditemukan."
    });
  }

  return res.json({
    message: "Sertifikat berhasil dihapus."
  });
});

router.post("/me/ecards", async (req, res) => {
  const { title, slug } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Judul e-card wajib diisi."
    });
  }

  const entry = await createEcardEntry(req.user.id, { title, slug });

  return res.status(201).json({
    message: "E-Card QR Code berhasil dibuat.",
    entry
  });
});

router.delete("/me/ecards/:entryId", async (req, res) => {
  const removed = await removeEcardEntry(req.user.id, req.params.entryId);

  if (!removed) {
    return res.status(404).json({
      message: "E-Card tidak ditemukan."
    });
  }

  return res.json({
    message: "E-Card berhasil dihapus."
  });
});

export default router;
