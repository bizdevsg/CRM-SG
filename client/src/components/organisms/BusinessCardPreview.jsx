import { useEffect, useState } from "react";
import logoBPF from "../../assets/logoBPF.png";
import logoEWF from "../../assets/logoEWF.png";
import logoKPF from "../../assets/logo-kpf.png";
import logoRFB from "../../assets/logo-rfb-full.png";

// Mapping warna utama per PT untuk aksen kartu nama.
const COMPANY_THEMES = {
  "pt solid gold berjangka": {
    accent: "#b8860b",
    accentSoft: "#f5d76e",
    shadow: "rgba(184,134,11,0.28)",
  },
  "pt riffan financindo berjangka": {
    accent: "#15803d",
    accentSoft: "#86efac",
    shadow: "rgba(21,128,61,0.28)",
  },
  "pt kontak perkasa futures": {
    accent: "#059669",
    accentSoft: "#6ee7b7",
    shadow: "rgba(5,150,105,0.28)",
  },
  "pt bestprofit futures": {
    accent: "#1d4ed8",
    accentSoft: "#93c5fd",
    shadow: "rgba(29,78,216,0.28)",
  },
  "pt equityworld futures": {
    accent: "#ea580c",
    accentSoft: "#fdba74",
    shadow: "rgba(234,88,12,0.28)",
  },
};

// Mapping logo PT untuk menggantikan teks nama perusahaan di kartu.
const COMPANY_LOGOS = {
  "pt riffan financindo berjangka": logoRFB,
  "pt kontak perkasa futures": logoKPF,
  "pt bestprofit futures": logoBPF,
  "pt equityworld futures": logoEWF,
};

function normalizeCompanyName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getBusinessCardTheme(companyName) {
  const normalizedName = normalizeCompanyName(companyName);
  return (
    COMPANY_THEMES[normalizedName] || {
      accent: "#15803d",
      accentSoft: "#86efac",
      shadow: "rgba(21,128,61,0.28)",
    }
  );
}

function getBusinessCardLogo(companyName) {
  return COMPANY_LOGOS[normalizeCompanyName(companyName)] || null;
}

// Helper untuk memuat QR image sebelum digambar ke canvas.
function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Gagal memuat gambar: ${src}`));
    image.src = src;
  });
}

// Helper rounded-rectangle yang dipakai ulang untuk base kartu dan panel QR.
function roundRectPath(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function fillRoundedRect(context, x, y, width, height, radius, fillStyle) {
  context.save();
  context.fillStyle = fillStyle;
  roundRectPath(context, x, y, width, height, radius);
  context.fill();
  context.restore();
}

function strokeRoundedRect(
  context,
  x,
  y,
  width,
  height,
  radius,
  strokeStyle,
  lineWidth = 1,
) {
  context.save();
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  roundRectPath(context, x, y, width, height, radius);
  context.stroke();
  context.restore();
}

// Memotong teks kalau terlalu panjang agar tetap muat di area kartu.
function fitTextToWidth(context, text, maxWidth) {
  const safeText = String(text || "");
  if (context.measureText(safeText).width <= maxWidth) {
    return safeText;
  }

  let output = safeText;
  while (
    output.length > 0 &&
    context.measureText(`${output}...`).width > maxWidth
  ) {
    output = output.slice(0, -1);
  }

  return output ? `${output}...` : "";
}

// Membuat teks multi-line, terutama untuk nama marketing yang bisa panjang.
function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) {
    return y;
  }

  const lines = [];
  let currentLine = words[0];

  for (let index = 1; index < words.length; index += 1) {
    const nextLine = `${currentLine} ${words[index]}`;
    if (context.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
    } else {
      lines.push(currentLine);
      currentLine = words[index];
    }
  }

  lines.push(currentLine);

  const visibleLines = maxLines ? lines.slice(0, maxLines) : lines;
  visibleLines.forEach((line, index) => {
    const isClamped =
      maxLines &&
      index === visibleLines.length - 1 &&
      lines.length > visibleLines.length;
    const output = isClamped ? fitTextToWidth(context, line, maxWidth) : line;
    context.fillText(output, x, y + lineHeight * index);
  });

  return y + visibleLines.length * lineHeight;
}

function sanitizeFilename(value) {
  return String(value || "kartu-nama")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function hexToRgba(hexColor, alpha) {
  const hex = String(hexColor || "").replace("#", "");

  if (hex.length !== 6) {
    return `rgba(255,255,255,${alpha})`;
  }

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red},${green},${blue},${alpha})`;
}

