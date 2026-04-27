-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 24, 2026 at 03:18 AM
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
  `id` bigint UNSIGNED NOT NULL,
  `company_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `company_id`, `name`, `address`, `created_at`, `updated_at`) VALUES
(1, 4, 'DBS Bank Tower LT 14 & 20, Ciputra World I, Jakarta Selatan 12940', 'Jl. Prof. DR. Satrio No.Kav. 3-5, RT.18/RW.4, Kuningan, Karet Kuningan, Kecamatan Setiabudi, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12940', '2026-04-24 01:20:14', '2026-04-24 01:20:14');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `video_url` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `description`, `video_url`, `created_at`, `updated_at`) VALUES
(1, 'PT. Solid Gold Berjangka', 'Perusahaan pialang berjangka untuk kebutuhan platform E-Card marketing.', 'https://example.com/videos/solid-gold-berjangka', '2026-04-24 01:16:41', '2026-04-24 01:16:41'),
(2, 'PT. Riffan Financindo Berjangka', 'Profil perusahaan Riffan Financindo Berjangka untuk katalog E-Card internal.', 'https://example.com/videos/riffan-financindo-berjangka', '2026-04-24 01:16:41', '2026-04-24 01:16:41'),
(3, 'PT. Kontak Perkasa Futures', 'Data master perusahaan Kontak Perkasa Futures untuk kebutuhan cabang dan marketing.', 'https://example.com/videos/kontak-perkasa-futures', '2026-04-24 01:16:41', '2026-04-24 01:16:41'),
(4, 'PT. Bestprofit Futures', 'Informasi perusahaan Bestprofit Futures yang ditampilkan pada resource E-Card.', 'https://example.com/videos/bestprofit-futures', '2026-04-24 01:16:41', '2026-04-24 01:16:41'),
(5, 'PT. Equityworld Futures', 'Informasi perusahaan Equityworld Futures untuk mendukung profil marketing dan e-card.', 'https://example.com/videos/equityworld-futures', '2026-04-24 01:16:41', '2026-04-24 01:16:41');

-- --------------------------------------------------------

--
-- Table structure for table `ecards`
--

CREATE TABLE `ecards` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_code_url` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ecards`
--

INSERT INTO `ecards` (`id`, `user_id`, `slug`, `qr_code_url`, `is_active`, `created_at`, `updated_at`) VALUES
(4, 3, 'laura-ecard', 'data:image/png;base64,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', 1, '2026-04-24 03:13:08', '2026-04-24 03:13:24');

-- --------------------------------------------------------

--
-- Table structure for table `marketing_certificates`
--

CREATE TABLE `marketing_certificates` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `marketing_supervisors`
--

CREATE TABLE `marketing_supervisors` (
  `id` bigint UNSIGNED NOT NULL,
  `marketing_id` bigint UNSIGNED NOT NULL,
  `supervisor_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `marketing_supervisors`
--

INSERT INTO `marketing_supervisors` (`id`, `marketing_id`, `supervisor_id`, `created_at`, `updated_at`) VALUES
(1, 3, 2, '2026-04-24 02:09:50', '2026-04-24 02:09:50');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `nik` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_number` text COLLATE utf8mb4_unicode_ci,
  `real_position` text COLLATE utf8mb4_unicode_ci,
  `company_id` bigint UNSIGNED DEFAULT NULL,
  `branch_id` bigint UNSIGNED DEFAULT NULL,
  `role` enum('superadmin','admin','marketing') COLLATE utf8mb4_unicode_ci DEFAULT 'marketing',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `password`, `is_active`, `nik`, `license_number`, `real_position`, `company_id`, `branch_id`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Superadmin', 'superadmin', 'superadmin@example.com', '$2y$12$Dr8iDW1OGiVhiobDstdKXe5.lXZYsTeQTXiumfi2WtM/z0kJKmz.W', 1, NULL, NULL, NULL, NULL, NULL, 'superadmin', '2026-04-24 01:14:58', '2026-04-24 01:17:59'),
(2, 'Admin RFB DBS', 'AdminRFBDBS', 'adminrfbdbs@example.com', '$2y$12$Dr8iDW1OGiVhiobDstdKXe5.lXZYsTeQTXiumfi2WtM/z0kJKmz.W', 1, NULL, NULL, NULL, 4, 1, 'admin', '2026-04-24 01:21:17', '2026-04-24 01:22:20'),
(3, 'Laura Shakira Aisyah Putri', 'araleo9', 'marketing.laura@example.com', '$2b$12$ZuIN54bWIk1ngo5Iohx9BeztSy/k1r2YJ4OMUHaaELAmQoTR6KDpa', 1, '3125012806030001', '174/UPP/SI/03/2013', 'Senior Business Consultant (SBC)', 4, 1, 'marketing', '2026-04-24 02:09:50', '2026-04-24 02:09:50');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `photo_profile` text COLLATE utf8mb4_unicode_ci,
  `display_position` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `phone_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supervisor_user_id` bigint UNSIGNED DEFAULT NULL,
  `supervisor_name` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `photo_profile`, `display_position`, `description`, `phone_number`, `supervisor_user_id`, `supervisor_name`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-24 01:16:41', '2026-04-24 01:16:41'),
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-24 01:21:17', '2026-04-24 01:21:17'),
(3, 3, NULL, 'Senior Business Consultant (SBC)', NULL, NULL, 2, 'Admin RFB DBS', '2026-04-24 02:09:50', '2026-04-24 02:58:48');

-- --------------------------------------------------------

--
-- Table structure for table `marketing_social_media`
--

CREATE TABLE `marketing_social_media` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `platform` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ecards`
--
ALTER TABLE `ecards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `uq_ecards_user_id` (`user_id`);

--
-- Indexes for table `marketing_certificates`
--
ALTER TABLE `marketing_certificates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `marketing_social_media`
--
ALTER TABLE `marketing_social_media`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_marketing_social_media_user_platform` (`user_id`,`platform`);

--
-- Indexes for table `marketing_supervisors`
--
ALTER TABLE `marketing_supervisors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_marketing_supervisors_pair` (`marketing_id`,`supervisor_id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ecards`
--
ALTER TABLE `ecards`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `marketing_certificates`
--
ALTER TABLE `marketing_certificates`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `marketing_supervisors`
--
ALTER TABLE `marketing_supervisors`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `marketing_social_media`
--
ALTER TABLE `marketing_social_media`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `branches`
--
ALTER TABLE `branches`
  ADD CONSTRAINT `branches_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ecards`
--
ALTER TABLE `ecards`
  ADD CONSTRAINT `ecards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `marketing_certificates`
--
ALTER TABLE `marketing_certificates`
  ADD CONSTRAINT `marketing_certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `marketing_supervisors`
--
ALTER TABLE `marketing_supervisors`
  ADD CONSTRAINT `marketing_supervisors_ibfk_1` FOREIGN KEY (`marketing_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `marketing_supervisors_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `marketing_social_media`
--
ALTER TABLE `marketing_social_media`
  ADD CONSTRAINT `marketing_social_media_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
