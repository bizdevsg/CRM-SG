import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { query } from "../db/mysql.js";
import { removeUploadedFile } from "../utils/uploadStorage.js";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 120)
    .replace(/^-+|-+$/g, "");
}

function branchCodeFromName(value) {
  return String(value || "")
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "-")
    .slice(0, 24)
    .replace(/^-+|-+$/g, "");
}

function buildUsername(name, email) {
  const fallback = email?.split("@")[0] || "user";
  const base = slugify(name || fallback).replace(/-/g, ".").slice(0, 100);
  return base || fallback;
}

function buildAutomaticEcardSlug(user) {
  const slugSource = [user?.licenseNumber, user?.name]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");

  return slugify(slugSource || user?.username || `marketing-${user?.id || ""}`);
}

function getIncompleteEcardFields(user) {
  const requiredFields = [
    { label: "nama lengkap", value: user?.name },
    { label: "email", value: user?.email },
    { label: "nomor izin", value: user?.licenseNumber },
    { label: "jabatan e-card atau jabatan asli", value: user?.ecardJobTitle || user?.positionTitle },
    { label: "deskripsi profil", value: user?.description },
    { label: "nomor telepon", value: user?.phone },
    { label: "foto profil", value: user?.photo },
    { label: "perusahaan", value: user?.companyName },
    { label: "cabang", value: user?.branchName }
  ];

  return requiredFields
    .filter((field) => !String(field.value || "").trim())
    .map((field) => field.label);
}

async function resolveAvailableEcardSlug(user, excludeEntryId = null) {
  const baseSlug = buildAutomaticEcardSlug(user) || `marketing-${user.id}`;
  let suffix = 0;

  while (true) {
    const candidateSlug =
      suffix === 0
        ? baseSlug
        : `${baseSlug}-${suffix === 1 ? user.id : `${user.id}-${suffix}`}`;
    const rows = await query(
      `SELECT id, user_id
        FROM ecards
        WHERE slug = ?
          ${excludeEntryId ? "AND id <> ?" : ""}
        LIMIT 1`,
      excludeEntryId ? [candidateSlug, excludeEntryId] : [candidateSlug]
    );

    if (!rows.length || Number(rows[0].user_id) === Number(user.id)) {
      return candidateSlug;
    }

    suffix += 1;
  }
}

function getClientBaseUrl() {
  const configuredUrl = String(process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");

  return configuredUrl || "http://localhost:5173";
}

export function buildPublicEcardUrl(user) {
  return `${getClientBaseUrl()}/marketing/${user.slug}`;
}

const SOCIAL_MEDIA_PLATFORM_LABELS = {
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "Twitter/X",
  linkedin: "LinkedIn"
};

const SOCIAL_MEDIA_PLATFORMS = Object.keys(SOCIAL_MEDIA_PLATFORM_LABELS);

const USER_SOCIAL_MEDIA_PIVOT_QUERY = `
  SELECT
    msm.user_id,
    MAX(CASE WHEN msm.platform = 'instagram' THEN msm.username END) AS instagram_username,
    MAX(CASE WHEN msm.platform = 'instagram' THEN msm.url END) AS instagram,
    MAX(CASE WHEN msm.platform = 'tiktok' THEN msm.username END) AS tiktok_username,
    MAX(CASE WHEN msm.platform = 'tiktok' THEN msm.url END) AS tiktok,
    MAX(CASE WHEN msm.platform = 'twitter' THEN msm.username END) AS twitter_username,
    MAX(CASE WHEN msm.platform = 'twitter' THEN msm.url END) AS twitter,
    MAX(CASE WHEN msm.platform = 'linkedin' THEN msm.username END) AS linkedin_username,
    MAX(CASE WHEN msm.platform = 'linkedin' THEN msm.url END) AS linkedin
  FROM marketing_social_media msm
  GROUP BY msm.user_id
`;

function mapCompanyRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    name: row.name,
    description: row.description || null,
    videoUrl: row.video_url || null
  };
}

function mapBranchRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    companyName: row.company_name || null,
    name: row.name || null,
    code: branchCodeFromName(row.name || `branch-${row.id}`),
    address: row.address || null,
    adminCount: Number(row.admin_count || 0),
    marketingCount: Number(row.marketing_count || 0),
    ecardCount: Number(row.ecard_count || 0)
  };
}

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    name: row.name || null,
    username: row.username || null,
    email: row.email || null,
    nik: row.nik || null,
    role: row.role || null,
    isActive:
      row.is_active === null || row.is_active === undefined ? true : Boolean(row.is_active),
    companyId: row.company_id ? Number(row.company_id) : null,
    companyName: row.company_name || null,
    branchId: row.branch_id ? Number(row.branch_id) : null,
    branchName: row.branch_name || null,
    branchCode: branchCodeFromName(row.branch_name || row.branch_id),
    branchAddress: row.branch_address || null,
    licenseNumber: row.license_number || null,
    positionTitle: row.real_position || null,
    supervisorId: row.supervisor_user_id ? Number(row.supervisor_user_id) : null,
    supervisorName: row.supervisor_name || null,
    photo: row.photo_profile || null,
    ecardJobTitle: row.display_position || row.real_position || null,
    description: row.profile_description || null,
    phone: row.phone_number || null,
    instagramUsername: row.instagram_username || null,
    instagram: row.instagram || null,
    tiktokUsername: row.tiktok_username || null,
    tiktok: row.tiktok || null,
    twitterUsername: row.twitter_username || null,
    twitter: row.twitter || null,
    linkedinUsername: row.linkedin_username || null,
    linkedin: row.linkedin || null,
    certificateCount: Number(row.certificate_count || 0),
    ecardCount: Number(row.ecard_count || 0),
    passwordHash: row.password || null
  };
}

