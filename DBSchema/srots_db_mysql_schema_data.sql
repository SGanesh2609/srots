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
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES ('2025-12-29 14:35:26.011789','SRM_21701A0501','Online Coding Challenge Cleared','2aa6a0d5-4234-429d-b694-047b267c1266','04d78810-4c2b-437a-af69-f0e1cb2b30d6','Shortlisted',1,NULL,NULL),('2026-02-16 04:49:16.080598','SRM_21701A0501','Hired','3a879f0f-af66-4292-b87a-556ffac81847','2ad372ce-b516-44ea-9d82-93e72c4ab710','Hired',4,NULL,NULL),('2025-12-28 12:51:39.224458','SRM_22705A0402','Rejected in Aptitude Test','5b438b97-d5e4-4a79-9a90-f6d4a1732c9b','c3378b2d-255a-4945-b007-8e74973f301a','Rejected',1,NULL,NULL),('2025-12-29 14:35:52.813674','SRM_22705A0402','Rejected in Online Coding Challenge','7e77e6d0-cb91-4601-b158-b94fa7a311e3','04d78810-4c2b-437a-af69-f0e1cb2b30d6','Rejected',1,NULL,NULL),('2025-12-28 07:51:26.372579','SRM_21701A0501','Hired','90e1f416-2f84-4abe-a92e-386cbfd6db72','c3378b2d-255a-4945-b007-8e74973f301a','Hired',4,NULL,NULL),('2026-02-16 04:51:58.661380','SRM_22705A0402','Rejected in Technical Interview (Frontend Focus)','978f4b27-5b9c-4392-9906-eb66d3663358','2ad372ce-b516-44ea-9d82-93e72c4ab710','Rejected',2,NULL,NULL),('2025-12-19 20:33:09.000000','STU_AITS_01','Interviewing','d4a8e1e7-dceb-11f0-a9ee-a8b13badcf00','d49eb259-dceb-11f0-a9ee-a8b13badcf00','Shortlisted',NULL,NULL,NULL);
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `audit_events`
--

