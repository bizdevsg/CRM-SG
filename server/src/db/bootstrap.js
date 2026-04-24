import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { buildPublicEcardUrl } from "../data/userStore.js";
import { getMysqlConfig, query } from "./mysql.js";

const BCRYPT_SALT_ROUNDS = 12;

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function branchCodeFromName(value) {
  return String(value || "")
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

const companySeedData = [
  {
    name: "PT. Solid Gold Berjangka",
    description: "Perusahaan pialang berjangka untuk kebutuhan platform E-Card marketing.",
    videoUrl: "https://example.com/videos/solid-gold-berjangka"
  },
  {
    name: "PT. Riffan Financindo Berjangka",
    description: "Profil perusahaan Riffan Financindo Berjangka untuk katalog E-Card internal.",
    videoUrl: "https://example.com/videos/riffan-financindo-berjangka"
  },
  {
    name: "PT. Kontak Perkasa Futures",
    description: "Data master perusahaan Kontak Perkasa Futures untuk kebutuhan cabang dan marketing.",
    videoUrl: "https://example.com/videos/kontak-perkasa-futures"
  },
  {
    name: "PT. Bestprofit Futures",
    description: "Informasi perusahaan Bestprofit Futures yang ditampilkan pada resource E-Card.",
    videoUrl: "https://example.com/videos/bestprofit-futures"
  },
  {
    name: "PT. Equityworld Futures",
    description: "Informasi perusahaan Equityworld Futures untuk mendukung profil marketing dan e-card.",
    videoUrl: "https://example.com/videos/equityworld-futures"
  }
];

async function createDatabaseIfNotExists() {
  const config = getMysqlConfig();
  const mysql = await import("mysql2/promise");
  const connection = await mysql.default.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }
}

async function tableExists(tableName) {
  const config = getMysqlConfig();
  const rows = await query(
    `SELECT 1
      FROM information_schema.tables
      WHERE table_schema = ?
        AND table_name = ?
      LIMIT 1`,
    [config.database, tableName]
  );
  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  if (!(await tableExists(tableName))) {
    return false;
  }

  const config = getMysqlConfig();
  const rows = await query(
    `SELECT 1
      FROM information_schema.columns
      WHERE table_schema = ?
        AND table_name = ?
        AND column_name = ?
      LIMIT 1`,
    [config.database, tableName, columnName]
  );
  return rows.length > 0;
}

