-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: srots_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `applied_at` datetime(6) DEFAULT NULL,
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_round_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Applied','Shortlisted','Rejected','Hired','Not_Interested','Offer_Released') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_round` int DEFAULT NULL,
  `applied_by` enum('Self','CP_Admin','CP_Staff') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `placed_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK65weib1lru9dkrbto5pv389vi` (`job_id`),
  KEY `FKam71qdmei4tyhyf881aat712w` (`student_id`),
  CONSTRAINT `FK65weib1lru9dkrbto5pv389vi` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  CONSTRAINT `FKam71qdmei4tyhyf881aat712w` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit_events`
--

DROP TABLE IF EXISTS `audit_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_events` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `event` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g. CREATE_STUDENT, SOFT_DELETE_ACCOUNT',
  `actor` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Username of the person performing the action',
  `target_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID of the entity being acted upon',
  `details` text COLLATE utf8mb4_unicode_ci COMMENT 'Free-form detail string',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_event` (`event`),
  KEY `idx_audit_actor` (`actor`),
  KEY `idx_audit_timestamp` (`timestamp`),
  KEY `idx_audit_target` (`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Structured audit trail. Complementary to file-based Kibana logs.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `performed_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `college_company_subscriptions`
--

DROP TABLE IF EXISTS `college_company_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `college_company_subscriptions` (
  `added_by_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `college_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`college_id`,`company_id`),
  KEY `FKbv3hiuw8kgwq6gh4shkgvf9ee` (`added_by_id`),
  KEY `idx_subscription_college` (`college_id`),
  KEY `idx_subscription_company` (`company_id`),
  CONSTRAINT `FK92hc3nux7qogebsqu32lspl9f` FOREIGN KEY (`company_id`) REFERENCES `global_companies` (`id`),
  CONSTRAINT `FKbv3hiuw8kgwq6gh4shkgvf9ee` FOREIGN KEY (`added_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKflk8vf12fmikikj8153pq0vvx` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `colleges`
--

DROP TABLE IF EXISTS `colleges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colleges` (
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `landline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about_sections` json DEFAULT NULL,
  `address_json` json DEFAULT NULL,
  `branches` json DEFAULT NULL,
  `social_media` json DEFAULT NULL,
  `active` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_a93ugma3st6063ucmj2dsopyt` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `education_records`
--

DROP TABLE IF EXISTS `education_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education_records` (
  `current_arrears` int DEFAULT NULL,
  `percentage_equiv` decimal(5,2) DEFAULT NULL,
  `year_of_passing` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `score_display` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `board` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialization` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score_type` enum('Percentage','CGPA','Grade','Marks') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semesters_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK450yontk2dfh3sitlhvm35111` (`student_id`),
  CONSTRAINT `FK450yontk2dfh3sitlhvm35111` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `end_date` date DEFAULT NULL,
  `end_time` time(6) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `start_time` time(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `college_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by_user_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `schedule_json` json DEFAULT NULL,
  `target_branches` json DEFAULT NULL,
  `target_years` json DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_type` enum('Drive','Class','Exam','Holiday','Meeting','Time_Table','Training','Workshop') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3g7eqy9h9kov3icbumnqmjsj3` (`college_id`),
  KEY `FKc0f6mjaqr4omnnq35klwpiiko` (`created_by_user_id`),
  CONSTRAINT `FK3g7eqy9h9kov3icbumnqmjsj3` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`),
  CONSTRAINT `FKc0f6mjaqr4omnnq35klwpiiko` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `free_courses`
--

DROP TABLE IF EXISTS `free_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `free_courses` (
  `created_at` datetime(6) DEFAULT NULL,
  `posted_by_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technology` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform` enum('YOUTUBE','UDEMY','COURSERA','LINKEDIN','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_verified_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbt3sedfmoifr2sv820rpck46k` (`posted_by_id`),
  KEY `idx_free_courses_name` (`name`),
  KEY `idx_courses_status_filter` (`status`,`technology`,`platform`,`created_at` DESC),
  KEY `idx_verification_check` (`last_verified_at`),
  CONSTRAINT `FKbt3sedfmoifr2sv820rpck46k` FOREIGN KEY (`posted_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `global_companies`
--

DROP TABLE IF EXISTS `global_companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_companies` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_json` json DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `full_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `headquarters` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_iasmhl19ooshyy8o77odhlobk` (`name`),
  KEY `idx_company_name` (`name`),
  KEY `idx_company_headquarters` (`headquarters`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_rounds`
--

DROP TABLE IF EXISTS `job_rounds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_rounds` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` bit(1) DEFAULT NULL,
  `completed_count` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qualified_count` int DEFAULT NULL,
  `round_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `round_order` int NOT NULL,
  `scheduled_date` date DEFAULT NULL,
  `selected_count` int DEFAULT NULL,
  `job_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKldyfnbcpyt5dfej06e0qjmsul` (`job_id`),
  CONSTRAINT `FKldyfnbcpyt5dfej06e0qjmsul` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `allow_gaps` bit(1) DEFAULT NULL,
  `application_deadline` date DEFAULT NULL,
  `is_diploma_eligible` bit(1) DEFAULT NULL,
  `max_backlogs` int DEFAULT NULL,
  `max_gap_years` int DEFAULT NULL,
  `min10th_score` decimal(5,2) DEFAULT NULL,
  `min12th_score` decimal(5,2) DEFAULT NULL,
  `min_diploma_score` decimal(5,2) DEFAULT NULL,
  `min_ug_score` decimal(5,2) DEFAULT NULL,
  `posted_at` datetime(6) DEFAULT NULL,
  `posted_by_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `college_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_culture` text COLLATE utf8mb4_unicode_ci,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `eeo_statement` text COLLATE utf8mb4_unicode_ci,
  `external_link` text COLLATE utf8mb4_unicode_ci,
  `format10th` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `format12th` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `format_diploma` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `format_ug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hiring_department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `internal_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `physical_demands` text COLLATE utf8mb4_unicode_ci,
  `salary_range` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allowed_branches` json DEFAULT NULL,
  `attachments_json` json DEFAULT NULL,
  `benefits_json` json DEFAULT NULL,
  `eligible_batches` json DEFAULT NULL,
  `excluded_students_json` json DEFAULT NULL,
  `job_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_qualifications_json` json DEFAULT NULL,
  `qualifications_json` json DEFAULT NULL,
  `required_fields_json` json DEFAULT NULL,
  `responsibilities_json` json DEFAULT NULL,
  `rounds_json` json DEFAULT NULL,
  `status` enum('Active','Closed','Draft') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_mode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avoid_list_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deletion_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `restored_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `restored_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3j76toe669x5xwxi7jpgaq1o8` (`college_id`),
  KEY `FK22dwioep9l8onds5shqpnykrc` (`posted_by_id`),
  KEY `deleted_by` (`deleted_by`),
  KEY `restored_by` (`restored_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `FK22dwioep9l8onds5shqpnykrc` FOREIGN KEY (`posted_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK3j76toe669x5xwxi7jpgaq1o8` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`),
  CONSTRAINT `FKdb3jhmkr5udmmoxlfkvuoxt9f` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKfnyb5ekfo22b3cg1yumls84bo` FOREIGN KEY (`restored_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKmbhyf6hmp4jhfhi25hwn8d7d2` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`),
  CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `jobs_ibfk_2` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`),
  CONSTRAINT `jobs_ibfk_3` FOREIGN KEY (`restored_by`) REFERENCES `users` (`id`),
  CONSTRAINT `jobs_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notices` (
  `notice_date` date DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by_user_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `college_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` text COLLATE utf8mb4_unicode_ci,
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('Notice','Time_Table','Exam','Drive','Placement','Holiday','Workshop','Training','General') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKpoq0o3yla5sqtpp6ewe326ojt` (`college_id`),
  KEY `FKds7qh56j9rbnviq2ixy41xv2n` (`created_by_user_id`),
  CONSTRAINT `FKds7qh56j9rbnviq2ixy41xv2n` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKpoq0o3yla5sqtpp6ewe326ojt` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_comments`
--

DROP TABLE IF EXISTS `post_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_comments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_comment_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_comment_post` (`post_id`),
  KEY `fk_comment_user` (`user_id`),
  KEY `fk_comment_parent` (`parent_comment_id`),
  CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_comment_id`) REFERENCES `post_comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_likes`
--

DROP TABLE IF EXISTS `post_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_likes` (
  `post_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`post_id`,`user_id`),
  KEY `fk_like_user` (`user_id`),
  CONSTRAINT `fk_like_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `college_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `image_urls` json DEFAULT NULL,
  `document_urls` json DEFAULT NULL,
  `likes_count` int DEFAULT '0',
  `comments_disabled` bit(1) DEFAULT b'0',
  `created_at` datetime(6) DEFAULT NULL,
  `comments_count` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_post_college` (`college_id`),
  KEY `fk_post_author` (`author_id`),
  CONSTRAINT `fk_post_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_post_college` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `premium_payment_data`
--

DROP TABLE IF EXISTS `premium_payment_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `premium_payment_data` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_screenshot_url` text COLLATE utf8mb4_unicode_ci,
  `premium_months` enum('FOUR_MONTHS','SIX_MONTHS','TWELVE_MONTHS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `status` enum('PENDING','VERIFIED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `submitted_at` datetime(6) NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `utr_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verified_at` datetime(6) DEFAULT NULL,
  `college_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verified_by_admin_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_7f11u7mf4e80rup406eqj0nqc` (`utr_number`),
  KEY `idx_payment_user_status` (`user_id`,`status`),
  KEY `idx_payment_college` (`college_id`),
  KEY `idx_payment_submitted` (`submitted_at`),
  KEY `FKrbw6ucx11xyf96akcxoyynb8r` (`verified_by_admin_id`),
  CONSTRAINT `FKgkw0oc9elq5j07ca6nltlkmo5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKpcyxjmabxuoqe30oynli8c09l` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`),
  CONSTRAINT `FKrbw6ucx11xyf96akcxoyynb8r` FOREIGN KEY (`verified_by_admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_certifications`
--

DROP TABLE IF EXISTS `student_certifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_certifications` (
  `expiry_date` date DEFAULT NULL,
  `has_expiry` bit(1) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `credential_url` text COLLATE utf8mb4_unicode_ci,
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organizer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `score` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK240sek6p3brl5dfqf8ulvb407` (`student_id`),
  CONSTRAINT `FK240sek6p3brl5dfqf8ulvb407` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_experience`
--

DROP TABLE IF EXISTS `student_experience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_experience` (
  `end_date` date DEFAULT NULL,
  `is_current` bit(1) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary_range` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK71cu1w8o38pbhqpxkaw89lrj5` (`student_id`),
  CONSTRAINT `FK71cu1w8o38pbhqpxkaw89lrj5` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_languages`
--

DROP TABLE IF EXISTS `student_languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_languages` (
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proficiency` enum('Fundamental','Elementary','Limited_Working','Professional_Working','Native') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKs9fnrlvhl5qk51smljdo2axvg` (`student_id`),
  CONSTRAINT `FKs9fnrlvhl5qk51smljdo2axvg` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_profiles` (
  `batch` int DEFAULT NULL,
  `day_scholar` bit(1) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gap_in_studies` bit(1) DEFAULT NULL,
  `passport_expiry_date` date DEFAULT NULL,
  `passport_issue_date` date DEFAULT NULL,
  `premium_end_date` date DEFAULT NULL,
  `premium_start_date` date DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aadhaar_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `advisor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `career_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coordinator` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driving_license` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `father_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `father_occupation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gap_duration` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gap_reason` text COLLATE utf8mb4_unicode_ci,
  `linkedin_profile` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mentor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mother_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mother_occupation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nationality` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `personal_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `placement_cycle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `religion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `roll_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `whatsapp_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_address` json DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanent_address` json DEFAULT NULL,
  `preferred_contact_method` enum('Phone','Email','WhatsApp') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institute_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `communication_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `idx_student_profile_batch` (`batch`),
  KEY `idx_student_profile_branch` (`branch`),
  KEY `idx_student_profile_batch_branch` (`batch`,`branch`),
  CONSTRAINT `FK32koy3tgqtaujxhfsn0b9pel2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_projects`
--

DROP TABLE IF EXISTS `student_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_projects` (
  `end_date` date DEFAULT NULL,
  `is_current` bit(1) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `domain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_link` text COLLATE utf8mb4_unicode_ci,
  `tech_used` text COLLATE utf8mb4_unicode_ci,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7beaakgl2lkw5atue7liwoeh4` (`student_id`),
  CONSTRAINT `FK7beaakgl2lkw5atue7liwoeh4` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_publications`
--

DROP TABLE IF EXISTS `student_publications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_publications` (
  `publish_date` date DEFAULT NULL,
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `publication_url` text COLLATE utf8mb4_unicode_ci,
  `publisher` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKsc389mtrndn4015j7xnev6lg` (`student_id`),
  CONSTRAINT `FKsc389mtrndn4015j7xnev6lg` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_resumes`
--

DROP TABLE IF EXISTS `student_resumes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_resumes` (
  `is_default` bit(1) DEFAULT NULL,
  `uploaded_at` datetime(6) DEFAULT NULL,
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` text COLLATE utf8mb4_unicode_ci,
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKe7p92dlvwpj5b7oatqe3jrk2u` (`student_id`),
  CONSTRAINT `FKe7p92dlvwpj5b7oatqe3jrk2u` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_skills`
--

DROP TABLE IF EXISTS `student_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_skills` (
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proficiency` enum('Fundamental','Beginner','Intermediate','Advanced','Professional') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa8d5h40mj0eesqtpvx6ci97q0` (`student_id`),
  CONSTRAINT `FKa8d5h40mj0eesqtpvx6ci97q0` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_social_links`
--

DROP TABLE IF EXISTS `student_social_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_social_links` (
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` text COLLATE utf8mb4_unicode_ci,
  `platform` enum('LinkedIn','GitHub','Portfolio','YouTube','Other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9kbdlrgp87qumonyourja8tky` (`student_id`),
  CONSTRAINT `FK9kbdlrgp87qumonyourja8tky` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `created_at` datetime(6) DEFAULT NULL,
  `college_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `is_college_head` bit(1) DEFAULT NULL,
  `is_restricted` bit(1) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_user_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aadhaar_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alternative_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alternative_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `college_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `education` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `experience` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_json` json DEFAULT NULL,
  `role` enum('ADMIN','SROTS_DEV','CPH','STAFF','STUDENT') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_expiry` datetime(6) DEFAULT NULL,
  `last_device_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`username`),
  KEY `FKckj8lnp4hl06uc6q7f0lxlmgn` (`parent_user_id`),
  KEY `idx_users_is_deleted` (`is_deleted`),
  KEY `idx_users_college_role` (`college_id`,`role`,`is_deleted`),
  KEY `idx_users_college_role_deleted` (`college_id`,`role`,`is_deleted`),
  KEY `idx_users_role_deleted` (`role`,`is_deleted`),
  FULLTEXT KEY `ft_users_search` (`full_name`,`email`),
  CONSTRAINT `FKckj8lnp4hl06uc6q7f0lxlmgn` FOREIGN KEY (`parent_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKq8c77pl7fllv195wbwqn13375` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-26 19:55:37
