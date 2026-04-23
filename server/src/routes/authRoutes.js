import jwt from "jsonwebtoken";
import { Router } from "express";
import { getUserByEmail, sanitizeUser, verifyPassword } from "../data/userStore.js";

const router = Router();

function createToken(user) {
  return jwt.sign(
    {
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || "super-rahasia-ganti-di-production",
    {
      subject: String(user.id),
      expiresIn: "8h"
    }
  );
}

function createAuthPayload(user) {
  return {
    message: "Autentikasi berhasil.",
    token: createToken(user),
    user
  };
}

router.post("/register", async (_req, res) => {
  return res.status(403).json({
    message:
      "Registrasi publik dinonaktifkan. Akun marketing dibuat oleh admin cabang."
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email dan password wajib diisi."
    });
  }

  const user = await getUserByEmail(email);

  if (!user || !(await verifyPassword(user, password))) {
    return res.status(401).json({
      message: "Email atau password salah."
    });
  }

  return res.json(createAuthPayload(sanitizeUser(user)));
});

export default router;
