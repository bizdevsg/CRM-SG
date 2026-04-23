import sharp from "sharp";

export async function validateProfilePhotoFile(filePath) {
  const metadata = await sharp(filePath).metadata();

  if (metadata.format !== "png") {
    throw new Error("Photo profile harus file PNG.");
  }

  if (!metadata.hasAlpha) {
    throw new Error("Photo profile harus PNG background transparan.");
  }

  if (!metadata.width || !metadata.height || metadata.width !== metadata.height) {
    throw new Error("Photo profile harus memiliki rasio 1:1.");
  }
}
