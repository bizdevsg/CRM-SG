import jwt from "jsonwebtoken";
import { getUserById, sanitizeUser } from "../data/userStore.js";

export async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Token tidak ditemukan. Silakan login terlebih dahulu."
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super-rahasia-ganti-di-production"
    );
    const user = await getUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        message: "User untuk token ini tidak ditemukan."
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Akun ini sedang non aktif."
      });
    }

    req.user = sanitizeUser(user);
    next();
  } catch {
    return res.status(401).json({
      message: "Token tidak valid atau sudah kedaluwarsa."
    });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk mengakses resource ini."
      });
    }

    next();
  };
}
