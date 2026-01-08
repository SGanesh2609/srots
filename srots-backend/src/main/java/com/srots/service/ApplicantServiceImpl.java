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

	
	//--Dashboard and Management
	
	@Override
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

	public JobHiringStatsDTO getJobHiringStats(String jobId) throws Exception {
	    Job job = jobRepo.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
	    List<Map<String, Object>> roundsList = mapper.readValue(job.getRoundsJson(), new TypeReference<>() {});
	    List<JobRoundProgressDTO> roundStats = new ArrayList<>();

	    for (int i = 0; i < roundsList.size(); i++) {
	        int roundNum = i + 1;
	        String roundName = (String) roundsList.get(i).get("name");

	        long passed = appRepo.countByJobIdAndCurrentRoundAndCurrentRoundStatusContaining(jobId, roundNum, "Cleared");
	        if (roundNum == roundsList.size()) {
	            passed += appRepo.countByJobIdAndStatus(jobId, Application.AppStatus.Hired);
	        }

	        long rejected = appRepo.countByJobIdAndCurrentRoundAndCurrentRoundStatusContaining(jobId, roundNum, "Rejected");
	        
	        // Logic for Round Status
	        String roundStatus = "Upcoming";
	        if (passed > 0 || rejected > 0) {
	            roundStatus = "In Progress";
	        }
	        
	        // If there's anyone in a round higher than this, this round is "Completed"
	        boolean hasHigherRound = appRepo.existsByJobIdAndCurrentRoundGreaterThan(jobId, roundNum);
	        if (hasHigherRound) {
	            roundStatus = "Completed";
	        }

	        roundStats.add(new JobRoundProgressDTO(roundNum, roundName, passed, rejected, 0, roundStatus));
	    }

	    return new JobHiringStatsDTO(jobId, job.getTitle(), roundsList.size(), roundStats);
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
	
	// --- Student Tracking ---
	
	// --- Student Tracking ---
	
//		public List<ApplicationListDTO> getStudentApplications(String rollNumberOrId) {
//			String studentId = studentProfileRepo.findByRollNumber(rollNumberOrId).map(sp -> sp.getUserId())
//					.orElse(rollNumberOrId);
//
//			return appRepo.findByStudentId(studentId).stream().map(app -> {
//		        Job job = app.getJob();
//
//		        // Check if the application is in Hired state
//		        String displayStatus;
//		        if (app.getStatus() == Application.AppStatus.Hired || "Hired".equalsIgnoreCase(app.getCurrentRoundStatus())) {
//		            displayStatus = "🎉 Hired";
//		        } else {
//		            displayStatus = (app.getCurrentRoundStatus() != null) ? 
//		                    app.getCurrentRoundStatus() : app.getStatus().name().replace("_", " ");
//		        }
//
//		        ApplicationListDTO.JobSummary summary = new ApplicationListDTO.JobSummary(
//		            job.getId(), job.getTitle(), job.getCompanyName(), 
//		            job.getJobType().name(), job.getLocation()
//		        );
//
//		        return new ApplicationListDTO(summary, displayStatus, app.getAppliedAt());
//		    }).collect(Collectors.toList());
//		}
//
//		@Override
//		public List<TimelineDTO> getHiringTimeline(String jobId, String studentId) throws Exception {
//		    Job job = jobManagementService.getJobEntity(jobId);
//		    Application app = appRepo.findByJobIdAndStudentId(jobId, studentId)
//		            .orElseThrow(() -> new RuntimeException("Application not found"));
//		    
//		    List<Map<String, Object>> rounds = mapper.readValue(job.getRoundsJson(), new TypeReference<>() {});
//		    List<TimelineDTO> timeline = new ArrayList<>();
//
//		    // 1. Initial Milestone: Applied
//		    timeline.add(new TimelineDTO("Applied", "Completed", app.getAppliedAt().toString()));
//
//		    int studentCurrentRoundNum = (app.getCurrentRound() != null) ? app.getCurrentRound() : 1;
//		    String currentStatusStr = app.getCurrentRoundStatus(); 
//		    boolean hasFailed = (app.getStatus() == Application.AppStatus.Rejected);
//		    boolean isHired = (app.getStatus() == Application.AppStatus.Hired || "Hired".equalsIgnoreCase(currentStatusStr));
//
//		    // 2. Iterate through dynamic job rounds
//		    for (int i = 0; i < rounds.size(); i++) {
//		        int roundNum = i + 1;
//		        Map<String, Object> round = rounds.get(i);
//		        String name = (String) round.get("name");
//		        String roundDate = (round.get("date") != null) ? round.get("date").toString() : "TBD";
//		        String status;
//
//		        if (isHired) {
//		            status = "Completed";
//		        } else if (roundNum < studentCurrentRoundNum) {
//		            status = "Completed";
//		        } else if (roundNum == studentCurrentRoundNum) {
//		            if (hasFailed) {
//		                status = "Rejected";
//		            } else if (currentStatusStr != null && currentStatusStr.contains("Cleared")) {
//		                status = "Completed";
//		            } else {
//		                status = "In Progress";
//		            }
//		        } else {
//		            // Future rounds
//		            status = hasFailed ? "Process Terminated" : "Locked";
//		        }
//
//		        timeline.add(new TimelineDTO(name, status, roundDate));
//		    }
//		    
//		    return timeline;
//		}
	
	
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
	

}
