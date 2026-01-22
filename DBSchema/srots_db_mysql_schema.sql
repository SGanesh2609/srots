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
  PRIMARY KEY (`id`),
  KEY `FK65weib1lru9dkrbto5pv389vi` (`job_id`),
  KEY `FKam71qdmei4tyhyf881aat712w` (`student_id`),
  CONSTRAINT `FK65weib1lru9dkrbto5pv389vi` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  CONSTRAINT `FKam71qdmei4tyhyf881aat712w` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES ('2025-12-19 20:33:09.000000','STU_AITS_01','Interviewing','d4a8e1e7-dceb-11f0-a9ee-a8b13badcf00','d49eb259-dceb-11f0-a9ee-a8b13badcf00','Shortlisted');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `FK92hc3nux7qogebsqu32lspl9f` (`company_id`),
  CONSTRAINT `FK92hc3nux7qogebsqu32lspl9f` FOREIGN KEY (`company_id`) REFERENCES `global_companies` (`id`),
  CONSTRAINT `FKbv3hiuw8kgwq6gh4shkgvf9ee` FOREIGN KEY (`added_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKflk8vf12fmikikj8153pq0vvx` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `college_company_subscriptions`
--

LOCK TABLES `college_company_subscriptions` WRITE;
/*!40000 ALTER TABLE `college_company_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `college_company_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_a93ugma3st6063ucmj2dsopyt` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colleges`
--

LOCK TABLES `colleges` WRITE;
/*!40000 ALTER TABLE `colleges` DISABLE KEYS */;
INSERT INTO `colleges` VALUES ('2025-12-20 18:21:43.425960','2025-12-20 18:24:37.338802','IITB','admin@iitb.ac.in','3d40f097-6193-41df-b5f5-73ea41e5d0e2','022-1234567',NULL,'Indian Institute of Technology Bombay','02225722545','Engineering','[{\"id\": \"sec_1\", \"image\": \"https://srots-bucket.s3.amazonaws.com/iitb/placements.jpg\", \"title\": \"Placement Excellence\", \"content\": \"IITB has a stellar record of 100% placements with top global recruiters.\"}, {\"id\": \"sec_2\", \"image\": \"https://srots-bucket.s3.amazonaws.com/iitb/research.jpg\", \"title\": \"Research & Innovation\", \"content\": \"Home to over 30 research centers and state-of-the-art labs.\"}]','{\"zip\": \"400076\", \"city\": \"Mumbai\", \"state\": \"Maharashtra\", \"country\": \"India\", \"addressLine1\": \"Main Gate Rd, Powai\"}','[{\"code\": \"CSE\", \"name\": \"Computer Science and Engineering\"}]','{\"twitter\": \"https://twitter.com/iitbombay\", \"website\": \"https://www.iitb.ac.in\", \"youtube\": \"https://youtube.com/c/iitbombay\", \"facebook\": \"https://facebook.com/iitb\", \"linkedin\": \"https://linkedin.com/school/iit-bombay\", \"instagram\": \"https://instagram.com/iitbombay\"}'),(NULL,NULL,'AITS','info@aits.edu','d4946f07-dceb-11f0-a9ee-a8b13badcf00',NULL,'https://srots.com/logos/aits.png','Annamacharya Institute of Technology and Sciences','08565251861','Engineering','[{\"id\": \"v1\", \"title\": \"Vision\", \"content\": \"To be a premier institute of technology.\"}, {\"id\": \"h1\", \"title\": \"History\", \"content\": \"Founded in 1998.\"}]','{\"zip\": \"516115\", \"city\": \"Rajampet\", \"line1\": \"New Boyanapalli\", \"state\": \"Andhra Pradesh\", \"district\": \"Kadapa\"}','[{\"code\": \"CSE\", \"name\": \"Computer Science\"}, {\"code\": \"ECE\", \"name\": \"Electronics\"}]','{\"website\": \"aitsrajampet.ac.in\", \"linkedin\": \"linkedin.com/school/aits\"}'),(NULL,NULL,'SRIT','info@srit.ac.in','d494bdff-dceb-11f0-a9ee-a8b13badcf00',NULL,'https://srots.com/logos/srit.png','Srinivasa Ramanujan Institute of Technology','08554222333','Engineering','[{\"title\": \"Campus\", \"content\": \"Modern infrastructure and labs.\"}]','{\"city\": \"Anantapur\", \"state\": \"Andhra Pradesh\"}','[{\"code\": \"IT\", \"name\": \"Information Technology\"}]','{\"website\": \"srit.ac.in\"}'),('2025-12-19 20:35:38.000000',NULL,'SRM',NULL,'srm-uuid-9999-8888-777777777777',NULL,NULL,'SRM Institute of Science and Technology',NULL,'University',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `colleges` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `education_records`
--

LOCK TABLES `education_records` WRITE;
/*!40000 ALTER TABLE `education_records` DISABLE KEYS */;
INSERT INTO `education_records` VALUES (0,NULL,'2025','8.5','University',NULL,'SRM_21701A0501','16f97dc0-1dc9-4ead-beed-1a9823e3a420','College','Undergraduate','CGPA','[{\"sem\": \"Sem 1\", \"sgpa\": 8.2}, {\"sem\": \"Sem 2\", \"sgpa\": 8.4}, {\"sem\": \"Sem 3\", \"sgpa\": 8.5}, {\"sem\": \"Sem 4\", \"sgpa\": 8.6}]'),(0,NULL,'2023','88','SBTET',NULL,'SRM_SRM22CS_LAT01','25ae74c7-b8eb-4add-8faf-59b0fef0346f','Govt Polytechnic','Diploma','Percentage','[]'),(0,NULL,'2021','95','CBSE',NULL,'SRM_21701A0501','3d38d9bc-b222-40f9-8d76-7063d338044a','DPS','Class 12','Percentage','[]'),(0,NULL,'2020','88.0','BSEB','Science (PCM)','SRM_CS2023001','57b13843-58e9-4b74-8705-a08ea64ee546','City Junior College','Class 12','Percentage','[]'),(0,NULL,'2019','9.8','CBSE',NULL,'SRM_21701A0501','76f3455b-26e1-495e-aad6-be9e50c09640','DPS','Class 10','CGPA','[]'),(0,NULL,'2020','9.5','SSC',NULL,'SRM_SRM22CS_LAT01','8b49dcfe-4884-4546-9f96-24f9426cee96','ZPHS School','Class 10','CGPA','[]'),(0,NULL,'2018','92.5','CBSE','General','SRM_CS2023001','a07e2fd5-8ff3-4afb-9b4d-b545d41cb53e','St. Mary\'s School','Class 10','Percentage','[]'),(0,NULL,'2022','88','SBTET',NULL,'SRM_22705A0402','b0e98f64-1222-4e85-a247-cbf8ebff50cb','Poly','Diploma','Percentage','[]'),(0,NULL,'2024','8.5','University Board','Computer Science','SRM_CS2023001','b72ad6fe-0d68-4501-89b2-ae4ef7f17ff3','SROTS College of Tech','Undergraduate','CGPA','[{\"sem\": \"Sem 1\", \"sgpa\": 8.2}, {\"sem\": \"Sem 2\", \"sgpa\": 8.8}]'),(1,NULL,'2025','8.2','University',NULL,'SRM_22705A0402','b7b2f10e-2704-4912-912d-eb89b8af2ac6','College','Undergraduate','CGPA','[{\"sem\": \"Sem 3\", \"sgpa\": 8.0}, {\"sem\": \"Sem 4\", \"sgpa\": 8.1}, {\"sem\": \"Sem 5\", \"sgpa\": 8.3}, {\"sem\": \"Sem 6\", \"sgpa\": 8.4}]'),(0,NULL,'2026','0','University',NULL,'SRM_SRM22CS_LAT01','ca871aea-4dda-4e8f-a8b8-d814066a17ad','SRM Institute','Undergraduate','CGPA','[{\"sem\": \"Sem 3\", \"sgpa\": 8.5}, {\"sem\": \"Sem 4\", \"sgpa\": 8.2}, {\"sem\": \"Sem 5\", \"sgpa\": 8.7}]'),(NULL,85.50,NULL,'8.5','JNTUA',NULL,'STU_AITS_01','d49db5a4-dceb-11f0-a9ee-a8b13badcf00','AITS','Undergraduate','CGPA','[{\"sem\": 1, \"sgpa\": \"8.2\"}, {\"sem\": 2, \"sgpa\": \"8.8\"}]'),(NULL,94.00,NULL,'940','BIEAP',NULL,'STU_AITS_01','d49dca53-dceb-11f0-a9ee-a8b13badcf00','Narayana','Class 12','Marks',NULL),(0,NULL,'2019','9.5','SSC',NULL,'SRM_22705A0402','e024c573-6665-4066-9e49-33eaeae81ab2','ZPHS','Class 10','CGPA','[]');
/*!40000 ALTER TABLE `education_records` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES ('2025-12-26','12:30:00.000000','2025-12-25','03:30:00.000000','2025-12-21 06:16:45.856100','srm-uuid-9999-8888-777777777777',NULL,'24-hour coding challenge','369964af-c281-42b7-a4fe-1ee4cd5373cc','[{\"time\": \"09:00 AM\", \"activity\": \"Introduction\"}, {\"time\": \"10:00 AM\", \"activity\": \"Coding Begins\"}]','[\"CSE\", \"IT\"]','null','Hackathon 2025','Workshop'),(NULL,'13:00:00.000000','2025-01-10','10:00:00.000000',NULL,'d4946f07-dceb-11f0-a9ee-a8b13badcf00','AITS_H1',NULL,'d4a40f51-dceb-11f0-a9ee-a8b13badcf00',NULL,'[\"CSE\", \"ECE\"]',NULL,'Career Orientation','Workshop');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

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
  PRIMARY KEY (`id`),
  KEY `FKbt3sedfmoifr2sv820rpck46k` (`posted_by_id`),
  CONSTRAINT `FKbt3sedfmoifr2sv820rpck46k` FOREIGN KEY (`posted_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `free_courses`
--

LOCK TABLES `free_courses` WRITE;
/*!40000 ALTER TABLE `free_courses` DISABLE KEYS */;
INSERT INTO `free_courses` VALUES (NULL,'SADMIN_01',NULL,'d4a9d40c-dceb-11f0-a9ee-a8b13badcf00','https://srots.com/sql','Master SQL','Srots Admin','Database');
/*!40000 ALTER TABLE `free_courses` ENABLE KEYS */;
UNLOCK TABLES;

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
  UNIQUE KEY `UK_iasmhl19ooshyy8o77odhlobk` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_companies`
--

LOCK TABLES `global_companies` WRITE;
/*!40000 ALTER TABLE `global_companies` DISABLE KEYS */;
INSERT INTO `global_companies` VALUES ('ff9263e9-13da-4fd3-bf46-4f9f04316ee2','{\"city\": \"Mountain View\", \"state\": \"California\", \"country\": \"USA\"}','Updated description for search giant.','Mountain View, California, USA','Mountain View','/api/v1/files/General/Company/cbd612f2-89e5-49fd-a0b2-047709421a95_Ganesh.jpg','Google LLC','https://about.google');
/*!40000 ALTER TABLE `global_companies` ENABLE KEYS */;
UNLOCK TABLES;

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
  `job_type` enum('Full_Time','Part_Time','Internship','Contract','Internship_to_Full_Time') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_qualifications_json` json DEFAULT NULL,
  `qualifications_json` json DEFAULT NULL,
  `required_fields_json` json DEFAULT NULL,
  `responsibilities_json` json DEFAULT NULL,
  `rounds_json` json DEFAULT NULL,
  `status` enum('Active','Closed','Draft') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_mode` enum('On_site','Remote','Hybrid') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3j76toe669x5xwxi7jpgaq1o8` (`college_id`),
  KEY `FK22dwioep9l8onds5shqpnykrc` (`posted_by_id`),
  CONSTRAINT `FK22dwioep9l8onds5shqpnykrc` FOREIGN KEY (`posted_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK3j76toe669x5xwxi7jpgaq1o8` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (_binary '\0','2025-12-30',_binary '\0',0,0,80.00,80.00,NULL,7.50,'2025-12-23 16:43:16.434603','209fa463-d85f-4030-b842-816279639873','srm-uuid-9999-8888-777777777777','We value innovation, inclusion, and continuous learning.','Google',NULL,'https://careers.google.com/jobs/...',NULL,NULL,NULL,NULL,'Engineering','6829288c-cdc2-4074-a00b-a9dcd2023b10','G-CAMPUS-2025','Bangalore, KA',NULL,'12 - 18 LPA','We are looking for passionate graduates to join our Cloud Infrastructure team. You will work on high-scale distributed systems.','Associate Software Engineer','[\"CSE\", \"IT\", \"ECE\"]','[{\"url\": \"/api/v1/files/SRM/JOB_ATTACHMENTS/eb2df6c0-2272-4e6c-9d66-2a11c19684fa_GratuityForm.pdf\", \"name\": \"GratuityForm.pdf\"}]','[\"Comprehensive Health Insurance\", \"Annual Performance Bonus\", \"Relocation Assistance\"]','[\"2024\", \"2025\"]','[\"21701A0501\"]','Full_Time','[\"Prior internship experience in product-based companies\", \"Knowledge of Cloud platforms (GCP/AWS)\"]','[\"B.Tech in Computer Science or related field\", \"Strong understanding of Data Structures & Algorithms\", \"Proficiency in Java or Python\"]','[\"fullName\", \"rollNumber\", \"instituteEmail\", \"phone\", \"btech.cgpa\", \"resumes\", \"class10.percentage\", \"class12.percentage\", \"gender\"]','[\"Develop and maintain scalable web applications\", \"Collaborate with cross-functional teams\", \"Write clean, documented, and testable code\"]','[{\"date\": \"2026-01-05\", \"name\": \"Aptitude Test\", \"status\": \"Pending\"}, {\"date\": \"2025-01-10\", \"name\": \"Technical Interview 1\", \"status\": \"Pending\"}, {\"date\": \"2025-01-15\", \"name\": \"HR Interview\", \"status\": \"Pending\"}]','Active','Hybrid'),(NULL,'2025-12-01',NULL,0,NULL,75.00,75.00,NULL,8.00,NULL,'AITS_H1','d4946f07-dceb-11f0-a9ee-a8b13badcf00',NULL,'Google',NULL,NULL,NULL,NULL,NULL,NULL,'Google Cloud Platform','d49eb259-dceb-11f0-a9ee-a8b13badcf00',NULL,'Hyderabad',NULL,'18 LPA','Looking for backend experts.','Software Development Engineer','[\"CSE\", \"ECE\"]',NULL,NULL,'[2025]',NULL,'Full_Time',NULL,'[\"Java Knowledge\", \"Problem Solving\"]',NULL,'[\"API Design\", \"Cloud Infrastructure\"]','[{\"name\": \"Aptitude\", \"step\": 1}, {\"name\": \"Technical\", \"step\": 2}, {\"name\": \"HR\", \"step\": 3}]','Active','Hybrid'),(_binary '\0','2025-12-30',_binary '\0',0,0,80.00,80.00,NULL,7.50,'2025-12-23 16:56:59.487133','209fa463-d85f-4030-b842-816279639873','srm-uuid-9999-8888-777777777777','We value innovation, inclusion, and continuous learning.','Google',NULL,'https://careers.google.com/jobs/...',NULL,NULL,NULL,NULL,'Engineering','e7dcba3f-095a-496e-9eaa-00edfa9a3ca8','G-CAMPUS-2025','Bangalore, KA',NULL,'12 - 18 LPA','We are looking for passionate graduates to join our Cloud Infrastructure team. You will work on high-scale distributed systems.','Associate Software Engineer ||','[\"CSE\", \"IT\", \"ECE\"]','[{\"url\": \"/api/v1/files/SRM/JOB_ATTACHMENTS/f32e954c-e1e8-4fb3-a3fe-a22df7a45510_MANU3.jpg\", \"name\": \"MANU3.jpg\"}]','[\"Comprehensive Health Insurance\", \"Annual Performance Bonus\", \"Relocation Assistance\"]','[\"2024\", \"2025\"]','[\"21701A0501\"]','Full_Time','[\"Prior internship experience in product-based companies\", \"Knowledge of Cloud platforms (GCP/AWS)\"]','[\"B.Tech in Computer Science or related field\", \"Strong understanding of Data Structures & Algorithms\", \"Proficiency in Java or Python\"]','[\"fullName\", \"rollNumber\", \"instituteEmail\", \"phone\", \"btech.cgpa\", \"resumes\", \"class10.percentage\", \"class12.percentage\", \"gender\"]','[\"Develop and maintain scalable web applications\", \"Collaborate with cross-functional teams\", \"Write clean, documented, and testable code\"]','[{\"date\": \"2026-01-05\", \"name\": \"Aptitude Test\", \"status\": \"Pending\"}, {\"date\": \"2025-01-10\", \"name\": \"Technical Interview 1\", \"status\": \"Pending\"}, {\"date\": \"2025-01-15\", \"name\": \"HR Interview\", \"status\": \"Pending\"}]','Active','Hybrid');
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `notices`
--

LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
INSERT INTO `notices` VALUES ('2025-12-19',NULL,'AITS_S1','d4946f07-dceb-11f0-a9ee-a8b13badcf00','Wear formals for the drive.',NULL,NULL,'d4a54d70-dceb-11f0-a9ee-a8b13badcf00','Uniform Notice','Notice'),('2024-12-21','2025-12-21 11:14:08.550571','209fa463-d85f-4030-b842-816279639873','srm-uuid-9999-8888-777777777777','Please find the attached schedule.','ai_studio_code (1).txt','/api/v1/files/SRM/Calendar/3d3fff82-faf4-43e3-83e6-8a81966e170d_ai_studio_code (1).txt','e31a49fb-9d42-49a4-a123-3b84daeefd65','Semester Examination Schedule','Exam');
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `post_comments`
--

LOCK TABLES `post_comments` WRITE;
/*!40000 ALTER TABLE `post_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_comments` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `post_likes`
--

LOCK TABLES `post_likes` WRITE;
/*!40000 ALTER TABLE `post_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_likes` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

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
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
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
-- Dumping data for table `student_certifications`
--

LOCK TABLES `student_certifications` WRITE;
/*!40000 ALTER TABLE `student_certifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_certifications` ENABLE KEYS */;
UNLOCK TABLES;

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
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
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
-- Dumping data for table `student_experience`
--

LOCK TABLES `student_experience` WRITE;
/*!40000 ALTER TABLE `student_experience` DISABLE KEYS */;
INSERT INTO `student_experience` VALUES (NULL,_binary '\0','2024-05-01','STU_AITS_01','Microsoft','Worked on Azure.','d4a7c758-dceb-11f0-a9ee-a8b13badcf00',NULL,NULL,'Intern','Internship');
/*!40000 ALTER TABLE `student_experience` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_languages`
--

DROP TABLE IF EXISTS `student_languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_languages` (
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proficiency` enum('Fundamental','Elementary','Limited_Working','Professional_Working','Native') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKs9fnrlvhl5qk51smljdo2axvg` (`student_id`),
  CONSTRAINT `FKs9fnrlvhl5qk51smljdo2axvg` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_languages`
--

LOCK TABLES `student_languages` WRITE;
/*!40000 ALTER TABLE `student_languages` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_languages` ENABLE KEYS */;
UNLOCK TABLES;

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
  PRIMARY KEY (`user_id`),
  CONSTRAINT `FK32koy3tgqtaujxhfsn0b9pel2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
INSERT INTO `student_profiles` VALUES (2025,_binary '\0','2003-05-15',_binary '\0',NULL,NULL,NULL,NULL,'2025-12-20 12:11:39.752557','SRM_21701A0501',NULL,'','ECE',NULL,'Ms. Kapoor','B.Tech',NULL,NULL,NULL,NULL,NULL,NULL,'Prof. Rao',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'21701A0501','9876543210','null','MALE','null',NULL,'rahul@college.edu'),(2025,_binary '\0','2003-08-20',_binary '\0',NULL,NULL,NULL,NULL,'2025-12-20 12:11:40.114767','SRM_22705A0402',NULL,'','ECE',NULL,'Mr. John','B.Tech',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'22705A0402','9123456780','null','FEMALE','null',NULL,'priya@college.edu'),(2023,_binary '\0','2002-05-15',_binary '\0',NULL,NULL,NULL,NULL,'2025-12-20 11:25:35.498405','SRM_CS2023001',NULL,'Prof. Alan','CSE',NULL,'Ms. Sarah','B.Tech',NULL,NULL,NULL,NULL,NULL,NULL,'Dr. Smith',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-27',NULL,'CS2023001','9876543210','{\"city\": \"Bengaluru\", \"line1\": \"Hostel Block A\"}','MALE','{\"city\": \"Patna\", \"line1\": \"123 Village St\"}',NULL,'rahul.k@college.edu.in'),(2026,_binary '\0','2003-04-12',_binary '\0',NULL,NULL,NULL,NULL,'2025-12-20 12:19:24.065213','SRM_SRM22CS_LAT01',NULL,NULL,'CSE',NULL,NULL,'B.Tech',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SRM22CS_LAT01','9988776655','null','MALE','null',NULL,'arjun.v@srm.edu'),(2025,NULL,'2001-08-20',NULL,NULL,NULL,NULL,NULL,NULL,'STU_AITS_01','1234-5678-9012',NULL,'CSE',NULL,NULL,'B.Tech',NULL,'Ravi',NULL,NULL,NULL,NULL,NULL,'Lakshmi',NULL,NULL,NULL,NULL,NULL,'harendra.p@gmail.com','2024-25',NULL,'20701A0379','9876543210','{\"city\": \"Rajampet\", \"state\": \"AP\"}','MALE','{\"city\": \"Rajampet\", \"state\": \"AP\"}',NULL,NULL),(2025,NULL,'2002-05-15',NULL,NULL,NULL,NULL,NULL,NULL,'STU_SRIT_01','4321-8765-0987',NULL,'IT',NULL,NULL,'B.Tech',NULL,'Arjun',NULL,NULL,NULL,NULL,NULL,'Sita',NULL,NULL,NULL,NULL,NULL,'rahul.v@gmail.com','2024-25',NULL,'214G1A0101','9876543211','{\"city\": \"Anantapur\"}','MALE','{\"city\": \"Anantapur\"}',NULL,NULL);
/*!40000 ALTER TABLE `student_profiles` ENABLE KEYS */;
UNLOCK TABLES;

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
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_link` text COLLATE utf8mb4_unicode_ci,
  `tech_used` text COLLATE utf8mb4_unicode_ci,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7beaakgl2lkw5atue7liwoeh4` (`student_id`),
  CONSTRAINT `FK7beaakgl2lkw5atue7liwoeh4` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_projects`
--

LOCK TABLES `student_projects` WRITE;
/*!40000 ALTER TABLE `student_projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_publications`
--

DROP TABLE IF EXISTS `student_publications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_publications` (
  `publish_date` date DEFAULT NULL,
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `publication_url` text COLLATE utf8mb4_unicode_ci,
  `publisher` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKsc389mtrndn4015j7xnev6lg` (`student_id`),
  CONSTRAINT `FKsc389mtrndn4015j7xnev6lg` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_publications`
--

LOCK TABLES `student_publications` WRITE;
/*!40000 ALTER TABLE `student_publications` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_publications` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `student_resumes`
--

LOCK TABLES `student_resumes` WRITE;
/*!40000 ALTER TABLE `student_resumes` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_resumes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_skills`
--

DROP TABLE IF EXISTS `student_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_skills` (
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proficiency` enum('Fundamental','Beginner','Intermediate','Advanced','Professional') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa8d5h40mj0eesqtpvx6ci97q0` (`student_id`),
  CONSTRAINT `FKa8d5h40mj0eesqtpvx6ci97q0` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_skills`
--

LOCK TABLES `student_skills` WRITE;
/*!40000 ALTER TABLE `student_skills` DISABLE KEYS */;
INSERT INTO `student_skills` VALUES ('STU_AITS_01','d4a68ab6-dceb-11f0-a9ee-a8b13badcf00','Spring Boot','Advanced');
/*!40000 ALTER TABLE `student_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_social_links`
--

DROP TABLE IF EXISTS `student_social_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_social_links` (
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` text COLLATE utf8mb4_unicode_ci,
  `platform` enum('LinkedIn','GitHub','Portfolio','YouTube','Other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9kbdlrgp87qumonyourja8tky` (`student_id`),
  CONSTRAINT `FK9kbdlrgp87qumonyourja8tky` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_social_links`
--

LOCK TABLES `student_social_links` WRITE;
/*!40000 ALTER TABLE `student_social_links` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_social_links` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

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
  `role` enum('ADMIN','SROTS_DEV','CPH','STUDENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`username`),
  KEY `FKq8c77pl7fllv195wbwqn13375` (`college_id`),
  KEY `FKckj8lnp4hl06uc6q7f0lxlmgn` (`parent_user_id`),
  CONSTRAINT `FKckj8lnp4hl06uc6q7f0lxlmgn` FOREIGN KEY (`parent_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKq8c77pl7fllv195wbwqn13375` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (_binary '',_binary '\0','2025-12-20 09:33:56.341998','209fa463-d85f-4030-b842-816279639873',NULL,'123456789012',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,NULL,NULL,'rajesh.tpo@srm.edu',NULL,'Rajesh Kumar','$2a$10$6Mphs0CSyYgAyqm57Xvhbu1pQx.dfRO.WZ2silwR9qgrVt/oVsKgG',NULL,'SRM_CPADMIN_rajesh_tpo',NULL,'CPH'),(_binary '',NULL,NULL,'AITS_H1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Placement',NULL,'head@aits.edu',NULL,'Dr. Satyendra','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O','9876543210','satyendra_cp','{\"city\": \"Rajampet\"}','CPH'),(_binary '\0',NULL,NULL,'AITS_S1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CSE',NULL,'staff@aits.edu',NULL,'Ramesh Babu','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O','9876543211','ramesh_cp','{\"city\": \"Rajampet\"}','CPH'),(_binary '\0',NULL,NULL,'SADMIN_01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'HQ',NULL,'admin@srots.com',NULL,'Suddala Ganesh','password123','9988776655','srots_admin','{\"city\": \"Hyderabad\"}','ADMIN'),(_binary '\0',NULL,NULL,'SDEV_01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dev Team',NULL,'shuban@srots.com',NULL,'Godugu Shuban','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O','9988776644','shuban_dev','{\"city\": \"Bangalore\"}','SROTS_DEV'),(_binary '',NULL,NULL,'SRIT_H1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TPO',NULL,'head@srit.ac.in',NULL,'Prof. Raghavan','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O','9876543212','raghavan_cp','{\"city\": \"Anantapur\"}','CPH'),(_binary '\0',_binary '\0','2025-12-20 12:11:39.670403','SRM_21701A0501',NULL,'123456789012',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'ECE',NULL,'rahul@college.edu',NULL,'Rahul Sharma','$2a$10$7NhqfuNOeV306cSHttPh4.iQJ/7e63SPdc9/TGapY24zJBCDHryc2','9876543210','SRM_21701A0501',NULL,'STUDENT'),(_binary '\0',_binary '\0','2025-12-20 12:11:40.106350','SRM_22705A0402',NULL,'987654321098',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'ECE',NULL,'priya@college.edu',NULL,'Priya Reddy','$2a$10$7C0Hmd6mhUHToFMPZWkSe.7b8pvahPr6.EOtBmdKtk7qsPbA6zX1.','9123456780','SRM_22705A0402',NULL,'STUDENT'),(_binary '\0',_binary '\0','2025-12-20 11:25:35.441283','SRM_CS2023001',NULL,'123456789012',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'Computer Science',NULL,'rahul.k@example.com',NULL,'Rahul Kumar','$2a$10$mupbCPU/wCWyjyDqX741rOX5jxa4I.nFbSaG5ncMjXrr5waj/rsKW','9876543210','SRM_CS2023001',NULL,'STUDENT'),(_binary '\0',_binary '\0','2025-12-20 12:19:24.032292','SRM_SRM22CS_LAT01',NULL,'554466778899',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'CSE',NULL,'arjun.v@srm.edu',NULL,'Arjun Varma','$2a$10$gqnGax0EFHXMguaadInd.etMbHLIu99Fr3hHLlzkTjLo8KXevloTG','9988776655','SRM_SRM22CS_LAT01',NULL,'STUDENT'),(NULL,NULL,NULL,'STU_AITS_01',NULL,NULL,NULL,NULL,NULL,NULL,'d4946f07-dceb-11f0-a9ee-a8b13badcf00',NULL,NULL,NULL,'harendra@aits.edu',NULL,'Neeluru Harendra','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O',NULL,'AITS_20701A0379',NULL,'STUDENT'),(NULL,NULL,NULL,'STU_SRIT_01',NULL,NULL,NULL,NULL,NULL,NULL,'d494bdff-dceb-11f0-a9ee-a8b13badcf00',NULL,NULL,NULL,'rahul@srit.ac.in',NULL,'Rahul Verma','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O',NULL,'SRIT_214G1A0101',NULL,'STUDENT');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-25 11:09:47
