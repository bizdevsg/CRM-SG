import bcrypt from "bcryptjs";
import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createBranch,
  createUser,
  deleteBranch,
  deleteUser,
  getBranchById,
  getUserByEmail,
  getUserById,
  listBranches,
  listCompanies,
  listUsers,
  updateBranch,
  updateUser
} from "../data/userStore.js";

const router = Router();
const BCRYPT_SALT_ROUNDS = 12;
const JOB_TITLE_OPTIONS = [
  "Chief Executive Officer (CEO)",
  "Chief Business Officer (CBO)",
  "Branch Manager (BrM)",
  "Vice Business Manager (VBM)",
  "Senior Vice Business Manager (SVBM)",
  "Senior Executive Manager (SEM)",
  "Executive Manager (EM)",
  "Senior Business Manager (SBM)",
  "Business Manager (BsM)",
  "Senior Business Consultant (SBC)",
  "Business Consultant (BC)"
];

function getJobTitleRank(jobTitle) {
  const index = JOB_TITLE_OPTIONS.indexOf(jobTitle);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

router.use(authMiddleware);

router.get("/branches", authorizeRoles("superadmin", "admin"), async (req, res) => {
  if (req.user.role === "superadmin") {
    return res.json({
      companies: await listCompanies(),
      branches: await listBranches()
    });
  }

  return res.json({
    companies: [],
    branches: [await getBranchById(req.user.branchId)].filter(Boolean)
  });
});

router.post("/branches", authorizeRoles("superadmin"), async (req, res) => {
  const { companyId, name, address } = req.body;

  if (!companyId || !name || !address) {
    return res.status(400).json({
      message: "Perusahaan, nama cabang, dan alamat wajib diisi."
    });
  }

  const branch = await createBranch({
    companyId,
    name,
    address
  });

  return res.status(201).json({
    message: "Cabang baru berhasil dibuat.",
    branch
  });
});

router.put("/branches/:branchId", authorizeRoles("superadmin"), async (req, res) => {
  const { companyId, name, address } = req.body;
  const branch = await getBranchById(req.params.branchId);

  if (!branch) {
    return res.status(404).json({
      message: "Cabang tidak ditemukan."
    });
  }

  if (!companyId || !name || !address) {
    return res.status(400).json({
      message: "Perusahaan, nama cabang, dan alamat wajib diisi."
    });
  }

  const updatedBranch = await updateBranch(req.params.branchId, {
    companyId,
    name,
    address
  });

  return res.json({
    message: "Cabang berhasil diperbarui.",
    branch: updatedBranch
  });
});

router.delete("/branches/:branchId", authorizeRoles("superadmin"), async (req, res) => {
  const deleted = await deleteBranch(req.params.branchId);

  if (!deleted) {
    return res.status(404).json({
      message: "Cabang tidak ditemukan."
    });
  }

  return res.json({
    message: "Cabang berhasil dihapus."
  });
});

router.get("/users", authorizeRoles("superadmin", "admin"), async (req, res) => {
  if (req.user.role === "superadmin") {
    return res.json({
      companies: await listCompanies(),
      branches: await listBranches(),
      admins: await listUsers({ role: "admin" }),
      marketingTeam: await listUsers({ role: "marketing" })
    });
  }

  return res.json({
    companies: [],
    branches: [await getBranchById(req.user.branchId)].filter(Boolean),
    admins: [],
    marketingTeam: await listUsers({
      role: "marketing",
      companyId: req.user.companyId,
      branchId: req.user.branchId
    })
  });
});

router.post("/users", authorizeRoles("superadmin", "admin"), async (req, res) => {
  const {
    name,
    username,
    email,
    password,
    role,
    branchId,
    nik,
    licenseNumber,
    positionTitle,
    supervisorId
  } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({
      message: "Nama, username, email, dan password wajib diisi."
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

  const requestedBranch = branchId ? await getBranchById(branchId) : null;

  let nextRole = role;
  let nextBranch = requestedBranch;
  let nextPositionTitle = positionTitle?.trim() || null;
  let nextSupervisorId = supervisorId ? Number(supervisorId) : null;
  let nextSupervisorName = null;

  if (req.user.role === "admin") {
    if (role && role !== "marketing") {
      return res.status(403).json({
        message: "Admin cabang hanya boleh membuat akun marketing."
      });
    }

    nextRole = "marketing";
    nextBranch = await getBranchById(req.user.branchId);
  }

  if (!["admin", "marketing"].includes(nextRole)) {
    return res.status(400).json({
      message: "Role hanya boleh admin atau marketing."
    });
  }

  if (!nextBranch) {
    return res.status(400).json({
      message: "Cabang untuk akun ini tidak valid."
    });
  }

  if (req.user.role === "admin" && nextBranch.id !== req.user.branchId) {
    return res.status(403).json({
      message: "Admin cabang hanya boleh membuat akun di cabangnya sendiri."
    });
  }

  if (nextRole === "admin") {
    const existingBranchAdmins = await listUsers({ role: "admin", branchId: nextBranch.id });

    if (existingBranchAdmins.length > 0) {
      return res.status(409).json({
        message: "Cabang ini sudah memiliki admin."
      });
    }

  }

  if (nextSupervisorId) {
    const supervisor = await getUserById(nextSupervisorId);

    if (!supervisor) {
      return res.status(400).json({
        message: "Atasan yang dipilih tidak ditemukan."
      });
    }

    if (supervisor.companyId !== nextBranch.companyId || supervisor.branchId !== nextBranch.id) {
      return res.status(400).json({
        message: "Atasan harus berasal dari PT dan cabang yang sama."
      });
    }

    if (!nextPositionTitle) {
      return res.status(400).json({
        message: "Pilih jabatan user terlebih dahulu sebelum menentukan atasan."
      });
    }

    if (getJobTitleRank(supervisor.positionTitle) >= getJobTitleRank(nextPositionTitle)) {
      return res.status(400).json({
        message: "Atasan harus memiliki jabatan yang lebih tinggi dari user ini."
      });
    }

    nextSupervisorName = supervisor.name;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const user = await createUser({
    name,
    username,
    email,
    passwordHash,
    role: nextRole,
    nik,
    branchId: nextBranch.id,
    companyId: nextBranch.companyId,
    licenseNumber,
    positionTitle: nextPositionTitle,
    createdById: req.user.id,
    supervisorId: nextSupervisorId,
    supervisorName: nextSupervisorName
  });

  return res.status(201).json({
    message:
      nextRole === "admin"
        ? "Admin cabang berhasil dibuat."
        : "Akun marketing berhasil dibuat.",
    user
  });
});

router.put("/users/:userId", authorizeRoles("superadmin", "admin"), async (req, res) => {
  const {
    name,
    username,
    email,
    password,
    role,
    branchId,
    nik,
    licenseNumber,
    positionTitle,
    supervisorId
  } = req.body;
  const targetUser = await getUserById(req.params.userId);

  if (!targetUser) {
    return res.status(404).json({
      message: "User tidak ditemukan."
    });
  }

  if (!name || !username || !email) {
    return res.status(400).json({
      message: "Nama, username, dan email wajib diisi."
    });
  }

  let nextRole = role || targetUser.role;
  let nextBranch = branchId ? await getBranchById(branchId) : await getBranchById(targetUser.branchId);
  let nextPositionTitle = positionTitle?.trim() || targetUser.positionTitle || null;
  let nextSupervisorId =
    supervisorId !== undefined && supervisorId !== null && supervisorId !== ""
      ? Number(supervisorId)
      : supervisorId === null || supervisorId === ""
        ? null
        : targetUser.supervisorId;
  let nextSupervisorName = targetUser.supervisorName || null;

  if (req.user.role === "admin") {
    if (targetUser.role !== "marketing") {
      return res.status(403).json({
        message: "Admin cabang hanya boleh mengubah akun marketing."
      });
    }

    if (
      targetUser.companyId !== req.user.companyId ||
      targetUser.branchId !== req.user.branchId
    ) {
      return res.status(403).json({
        message: "Admin cabang hanya boleh mengubah marketing di cabangnya sendiri."
      });
    }

    nextRole = "marketing";
    nextBranch = await getBranchById(req.user.branchId);
  }

  if (!["admin", "marketing"].includes(nextRole)) {
    return res.status(400).json({
      message: "Role hanya boleh admin atau marketing."
    });
  }

  if (!nextBranch) {
    return res.status(400).json({
      message: "Cabang untuk akun ini tidak valid."
    });
  }

  if (nextRole === "admin") {
    const existingBranchAdmins = await listUsers({ role: "admin", branchId: nextBranch.id });
    const otherBranchAdmin = existingBranchAdmins.find(
      (admin) => Number(admin.id) !== Number(targetUser.id)
    );

    if (otherBranchAdmin) {
      return res.status(409).json({
        message: "Cabang ini sudah memiliki admin."
      });
    }

  }

  if (nextSupervisorId) {
    const supervisor = await getUserById(nextSupervisorId);

    if (!supervisor) {
      return res.status(400).json({
        message: "Atasan yang dipilih tidak ditemukan."
      });
    }

    if (Number(supervisor.id) === Number(targetUser.id)) {
      return res.status(400).json({
        message: "User tidak bisa memilih dirinya sendiri sebagai atasan."
      });
    }

    if (supervisor.companyId !== nextBranch.companyId || supervisor.branchId !== nextBranch.id) {
      return res.status(400).json({
        message: "Atasan harus berasal dari PT dan cabang yang sama."
      });
    }

    if (!nextPositionTitle) {
      return res.status(400).json({
        message: "Pilih jabatan user terlebih dahulu sebelum menentukan atasan."
      });
    }

    if (getJobTitleRank(supervisor.positionTitle) >= getJobTitleRank(nextPositionTitle)) {
      return res.status(400).json({
        message: "Atasan harus memiliki jabatan yang lebih tinggi dari user ini."
      });
    }

    nextSupervisorName = supervisor.name;
  } else {
    nextSupervisorName = null;
  }

  const passwordHash = password ? await bcrypt.hash(password, BCRYPT_SALT_ROUNDS) : null;
  const user = await updateUser(req.params.userId, {
    name,
    username,
    email,
    passwordHash,
    role: nextRole,
    nik,
    branchId: nextBranch.id,
    companyId: nextBranch.companyId,
    licenseNumber,
    positionTitle: nextPositionTitle,
    supervisorId: nextSupervisorId,
    supervisorName: nextSupervisorName
  });

  return res.json({
    message: "Akun berhasil diperbarui.",
    user
  });
});

router.delete("/users/:userId", authorizeRoles("superadmin", "admin"), async (req, res) => {
  const targetUser = await getUserById(req.params.userId);

  if (!targetUser) {
    return res.status(404).json({
      message: "User tidak ditemukan."
    });
  }

  if (Number(targetUser.id) === Number(req.user.id)) {
    return res.status(400).json({
      message: "Akun yang sedang login tidak bisa dihapus."
    });
  }

  if (req.user.role === "admin") {
    if (targetUser.role !== "marketing") {
      return res.status(403).json({
        message: "Admin cabang hanya boleh menghapus akun marketing."
      });
    }

    if (
      targetUser.companyId !== req.user.companyId ||
      targetUser.branchId !== req.user.branchId
    ) {
      return res.status(403).json({
        message: "Admin cabang hanya boleh menghapus marketing di cabangnya sendiri."
      });
    }
  }

  const deleted = await deleteUser(req.params.userId);

  if (!deleted) {
    return res.status(404).json({
      message: "User tidak ditemukan."
    });
  }

  return res.json({
    message: "User berhasil dihapus."
  });
});

export default router;
