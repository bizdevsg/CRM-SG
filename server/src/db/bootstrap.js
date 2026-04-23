import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import QRCode from "qrcode";
import { getMysqlConfig, query } from "./mysql.js";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function branchCodeFromCity(city) {
  return city
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createSlugBase(name, fallback) {
  return slugify(name || fallback || crypto.randomUUID());
}

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

async function createTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS companies (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      logo VARCHAR(255) NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS branches (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      company_id BIGINT NOT NULL,
      name VARCHAR(150) NULL,
      city VARCHAR(100) NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_branches_company
        FOREIGN KEY (company_id) REFERENCES companies(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS roles (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE,
      slug VARCHAR(100) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(150) NULL,
      nickname VARCHAR(100) NULL,
      photo VARCHAR(255) NULL,
      job_title VARCHAR(100) NULL,
      license_number VARCHAR(100) NULL,
      description TEXT NULL,
      phone VARCHAR(30) NULL,
      email VARCHAR(150) UNIQUE,
      tiktok VARCHAR(255) NULL,
      instagram VARCHAR(255) NULL,
      linkedin VARCHAR(255) NULL,
      whatsapp VARCHAR(30) NULL,
      company_id BIGINT NULL,
      branch_id BIGINT NULL,
      role_id BIGINT NULL,
      manager_id BIGINT NULL,
      is_verified TINYINT DEFAULT 0,
      is_active TINYINT DEFAULT 1,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_users_company
        FOREIGN KEY (company_id) REFERENCES companies(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
      CONSTRAINT fk_users_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
      CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
      CONSTRAINT fk_users_manager
        FOREIGN KEY (manager_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_files (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NULL,
      type VARCHAR(50) NULL,
      file_path VARCHAR(255) NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_files_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_biodata (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      label VARCHAR(120) NOT NULL,
      value TEXT NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_biodata_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_certificates (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      title VARCHAR(190) NOT NULL,
      issuer VARCHAR(190) NOT NULL,
      year VARCHAR(10) NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_certificates_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_ecards (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      title VARCHAR(190) NOT NULL,
      slug VARCHAR(120) NOT NULL,
      public_url TEXT NOT NULL,
      qr_code_data_url LONGTEXT NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT uq_user_ecards_slug UNIQUE (user_id, slug),
      CONSTRAINT fk_user_ecards_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);
}

async function seedBaseData() {
  const roleCountRows = await query("SELECT COUNT(*) AS total FROM roles");

  if (Number(roleCountRows[0].total) === 0) {
    await query(
      "INSERT INTO roles (name) VALUES ('superadmin'), ('admin'), ('marketing')"
    );
  }

  const companyCountRows = await query("SELECT COUNT(*) AS total FROM companies");

  if (Number(companyCountRows[0].total) === 0) {
    await query(
      "INSERT INTO companies (name, logo) VALUES (?, ?)",
      ["PT E-Card Nusantara", null]
    );
  }
}

async function seedDemoData() {
  const userCountRows = await query("SELECT COUNT(*) AS total FROM users");

  if (Number(userCountRows[0].total) > 0) {
    return;
  }

  const [company] = await query("SELECT id, name FROM companies ORDER BY id ASC LIMIT 1");
  const roles = await query("SELECT id, name FROM roles");
  const roleMap = Object.fromEntries(roles.map((role) => [role.name, role.id]));
  const passwordHash = await bcrypt.hash(
    process.env.DEMO_USER_PASSWORD || "password123",
    10
  );

  const jakartaBranchInsert = await query(
    "INSERT INTO branches (company_id, name, city) VALUES (?, ?, ?)",
    [company.id, "Cabang Jakarta Selatan", "Jakarta Selatan"]
  );
  const bandungBranchInsert = await query(
    "INSERT INTO branches (company_id, name, city) VALUES (?, ?, ?)",
    [company.id, "Cabang Bandung", "Bandung"]
  );

  const jakartaBranch = {
    id: jakartaBranchInsert.insertId,
    city: "Jakarta Selatan"
  };
  const bandungBranch = {
    id: bandungBranchInsert.insertId,
    city: "Bandung"
  };

  const superadminInsert = await query(
    `INSERT INTO users (
      username, slug, password_hash, full_name, nickname, photo, job_title,
      license_number, description, phone, email, instagram, linkedin, whatsapp,
      company_id, branch_id, role_id, manager_id, is_verified, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "superadmin",
      createSlugBase("Superadmin E-Card"),
      passwordHash,
      "Superadmin E-Card",
      "Superadmin",
      null,
      "System Owner",
      null,
      "Mengelola seluruh resource perusahaan dan cabang.",
      "081200000001",
      "superadmin@example.com",
      null,
      null,
      "081200000001",
      company.id,
      null,
      roleMap.superadmin,
      null,
      1,
      1
    ]
  );
  const superadminId = superadminInsert.insertId;

  const jakartaAdminInsert = await query(
    `INSERT INTO users (
      username, slug, password_hash, full_name, nickname, photo, job_title,
      license_number, description, phone, email, instagram, linkedin, whatsapp,
      company_id, branch_id, role_id, manager_id, is_verified, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "admin.jakarta",
      createSlugBase("Admin Jakarta"),
      passwordHash,
      "Admin Jakarta",
      "Admin JKT",
      null,
      "Branch Admin",
      null,
      "Mengelola marketing Cabang Jakarta Selatan.",
      "081200000002",
      "admin.jakarta@example.com",
      null,
      null,
      "081200000002",
      company.id,
      jakartaBranch.id,
      roleMap.admin,
      superadminId,
      1,
      1
    ]
  );
  const jakartaAdminId = jakartaAdminInsert.insertId;

  const bandungAdminInsert = await query(
    `INSERT INTO users (
      username, slug, password_hash, full_name, nickname, photo, job_title,
      license_number, description, phone, email, instagram, linkedin, whatsapp,
      company_id, branch_id, role_id, manager_id, is_verified, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "admin.bandung",
      createSlugBase("Admin Bandung"),
      passwordHash,
      "Admin Bandung",
      "Admin BDG",
      null,
      "Branch Admin",
      null,
      "Mengelola marketing Cabang Bandung.",
      "081200000003",
      "admin.bandung@example.com",
      null,
      null,
      "081200000003",
      company.id,
      bandungBranch.id,
      roleMap.admin,
      superadminId,
      1,
      1
    ]
  );
  const bandungAdminId = bandungAdminInsert.insertId;

  const rinaInsert = await query(
    `INSERT INTO users (
      username, slug, password_hash, full_name, nickname, photo, job_title,
      license_number, description, phone, email, instagram, linkedin, whatsapp,
      company_id, branch_id, role_id, manager_id, is_verified, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "marketing.rina",
      createSlugBase("Rina Marketing"),
      passwordHash,
      "Rina Marketing",
      "Rina",
      null,
      "Senior Property Consultant",
      "LIC-RINA-01",
      "Spesialis properti residensial premium.",
      "081200000004",
      "marketing.rina@example.com",
      "https://instagram.com/rina.marketing",
      "https://linkedin.com/in/rina-marketing",
      "081200000004",
      company.id,
      jakartaBranch.id,
      roleMap.marketing,
      jakartaAdminId,
      1,
      1
    ]
  );
  const rina = { id: rinaInsert.insertId };

  const budiInsert = await query(
    `INSERT INTO users (
      username, slug, password_hash, full_name, nickname, photo, job_title,
      license_number, description, phone, email, instagram, linkedin, whatsapp,
      company_id, branch_id, role_id, manager_id, is_verified, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "marketing.budi",
      createSlugBase("Budi Marketing"),
      passwordHash,
      "Budi Marketing",
      "Budi",
      null,
      "Property Consultant",
      "LIC-BUDI-01",
      "Fokus pada area Bandung Timur dan sekitarnya.",
      "081200000005",
      "marketing.budi@example.com",
      null,
      "https://linkedin.com/in/budi-marketing",
      "081200000005",
      company.id,
      bandungBranch.id,
      roleMap.marketing,
      bandungAdminId,
      1,
      1
    ]
  );
  const budi = { id: budiInsert.insertId };

  await query(
    "INSERT INTO user_biodata (user_id, label, value) VALUES (?, ?, ?), (?, ?, ?)",
    [
      rina.id,
      "Spesialisasi",
      "Properti residensial premium",
      budi.id,
      "Area Penjualan",
      "Bandung Timur dan sekitarnya"
    ]
  );

  await query(
    "INSERT INTO user_certificates (user_id, title, issuer, year) VALUES (?, ?, ?, ?), (?, ?, ?, ?)",
    [
      rina.id,
      "Certified Sales Professional",
      "Internal Academy",
      "2025",
      budi.id,
      "Digital Marketing Certification",
      "Marketing Board",
      "2024"
    ]
  );

  await query(
    "INSERT INTO user_files (user_id, type, file_path) VALUES (?, ?, ?), (?, ?, ?)",
    [
      rina.id,
      "brochure",
      "/files/rina/brochure.pdf",
      budi.id,
      "brochure",
      "/files/budi/brochure.pdf"
    ]
  );

  const rinaSlug = createSlugBase("rina-marketing");
  const budiSlug = createSlugBase("budi-marketing");
  const rinaUrl = `https://ecard.local/${branchCodeFromCity(jakartaBranch.city).toLowerCase()}/${rinaSlug}`;
  const budiUrl = `https://ecard.local/${branchCodeFromCity(bandungBranch.city).toLowerCase()}/${budiSlug}`;
  const rinaQr = await QRCode.toDataURL(rinaUrl, { margin: 1, width: 240 });
  const budiQr = await QRCode.toDataURL(budiUrl, { margin: 1, width: 240 });

  await query(
    `INSERT INTO user_ecards (user_id, title, slug, public_url, qr_code_data_url)
      VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
    [
      rina.id,
      "E-Card Rina",
      rinaSlug,
      rinaUrl,
      rinaQr,
      budi.id,
      "E-Card Budi",
      budiSlug,
      budiUrl,
      budiQr
    ]
  );
}

export async function initializeDatabase() {
  await createDatabaseIfNotExists();
  await createTables();
  await seedBaseData();
  await seedDemoData();
}