function mapCertificateEntry(row) {
  return {
    id: String(row.id),
    title: row.title,
    imagePath: row.image_url || null
  };
}

function mapEcardEntry(row, user) {
  const slug = row.slug;
  const publicUrl = buildPublicEcardUrl({
    ...user,
    slug
  });

  return {
    id: String(row.id),
    title: `E-Card ${user.name || slug}`,
    slug,
    publicUrl,
    qrCodeDataUrl: row.qr_code_url,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at
  };
}

function buildSocialMediaEntries(source) {
  return SOCIAL_MEDIA_PLATFORMS.map((platform) => {
    const url = source?.[platform] || null;
    const username =
      source?.[`${platform}Username`] ||
      source?.[`${platform}_username`] ||
      null;

    if (!url && !username) {
      return null;
    }

    return {
      id: platform,
      platform: SOCIAL_MEDIA_PLATFORM_LABELS[platform],
      label: SOCIAL_MEDIA_PLATFORM_LABELS[platform],
      username,
      url: url || "",
      value: username || url || ""
    };
  }).filter(Boolean);
}

export function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: Number(user.id),
    name: user.name || null,
    username: user.username || null,
    email: user.email || null,
    nik: user.nik || null,
    role: user.role || null,
    isActive:
      user.isActive === null || user.isActive === undefined
        ? Boolean(user.is_active ?? true)
        : Boolean(user.isActive),
    companyId: user.companyId ?? (user.company_id ? Number(user.company_id) : null),
    companyName: user.companyName || user.company_name || null,
    branchId: user.branchId ?? (user.branch_id ? Number(user.branch_id) : null),
    branchName: user.branchName || user.branch_name || null,
    branchCode: user.branchCode || branchCodeFromName(user.branch_name || user.branchName),
    branchAddress: user.branchAddress || user.branch_address || null,
    licenseNumber: user.licenseNumber || user.license_number || null,
    positionTitle: user.positionTitle || user.real_position || null,
    supervisorId:
      user.supervisorId ?? (user.supervisor_user_id ? Number(user.supervisor_user_id) : null),
    supervisorName: user.supervisorName || user.supervisor_name || null,
    photo: user.photo || user.photo_profile || null,
    ecardJobTitle: user.ecardJobTitle || user.display_position || null,
    description: user.description || user.profile_description || null,
    phone: user.phone || user.phone_number || null,
    instagramUsername: user.instagramUsername || user.instagram_username || null,
    instagram: user.instagram || null,
    tiktokUsername: user.tiktokUsername || user.tiktok_username || null,
    tiktok: user.tiktok || null,
    twitterUsername: user.twitterUsername || user.twitter_username || null,
    twitter: user.twitter || null,
    linkedinUsername: user.linkedinUsername || user.linkedin_username || null,
    linkedin: user.linkedin || null
  };
}

async function getUserRowByUniqueField(fieldName, value, excludeUserId = null) {
  const params = [value];
  const excludeClause = excludeUserId ? "AND id <> ?" : "";

  if (excludeUserId) {
    params.push(excludeUserId);
  }

  const rows = await query(
    `SELECT id
      FROM users
      WHERE ${fieldName} = ?
      ${excludeClause}
      LIMIT 1`,
    params
  );

  return rows[0] || null;
}

async function ensureUsernameAvailable(username, excludeUserId = null) {
  const existing = await getUserRowByUniqueField("username", username, excludeUserId);

  if (existing) {
    throw new Error("Username sudah dipakai.");
  }
}

async function ensureEmailAvailable(email, excludeUserId = null) {
  const existing = await getUserRowByUniqueField("email", email.toLowerCase(), excludeUserId);

  if (existing) {
    throw new Error("Email sudah terdaftar.");
  }
}