LOCK TABLES `audit_events` WRITE;
/*!40000 ALTER TABLE `audit_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_events` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'SOFT_DELETE','Course deactivated by Admin','srots_admin','2041ce74-99c8-42a3-b84b-57fe6a3f4316','Core Java','2026-01-23 11:30:35.099008'),(2,'SOFT_DELETE','Course deactivated by Admin','srots_admin','2041ce74-99c8-42a3-b84b-57fe6a3f4316','Core Java','2026-01-23 11:32:25.947976'),(3,'HARD_DELETE','Course permanently removed from database','srots_admin','d4a9d40c-dceb-11f0-a9ee-a8b13badcf00','Master SQL','2026-01-23 12:02:19.958822'),(4,'SOFT_DELETE','Course deactivated by Admin','srots_admin','2041ce74-99c8-42a3-b84b-57fe6a3f4316','Core Java','2026-01-28 13:11:21.596669'),(5,'SOFT_DELETE','Course deactivated by Admin','srots_admin','d90c415b-4ee8-46a6-ab16-7963ca23fb98','Java Spring Boot for Microservices','2026-01-28 16:51:29.881314'),(6,'HARD_DELETE','Course permanently removed from database','srots_admin','d90c415b-4ee8-46a6-ab16-7963ca23fb98','Java Spring Boot for Microservices','2026-01-28 16:51:33.137027');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
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
  KEY `idx_subscription_college` (`college_id`),
  KEY `idx_subscription_company` (`company_id`),
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
INSERT INTO `college_company_subscriptions` VALUES (NULL,'srm-uuid-9999-8888-777777777777','ff9263e9-13da-4fd3-bf46-4f9f04316ee2');
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
  `active` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_a93ugma3st6063ucmj2dsopyt` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colleges`
--

LOCK TABLES `colleges` WRITE;
/*!40000 ALTER TABLE `colleges` DISABLE KEYS */;
INSERT INTO `colleges` VALUES ('2026-02-18 18:30:43.463801','2026-02-20 03:32:15.347880','MBU','mbu@gmail.com','0d434b55-4711-4cfd-9b35-9eaa3b54522b','2223466677','/api/v1/files/MBU/logo/3352b23e-c19d-49c9-bd20-7af85a54f200_Ganesh.jpg','MOHAN BABU UNIVERSITY','6309578934','Engineering','null','{\"zip\": \"515405\", \"city\": \"Ananthapur\", \"state\": \"Andhra Pradesh\", \"mandal\": \"Pedda Vadagur\", \"country\": \"India\", \"village\": \"Chinnavadugur\", \"addressLine1\": \"1-70,Kota Veedhi,Peddavaduguru\", \"addressLine2\": \"\"}',NULL,'null',_binary ''),('2025-12-20 18:21:43.425960','2026-02-18 18:03:31.021731','IITB','admin@iitb.ac.in','3d40f097-6193-41df-b5f5-73ea41e5d0e2','022-1234567',NULL,'Indian Institute of Technology Bombay','02225722545','Engineering','[{\"id\": \"sec_1\", \"image\": \"https://srots-bucket.s3.amazonaws.com/iitb/placements.jpg\", \"title\": \"Placement Excellence\", \"content\": \"IITB has a stellar record of 100% placements with top global recruiters.\"}, {\"id\": \"sec_2\", \"image\": \"https://srots-bucket.s3.amazonaws.com/iitb/research.jpg\", \"title\": \"Research & Innovation\", \"content\": \"Home to over 30 research centers and state-of-the-art labs.\"}]','{\"zip\": \"400076\", \"city\": \"Mumbai\", \"state\": \"Maharashtra\", \"country\": \"India\", \"addressLine1\": \"Main Gate Rd, Powai\"}','[{\"code\": \"CSE\", \"name\": \"Computer Science and Engineering\"}]','{\"twitter\": \"https://twitter.com/iitbombay\", \"website\": \"https://www.iitb.ac.in\", \"youtube\": \"https://youtube.com/c/iitbombay\", \"facebook\": \"https://facebook.com/iitb\", \"linkedin\": \"https://linkedin.com/school/iit-bombay\", \"instagram\": \"https://instagram.com/iitbombay\"}',_binary ''),(NULL,'2026-02-18 18:03:34.036729','AITS','info@aits.edu','d4946f07-dceb-11f0-a9ee-a8b13badcf00',NULL,'https://srots.com/logos/aits.png','Annamacharya Institute of Technology and Sciences','08565251861','Engineering','[{\"id\": \"v1\", \"title\": \"Vision\", \"content\": \"To be a premier institute of technology.\"}, {\"id\": \"h1\", \"title\": \"History\", \"content\": \"Founded in 1998.\"}]','{\"zip\": \"516115\", \"city\": \"Rajampet\", \"line1\": \"New Boyanapalli\", \"state\": \"Andhra Pradesh\", \"district\": \"Kadapa\"}','[{\"code\": \"CSE\", \"name\": \"Computer Science\"}, {\"code\": \"ECE\", \"name\": \"Electronics\"}]','{\"website\": \"aitsrajampet.ac.in\", \"linkedin\": \"linkedin.com/school/aits\"}',_binary ''),(NULL,'2026-02-18 18:03:36.282309','SRIT','info@srit.ac.in','d494bdff-dceb-11f0-a9ee-a8b13badcf00',NULL,'https://srots.com/logos/srit.png','Srinivasa Ramanujan Institute of Technology','08554222333','Engineering','[{\"title\": \"Campus\", \"content\": \"Modern infrastructure and labs.\"}]','{\"city\": \"Anantapur\", \"state\": \"Andhra Pradesh\"}','[{\"code\": \"IT\", \"name\": \"Information Technology\"}]','{\"website\": \"srit.ac.in\"}',_binary ''),('2025-12-19 20:35:38.000000','2026-02-18 18:03:38.614417','SRM',NULL,'srm-uuid-9999-8888-777777777777',NULL,'/api/v1/files/SRM/logo/b0be4cd2-0673-4231-a10d-3905ff3866a5_Ganesh.jpg','SRM Institute of Science and Technology',NULL,'University','[]',NULL,'[{\"code\": \"CSE\", \"name\": \"Computer Science and Engineering\"}, {\"code\": \"ECE\", \"name\": \"Electronics and Communication Engineering\"}, {\"code\": \"AI\", \"name\": \"Artificial Intelligence\"}]','{\"twitter\": null, \"website\": \"https://www.ksrmce.ac.in/\", \"youtube\": null, \"facebook\": null, \"linkedin\": \"https://www.linkedin.com/company/ksrmceofficial/\", \"instagram\": \"https://www.instagram.com/ksrmceofficial/\", \"lastModifiedAt\": null, \"lastModifiedBy\": null}',_binary '');
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
INSERT INTO `education_records` VALUES (0,NULL,'2025','8.65','JNTUA',NULL,'SRM_20701A0536','0b7bd9c3-7b0c-4826-bc9e-8b409c40b680','SRM','Undergraduate','CGPA','[{\"sem\": 1, \"sgpa\": \"8.0\"}, {\"sem\": 2, \"sgpa\": \"8.4\"}, {\"sem\": 3, \"sgpa\": \"8.8\"}, {\"sem\": 4, \"sgpa\": \"9.4\"}]'),(0,NULL,'2019','90','ICSE',NULL,'SRM_20701A0702','0e003d75-dfa3-4c08-8f1e-ab3c71a32e79','Model School','Class 10','Percentage','[]'),(0,NULL,'2019','9.7','CBSE',NULL,'SRM_20701A0537','11b92045-c3c8-48c7-a950-21a8d6c2d0fe','Vivekanandha Global School','Class 10','CGPA','[]'),(0,NULL,'2025','8.5','University',NULL,'SRM_21701A0501','16f97dc0-1dc9-4ead-beed-1a9823e3a420','College','Undergraduate','CGPA','[{\"sem\": \"Sem 1\", \"sgpa\": 8.2}, {\"sem\": \"Sem 2\", \"sgpa\": 8.4}, {\"sem\": \"Sem 3\", \"sgpa\": 8.5}, {\"sem\": \"Sem 4\", \"sgpa\": 8.6}]'),(0,NULL,'2025','8.64','University',NULL,'SRM_20701A0701','1b36322e-4335-455f-b13b-1f1f7eb39b2a','College','Undergraduate','CGPA','[{\"sem\": \"Sem 1\", \"sgpa\": 8.2}, {\"sem\": \"Sem 2\", \"sgpa\": 8.4}, {\"sem\": \"Sem 3\", \"sgpa\": 8.6}, {\"sem\": \"Sem 4\", \"sgpa\": 8.8}, {\"sem\": \"Sem 5\", \"sgpa\": 9.2}]'),(0,NULL,'2021','95','CBSE',NULL,'SRM_21701A0501','3d38d9bc-b222-40f9-8d76-7063d338044a','DPS','Class 12','Percentage','[]'),(0,NULL,'2025','9.20','University',NULL,'SRM_20701A0702','475e2158-0d76-432b-aaca-2d5767156a19','College','Undergraduate','CGPA','[{\"sem\": \"Sem 3\", \"sgpa\": 9.0}, {\"sem\": \"Sem 4\", \"sgpa\": 9.2}, {\"sem\": \"Sem 5\", \"sgpa\": 9.1}, {\"sem\": \"Sem 6\", \"sgpa\": 9.2}, {\"sem\": \"Sem 7\", \"sgpa\": 9.5}]'),(0,NULL,'2019','9.5','SSC',NULL,'SRM_20701A0536','4ca96876-9a27-414b-9acd-e61b4a6f5957','ZP High School','Class 10','CGPA','[]'),(0,NULL,'2020','88.0','BSEB','Science (PCM)','SRM_CS2023001','57b13843-58e9-4b74-8705-a08ea64ee546','City Junior College','Class 12','Percentage','[]'),(0,NULL,'2021','92','State Board',NULL,'SRM_20701A0701','5c1a825a-2be3-4c29-a634-33de466dd213','Govt School','Class 12','Percentage','[]'),(0,NULL,'2023','88','SBTET',NULL,'SRM_SRM22CS_LAT01','62115b19-7852-4718-b035-4217cbf9a1eb','Govt Polytechnic','Diploma','Percentage','[]'),(0,NULL,'2020','9.5','SSC',NULL,'SRM_SRM22CS_LAT01','6410d940-c9da-46d7-a310-b86d9b2bcbbd','ZPHS School','Class 10','CGPA','[]'),(0,NULL,'2019','9.8','CBSE',NULL,'SRM_21701A0501','76f3455b-26e1-495e-aad6-be9e50c09640','DPS','Class 10','CGPA','[]'),(0,NULL,'2026','8.6','University',NULL,'SRM_SRM22CS_LAT01','7796c158-3b1f-46d4-ab55-16f3b6dfbdfe','SRM Institute','Undergraduate','CGPA','[{\"sem\": \"Sem 3\", \"sgpa\": 8.5}, {\"sem\": \"Sem 4\", \"sgpa\": 8.2}, {\"sem\": \"Sem 5\", \"sgpa\": \"9.0\"}]'),(0,NULL,'2026','8.80','University',NULL,'SRM_20701A0537','7d60f77d-8a0c-459b-9820-624eada03d41','SRM Institute of Science and Technology','Undergraduate','CGPA','[{\"sem\": 1, \"sgpa\": \"8.1\"}, {\"sem\": 2, \"sgpa\": \"8.2\"}, {\"sem\": 3, \"sgpa\": \"9.0\"}, {\"sem\": 4, \"sgpa\": \"9.4\"}, {\"sem\": 5, \"sgpa\": \"9.3\"}]'),(0,NULL,'2021','9.6','BIEAP','MPC','SRM_20701A0537','889407e6-3bb2-4074-9b6b-7326d4765ee0','Vivekanandha Junior College','Class 12','CGPA','[]'),(0,NULL,'2018','92.5','CBSE','General','SRM_CS2023001','a07e2fd5-8ff3-4afb-9b4d-b545d41cb53e','St. Mary\'s School','Class 10','Percentage','[]'),(0,NULL,'2022','88','SBTET',NULL,'SRM_22705A0402','b0e98f64-1222-4e85-a247-cbf8ebff50cb','Poly','Diploma','Percentage','[]'),(0,NULL,'2024','8.5','University Board','Computer Science','SRM_CS2023001','b72ad6fe-0d68-4501-89b2-ae4ef7f17ff3','SROTS College of Tech','Undergraduate','CGPA','[{\"sem\": \"Sem 1\", \"sgpa\": 8.2}, {\"sem\": \"Sem 2\", \"sgpa\": 8.8}]'),(1,NULL,'2025','8.2','University',NULL,'SRM_22705A0402','b7b2f10e-2704-4912-912d-eb89b8af2ac6','College','Undergraduate','CGPA','[{\"sem\": \"Sem 3\", \"sgpa\": 8.0}, {\"sem\": \"Sem 4\", \"sgpa\": 8.1}, {\"sem\": \"Sem 5\", \"sgpa\": 8.3}, {\"sem\": \"Sem 6\", \"sgpa\": 8.4}]'),(0,NULL,'2019','95','CBSE',NULL,'SRM_20701A0701','c39dce14-27e8-43d3-bda0-5ebd5b4b7fe8','St. Marys','Class 10','Percentage','[]'),(NULL,85.50,NULL,'8.5','JNTUA',NULL,'STU_AITS_01','d49db5a4-dceb-11f0-a9ee-a8b13badcf00','AITS','Undergraduate','CGPA','[{\"sem\": 1, \"sgpa\": \"8.2\"}, {\"sem\": 2, \"sgpa\": \"8.8\"}]'),(NULL,94.00,NULL,'940','BIEAP',NULL,'STU_AITS_01','d49dca53-dceb-11f0-a9ee-a8b13badcf00','Narayana','Class 12','Marks',NULL),(0,NULL,'2019','9.5','SSC',NULL,'SRM_22705A0402','e024c573-6665-4066-9e49-33eaeae81ab2','ZPHS','Class 10','CGPA','[]'),(0,NULL,'2021','85','Technical Board',NULL,'SRM_20701A0702','e046ee42-6760-4ab8-a5d5-510d6b4daf06','Polytechnic','Diploma','Percentage','[]'),(0,NULL,'2021','940/1000','BIEAP','MPC','SRM_20701A0536','f8ca76a6-b790-4919-b7b3-f5ee54d7a4ac','Chaitanya Jr College','Class 12','Marks','[]');
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
INSERT INTO `events` VALUES ('2026-02-08','11:49:00.000000','2026-02-08','10:49:00.000000','2026-02-08 08:49:23.251480','srm-uuid-9999-8888-777777777777','209fa463-d85f-4030-b842-816279639873','come and join us before start','3bf8a6a8-6c26-4e46-b4fe-4e7c27c5336b','[]','[\"All\"]','[]','Resume','Workshop'),('2026-02-10','10:30:00.000000','2026-02-10','08:30:00.000000','2026-02-10 03:24:31.445317','srm-uuid-9999-8888-777777777777','fbf94be1-0f0b-4f3a-af87-1191d679e9f3','please participate','55e3de4f-4b7e-4aaf-8c6a-405323fc7dcd','[]','[\"All\"]','[]','TCS','Drive'),('2026-02-09','11:00:00.000000','2026-02-09','04:00:00.000000','2026-02-08 10:49:24.713707','srm-uuid-9999-8888-777777777777','fbf94be1-0f0b-4f3a-af87-1191d679e9f3','Participate int hiring','ee781056-0031-44f4-b2d0-d63639b226a3','[]','[\"All\"]','[]','ITC Infotech','Drive');
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
-- Dumping data for table `free_courses`
--

