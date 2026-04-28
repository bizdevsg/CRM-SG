import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import { createImageUpload } from "../middleware/uploadMiddleware.js";
import {
  addCertificateEntry,
  createEcardEntry,
  getMarketingResources,
  removeCertificateEntry,
  removeEcardEntry,
  updateCertificateEntry,
  updateEcardEntry,
  updateUserProfile,
  updateUserSocialMedia
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
  const { photo, ecardJobTitle, description, phone } = req.body;
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

  const profile = await updateUserProfile(req.user.id, {
    photo: uploadedPhotoPath || photo,
    ecardJobTitle,
    description,
    phone
  });

  return res.json({
    message: "Profil user berhasil diperbarui.",
    user: profile
  });
});

router.put("/me/social-media", async (req, res) => {
  const {
    instagramUsername,
    instagramUrl,
    tiktokUsername,
    tiktokUrl,
    twitterUsername,
    twitterUrl,
    linkedinUsername,
    linkedinUrl
  } = req.body;

  const entries = [
    { label: "Instagram", username: instagramUsername, url: instagramUrl },
    { label: "TikTok", username: tiktokUsername, url: tiktokUrl },
    { label: "Twitter/X", username: twitterUsername, url: twitterUrl },
    { label: "LinkedIn", username: linkedinUsername, url: linkedinUrl }
  ];

  const invalidEntry = entries.find(({ username, url }) => {
    const hasUsername = Boolean(String(username || "").trim());
    const hasUrl = Boolean(String(url || "").trim());
    return hasUsername !== hasUrl;
  });

  if (invalidEntry) {
    return res.status(400).json({
      message: `${invalidEntry.label} harus diisi lengkap: username dan URL.`
    });
  }

  const profile = await updateUserSocialMedia(req.user.id, {
    instagramUsername,
    instagramUrl,
    tiktokUsername,
    tiktokUrl,
    twitterUsername,
    twitterUrl,
    linkedinUsername,
    linkedinUrl
  });

  return res.json({
    message: "Social media berhasil diperbarui.",
    user: profile
  });
});

router.post("/me/certificates", certificateImageUpload.single("imageFile"), async (req, res) => {
  const { title } = req.body;
  const uploadedImagePath = req.file ? absolutePathToPublicPath(req.file.path) : null;

  if (!title) {
    if (uploadedImagePath) {
      await removeUploadedFile(uploadedImagePath);
    }

    return res.status(400).json({
      message: "Judul sertifikat wajib diisi."
    });
  }

  const entry = await addCertificateEntry(req.user.id, {
    title,
    imagePath: uploadedImagePath
  });

  return res.status(201).json({
    message: "Sertifikat berhasil ditambahkan.",
    entry
  });
});

router.put("/me/certificates/:entryId", certificateImageUpload.single("imageFile"), async (req, res) => {
  const { title } = req.body;
  const uploadedImagePath = req.file ? absolutePathToPublicPath(req.file.path) : undefined;

  if (!title) {
    if (uploadedImagePath) {
      await removeUploadedFile(uploadedImagePath);
    }

    return res.status(400).json({
      message: "Judul sertifikat wajib diisi."
    });
  }

  const entry = await updateCertificateEntry(req.user.id, req.params.entryId, {
    title,
    imagePath: uploadedImagePath
  });

  if (!entry) {
    if (uploadedImagePath) {
      await removeUploadedFile(uploadedImagePath);
    }

    return res.status(404).json({
      message: "Sertifikat tidak ditemukan."
    });
  }

  return res.json({
    message: "Sertifikat berhasil diperbarui.",
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
  let entry;

  try {
    entry = await createEcardEntry(req.user.id, {});
  } catch (error) {
    if (error.message === "Setiap marketing hanya boleh memiliki 1 QR e-card.") {
      return res.status(409).json({
        message: error.message
      });
    }

    if (error.message.startsWith("QR e-card belum bisa dibuat.")) {
      return res.status(400).json({
        message: error.message
      });
    }

    throw error;
  }

  return res.status(201).json({
    message: "E-Card QR Code berhasil dibuat.",
    entry
  });
});

router.put("/me/ecards/:entryId", async (req, res) => {
  const { isActive } = req.body;

  let entry;

  try {
    entry = await updateEcardEntry(req.user.id, req.params.entryId, {
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });
  } catch (error) {
    if (error.message.startsWith("QR e-card belum bisa diperbarui.")) {
      return res.status(400).json({
        message: error.message
      });
    }

    throw error;
  }

  if (!entry) {
    return res.status(404).json({
      message: "E-Card tidak ditemukan."
    });
  }

  return res.json({
    message: "E-Card berhasil diperbarui.",
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
