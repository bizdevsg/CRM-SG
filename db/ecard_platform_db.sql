-- =========================
-- 1. PT / Perusahaan
-- =========================
CREATE TABLE companies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NULL,
    video_url TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 2. Cabang
-- =========================
CREATE TABLE branches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT UNSIGNED NOT NULL,
    name TEXT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- =========================
-- 3. Users
-- =========================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,

    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

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
);

-- =========================
-- 4. Detail Profile
-- =========================
CREATE TABLE user_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,

    photo_profile TEXT NULL,
    display_position TEXT NULL,
    description TEXT NULL,

    phone_number VARCHAR(50) NULL,
    supervisor_user_id BIGINT UNSIGNED NULL,
    supervisor_name TEXT NULL,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================
-- 5. Social Media Marketing
-- =========================
CREATE TABLE marketing_social_media (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    platform VARCHAR(50) NOT NULL,
    username VARCHAR(150) NULL,
    url TEXT NOT NULL,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_marketing_social_media_user_platform (user_id, platform)
);

-- =========================
-- 6. Sertifikat
-- =========================
CREATE TABLE marketing_certificates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,

    title TEXT NOT NULL,
    image_url TEXT NOT NULL,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- 7. E-Card
-- =========================
CREATE TABLE ecards (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,

    slug VARCHAR(150) NOT NULL UNIQUE,
    qr_code_url TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_ecards_user_id (user_id)
);
