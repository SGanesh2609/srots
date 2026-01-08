package com.srots.service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

// This covers Workbook, Sheet, Row, Cell, Font, Hyperlink, etc.
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.jobdto.ApplicationListDTO;
import com.srots.dto.jobdto.JobApplicantsDashboardDTO;
import com.srots.dto.jobdto.JobDetailDTO;
import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.dto.jobdto.StudentJobViewDTO;
import com.srots.dto.jobdto.TimelineDTO;
import com.srots.model.Application;
import com.srots.model.EducationRecord;
import com.srots.model.Job;
import com.srots.model.StudentProfile;
import com.srots.model.StudentResume;
import com.srots.model.StudentSkill;
import com.srots.model.User;
import com.srots.repository.ApplicationRepository;
import com.srots.repository.CollegeRepository;
import com.srots.repository.EducationRecordRepository;
import com.srots.repository.JobRepository;
import com.srots.repository.StudentProfileRepository;
import com.srots.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class JobServiceImpl implements JobService {

	@Autowired
	private JobRepository jobRepo;
	@Autowired
	private ApplicationRepository appRepo;
	@Autowired
	private UserRepository userRepo;
	@Autowired
	private EducationRecordRepository eduRepo;
	@Autowired
	private CollegeRepository collegeRepo;
	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private StudentProfileRepository studentProfileRepo;

	@Autowired
	private FileService fileService;

	// --- 1. ACCESS CONTROL & ENTITY HELPERS ---

	private Map<String, String> getCurrentUserContext() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !auth.isAuthenticated()) {
			throw new AccessDeniedException("User is not authenticated");
		}
		String userId = auth.getName();
		String role = auth.getAuthorities().stream().map(a -> a.getAuthority().replace("ROLE_", "")).findFirst()
				.orElse("STUDENT");
		return Map.of("userId", userId, "role", role);
	}

	// Ensure this validation is called in updateJob and deleteJob
	private void validateJobAccess(Job job, String requestCollegeId) {
		Map<String, String> context = getCurrentUserContext();
		String userId = context.get("userId");
		String role = context.get("role");

		// 1. Cross-College Security Check
		if (job.getCollege() == null || !job.getCollege().getId().equals(requestCollegeId)) {
			throw new AccessDeniedException("Security Violation: Access denied to this resource.");
		}

		// 2. Role-Based Hierarchy Check
		if ("CPH".equals(role))
			return; // Admin can do anything

		if ("STAFF".equals(role)) {
			if (job.getPostedBy() == null || !job.getPostedBy().getId().equals(userId)) {
				throw new AccessDeniedException("Access Denied: You can only manage jobs you have posted.");
			}
			return;
		}

		throw new AccessDeniedException("Insufficient permissions.");
	}

	// --- 2. ADMIN & STAFF LOGIC ---

	@Override
	@Transactional
	public JobResponseDTO saveJobWithFiles(Map<String, Object> data, MultipartFile[] jdFiles, MultipartFile avoidList,
			String collegeCode) throws Exception {
		Job job = new Job();
		job.setId(UUID.randomUUID().toString());
		job.setPostedAt(LocalDateTime.now());
		mapJsonToJob(job, data);
		processJobFiles(job, jdFiles, avoidList, collegeCode);
		return mapToJobResponse(jobRepo.saveAndFlush(job));
	}

	@Override
	@Transactional
	public JobResponseDTO updateJobWithFiles(String id, Map<String, Object> data, MultipartFile[] jdFiles,
			MultipartFile avoidList, String collegeCode) throws Exception {
		Job job = jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
		validateJobAccess(job, (String) data.get("collegeId"));
		mapJsonToJob(job, data);

		if (jdFiles != null && jdFiles.length > 0) {
			cleanupAttachments(job);
			processAttachments(job, jdFiles, collegeCode);
		}
		if (avoidList != null && !avoidList.isEmpty()) {
			if (job.getAvoidListUrl() != null)
				fileService.deleteFile(job.getAvoidListUrl());
			job.setAvoidListUrl(fileService.uploadFile(avoidList, collegeCode, "jobs/" + job.getId() + "/avoid-list"));
		}
		return mapToJobResponse(jobRepo.saveAndFlush(job));
	}

	@Override
	@Transactional
	public void deleteJob(String id, String collegeId) {
		// Change orElseThrow() to provide a custom message
		Job job = jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found with ID: " + id));

		validateJobAccess(job, collegeId);
		cleanupAttachments(job);

		if (job.getAvoidListUrl() != null) {
			fileService.deleteFile(job.getAvoidListUrl());
		}

		jobRepo.delete(job);
	}

	private void processJobFiles(Job job, MultipartFile[] jdFiles, MultipartFile avoidList, String collegeCode)
			throws Exception {
		if (jdFiles != null && jdFiles.length > 0)
			processAttachments(job, jdFiles, collegeCode);
		if (avoidList != null && !avoidList.isEmpty()) {
			job.setAvoidListUrl(fileService.uploadFile(avoidList, collegeCode, "jobs/" + job.getId() + "/avoid-list"));
		}
	}

	private void processAttachments(Job job, MultipartFile[] jdFiles, String collegeCode) throws Exception {
		List<Map<String, String>> attachments = new ArrayList<>();
		for (MultipartFile file : jdFiles) {
			String url = fileService.uploadFile(file, collegeCode, "jobs/" + job.getId());
			attachments.add(Map.of("name", file.getOriginalFilename(), "url", url));
		}
		job.setAttachmentsJson(mapper.writeValueAsString(attachments));
	}

	private void mapJsonToJob(Job job, Map<String, Object> data) throws Exception {
		job.setTitle((String) data.get("title"));
		job.setCompanyName((String) data.get("company"));
		job.setHiringDepartment((String) data.get("hiringDepartment"));
		job.setLocation((String) data.get("location"));
		job.setSalaryRange((String) data.get("salaryRange"));
		job.setSummary((String) data.get("summary"));
		job.setInternalId((String) data.get("internalId"));
		job.setExternalLink((String) data.get("externalLink"));
		job.setCompanyCulture((String) data.get("companyCulture"));
		job.setPhysicalDemands((String) data.get("physicalDemands"));
		job.setEeoStatement((String) data.get("eeoStatement"));

		if (data.get("type") != null)
			job.setJobType(Job.JobType.fromString((String) data.get("type")));
		if (data.get("workArrangement") != null)
			job.setWorkMode(Job.WorkMode.fromString((String) data.get("workArrangement")));
		if (data.get("status") != null)
			job.setStatus(Job.JobStatus.valueOf((String) data.get("status")));

		if (data.get("applicationDeadline") != null) {
			job.setApplicationDeadline(LocalDate.parse((String) data.get("applicationDeadline")));
		}

		// Safety check for IDs
		if (data.get("collegeId") != null) {
			job.setCollege(collegeRepo.getReferenceById((String) data.get("collegeId")));
		}
		if (data.get("postedById") != null) {
			job.setPostedBy(userRepo.getReferenceById((String) data.get("postedById")));
		}

		if (data.get("eligibility") instanceof Map) {
			Map<String, Object> elig = (Map<String, Object>) data.get("eligibility");
			job.setMinUgScore(parseBigDecimal(elig.get("minCGPA")));
			job.setFormatUg((String) elig.get("formatUg"));
			job.setMin10thScore(parseBigDecimal(elig.get("min10th")));
			job.setFormat10th((String) elig.get("format10th"));
			job.setMin12thScore(parseBigDecimal(elig.get("min12th")));
			job.setFormat12th((String) elig.get("format12th"));
			job.setMaxBacklogs(elig.get("maxBacklogs") != null ? (Integer) elig.get("maxBacklogs") : 0);
			job.setIsDiplomaEligible(Boolean.TRUE.equals(elig.get("isDiplomaEligible")));
			job.setMinDiplomaScore(parseBigDecimal(elig.get("minDiploma")));
			job.setFormatDiploma((String) elig.get("formatDiploma"));
			job.setAllowGaps(Boolean.TRUE.equals(elig.get("educationalGapsAllowed")));
			job.setMaxGapYears(elig.get("maxGapYears") != null ? (Integer) elig.get("maxGapYears") : 0);

			job.setAllowedBranches(mapper.writeValueAsString(elig.getOrDefault("allowedBranches", new ArrayList<>())));
			job.setEligibleBatches(mapper.writeValueAsString(elig.getOrDefault("eligibleBatches", new ArrayList<>())));
		}

		// Standardizing JSON fields
		job.setRoundsJson(mapper.writeValueAsString(data.getOrDefault("rounds", new ArrayList<>())));
		job.setRequiredFieldsJson(
				mapper.writeValueAsString(data.getOrDefault("requiredStudentFields", new ArrayList<>())));
		job.setResponsibilitiesJson(
				mapper.writeValueAsString(data.getOrDefault("responsibilities", new ArrayList<>())));
		job.setQualificationsJson(mapper.writeValueAsString(data.getOrDefault("qualifications", new ArrayList<>())));
		job.setBenefitsJson(mapper.writeValueAsString(data.getOrDefault("benefits", new ArrayList<>())));
		job.setPreferredQualificationsJson(
				mapper.writeValueAsString(data.getOrDefault("preferredQualifications", new ArrayList<>())));
	}

	private void cleanupAttachments(Job job) {
		if (job.getAttachmentsJson() == null)
			return;
		try {
			List<Map<String, String>> files = mapper.readValue(job.getAttachmentsJson(),
					new TypeReference<List<Map<String, String>>>() {
					});
			for (Map<String, String> f : files) {
				String url = f.get("url");
				if (url != null)
					fileService.deleteFile(url);
			}
		} catch (Exception e) {
			System.err.println("File Cleanup Error: " + e.getMessage());
		}
	}

	private BigDecimal parseBigDecimal(Object value) {
		if (value == null)
			return BigDecimal.ZERO;
		String str = value.toString().trim();
		if (str.isEmpty())
			return BigDecimal.ZERO;
		try {
			return new BigDecimal(str);
		} catch (NumberFormatException e) {
			return BigDecimal.ZERO;
		}
	}

	// --- 4. RESPONSE MAPPING ---

	private JobResponseDTO mapToJobResponse(Job job) {
		JobResponseDTO dto = new JobResponseDTO();
		Map<String, String> context = getCurrentUserContext();

		dto.setId(job.getId());
		dto.setTitle(job.getTitle());
		dto.setCompany(job.getCompanyName());
		dto.setHiringDepartment(job.getHiringDepartment());
		dto.setLocation(job.getLocation());
		dto.setSalaryRange(job.getSalaryRange());
		dto.setSummary(job.getSummary());
		dto.setInternalId(job.getInternalId());
		dto.setExternalLink(job.getExternalLink());
		dto.setStatus(job.getStatus() != null ? job.getStatus().name() : "Active");
		dto.setAvoidListUrl(job.getAvoidListUrl());
		dto.setJobType(job.getJobType() != null ? job.getJobType().getDisplay() : null);
		dto.setWorkMode(job.getWorkMode() != null ? job.getWorkMode().getDisplay() : null);
		dto.setApplicationDeadline(job.getApplicationDeadline());

		if (job.getPostedAt() != null)
			dto.setPostedAt(job.getPostedAt().toLocalDate());
		dto.setPostedBy(job.getPostedBy() != null ? job.getPostedBy().getFullName() : "Admin");
		dto.setApplicantCount((long) appRepo.countByJobId(job.getId()));

		boolean isOwner = job.getPostedBy() != null && job.getPostedBy().getId().equals(context.get("userId"));
		dto.setCanEdit("CPH".equals(context.get("role")) || isOwner);

		// Eligibility Fields
		dto.setMinUgScore(job.getMinUgScore());
		dto.setMin10thScore(job.getMin10thScore());
		dto.setMin12thScore(job.getMin12thScore());
		dto.setMaxBacklogs(job.getMaxBacklogs());
		dto.setIsDiplomaEligible(job.getIsDiplomaEligible());
		dto.setAllowGaps(job.getAllowGaps());
		dto.setMaxGapYears(job.getMaxGapYears());

		// Defensive JSON Parsing: ensure lists are never null
		dto.setResponsibilities(parseJsonList(job.getResponsibilitiesJson(), new TypeReference<List<String>>() {
		}));
		dto.setQualifications(parseJsonList(job.getQualificationsJson(), new TypeReference<List<String>>() {
		}));
		dto.setPreferredQualifications(
				parseJsonList(job.getPreferredQualificationsJson(), new TypeReference<List<String>>() {
				}));
		dto.setBenefits(parseJsonList(job.getBenefitsJson(), new TypeReference<List<String>>() {
		}));
		dto.setAllowedBranches(parseJsonList(job.getAllowedBranches(), new TypeReference<List<String>>() {
		}));
		dto.setEligibleBatches(parseJsonList(job.getEligibleBatches(), new TypeReference<List<String>>() {
		}));
		dto.setRequiredFields(parseJsonList(job.getRequiredFieldsJson(), new TypeReference<List<String>>() {
		}));
		dto.setRounds(parseJsonList(job.getRoundsJson(), new TypeReference<List<Map<String, Object>>>() {
		}));
		dto.setAttachments(parseJsonList(job.getAttachmentsJson(), new TypeReference<List<Map<String, String>>>() {
		}));

		return dto;
	}

	/**
	 * Helper to prevent repetition and ensure empty lists on error/null
	 */
	private <T> T parseJsonList(String json, TypeReference<T> typeRef) {
		if (json == null || json.isEmpty()) {
			return (T) new ArrayList<>();
		}
		try {
			return mapper.readValue(json, typeRef);
		} catch (Exception e) {
			return (T) new ArrayList<>();
		}
	}

	@Override
	public Job getJobEntity(String id) {
		return jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found: " + id));
	}

	// --- 2. ADMIN & STAFF LOGIC ---

	@Override
	public List<JobResponseDTO> getAdminJobs(String collegeId, String query, Job.JobType jobType,
			Job.WorkMode workMode, Job.JobStatus status) {
		Map<String, String> context = getCurrentUserContext();
		String currentUserId = context.get("userId");
		String currentUserRole = context.get("role");

		// HIERARCHY LOGIC:
		// If STAFF, we pass their ID to the query to limit results.
		// If CPH, we pass NULL so they see all jobs in the college.
		String filterByUserId = "STAFF".equals(currentUserRole) ? currentUserId : null;

		List<Job> jobs = jobRepo.filterJobsForPortal(collegeId, filterByUserId, query, jobType, workMode, status);
 
		return jobs.stream().map(job -> {
			JobResponseDTO dto = this.mapToJobResponse(job);

			// Final UI safeguard: Can this user edit/delete?
			boolean isOwner = job.getPostedBy() != null && job.getPostedBy().getId().equals(currentUserId);
			dto.setCanEdit("CPH".equals(currentUserRole) || isOwner);

			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public JobDetailDTO getJobDetail(String jobId) {
		Job job = getJobEntity(jobId);
		Long totalApplicants = (long) appRepo.findByJobId(jobId).size();
		List<Map<String, Object>> roundsWithStats = new ArrayList<>();
		try {
			roundsWithStats = mapper.readValue(job.getRoundsJson(), new TypeReference<>() {
			});
			for (Map<String, Object> round : roundsWithStats) {
				String roundName = (String) round.get("name");
				long qualifiedCount = appRepo.countByJobIdAndCurrentRoundStatus(jobId, roundName + " Cleared");
				round.put("qualifiedCount", qualifiedCount);
			}
		} catch (Exception e) {
			/* Fallback for empty rounds */ }
		return new JobDetailDTO(job, totalApplicants, roundsWithStats);
	}


	@Override
	public List<User> getApplicants(String jobId) {
		return appRepo.findByJobId(jobId).stream().map(Application::getStudent).collect(Collectors.toList());
	}

	@Override
	public List<User> getEligibleStudents(String jobId) {
		Job job = getJobEntity(jobId);
		return userRepo.findByCollegeIdAndRole(job.getCollege().getId(), User.Role.STUDENT).stream()
				.filter(s -> getStudentJobStatus(jobId, s.getId()).isEligible()).collect(Collectors.toList());
	}

//	@Override
//	public byte[] exportApplicants(String jobId) throws Exception {
//		// Overloaded version for standard calls
//		Job job = getJobEntity(jobId);
//		List<Application> apps = appRepo.findByJobId(jobId);
//		return generateExcel(job, apps);
//	}

	// --- 3. STUDENT PORTAL LOGIC ---

	@Override
	public List<StudentJobViewDTO> getStudentPortalJobs(String filterType, List<String> jobTypeFilters) {
		String studentId = getCurrentUserContext().get("userId");
		User student = userRepo.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));

		String collegeId = (student.getCollege() != null) ? student.getCollege().getId() : null;
		if (collegeId == null)
			return new ArrayList<>();

		// Fetch all active jobs for the student's college
		List<Job> allActiveJobs = jobRepo.findByCollegeIdAndStatus(collegeId, Job.JobStatus.Active);

		return allActiveJobs.stream().map(job -> getStudentJobStatus(job.getId(), studentId)).filter(dto -> {
			// 1. Filter by Job Type (FullTime, Internship etc) if provided
			if (jobTypeFilters != null && !jobTypeFilters.isEmpty()) {
				String currentType = dto.getJob().getJobType() != null ? dto.getJob().getJobType().name() : "";
				if (!jobTypeFilters.contains(currentType))
					return false;
			}

			// 2. Main Tab Logic (Fixed naming to match your frontend/request)
			String type = (filterType == null) ? "all" : filterType.toLowerCase();
			return switch (type) {
			// Return jobs eligible AND already applied
			case "applied", "applyed" -> dto.isEligible() && dto.isApplied();

			// Return jobs eligible BUT not yet applied
			case "not_applied", "not_applyed" -> dto.isEligible() && !dto.isApplied();

			// Return ALL jobs where student is eligible (applied + not applied)
			case "eligible" -> dto.isEligible();

			// Return jobs where student is NOT eligible
			case "non_eligible", "not_eligible" -> !dto.isEligible();

			// Show everything posted in the college
			case "all" -> true;

			default -> true;
			};
		}).collect(Collectors.toList());
	}

	@Override
	public StudentJobViewDTO getStudentJobStatus(String jobId, String studentId) {
		Job job = getJobEntity(jobId);
		User student = userRepo.findById(studentId).orElseThrow();

		StudentJobViewDTO dto = new StudentJobViewDTO();
		dto.setJob(job);
		dto.setApplied(appRepo.findByJobIdAndStudentId(jobId, studentId).isPresent());

		if (student.getStudentProfile() == null) {
			dto.setEligible(false);
			dto.setNotEligibilityReason("Incomplete profile.");
			return dto;
		}

		StringBuilder reason = new StringBuilder();
		boolean eligible = true;

		// 1. Avoid List Check
		if (job.getAvoidListUrl() != null
				&& isRollNumberInAvoidList(job.getAvoidListUrl(), student.getStudentProfile().getRollNumber())) {
			eligible = false;
			reason.append("Admin Exclusion. ");
		}

		// 2. Batch Check
		if (eligible && job.getEligibleBatches() != null) {
			try {
				List<String> batches = mapper.readValue(job.getEligibleBatches(), new TypeReference<List<String>>() {
				});
				String sBatch = String.valueOf(student.getStudentProfile().getBatch());
				if (!batches.contains(sBatch)) {
					eligible = false;
					reason.append("Batch mismatch. ");
				}
			} catch (Exception e) {
				/* ignore */ }
		}

		// 3. Branch Check
		if (eligible && job.getAllowedBranches() != null) {
			try {
				List<String> allowedBranches = mapper.readValue(job.getAllowedBranches(),
						new TypeReference<List<String>>() {
						});
				String studentBranch = student.getStudentProfile().getBranch();
				boolean branchMatch = allowedBranches.stream().anyMatch(b -> b.equalsIgnoreCase(studentBranch));
				if (!branchMatch) {
					eligible = false;
					reason.append("Branch not eligible. ");
				}
			} catch (Exception e) {
				/* ignore */ }
		}

		// --- NEW CHECKS START HERE ---

		// 4. Score Checks (UG, 10th, 12th)
		List<EducationRecord> eduRecords = eduRepo.findByStudentId(studentId);

		// 1. Always check UG
		if (eligible)
			eligible = checkScoreEligibility(eduRecords, "Undergraduate", job.getMinUgScore(), job.getFormatUg(),
					reason);

		// 2. Always check 10th
		if (eligible)
			eligible = checkScoreEligibility(eduRecords, "Class 10", job.getMin10thScore(), job.getFormat10th(),
					reason);

		// 3. SMART SYNC: Check 12th OR Diploma
		if (eligible) {
			BigDecimal min12th = job.getMin12thScore();
			if (min12th != null && min12th.compareTo(BigDecimal.ZERO) > 0) {
				// Check if student has 12th or Diploma
				BigDecimal score12th = getNormalizedScore(eduRecords, "Class 12");
				BigDecimal scoreDiploma = getNormalizedScore(eduRecords, "Diploma");

				// Use whichever is available
				BigDecimal studentSecondaryScore = (score12th.compareTo(BigDecimal.ZERO) > 0) ? score12th
						: scoreDiploma;
				BigDecimal threshold = normalizeJobRequirement(min12th, job.getFormat12th());

				if (studentSecondaryScore.compareTo(threshold) < 0) {
					eligible = false;
					reason.append("12th/Diploma score below threshold. ");
				}
			}
		}

		// 5. Backlog Check
		// Assuming EducationRecord has a 'currentArrears' field as seen in your JSON
		int totalBacklogs = eduRecords.stream().mapToInt(EducationRecord::getCurrentArrears).sum();
		if (eligible && job.getMaxBacklogs() != null && totalBacklogs > job.getMaxBacklogs()) {
			eligible = false;
			reason.append("Too many active backlogs (" + totalBacklogs + "). ");
		}

		// 6. Education Gap Check
		if (eligible && !Boolean.TRUE.equals(job.getAllowGaps())) {
			if (Boolean.TRUE.equals(student.getStudentProfile().getGapInStudies())) {
				eligible = false;
				reason.append("Education gaps not allowed. ");
			}
		}

		dto.setEligible(eligible);
		dto.setNotEligibilityReason(reason.toString().trim());
		return dto;
	}

	// Helper to normalize the threshold set by CP user
	private BigDecimal normalizeJobRequirement(BigDecimal value, String format) {
		if (value == null)
			return BigDecimal.ZERO;
		if ("CGPA10".equalsIgnoreCase(format))
			return value.multiply(new BigDecimal("10"));
		if ("CGPA4".equalsIgnoreCase(format))
			return value.multiply(new BigDecimal("25"));
		return value; // Percentage
	}

	private boolean checkScoreEligibility(List<EducationRecord> records, String level, BigDecimal minScore,
			String format, StringBuilder reason) {
		if (minScore == null || minScore.compareTo(BigDecimal.ZERO) <= 0)
			return true;

		BigDecimal studentScore = getNormalizedScore(records, level);
		BigDecimal threshold = normalizeJobRequirement(minScore, format);

		if (studentScore.compareTo(threshold) < 0) {
			reason.append(level).append(" score below required threshold. ");
			return false;
		}
		return true;
	}

	/**
	 * Normalizes any score (CGPA or Percentage) to a 0-100 base for fair
	 * comparison.
	 */
	private BigDecimal getNormalizedScore(List<EducationRecord> records, String level) {
		if (records == null)
			return BigDecimal.ZERO;

		// Normalize level string to match Enum values like "Class 10"
		String targetLevel = level.replace("10th", "Class 10").replace("12th", "Class 12");

		return records.stream()
				.filter(r -> r.getLevel() != null && r.getLevel().toString().equalsIgnoreCase(targetLevel)).findFirst()
				.map(r -> {
					// 1. If system already calculated percentageEquiv, use it as the source of
					// truth
					if (r.getPercentageEquiv() != null && r.getPercentageEquiv().compareTo(BigDecimal.ZERO) > 0) {
						return r.getPercentageEquiv();
					}

					// 2. Otherwise, parse the scoreDisplay string
					BigDecimal score = BigDecimal.ZERO;
					try {
						if (r.getScoreDisplay() != null) {
							score = new BigDecimal(r.getScoreDisplay().replaceAll("[^0-9.]", ""));
						}
					} catch (Exception e) {
						return BigDecimal.ZERO;
					}

					// 3. Standardization Logic based on ScoreType Enum
					EducationRecord.ScoreType type = r.getScoreType();
					if (type == null)
						return score;

					return switch (type) {
					case CGPA -> {
						// Logic: If score <= 4.0, it's a 4-point scale. If > 4.0, it's a 10-point
						// scale.
						if (score.compareTo(new BigDecimal("5.0")) <= 0) {
							yield score.multiply(new BigDecimal("25")); // 4.0 scale (4.0 * 25 = 100%)
						}
						yield score.multiply(new BigDecimal("10")); // 10.0 scale (9.2 * 10 = 92%)
					}
					case Grade -> {
						// Mapping standard grades to percentage if stored as numbers
						yield score.multiply(new BigDecimal("10"));
					}
					case Marks, Percentage -> score; // Marks are usually pre-calculated into percentageEquiv
					default -> score;
					};
				}).orElse(BigDecimal.ZERO);
	}

	private boolean isRollNumberInAvoidList(String fileUrl, String rollNumber) {
		try (InputStream is = fileService.getFileStream(fileUrl); Workbook wb = WorkbookFactory.create(is)) {
			Sheet s = wb.getSheetAt(0);
			for (Row r : s) {
				Cell c = r.getCell(0);
				if (c == null)
					continue;
				String val = (c.getCellType() == CellType.NUMERIC) ? String.valueOf((long) c.getNumericCellValue())
						: c.getStringCellValue().trim();
				if (val.equalsIgnoreCase(rollNumber))
					return true;
			}
		} catch (Exception e) {
			System.err.println("Avoid list error: " + e.getMessage());
		}
		return false;
	}

	@Override
	@Transactional
	public void updateApplication(String jobId, String studentId, String status) {
		Job job = getJobEntity(jobId);

		// 1. Check if Job is Active
		if (job.getStatus() != Job.JobStatus.Active && "Applied".equals(status)) {
			throw new RuntimeException("Job is no longer accepting applications.");
		}

		// 2. CRITICAL: Backend Eligibility Re-validation
		// This prevents API-level bypass of the UI button restriction
		if ("Applied".equals(status)) {
			StudentJobViewDTO eligibilityStatus = getStudentJobStatus(jobId, studentId);
			if (!eligibilityStatus.isEligible()) {
				throw new RuntimeException("Application Failed: " + eligibilityStatus.getNotEligibilityReason());
			}
		}

		// 3. Process the Application
		Application app = appRepo.findByJobIdAndStudentId(jobId, studentId)
				.orElse(Application.builder().job(job).student(userRepo.getReferenceById(studentId)).build());

		app.setStatus(Application.AppStatus.valueOf(status));
		app.setCurrentRoundStatus("Applied".equals(status) ? "Pending" : status);
		appRepo.save(app);
	}

	// --- 4. DATA MAPPING & EXCEL UTILITIES ---

	@Override
	public byte[] exportApplicants(String jobId, String format) throws Exception {
	    Job job = getJobEntity(jobId);
	    List<Application> apps = appRepo.findByJobId(jobId);
	    
	    List<ExportDataHolder> dataList = apps.stream()
	            .map(app -> new ExportDataHolder(
	                app.getStudent(), 
	                true, 
	                app.getCurrentRoundStatus(),
	                app.getAppliedBy() != null ? app.getAppliedBy().name() : "Self"
	            ))
	            .sorted((a, b) -> {
	                boolean aHired = "Hired".equalsIgnoreCase(a.statusDetail);
	                boolean bHired = "Hired".equalsIgnoreCase(b.statusDetail);
	                if (aHired && !bHired) return -1;
	                if (!aHired && bHired) return 1;
	                return a.user.getFullName().compareToIgnoreCase(b.user.getFullName());
	            })
	            .collect(Collectors.toList());

	    return generateExportFile(job, dataList, format, "Applied_Applicants", false);
	}

	@Override
	public byte[] exportAllEligibleStudents(String jobId, String format) throws Exception {
		Job job = getJobEntity(jobId);
		List<User> collegeStudents = userRepo.findByCollegeId(job.getCollege().getId());
		List<ExportDataHolder> dataList = collegeStudents.stream().map(student -> {
			StudentJobViewDTO status = getStudentJobStatus(jobId, student.getId());
			return new ExportDataHolder(student, status.isEligible(), status.isApplied(),
					status.getNotEligibilityReason());
		}).filter(holder -> holder.isEligible).collect(Collectors.toList());

		return generateExportFile(job, dataList, format, "Eligible_Students", true);
	}

	private String extractStudentField(User student, String fieldName, Job job, ExportDataHolder holder) {
		if (student == null)
			return "N/A";

		StudentProfile profile = student.getStudentProfile();
		List<EducationRecord> eduRecords = student.getEducationRecords();
//        String key = fieldName.toLowerCase().replace(" ", "").replace("_", "");
		String key = fieldName.toLowerCase().replaceAll("[ ._]", "");

		return switch (key) {
		// --- Basic User Info ---
		case "fullname" -> student.getFullName() != null ? student.getFullName() : "N/A";
		case "instituteemail" -> student.getEmail() != null ? student.getEmail() : "N/A";
		case "phone" -> student.getPhone() != null ? student.getPhone() : "N/A";
		case "aadhaar" -> student.getAadhaarNumber() != null ? student.getAadhaarNumber() : "N/A";

		case "lastlogin", "lastactivity" -> {
			if (profile != null && profile.getUpdatedAt() != null) {
				yield profile.getUpdatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"));
			}
			yield "N/A";
		}

		// --- Student Profile Info ---
		case "rollnumber" -> (profile != null && profile.getRollNumber() != null) ? profile.getRollNumber() : "N/A";
		case "personalemail" ->
			(profile != null && profile.getPersonalEmail() != null) ? profile.getPersonalEmail() : "N/A";
		case "batch" -> (profile != null && profile.getBatch() != null) ? String.valueOf(profile.getBatch()) : "N/A";
		case "branch" -> (profile != null && profile.getBranch() != null) ? profile.getBranch() : "N/A";
		case "gender" -> (profile != null && profile.getGender() != null) ? profile.getGender().name() : "N/A";
		case "dob" -> {
			if (profile != null && profile.getDob() != null) {
				// Formats LocalDate to a readable String
				yield profile.getDob().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy"));
			}
			yield "N/A";
		}
		case "gapstudies" -> (profile != null && Boolean.TRUE.equals(profile.getGapInStudies()))
				? "Yes (" + profile.getGapDuration() + ")"
				: "No";

		// --- Collections (Resumes & Skills) ---
		case "resume", "resumeurl" -> student.getResumes().stream().filter(r -> Boolean.TRUE.equals(r.getIsDefault()))
				.map(StudentResume::getFileUrl).findFirst().orElse("No Default Resume");

		case "skills" -> student.getSkills().stream().map(StudentSkill::getName).collect(Collectors.joining(", "));

		// --- Dynamic Academic Scores (Handling 10th, 12th, UG) ---
		case "10thscore", "class10" -> formatToJobRequirement(eduRecords, "Class 10", job.getFormat10th());
		case "12thscore", "class12" -> formatToJobRequirement(eduRecords, "Class 12", job.getFormat12th());
		case "ugscore", "cgpa", "btechcgpa" -> formatToJobRequirement(eduRecords, "Undergraduate", job.getFormatUg());
		case "diplomascore" -> formatToJobRequirement(eduRecords, "Diploma", job.getFormatDiploma());

		case "backlogs", "activebacklogs" -> {
			int total = eduRecords.stream().mapToInt(EducationRecord::getCurrentArrears).sum();
			yield String.valueOf(total);
		}

		case "currentstatus", "applicationstatus" -> {
			if (!holder.isApplied)
				yield "Not Applied";
			yield (holder.statusDetail != null && !holder.statusDetail.isEmpty()) ? holder.statusDetail : "Applied";
		}
		
		case "applicationsource", "appliedby" -> {
		    if (!holder.isApplied) yield "N/A";
		    // Check if the source exists, default to 'Self' if null
		    yield (holder.appliedBy != null) ? holder.appliedBy : "Self";
		}

		default -> "N/A";
		};
	}

	private String formatToJobRequirement(List<EducationRecord> records, String level, String targetFormat) {
		BigDecimal normalized = getNormalizedScore(records, level);
		if (normalized.compareTo(BigDecimal.ZERO) == 0)
			return "N/A";

		// targetFormat comes from job.getFormat10th(), job.getFormatUg(), etc.
		if ("CGPA10".equalsIgnoreCase(targetFormat)) {
			return normalized.divide(new BigDecimal("10"), 2, RoundingMode.HALF_UP).toString();
		}
		if ("CGPA4".equalsIgnoreCase(targetFormat)) {
			return normalized.divide(new BigDecimal("25"), 2, RoundingMode.HALF_UP).toString();
		}

		// Default: Show as Percentage
		return normalized.setScale(2, RoundingMode.HALF_UP).toString() + "%";
	}

	private byte[] generateExportFile(Job job, List<ExportDataHolder> dataList, String format, String title,
			boolean isEligibleExport) throws Exception {
		List<String> requiredFields = mapper.readValue(job.getRequiredFieldsJson(), new TypeReference<List<String>>() {
		});
		boolean isCsv = "csv".equalsIgnoreCase(format);

		// Unified Header List
		List<String> staticHeaders = new ArrayList<>();
		staticHeaders.add("Current Status"); // Shows round status or "Not Applied"
		
		if (!isEligibleExport) {
	        staticHeaders.add("Application Source");
	    }
		
		if (isEligibleExport) {
			staticHeaders.add("Applied Status"); // Yes/No
			staticHeaders.add("Last Login");
		}

		if (isCsv) {
			StringBuilder csv = new StringBuilder();
			// 1. Write Headers
			staticHeaders.forEach(h -> csv.append(h).append(","));
			requiredFields.forEach(f -> csv.append(toTitleCase(f)).append(","));
			csv.append("\n");

			// 2. Write Data Rows
			for (ExportDataHolder holder : dataList) {
				// Write Static Fields
				csv.append("\"").append(extractStudentField(holder.user, "currentstatus", job, holder)).append("\",");
				if (isEligibleExport) {
					csv.append(holder.isApplied ? "Yes" : "No").append(",");
					csv.append("\"").append(extractStudentField(holder.user, "lastlogin", job, holder)).append("\",");
				}
				// Write Dynamic Fields
				for (String field : requiredFields) {
					String val = extractStudentField(holder.user, field, job, holder);
					csv.append("\"").append(val.replace("\"", "\"\"")).append("\",");
				}
				csv.append("\n");
			}
			return csv.toString().getBytes(StandardCharsets.UTF_8);
		} else {
			try (Workbook workbook = new XSSFWorkbook()) {
				Sheet sheet = workbook.createSheet(title);
				CellStyle headerStyle = workbook.createCellStyle();
				Font font = workbook.createFont();
				font.setBold(true);
				headerStyle.setFont(font);

				Row headerRow = sheet.createRow(0);
				int col = 0;
				for (String h : staticHeaders) {
					Cell cell = headerRow.createCell(col++);
					cell.setCellValue(h);
					cell.setCellStyle(headerStyle);
				}
				for (String f : requiredFields) {
					Cell cell = headerRow.createCell(col++);
					cell.setCellValue(toTitleCase(f));
					cell.setCellStyle(headerStyle);
				}

				int rowIdx = 1;
				for (ExportDataHolder holder : dataList) {
					Row row = sheet.createRow(rowIdx++);
					int dataCol = 0;
					// Write Static Fields
					row.createCell(dataCol++)
							.setCellValue(extractStudentField(holder.user, "currentstatus", job, holder));
					if (isEligibleExport) {
						row.createCell(dataCol++).setCellValue(holder.isApplied ? "Yes" : "No");
						row.createCell(dataCol++)
								.setCellValue(extractStudentField(holder.user, "lastlogin", job, holder));
					}
					// Write Dynamic Fields
					for (String field : requiredFields) {
						row.createCell(dataCol++).setCellValue(extractStudentField(holder.user, field, job, holder));
					}
				}
				for (int i = 0; i < col; i++)
					sheet.autoSizeColumn(i);
				ByteArrayOutputStream out = new ByteArrayOutputStream();
				workbook.write(out);
				return out.toByteArray();
			}
		}
	}
	
	

	// Helper to Capitalize Header Names (e.g., "fullName" -> "Full Name")
	private String toTitleCase(String input) {
		if (input == null || input.isEmpty())
			return input;
		// Splits camelCase or dot/underscore names
		String result = input.replaceAll("([a-z])([A-Z])", "$1 $2").replace(".", " ").replace("_", " ");
		return Arrays.stream(result.split(" "))
				.map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
				.collect(Collectors.joining(" "));
	}

	// Helper Class to keep data clean during the export loop
	private static class ExportDataHolder {
	    User user;
	    boolean isEligible;
	    boolean isApplied;
	    String statusDetail;
	    String appliedBy; // Added this

	    // Constructor for Applicants (4 arguments)
	    ExportDataHolder(User user, boolean isApplied, String roundStatus, String appliedBy) {
	        this.user = user;
	        this.isApplied = isApplied;
	        this.isEligible = true;
	        this.statusDetail = roundStatus;
	        this.appliedBy = appliedBy;
	    }

	    // Constructor for Eligible Students (Keep this for the other export)
	    ExportDataHolder(User user, boolean isEligible, boolean isApplied, String reason) {
	        this.user = user;
	        this.isEligible = isEligible;
	        this.isApplied = isApplied;
	        this.statusDetail = isApplied ? "Already Applied" : reason;
	        this.appliedBy = isApplied ? "Self" : "N/A";
	    }

	}
	
	
	
	
//	---------Applicants Data in UI-------------
	
	public JobApplicantsDashboardDTO getJobApplicantsDashboard(String jobId) throws Exception {
	    Job job = jobRepo.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
	    List<Application> apps = appRepo.findByJobId(jobId);
	    List<Map<String, Object>> rounds = mapper.readValue(job.getRoundsJson(), new TypeReference<>() {});

	    // 1. Calculate Round-wise Summary (remains same)
	    List<Map<String, Object>> roundSummaryList = new ArrayList<>();
	    for (int i = 0; i < rounds.size(); i++) {
	        int roundNum = i + 1;
	        String roundName = (String) rounds.get(i).get("name");
	        long countAtThisStage = apps.stream()
	                .filter(a -> a.getCurrentRound() != null && a.getCurrentRound() == roundNum)
	                .count();

	        Map<String, Object> summary = new LinkedHashMap<>();
	        summary.put("roundNumber", roundNum);
	        summary.put("roundName", roundName);
	        summary.put("studentCount", countAtThisStage);
	        roundSummaryList.add(summary);
	    }

	    // 2. Prepare Headers - Added "Application Source" here
	    List<String> requiredFields = mapper.readValue(job.getRequiredFieldsJson(), new TypeReference<List<String>>() {});
	    List<String> uiHeaders = new ArrayList<>(List.of("Roll Number", "Full Name", "Current Status", "Application Source"));
	    requiredFields.forEach(f -> uiHeaders.add(toTitleCase(f)));

	    long hired = 0, rejected = 0, pending = 0;
	    List<Map<String, Object>> studentList = new ArrayList<>();

	    for (Application app : apps) {
	        // FIX: Pass 4 arguments to ExportDataHolder to match the new constructor
	        String source = app.getAppliedBy() != null ? app.getAppliedBy().name() : "Self";
	        
	        ExportDataHolder holder = new ExportDataHolder(
	            app.getStudent(), 
	            true, 
	            app.getCurrentRoundStatus(), 
	            source
	        );

	        String status = extractStudentField(app.getStudent(), "currentstatus", job, holder);
	        
	        // Stats Calculation
	        if ("Hired".equalsIgnoreCase(status)) hired++;
	        else if (status.toLowerCase().contains("rejected")) rejected++;
	        else pending++;

	        Map<String, Object> studentMap = new LinkedHashMap<>();
	        studentMap.put("studentId", app.getStudent().getId());
	        studentMap.put("Roll Number", extractStudentField(app.getStudent(), "rollnumber", job, holder));
	        studentMap.put("Full Name", app.getStudent().getFullName());
	        studentMap.put("Current Status", status);
	        
	        // Add Source to the Map for UI
	        studentMap.put("Application Source", source);

	        for (String field : requiredFields) {
	            studentMap.put(toTitleCase(field), extractStudentField(app.getStudent(), field, job, holder));
	        }
	        studentList.add(studentMap);
	    }

	    Map<String, Long> globalStats = Map.of("Hired", hired, "Rejected", rejected, "Pending", pending);

	    return new JobApplicantsDashboardDTO(
	        job.getTitle(), 
	        (long)apps.size(), 
	        globalStats, 
	        roundSummaryList, 
	        uiHeaders, 
	        studentList
	    );
	}
	
	

//    ---------Upload Results------------

	// --- Upload Results with Pass/Fail Count ---
	@Transactional
	public Map<String, Object> uploadRoundResults(String jobId, int roundIndex, MultipartFile file) throws Exception {
	    Job job = jobRepo.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
	    List<Map<String, Object>> rounds = mapper.readValue(job.getRoundsJson(), new TypeReference<>() {});

	    int actualIndex = roundIndex - 1;
	    if (actualIndex < 0 || actualIndex >= rounds.size()) {
	        throw new RuntimeException("Invalid round index.");
	    }
	    String roundName = (String) rounds.get(actualIndex).get("name");

	    Workbook workbook = WorkbookFactory.create(file.getInputStream());
	    Sheet sheet = workbook.getSheetAt(0);

	    int passedCount = 0;
	    int rejectedCount = 0;
	    int autoCreatedCount = 0;
	    List<String> errors = new ArrayList<>();

	    // Header logic...
	    Row headerRow = sheet.getRow(0);
	    int rollCol = -1, resultCol = -1;
	    for (Cell cell : headerRow) {
	        String val = cell.getStringCellValue().toLowerCase().replaceAll("[ ._]", "");
	        if (val.contains("rollnumber")) rollCol = cell.getColumnIndex();
	        if (val.contains("result") || val.contains("status")) resultCol = cell.getColumnIndex();
	    }

	    for (int i = 1; i <= sheet.getLastRowNum(); i++) {
	        Row row = sheet.getRow(i);
	        if (row == null) continue;
	        try {
	            String rollNumber = getCellValueAsString(row.getCell(rollCol));
	            String resultText = getCellValueAsString(row.getCell(resultCol));

	            Optional<StudentProfile> profileOpt = studentProfileRepo.findByRollNumber(rollNumber);

	            if (profileOpt.isPresent()) {
	                String studentId = profileOpt.get().getUserId();
	                Optional<Application> appOpt = appRepo.findByJobIdAndStudentId(jobId, studentId);

	                Application app;
	                if (appOpt.isPresent()) {
	                    app = appOpt.get();
	                } else {
	                    // --- ELIGIBILITY VALIDATION BEFORE AUTO-CREATE ---
	                    StudentJobViewDTO eligibility = getStudentJobStatus(jobId, studentId);
	                    
	                    if (eligibility.isEligible()) {
	                        User studentUser = userRepo.findById(studentId).orElseThrow();
	                        app = new Application();
	                        app.setJob(job);
	                        app.setStudent(studentUser);
	                        app.setStatus(Application.AppStatus.Applied);
	                        // app.setAppliedBy(Application.AppliedBy.CP_Admin); // If you add the field
	                        autoCreatedCount++;
	                    } else {
	                        errors.add("Row " + i + ": Roll " + rollNumber + " is NOT ELIGIBLE (" + eligibility.getNotEligibilityReason() + "). Application not created.");
	                        continue; 
	                    }
	                }

	                // Process Results
	                app.setCurrentRound(roundIndex);
	                if (resultText.equalsIgnoreCase("Passed") || resultText.equalsIgnoreCase("Qualified")) {
	                    if (roundIndex == rounds.size()) {
	                        app.setCurrentRoundStatus("Hired");
	                        app.setStatus(Application.AppStatus.Hired);
	                    } else {
	                        app.setCurrentRoundStatus(roundName + " Cleared");
	                        app.setStatus(Application.AppStatus.Shortlisted);
	                    }
	                    passedCount++;
	                } else {
	                    app.setCurrentRoundStatus("Rejected in " + roundName);
	                    app.setStatus(Application.AppStatus.Rejected);
	                    rejectedCount++;
	                }
	                appRepo.save(app);
	            } else {
	                errors.add("Row " + i + ": Roll " + rollNumber + " not found in DB.");
	            }
	        } catch (Exception e) {
	            errors.add("Row " + i + ": General error.");
	        }
	    }

	    Map<String, Object> result = new LinkedHashMap<>();
	    result.put("roundName", roundName);
	    result.put("passed", passedCount);
	    result.put("rejected", rejectedCount);
	    result.put("newApplicationsCreated", autoCreatedCount);
	    result.put("errors", errors);
	    return result;
	}

	// Helper to handle cell values safely
	private String getCellValueAsString(Cell cell) {
	    if (cell == null) return "";
	    return (cell.getCellType() == CellType.NUMERIC) 
	        ? String.valueOf((long) cell.getNumericCellValue()) 
	        : cell.getStringCellValue().trim();
	}

	public List<ApplicationListDTO> getStudentApplications(String rollNumberOrId) {
		String studentId = studentProfileRepo.findByRollNumber(rollNumberOrId).map(sp -> sp.getUserId())
				.orElse(rollNumberOrId);

		return appRepo.findByStudentId(studentId).stream().map(app -> {
	        Job job = app.getJob();

	        // Check if the application is in Hired state
	        String displayStatus;
	        if (app.getStatus() == Application.AppStatus.Hired || "Hired".equalsIgnoreCase(app.getCurrentRoundStatus())) {
	            displayStatus = "🎉 Hired";
	        } else {
	            displayStatus = (app.getCurrentRoundStatus() != null) ? 
	                    app.getCurrentRoundStatus() : app.getStatus().name().replace("_", " ");
	        }

	        ApplicationListDTO.JobSummary summary = new ApplicationListDTO.JobSummary(
	            job.getId(), job.getTitle(), job.getCompanyName(), 
	            job.getJobType().name(), job.getLocation()
	        );

	        return new ApplicationListDTO(summary, displayStatus, app.getAppliedAt());
	    }).collect(Collectors.toList());
	}

	public List<TimelineDTO> getHiringTimeline(String jobId, String studentId) throws Exception {
	    Job job = jobRepo.findById(jobId).orElseThrow();
	    Application app = appRepo.findByJobIdAndStudentId(jobId, studentId).orElseThrow();
	    List<Map<String, Object>> rounds = mapper.readValue(job.getRoundsJson(), new TypeReference<>() {});
	    List<TimelineDTO> timeline = new ArrayList<>();

	    int studentRoundNum = (app.getCurrentRound() != null) ? app.getCurrentRound() : 0;
	    String statusStr = app.getCurrentRoundStatus(); 
	    boolean hasFailed = (app.getStatus() == Application.AppStatus.Rejected);
	    boolean isHired = (app.getStatus() == Application.AppStatus.Hired || "Hired".equalsIgnoreCase(statusStr));

	    for (int i = 0; i < rounds.size(); i++) {
	        int loopRoundNum = i + 1;
	        Map<String, Object> round = rounds.get(i);
	        String name = (String) round.get("name");
	        String roundDate = (round.get("date") != null) ? round.get("date").toString() : "TBD";
	        String status;

	        if (loopRoundNum < studentRoundNum) {
	            status = "Qualified";
	        } else if (loopRoundNum == studentRoundNum) {
	            if (hasFailed) {
	                status = "Not Selected";
	            } else if (isHired && loopRoundNum == rounds.size()) {
	                // --- SHOW HIRED FOR THE FINAL ROUND ---
	                status = "Hired"; 
	            } else if (statusStr != null && statusStr.contains("Cleared")) {
	                status = "Qualified";
	            } else {
	                status = "Wait for Update";
	            }
	        } else {
	            status = hasFailed ? "Process Terminated" : "Pending";
	        }

	        timeline.add(new TimelineDTO(name, status, roundDate));
	    }
	    return timeline;
	}
	
	


}