package com.srots.service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.jobdto.JobDetailDTO;
import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.dto.jobdto.StudentJobViewDTO;
import com.srots.model.EducationRecord;
import com.srots.model.Job;
import com.srots.model.User;
import com.srots.repository.ApplicationRepository;
import com.srots.repository.EducationRecordRepository;
import com.srots.repository.JobRepository;
import com.srots.repository.UserRepository;

@Service
public class JobSearchServiceImpl implements JobSearchService {

	@Autowired private JobRepository jobRepo;
	@Autowired private ApplicationRepository appRepo;
	@Autowired private UserRepository userRepo;
	@Autowired private EducationRecordRepository eduRepo;
	@Autowired private ObjectMapper mapper;
	@Autowired private FileService fileService;
	
    // INJECTED COMPONENTS
	@Autowired private JobMapper jobMapper; 
	@Autowired private JobManagementService jobManagementService;

	// --- 1. ACCESS CONTROL ---

	
	
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

	// --- 2. SEARCH & LISTING LOGIC ---
	
	
//	@Override
//	public List<JobResponseDTO> getAdminJobs(String collegeId, String query, Job.JobType jobType,
//			Job.WorkMode workMode, Job.JobStatus status) {
//		Map<String, String> context = getCurrentUserContext();
//		String currentUserId = context.get("userId");
//		String currentUserRole = context.get("role");
//
//		// HIERARCHY LOGIC:
//		// If STAFF, we pass their ID to the query to limit results.
//		// If CPH, we pass NULL so they see all jobs in the college.
//		String filterByUserId = "STAFF".equals(currentUserRole) ? currentUserId : null;
//
//		List<Job> jobs = jobRepo.filterJobsForPortal(collegeId, filterByUserId, query, jobType, workMode, status);
//
//		
//		return jobs.stream()
//				.map(job -> jobMapper.toResponseDTO(job, currentUserId, currentUserRole))
//				.collect(Collectors.toList());
//		
//		
//	}
	
//	@Override
//	public List<JobResponseDTO> getAdminJobs(
//	    String collegeId, 
//	    String query, 
//	    Job.JobType jobType,
//	    Job.WorkMode workMode, 
//	    Job.JobStatus status
//	) {
//	    Map<String, String> context = getCurrentUserContext();
//	    String currentUserId = context.get("userId");
//	    String currentUserRole = context.get("role");
//
//	    // CRITICAL FIX: STAFF should see ALL college jobs, not just their own
//	    // Only pass userId filter if explicitly needed
//	    String filterByUserId = null;  // Changed from: "STAFF".equals(currentUserRole) ? currentUserId : null;
//
//	    List<Job> jobs = jobRepo.filterJobsForPortal(
//	        collegeId, 
//	        filterByUserId,  // Always null - show all jobs
//	        query, 
//	        jobType, 
//	        workMode, 
//	        status
//	    );
//
//	    return jobs.stream()
//	        .map(job -> jobMapper.toResponseDTO(job, currentUserId, currentUserRole))
//	        .collect(Collectors.toList());
//	}
	
	@Override
	public List<JobResponseDTO> getAdminJobs(
	        String collegeId,
	        String query,
	        Job.JobType jobType,
	        Job.WorkMode workMode,
	        Job.JobStatus status,
	        String postedById) {

	    Map<String, String> context = getCurrentUserContext();
	    String currentUserId   = context.get("userId");
	    String currentUserRole = context.get("role");

	    // postedById comes from frontend when user clicks "My Jobs"
	    // When null → show ALL college jobs (CPH sees all, STAFF also sees all)
	    List<Job> jobs = jobRepo.filterJobsForPortal(
	            collegeId, postedById, query, jobType, workMode, status);

	    return jobs.stream()
	            .map(job -> jobMapper.toResponseDTO(job, currentUserId, currentUserRole))
	            .collect(Collectors.toList());
	}