function formatBusinessCardJobTitle(value) {
  return String(value || "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function buildBusinessCardCanvas({ profile, ecard }) {
  if (!ecard?.qrCodeDataUrl) {
    throw new Error("QR code belum tersedia untuk diunduh.");
  }

  const qrImage = await loadImage(ecard.qrCodeDataUrl);
  const companyLogo = await loadImage(
    getBusinessCardLogo(profile?.companyName),
  );
  const theme = getBusinessCardTheme(profile?.companyName);
  const scale = 1200 / 996;
  const cardWidth = 996;
  const cardHeight = 500;
  const qrPanelX = 700;
  const qrPanelY = 26;
  const qrPanelWidth = 264;
  const qrPanelHeight = 448;
  const qrCenterX = qrPanelX + qrPanelWidth / 2;

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = Math.round(cardHeight * scale);
  const context = canvas.getContext("2d");

  // Scale akhir export PNG. Ubah `cardWidth`/`cardHeight` kalau mau proporsi dasar kartunya diganti.
  context.scale(scale, scale);

  // Base utama kartu dengan gradien lembut agar tampil lebih premium.
  const baseGradient = context.createLinearGradient(0, 0, cardWidth, cardHeight);
  baseGradient.addColorStop(0, "#ffffff");
  baseGradient.addColorStop(0.55, "#f8fbff");
  baseGradient.addColorStop(1, hexToRgba(theme.accentSoft, 0.28));
  fillRoundedRect(context, 0, 0, cardWidth, cardHeight, 0, baseGradient);

  // Panel kanan khusus QR dengan warna brand PT agar layout terasa lebih branded.
  const rightPanelGradient = context.createLinearGradient(
    qrPanelX,
    qrPanelY,
    qrPanelX + qrPanelWidth,
    qrPanelY + qrPanelHeight,
  );
  rightPanelGradient.addColorStop(0, hexToRgba(theme.accent, 0.92));
  rightPanelGradient.addColorStop(1, hexToRgba(theme.accentSoft, 0.95));
  fillRoundedRect(
    context,
    qrPanelX,
    qrPanelY,
    qrPanelWidth,
    qrPanelHeight,
    34,
    rightPanelGradient,
  );

  // Lingkaran dekoratif halus di panel kanan.
  context.save();
  context.fillStyle = "rgba(255,255,255,0.11)";
  context.beginPath();
  context.arc(934, 96, 74, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(928, 436, 102, 0, Math.PI * 2);
  context.fill();
  context.restore();

  // Strip aksen bawah supaya kartu tetap punya anchor visual.
  fillRoundedRect(context, 0, 488, cardWidth, 12, 0, theme.accent);

  // Card kecil untuk area logo / nama PT.
  context.save();
  context.shadowColor = "rgba(15,23,42,0.08)";
  context.shadowBlur = 18;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 6;
  fillRoundedRect(context, 48, 44, 214, 68, 20, "rgba(255,255,255,0.88)");
  context.restore();

  // Glow halus di sisi kiri supaya area identitas terasa lebih hidup.
  context.save();
  context.fillStyle = hexToRgba(theme.accentSoft, 0.14);
  context.beginPath();
  context.arc(170, 214, 108, 0, Math.PI * 2);
  context.fill();
  context.restore();

  // Header kiri atas: pakai logo PT jika tersedia, fallback ke teks perusahaan.
  if (companyLogo) {
    const logoMaxWidth = 170;
    const logoMaxHeight = 42;
    const ratio = Math.min(
      logoMaxWidth / companyLogo.width,
      logoMaxHeight / companyLogo.height,
    );
    const logoWidth = companyLogo.width * ratio;
    const logoHeight = companyLogo.height * ratio;
    context.drawImage(companyLogo, 70, 57, logoWidth, logoHeight);
  } else {
    context.fillStyle = "#252833";
    context.font = "700 26px Arial";
    context.fillText(
      fitTextToWidth(context, profile?.companyName || "Nama Perusahaan", 180),
      68,
      85,
    );
  }

  // Nama marketing besar sebagai fokus utama kartu.
  context.save();
  context.fillStyle = "#1f2937";
  context.shadowColor = `${theme.accent}42`;
  context.shadowBlur = 4;
  context.shadowOffsetX = 2;
  context.shadowOffsetY = 4;
  context.font = "900 60px Arial";
  const nameBottom = drawWrappedText(
    context,
    profile?.fullName || profile?.name || "Nama Marketing",
    52,
    176,
    564,
    66,
    2,
  );
  context.restore();

  // Panel informasi bawah kiri supaya jabatan dan cabang terasa lebih terstruktur.
  context.save();
  context.shadowColor = "rgba(15,23,42,0.06)";
  context.shadowBlur = 20;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 8;
  fillRoundedRect(context, 52, nameBottom + 26, 474, 108, 26, "rgba(255,255,255,0.76)");
  context.restore();
  fillRoundedRect(context, 52, nameBottom + 26, 474, 108, 26, "rgba(255,255,255,0.54)");

  // Job title ditampilkan sebagai pill premium di dalam panel info kiri.
  const jobTitle = fitTextToWidth(
    context,
    formatBusinessCardJobTitle(
      profile?.ecardJobTitle ||
        profile?.positionTitle ||
        "Marketing Consultant",
    ) || "Marketing Consultant",
    420,
  );
  context.font = "700 24px Arial";
  const jobPillWidth = Math.min(context.measureText(jobTitle).width + 34, 454);
  fillRoundedRect(
    context,
    74,
    nameBottom + 46,
    jobPillWidth,
    42,
    21,
    hexToRgba(theme.accent, 0.12),
  );
  context.fillStyle = theme.accent;
  context.fillText(jobTitle, 92, nameBottom + 74);

  // Nama cabang diletakkan di bawah pill jabatan dengan tone lebih tenang.
  context.fillStyle = "#475569";
  context.font = "500 22px Arial";
  context.fillText(
    fitTextToWidth(context, profile?.branchName || "-", 500),
    74,
    nameBottom + 116,
  );

  // Label scan di panel kanan dibuat putih dan lebih premium.
  context.fillStyle = "rgba(255,255,255,0.96)";
  context.font = "800 21px Arial";
  context.textAlign = "center";
  context.fillText("SCAN UNTUK", qrCenterX, 88);
  context.fillText("PROFIL E-CARD", qrCenterX, 118);

  // Container QR utama.
  context.save();
  context.shadowColor = "rgba(15,23,42,0.20)";
  context.shadowBlur = 26;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 14;
  fillRoundedRect(context, 724, 146, 216, 216, 38, "rgba(255,255,255,0.18)");
  fillRoundedRect(context, 712, 134, 240, 240, 42, "#ffffff");
  fillRoundedRect(context, 726, 148, 212, 212, 34, hexToRgba(theme.accentSoft, 0.18));
  fillRoundedRect(
    context,
    742,
    164,
    180,
    180,
    28,
    "rgba(255,255,255,0.96)",
  );
  context.restore();
  context.drawImage(qrImage, 748, 170, 168, 168);
  context.textAlign = "start";

  return canvas;
}

export async function generateEcardBusinessCardDataUrl({ profile, ecard }) {
  const canvas = await buildBusinessCardCanvas({ profile, ecard });
  return canvas.toDataURL("image/png");
}

// Download PNG memakai render canvas yang sama dengan preview.
export async function downloadEcardBusinessCard({ profile, ecard }) {
  const dataUrl = await generateEcardBusinessCardDataUrl({ profile, ecard });

  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = `${sanitizeFilename(profile?.fullName || profile?.name || ecard?.slug)}-kartu-nama.png`;
  anchor.click();
}

export default function BusinessCardPreview({
  profile,
  ecard,
  compact = false,
}) {
  const [previewSrc, setPreviewSrc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadPreview() {
      try {
        setError("");
        const dataUrl = await generateEcardBusinessCardDataUrl({
          profile,
          ecard,
        });

        if (!isActive) {
          return;
        }

        setPreviewSrc(dataUrl);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setPreviewSrc("");
        setError(loadError.message || "Preview kartu nama gagal dimuat.");
      }
    }

    loadPreview();

    return () => {
      isActive = false;
    };
  }, [ecard, profile]);

  if (error) {
    return (
      // State error kalau QR belum siap atau gagal dirender.
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
        {error}
      </div>
    );
  }

  if (!previewSrc) {
    return (
      // State loading sebelum preview PNG selesai dibuat.
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        Menyiapkan preview kartu nama...
      </div>
    );
  }

  return (
    // Wrapper preview di halaman. Ubah di sini kalau mau kasih padding/rounded/shadow tambahan di UI.
    <div>
      <img
        src={previewSrc}
        alt={`Preview kartu nama ${profile?.fullName || profile?.name || ecard?.title || "marketing"}`}
        className="w-full bg-white shadow-[0_18px_42px_rgba(15,23,42,0.10)]"
      />
    </div>
  );
}
