import { Router } from "express";
import { createJobApplicationByEcardSlug, getPublicEcardByRoute } from "../data/userStore.js";
import { createFileUpload } from "../middleware/uploadMiddleware.js";
import { absolutePathToPublicPath, removeUploadedFile } from "../utils/uploadStorage.js";

const router = Router();
const cvUpload = createFileUpload("job-cv", {
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ],
  invalidTypeMessage: "CV harus berupa PDF, DOC, atau DOCX."
});

async function sendPublicEcard(req, res) {
  const ecard = await getPublicEcardByRoute(req.params);

  if (!ecard) {
    return res.status(404).json({
      message: "E-Card publik tidak ditemukan atau sudah tidak aktif."
    });
  }

  return res.json({
    message: "Data e-card publik berhasil diambil.",
    ecard
  });
}

router.get("/ecards/:ecardSlug", sendPublicEcard);
router.get("/ecards/:companySlug/:branchCode/:ecardSlug", sendPublicEcard);
router.post("/ecards/:ecardSlug/job-applications", cvUpload.single("cvFile"), async (req, res) => {
  const applicantName = String(req.body?.name || "").trim();
  const applicantEmail = String(req.body?.email || "").trim().toLowerCase();
  const whatsappNumber = String(req.body?.whatsappNumber || "").trim();
  const cvFileUrl = req.file ? absolutePathToPublicPath(req.file.path) : null;

  if (!applicantName || !applicantEmail || !whatsappNumber || !cvFileUrl) {
    if (cvFileUrl) {
      await removeUploadedFile(cvFileUrl);
    }

    return res.status(400).json({
      message: "Nama, email, nomor WA, dan file CV wajib diisi."
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(applicantEmail)) {
    await removeUploadedFile(cvFileUrl);
    return res.status(400).json({
      message: "Format email tidak valid."
    });
  }

  const entry = await createJobApplicationByEcardSlug(req.params.ecardSlug, {
    applicantName,
    applicantEmail,
    whatsappNumber,
    cvFileUrl
  });

  if (!entry) {
    await removeUploadedFile(cvFileUrl);
    return res.status(404).json({
      message: "E-Card tujuan tidak ditemukan atau sudah tidak aktif."
    });
  }

  return res.status(201).json({
    message: "Lamaran berhasil dikirim.",
    entry
  });
});
router.post("/ecards/:companySlug/:branchCode/:ecardSlug/job-applications", cvUpload.single("cvFile"), async (req, res) => {
  const applicantName = String(req.body?.name || "").trim();
  const applicantEmail = String(req.body?.email || "").trim().toLowerCase();
  const whatsappNumber = String(req.body?.whatsappNumber || "").trim();
  const cvFileUrl = req.file ? absolutePathToPublicPath(req.file.path) : null;

  if (!applicantName || !applicantEmail || !whatsappNumber || !cvFileUrl) {
    if (cvFileUrl) {
      await removeUploadedFile(cvFileUrl);
    }

    return res.status(400).json({
      message: "Nama, email, nomor WA, dan file CV wajib diisi."
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(applicantEmail)) {
    await removeUploadedFile(cvFileUrl);
    return res.status(400).json({
      message: "Format email tidak valid."
    });
  }

  const entry = await createJobApplicationByEcardSlug(req.params.ecardSlug, {
    applicantName,
    applicantEmail,
    whatsappNumber,
    cvFileUrl
  });

  if (!entry) {
    await removeUploadedFile(cvFileUrl);
    return res.status(404).json({
      message: "E-Card tujuan tidak ditemukan atau sudah tidak aktif."
    });
  }

  return res.status(201).json({
    message: "Lamaran berhasil dikirim.",
    entry
  });
});

export default router;