	@Override
	public JobDetailDTO getJobDetail(String jobId) {
		Job job = jobManagementService.getJobEntity(jobId);
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
	public List<StudentJobViewDTO> getStudentPortalJobs(
	    String filterType, 
	    String searchQuery, 
	    List<String> jobTypeFilters, 
	    List<String> workModeFilters, 
	    List<String> statusFilters
	) {
	    String studentId = getCurrentUserContext().get("userId");
	    User student = userRepo.findById(studentId)
	        .orElseThrow(() -> new RuntimeException("Student not found"));

	    String collegeId = (student.getCollege() != null) ? student.getCollege().getId() : null;
	    if (collegeId == null) return new ArrayList<>();

	    // CRITICAL FIX: Fetch ALL jobs, not just Active
	    // We need all jobs to properly filter by status (Active/Closed/Expired)
	    List<Job> allJobs = jobRepo.findByCollegeId(collegeId);

	    return allJobs.stream()
	        .map(job -> getStudentJobStatus(job.getId(), studentId))
	        .filter(dto -> {
	            
	            // ═══════════════════════════════════════════════════════
	            // FILTER 1: Search Query
	            // ═══════════════════════════════════════════════════════
	            if (searchQuery != null && !searchQuery.isBlank()) {
	                String query = searchQuery.toLowerCase().trim();
	                
	                String title = dto.getJob().getTitle() != null 
	                    ? dto.getJob().getTitle().toLowerCase() : "";
	                String company = dto.getJob().getCompanyName() != null 
	                    ? dto.getJob().getCompanyName().toLowerCase() : "";
	                String postedBy = (dto.getJob().getPostedBy() != null 
	                    && dto.getJob().getPostedBy().getFullName() != null) 
	                    ? dto.getJob().getPostedBy().getFullName().toLowerCase() : "";

	                boolean matchesQuery = title.contains(query) || 
	                                       company.contains(query) || 
	                                       postedBy.contains(query);
	                
	                if (!matchesQuery) return false;
	            }
	            
	            // ═══════════════════════════════════════════════════════
	            // FILTER 2: Job Type (Full-Time, Internship, Part-Time)
	            // ═══════════════════════════════════════════════════════
	            if (jobTypeFilters != null && !jobTypeFilters.isEmpty()) {
	                var jobInfo = dto.getJob();
	                if (jobInfo == null || jobInfo.getJobType() == null) return false;

	                Job.JobType currentEnum = jobInfo.getJobType();
	                String name = currentEnum.name();            // "Full_Time"
	                String display = currentEnum.getDisplay();    // "Full Time"

	                boolean matches = jobTypeFilters.stream().anyMatch(filter -> {
	                    if (filter == null || filter.isBlank()) return false;
	                    
	                    String cleanFilter = filter.trim().toLowerCase()
	                        .replace(" ", "").replace("_", "").replace("-", "");
	                    String cleanName = name.toLowerCase().replace("_", "");
	                    String cleanDisplay = display.toLowerCase().replace(" ", "");

	                    return cleanFilter.equals(cleanName) || cleanFilter.equals(cleanDisplay);
	                });

	                if (!matches) return false;
	            }
	            
	            // ═══════════════════════════════════════════════════════
	            // FILTER 3: Work Mode (Remote, Hybrid, On-Site)
	            // ═══════════════════════════════════════════════════════
	            if (workModeFilters != null && !workModeFilters.isEmpty()) {
	                boolean match = workModeFilters.stream().anyMatch(f -> 
	                    Job.WorkMode.fromString(f) == dto.getJob().getWorkMode()
	                );
	                if (!match) return false;
	            }

	            // ═══════════════════════════════════════════════════════
	            // FILTER 4: Job Status (Active, Closed, Draft)
	            // ═══════════════════════════════════════════════════════
	            if (statusFilters != null && !statusFilters.isEmpty()) {
	                boolean match = statusFilters.stream().anyMatch(f -> {
	                    try {
	                        return Job.JobStatus.valueOf(f) == dto.getJob().getStatus();
	                    } catch (Exception e) { 
	                        return false; 
	                    }
	                });
	                if (!match) return false;
	            }
	            
	            // ═══════════════════════════════════════════════════════
	            // FILTER 5: Main Tab Filter (LAST - after all other filters)
	            // ═══════════════════════════════════════════════════════
	            String type = (filterType == null) ? "all" : filterType.toLowerCase();
	            
	            return switch (type) {
	                // All jobs (eligible + non-eligible, applied + not applied)
	                case "all" -> true;
	                
	                // For You = All eligible jobs (applied + not applied)
	                case "for_you" -> dto.isEligible();
	                
	                // Applied = Eligible AND already applied
	                case "applied" -> dto.isEligible() && dto.isApplied();
	                
	                // Not Applied = Eligible BUT not yet applied AND not expired
	                case "not_applied" -> dto.isEligible() && !dto.isApplied() && !dto.isExpired();
	                
	                // Expired = Eligible AND not applied AND deadline passed
	                case "expired" -> dto.isEligible() && !dto.isApplied() && dto.isExpired();
	                
	                // Default: show all
	                default -> true;
	            };
	        })
	        .collect(Collectors.toList());
	}
	
	

	// --- 3. ELIGIBILITY ENGINE ---

	@Override
	public StudentJobViewDTO getStudentJobStatus(String jobId, String studentId) {
	    Job job = jobManagementService.getJobEntity(jobId);
	    User student = userRepo.findById(studentId).orElseThrow();

	    StudentJobViewDTO dto = new StudentJobViewDTO();
	    dto.setJob(job);
	    dto.setApplied(appRepo.findByJobIdAndStudentId(jobId, studentId).isPresent());

	    if (student.getStudentProfile() == null) {
	        dto.setEligible(false);
	        dto.setNotEligibilityReason("Incomplete profile.");
	        dto.setExpired(false);  // Add expired flag
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
	            List<String> batches = mapper.readValue(job.getEligibleBatches(), new TypeReference<List<String>>() {});
	            String sBatch = String.valueOf(student.getStudentProfile().getBatch());
	            if (!batches.contains(sBatch)) {
	                eligible = false;
	                reason.append("Batch mismatch. ");
	            }
	        } catch (Exception e) { /* ignore */ }
	    }

	    // 3. Branch Check
	    if (eligible && job.getAllowedBranches() != null) {
	        try {
	            List<String> allowedBranches = mapper.readValue(job.getAllowedBranches(),
	                    new TypeReference<List<String>>() {});
	            String studentBranch = student.getStudentProfile().getBranch();
	            boolean branchMatch = allowedBranches.stream().anyMatch(b -> b.equalsIgnoreCase(studentBranch));
	            if (!branchMatch) {
	                eligible = false;
	                reason.append("Branch not eligible. ");
	            }
	        } catch (Exception e) { /* ignore */ }
	    }

	    // 4. Score Checks
	    List<EducationRecord> eduRecords = eduRepo.findByStudentId(studentId);
	    
	    if (eligible)
	        eligible = checkScoreEligibility(eduRecords, "Undergraduate", job.getMinUgScore(), job.getFormatUg(), reason);
	    
	    if (eligible)
	        eligible = checkScoreEligibility(eduRecords, "Class 10", job.getMin10thScore(), job.getFormat10th(), reason);
	    
	    if (eligible) {
	        BigDecimal min12th = job.getMin12thScore();
	        if (min12th != null && min12th.compareTo(BigDecimal.ZERO) > 0) {
	            BigDecimal score12th = getNormalizedScore(eduRecords, "Class 12");
	            BigDecimal scoreDiploma = getNormalizedScore(eduRecords, "Diploma");
	            BigDecimal studentSecondaryScore = (score12th.compareTo(BigDecimal.ZERO) > 0) ? score12th : scoreDiploma;
	            BigDecimal threshold = normalizeJobRequirement(min12th, job.getFormat12th());

	            if (studentSecondaryScore.compareTo(threshold) < 0) {
	                eligible = false;
	                reason.append("12th/Diploma score below threshold. ");
	            }
	        }
	    }

	    // 5. Backlog Check
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

	    // ═══════════════════════════════════════════════════════════
	    // CRITICAL FIX: Calculate expired flag
	    // ═══════════════════════════════════════════════════════════
	    boolean isExpired = job.getApplicationDeadline() != null 
	        && job.getApplicationDeadline().isBefore(LocalDate.now());

	    dto.setEligible(eligible);
	    dto.setNotEligibilityReason(reason.toString().trim());
	    dto.setExpired(isExpired);  // ADD THIS LINE!

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
	public BigDecimal getNormalizedScore(List<EducationRecord> records, String level) {
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
	
	
	
	
	
}