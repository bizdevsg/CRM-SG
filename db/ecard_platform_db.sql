-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 23, 2026 at 08:00 AM
-- Server version: 8.0.30
-- PHP Version: 8.4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecard_platform_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` bigint NOT NULL,
  `company_id` bigint NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `company_id`, `name`, `city`, `created_at`, `updated_at`) VALUES
(1, 1, 'Cabang Jakarta Selatan', 'Jakarta Selatan', '2026-04-23 07:19:38', '2026-04-23 07:19:38'),
(2, 1, 'Cabang Bandung', 'Bandung', '2026-04-23 07:19:38', '2026-04-23 07:19:38');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` bigint NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `logo`, `created_at`, `updated_at`) VALUES
(1, 'PT E-Card Nusantara', NULL, '2026-04-23 07:19:38', '2026-04-23 07:19:38');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(2, 'admin'),
(3, 'marketing'),
(1, 'superadmin');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nickname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tiktok` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_id` bigint DEFAULT NULL,
  `branch_id` bigint DEFAULT NULL,
  `role_id` bigint DEFAULT NULL,
  `manager_id` bigint DEFAULT NULL,
  `is_verified` tinyint DEFAULT '0',
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `slug`, `password_hash`, `full_name`, `nickname`, `photo`, `job_title`, `license_number`, `description`, `phone`, `email`, `tiktok`, `instagram`, `linkedin`, `whatsapp`, `company_id`, `branch_id`, `role_id`, `manager_id`, `is_verified`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'superadmin', 'superadmin-e-card', '$2b$10$un.0AMS6jJ.CV7EXhKCDpudbVwmcUHD4uOcjeMKZ3.VPyOtdAVel2', 'Superadmin E-Card', 'Superadmin', NULL, 'System Owner', NULL, 'Mengelola seluruh resource perusahaan dan cabang.', '081200000001', 'superadmin@example.com', NULL, NULL, NULL, '081200000001', 1, NULL, 1, NULL, 1, 1, '2026-04-23 07:19:38', '2026-04-23 07:19:38'),
(2, 'admin.jakarta', 'admin-jakarta', '$2b$10$un.0AMS6jJ.CV7EXhKCDpudbVwmcUHD4uOcjeMKZ3.VPyOtdAVel2', 'Admin Jakarta', 'Admin JKT', NULL, 'Branch Admin', NULL, 'Mengelola marketing Cabang Jakarta Selatan.', '081200000002', 'admin.jakarta@example.com', NULL, NULL, NULL, '081200000002', 1, 1, 2, 1, 1, 1, '2026-04-23 07:19:38', '2026-04-23 07:19:38'),
(3, 'admin.bandung', 'admin-bandung', '$2b$10$un.0AMS6jJ.CV7EXhKCDpudbVwmcUHD4uOcjeMKZ3.VPyOtdAVel2', 'Admin Bandung', 'Admin BDG', NULL, 'Branch Admin', NULL, 'Mengelola marketing Cabang Bandung.', '081200000003', 'admin.bandung@example.com', NULL, NULL, NULL, '081200000003', 1, 2, 2, 1, 1, 1, '2026-04-23 07:19:38', '2026-04-23 07:19:38'),
(4, 'marketing.rina', 'rina-marketing', '$2b$10$un.0AMS6jJ.CV7EXhKCDpudbVwmcUHD4uOcjeMKZ3.VPyOtdAVel2', 'Rina Marketing', 'Rina', '/uploads/profile-photos/1776930746861-17f3af8dbab2a16d.png', 'Senior Property Consultant', 'LIC-RINA-01', 'Spesialis properti residensial premium.', '081200000004', 'marketing.rina@example.com', NULL, 'https://instagram.com/rina.marketing', 'https://linkedin.com/in/rina-marketing', '081200000004', 1, 1, 3, 2, 1, 1, '2026-04-23 07:19:38', '2026-04-23 07:52:26'),
(5, 'marketing.budi', 'budi-marketing', '$2b$10$un.0AMS6jJ.CV7EXhKCDpudbVwmcUHD4uOcjeMKZ3.VPyOtdAVel2', 'Budi Marketing', 'Budi', NULL, 'Property Consultant', 'LIC-BUDI-01', 'Fokus pada area Bandung Timur dan sekitarnya.', '081200000005', 'marketing.budi@example.com', NULL, NULL, 'https://linkedin.com/in/budi-marketing', '081200000005', 1, 2, 3, 3, 1, 1, '2026-04-23 07:19:38', '2026-04-23 07:19:38');

-- --------------------------------------------------------

