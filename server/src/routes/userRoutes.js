import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getDashboardData } from "../data/userStore.js";

const router = Router();

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Data user berhasil diambil melalui middleware.",
    user: req.user
  });
});

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: `Halo ${req.user.name}, Anda berhasil mengakses route terproteksi.`,
    user: req.user
  });
});

router.get("/dashboard-data", authMiddleware, async (req, res) => {
  res.json({
    message: "Data dashboard berhasil diambil.",
    user: req.user,
    dashboard: await getDashboardData(req.user)
  });
});

export default router;
