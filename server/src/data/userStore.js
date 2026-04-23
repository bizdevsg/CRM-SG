import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { query } from "../db/mysql.js";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function branchCodeFromCity(city) {
  return (city || "general")
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePlatform(platform) {
  const value = platform.toLowerCase().trim();
  const map = {
    instagram: "instagram",
    ig: "instagram",
    linkedin: "linkedin",
    tiktok: "tiktok",
    whatsapp: "whatsapp",
    wa: "whatsapp"
  };

  return map[value] || null;
}

function buildUsername(name, email) {
  const fallback = email?.split("@")[0] || "user";
  const base = slugify(name || fallback).replace(/-/g, ".").slice(0, 50);
  return base || fallback;
}

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    name: row.full_name,
    email: row.email,
    role: row.role_name,
    branchId: row.branch_id ? Number(row.branch_id) : null,
    branchName: row.branch_name || null,
    createdById: row.manager_id ? Number(row.manager_id) : null,
    companyId: row.company_id ? Number(row.company_id) : null,
    companyName: row.company_name || null
  };
}

function mapBiodataEntry(row) {
  return {
    id: String(row.id),
    label: row.label,
    value: row.value
  };
}

function mapCertificateEntry(row) {
  return {
    id: String(row.id),
    title: row.title,
    issuer: row.issuer,
    year: row.year
  };
}

function mapEcardEntry(row) {
  return {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    publicUrl: row.public_url,
    qrCodeDataUrl: row.qr_code_data_url,
    createdAt: row.created_at
  };
}

function sanitizeBranch(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    name: row.name,
    city: row.city,
    code: branchCodeFromCity(row.city),
    adminCount: Number(row.admin_count || 0),
    marketingCount: Number(row.marketing_count || 0),
    ecardCount: Number(row.ecard_count || 0)
  };
}

export function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const branchId = user.branchId ?? user.branch_id ?? null;
  const createdById = user.createdById ?? user.manager_id ?? null;
  const companyId = user.companyId ?? user.company_id ?? null;

  return {
    id: Number(user.id),
    name: user.name || user.full_name,
    email: user.email,
    role: user.role || user.role_name,
    branchId: branchId ? Number(branchId) : null,
    branchName: user.branchName || user.branch_name || null,
    createdById: createdById ? Number(createdById) : null,
    companyId: companyId ? Number(companyId) : null
  };
}

async function getRoleByName(roleName) {
  const rows = await query("SELECT id, name FROM roles WHERE name = ?", [roleName]);
  return rows[0] || null;
}

async function getCompanyIdFromBranch(branchId) {
  const rows = await query("SELECT company_id FROM branches WHERE id = ?", [branchId]);
  return rows[0]?.company_id || null;
}

async function getBranchRowById(branchId) {
  const rows = await query(
    `SELECT
      b.id,
      b.company_id,
      b.name,
      b.city,
      (
        SELECT COUNT(*)
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE u.branch_id = b.id AND r.name = 'admin'
      ) AS admin_count,
      (
        SELECT COUNT(*)
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE u.branch_id = b.id AND r.name = 'marketing'
      ) AS marketing_count,
      (
        SELECT COUNT(*)
        FROM user_ecards e
        INNER JOIN users u ON u.id = e.user_id
        WHERE u.branch_id = b.id
      ) AS ecard_count
    FROM branches b
    WHERE b.id = ?`,
    [branchId]
  );

  return rows[0] || null;
}

async function getUserBaseRowById(userId) {
  const rows = await query(
    `SELECT
      u.id,
      u.username,
      u.slug,
      u.password_hash,
      u.full_name,
      u.nickname,
      u.photo,
      u.job_title,
      u.license_number,
      u.description,
      u.phone,
      u.email,
      u.tiktok,
      u.instagram,
      u.linkedin,
      u.whatsapp,
      u.company_id,
      c.name AS company_name,
      u.branch_id,
      b.name AS branch_name,
      b.city AS branch_city,
      u.role_id,
      r.name AS role_name,
      u.manager_id,
      u.is_verified,
      u.is_active
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.id = ?`,
    [userId]
  );

  return rows[0] || null;
}