--
-- Table structure for table `user_biodata`
--

CREATE TABLE `user_biodata` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `label` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_biodata`
--

INSERT INTO `user_biodata` (`id`, `user_id`, `label`, `value`, `created_at`, `updated_at`) VALUES
(1, 4, 'Spesialisasi', 'Properti residensial premium', '2026-04-23 07:19:38', '2026-04-23 07:19:38'),
(2, 5, 'Area Penjualan', 'Bandung Timur dan sekitarnya', '2026-04-23 07:19:38', '2026-04-23 07:19:38');

-- --------------------------------------------------------

--
-- Table structure for table `user_certificates`
--

CREATE TABLE `user_certificates` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `title` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issuer` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_certificates`
--

INSERT INTO `user_certificates` (`id`, `user_id`, `title`, `issuer`, `year`, `image_path`, `created_at`, `updated_at`) VALUES
(1, 4, 'Certified Sales Professional', 'Internal Academy', '2025', NULL, '2026-04-23 07:19:38', '2026-04-23 07:19:38'),
(2, 5, 'Digital Marketing Certification', 'Marketing Board', '2024', NULL, '2026-04-23 07:19:38', '2026-04-23 07:19:38');

-- --------------------------------------------------------

--
-- Table structure for table `user_ecards`
--

CREATE TABLE `user_ecards` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `title` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `public_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_code_data_url` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_ecards`
--