async function getUserBaseRowById(userId) {
  const rows = await query(
    `SELECT
      u.id,
      u.name,
      u.username,
      u.email,
      u.password,
      u.is_active,
      u.nik,
      u.license_number,
      u.real_position,
      u.company_id,
      c.name AS company_name,
      u.branch_id,
      b.name AS branch_name,
      b.address AS branch_address,
      u.role,
      up.photo_profile,
      up.display_position,
      up.description AS profile_description,
      up.phone_number,
      sm.instagram_username,
      sm.instagram,
      sm.tiktok_username,
      sm.tiktok,
      sm.twitter_username,
      sm.twitter,
      sm.linkedin_username,
      sm.linkedin,
      up.supervisor_user_id,
      COALESCE(supervisor.name, up.supervisor_name) AS supervisor_name
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN (${USER_SOCIAL_MEDIA_PIVOT_QUERY}) sm ON sm.user_id = u.id
    LEFT JOIN users supervisor ON supervisor.id = up.supervisor_user_id
    WHERE u.id = ?`,
    [userId]
  );

  return rows[0] || null;
}

async function getCompanyIdFromBranch(branchId) {
  const rows = await query("SELECT company_id FROM branches WHERE id = ?", [branchId]);
  return rows[0]?.company_id || null;
}

