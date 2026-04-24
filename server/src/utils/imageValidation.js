import sharp from "sharp";

export async function validateProfilePhotoFile(filePath) {
  const metadata = await sharp(filePath).metadata();
  const width = Number(metadata.width || 0);
  const height = Number(metadata.height || 0);

  if (metadata.format !== "png") {
    throw new Error("Photo profile harus file PNG.");
  }

  if (!metadata.hasAlpha) {
    throw new Error("Photo profile harus PNG background transparan.");
  }

  if (!width || !height || height <= width) {
    throw new Error("Photo profile harus potret dengan rasio 3:4.");
  }

  if (Math.abs(width / height - 3 / 4) > 0.01) {
    throw new Error("Photo profile harus potret dengan rasio 3:4.");
  }

  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let hasTransparentPixel = false;

  for (let index = info.channels - 1; index < data.length; index += info.channels) {
    if (data[index] < 255) {
      hasTransparentPixel = true;
      break;
    }
  }

  if (!hasTransparentPixel) {
    throw new Error("Photo profile harus PNG background transparan.");
  }
}