INSERT INTO `user_ecards` (`id`, `user_id`, `title`, `slug`, `public_url`, `qr_code_data_url`, `created_at`, `updated_at`) VALUES
(2, 5, 'E-Card Budi', 'budi-marketing', 'https://ecard.local/bandung/budi-marketing', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAAAklEQVR4AewaftIAAAa1SURBVO3BUY7k2BEEQY9E3f/KofkVtHwDkSKqs+Vm6R9IWmmQtNYgaa1B0lqDpLUGSWsNktYaJK314S+S8Bu15SQJJ205ScK3tOWuJPxUbTlJwm/UliuDpLUGSWsNktYaJK01SFprkLTWIGmtDw+15adKwluScNKWK0k4actJEk6ScKUtJ215IglX2vItbfmpknDXIGmtQdJag6S1BklrDZLWGiStNUha68PLkvCWtrylLb9REp5oy0lbriThpC3fkoS3tOUtg6S1BklrDZLWGiStNUhaa5C01gf9oyQ80ZYrbTlJwk+VhJO2XGmL/rcGSWsNktYaJK01SFprkLTWIGmtQdJaH/SP2vJEEu5qyxNJ+ImScNIW/XcGSWsNktYaJK01SFprkLTWIGmtQdJaH17Wlt8oCd+ShLva8qYkbNSWjQZJaw2S1hokrTVIWmuQtNYgaa1B0lofHkrCb5SEk7acJOFKW06ScNKWkyTclYSTttzVlpMknLTlriT8RoOktQZJaw2S1hokrTVIWmuQtFb6B/oPSXiiLb9REk7aciUJT7RF/26QtNYgaa1B0lqDpLUGSWsNktYaJK314S+ScNKWkyTc1ZaTJLylLd+ShJO2nCThSltOkvBEEu5qyxNJuNKWJ5Jw0pYrSXiiLVcGSWsNktYaJK01SFprkLTWIGmtQdJaHx5Kwl1tOUnCE225koQnkvD/qC13JeEkCW9JwhNtuastJ0m4a5C01iBprUHSWoOktQZJaw2S1hokrZX+wYuScFdbnkjCW9pyVxJO2vItSXhLW55IwklbriThibacJOGuttw1SFprkLTWIGmtQdJag6S1BklrpX9wkISTtvw/SsJP1ZZvScKVtpwk4aQtJ0m40pafKgknbbkySFprkLTWIGmtQdJag6S1BklrDZLW+vBFSfiWtjzRlruS8KYkXGnLE0k4acuVJJy05SQJJ225koSTtpwk4a62nLTlrkHSWoOktQZJaw2S1hokrTVIWmuQtFb6BwdJOGnLW5LwRFuuJOGkLSdJOGnLXUn4qdpyVxKeaMtJEq605U1JeEtbrgyS1hokrTVIWmuQtNYgaa1B0lqDpLU+/GBtOUnCSRKutOUkCSdtOUnCXW05ScJJW96ShLe05SQJJ225koSTtmw0SFprkLTWIGmtQdJag6S1BklrpX9wkIS3tOUkCU+05UoSTtryRBLe0paTJLylLSdJuNKWkyS8pS0nSThpy11JOGnLXYOktQZJaw2S1hokrTVIWmuQtNYgaa0PD7XlLW05ScJJEt6ShLe05SQJJ225koSTtrwlCW9qy5UkPJGEk7Z8wyBprUHSWoOktQZJaw2S1hokrTVIWiv9gweS8C1tuSsJJ215IglvactdSXiiLW9Jwklb7krCSVtOkvCWttw1SFprkLTWIGmtQdJag6S1BklrDZLW+vAXSThpy1uScJKEu9pykoQn2nIlCSdtOUnCtyThpC3fkoS3tOUkCVfa8pZB0lqDpLUGSWsNktYaJK01SFrrw1+05VvaslUS3tKWkyRcacsTSThJwpW2vKktV5LwGw2S1hokrTVIWmuQtNYgaa1B0lqDpLU+PJSEb2nLSRLuastvlIQ3teVKEp5IwluSsNEgaa1B0lqDpLUGSWsNktYaJK01SFor/QP9hySctOUkCVfacpKEk7a8JQlvactJEk7a8pYk/FRtuTJIWmuQtNYgaa1B0lqDpLUGSWsNktb68BdJ+I3a8qa23NWWkySctOWutjyRhCtJeFMSrrTlTW25koSTttw1SFprkLTWIGmtQdJag6S1BklrfXioLT9VEjZKwhNJuNKWb2nLSRKeaMtP1Ja3DJLWGiStNUhaa5C01iBprUHSWoOktT68LAlvactb2vKWJJy05S1JOGnLSRJO2vKWJHxLW06S8Ja2XBkkrTVIWmuQtNYgaa1B0lqDpLUGSWt90D9KwklbTpJwpS1PJOEtSXhLEk7acpKEk7ZcScITSThpy11JuGuQtNYgaa1B0lqDpLUGSWsNktYaJK31Qbck4a4kvKktb0nCt7TlLW15IglX2vKWQdJag6S1BklrDZLWGiStNUha68PL2rJRW06ScNKWK0k4acsTSXhLW06ScKUtJ0k4actJEu5KwhNtuZKEk7bcNUhaa5C01iBprUHSWoOktQZJaw2S1vrwUBJ+oySctOUkCVfacpKEk7actOWuJLwlCU8k4a62/EaDpLUGSWsNktYaJK01SFprkLTWIGmt9A8krTRIWmuQtNYgaa1B0lqDpLUGSWv9C/roORbOn3aeAAAAAElFTkSuQmCC', '2026-04-23 07:19:38', '2026-04-23 07:19:38');

-- --------------------------------------------------------

--
-- Table structure for table `user_files`
--

CREATE TABLE `user_files` (
  `id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_files`
--

INSERT INTO `user_files` (`id`, `user_id`, `type`, `file_path`, `created_at`, `updated_at`) VALUES
(1, 4, 'brochure', '/files/rina/brochure.pdf', '2026-04-23 07:19:38', '2026-04-23 07:19:38'),
(2, 5, 'brochure', '/files/budi/brochure.pdf', '2026-04-23 07:19:38', '2026-04-23 07:19:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_branches_company` (`company_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_company` (`company_id`),
  ADD KEY `fk_users_branch` (`branch_id`),
  ADD KEY `fk_users_role` (`role_id`),
  ADD KEY `fk_users_manager` (`manager_id`);

--
-- Indexes for table `user_biodata`
--
ALTER TABLE `user_biodata`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_biodata_user` (`user_id`);

--
-- Indexes for table `user_certificates`
--
ALTER TABLE `user_certificates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_certificates_user` (`user_id`);

--
-- Indexes for table `user_ecards`
--
ALTER TABLE `user_ecards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_ecards_slug` (`user_id`,`slug`);

--
-- Indexes for table `user_files`
--
ALTER TABLE `user_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_files_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_biodata`
--
ALTER TABLE `user_biodata`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_certificates`
--
ALTER TABLE `user_certificates`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_ecards`
--
ALTER TABLE `user_ecards`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_files`
--
ALTER TABLE `user_files`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `branches`
--
ALTER TABLE `branches`
  ADD CONSTRAINT `fk_branches_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_biodata`
--
ALTER TABLE `user_biodata`
  ADD CONSTRAINT `fk_user_biodata_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_certificates`
--
ALTER TABLE `user_certificates`
  ADD CONSTRAINT `fk_user_certificates_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_ecards`
--
ALTER TABLE `user_ecards`
  ADD CONSTRAINT `fk_user_ecards_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_files`
--
ALTER TABLE `user_files`
  ADD CONSTRAINT `fk_user_files_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