export async function listBranches() {
  const rows = await query(
    `SELECT
      b.id,
      b.company_id,
      b.name,
      b.city,
      (
        SELECT COUNT(*)
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE u.branch_id = b.id AND r.name = 'admin'
      ) AS admin_count,
      (
        SELECT COUNT(*)
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE u.branch_id = b.id AND r.name = 'marketing'
      ) AS marketing_count,
      (
        SELECT COUNT(*)
        FROM user_ecards e
        INNER JOIN users u ON u.id = e.user_id
        WHERE u.branch_id = b.id
      ) AS ecard_count
    FROM branches b
    ORDER BY b.id ASC`
  );

  return rows.map(sanitizeBranch);
}

export async function getBranchById(branchId) {
  const row = await getBranchRowById(branchId);
  return sanitizeBranch(row);
}

export async function getBranchByCode(code) {
  const rows = await query("SELECT id, company_id, name, city FROM branches WHERE city = ?", [
    code
  ]);
  return sanitizeBranch(rows[0]);
}

export async function createBranch({ name, city, companyId }) {
  const rows = await query(
    "INSERT INTO branches (company_id, name, city) VALUES (?, ?, ?)",
    [companyId, name, city]
  );

  return getBranchById(rows.insertId);
}

export async function getUserByEmail(email) {
  const rows = await query(
    `SELECT
      u.id,
      u.username,
      u.slug,
      u.password_hash,
      u.full_name,
      u.nickname,
      u.photo,
      u.job_title,
      u.license_number,
      u.description,
      u.phone,
      u.email,
      u.tiktok,
      u.instagram,
      u.linkedin,
      u.whatsapp,
      u.company_id,
      c.name AS company_name,
      u.branch_id,
      b.name AS branch_name,
      b.city AS branch_city,
      u.role_id,
      r.name AS role_name,
      u.manager_id
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.email = ?`,
    [email.toLowerCase()]
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    ...mapUserRow(row),
    passwordHash: row.password_hash,
    branchCity: row.branch_city || null
  };
}

export async function getUserById(id) {
  const row = await getUserBaseRowById(id);

  if (!row) {
    return null;
  }

  return {
    ...mapUserRow(row),
    passwordHash: row.password_hash,
    branchCity: row.branch_city || null,
    username: row.username,
    slug: row.slug
  };
}

