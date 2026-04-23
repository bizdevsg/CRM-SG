import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  addBiodataEntry,
  addCertificateEntry,
  addSocialMediaEntry,
  createEcardEntry,
  getMarketingResources,
  removeBiodataEntry,
  removeCertificateEntry,
  removeEcardEntry,
  removeSocialMediaEntry
} from "../data/userStore.js";

const router = Router();

router.use(authMiddleware);
router.use(authorizeRoles("marketing"));

router.get("/me/resources", async (req, res) => {
  res.json({
    resources: await getMarketingResources(req.user.id)
  });
});

router.post("/me/biodata", async (req, res) => {
  const { label, value } = req.body;

  if (!label || !value) {
    return res.status(400).json({
      message: "Label biodata dan isinya wajib diisi."
    });
  }

  const entry = await addBiodataEntry(req.user.id, { label, value });

  return res.status(201).json({
    message: "Biodata berhasil ditambahkan.",
    entry
  });
});

router.delete("/me/biodata/:entryId", async (req, res) => {
  const removed = await removeBiodataEntry(req.user.id, req.params.entryId);

  if (!removed) {
    return res.status(404).json({
      message: "Biodata tidak ditemukan."
    });
  }

  return res.json({
    message: "Biodata berhasil dihapus."
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

router.post("/me/certificates", async (req, res) => {
  const { title, issuer, year } = req.body;

  if (!title || !issuer || !year) {
    return res.status(400).json({
      message: "Judul, penerbit, dan tahun sertifikat wajib diisi."
    });
  }

  const entry = await addCertificateEntry(req.user.id, { title, issuer, year });

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
