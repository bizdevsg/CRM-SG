import bcrypt from "bcryptjs";
import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createBranch,
  createUser,
  getBranchByCode,
  getBranchById,
  getUserByEmail,
  listBranches,
  listUsers
} from "../data/userStore.js";

const router = Router();

router.use(authMiddleware);

router.get("/branches", authorizeRoles("superadmin", "admin"), async (req, res) => {
  if (req.user.role === "superadmin") {
    return res.json({
      branches: await listBranches()
    });
  }

  return res.json({
    branches: [await getBranchById(req.user.branchId)].filter(Boolean)
  });
});

router.post("/branches", authorizeRoles("superadmin"), async (req, res) => {
  const { name, city, code } = req.body;
  const nextCity = city || code;

  if (!name || !nextCity) {
    return res.status(400).json({
      message: "Nama cabang dan kota wajib diisi."
    });
  }

  if (await getBranchByCode(nextCity)) {
    return res.status(409).json({
      message: "Cabang dengan kota tersebut sudah ada."
    });
  }

  const branch = await createBranch({
    name,
    city: nextCity,
    companyId: req.user.companyId
  });

  return res.status(201).json({
    message: "Cabang baru berhasil dibuat.",
    branch
  });
});

router.get("/users", authorizeRoles("superadmin", "admin"), async (req, res) => {
  if (req.user.role === "superadmin") {
    return res.json({
      admins: await listUsers({ role: "admin" }),
      marketingTeam: await listUsers({ role: "marketing" })
    });
  }

  return res.json({
    admins: [],
    marketingTeam: await listUsers({ role: "marketing", branchId: req.user.branchId })
  });
});

router.post("/users", authorizeRoles("superadmin", "admin"), async (req, res) => {
  const { name, email, password, role, branchId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Nama, email, dan password wajib diisi."
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password minimal 6 karakter."
    });
  }

  if (await getUserByEmail(email)) {
    return res.status(409).json({
      message: "Email sudah terdaftar."
    });
  }

  let nextRole = role;
  let nextBranchId = branchId;

  if (req.user.role === "admin") {
    if (role && role !== "marketing") {
      return res.status(403).json({
        message: "Admin cabang hanya boleh membuat akun marketing."
      });
    }

    if (branchId && branchId !== req.user.branchId) {
      return res.status(403).json({
        message: "Admin cabang hanya boleh membuat akun di cabangnya sendiri."
      });
    }

    nextRole = "marketing";
    nextBranchId = req.user.branchId;
  }

  if (!["admin", "marketing"].includes(nextRole)) {
    return res.status(400).json({
      message: "Role hanya boleh admin atau marketing."
    });
  }

  if (!nextBranchId || !(await getBranchById(nextBranchId))) {
    return res.status(400).json({
      message: "Cabang untuk akun ini tidak valid."
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({
    name,
    email,
    passwordHash,
    role: nextRole,
    branchId: nextBranchId,
    createdById: req.user.id
  });

  return res.status(201).json({
    message:
      nextRole === "admin"
        ? "Admin cabang berhasil dibuat."
        : "Akun marketing berhasil dibuat.",
    user
  });
});

export default router;
