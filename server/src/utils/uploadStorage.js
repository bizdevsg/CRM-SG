import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export const uploadsRoot = path.resolve(currentDirectory, "../../uploads");

export function ensureUploadsDirectory(subdirectory = "") {
  const targetDirectory = path.join(uploadsRoot, subdirectory);
  fs.mkdirSync(targetDirectory, { recursive: true });
  return targetDirectory;
}

export function absolutePathToPublicPath(absoluteFilePath) {
  const relativePath = path.relative(uploadsRoot, absoluteFilePath);

  if (!relativePath || relativePath.startsWith("..")) {
    return null;
  }

  return `/${path.posix.join("uploads", ...relativePath.split(path.sep))}`;
}

export function isManagedUploadPath(filePath) {
  return typeof filePath === "string" && filePath.startsWith("/uploads/");
}

function resolveManagedUploadPath(filePath) {
  if (!isManagedUploadPath(filePath)) {
    return null;
  }

  const relativePath = filePath.replace(/^\/uploads\//, "");
  return path.join(uploadsRoot, relativePath);
}

export async function removeUploadedFile(filePath) {
  const absolutePath = resolveManagedUploadPath(filePath);

  if (!absolutePath) {
    return;
  }

  try {
    await fsPromises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}
