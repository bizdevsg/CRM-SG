import { Router } from "express";
import { getPublicEcardByRoute } from "../data/userStore.js";

const router = Router();

router.get("/ecards/:companySlug/:branchCode/:ecardSlug", async (req, res) => {
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
});

export default router;
