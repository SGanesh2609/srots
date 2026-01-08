package com.srots.service;

import java.io.InputStream;
import java.math.BigDecimal;
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
import com.srots.dto.jobdto.JobHiringStatsDTO;
import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.dto.jobdto.JobRoundProgressDTO;
import com.srots.dto.jobdto.StudentJobViewDTO;
import com.srots.model.Application;
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
	public List<StudentJobViewDTO> getStudentPortalJobs(String filterType, String searchQuery, List<String> jobTypeFilters, List<String> workModeFilters, List<String> statusFilters) {
		String studentId = getCurrentUserContext().get("userId");
		User student = userRepo.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));

		String collegeId = (student.getCollege() != null) ? student.getCollege().getId() : null;
		if (collegeId == null)
			return new ArrayList<>();

		// Fetch all active jobs for the student's college
		List<Job> allActiveJobs = jobRepo.findByCollegeIdAndStatus(collegeId, Job.JobStatus.Active);

		return allActiveJobs.stream().map(job -> getStudentJobStatus(job.getId(), studentId)).filter(dto -> {
			
			
			if (searchQuery != null && !searchQuery.isBlank()) {
                String query = searchQuery.toLowerCase().trim();
                
                String title = dto.getJob().getTitle() != null ? dto.getJob().getTitle().toLowerCase() : "";
                String company = dto.getJob().getCompanyName() != null ? dto.getJob().getCompanyName().toLowerCase() : "";
                // Accessing the name of the staff who posted the job
                String postedBy = (dto.getJob().getPostedBy() != null && dto.getJob().getPostedBy().getFullName() != null) 
                                  ? dto.getJob().getPostedBy().getFullName().toLowerCase() : "";

                boolean matchesQuery = title.contains(query) || 
                                       company.contains(query) || 
                                       postedBy.contains(query);
                
                if (!matchesQuery) return false;
            }
			
			
			// 1. Filter by Job Type (FullTime, Internship etc) if provided
			
			if (jobTypeFilters != null && !jobTypeFilters.isEmpty()) {
                // Get the JobType from the original Job Entity inside the DTO
                // Ensure dto.getJob() returns the object containing the JobType enum
                var jobInfo = dto.getJob();
                if (jobInfo == null || jobInfo.getJobType() == null) return false;

                Job.JobType currentEnum = jobInfo.getJobType();
                String name = currentEnum.name();            // e.g., "Full_Time"
                String display = currentEnum.getDisplay();    // e.g., "Full Time"

                boolean matches = jobTypeFilters.stream().anyMatch(filter -> {
                    if (filter == null || filter.isBlank()) return false;
                    
                    String cleanFilter = filter.trim().toLowerCase().replace(" ", "").replace("_", "");
                    String cleanName = name.toLowerCase().replace("_", "");
                    String cleanDisplay = display.toLowerCase().replace(" ", "");

                    // Match against "Full_Time" OR "Full Time"
                    return cleanFilter.equals(cleanName) || cleanFilter.equals(cleanDisplay);
                });

                if (!matches) return false;
            }
			
			
			
			// 2. Work Mode Filter
            if (workModeFilters != null && !workModeFilters.isEmpty()) {
                boolean match = workModeFilters.stream().anyMatch(f -> 
                    Job.WorkMode.fromString(f) == dto.getJob().getWorkMode());
                if (!match) return false;
            }

            // 3. Status Filter (Matching against the Enum name)
            if (statusFilters != null && !statusFilters.isEmpty()) {
                boolean match = statusFilters.stream().anyMatch(f -> {
                    try {
                        return Job.JobStatus.valueOf(f) == dto.getJob().getStatus();
                    } catch (Exception e) { return false; }
                });
                if (!match) return false;
            }
			

			// 4. Main Tab Logic (Fixed naming to match your frontend/request)
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
	
	

	// --- 3. ELIGIBILITY ENGINE ---

	@Override
	public StudentJobViewDTO getStudentJobStatus(String jobId, String studentId) {
		Job job = jobManagementService.getJobEntity(jobId);
	    User student = userRepo.findById(studentId).orElseThrow();

	    // Mapping Entity to DTO
//	    JobResponseDTO jobDto = JobResponseDTO.builder()
//	            .id(job.getId())
//	            .title(job.getTitle())
//	            .companyName(job.getCompanyName())
//	            .hiringDepartment(job.getHiringDepartment())
//	            .jobType(job.getJobType() != null ? job.getJobType().getDisplay() : null)
//	            .workMode(job.getWorkMode() != null ? job.getWorkMode().getDisplay() : null)
//	            .location(job.getLocation())
//	            .salaryRange(job.getSalaryRange())
//	            .summary(job.getSummary())
//	            .responsibilitiesJson(job.getResponsibilitiesJson())
//	            .qualificationsJson(job.getQualificationsJson())
//	            .preferredQualificationsJson(job.getPreferredQualificationsJson())
//	            .benefitsJson(job.getBenefitsJson())
//	            .companyCulture(job.getCompanyCulture())
//	            .physicalDemands(job.getPhysicalDemands())
//	            .eeoStatement(job.getEeoStatement())
//	            .internalId(job.getInternalId())
//	            .applicationDeadline(job.getApplicationDeadline())
//	            .externalLink(job.getExternalLink())
//	            .status(job.getStatus() != null ? job.getStatus().name() : null)
//	            .postedAt(job.getPostedAt()) // LocalDateTime to LocalDateTime
//	            .minUgScore(job.getMinUgScore())
//	            .maxBacklogs(job.getMaxBacklogs())
//	            .min10thScore(job.getMin10thScore())
//	            .min12thScore(job.getMin12thScore())
//	            .allowGaps(job.getAllowGaps())
//	            .allowedBranches(job.getAllowedBranches()) // String to String
//	            .eligibleBatches(job.getEligibleBatches()) // String to String
//	            .roundsJson(job.getRoundsJson())
//	            .requiredFieldsJson(job.getRequiredFieldsJson())
//	            .attachmentsJson(job.getAttachmentsJson())
//	            .build();
//
//	    // Map College
//	    if (job.getCollege() != null) {
//	        jobDto.setCollege(new CollegeSummaryDTO(
//	            job.getCollege().getId(),
//	            job.getCollege().getName(),
//	            job.getCollege().getCode(),
//	            job.getCollege().getType(),
//	            job.getCollege().getLogoUrl()
//	        ));
//	    }
//
//	    // Map User
//	    if (job.getPostedBy() != null) {
//	        jobDto.setPostedBy(new UserSummaryDTO(
//	            job.getPostedBy().getId(),
//	            job.getPostedBy().getFullName(),
//	            job.getPostedBy().getEmail(),
//	            job.getPostedBy().getUsername(),
//	            job.getPostedBy().getRole().name(),
//	            job.getPostedBy().getAvatarUrl()
//	        ));
//	    }
//
//	    StudentJobViewDTO viewDto = new StudentJobViewDTO();
//	    viewDto.setJob(jobDto);
	    
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