export async function listUsers(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.role) {
    conditions.push("r.name = ?");
    params.push(filters.role);
  }

  if (filters.branchId) {
    conditions.push("u.branch_id = ?");
    params.push(filters.branchId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query(
    `SELECT
      u.id,
      u.full_name,
      u.email,
      u.company_id,
      c.name AS company_name,
      u.branch_id,
      b.name AS branch_name,
      u.manager_id,
      r.name AS role_name
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    LEFT JOIN roles r ON r.id = u.role_id
    ${whereClause}
    ORDER BY u.id ASC`,
    params
  );

  return rows.map(mapUserRow);
}

export async function createUser({
  name,
  email,
  passwordHash,
  role = "marketing",
  branchId = null,
  createdById = null
}) {
  const roleRow = await getRoleByName(role);
  const companyId = branchId ? await getCompanyIdFromBranch(branchId) : null;
  const username = buildUsername(name, email);
  const slug = slugify(name || username);

  const result = await query(
    `INSERT INTO users (
      username,
      slug,
      password_hash,
      full_name,
      nickname,
      job_title,
      email,
      company_id,
      branch_id,
      role_id,
      manager_id,
      is_verified,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
    [
      username,
      slug,
      passwordHash,
      name,
      name.split(" ")[0],
      role === "admin" ? "Branch Admin" : "Marketing",
      email.toLowerCase(),
      companyId,
      branchId,
      roleRow?.id || null,
      createdById
    ]
  );

  const user = await getUserById(result.insertId);
  return sanitizeUser(user);
}

export async function verifyPassword(user, plainPassword) {
  return bcrypt.compare(plainPassword, user.passwordHash);
}

export async function getMarketingResources(userId) {
  const [userRow, biodataRows, certificateRows, ecardRows] = await Promise.all([
    getUserBaseRowById(userId),
    query(
      "SELECT id, label, value FROM user_biodata WHERE user_id = ? ORDER BY id DESC",
      [userId]
    ),
    query(
      "SELECT id, title, issuer, year FROM user_certificates WHERE user_id = ? ORDER BY id DESC",
      [userId]
    ),
    query(
      "SELECT id, title, slug, public_url, qr_code_data_url, created_at FROM user_ecards WHERE user_id = ? ORDER BY id DESC",
      [userId]
    )
  ]);

  const socialMedia = [
    userRow?.instagram ? { id: "instagram", platform: "Instagram", url: userRow.instagram } : null,
    userRow?.linkedin ? { id: "linkedin", platform: "LinkedIn", url: userRow.linkedin } : null,
    userRow?.tiktok ? { id: "tiktok", platform: "TikTok", url: userRow.tiktok } : null,
    userRow?.whatsapp
      ? {
          id: "whatsapp",
          platform: "WhatsApp",
          url: userRow.whatsapp
        }
      : null
  ].filter(Boolean);

  return {
    biodata: biodataRows.map(mapBiodataEntry),
    socialMedia,
    certificates: certificateRows.map(mapCertificateEntry),
    ecards: ecardRows.map(mapEcardEntry)
  };
}

export async function addBiodataEntry(userId, payload) {
  const result = await query(
    "INSERT INTO user_biodata (user_id, label, value) VALUES (?, ?, ?)",
    [userId, payload.label, payload.value]
  );

  return {
    id: String(result.insertId),
    label: payload.label,
    value: payload.value
  };
}

export async function removeBiodataEntry(userId, entryId) {
  const result = await query("DELETE FROM user_biodata WHERE id = ? AND user_id = ?", [
    entryId,
    userId
  ]);
  return result.affectedRows > 0;
}

export async function addSocialMediaEntry(userId, payload) {
  const platformKey = normalizePlatform(payload.platform);

  if (!platformKey) {
    throw new Error("Platform social media harus Instagram, LinkedIn, TikTok, atau WhatsApp.");
  }

  await query(`UPDATE users SET ${platformKey} = ? WHERE id = ?`, [payload.url, userId]);

  return {
    id: platformKey,
    platform:
      platformKey === "instagram"
        ? "Instagram"
        : platformKey === "linkedin"
          ? "LinkedIn"
          : platformKey === "tiktok"
            ? "TikTok"
            : "WhatsApp",
    url: payload.url
  };
}

export async function removeSocialMediaEntry(userId, entryId) {
  const platformKey = normalizePlatform(entryId);

  if (!platformKey) {
    return false;
  }

  const result = await query(`UPDATE users SET ${platformKey} = NULL WHERE id = ?`, [userId]);
  return result.affectedRows > 0;
}

export async function addCertificateEntry(userId, payload) {
  const result = await query(
    "INSERT INTO user_certificates (user_id, title, issuer, year) VALUES (?, ?, ?, ?)",
    [userId, payload.title, payload.issuer, payload.year]
  );

  return {
    id: String(result.insertId),
    title: payload.title,
    issuer: payload.issuer,
    year: payload.year
  };
}

export async function removeCertificateEntry(userId, entryId) {
  const result = await query("DELETE FROM user_certificates WHERE id = ? AND user_id = ?", [
    entryId,
    userId
  ]);
  return result.affectedRows > 0;
}

export async function createEcardEntry(userId, payload) {
  const user = await getUserBaseRowById(userId);
  const slug = slugify(payload.slug || payload.title || user.full_name);
  const branchCode = branchCodeFromCity(user.branch_city);
  const publicUrl = `https://ecard.local/${branchCode.toLowerCase()}/${slug}`;
  const qrCodeDataUrl = await QRCode.toDataURL(publicUrl, {
    margin: 1,
    width: 240
  });

  const result = await query(
    "INSERT INTO user_ecards (user_id, title, slug, public_url, qr_code_data_url) VALUES (?, ?, ?, ?, ?)",
    [userId, payload.title, slug, publicUrl, qrCodeDataUrl]
  );

  return {
    id: String(result.insertId),
    title: payload.title,
    slug,
    publicUrl,
    qrCodeDataUrl,
    createdAt: new Date().toISOString()
  };
}

export async function removeEcardEntry(userId, entryId) {
  const result = await query("DELETE FROM user_ecards WHERE id = ? AND user_id = ?", [
    entryId,
    userId
  ]);
  return result.affectedRows > 0;
}

export async function getDashboardData(actor) {
  if (actor.role === "superadmin") {
    const [branches, admins, marketingTeam, statsRows] = await Promise.all([
      listBranches(),
      listUsers({ role: "admin" }),
      listUsers({ role: "marketing" }),
      query(
        `SELECT
          (SELECT COUNT(*) FROM branches) AS total_branches,
          (
            SELECT COUNT(*)
            FROM users u
            INNER JOIN roles r ON r.id = u.role_id
            WHERE r.name = 'admin'
          ) AS total_admins,
          (
            SELECT COUNT(*)
            FROM users u
            INNER JOIN roles r ON r.id = u.role_id
            WHERE r.name = 'marketing'
          ) AS total_marketing,
          (SELECT COUNT(*) FROM user_ecards) AS total_ecards`
      )
    ]);

    return {
      role: actor.role,
      stats: {
        totalBranches: Number(statsRows[0].total_branches || 0),
        totalAdmins: Number(statsRows[0].total_admins || 0),
        totalMarketing: Number(statsRows[0].total_marketing || 0),
        totalEcards: Number(statsRows[0].total_ecards || 0)
      },
      branches,
      admins,
      marketingTeam
    };
  }

  if (actor.role === "admin") {
    const [branch, marketingTeam, statsRows] = await Promise.all([
      getBranchById(actor.branchId),
      listUsers({ role: "marketing", branchId: actor.branchId }),
      query(
        `SELECT
          (
            SELECT COUNT(*)
            FROM users u
            INNER JOIN roles r ON r.id = u.role_id
            WHERE r.name = 'marketing' AND u.branch_id = ?
          ) AS total_marketing,
          (
            SELECT COUNT(*)
            FROM user_certificates c
            INNER JOIN users u ON u.id = c.user_id
            INNER JOIN roles r ON r.id = u.role_id
            WHERE r.name = 'marketing' AND u.branch_id = ?
          ) AS total_certificates,
          (
            SELECT COUNT(*)
            FROM user_ecards e
            INNER JOIN users u ON u.id = e.user_id
            INNER JOIN roles r ON r.id = u.role_id
            WHERE r.name = 'marketing' AND u.branch_id = ?
          ) AS total_ecards`,
        [actor.branchId, actor.branchId, actor.branchId]
      )
    ]);

    return {
      role: actor.role,
      branch,
      stats: {
        totalMarketing: Number(statsRows[0].total_marketing || 0),
        totalCertificates: Number(statsRows[0].total_certificates || 0),
        totalEcards: Number(statsRows[0].total_ecards || 0)
      },
      marketingTeam
    };
  }

  const resources = await getMarketingResources(actor.id);

  return {
    role: actor.role,
    stats: {
      biodataCount: resources.biodata.length,
      socialMediaCount: resources.socialMedia.length,
      certificateCount: resources.certificates.length,
      ecardCount: resources.ecards.length
    },
    resources
  };
}
