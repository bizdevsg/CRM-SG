import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeDatabase } from "./db/bootstrap.js";
import { getMysqlConfig } from "./db/mysql.js";
import authRoutes from "./routes/authRoutes.js";
import managementRoutes from "./routes/managementRoutes.js";
import marketingRoutes from "./routes/marketingRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5050;
const uploadsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");
const allowedOrigins = Array.from(
  new Set(
    [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ]
      .flatMap((value) => String(value || "").split(","))
      .map((value) => value.trim().replace(/\/+$/, ""))
      .filter(Boolean)
  )
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS.`));
    }
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadsDirectory));

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend Express aktif.",
    frontendUrl: allowedOrigins[0] || "http://localhost:5173",
    apiBaseUrl: `http://localhost:${port}/api`,
    endpoints: {
      health: "/api/health",
      login: "/api/auth/login",
      register: "/api/auth/register",
      profile: "/api/users/me",
      dashboard: "/api/users/dashboard-data",
      management: "/api/management/users",
      marketingResources: "/api/marketing/me/resources",
      publicEcard: "/api/public/ecards/:companySlug/:branchCode/:ecardSlug",
      database: {
        host: getMysqlConfig().host,
        port: getMysqlConfig().port,
        database: getMysqlConfig().database
      }
    }
  });
});

app.get("/api", (_req, res) => {
  res.json({
    status: "ok",
    message: "API siap digunakan.",
    endpoints: {
      health: "/api/health",
      login: "/api/auth/login",
      register: "/api/auth/register",
      profile: "/api/users/me",
      dashboard: "/api/users/dashboard-data",
      management: "/api/management/users",
      marketingResources: "/api/marketing/me/resources",
      publicEcard: "/api/public/ecards/:companySlug/:branchCode/:ecardSlug"
    }
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Server Express berjalan dengan baik."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/management", managementRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/public", publicRoutes);

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error);
  res.status(500).json({
    message:
      error?.code === "ER_DUP_ENTRY"
        ? "Data yang sama sudah ada di database."
        : error?.code === "LIMIT_FILE_SIZE"
          ? "Ukuran file maksimal 5MB."
          : error?.message || "Terjadi kesalahan pada server."
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`
  });
});

initializeDatabase().then(() => {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${port} sedang dipakai proses lain. Ubah PORT di server/.env lalu jalankan ulang.`
      );
      process.exit(1);
    }

    console.error("Gagal menjalankan server:", error);
    process.exit(1);
  });
}).catch((error) => {
  console.error("Gagal menyiapkan database MySQL:", error);
  process.exit(1);
});
