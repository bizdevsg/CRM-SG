import crypto from "node:crypto";
import path from "node:path";
import multer from "multer";
import { ensureUploadsDirectory } from "../utils/uploadStorage.js";

export function createImageUpload(subdirectory, options = {}) {
  const allowedMimeTypes = new Set(options.allowedMimeTypes || ["image/jpeg", "image/png", "image/webp"]);
  const invalidTypeMessage = options.invalidTypeMessage || "File harus berupa gambar JPG, PNG, atau WEBP.";

  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, callback) => {
        callback(null, ensureUploadsDirectory(subdirectory));
      },
      filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
        callback(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`);
      }
    }),
    fileFilter: (_req, file, callback) => {
      if (!allowedMimeTypes.has(file.mimetype)) {
        callback(new Error(invalidTypeMessage));
        return;
      }

      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  });
}
