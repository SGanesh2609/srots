package com.srots.service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
import com.srots.dto.jobdto.JobHiringStatsDTO;
import com.srots.dto.jobdto.JobRoundProgressDTO;
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
import com.srots.repository.EducationRecordRepository;
import com.srots.repository.JobRepository;
import com.srots.repository.StudentProfileRepository;
import com.srots.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class ApplicantServiceImpl implements ApplicantService {
	
	
	@Autowired private JobRepository jobRepo;
	@Autowired private ApplicationRepository appRepo;
	@Autowired private UserRepository userRepo;
	@Autowired private EducationRecordRepository eduRepo;
	@Autowired private ObjectMapper mapper;
	@Autowired private StudentProfileRepository studentProfileRepo;
	@Autowired private FileService fileService;

	// Bridge to other services
	@Autowired private JobManagementService jobManagementService;
	@Autowired private JobSearchService jobSearchService;
	@Autowired private JobMapper jobMapper;
	@Autowired private NotificationService notificationService;

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

	
	@Override
	public List<User> getApplicants(String jobId) {
		return appRepo.findByJobId(jobId).stream().map(Application::getStudent).collect(Collectors.toList());
	}

	@Override
	public List<User> getEligibleStudents(String jobId) {
		Job job = jobManagementService.getJobEntity(jobId);
		return userRepo.findByCollegeIdAndRole(job.getCollege().getId(), User.Role.STUDENT).stream()
				.filter(s -> jobSearchService.getStudentJobStatus(jobId, s.getId()).isEligible())
				.collect(Collectors.toList());
	}
	
	
	// --- Result Processing & Auto-Application ---
	
	@Transactional
	public Map<String, Object> uploadRoundResults(String jobId, int roundIndex, MultipartFile file) throws Exception {
	    Job job = jobRepo.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
	    List<Map<String, Object>> rounds = mapper.readValue(job.getRoundsJson(), new TypeReference<>() {});

	    int actualIndex = roundIndex - 1;
	    if (actualIndex < 0 || actualIndex >= rounds.size()) {
	        throw new RuntimeException("Invalid round index.");
	    }

	    // --- NEW: SEQUENTIAL ROUND VALIDATION ---
	    if (roundIndex > 1) {
	        int prevRound = roundIndex - 1;
	        // Check if there is at least one student who cleared the previous round
	        boolean prevRoundUploaded = appRepo.existsByJobIdAndCurrentRoundAndCurrentRoundStatusContaining(jobId, prevRound, "Cleared");
	        
	        if (!prevRoundUploaded) {
	            throw new RuntimeException("Cannot upload results for Round " + roundIndex + 
	                " because Round " + prevRound + " results have not been processed yet.");
	        }
	    }
	    // ----------------------------------------

	    String roundName = (String) rounds.get(actualIndex).get("name");
	    Workbook workbook = WorkbookFactory.create(file.getInputStream());
	    Sheet sheet = workbook.getSheetAt(0);

	    int passedCount = 0;
	    int rejectedCount = 0;
	    int autoCreatedCount = 0;
	    List<String> errors = new ArrayList<>();

	    Row headerRow = sheet.getRow(0);
	    int rollCol = -1, resultCol = -1;
	    for (Cell cell : headerRow) {
	        String val = cell.getStringCellValue().toLowerCase().replaceAll("[ ._]", "");
	        if (val.contains("rollnumber")) rollCol = cell.getColumnIndex();
	        if (val.contains("result") || val.contains("status")) resultCol = cell.getColumnIndex();
	    }

	    if (rollCol == -1 || resultCol == -1) {
	        throw new RuntimeException("Excel header must contain 'Roll Number' and 'Result/Status' columns.");
	    }

	    for (int i = 1; i <= sheet.getLastRowNum(); i++) {
	        Row row = sheet.getRow(i);
	        if (row == null) continue;
	        try {
	            String rollNumber = getCellValueAsString(row.getCell(rollCol));
	            String resultText = getCellValueAsString(row.getCell(resultCol));

	            if (rollNumber.isBlank()) continue;

	            Optional<StudentProfile> profileOpt = studentProfileRepo.findByRollNumber(rollNumber);

	            if (profileOpt.isPresent()) {
	                String studentId = profileOpt.get().getUserId();
	                Optional<Application> appOpt = appRepo.findByJobIdAndStudentId(jobId, studentId);

	                Application app;
	                if (appOpt.isPresent()) {
	                    app = appOpt.get();
	                    
	                    // --- NEW: STUDENT ELIGIBILITY FOR THIS SPECIFIC ROUND ---
	                    // If uploading Round 2+, the student must have "Cleared" the previous round
	                    if (roundIndex > 1) {
	                        boolean clearedPrev = app.getCurrentRound() != null && 
	                                             app.getCurrentRound() == (roundIndex - 1) && 
	                                             app.getCurrentRoundStatus().contains("Cleared");
	                        
	                        if (!clearedPrev) {
	                            errors.add("Row " + i + ": Roll " + rollNumber + " did not clear the previous round. Skipping.");
	                            continue;
	                        }
	                    }
	                } else {
	                    // Only Round 1 allows auto-creation of applications
	                    if (roundIndex == 1) {
	                        StudentJobViewDTO eligibility = jobSearchService.getStudentJobStatus(jobId, studentId);
	                        if (eligibility.isEligible()) {
	                            User studentUser = userRepo.findById(studentId).orElseThrow();
	                            app = new Application();
	                            app.setJob(job);
	                            app.setStudent(studentUser);
	                            app.setStatus(Application.AppStatus.Applied);
	                            autoCreatedCount++;
	                        } else {
	                            errors.add("Row " + i + ": Roll " + rollNumber + " is NOT ELIGIBLE. Application not created.");
	                            continue;
	                        }
	                    } else {
	                        errors.add("Row " + i + ": Roll " + rollNumber + " has no existing application for previous rounds.");
	                        continue;
	                    }
	                }

	                // Process Results
	                app.setCurrentRound(roundIndex);
	                String notifyStatus;
	                if (resultText.equalsIgnoreCase("Passed") || resultText.equalsIgnoreCase("Qualified")) {
	                    if (roundIndex == rounds.size()) {
	                        app.setCurrentRoundStatus("Hired");
	                        app.setStatus(Application.AppStatus.Hired);
	                        notifyStatus = "Hired";
	                    } else {
	                        app.setCurrentRoundStatus(roundName + " Cleared");
	                        app.setStatus(Application.AppStatus.Shortlisted);
	                        notifyStatus = "Cleared";
	                    }
	                    passedCount++;
	                } else {
	                    app.setCurrentRoundStatus("Rejected in " + roundName);
	                    app.setStatus(Application.AppStatus.Rejected);
	                    notifyStatus = "Rejected";
	                    rejectedCount++;
	                }
	                appRepo.save(app);
	                notificationService.notifyRoundResult(app.getStudent(), job, roundName, notifyStatus);
	            } else {
	                errors.add("Row " + i + ": Roll " + rollNumber + " not found in DB.");
	            }
	        } catch (Exception e) {
	            errors.add("Row " + i + ": General error processing row.");
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

	private String getCellValueAsString(Cell cell) {
	    if (cell == null) return "";
	    if (cell.getCellType() == CellType.NUMERIC) {
	        return String.valueOf((long) cell.getNumericCellValue());
	    }
	    return cell.getStringCellValue().trim();
	}
	
	
	@Override
	@Transactional
	public void updateApplication(String jobId, String studentId, String status) {
		Job job = jobManagementService.getJobEntity(jobId);

		// 1. Check if Job is Active
		if (job.getStatus() != Job.JobStatus.Active && "Applied".equals(status)) {
			throw new RuntimeException("Job is no longer accepting applications.");
		}

		// 2. CRITICAL: Backend Eligibility Re-validation
		// This prevents API-level bypass of the UI button restriction
		if ("Applied".equals(status)) {
			StudentJobViewDTO eligibilityStatus = jobSearchService.getStudentJobStatus(jobId, studentId);
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

		if ("Applied".equals(status)) {
			User student = userRepo.getReferenceById(studentId);
			notificationService.notifyStudentApplied(student, job);
		}
	}
	
	// --- Exports (Excel/CSV) ---
	
	@Override
	public byte[] exportApplicants(String jobId, String format) throws Exception {
	    Job job = jobManagementService.getJobEntity(jobId);
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
	public byte[] exportNotInterestedStudents(String jobId, String format) throws Exception {
	    Job job = jobManagementService.getJobEntity(jobId);
	    List<Application> apps = appRepo.findByJobIdAndStatus(jobId, Application.AppStatus.Not_Interested);
	    List<ExportDataHolder> dataList = apps.stream()
	            .map(app -> new ExportDataHolder(
	                app.getStudent(),
	                true,
	                "Not Interested",
	                app.getAppliedBy() != null ? app.getAppliedBy().name() : "Self"
	            ))
	            .sorted((a, b) -> a.user.getFullName().compareToIgnoreCase(b.user.getFullName()))
	            .collect(Collectors.toList());
	    return generateExportFile(job, dataList, format, "Not_Interested_Students", false);
	}

	@Override
	public byte[] exportAllEligibleStudents(String jobId, String format) throws Exception {
		Job job = jobManagementService.getJobEntity(jobId);
		List<User> collegeStudents = userRepo.findByCollegeId(job.getCollege().getId());
		List<ExportDataHolder> dataList = collegeStudents.stream().map(student -> {
			StudentJobViewDTO status = jobSearchService.getStudentJobStatus(jobId, student.getId());
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
		
		// --- Handle Dynamic Academic Scores with Dot Notation ---
	    // Matches: class10.percentage, ug.cgpa, diploma.marks, etc.
	    String lowerFieldName = fieldName.toLowerCase();
	    if (lowerFieldName.contains("class10") || lowerFieldName.contains("10th")) {
	        return formatToJobRequirement(eduRecords, "Class 10", extractTargetFormat(fieldName, job.getFormat10th()));
	    }
	    if (lowerFieldName.contains("class12") || lowerFieldName.contains("12th")) {
	        return formatToJobRequirement(eduRecords, "Class 12", extractTargetFormat(fieldName, job.getFormat12th()));
	    }
	    if (lowerFieldName.contains("ug") || lowerFieldName.contains("btech") || lowerFieldName.contains("cgpa")) {
	        return formatToJobRequirement(eduRecords, "Undergraduate", extractTargetFormat(fieldName, job.getFormatUg()));
	    }
	    if (lowerFieldName.contains("diploma")) {
	        return formatToJobRequirement(eduRecords, "Diploma", extractTargetFormat(fieldName, job.getFormatDiploma()));
	    }

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
//		case "10thscore", "class10" -> formatToJobRequirement(eduRecords, "Class 10", job.getFormat10th());
//		case "12thscore", "class12" -> formatToJobRequirement(eduRecords, "Class 12", job.getFormat12th());
//		case "ugscore", "cgpa", "btechcgpa" -> formatToJobRequirement(eduRecords, "Undergraduate", job.getFormatUg());
//		case "diplomascore" -> formatToJobRequirement(eduRecords, "Diploma", job.getFormatDiploma());

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
	
	/**
	 * Helper to determine if we should use the format from the field name (e.g. .percentage)
	 * or the default format defined in the Job entity.
	 */
	private String extractTargetFormat(String fieldName, String jobDefaultFormat) {
	    if (fieldName.contains(".")) {
	        String suffix = fieldName.substring(fieldName.lastIndexOf(".") + 1).toLowerCase();
	        if (suffix.contains("percentage")) return "PERCENTAGE";
	        if (suffix.contains("cgpa")) return "CGPA10";
	    }
	    return jobDefaultFormat != null ? jobDefaultFormat : "PERCENTAGE";
	}

//	private String formatToJobRequirement(List<EducationRecord> records, String level, String targetFormat) {
//		BigDecimal normalized = getNormalizedScore(records, level);
//		if (normalized.compareTo(BigDecimal.ZERO) == 0)
//			return "N/A";
//
//		// targetFormat comes from job.getFormat10th(), job.getFormatUg(), etc.
//		if ("CGPA10".equalsIgnoreCase(targetFormat)) {
//			return normalized.divide(new BigDecimal("10"), 2, RoundingMode.HALF_UP).toString();
//		}
//		if ("CGPA4".equalsIgnoreCase(targetFormat)) {
//			return normalized.divide(new BigDecimal("25"), 2, RoundingMode.HALF_UP).toString();
//		}
//
//		// Default: Show as Percentage
//		return normalized.setScale(2, RoundingMode.HALF_UP).toString() + "%";
//	}
//	
//	private BigDecimal getNormalizedScore(List<EducationRecord> records, String level) {
//		if (records == null)
//			return BigDecimal.ZERO;
//
//		// Normalize level string to match Enum values like "Class 10"
//		String targetLevel = level.replace("10th", "Class 10").replace("12th", "Class 12");
//
//		return records.stream()
//				.filter(r -> r.getLevel() != null && r.getLevel().toString().equalsIgnoreCase(targetLevel)).findFirst()
//				.map(r -> {
//					// 1. If system already calculated percentageEquiv, use it as the source of
//					// truth
//					if (r.getPercentageEquiv() != null && r.getPercentageEquiv().compareTo(BigDecimal.ZERO) > 0) {
//						return r.getPercentageEquiv();
//					}
//
//					// 2. Otherwise, parse the scoreDisplay string
//					BigDecimal score = BigDecimal.ZERO;
//					try {
//						if (r.getScoreDisplay() != null) {
//							score = new BigDecimal(r.getScoreDisplay().replaceAll("[^0-9.]", ""));
//						}
//					} catch (Exception e) {
//						return BigDecimal.ZERO;
//					}
//
//					// 3. Standardization Logic based on ScoreType Enum
//					EducationRecord.ScoreType type = r.getScoreType();
//					if (type == null)
//						return score;
//
//					return switch (type) {
//					case CGPA -> {
//						// Logic: If score <= 4.0, it's a 4-point scale. If > 4.0, it's a 10-point
//						// scale.
//						if (score.compareTo(new BigDecimal("5.0")) <= 0) {
//							yield score.multiply(new BigDecimal("25")); // 4.0 scale (4.0 * 25 = 100%)
//						}
//						yield score.multiply(new BigDecimal("10")); // 10.0 scale (9.2 * 10 = 92%)
//					}
//					case Grade -> {
//						// Mapping standard grades to percentage if stored as numbers
//						yield score.multiply(new BigDecimal("10"));
//					}
//					case Marks, Percentage -> score; // Marks are usually pre-calculated into percentageEquiv
//					default -> score;
//					};
//				}).orElse(BigDecimal.ZERO);
//	}
	
	private String formatToJobRequirement(List<EducationRecord> records, String level, String targetFormat) {
	    BigDecimal normalized = getNormalizedScore(records, level);
	    
	    if (normalized == null || normalized.compareTo(BigDecimal.ZERO) <= 0) {
	        return "N/A";
	    }

	    if (targetFormat == null) targetFormat = "PERCENTAGE";
	    String fmt = targetFormat.toUpperCase();

	    // normalized is 0-100 (e.g., 90.00 for 90%)
	    if (fmt.contains("CGPA10")) {
	        // 90.00 -> 9.00
	        return normalized.divide(new BigDecimal("10"), 2, RoundingMode.HALF_UP).toString();
	    } 
	    else if (fmt.contains("CGPA4")) {
	        // 90.00 -> 3.6
	        return normalized.divide(new BigDecimal("25"), 2, RoundingMode.HALF_UP).toString();
	    } 
	    else if (fmt.contains("MARKS")) {
	        // If you store max marks, you could calculate absolute marks here. 
	        // Defaulting to percentage if total marks aren't known.
	        return normalized.setScale(0, RoundingMode.HALF_UP).toString();
	    }

	    // Default: Percentage (90.00%)
	    return normalized.setScale(2, RoundingMode.HALF_UP).toString() + "%";
	}
	
	private BigDecimal getNormalizedScore(List<EducationRecord> records, String level) {
	    if (records == null || records.isEmpty()) return BigDecimal.ZERO;

	    return records.stream()
	        .filter(r -> r.getLevel() != null && r.getLevel().toString().equalsIgnoreCase(level))
	        .findFirst()
	        .map(r -> {
	            // 1. Highest priority: System calculated percentage
	            if (r.getPercentageEquiv() != null && r.getPercentageEquiv().compareTo(BigDecimal.ZERO) > 0) {
	                return r.getPercentageEquiv();
	            }

	            // 2. Fallback: Parse score_display (Handles "900/1000", "9.5", "85%")
	            String display = r.getScoreDisplay();
	            if (display == null || display.isBlank()) return BigDecimal.ZERO;

	            try {
	                // Check for fraction format (900/1000)
	                if (display.contains("/")) {
	                    String[] parts = display.split("/");
	                    double obtained = Double.parseDouble(parts[0].trim());
	                    double total = Double.parseDouble(parts[1].trim());
	                    return BigDecimal.valueOf((obtained / total) * 100);
	                }

	                // Clean numeric string
	                BigDecimal score = new BigDecimal(display.replaceAll("[^0-9.]", ""));
	                EducationRecord.ScoreType type = r.getScoreType();

	                if (type == EducationRecord.ScoreType.CGPA) {
	                    // Logic: Scale 4 or Scale 10?
	                    if (score.compareTo(new BigDecimal("5.0")) <= 0) {
	                        return score.multiply(new BigDecimal("25")); // 4.0 scale
	                    }
	                    return score.multiply(new BigDecimal("10")); // 10.0 scale
	                }
	                
	                // If type is already percentage or marks (and we reached here), return as is
	                return score;

	            } catch (Exception e) {
	                return BigDecimal.ZERO;
	            }
	        }).orElse(BigDecimal.ZERO);
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
	
	// --- Student Tracking ---
	
	public List<ApplicationListDTO> getStudentApplications() {
	    // Get the student's identity from the Auth Token
	    String currentUserId = getCurrentUserContext().get("userId"); 
	    
	    // Use the ID directly to find applications
	    return appRepo.findByStudentId(currentUserId).stream().map(app -> {
	        Job job = app.getJob();

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
	
	@Override
	public List<TimelineDTO> getHiringTimeline(String jobId) throws Exception {
	    // Get identity from Auth Context instead of parameter
	    String studentId = getCurrentUserContext().get("userId");

	    Job job = jobManagementService.getJobEntity(jobId);
	    Application app = appRepo.findByJobIdAndStudentId(jobId, studentId)
	            .orElseThrow(() -> new RuntimeException("Application not found for this student"));
	    
	    List<Map<String, Object>> rounds = mapper.readValue(job.getRoundsJson(), new TypeReference<>() {});
	    List<TimelineDTO> timeline = new ArrayList<>();

	    // 1. Initial Milestone: Applied
	    timeline.add(new TimelineDTO("Applied", "Completed", app.getAppliedAt().toString()));

	    int studentCurrentRoundNum = (app.getCurrentRound() != null) ? app.getCurrentRound() : 1;
	    String currentStatusStr = app.getCurrentRoundStatus(); 
	    boolean hasFailed = (app.getStatus() == Application.AppStatus.Rejected);
	    boolean isHired = (app.getStatus() == Application.AppStatus.Hired || "Hired".equalsIgnoreCase(currentStatusStr));

	    // 2. Iterate through dynamic job rounds
	    for (int i = 0; i < rounds.size(); i++) {
	        int roundNum = i + 1;
	        Map<String, Object> round = rounds.get(i);
	        String name = (String) round.get("name");
	        String roundDate = (round.get("date") != null) ? round.get("date").toString() : "TBD";
	        String status;

	        if (isHired) {
	            status = "Completed";
	        } else if (roundNum < studentCurrentRoundNum) {
	            status = "Completed";
	        } else if (roundNum == studentCurrentRoundNum) {
	            if (hasFailed) {
	                status = "Rejected";
	            } else if (currentStatusStr != null && currentStatusStr.contains("Cleared")) {
	                status = "Completed";
	            } else {
	                status = "In Progress";
	            }
	        } else {
	            status = hasFailed ? "Process Terminated" : "Locked";
	        }

	        timeline.add(new TimelineDTO(name, status, roundDate));
	    }
	    
	    return timeline;
	}
	
//	/**
//	 * NEW METHOD: Get eligible students with custom fields for UI display
//	 * 
//	 * Similar to exportAllEligibleStudents but returns data structure for UI table
//	 * instead of file download. Shows only the fields specified in requiredFieldsJson.
//	 */
//	@Override
//	public Map<String, Object> getEligibleStudentsDisplay(String jobId) throws Exception {
//	    Job job = jobManagementService.getJobEntity(jobId);
//	    String collegeId = job.getCollege().getId();
//	    
//	    // Get all students in the college
//	    List<User> collegeStudents = userRepo.findByCollegeId(collegeId);
//	    
//	    // Parse required fields from job
//	    List<String> requiredFields = mapper.readValue(
//	        job.getRequiredFieldsJson(), 
//	        new TypeReference<List<String>>() {}
//	    );
//	    
//	    // Build headers: static + dynamic
//	    List<String> headers = new ArrayList<>();
////	    headers.add("Roll Number");
////	    headers.add("Full Name");
//	    headers.add("Applied Status");
//	    
//	    // Add dynamic headers from requiredFields
//	    requiredFields.forEach(f -> headers.add(toTitleCase(f)));
//	    
//	    // Build student data rows
//	    List<Map<String, Object>> students = new ArrayList<>();
//	    
//	    for (User student : collegeStudents) {
//	        StudentJobViewDTO status = jobSearchService.getStudentJobStatus(jobId, student.getId());
//	        
//	        // Only include eligible students
//	        if (!status.isEligible()) continue;
//	        
//	        // Check if student has applied
//	        boolean isApplied = appRepo.findByJobIdAndStudentId(jobId, student.getId()).isPresent();
//	        
//	        // Create holder for field extraction
//	        ExportDataHolder holder = new ExportDataHolder(
//	            student, 
//	            true,  // isEligible 
//	            isApplied, 
//	            isApplied ? "Applied" : "Not Applied"
//	        );
//	        
//	        // Build row data
//	        Map<String, Object> row = new LinkedHashMap<>();
//	        row.put("studentId", student.getId()); // For internal use
////	        row.put("Roll Number", extractStudentField(student, "rollnumber", job, holder));
////	        row.put("Full Name", student.getFullName());
//	        row.put("Applied Status", isApplied ? "Applied" : "Not Applied");
//	        
//	        // Add dynamic field values
//	        for (String field : requiredFields) {
//	            row.put(toTitleCase(field), extractStudentField(student, field, job, holder));
//	        }
//	        
//	        students.add(row);
//	    }
//	    
//	    // Return structure matching dashboard format
//	    Map<String, Object> result = new LinkedHashMap<>();
//	    result.put("headers", headers);
//	    result.put("students", students);
//	    result.put("totalEligible", students.size());
//	    
//	    return result;
//	}
	
	@Override
	public Map<String, Object> getEligibleStudentsDisplay(String jobId) throws Exception {
	    Job job = jobManagementService.getJobEntity(jobId);
	    String collegeId = job.getCollege().getId();
	    
	    // Get all students in the college
	    List<User> collegeStudents = userRepo.findByCollegeId(collegeId);
	    
	    // Parse required fields from job
	    List<String> requiredFields = mapper.readValue(
	        job.getRequiredFieldsJson(), 
	        new TypeReference<List<String>>() {}
	    );
	    
	    // 1. BUILD HEADERS: Force Identity fields first
	    List<String> headers = new ArrayList<>();
	    headers.add("Roll Number");
	    headers.add("Full Name");
	    headers.add("Applied Status");
	    
	    // Add dynamic headers (avoiding duplicates of Roll Number/Full Name)
	    for (String field : requiredFields) {
	        String titleCased = toTitleCase(field);
	        if (!headers.contains(titleCased)) {
	            headers.add(titleCased);
	        }
	    }
	    
	    // Build student data rows
	    List<Map<String, Object>> students = new ArrayList<>();
	    
	    for (User student : collegeStudents) {
	        StudentJobViewDTO status = jobSearchService.getStudentJobStatus(jobId, student.getId());
	        
	        // Only include eligible students
	        if (!status.isEligible()) continue;
	        
	        // Check if student has applied
	        boolean isApplied = appRepo.findByJobIdAndStudentId(jobId, student.getId()).isPresent();
	        
	        // Create holder for field extraction
	        ExportDataHolder holder = new ExportDataHolder(
	            student, 
	            true,  // isEligible 
	            isApplied, 
	            isApplied ? "Applied" : "Not Applied"
	        );
	        
	        // 2. BUILD ROW DATA: Map values strictly to the headers list
	        Map<String, Object> row = new LinkedHashMap<>();
	        row.put("studentId", student.getId()); // For internal/UI key use
	        
	        // Populate standard identity/status fields
	        row.put("Roll Number", extractStudentField(student, "rollnumber", job, holder));
	        row.put("Full Name", student.getFullName() != null ? student.getFullName() : "N/A");
	        row.put("Applied Status", isApplied ? "Applied" : "Not Applied");
	        
	        // Populate dynamic fields
	        for (String field : requiredFields) {
	            String titleKey = toTitleCase(field);
	            // Don't overwrite if it's already one of the primary keys we just set
	            if (!titleKey.equals("Roll Number") && !titleKey.equals("Full Name") && !titleKey.equals("Applied Status")) {
	                row.put(titleKey, extractStudentField(student, field, job, holder));
	            }
	        }
	        
	        students.add(row);
	    }
	    
	    // Return structure matching dashboard format
	    Map<String, Object> result = new LinkedHashMap<>();
	    result.put("headers", headers);
	    result.put("students", students);
	    result.put("totalEligible", students.size());
	    
	    return result;
	}
	
	
	// ═══════════════════════════════════════════════════════════════════════════════
	// COMPLETE BACKEND FIX - ApplicantServiceImpl.java
	// Replace these THREE methods in your ApplicantServiceImpl.java file
	// ═══════════════════════════════════════════════════════════════════════════════

	/**
	 * METHOD 1: getJobHiringStats - FIXED round counting logic
	 */
	@Override
	public JobHiringStatsDTO getJobHiringStats(String jobId) throws Exception {
	    Job job = jobRepo.findById(jobId)
	        .orElseThrow(() -> new RuntimeException("Job not found"));
	    
	    List<Map<String, Object>> roundsList = mapper.readValue(
	        job.getRoundsJson(), 
	        new TypeReference<List<Map<String, Object>>>() {}
	    );
	    
	    List<Application> allApps = appRepo.findByJobId(jobId);
	    
	    int maxRoundReached = allApps.stream()
	        .map(Application::getCurrentRound)
	        .filter(r -> r != null)
	        .max(Integer::compareTo)
	        .orElse(0);
	    
	    List<JobRoundProgressDTO> roundStats = new ArrayList<>();

	    for (int i = 0; i < roundsList.size(); i++) {
	        int roundNum = i + 1;
	        String roundName = (String) roundsList.get(i).get("name");

	        long passed = 0;
	        long rejected = 0;
	        
	        for (Application app : allApps) {
	            Integer appCurrentRound = app.getCurrentRound();
	            String appStatus = app.getCurrentRoundStatus();
	            
	            if (appCurrentRound == null) continue;
	            
	            if (appCurrentRound > roundNum) {
	                passed++;
	            } else if (appCurrentRound == roundNum) {
	                if (appStatus != null) {
	                    if (appStatus.equalsIgnoreCase("Hired") || appStatus.contains("Cleared")) {
	                        passed++;
	                    } else if (appStatus.contains("Rejected")) {
	                        rejected++;
	                    }
	                }
	            }
	        }

	        String roundStatus = "Upcoming";
	        if (maxRoundReached > roundNum) {
	            roundStatus = "Completed";
	        } else if (maxRoundReached == roundNum) {
	            if (passed > 0 || rejected > 0) {
	                roundStatus = "Completed";
	            } else {
	                roundStatus = "In Progress";
	            }
	        }

	        roundStats.add(new JobRoundProgressDTO(roundNum, roundName, passed, rejected, 0, roundStatus));
	    }

	    return new JobHiringStatsDTO(jobId, job.getTitle(), roundsList.size(), roundStats);
	}


	
	@Override
	public JobApplicantsDashboardDTO getJobApplicantsDashboard(String jobId) throws Exception {
	    Job job = jobRepo.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
	    List<Application> apps = appRepo.findByJobId(jobId);
	    List<Map<String, Object>> rounds = mapper.readValue(job.getRoundsJson(), new TypeReference<>() {});

	    // 1. Round summary logic
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

	    // 2. Define UI Headers (Hardcoded identities + dynamic fields)
	    List<String> requiredFields = mapper.readValue(job.getRequiredFieldsJson(), new TypeReference<List<String>>() {});
	    List<String> uiHeaders = new ArrayList<>(List.of("Roll Number", "Full Name", "Current Status", "Application Source"));
	    
	    for (String f : requiredFields) {
	        String title = toTitleCase(f);
	        if (!uiHeaders.contains(title)) uiHeaders.add(title);
	    }

	    long hired = 0, rejected = 0, pending = 0;
	    List<Map<String, Object>> studentList = new ArrayList<>();

	    for (Application app : apps) {
	        String source = app.getAppliedBy() != null ? app.getAppliedBy().name() : "Self";
	        
	        ExportDataHolder holder = new ExportDataHolder(
	            app.getStudent(), 
	            true, 
	            app.getCurrentRoundStatus(), 
	            source
	        );

	        String status = extractStudentField(app.getStudent(), "currentstatus", job, holder);
	        
	        if ("Hired".equalsIgnoreCase(status)) hired++;
	        else if (status.toLowerCase().contains("rejected")) rejected++;
	        else pending++;

	        // 3. Build student map strictly following uiHeaders
	        Map<String, Object> studentMap = new LinkedHashMap<>();
	        studentMap.put("studentId", app.getStudent().getId());
	        
	        for (String header : uiHeaders) {
	            Object value = "N/A";
	            if (header.equals("Roll Number")) {
	                value = extractStudentField(app.getStudent(), "rollnumber", job, holder);
	            } else if (header.equals("Full Name")) {
	                value = app.getStudent().getFullName() != null ? app.getStudent().getFullName() : "N/A";
	            } else if (header.equals("Current Status")) {
	                value = status;
	            } else if (header.equals("Application Source")) {
	                value = source;
	            } else {
	                value = extractStudentField(app.getStudent(), header, job, holder);
	            }
	            studentMap.put(header, value);
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


	
	/**
	 * UPDATED METHOD 3: generateExportFile 
	 * Ensures Roll Number and Full Name are ALWAYS present.
	 */
	private byte[] generateExportFile(Job job, List<ExportDataHolder> dataList, String format, String title,
	        boolean isEligibleExport) throws Exception {
	    
	    // 1. Load required fields from JSON
	    List<String> requiredFields = new ArrayList<>();
	    if (job.getRequiredFieldsJson() != null) {
	        requiredFields = mapper.readValue(job.getRequiredFieldsJson(), new TypeReference<List<String>>() {});
	    }
	    
	    boolean isCsv = "csv".equalsIgnoreCase(format);

	    // 2. Build complete header list
	    List<String> allHeaders = new ArrayList<>();
	    
	    // Always start with Status info
	    allHeaders.add("Current Status");
	    
	    if (!isEligibleExport) {
	        allHeaders.add("Application Source");
	    } else {
	        allHeaders.add("Applied Status");
	        allHeaders.add("Last Login");
	    }

	    // 3. MANDATORY HEADERS: Ensure Roll Number and Full Name are always there
	    // We add them here if they aren't already the first things in the list
	    if (!allHeaders.contains("Roll Number")) allHeaders.add("Roll Number");
	    if (!allHeaders.contains("Full Name")) allHeaders.add("Full Name");

	    // 4. Add the rest of the dynamic required fields
	    for (String field : requiredFields) {
	        String titleCased = toTitleCase(field);
	        // Avoid adding Roll Number or Full Name again if toTitleCase matches
	        if (!allHeaders.contains(titleCased)) {
	            allHeaders.add(titleCased);
	        }
	    }

	    if (isCsv) {
	        StringBuilder csv = new StringBuilder();
	        allHeaders.forEach(h -> csv.append(h).append(","));
	        csv.append("\n");

	        for (ExportDataHolder holder : dataList) {
	            List<String> rowData = new ArrayList<>();
	            
	            // Map data to the headers defined above
	            for (String header : allHeaders) {
	                String value = "N/A";
	                
	                if (header.equals("Current Status")) {
	                    value = extractStudentField(holder.user, "currentstatus", job, holder);
	                } else if (header.equals("Application Source")) {
	                    value = holder.appliedBy != null ? holder.appliedBy : "Self";
	                } else if (header.equals("Applied Status")) {
	                    value = holder.isApplied ? "Yes" : "No";
	                } else if (header.equals("Last Login")) {
	                    value = extractStudentField(holder.user, "lastlogin", job, holder);
	                } else if (header.equals("Roll Number")) {
	                    value = extractStudentField(holder.user, "rollnumber", job, holder);
	                } else if (header.equals("Full Name")) {
	                    value = (holder.user != null && holder.user.getFullName() != null) ? holder.user.getFullName() : "N/A";
	                } else {
	                    // It's a dynamic field from requiredFields
	                    value = extractStudentField(holder.user, header, job, holder);
	                }
	                
	                rowData.add("\"" + (value == null ? "" : value.replace("\"", "\"\"")) + "\"");
	            }
	            csv.append(String.join(",", rowData)).append("\n");
	        }
	        return csv.toString().getBytes(StandardCharsets.UTF_8);
	        
	    } else {
	        // Excel Logic
	        try (Workbook workbook = new XSSFWorkbook()) {
	            Sheet sheet = workbook.createSheet(title);
	            
	            // Header Style
	            CellStyle headerStyle = workbook.createCellStyle();
	            Font font = workbook.createFont();
	            font.setBold(true);
	            headerStyle.setFont(font);

	            // Create Header Row
	            Row headerRow = sheet.createRow(0);
	            for (int col = 0; col < allHeaders.size(); col++) {
	                Cell cell = headerRow.createCell(col);
	                cell.setCellValue(allHeaders.get(col));
	                cell.setCellStyle(headerStyle);
	            }

	            // Create Data Rows
	            int rowIdx = 1;
	            for (ExportDataHolder holder : dataList) {
	                Row row = sheet.createRow(rowIdx++);
	                for (int col = 0; col < allHeaders.size(); col++) {
	                    String header = allHeaders.get(col);
	                    String value = "N/A";
	                    
	                    if (header.equals("Current Status")) value = extractStudentField(holder.user, "currentstatus", job, holder);
	                    else if (header.equals("Application Source")) value = holder.appliedBy != null ? holder.appliedBy : "Self";
	                    else if (header.equals("Applied Status")) value = holder.isApplied ? "Yes" : "No";
	                    else if (header.equals("Last Login")) value = extractStudentField(holder.user, "lastlogin", job, holder);
	                    else if (header.equals("Roll Number")) value = extractStudentField(holder.user, "rollnumber", job, holder);
	                    else if (header.equals("Full Name")) value = (holder.user != null && holder.user.getFullName() != null) ? holder.user.getFullName() : "N/A";
	                    else value = extractStudentField(holder.user, header, job, holder);
	                    
	                    row.createCell(col).setCellValue(value);
	                }
	            }
	            
	            for (int i = 0; i < allHeaders.size(); i++) {
	                sheet.autoSizeColumn(i);
	            }
	            
	            ByteArrayOutputStream out = new ByteArrayOutputStream();
	            workbook.write(out);
	            return out.toByteArray();
	        }
	    }
	}
	

}