async function ensureColumn(tableName, columnName, definition) {
  if (!(await columnExists(tableName, columnName))) {
    await query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function uniqueIndexExists(tableName, indexName) {
  if (!(await tableExists(tableName))) {
    return false;
  }

  const config = getMysqlConfig();
  const rows = await query(
    `SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = ?
        AND table_name = ?
        AND index_name = ?
        AND non_unique = 0
      LIMIT 1`,
    [config.database, tableName, indexName]
  );

  return rows.length > 0;
}

async function ensureUniqueIndex(tableName, indexName, columnList) {
  if (!(await uniqueIndexExists(tableName, indexName))) {
    await query(`ALTER TABLE ${tableName} ADD CONSTRAINT ${indexName} UNIQUE (${columnList})`);
  }
}

async function createTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS companies (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NULL,
      video_url TEXT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS branches (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      company_id BIGINT UNSIGNED NOT NULL,
      name TEXT NULL,
      address TEXT NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(150) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      nik VARCHAR(50) NULL UNIQUE,
      license_number TEXT NULL,
      real_position TEXT NULL,
      company_id BIGINT UNSIGNED NULL,
      branch_id BIGINT UNSIGNED NULL,
      role ENUM('superadmin', 'admin', 'marketing') DEFAULT 'marketing',
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL UNIQUE,
      photo_profile TEXT NULL,
      display_position TEXT NULL,
      description TEXT NULL,
      phone_number VARCHAR(50) NULL,
      instagram TEXT NULL,
      tiktok TEXT NULL,
      twitter TEXT NULL,
      linkedin TEXT NULL,
      supervisor_user_id BIGINT UNSIGNED NULL,
      supervisor_name TEXT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (supervisor_user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS marketing_certificates (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS ecards (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      slug VARCHAR(150) NOT NULL UNIQUE,
      qr_code_url TEXT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

async function ensureColumns() {
  await ensureColumn("companies", "description", "TEXT NULL AFTER name");
  await ensureColumn("companies", "video_url", "TEXT NULL AFTER description");

  await ensureColumn("branches", "address", "TEXT NULL AFTER name");

  await ensureColumn("users", "name", "TEXT NULL AFTER id");
  await ensureColumn("users", "password", "TEXT NULL AFTER email");
  await ensureColumn("users", "nik", "VARCHAR(50) NULL UNIQUE AFTER password");
  await ensureColumn("users", "license_number", "TEXT NULL AFTER nik");
  await ensureColumn("users", "real_position", "TEXT NULL AFTER license_number");
  await ensureColumn(
    "users",
    "role",
    "ENUM('superadmin', 'admin', 'marketing') DEFAULT 'marketing' AFTER branch_id"
  );

  await ensureColumn("user_profiles", "photo_profile", "TEXT NULL AFTER user_id");
  await ensureColumn("user_profiles", "display_position", "TEXT NULL AFTER photo_profile");
  await ensureColumn("user_profiles", "description", "TEXT NULL AFTER display_position");
  await ensureColumn("user_profiles", "phone_number", "VARCHAR(50) NULL AFTER description");
  await ensureColumn("user_profiles", "instagram", "TEXT NULL AFTER phone_number");
  await ensureColumn("user_profiles", "tiktok", "TEXT NULL AFTER instagram");
  await ensureColumn("user_profiles", "twitter", "TEXT NULL AFTER tiktok");
  await ensureColumn("user_profiles", "linkedin", "TEXT NULL AFTER twitter");
  await ensureColumn("user_profiles", "supervisor_user_id", "BIGINT UNSIGNED NULL AFTER linkedin");
  await ensureColumn("user_profiles", "supervisor_name", "TEXT NULL AFTER supervisor_user_id");

  if (await tableExists("marketing_supervisors")) {
    await ensureColumn("marketing_supervisors", "marketing_id", "BIGINT UNSIGNED NULL AFTER id");
    await ensureColumn(
      "marketing_supervisors",
      "supervisor_id",
      "BIGINT UNSIGNED NULL AFTER marketing_id"
    );
  }

  await ensureColumn("marketing_certificates", "image_url", "TEXT NULL AFTER title");
  await ensureColumn("ecards", "qr_code_url", "TEXT NULL AFTER slug");
  await ensureColumn("ecards", "is_active", "BOOLEAN DEFAULT TRUE AFTER qr_code_url");
}

async function migrateUsersToNewColumns() {
  if (await columnExists("users", "full_name")) {
    await query(
      "UPDATE users SET name = COALESCE(NULLIF(name, ''), full_name) WHERE full_name IS NOT NULL"
    );
  }

  if (await columnExists("users", "password_hash")) {
    await query(
      "UPDATE users SET password = COALESCE(NULLIF(password, ''), password_hash) WHERE password_hash IS NOT NULL"
    );
  }

  if (await columnExists("users", "position_title")) {
    await query(
      "UPDATE users SET real_position = COALESCE(NULLIF(real_position, ''), position_title) WHERE position_title IS NOT NULL"
    );
  }

  if (await columnExists("users", "job_title")) {
    await query(
      "UPDATE users SET real_position = COALESCE(NULLIF(real_position, ''), job_title) WHERE job_title IS NOT NULL"
    );
  }

  if ((await columnExists("users", "role_id")) && (await tableExists("roles"))) {
    await query(
      `UPDATE users u
        INNER JOIN roles r ON r.id = u.role_id
        SET u.role = r.name
        WHERE u.role_id IS NOT NULL`
    );
  }

  await query("UPDATE users SET role = COALESCE(role, 'marketing')");
  await query(
    `UPDATE users u
      INNER JOIN branches b ON b.id = u.branch_id
      SET u.company_id = COALESCE(u.company_id, b.company_id)
      WHERE u.branch_id IS NOT NULL`
  );
}

async function migrateUserProfilesToNewColumns() {
  if (await columnExists("user_profiles", "photo")) {
    await query(
      "UPDATE user_profiles SET photo_profile = COALESCE(NULLIF(photo_profile, ''), photo) WHERE photo IS NOT NULL"
    );
  }

  if (await columnExists("user_profiles", "bio")) {
    await query(
      "UPDATE user_profiles SET description = COALESCE(NULLIF(description, ''), bio) WHERE bio IS NOT NULL"
    );
  }

  if (await columnExists("user_profiles", "ecard_job_title")) {
    await query(
      "UPDATE user_profiles SET display_position = COALESCE(NULLIF(display_position, ''), ecard_job_title) WHERE ecard_job_title IS NOT NULL"
    );
  }

  if (await columnExists("user_profiles", "instagram_url")) {
    await query(
      "UPDATE user_profiles SET instagram = COALESCE(NULLIF(instagram, ''), instagram_url) WHERE instagram_url IS NOT NULL"
    );
  }

  if (await columnExists("user_profiles", "tiktok_url")) {
    await query(
      "UPDATE user_profiles SET tiktok = COALESCE(NULLIF(tiktok, ''), tiktok_url) WHERE tiktok_url IS NOT NULL"
    );
  }

  if (await columnExists("user_profiles", "twitter_url")) {
    await query(
      "UPDATE user_profiles SET twitter = COALESCE(NULLIF(twitter, ''), twitter_url) WHERE twitter_url IS NOT NULL"
    );
  }

  if (await columnExists("user_profiles", "linkedin_url")) {
    await query(
      "UPDATE user_profiles SET linkedin = COALESCE(NULLIF(linkedin, ''), linkedin_url) WHERE linkedin_url IS NOT NULL"
    );
  }

  await query(
    `INSERT INTO user_profiles (
      user_id,
      photo_profile,
      display_position,
      description,
      phone_number,
      instagram,
      tiktok,
      twitter,
      linkedin,
      supervisor_user_id,
      supervisor_name
    )
    SELECT
      u.id,
      NULL,
      u.real_position,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE up.user_id IS NULL`
  );
}

async function migrateSupervisorsToNewColumns() {
  if (await columnExists("users", "manager_id")) {
    await query(
      `UPDATE user_profiles up
      INNER JOIN users u ON u.id = up.user_id
      INNER JOIN users manager ON manager.id = u.manager_id
      SET
        up.supervisor_user_id = COALESCE(up.supervisor_user_id, manager.id),
        up.supervisor_name = COALESCE(NULLIF(up.supervisor_name, ''), manager.name)
      WHERE u.manager_id IS NOT NULL`
    );
  }

  if (!(await tableExists("marketing_supervisors"))) {
    return;
  }

  if (await columnExists("marketing_supervisors", "marketing_user_id")) {
    await query(
      "UPDATE marketing_supervisors SET marketing_id = COALESCE(marketing_id, marketing_user_id) WHERE marketing_user_id IS NOT NULL"
    );
  }

  if (await columnExists("marketing_supervisors", "supervisor_user_id")) {
    await query(
      "UPDATE marketing_supervisors SET supervisor_id = COALESCE(supervisor_id, supervisor_user_id) WHERE supervisor_user_id IS NOT NULL"
    );
  }

  await query(
    `UPDATE user_profiles up
    INNER JOIN marketing_supervisors ms ON ms.marketing_id = up.user_id
    INNER JOIN users supervisor ON supervisor.id = ms.supervisor_id
    SET
      up.supervisor_user_id = COALESCE(up.supervisor_user_id, supervisor.id),
      up.supervisor_name = COALESCE(NULLIF(up.supervisor_name, ''), supervisor.name)
    WHERE ms.supervisor_id IS NOT NULL`
  );

  await query(
    `UPDATE user_profiles up
    INNER JOIN users u ON u.id = up.user_id
    INNER JOIN users supervisor
      ON supervisor.name = up.supervisor_name
     AND supervisor.company_id <=> u.company_id
     AND supervisor.branch_id <=> u.branch_id
    SET up.supervisor_user_id = COALESCE(up.supervisor_user_id, supervisor.id)
    WHERE up.supervisor_name IS NOT NULL
      AND up.supervisor_name <> ''`
  );
}

async function migrateLegacyCertificates() {
  if (!(await tableExists("user_certificates"))) {
    return;
  }

  const hasImagePath = await columnExists("user_certificates", "image_path");
  const hasIssuer = await columnExists("user_certificates", "issuer");
  const hasYear = await columnExists("user_certificates", "year");
  const titleExpression = hasIssuer || hasYear
    ? "TRIM(CONCAT(title, CASE WHEN issuer IS NOT NULL AND issuer <> '' THEN CONCAT(' - ', issuer) ELSE '' END, CASE WHEN year IS NOT NULL AND year <> '' THEN CONCAT(' (', year, ')') ELSE '' END))"
    : "title";
  const imageExpression = hasImagePath
    ? "COALESCE(NULLIF(image_path, ''), 'https://example.com/certificates/default-certificate.png')"
    : "'https://example.com/certificates/default-certificate.png'";

  await query(
    `INSERT INTO marketing_certificates (user_id, title, image_url)
      SELECT uc.user_id, ${titleExpression}, ${imageExpression}
      FROM user_certificates uc
      LEFT JOIN marketing_certificates mc
        ON mc.user_id = uc.user_id
       AND mc.title = ${titleExpression}
      WHERE mc.id IS NULL`
  );
}

async function migrateLegacyEcards() {
  if (!(await tableExists("user_ecards"))) {
    return;
  }

  const hasQrCode = await columnExists("user_ecards", "qr_code_data_url");

  await query(
    `INSERT INTO ecards (user_id, slug, qr_code_url, is_active)
      SELECT ue.user_id, ue.slug, ${
        hasQrCode ? "ue.qr_code_data_url" : "NULL"
      }, TRUE
      FROM user_ecards ue
      LEFT JOIN ecards e ON e.slug = ue.slug
      WHERE e.id IS NULL`
  );
}

async function deduplicateEcardsPerUser() {
  if (!(await tableExists("ecards"))) {
    return;
  }

  await query(
    `DELETE e1
    FROM ecards e1
    INNER JOIN ecards e2
      ON e1.user_id = e2.user_id
     AND e1.id < e2.id`
  );
}

async function migrateExistingData() {
  if (await columnExists("branches", "city")) {
    await query(
      "UPDATE branches SET address = COALESCE(NULLIF(address, ''), city, name, '-') WHERE address IS NULL OR address = ''"
    );
  } else {
    await query(
      "UPDATE branches SET address = COALESCE(NULLIF(address, ''), name, '-') WHERE address IS NULL OR address = ''"
    );
  }

  await migrateUsersToNewColumns();
  await migrateUserProfilesToNewColumns();
  await migrateSupervisorsToNewColumns();
  await migrateLegacyCertificates();
  await migrateLegacyEcards();
  await deduplicateEcardsPerUser();
}

async function seedBaseData() {
  for (const company of companySeedData) {
    const existingRows = await query("SELECT id FROM companies WHERE name = ? LIMIT 1", [company.name]);

    if (existingRows.length === 0) {
      await query("INSERT INTO companies (name, description, video_url) VALUES (?, ?, ?)", [
        company.name,
        company.description,
        company.videoUrl
      ]);
      continue;
    }

    await query(
      `UPDATE companies
        SET
          description = COALESCE(NULLIF(description, ''), ?),
          video_url = COALESCE(NULLIF(video_url, ''), ?)
        WHERE id = ?`,
      [company.description, company.videoUrl, existingRows[0].id]
    );
  }
}

async function seedDemoData() {
  const userCountRows = await query("SELECT COUNT(*) AS total FROM users");

  if (Number(userCountRows[0].total) > 0) {
    return;
  }

  const companies = await query("SELECT id, name FROM companies ORDER BY id ASC");
  const companyMap = Object.fromEntries(companies.map((company) => [company.name, company]));
  const passwordHash = await bcrypt.hash(
    process.env.DEMO_USER_PASSWORD || "password123",
    BCRYPT_SALT_ROUNDS
  );

  const branchSpecs = [
    {
      companyName: "PT. Solid Gold Berjangka",
      name: "Cabang Jakarta Sudirman",
      address: "Sudirman Central Business District, Jakarta Selatan"
    },
    {
      companyName: "PT. Riffan Financindo Berjangka",
      name: "Cabang Bandung Dago",
      address: "Jl. Ir. H. Juanda, Dago, Bandung"
    },
    {
      companyName: "PT. Kontak Perkasa Futures",
      name: "Cabang Surabaya Tunjungan",
      address: "Jl. Tunjungan, Surabaya"
    },
    {
      companyName: "PT. Bestprofit Futures",
      name: "Cabang Semarang Simpang Lima",
      address: "Kawasan Simpang Lima, Semarang"
    },
    {
      companyName: "PT. Equityworld Futures",
      name: "Cabang Medan Ringroad",
      address: "Jl. Ringroad, Medan"
    }
  ];

  const branchMap = {};

  for (const spec of branchSpecs) {
    const company = companyMap[spec.companyName];
    const result = await query(
      "INSERT INTO branches (company_id, name, address) VALUES (?, ?, ?)",
      [company.id, spec.name, spec.address]
    );

    branchMap[spec.companyName] = {
      id: result.insertId,
      companyId: company.id,
      branchName: spec.name
    };
  }

  const superadminInsert = await query(
    `INSERT INTO users (
      name,
      username,
      email,
      password,
      nik,
      license_number,
      real_position,
      company_id,
      branch_id,
      role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "Superadmin E-Card",
      "superadmin",
      "superadmin@example.com",
      passwordHash,
      "3174000000000001",
      null,
      "Platform Owner",
      null,
      null,
      "superadmin"
    ]
  );
  const superadminId = superadminInsert.insertId;

  const solidBranch = branchMap["PT. Solid Gold Berjangka"];
  const riffanBranch = branchMap["PT. Riffan Financindo Berjangka"];

  const jakartaAdminInsert = await query(
    `INSERT INTO users (
      name,
      username,
      email,
      password,
      nik,
      license_number,
      real_position,
      company_id,
      branch_id,
      role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "Admin Jakarta Solid Gold",
      "admin.jakarta",
      "admin.jakarta@example.com",
      passwordHash,
      "3174000000000002",
      "ADM-SGB-JKT-01",
      "Admin Cabang",
      solidBranch.companyId,
      solidBranch.id,
      "admin"
    ]
  );
  const jakartaAdminId = jakartaAdminInsert.insertId;

  const bandungAdminInsert = await query(
    `INSERT INTO users (
      name,
      username,
      email,
      password,
      nik,
      license_number,
      real_position,
      company_id,
      branch_id,
      role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "Admin Bandung Riffan",
      "admin.bandung",
      "admin.bandung@example.com",
      passwordHash,
      "3273000000000003",
      "ADM-RFB-BDG-01",
      "Admin Cabang",
      riffanBranch.companyId,
      riffanBranch.id,
      "admin"
    ]
  );
  const bandungAdminId = bandungAdminInsert.insertId;

  const rinaInsert = await query(
    `INSERT INTO users (
      name,
      username,
      email,
      password,
      nik,
      license_number,
      real_position,
      company_id,
      branch_id,
      role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "Rina Maharani",
      "marketing.rina",
      "marketing.rina@example.com",
      passwordHash,
      "3174000000000004",
      "MK-SGB-JKT-01",
      "Senior Marketing",
      solidBranch.companyId,
      solidBranch.id,
      "marketing"
    ]
  );
  const rinaId = rinaInsert.insertId;

  const budiInsert = await query(
    `INSERT INTO users (
      name,
      username,
      email,
      password,
      nik,
      license_number,
      real_position,
      company_id,
      branch_id,
      role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "Budi Santoso",
      "marketing.budi",
      "marketing.budi@example.com",
      passwordHash,
      "3273000000000005",
      "MK-RFB-BDG-01",
      "Marketing",
      riffanBranch.companyId,
      riffanBranch.id,
      "marketing"
    ]
  );
  const budiId = budiInsert.insertId;

  await query(
    `INSERT INTO user_profiles (
      user_id,
      photo_profile,
      display_position,
      description,
      phone_number,
      instagram,
      tiktok,
      twitter,
      linkedin,
      supervisor_user_id,
      supervisor_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      rinaId,
      null,
      "Senior Marketing Consultant",
      "Spesialis relasi nasabah untuk segmen premium dan edukasi market.",
      "081200000004",
      "https://instagram.com/rina.marketing",
      "https://tiktok.com/@rina.marketing",
      "https://x.com/rina_marketing",
      "https://linkedin.com/in/rina-marketing",
      jakartaAdminId,
      "Admin Jakarta Solid Gold",
      budiId,
      null,
      "Marketing Consultant",
      "Fokus pada edukasi calon nasabah dan follow up prospek cabang Bandung.",
      "081200000005",
      "https://instagram.com/budi.marketing",
      null,
      null,
      "https://linkedin.com/in/budi-marketing",
      bandungAdminId,
      "Admin Bandung Riffan"
    ]
  );

  await query(
    `INSERT INTO marketing_certificates (user_id, title, image_url)
      VALUES (?, ?, ?), (?, ?, ?)`,
    [
      rinaId,
      "Sertifikat Wakil Pialang Berjangka",
      "https://example.com/certificates/rina.jpg",
      budiId,
      "Sertifikat Edukasi Produk Berjangka",
      "https://example.com/certificates/budi.jpg"
    ]
  );

  const rinaSlug = slugify("rina-maharani");
  const budiSlug = slugify("budi-santoso");
  const rinaPublicUrl = buildPublicEcardUrl({
    companyName: "PT. Solid Gold Berjangka",
    branchName: solidBranch.branchName,
    slug: rinaSlug
  });
  const budiPublicUrl = buildPublicEcardUrl({
    companyName: "PT. Riffan Financindo Berjangka",
    branchName: riffanBranch.branchName,
    slug: budiSlug
  });
  const rinaQr = await QRCode.toDataURL(rinaPublicUrl, { margin: 1, width: 240 });
  const budiQr = await QRCode.toDataURL(budiPublicUrl, { margin: 1, width: 240 });

  await query(
    `INSERT INTO ecards (user_id, slug, qr_code_url, is_active)
      VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
    [rinaId, rinaSlug, rinaQr, true, budiId, budiSlug, budiQr, true]
  );
}

async function refreshExistingEcardQrCodes() {
  const rows = await query(
    `SELECT
      e.id,
      e.slug,
      c.name AS company_name,
      b.name AS branch_name
    FROM ecards e
    INNER JOIN users u ON u.id = e.user_id
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id`
  );

  for (const row of rows) {
    const publicUrl = buildPublicEcardUrl({
      companyName: row.company_name,
      branchName: row.branch_name,
      slug: row.slug
    });
    const qrCodeDataUrl = await QRCode.toDataURL(publicUrl, {
      margin: 1,
      width: 240
    });

    await query("UPDATE ecards SET qr_code_url = ? WHERE id = ?", [qrCodeDataUrl, row.id]);
  }
}

export async function initializeDatabase() {
  await createDatabaseIfNotExists();
  await createTables();
  await ensureColumns();
  await migrateExistingData();
  await ensureUniqueIndex("ecards", "uq_ecards_user_id", "user_id");
  await seedBaseData();
  await seedDemoData();
  await refreshExistingEcardQrCodes();
}