LOCK TABLES `free_courses` WRITE;
/*!40000 ALTER TABLE `free_courses` DISABLE KEYS */;
INSERT INTO `free_courses` VALUES ('2026-01-23 11:24:57.042143','SADMIN_01','Deep insights about core java it helps to go for the advance skills enhance','2041ce74-99c8-42a3-b84b-57fe6a3f4316','https://www.youtube.com/watch?v=prfwlnq2vJY','Core Java','Suddala Ganesh','Java','YOUTUBE','ACTIVE','2026-01-28 13:11:24.240325'),('2026-01-23 12:01:38.992635','SADMIN_01','It hepls to get more knowledge about python','4e7143de-ca39-413c-806c-534d92213d8b','https://www.udemy.com/course/django-python-advanced/','Advanced Python','Suddala Ganesh','Python','UDEMY','ACTIVE','2026-01-28 13:11:09.299348'),('2026-01-28 16:53:11.049500','SADMIN_01','Helps you to get more insights of how the application is always available with less down time','93a74ee0-5c41-437a-9892-8f0ad9389981','https://www.youtube.com/watch?v=gJrjgg1KVL4','Java Spring Boot for Microservice','Suddala Ganesh','Spring Boot','YOUTUBE','ACTIVE',NULL);
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
  UNIQUE KEY `UK_iasmhl19ooshyy8o77odhlobk` (`name`),
  KEY `idx_company_name` (`name`),
  KEY `idx_company_headquarters` (`headquarters`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_companies`
--

LOCK TABLES `global_companies` WRITE;
/*!40000 ALTER TABLE `global_companies` DISABLE KEYS */;
INSERT INTO `global_companies` VALUES ('0a969c7a-f564-42ae-8ec3-a11377e3b9ee','{\"zip\": \"400001\", \"city\": \"Mumbai\", \"state\": \"Maharashtra\", \"mandal\": \"Mumbai\", \"country\": \"India\", \"village\": \"Bazargate\", \"addressLine1\": \"TCS House, Raveline Street, Fort\", \"addressLine2\": \"\"}','Company which take so many fresher from colleges every year','TCS House, Raveline Street, Fort, Mumbai, Maharashtra, India','Mumbai',NULL,'TCS','https://www.tcs.com/'),('2087e1c1-0a43-4b84-8aa3-9cfe55d97e86','{\"zip\": \"560005\", \"city\": \"Bangalore\", \"state\": \"Karnataka\", \"mandal\": \"Bangalore North\", \"country\": \"India\", \"village\": \"Fraser Town\", \"addressLine1\": \"Maruthi Sevanagar\", \"addressLine2\": \"\"}','Which is fastest growing Company','Maruthi Sevanagar, Bangalore, Karnataka, India','Bangalore',NULL,'ITC Infotech','https://www.itcinfotech.com'),('ff9263e9-13da-4fd3-bf46-4f9f04316ee2','{\"zip\": \"400001\", \"city\": \"Mumbai\", \"state\": \"Maharashtra\", \"mandal\": \"Mumbai\", \"country\": \"India\", \"village\": \"Bazargate\", \"addressLine1\": \"TCS House, Raveline Street, Fort\", \"addressLine2\": \"\"}','Updated description for search giant.','TCS House, Raveline Street, Fort, Mumbai, Maharashtra, India','Mumbai',NULL,'Google LLC','https://about.google');
/*!40000 ALTER TABLE `global_companies` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `job_rounds`
--

LOCK TABLES `job_rounds` WRITE;
/*!40000 ALTER TABLE `job_rounds` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_rounds` ENABLE KEYS */;
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
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (_binary '','2026-02-15',_binary '\0',3,2,60.00,60.00,0.00,6.00,'2025-12-29 05:36:36.518015','209fa463-d85f-4030-b842-816279639873','srm-uuid-9999-8888-777777777777','','InnovateCorp Solutions','','https://innovatecorp.io/careers/dev-99','Percentage','Percentage','Percentage','Percentage','Product Engineering','04d78810-4c2b-437a-af69-f0e1cb2b30d6','JOB-2025-084','Bengaluru, Whitefield','','8 LPA - 14 LPA','We are seeking a proactive developer to help build and scale our next-generation fintech dashboard.','Full Stack Developer','[\"Computer Science\", \"Information Technology\", \"ECE\"]','[{\"url\": \"/api/v1/files/SRM/jobs/04d78810-4c2b-437a-af69-f0e1cb2b30d6/652d6d06-a986-4505-b50b-374e11b620e0_20701A0536-Cloud Computing - Foundation Credential.pdf\", \"name\": \"20701A0536-Cloud Computing - Foundation Credential.pdf\"}]','[\"Flexible Working Hours\", \"Annual Learning Stipend\", \"Gym Membership Reimbursement\"]','[2024, 2025, 2026]',NULL,'Full_Time','[\"\"]','[\"B.E/B.Tech in Computer Science or related fields\", \"Strong understanding of JavaScript (ES6+), HTML5, and CSS3\"]','[\"fullName\", \"rollNumber\", \"personalEmail\", \"phone\", \"btech.cgpa\", \"class10.percentage\", \"class12.percentage\", \"gender\"]','[\"Develop and maintain responsive user interfaces using React.js\", \"Build robust RESTful APIs using Node.js and Express\", \"Collaborate with UX/UI designers to implement design mockups\"]','[{\"name\": \"Online Coding Challenge\", \"order\": 1}, {\"name\": \"Technical Interview (Frontend Focus)\", \"order\": 2}, {\"name\": \"Technical Interview (Backend & Database)\", \"order\": 3}, {\"name\": \"Cultural Fit Round\", \"order\": 4}]','Active','Remote',NULL,NULL,NULL,NULL,NULL,'2026-02-20 18:00:05.399139',NULL,NULL,'209fa463-d85f-4030-b842-816279639873'),(_binary '','2026-02-27',_binary '',2,2,6.50,6.50,6.48,65.00,'2026-02-18 14:19:03.186300','fbf94be1-0f0b-4f3a-af87-1191d679e9f3','srm-uuid-9999-8888-777777777777','','Srots CPH','','','CGPA','CGPA','CGPA','Percentage','Cloud Infrastructure','1de7bb2e-2ccf-4db0-bc0e-7c4052a38d15','','Bangaluru','','8-12LPA','Come and join with us for better future','Senior Software Enginner','[\"CSE\", \"ECE\"]',NULL,'[\"\"]','[2026, 2025, 2027]',NULL,'Internship','[\"\"]','[\"CSE in BTECH\"]','[\"fullName\", \"rollNumber\", \"branch\", \"resumes\", \"class10.percentage\", \"btech.cgpa\", \"diploma.percentage\", \"class12.cgpa\"]','[\"Work with Clients\"]','[{\"date\": \"2026-03-02\", \"name\": \"Online Assessment\", \"status\": \"Pending\"}]','Active','On_Site',NULL,NULL,NULL,NULL,NULL,'2026-02-20 17:16:30.816105',NULL,NULL,'209fa463-d85f-4030-b842-816279639873'),(_binary '','2026-04-15',_binary '\0',3,2,70.00,70.00,60.00,7.50,'2026-02-16 04:38:04.503755','209fa463-d85f-4030-b842-816279639873','srm-uuid-9999-8888-777777777777','','InnovateCorp Solutions','','https://innovatecorp.io/careers/dev-99','Percentage','Percentage','Percentage','CGPA','Product Engineering','2ad372ce-b516-44ea-9d82-93e72c4ab710','JOB-2025-084','Bengaluru, Whitefield','','10 LPA - 14 LPA','We are seeking a proactive developer to help build and scale our next-generation fintech dashboard.','Full Stack Developer With Gen AI AND Cloud','[\"Computer Science\", \"Information Technology\", \"ECE\"]','[{\"url\": \"/api/v1/files/SRM/jobs/4cd154cc-e08d-4bbd-b01b-7ed96499cc0f/95932966-c92c-40f9-b3e4-cab5fafc2fc1_20F21A04G3-CSP.pdf\", \"name\": \"20F21A04G3-CSP.pdf\"}]','[\"Flexible Working Hours\", \"Annual Learning Stipend\", \"Gym Membership Reimbursement\"]','[2025, 2026]',NULL,'Full_Time','[\"\"]','[\"B.E/B.Tech in Computer Science or related fields\", \"Strong understanding of JavaScript (ES6+), HTML5, and CSS3\"]','[]','[\"Develop and maintain responsive user interfaces using React.js\", \"Build robust RESTful APIs using Node.js and Express\", \"Collaborate with UX/UI designers to implement design mockups\"]','[{\"date\": \"2026-02-02\", \"name\": \"Online Coding Challenge\", \"order\": 1, \"status\": \"Completed\"}, {\"date\": \"2026-02-05\", \"name\": \"Technical Interview (Frontend Focus)\", \"order\": 2, \"status\": \"Completed\"}, {\"date\": \"2026-02-11\", \"name\": \"Technical Interview (Backend & Database)\", \"order\": 3, \"status\": \"Completed\"}, {\"date\": \"2026-02-12\", \"name\": \"Cultural Fit Round\", \"order\": 4, \"status\": \"Completed\"}]','Active','Remote',NULL,NULL,NULL,NULL,NULL,'2026-02-20 18:06:16.702734',NULL,NULL,'209fa463-d85f-4030-b842-816279639873'),(_binary '\0','2025-12-30',_binary '\0',0,0,80.00,80.00,NULL,7.50,'2025-12-23 16:43:16.434603','209fa463-d85f-4030-b842-816279639873','srm-uuid-9999-8888-777777777777','We value innovation, inclusion, and continuous learning.','Google',NULL,'https://careers.google.com/jobs/...',NULL,NULL,NULL,NULL,'Engineering','6829288c-cdc2-4074-a00b-a9dcd2023b10','G-CAMPUS-2025','Bangalore, KA',NULL,'12 - 18 LPA','We are looking for passionate graduates to join our Cloud Infrastructure team. You will work on high-scale distributed systems.','Associate Software Engineer','[\"CSE\", \"IT\", \"ECE\"]','[{\"url\": \"/api/v1/files/SRM/JOB_ATTACHMENTS/eb2df6c0-2272-4e6c-9d66-2a11c19684fa_GratuityForm.pdf\", \"name\": \"GratuityForm.pdf\"}]','[\"Comprehensive Health Insurance\", \"Annual Performance Bonus\", \"Relocation Assistance\"]','[\"2024\", \"2025\"]','[\"21701A0501\"]','Full_Time','[\"Prior internship experience in product-based companies\", \"Knowledge of Cloud platforms (GCP/AWS)\"]','[\"B.Tech in Computer Science or related field\", \"Strong understanding of Data Structures & Algorithms\", \"Proficiency in Java or Python\"]','[\"fullName\", \"rollNumber\", \"instituteEmail\", \"phone\", \"btech.cgpa\", \"resumes\", \"class10.percentage\", \"class12.percentage\", \"gender\"]','[\"Develop and maintain scalable web applications\", \"Collaborate with cross-functional teams\", \"Write clean, documented, and testable code\"]','[{\"date\": \"2026-01-05\", \"name\": \"Aptitude Test\", \"status\": \"Pending\"}, {\"date\": \"2025-01-10\", \"name\": \"Technical Interview 1\", \"status\": \"Pending\"}, {\"date\": \"2025-01-15\", \"name\": \"HR Interview\", \"status\": \"Pending\"}]','Active','Hybrid',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(_binary '','2026-04-15',_binary '\0',3,2,70.00,70.00,NULL,7.50,'2026-02-16 04:01:50.935414','209fa463-d85f-4030-b842-816279639873','srm-uuid-9999-8888-777777777777',NULL,'InnovateCorp Solutions',NULL,'https://innovatecorp.io/careers/dev-99','Percentage','Percentage',NULL,'CGPA','Product Engineering','ba8eb2f0-18ad-4d9a-9e02-5dc6737b890e','JOB-2025-084','Bengaluru, Whitefield',NULL,'10 LPA - 14 LPA','We are seeking a proactive developer to help build and scale our next-generation fintech dashboard.','Full Stack Developer With Gen AI','[\"Computer Science\", \"Information Technology\", \"ECE\"]','[{\"url\": \"/api/v1/files/SRM/jobs/19b17041-db03-4d9d-bf98-23a2a4ff2573/0a4fbd1d-3d19-4e3e-b7ac-fdda8dffabf1_202425_SmallProjectRefDef_v2.pdf\", \"name\": \"202425_SmallProjectRefDef_v2.pdf\"}]','[\"Flexible Working Hours\", \"Annual Learning Stipend\", \"Gym Membership Reimbursement\"]','[\"2025\", \"2026\"]',NULL,'Full_Time',NULL,'[\"B.E/B.Tech in Computer Science or related fields\", \"Strong understanding of JavaScript (ES6+), HTML5, and CSS3\"]','[\"fullName\", \"rollNumber\", \"personalEmail\", \"phoneNumber\", \"btech.cgpa\"]','[\"Develop and maintain responsive user interfaces using React.js\", \"Build robust RESTful APIs using Node.js and Express\", \"Collaborate with UX/UI designers to implement design mockups\"]','[{\"name\": \"Online Coding Challenge\", \"order\": 1}, {\"name\": \"Technical Interview (Frontend Focus)\", \"order\": 2}, {\"name\": \"Technical Interview (Backend & Database)\", \"order\": 3}, {\"name\": \"Cultural Fit Round\", \"order\": 4}]','Active','Remote',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(_binary '','2026-01-31',_binary '',3,1,60.00,60.00,60.00,6.00,'2025-12-27 17:49:31.352193','209fa463-d85f-4030-b842-816279639873','srm-uuid-9999-8888-777777777777','Fast-paced, innovation-driven, and inclusive environment.','Global Tech Solutions','We are an equal opportunity employer.','https://careers.globaltech.com/jobs/123','Percentage','Percentage','Percentage','CGPA','Cloud & Platform Engineering','c3378b2d-255a-4945-b007-8e74973f301a','JOB-2025-001','Hyderabad, HITEC City','Standard office work.','12 LPA - 18 LPA','We are looking for a visionary architect to lead our cloud migration strategy.','Senior Software Architect','[\"Computer Science\", \"Information Technology\", \"ECE\"]','[{\"url\": \"/api/v1/files/SRM/jobs/c3378b2d-255a-4945-b007-8e74973f301a/a18400aa-2f55-405c-be71-cdd033686673_20701A0536-Cisco Cyber Security Credential.pdf\", \"name\": \"20701A0536-Cisco Cyber Security Credential.pdf\"}]','[\"Performance Bonus\", \"Health Insurance\"]','[\"2024\", \"2025\"]',NULL,'Full_Time','[\"AWS Certified Solutions Architect\"]','[\"B.Tech in CS or related field\"]','[\"fullName\", \"rollNumber\", \"instituteEmail\", \"phone\", \"btech.cgpa\"]','[\"Design scalable microservices architecture\", \"Mentor junior developers\"]','[{\"date\": \"2025-12-28\", \"name\": \"Aptitude Test\"}, {\"date\": \"2025-12-29\", \"name\": \"Technical Interview 1\"}, {\"date\": \"2025-12-30\", \"name\": \"Architectural Review\"}, {\"date\": \"2026-01-02\", \"name\": \"HR Round\"}]','Active','Hybrid',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(NULL,'2025-12-01',NULL,0,NULL,75.00,75.00,NULL,8.00,NULL,'AITS_H1','d4946f07-dceb-11f0-a9ee-a8b13badcf00',NULL,'Google',NULL,NULL,NULL,NULL,NULL,NULL,'Google Cloud Platform','d49eb259-dceb-11f0-a9ee-a8b13badcf00',NULL,'Hyderabad',NULL,'18 LPA','Looking for backend experts.','Software Development Engineer','[\"CSE\", \"ECE\"]',NULL,NULL,'[2025]',NULL,'Full_Time',NULL,'[\"Java Knowledge\", \"Problem Solving\"]',NULL,'[\"API Design\", \"Cloud Infrastructure\"]','[{\"name\": \"Aptitude\", \"step\": 1}, {\"name\": \"Technical\", \"step\": 2}, {\"name\": \"HR\", \"step\": 3}]','Active','Hybrid',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(_binary '\0','2025-12-30',_binary '\0',0,0,80.00,80.00,NULL,7.50,'2025-12-23 16:56:59.487133','209fa463-d85f-4030-b842-816279639873','srm-uuid-9999-8888-777777777777','We value innovation, inclusion, and continuous learning.','Google',NULL,'https://careers.google.com/jobs/...',NULL,NULL,NULL,NULL,'Engineering','e7dcba3f-095a-496e-9eaa-00edfa9a3ca8','G-CAMPUS-2025','Bangalore, KA',NULL,'12 - 18 LPA','We are looking for passionate graduates to join our Cloud Infrastructure team. You will work on high-scale distributed systems.','Associate Software Engineer ||','[\"CSE\", \"IT\", \"ECE\"]','[{\"url\": \"/api/v1/files/SRM/JOB_ATTACHMENTS/f32e954c-e1e8-4fb3-a3fe-a22df7a45510_MANU3.jpg\", \"name\": \"MANU3.jpg\"}]','[\"Comprehensive Health Insurance\", \"Annual Performance Bonus\", \"Relocation Assistance\"]','[\"2024\", \"2025\"]','[\"21701A0501\"]','Full_Time','[\"Prior internship experience in product-based companies\", \"Knowledge of Cloud platforms (GCP/AWS)\"]','[\"B.Tech in Computer Science or related field\", \"Strong understanding of Data Structures & Algorithms\", \"Proficiency in Java or Python\"]','[\"fullName\", \"rollNumber\", \"instituteEmail\", \"phone\", \"btech.cgpa\", \"resumes\", \"class10.percentage\", \"class12.percentage\", \"gender\"]','[\"Develop and maintain scalable web applications\", \"Collaborate with cross-functional teams\", \"Write clean, documented, and testable code\"]','[{\"date\": \"2026-01-05\", \"name\": \"Aptitude Test\", \"status\": \"Pending\"}, {\"date\": \"2025-01-10\", \"name\": \"Technical Interview 1\", \"status\": \"Pending\"}, {\"date\": \"2025-01-15\", \"name\": \"HR Interview\", \"status\": \"Pending\"}]','Active','Hybrid',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
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
INSERT INTO `post_likes` VALUES ('84484f02-3f21-4b18-b7aa-e3249371228f','fbf94be1-0f0b-4f3a-af87-1191d679e9f3'),('fcdc795b-b8a5-4106-9758-f137fa6d0d2b','SRM_21701A0501'),('fd9b88d8-51eb-48ef-9a02-b36190f790bf','SRM_21701A0501');
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
INSERT INTO `posts` VALUES ('84484f02-3f21-4b18-b7aa-e3249371228f','srm-uuid-9999-8888-777777777777','fbf94be1-0f0b-4f3a-af87-1191d679e9f3','hi guyes!','[\"/api/v1/files/srm-uuid-9999-8888-777777777777/IMAGES/7fa1c6bb-5345-41d1-ad34-8fe9427f8128_Ganesh.jpg\"]','[]',1,_binary '\0','2026-02-13 05:04:37.382889',0),('fcdc795b-b8a5-4106-9758-f137fa6d0d2b','srm-uuid-9999-8888-777777777777','fbf94be1-0f0b-4f3a-af87-1191d679e9f3','Happy to share our views happy diwali','[]','[]',1,_binary '\0','2026-02-13 03:04:17.717607',0),('fd9b88d8-51eb-48ef-9a02-b36190f790bf','srm-uuid-9999-8888-777777777777','209fa463-d85f-4030-b842-816279639873','We are exited to share our views','[\"/api/v1/files/undefined/undefined/930625b9-9eb9-433f-b06e-84dbbd3649fd_Ganesh.jpg\", \"/api/v1/files/undefined/undefined/49be651d-2472-457c-8ecb-1a9532a81ad8_kubectlgetsvc.png\"]','[]',1,_binary '\0','2026-02-13 02:57:53.223316',0);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `premium_payment_data`
--

LOCK TABLES `premium_payment_data` WRITE;
/*!40000 ALTER TABLE `premium_payment_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `premium_payment_data` ENABLE KEYS */;
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
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `communication_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `idx_student_profile_batch` (`batch`),
  KEY `idx_student_profile_branch` (`branch`),
  KEY `idx_student_profile_batch_branch` (`batch`,`branch`),
  CONSTRAINT `FK32koy3tgqtaujxhfsn0b9pel2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
INSERT INTO `student_profiles` VALUES (2025,_binary '\0','2003-05-15',_binary '\0',NULL,NULL,'2027-07-02','2026-01-02','2026-01-02 18:11:10.003790','SRM_20701A0536',NULL,'Mrs. Shanti','CSE',NULL,'Mr. Prasad','B.Tech',NULL,'Rajesh Kumar',NULL,NULL,NULL,NULL,'Dr. Ramesh (HOD)','Sunitha Devi',NULL,'Indian',NULL,'9988776655',NULL,NULL,'2025-2026','Hindu','20701A0536',NULL,'{}','MALE','{}',NULL,'20701a0501@aits.edu',NULL),(2026,_binary '\0','2002-04-05',_binary '\0',NULL,NULL,'2027-08-22','2026-02-22','2026-02-22 11:30:10.189821','SRM_20701A0537',NULL,'S.Shashi','CSE',NULL,'S.Shashi','B.Tech',NULL,'','',NULL,NULL,NULL,'S.Shashi','','','Indian','','',NULL,'pavanireddy1504@gmail.com','2025-2026','Hindu','20701A0537','','{}','FEMALE','{}',NULL,'pavanireddy1239@gmail.com',NULL),(2025,_binary '\0','2003-05-15',_binary '\0',NULL,NULL,'2027-08-23','2026-02-23','2026-02-23 15:54:09.237168','SRM_20701A0701',NULL,'Prof. Grace','CSE',NULL,'Mr. Bond','B.Tech',NULL,'Robert Doe','Engineer',NULL,NULL,NULL,'Dr. Smith','Mary Doe','Teacher','Indian','parent@gmail.com','9123456789',NULL,'john.personal@gmail.com',NULL,'Christian','20701A0701','9876543210','{}','MALE','{}',NULL,'john.d@college.edu',NULL),(2025,_binary '\0','2003-08-20',_binary '\0',NULL,NULL,'2027-08-23','2026-02-23','2026-02-23 15:54:09.665541','SRM_20701A0702',NULL,'Prof. Khan','ECE',NULL,'Mr. Lee','B.Tech',NULL,'Samuel Smith','Business',NULL,NULL,NULL,'Dr. Ray','Linda Smith','HomeMaker','Indian','p.smith@gmail.com','9112233445',NULL,'jane.p@gmail.com',NULL,'Hindu','20701A0702','9988776655','{}','FEMALE','{}',NULL,'jane.s@college.edu',NULL),(2025,_binary '\0','2003-05-15',_binary '',NULL,NULL,NULL,NULL,'2026-02-25 03:03:31.238764','SRM_21701A0501',NULL,'Prof.Grace','ECE','Placement Cell','Ms. Kapoor','B.Tech','KA-01-2023-1234567','Ganganna','Farmer','2 years','Worked on a startup and traveled','https://www.linkedin.com/in/johndoe123','Prof. Rao','Saraswathi','HouseWife','Indian','ganganna1239@gmail.com','7674058543','asbdjhabfhafbh','john.doe.personal@example.com','2025-2026','Hindu','21701A0501','9876543210','{\"zip\": \"515405\", \"city\": \"Ananthapur\", \"state\": \"Andhra Pradesh\", \"mandal\": \"Pedda Vadagur\", \"country\": \"India\", \"village\": \"Chinnavadugur\", \"addressLine1\": \"Kota Veedhi\", \"addressLine2\": \"\"}','MALE','{\"zip\": \"515405\", \"city\": \"Ananthapur\", \"state\": \"Andhra Pradesh\", \"mandal\": \"Pedda Vadagur\", \"country\": \"India\", \"village\": \"Chinnavadugur\", \"addressLine1\": \"Kota Veedhi\", \"addressLine2\": \"\"}','WhatsApp','rahul@college.edu','rahul@college.edu'),(2025,_binary '\0','2003-08-20',_binary '\0',NULL,NULL,'2026-03-05','2024-09-05','2025-12-20 12:11:40.114767','SRM_22705A0402',NULL,'','ECE',NULL,'Mr. John','B.Tech',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'22705A0402','9123456780','null','FEMALE','null',NULL,'priya@college.edu',NULL),(2023,_binary '\0','2002-05-15',_binary '\0',NULL,NULL,NULL,NULL,'2025-12-20 11:25:35.498405','SRM_CS2023001',NULL,'Prof. Alan','CSE',NULL,'Ms. Sarah','B.Tech',NULL,NULL,NULL,NULL,NULL,NULL,'Dr. Smith',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-27',NULL,'CS2023001','9876543210','{\"city\": \"Bengaluru\", \"line1\": \"Hostel Block A\"}','MALE','{\"city\": \"Patna\", \"line1\": \"123 Village St\"}',NULL,'rahul.k@college.edu.in',NULL),(2026,_binary '\0','2003-04-12',_binary '\0',NULL,NULL,'2027-07-04','2026-01-04','2026-01-04 02:42:21.430583','SRM_SRM22CS_LAT01',NULL,NULL,'CSE',NULL,NULL,'B.Tech',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Indian',NULL,NULL,NULL,NULL,NULL,'Hindu','SRM22CS_LAT01','9988776655','{}','MALE','{}',NULL,'arjun.v@srm.edu',NULL),(2025,NULL,'2001-08-20',NULL,NULL,NULL,NULL,NULL,NULL,'STU_AITS_01','1234-5678-9012',NULL,'CSE',NULL,NULL,'B.Tech',NULL,'Ravi',NULL,NULL,NULL,NULL,NULL,'Lakshmi',NULL,NULL,NULL,NULL,NULL,'harendra.p@gmail.com','2024-25',NULL,'20701A0379','9876543210','{\"city\": \"Rajampet\", \"state\": \"AP\"}','MALE','{\"city\": \"Rajampet\", \"state\": \"AP\"}',NULL,NULL,NULL),(2025,NULL,'2002-05-15',NULL,NULL,NULL,NULL,NULL,NULL,'STU_SRIT_01','4321-8765-0987',NULL,'IT',NULL,NULL,'B.Tech',NULL,'Arjun',NULL,NULL,NULL,NULL,NULL,'Sita',NULL,NULL,NULL,NULL,NULL,'rahul.v@gmail.com','2024-25',NULL,'214G1A0101','9876543211','{\"city\": \"Anantapur\"}','MALE','{\"city\": \"Anantapur\"}',NULL,NULL,NULL);
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
INSERT INTO `student_resumes` VALUES (_binary '','2025-12-27 08:30:24.692130','SRM_21701A0501','SuddalaGaneshResume.pdf','/api/v1/files/resumes/students/5e3c433b-2bca-4cf8-b390-6346826378b4_SuddalaGaneshResume.pdf','6c81265f-c599-43a0-b47d-13e9fb63c776');
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
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `student_skills` VALUES ('SRM_21701A0501','4565a2ae-fd2a-4bf3-9423-564f017b46cc','Java','Beginner'),('STU_AITS_01','d4a68ab6-dceb-11f0-a9ee-a8b13badcf00','Spring Boot','Advanced');
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
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
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

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (_binary '\0',_binary '\0','2026-01-29 15:33:46.350473','1b595a05-b17b-49f0-a429-7879aaa8f745',NULL,'884707664414','praveen.dev@gmail.com','9988776655',NULL,'Senior Backend Developer specializing in Java Spring Boot and Cloud Infrastructure.',NULL,NULL,'Software Engineering',NULL,'praveen.mohan@srots.com',NULL,'Praveen Mohan Updated','$2a$10$Hvdqem7b5wHwd.OOGfJHA.ZMtwShfSR0nH6p4oI6Hw8cDX8fMcn9G','6309522697','DEV_Praveen','{\"zip\": \"515405\", \"city\": \"Ananthapur\", \"state\": \"Andhra Pradesh\", \"country\": \"India\", \"village\": \"Chinnavadugur\", \"addressLine1\": \"BC Colony\"}','SROTS_DEV','2026-02-20 03:31:10.081111',NULL,NULL,'Edge on Windows',0,NULL,NULL),(_binary '',_binary '\0','2025-12-20 09:33:56.341998','209fa463-d85f-4030-b842-816279639873',NULL,'123456789012','rajesh.kumar.srm@gmail.com','9123456789',NULL,'Heading the Placement Department at SRM. 10 years of experience in corporate relations and student mentoring.','srm-uuid-9999-8888-777777777777',NULL,'Training & Placement Cell',NULL,'sganesh1239@gmail.com',NULL,'Rajesh Kumar','$2a$10$ab3gJARmACxXDkhj/iI6wOHek2ghQn2TUNcHn8edUMvurkCYlZPgy','9876543210','SRM_CPADMIN_rajesh_tpo',NULL,'CPH','2026-02-22 03:50:17.531883',NULL,NULL,'Edge on Windows',0,NULL,NULL),(_binary '\0',_binary '\0','2026-02-24 04:06:25.548587','55139162-a20a-4a8d-8242-2f4815bf9ad6',NULL,'123456789529',NULL,NULL,'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=P+Madhu',NULL,'srm-uuid-9999-8888-777777777777',NULL,'CSE',NULL,'pmadhu1239@gmail.com',NULL,'P Madhu','$2a$10$P2mGmpCQzqZpZHJ0N2LUiefNXCQlS28sAH9SqDm8leTvF39SMb.9C','6309522445','SRM_CPSTAFF_madhu','{\"zip\": \"515405\", \"city\": \"Ananthapur\", \"state\": \"Andhra Pradesh\", \"mandal\": \"Pedda Vadagur\", \"country\": \"India\", \"village\": \"Chinnavadugur\", \"addressLine1\": \"1-70. Kota Veedhi\", \"addressLine2\": \"\"}','STAFF','2026-02-24 04:07:00.921206',NULL,NULL,NULL,0,NULL,NULL),(_binary '\0',_binary '\0','2026-01-05 06:55:00.247741','5db477b1-1aa5-4fbb-b13f-19c3d17669f8',NULL,'998877665544',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'ECE',NULL,'alice.j@college.edu',NULL,'Alice Johnson','$2a$10$kklyrusUO4lNEKx4HdZ5u.P6rOB2N4EAatFo7.mJfVtOG.z5AXN66','9876543211','SRM_CPSTAFF_STAFF102','{\"zip\": \"500001\", \"city\": \"Hyderabad\", \"state\": \"Telangana\", \"country\": \"India\", \"village\": \"North Campus\", \"addressLine1\": \"Admin Block B\"}','CPH','2026-01-05 06:55:00.247741',NULL,NULL,NULL,0,NULL,NULL),(_binary '',NULL,NULL,'AITS_H1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Placement',NULL,'head@aits.edu',NULL,'Dr. Satyendra','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O','9876543210','satyendra_cp','{\"city\": \"Rajampet\"}','CPH',NULL,NULL,NULL,NULL,0,NULL,NULL),(_binary '\0',NULL,NULL,'AITS_S1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CSE',NULL,'staff@aits.edu',NULL,'Ramesh Babu','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O','9876543211','ramesh_cp','{\"city\": \"Rajampet\"}','CPH',NULL,NULL,NULL,NULL,0,NULL,NULL),(_binary '\0',_binary '\0','2026-01-30 06:29:00.751360','fbf94be1-0f0b-4f3a-af87-1191d679e9f3',NULL,'554433221104',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'Placement & Corporate Relations',NULL,'subhangodugu07@gmail.com',NULL,'Dr. Kiran Kumar','$2a$10$yEF5qxw/7rhD0SlQ86tuxO2wjfifI282LnHBrBRkDocCrw5Zc1qXu','9848011229','SRM_CPSTAFF_kiran','{\"zip\": \"515405\", \"city\": \"Ananthapur\", \"state\": \"Andhra Pradesh\", \"country\": \"India\", \"village\": \"Chinnavadugur\", \"addressLine1\": \"Kota Veedhi\"}','STAFF','2026-02-11 04:05:59.561291',NULL,NULL,'Edge on Windows',0,NULL,NULL),(_binary '',_binary '\0','2026-01-05 06:54:59.727756','fcbe2edb-7494-4e76-b28e-d32d97c113fb',NULL,'112233445566',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'CSE',NULL,'robert.w@college.edu',NULL,'Dr. Robert Wilson','$2a$10$Rr4xDDp80V5KXHFTKn0beujJpqWU5L3/RnOsMHYFldK5pwr5eXrWO','9876543210','SRM_CPADMIN_STAFF101','{\"zip\": \"515405\", \"city\": \"Ananthapur\", \"state\": \"Andhra Pradesh\", \"country\": \"India\", \"village\": \"Chinnavadugur\", \"addressLine1\": \"Kota Veedhi\"}','CPH','2026-02-23 18:23:25.934474',NULL,NULL,NULL,0,NULL,NULL),(_binary '\0',NULL,NULL,'SADMIN_01',NULL,NULL,'','',NULL,'',NULL,NULL,'HQ',NULL,'suddalaganesh2609@gmail.com',NULL,'Suddala Ganesh','$2a$10$Etigx2RWJH6NwkHeA7hXU.3kJxtgmemdpBS0NSifIv64Orpb.DQKi','9988776655','srots_admin','{\"zip\": null, \"city\": \"Hyderabad\", \"state\": null, \"country\": null, \"village\": null, \"addressLine1\": null}','ADMIN','2026-02-22 03:57:20.627198',NULL,NULL,'Edge on Windows',0,NULL,NULL),(_binary '\0',NULL,NULL,'SDEV_01',NULL,'884707664319',NULL,NULL,NULL,NULL,NULL,NULL,'Dev Team',NULL,'subhangodugu09@gmail.com',NULL,'Godugu Shuban','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O','9988776644','shuban_dev','{\"zip\": \"515405\", \"city\": \"Ananthapur\", \"state\": \"Andhra Pradesh\", \"country\": \"India\", \"village\": \"Chinnavadugur\", \"addressLine1\": \"Kota Colony\"}','SROTS_DEV','2026-01-29 15:29:54.116774','51fd5887-b05c-477c-ba03-ae31f0a9c6f2','2026-01-29 16:29:53.942512',NULL,0,NULL,NULL),(_binary '',NULL,NULL,'SRIT_H1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TPO',NULL,'head@srit.ac.in',NULL,'Prof. Raghavan','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O','9876543212','raghavan_cp','{\"city\": \"Anantapur\"}','CPH',NULL,NULL,NULL,NULL,0,NULL,NULL),(_binary '\0',_binary '\0','2026-01-02 18:11:09.950452','SRM_20701A0536',NULL,'884707664315',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,NULL,NULL,'20701a0536@aits.edu',NULL,'Siddharth Kumar','$2a$10$Jpq.jw8u8fljspavsGtFWewMT9xF0b/t3hgDt0pztYqSWOSswKVwG','9876543210','SRM_20701A0536',NULL,'STUDENT','2026-02-19 17:44:02.333736',NULL,NULL,NULL,0,NULL,NULL),(_binary '\0',_binary '\0','2026-02-22 11:30:10.098403','SRM_20701A0537',NULL,'884707664134',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,NULL,NULL,'pavanireddy1239@gmail.com',NULL,'K.Pavani Reddy','$2a$10$6z3jUu1tP5.ZdahoY0dbx.tROIBzcJpCGClUZMskkYNdcoG.fMsgW','6309529622','SRM_20701A0537',NULL,'STUDENT','2026-02-22 11:30:10.098403',NULL,NULL,NULL,0,NULL,NULL),(_binary '\0',_binary '\0','2026-02-23 15:54:09.115516','SRM_20701A0701',NULL,'884707664317',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'CSE',NULL,'john.d@college.edu',NULL,'John Doe','$2a$10$igy4rYy5C15d6sL3EV9Na.MIjU.HEcu0NG9Qak1jODE2JW5lmCKc2','9876543210','SRM_20701A0701',NULL,'STUDENT','2026-02-23 15:54:09.115516',NULL,NULL,NULL,0,NULL,NULL),(_binary '\0',_binary '\0','2026-02-23 15:54:09.653569','SRM_20701A0702',NULL,'884707664316',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'ECE',NULL,'jane.s@college.edu',NULL,'Jane Smith','$2a$10$WJe0wfzZr9TnCQkVQNzyTOHOn4sygiE3EpodrzXOAYszDn84SEUZG','9988776655','SRM_20701A0702',NULL,'STUDENT','2026-02-23 15:54:09.653569',NULL,NULL,NULL,0,NULL,NULL),(_binary '\0',_binary '\0','2025-12-20 12:11:39.670403','SRM_21701A0501',NULL,'123456789012','rahulsharma1239@gmail.com',NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'ECE',NULL,'rahul@college.edu',NULL,'Rahul Sharma','$2a$10$7NhqfuNOeV306cSHttPh4.iQJ/7e63SPdc9/TGapY24zJBCDHryc2','9876543210','SRM_21701A0501',NULL,'STUDENT','2026-02-16 11:20:37.179919',NULL,NULL,'Edge on Windows',0,NULL,NULL),(_binary '\0',_binary '\0','2025-12-20 12:11:40.106350','SRM_22705A0402',NULL,'987654321098',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'ECE',NULL,'priya@college.edu',NULL,'Priya Reddy','$2a$10$7C0Hmd6mhUHToFMPZWkSe.7b8pvahPr6.EOtBmdKtk7qsPbA6zX1.','9123456780','SRM_22705A0402',NULL,'STUDENT','2026-02-16 04:51:42.041222',NULL,NULL,'Postman on Unknown OS',0,NULL,NULL),(_binary '\0',_binary '\0','2025-12-20 11:25:35.441283','SRM_CS2023001',NULL,'123456789012',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'Computer Science',NULL,'rahul.k@example.com',NULL,'Rahul Kumar','$2a$10$mupbCPU/wCWyjyDqX741rOX5jxa4I.nFbSaG5ncMjXrr5waj/rsKW','9876543210','SRM_CS2023001',NULL,'STUDENT',NULL,NULL,NULL,NULL,0,NULL,NULL),(_binary '\0',_binary '\0','2026-01-04 02:42:21.379255','SRM_SRM22CS_LAT01',NULL,'554466778899',NULL,NULL,NULL,NULL,'srm-uuid-9999-8888-777777777777',NULL,'CSE',NULL,'arjun.v@srm.edu',NULL,'Arjun Varma','$2a$10$lYulaaWMv.4VaVH16U/WruS4Dv85//sSFW2l765MmtrV9xKlxFfiG','9988776655','SRM_SRM22CS_LAT01',NULL,'STUDENT','2026-02-22 11:30:47.873879',NULL,NULL,NULL,1,'2026-02-22 11:30:48','SRM_CPADMIN_rajesh_tpo'),(NULL,NULL,NULL,'STU_AITS_01',NULL,NULL,NULL,NULL,NULL,NULL,'d4946f07-dceb-11f0-a9ee-a8b13badcf00',NULL,NULL,NULL,'harendra@aits.edu',NULL,'Neeluru Harendra','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O',NULL,'AITS_20701A0379',NULL,'STUDENT',NULL,NULL,NULL,NULL,0,NULL,NULL),(NULL,NULL,NULL,'STU_SRIT_01',NULL,NULL,NULL,NULL,NULL,NULL,'d494bdff-dceb-11f0-a9ee-a8b13badcf00',NULL,NULL,NULL,'rahul@srit.ac.in',NULL,'Rahul Verma','$2a$10$7p6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O6S6O',NULL,'SRIT_214G1A0101',NULL,'STUDENT',NULL,NULL,NULL,NULL,0,NULL,NULL);
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

-- Dump completed on 2026-02-26 19:54:09