async function listCertificates(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.userId) {
    conditions.push("mc.user_id = ?");
    params.push(filters.userId);
  }

  if (filters.branchId) {
    conditions.push("u.branch_id = ?");
    params.push(filters.branchId);
  }

  if (filters.companyId) {
    conditions.push("u.company_id = ?");
    params.push(filters.companyId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query(
    `SELECT
      mc.id,
      mc.user_id,
      mc.title,
      mc.image_url,
      u.name AS user_name,
      u.company_id,
      c.name AS company_name,
      u.branch_id,
      b.name AS branch_name
    FROM marketing_certificates mc
    INNER JOIN users u ON u.id = mc.user_id
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    ${whereClause}
    ORDER BY mc.id DESC`,
    params
  );

  return rows.map((row) => ({
    id: String(row.id),
    userId: Number(row.user_id),
    userName: row.user_name,
    companyId: row.company_id ? Number(row.company_id) : null,
    companyName: row.company_name || null,
    branchId: row.branch_id ? Number(row.branch_id) : null,
    branchName: row.branch_name || null,
    title: row.title,
    imagePath: row.image_url || null
  }));
}

async function listEcards(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.userId) {
    conditions.push("e.user_id = ?");
    params.push(filters.userId);
  }

  if (filters.branchId) {
    conditions.push("u.branch_id = ?");
    params.push(filters.branchId);
  }

  if (filters.companyId) {
    conditions.push("u.company_id = ?");
    params.push(filters.companyId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query(
    `SELECT
      e.id,
      e.user_id,
      e.slug,
      e.qr_code_url,
      e.is_active,
      e.created_at,
      u.name AS user_name,
      u.company_id,
      c.name AS company_name,
      u.branch_id,
      b.name AS branch_name
    FROM ecards e
    INNER JOIN users u ON u.id = e.user_id
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    ${whereClause}
    ORDER BY e.id DESC`,
    params
  );

  return rows.map((row) => {
    const user = {
      name: row.user_name,
      companyName: row.company_name,
      branchName: row.branch_name,
      slug: row.slug
    };

    return {
      id: String(row.id),
      userId: Number(row.user_id),
      userName: row.user_name,
      companyId: row.company_id ? Number(row.company_id) : null,
      companyName: row.company_name || null,
      branchId: row.branch_id ? Number(row.branch_id) : null,
      branchName: row.branch_name || null,
      slug: row.slug,
      qrCodeDataUrl: row.qr_code_url || null,
      publicUrl: buildPublicEcardUrl(user),
      isActive: Boolean(row.is_active),
      createdAt: row.created_at
    };
  });
}

async function upsertUserProfile(userId, payload) {
  const rows = await query("SELECT id FROM user_profiles WHERE user_id = ? LIMIT 1", [userId]);

  if (rows.length === 0) {
    await query(
      `INSERT INTO user_profiles (
        user_id,
        photo_profile,
        display_position,
        description,
        phone_number,
        supervisor_user_id,
        supervisor_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        payload.photo || null,
        payload.ecardJobTitle || null,
        payload.description || null,
        payload.phone || null,
        payload.supervisorId || null,
        payload.supervisorName || null
      ]
    );
    return;
  }

  await query(
    `UPDATE user_profiles
      SET
        photo_profile = ?,
        display_position = ?,
        description = ?,
        phone_number = ?,
        supervisor_user_id = ?,
        supervisor_name = ?
      WHERE user_id = ?`,
    [
      payload.photo || null,
      payload.ecardJobTitle || null,
      payload.description || null,
      payload.phone || null,
      payload.supervisorId || null,
      payload.supervisorName || null,
      userId
    ]
  );
}

async function replaceUserSocialMedia(userId, payload) {
  await query("DELETE FROM marketing_social_media WHERE user_id = ?", [userId]);

  const entries = SOCIAL_MEDIA_PLATFORMS.map((platform) => ({
    platform,
    username: payload?.[`${platform}Username`]?.trim() || null,
    url: payload?.[`${platform}Url`]?.trim() || null
  })).filter((entry) => entry.username || entry.url);

  if (!entries.length) {
    return;
  }

  const placeholders = entries.map(() => "(?, ?, ?, ?)").join(", ");
  const params = entries.flatMap((entry) => [
    userId,
    entry.platform,
    entry.username,
    entry.url || ""
  ]);

  await query(
    `INSERT INTO marketing_social_media (user_id, platform, username, url) VALUES ${placeholders}`,
    params
  );
}

export async function listCompanies() {
  const rows = await query(
    "SELECT id, name, description, video_url FROM companies ORDER BY name ASC"
  );
  return rows.map(mapCompanyRow);
}

export async function listBranches(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.companyId) {
    conditions.push("b.company_id = ?");
    params.push(filters.companyId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query(
    `SELECT
      b.id,
      b.company_id,
      c.name AS company_name,
      b.name,
      b.address,
      (
        SELECT COUNT(*)
        FROM users u
        WHERE u.branch_id = b.id AND u.role = 'admin'
      ) AS admin_count,
      (
        SELECT COUNT(*)
        FROM users u
        WHERE u.branch_id = b.id AND u.role = 'marketing'
      ) AS marketing_count,
      (
        SELECT COUNT(*)
        FROM ecards e
        INNER JOIN users u ON u.id = e.user_id
        WHERE u.branch_id = b.id
      ) AS ecard_count
    FROM branches b
    INNER JOIN companies c ON c.id = b.company_id
    ${whereClause}
    ORDER BY c.name ASC, b.name ASC`,
    params
  );

  return rows.map(mapBranchRow);
}

export async function getBranchById(branchId) {
  const rows = await query(
    `SELECT
      b.id,
      b.company_id,
      c.name AS company_name,
      b.name,
      b.address,
      (
        SELECT COUNT(*)
        FROM users u
        WHERE u.branch_id = b.id AND u.role = 'admin'
      ) AS admin_count,
      (
        SELECT COUNT(*)
        FROM users u
        WHERE u.branch_id = b.id AND u.role = 'marketing'
      ) AS marketing_count,
      (
        SELECT COUNT(*)
        FROM ecards e
        INNER JOIN users u ON u.id = e.user_id
        WHERE u.branch_id = b.id
      ) AS ecard_count
    FROM branches b
    INNER JOIN companies c ON c.id = b.company_id
    WHERE b.id = ?`,
    [branchId]
  );

  return mapBranchRow(rows[0]);
}

export async function createBranch({ companyId, name, address }) {
  const rows = await query(
    "INSERT INTO branches (company_id, name, address) VALUES (?, ?, ?)",
    [companyId, name, address]
  );

  return getBranchById(rows.insertId);
}

export async function updateBranch(branchId, { companyId, name, address }) {
  await query(
    `UPDATE branches
      SET
        company_id = ?,
        name = ?,
        address = ?
      WHERE id = ?`,
    [companyId, name, address, branchId]
  );

  return getBranchById(branchId);
}

export async function deleteBranch(branchId) {
  const result = await query("DELETE FROM branches WHERE id = ?", [branchId]);
  return result.affectedRows > 0;
}

export async function getUserByEmail(email) {
  const rows = await query(
    `SELECT
      u.id,
      u.name,
      u.username,
      u.email,
      u.password,
      u.is_active,
      u.nik,
      u.license_number,
      u.real_position,
      u.company_id,
      c.name AS company_name,
      u.branch_id,
      b.name AS branch_name,
      b.address AS branch_address,
      u.role,
      up.photo_profile,
      up.display_position,
      up.description AS profile_description,
      up.phone_number,
      sm.instagram_username,
      sm.instagram,
      sm.tiktok_username,
      sm.tiktok,
      sm.twitter_username,
      sm.twitter,
      sm.linkedin_username,
      sm.linkedin,
      up.supervisor_user_id,
      COALESCE(supervisor.name, up.supervisor_name) AS supervisor_name
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN (${USER_SOCIAL_MEDIA_PIVOT_QUERY}) sm ON sm.user_id = u.id
    LEFT JOIN users supervisor ON supervisor.id = up.supervisor_user_id
    WHERE u.email = ?`,
    [email.toLowerCase()]
  );

  return mapUserRow(rows[0]);
}

export async function getUserById(id) {
  const row = await getUserBaseRowById(id);
  return mapUserRow(row);
}

export async function listUsers(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.role) {
    conditions.push("u.role = ?");
    params.push(filters.role);
  }

  if (filters.branchId) {
    conditions.push("u.branch_id = ?");
    params.push(filters.branchId);
  }

  if (filters.companyId) {
    conditions.push("u.company_id = ?");
    params.push(filters.companyId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query(
    `SELECT
      u.id,
      u.name,
      u.username,
      u.email,
      u.is_active,
      u.nik,
      u.license_number,
      u.real_position,
      u.company_id,
      c.name AS company_name,
      u.branch_id,
      b.name AS branch_name,
      b.address AS branch_address,
      u.role,
      up.photo_profile,
      up.display_position,
      up.description AS profile_description,
      up.phone_number,
      sm.instagram_username,
      sm.instagram,
      sm.tiktok_username,
      sm.tiktok,
      sm.twitter_username,
      sm.twitter,
      sm.linkedin_username,
      sm.linkedin,
      up.supervisor_user_id,
      COALESCE(supervisor.name, up.supervisor_name) AS supervisor_name
      ,
      (
        SELECT COUNT(*)
        FROM marketing_certificates mc
        WHERE mc.user_id = u.id
      ) AS certificate_count,
      (
        SELECT COUNT(*)
        FROM ecards e
        WHERE e.user_id = u.id
      ) AS ecard_count
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN (${USER_SOCIAL_MEDIA_PIVOT_QUERY}) sm ON sm.user_id = u.id
    LEFT JOIN users supervisor ON supervisor.id = up.supervisor_user_id
    ${whereClause}
    ORDER BY u.name ASC, u.id ASC`,
    params
  );

  return rows.map(mapUserRow).map(sanitizeUser);
}

export async function createUser({
  name,
  username,
  email,
  passwordHash,
  role = "marketing",
  isActive = true,
  nik = null,
  branchId = null,
  companyId = null,
  licenseNumber = null,
  positionTitle = null,
  supervisorId = null,
  supervisorName = null
}) {
  const normalizedUsername = username?.trim() || buildUsername(name, email);
  const normalizedEmail = email.toLowerCase().trim();
  const nextCompanyId = companyId || (branchId ? await getCompanyIdFromBranch(branchId) : null);

  await ensureUsernameAvailable(normalizedUsername);
  await ensureEmailAvailable(normalizedEmail);

  const result = await query(
    `INSERT INTO users (
      name,
      username,
      email,
      password,
      is_active,
      nik,
      license_number,
      real_position,
      company_id,
      branch_id,
      role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      normalizedUsername,
      normalizedEmail,
      passwordHash,
      isActive,
      nik || null,
      licenseNumber || null,
      positionTitle || null,
      nextCompanyId,
      branchId,
      role
    ]
  );

  await upsertUserProfile(result.insertId, {
    ecardJobTitle: positionTitle || null,
    supervisorId: supervisorId || null,
    supervisorName: supervisorName || null
  });

  return sanitizeUser(await getUserById(result.insertId));
}

export async function updateUser(userId, payload) {
  const currentUser = mapUserRow(await getUserBaseRowById(userId));

  if (!currentUser) {
    return null;
  }

  const normalizedUsername = payload.username?.trim() || currentUser.username;
  const normalizedEmail = payload.email?.trim().toLowerCase() || currentUser.email;
  const nextCompanyId =
    payload.companyId || (payload.branchId ? await getCompanyIdFromBranch(payload.branchId) : null);

  await ensureUsernameAvailable(normalizedUsername, userId);
  await ensureEmailAvailable(normalizedEmail, userId);

  if (payload.passwordHash) {
    await query(
      `UPDATE users
        SET
          name = ?,
          username = ?,
          email = ?,
          password = ?,
          is_active = ?,
          nik = ?,
          license_number = ?,
          real_position = ?,
          company_id = ?,
          branch_id = ?,
          role = ?
        WHERE id = ?`,
      [
        payload.name,
        normalizedUsername,
        normalizedEmail,
        payload.passwordHash,
        payload.isActive ?? currentUser.isActive ?? true,
        payload.nik || null,
        payload.licenseNumber || null,
        payload.positionTitle || null,
        nextCompanyId,
        payload.branchId || null,
        payload.role,
        userId
      ]
    );
  } else {
    await query(
      `UPDATE users
        SET
          name = ?,
          username = ?,
          email = ?,
          is_active = ?,
          nik = ?,
          license_number = ?,
          real_position = ?,
          company_id = ?,
          branch_id = ?,
          role = ?
        WHERE id = ?`,
      [
        payload.name,
        normalizedUsername,
        normalizedEmail,
        payload.isActive ?? currentUser.isActive ?? true,
        payload.nik || null,
        payload.licenseNumber || null,
        payload.positionTitle || null,
        nextCompanyId,
        payload.branchId || null,
        payload.role,
        userId
      ]
    );
  }

  await upsertUserProfile(userId, {
    photo: currentUser.photo,
    ecardJobTitle: payload.positionTitle || currentUser.ecardJobTitle || null,
    description: currentUser.description || null,
    phone: currentUser.phone || null,
    supervisorId: payload.supervisorId ?? null,
    supervisorName: payload.supervisorName?.trim() || null
  });

  return sanitizeUser(await getUserById(userId));
}

export async function deleteUser(userId) {
  const result = await query("DELETE FROM users WHERE id = ?", [userId]);
  return result.affectedRows > 0;
}

export async function verifyPassword(user, plainPassword) {
  return bcrypt.compare(plainPassword, user.passwordHash);
}

export async function getMarketingResources(userId) {
  const [userRow, certificateRows, ecardRows] = await Promise.all([
    getUserBaseRowById(userId),
    query("SELECT id, title, image_url FROM marketing_certificates WHERE user_id = ? ORDER BY id DESC", [
      userId
    ]),
    query("SELECT id, slug, qr_code_url, is_active, created_at FROM ecards WHERE user_id = ? ORDER BY id DESC", [
      userId
    ])
  ]);

  const user = mapUserRow(userRow);
  const profile = {
    fullName: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    nik: user?.nik || "",
    companyName: user?.companyName || "",
    branchName: user?.branchName || "",
    branchCode: user?.branchCode || "",
    licenseNumber: user?.licenseNumber || "",
    positionTitle: user?.positionTitle || "",
    photo: user?.photo || "",
    ecardJobTitle: user?.ecardJobTitle || "",
    description: user?.description || "",
    phone: user?.phone || "",
    instagramUsername: user?.instagramUsername || "",
    instagram: user?.instagram || "",
    tiktokUsername: user?.tiktokUsername || "",
    tiktok: user?.tiktok || "",
    twitterUsername: user?.twitterUsername || "",
    twitter: user?.twitter || "",
    linkedinUsername: user?.linkedinUsername || "",
    linkedin: user?.linkedin || "",
    supervisorName: user?.supervisorName || ""
  };

  const biodata = [
    { id: "fullName", label: "Nama", value: profile.fullName },
    { id: "username", label: "Username", value: profile.username },
    { id: "email", label: "Email", value: profile.email },
    { id: "nik", label: "NIK", value: profile.nik },
    { id: "companyName", label: "Perusahaan", value: profile.companyName },
    { id: "branchName", label: "Cabang", value: profile.branchName },
    { id: "positionTitle", label: "Jabatan Asli", value: profile.positionTitle },
    { id: "ecardJobTitle", label: "Jabatan E-Card", value: profile.ecardJobTitle },
    { id: "licenseNumber", label: "Nomor Izin", value: profile.licenseNumber },
    { id: "phone", label: "No. Telepon", value: profile.phone },
    { id: "supervisorName", label: "Atasan", value: profile.supervisorName },
    { id: "description", label: "Deskripsi", value: profile.description }
  ].filter((entry) => entry.value);

  const socialMedia = buildSocialMediaEntries(profile);

  return {
    profile,
    biodata,
    socialMedia,
    certificates: certificateRows.map(mapCertificateEntry),
    ecards: ecardRows.map((row) => mapEcardEntry(row, user))
  };
}

export async function updateUserProfile(userId, payload) {
  const currentUser = mapUserRow(await getUserBaseRowById(userId));
  const nextPhoto =
    payload.photo !== undefined ? payload.photo?.trim() || null : currentUser?.photo || null;

  await upsertUserProfile(userId, {
    photo: nextPhoto,
    ecardJobTitle: payload.ecardJobTitle?.trim() || null,
    description: payload.description?.trim() || null,
    phone: payload.phone?.trim() || null,
    supervisorId: currentUser?.supervisorId || null,
    supervisorName: currentUser?.supervisorName || null
  });

  if (currentUser?.photo && currentUser.photo !== nextPhoto) {
    await removeUploadedFile(currentUser.photo);
  }

  return sanitizeUser(await getUserById(userId));
}

export async function updateUserSocialMedia(userId, payload) {
  await replaceUserSocialMedia(userId, payload);
  return sanitizeUser(await getUserById(userId));
}

export async function addCertificateEntry(userId, payload) {
  const result = await query(
    "INSERT INTO marketing_certificates (user_id, title, image_url) VALUES (?, ?, ?)",
    [userId, payload.title, payload.imagePath || "https://example.com/certificates/default-certificate.png"]
  );

  return {
    id: String(result.insertId),
    title: payload.title,
    imagePath: payload.imagePath || "https://example.com/certificates/default-certificate.png"
  };
}

export async function updateCertificateEntry(userId, entryId, payload) {
  const currentRows = await query(
    "SELECT image_url FROM marketing_certificates WHERE id = ? AND user_id = ?",
    [entryId, userId]
  );

  if (currentRows.length === 0) {
    return null;
  }

  const nextImagePath =
    payload.imagePath !== undefined
      ? payload.imagePath || currentRows[0].image_url
      : currentRows[0].image_url;

  await query(
    `UPDATE marketing_certificates
      SET
        title = ?,
        image_url = ?
      WHERE id = ? AND user_id = ?`,
    [payload.title, nextImagePath, entryId, userId]
  );

  if (
    currentRows[0].image_url &&
    currentRows[0].image_url !== nextImagePath &&
    currentRows[0].image_url.startsWith("/uploads/")
  ) {
    await removeUploadedFile(currentRows[0].image_url);
  }

  return {
    id: String(entryId),
    title: payload.title,
    imagePath: nextImagePath
  };
}

export async function removeCertificateEntry(userId, entryId) {
  const rows = await query(
    "SELECT image_url FROM marketing_certificates WHERE id = ? AND user_id = ?",
    [entryId, userId]
  );
  const result = await query("DELETE FROM marketing_certificates WHERE id = ? AND user_id = ?", [
    entryId,
    userId
  ]);

  if (result.affectedRows > 0 && rows[0]?.image_url?.startsWith("/uploads/")) {
    await removeUploadedFile(rows[0].image_url);
  }

  return result.affectedRows > 0;
}

export async function createEcardEntry(userId, payload) {
  const existingRows = await query(
    "SELECT id, slug, qr_code_url, is_active, created_at FROM ecards WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    [userId]
  );

  if (existingRows.length > 0) {
    throw new Error("Setiap marketing hanya boleh memiliki 1 QR e-card.");
  }

  const user = mapUserRow(await getUserBaseRowById(userId));
  const incompleteFields = getIncompleteEcardFields(user);

  if (incompleteFields.length > 0) {
    throw new Error(
      `QR e-card belum bisa dibuat. Lengkapi data berikut terlebih dahulu: ${incompleteFields.join(", ")}.`
    );
  }

  const slug = await resolveAvailableEcardSlug(user);
  const publicUrl = buildPublicEcardUrl({
    ...user,
    slug
  });
  const qrCodeDataUrl = await QRCode.toDataURL(publicUrl, {
    margin: 1,
    width: 240
  });

  const result = await query(
    "INSERT INTO ecards (user_id, slug, qr_code_url, is_active) VALUES (?, ?, ?, ?)",
    [userId, slug, qrCodeDataUrl, true]
  );

  return {
    id: String(result.insertId),
    title: `E-Card ${user?.name || slug}`,
    slug,
    publicUrl,
    qrCodeDataUrl,
    isActive: true,
    createdAt: new Date().toISOString()
  };
}

export async function updateEcardEntry(userId, entryId, payload) {
  const currentRows = await query("SELECT id FROM ecards WHERE id = ? AND user_id = ? LIMIT 1", [
    entryId,
    userId
  ]);

  if (currentRows.length === 0) {
    return null;
  }

  const user = mapUserRow(await getUserBaseRowById(userId));
  const incompleteFields = getIncompleteEcardFields(user);

  if (incompleteFields.length > 0) {
    throw new Error(
      `QR e-card belum bisa diperbarui. Lengkapi data berikut terlebih dahulu: ${incompleteFields.join(", ")}.`
    );
  }

  const slug = await resolveAvailableEcardSlug(user, entryId);
  const publicUrl = buildPublicEcardUrl({
    ...user,
    slug
  });
  const qrCodeDataUrl = await QRCode.toDataURL(publicUrl, {
    margin: 1,
    width: 240
  });

  await query(
    `UPDATE ecards
      SET
        slug = ?,
        qr_code_url = ?,
        is_active = ?
      WHERE id = ? AND user_id = ?`,
    [slug, qrCodeDataUrl, payload.isActive ?? true, entryId, userId]
  );

  return {
    id: String(entryId),
    title: `E-Card ${user?.name || slug}`,
    slug,
    publicUrl,
    qrCodeDataUrl,
    isActive: payload.isActive ?? true,
    createdAt: new Date().toISOString()
  };
}

export async function removeEcardEntry(userId, entryId) {
  const result = await query("DELETE FROM ecards WHERE id = ? AND user_id = ?", [entryId, userId]);
  return result.affectedRows > 0;
}

export async function getPublicEcardByRoute({ ecardSlug, slug }) {
  const normalizedSlug = slugify(ecardSlug || slug);

  if (!normalizedSlug) {
    return null;
  }

  const rows = await query(
    `SELECT
      e.id,
      e.slug,
      e.is_active,
      e.created_at,
      u.id AS user_id,
      u.name AS user_name,
      u.email,
      u.is_active AS user_is_active,
      u.nik,
      u.license_number,
      u.real_position,
      c.id AS company_id,
      c.name AS company_name,
      c.description AS company_description,
      c.video_url AS company_video_url,
      b.name AS branch_name,
      b.address AS branch_address,
      up.photo_profile,
      up.display_position,
      up.description AS profile_description,
      up.phone_number,
      sm.instagram_username,
      sm.instagram,
      sm.tiktok_username,
      sm.tiktok,
      sm.twitter_username,
      sm.twitter,
      sm.linkedin_username,
      sm.linkedin,
      COALESCE(supervisor.name, up.supervisor_name) AS supervisor_name
    FROM ecards e
    INNER JOIN users u ON u.id = e.user_id
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN (${USER_SOCIAL_MEDIA_PIVOT_QUERY}) sm ON sm.user_id = u.id
    LEFT JOIN users supervisor ON supervisor.id = up.supervisor_user_id
    WHERE e.slug = ?
      AND e.is_active = TRUE
      AND u.is_active = TRUE
    LIMIT 1`,
    [normalizedSlug]
  );
  const row = rows[0];

  if (!row) {
    return null;
  }

  const certificateRows = await query(
    `SELECT id, title, image_url
      FROM marketing_certificates
      WHERE user_id = ?
      ORDER BY id DESC`,
    [row.user_id]
  );

  const profile = {
    name: row.user_name || "",
    email: row.email || "",
    nik: row.nik || "",
    photo: row.photo_profile || "",
    ecardJobTitle: row.display_position || row.real_position || "",
    positionTitle: row.real_position || "",
    description: row.profile_description || "",
    phone: row.phone_number || "",
    licenseNumber: row.license_number || "",
    supervisorName: row.supervisor_name || ""
  };

  return {
    id: String(row.id),
    slug: row.slug,
    publicUrl: buildPublicEcardUrl({
      companyName: row.company_name,
      branchName: row.branch_name,
      slug: row.slug
    }),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    company: {
      id: row.company_id ? Number(row.company_id) : null,
      name: row.company_name || "",
      description: row.company_description || "",
      videoUrl: row.company_video_url || ""
    },
    branch: {
      name: row.branch_name || "",
      code: branchCodeFromName(row.branch_name || ""),
      address: row.branch_address || ""
    },
    profile,
    socialMedia: [
      profile.phone ? { id: "phone", label: "Telepon", url: `tel:${profile.phone}`, value: profile.phone } : null,
      profile.email ? { id: "email", label: "Email", url: `mailto:${profile.email}`, value: profile.email } : null,
      ...buildSocialMediaEntries(row)
    ].filter(Boolean),
    certificates: certificateRows.map(mapCertificateEntry)
  };
}

export async function getDashboardData(actor) {
  if (actor.role === "superadmin") {
    const [companies, branches, admins, marketingTeam, certificates, ecards, statsRows] = await Promise.all([
      listCompanies(),
      listBranches(),
      listUsers({ role: "admin" }),
      listUsers({ role: "marketing" }),
      listCertificates(),
      listEcards(),
      query(
        `SELECT
          (SELECT COUNT(*) FROM companies) AS total_companies,
          (SELECT COUNT(*) FROM branches) AS total_branches,
          (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
          (SELECT COUNT(*) FROM users WHERE role = 'marketing') AS total_marketing,
          (SELECT COUNT(*) FROM user_profiles) AS total_profiles,
          (SELECT COUNT(*) FROM marketing_certificates) AS total_certificates,
          (SELECT COUNT(*) FROM ecards) AS total_ecards`
      )
    ]);

    return {
      role: actor.role,
      companies,
      branches,
      admins,
      marketingTeam,
      certificates,
      ecards,
      stats: {
        totalCompanies: Number(statsRows[0].total_companies || 0),
        totalBranches: Number(statsRows[0].total_branches || 0),
        totalAdmins: Number(statsRows[0].total_admins || 0),
        totalMarketing: Number(statsRows[0].total_marketing || 0),
        totalProfiles: Number(statsRows[0].total_profiles || 0),
        totalCertificates: Number(statsRows[0].total_certificates || 0),
        totalEcards: Number(statsRows[0].total_ecards || 0)
      }
    };
  }

  if (actor.role === "admin") {
    const [branch, marketingTeam, certificates, ecards, statsRows] = await Promise.all([
      getBranchById(actor.branchId),
      listUsers({ role: "marketing", companyId: actor.companyId, branchId: actor.branchId }),
      listCertificates({ companyId: actor.companyId, branchId: actor.branchId }),
      listEcards({ companyId: actor.companyId, branchId: actor.branchId }),
      query(
        `SELECT
          (SELECT COUNT(*) FROM users WHERE role = 'marketing' AND company_id = ? AND branch_id = ?) AS total_marketing,
          (
            SELECT COUNT(*)
            FROM marketing_certificates c
            INNER JOIN users u ON u.id = c.user_id
            WHERE u.role = 'marketing' AND u.company_id = ? AND u.branch_id = ?
          ) AS total_certificates,
          (
            SELECT COUNT(*)
            FROM ecards e
            INNER JOIN users u ON u.id = e.user_id
            WHERE u.role = 'marketing' AND u.company_id = ? AND u.branch_id = ?
          ) AS total_ecards`,
        [actor.companyId, actor.branchId, actor.companyId, actor.branchId, actor.companyId, actor.branchId]
      )
    ]);

    return {
      role: actor.role,
      branch,
      marketingTeam,
      certificates,
      ecards,
      stats: {
        totalMarketing: Number(statsRows[0].total_marketing || 0),
        totalCertificates: Number(statsRows[0].total_certificates || 0),
        totalEcards: Number(statsRows[0].total_ecards || 0)
      }
    };
  }

  const resources = await getMarketingResources(actor.id);

  return {
    role: actor.role,
    resources,
    stats: {
      biodataCount: resources.biodata.length,
      socialMediaCount: resources.socialMedia.length,
      certificateCount: resources.certificates.length,
      ecardCount: resources.ecards.length
    }
  };
}
