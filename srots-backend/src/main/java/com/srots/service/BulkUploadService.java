package com.srots.service;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.AddressRequest;
import com.srots.dto.EducationHistoryDTO;
import com.srots.dto.StudentProfileRequest;
import com.srots.dto.UserCreateRequest;
import com.srots.model.College;
import com.srots.model.User;
import com.srots.repository.CollegeRepository;
import com.srots.repository.UserRepository;

@Service
public class BulkUploadService {

	@Autowired
	private UserAccountService userAccountService;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private CollegeRepository collegeRepository;

	// --- REPORT DTO ---
	public static class RowStatus {
		public String identifier;
		public String status;
		public String message;

		public RowStatus(String id, String s, String m) {
			this.identifier = id;
			this.status = s;
			this.message = m;
		}
	}

	// ==========================================
	// STUDENT BULK UPLOAD (ATOMIC WITH ROLLBACK)
	// ==========================================
	@Transactional(rollbackFor = Exception.class)
    public byte[] processBulkUploadAndGetReport(MultipartFile file, String collegeId, boolean isUpdate, String reportFormat) throws Exception {
        List<RowStatus> report = new ArrayList<>();
        List<UserCreateRequest> allRows = new ArrayList<>();
        College college = collegeRepository.findById(collegeId).orElseThrow(() -> new RuntimeException("College not found"));

        // 1. FAST PARSE
        parseFile(file, (data, rowIdx) -> {
            try {
                allRows.add(createRequestFromData(data, college.getId()));
            } catch (Exception e) {
                report.add(new RowStatus("Row " + rowIdx, "FAILED", "Format Error: " + e.getMessage()));
            }
        });

        // 2. BULK PRE-FETCH (DATABASE OPTIMIZATION)
        List<String> emailsInFile = allRows.stream().map(UserCreateRequest::getEmail).collect(Collectors.toList());
        List<String> aadhaarsInFile = allRows.stream().map(UserCreateRequest::getAadhaar).collect(Collectors.toList());
        List<String> usernamesInFile = allRows.stream().map(u -> college.getCode() + "_" + u.getStudentProfile().getRollNumber()).collect(Collectors.toList());

        Set<String> dbEmails = userRepository.findAllEmails(emailsInFile);
        Set<String> dbAadhaars = userRepository.findAllAadhaars(aadhaarsInFile);
        Set<String> dbUsernames = userRepository.findAllUsernames(usernamesInFile);

        // 3. VALIDATION LOOP
     // 3. VALIDATION LOOP
        Set<String> seenEmails = new HashSet<>();
        Set<String> seenAadhaars = new HashSet<>();
        Set<String> seenRollNumbers = new HashSet<>(); // Internal file duplicate tracking
        List<UserCreateRequest> validDtos = new ArrayList<>();

        for (UserCreateRequest dto : allRows) {
            String roll = dto.getStudentProfile().getRollNumber();
            String username = college.getCode() + "_" + roll; // This is the unique constraint
            
            try {
                // --- A. INTERNAL FILE CHECKS ---
                if (!seenRollNumbers.add(roll)) {
                    throw new RuntimeException("Duplicate Roll Number [" + roll + "] found within this file");
                }
                if (!seenEmails.add(dto.getEmail())) {
                    throw new RuntimeException("Duplicate Email [" + dto.getEmail() + "] found within this file");
                }
                if (!seenAadhaars.add(dto.getAadhaar())) {
                    throw new RuntimeException("Duplicate Aadhaar found within this file");
                }

                // --- B. DATABASE CHECKS (Using pre-fetched Sets) ---
                if (isUpdate) {
                    // In Update Mode, the user MUST already exist
                    if (!dbUsernames.contains(username)) {
                        throw new RuntimeException("Student with Roll Number [" + roll + "] not found in this college.");
                    }
                } else {
                    // In Create Mode, these MUST NOT exist
                    if (dbUsernames.contains(username)) {
                        throw new RuntimeException("Roll Number [" + roll + "] is already registered in this college.");
                    }
                    if (dbEmails.contains(dto.getEmail())) {
                        throw new RuntimeException("Email is already registered in the system.");
                    }
                    if (dbAadhaars.contains(dto.getAadhaar())) {
                        throw new RuntimeException("Aadhaar Number is already registered in the system.");
                    }
                }
                
                validDtos.add(dto);

            } catch (Exception e) {
                report.add(new RowStatus(roll, "FAILED", e.getMessage()));
            }
        }

     // 4. ATOMIC EXECUTION (High Visibility Version)
        boolean hasAnyFailure = report.stream().anyMatch(r -> "FAILED".equals(r.status));

        if (!hasAnyFailure) {
            try {
                for (UserCreateRequest dto : validDtos) {
                    handleUserOperation(dto, college.getCode(), isUpdate);
                    report.add(new RowStatus(dto.getStudentProfile().getRollNumber(), "SUCCESS", isUpdate ? "Updated" : "Created"));
                }
            } catch (Exception e) {
                // This catches runtime DB issues (like the Level null error)
                // We log it and clear the report because @Transactional will roll back everything anyway
                report.clear(); 
                report.add(new RowStatus("SYSTEM", "FAILED", "Database Rollback: " + e.getMessage()));
                throw e; // Critical: Must throw to trigger @Transactional rollback
            }
        } else {
            // There were validation errors (Duplicate Roll/Email/Aadhaar)
            // We add the valid rows as SKIPPED to show the user they were technically okay
            for (UserCreateRequest dto : validDtos) {
                report.add(new RowStatus(
                    dto.getStudentProfile().getRollNumber(), 
                    "SKIPPED", 
                    "Row is valid but was not saved because other rows in the file failed validation."
                ));
            }
        }

        return generateFinalReport(report, reportFormat);
    }
	// ==========================================
	// STAFF BULK UPLOAD (ATOMIC WITH ROLLBACK)
	// ==========================================
	@Transactional(rollbackFor = Exception.class)
	public byte[] processBulkStaffUploadAndGetReport(MultipartFile file, String collegeId, String role, String reportFormat) throws Exception {
	    List<RowStatus> report = new ArrayList<>();
	    List<UserCreateRequest> allRows = new ArrayList<>();

	    // 1. Parse File
	    parseFile(file, (data, rowIdx) -> {
	        try {
	            allRows.add(mapStaffDataToDto(data, collegeId));
	        } catch (Exception e) {
	            report.add(new RowStatus("Row " + rowIdx, "FAILED", "Format Error: " + e.getMessage()));
	        }
	    });

	    // 2. Global Pre-fetch (Check across all colleges)
	    List<String> emailsInFile = allRows.stream().map(UserCreateRequest::getEmail).collect(Collectors.toList());
	    List<String> usernamesInFile = allRows.stream().map(UserCreateRequest::getUsername).collect(Collectors.toList());
	    List<String> aadhaarsInFile = allRows.stream().map(UserCreateRequest::getAadhaar).collect(Collectors.toList());

	    Set<String> dbEmails = userRepository.findAllEmails(emailsInFile);
	    Set<String> dbUsernames = userRepository.findAllUsernames(usernamesInFile);
	    Set<String> dbAadhaars = userRepository.findAllAadhaars(aadhaarsInFile);

	    // 3. Validation Loop with Internal Duplicate Checking
	    Set<String> seenEmails = new HashSet<>();
	    Set<String> seenUsernames = new HashSet<>();
	    Set<String> seenAadhaars = new HashSet<>();
	    List<UserCreateRequest> validDtos = new ArrayList<>();

	    for (UserCreateRequest dto : allRows) {
	        String identifier = (dto.getUsername() != null) ? dto.getUsername() : dto.getEmail();
	        try {
	            // --- Internal File Checks ---
	            if (!seenUsernames.add(dto.getUsername())) throw new RuntimeException("Duplicate Username in file");
	            if (!seenEmails.add(dto.getEmail())) throw new RuntimeException("Duplicate Email in file");
	            if (!seenAadhaars.add(dto.getAadhaar())) throw new RuntimeException("Duplicate Aadhaar in file");

	            // --- Database Checks (Global) ---
	            if (dbUsernames.contains(dto.getUsername())) throw new RuntimeException("Username already exists in system");
	            if (dbEmails.contains(dto.getEmail())) throw new RuntimeException("Email already exists in system");
	            if (dbAadhaars.contains(dto.getAadhaar())) throw new RuntimeException("Aadhaar already exists in system");

	            validDtos.add(dto);
	        } catch (Exception e) {
	            report.add(new RowStatus(identifier, "FAILED", e.getMessage()));
	        }
	    }

	    // 4. Atomic Execution (Shows SUCCESS or SKIPPED for every row)
	    boolean hasAnyFailure = report.stream().anyMatch(r -> "FAILED".equals(r.status));

	    if (!hasAnyFailure) {
	        for (UserCreateRequest dto : validDtos) {
	            userAccountService.create(dto, role);
	            report.add(new RowStatus(dto.getUsername(), "SUCCESS", "Staff Created"));
	        }
	    } else {
	        // Mark all technically valid rows as SKIPPED
	        for (UserCreateRequest dto : validDtos) {
	            report.add(new RowStatus(dto.getUsername(), "SKIPPED", "Aborted due to other errors in the file"));
	        }
	    }

	    return generateFinalReport(report, reportFormat);
	}

	// ==========================================
	// DELETE BULK (ATOMIC WITH ROLLBACK)
	// ==========================================
	@Transactional(rollbackFor = Exception.class)
	public byte[] processBulkDeleteAndGetReport(MultipartFile file, String collegeId, String reportFormat) throws Exception {
	    List<RowStatus> report = new ArrayList<>();
	    List<String> rollNumbers = new ArrayList<>();
	    
	    // 1. Fetch College to get the Code prefix for usernames
	    College college = collegeRepository.findById(collegeId)
	            .orElseThrow(() -> new RuntimeException("College not found"));
	    String prefix = college.getCode();

	    // 2. Parse file
	    parseFile(file, (data, rowIdx) -> {
	        String roll = data.get(0);
	        if (roll != null && !roll.isBlank()) {
	            rollNumbers.add(roll.trim().replace(".0", ""));
	        }
	    });

	    // 3. Pre-fetch valid usernames for this college to validate
	    List<String> usernamesInFile = rollNumbers.stream()
	            .map(r -> prefix + "_" + r)
	            .collect(Collectors.toList());
	    
	    // Check if these specific usernames exist in the DB
	    Set<String> existingUsernames = userRepository.findAllUsernames(usernamesInFile);
	    
	    List<String> validUserIds = new ArrayList<>();
	    List<String> validRolls = new ArrayList<>();

	    // 4. Validation Loop
	    for (String roll : rollNumbers) {
	        String targetUsername = prefix + "_" + roll;
	        if (!existingUsernames.contains(targetUsername)) {
	            report.add(new RowStatus(roll, "FAILED", "Student [" + roll + "] not found in this college"));
	        } else {
	            // Find the ID to pass to the single delete service
	            User user = userRepository.findByUsername(targetUsername).orElse(null);
	            if (user != null) {
	                validUserIds.add(user.getId());
	                validRolls.add(roll);
	            }
	        }
	    }

	    // 5. Atomic Execution
	    boolean hasAnyFailure = report.stream().anyMatch(r -> "FAILED".equals(r.status));

	    if (!hasAnyFailure) {
	        for (int i = 0; i < validUserIds.size(); i++) {
	            // CALLS THE SINGLE DELETE SERVICE DIRECTLY
	            userAccountService.delete(validUserIds.get(i)); 
	            report.add(new RowStatus(validRolls.get(i), "SUCCESS", "Deleted successfully"));
	        }
	    } else {
	        // If one fails (e.g., student not found), show others as SKIPPED
	        for (String roll : validRolls) {
	            report.add(new RowStatus(roll, "SKIPPED", "Deletion aborted due to errors in other rows"));
	        }
	    }

	    return generateFinalReport(report, reportFormat);
	}

	// --- FILE PARSING ENGINE ---
	private void parseFile(MultipartFile file, FileRowProcessor processor) throws Exception {
		String fileName = file.getOriginalFilename();
		if (fileName != null && (fileName.toLowerCase().endsWith(".xlsx") || fileName.toLowerCase().endsWith(".xls"))) {
			try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
				Sheet sheet = workbook.getSheetAt(0);
				for (int i = 1; i <= sheet.getLastRowNum(); i++) {
					processor.process(new ExcelAccessor(sheet.getRow(i)), i + 1);
				}
			}
		} else {
			try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
				String line;
				int rowNum = 0;
				while ((line = reader.readLine()) != null) {
					if (rowNum++ == 0)
						continue;
					// Regex to handle CSV commas inside quotes
					String[] data = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
					processor.process(new CsvAccessor(data), rowNum);
				}
			}
		}
	}

	private interface FileRowProcessor {
		void process(DataAccessor data, int rowIdx);
	}

	// --- MAPPING LOGIC ---
	private void handleUserOperation(UserCreateRequest dto, String collegeCode, boolean isUpdate) {
		if (isUpdate) {
			String username = collegeCode + "_" + dto.getStudentProfile().getRollNumber();
			User existing = userRepository.findByUsername(username)
					.orElseThrow(() -> new RuntimeException("User not found: " + username));
			userAccountService.update(existing.getId(), dto);
		} else {
			userAccountService.create(dto, "STUDENT");
		}
	}

	private UserCreateRequest createRequestFromData(DataAccessor data, String collegeId) {
		UserCreateRequest dto = new UserCreateRequest();
		dto.setCollegeId(collegeId);
		dto.setName(data.get(1));
		dto.setDepartment(data.get(2));
		dto.setAadhaar(data.get(7));
		dto.setEmail(data.get(13));
		dto.setPhone(data.get(15));

		StudentProfileRequest profile = new StudentProfileRequest();
		profile.setRollNumber(data.get(0));
		profile.setBranch(data.get(2));
		profile.setCourse(data.get(3));
		profile.setBatch(parseInteger(data.get(4)));
		profile.setGender(data.get(5));
		profile.setDob(data.get(6));
		profile.setNationality(data.get(8));
		profile.setReligion(data.get(9));
		profile.setMentor(data.get(10));
		profile.setAdvisor(data.get(11));
		profile.setCoordinator(data.get(12));
		profile.setInstituteEmail(data.get(13));
		profile.setPersonalEmail(data.get(14));
		profile.setWhatsappNumber(data.get(16));
		profile.setParentPhone(data.get(17));
		profile.setParentEmail(data.get(18));
		profile.setFatherName(data.get(19));
		profile.setFatherOccupation(data.get(20));
		profile.setMotherName(data.get(21));
		profile.setMotherOccupation(data.get(22));

		List<EducationHistoryDTO> eduList = new ArrayList<>();
		eduList.add(new EducationHistoryDTO("Class 10", data.get(24), data.get(23), data.get(25), data.get(26),
				data.get(27)));
		eduList.add(new EducationHistoryDTO(data.get(28), data.get(30), data.get(29), data.get(31), data.get(32),
				data.get(33)));

		EducationHistoryDTO ug = new EducationHistoryDTO("Undergraduate", "College", "University", "2025", data.get(34),
				"CGPA");
		ug.setCurrentArrears(parseInteger(data.get(35)));


		List<Map<String, Object>> semesters = new ArrayList<>();
		for (int i = 1; i <= 8; i++) {
			String sgpaStr = data.get(35 + i);
			if (sgpaStr != null && !sgpaStr.isBlank()) {
				try {
					// Use Double.parseDouble to ensure 8.5 stays 8.5
					double sgpa = Double.parseDouble(sgpaStr);
					semesters.add(Map.of("sem", "Sem " + i, "sgpa", sgpa));
				} catch (NumberFormatException e) {
					// Log or ignore invalid numeric strings
				}
			}
		}
		ug.setSemesters(semesters);
		eduList.add(ug);

		profile.setEducationHistory(eduList);
		dto.setStudentProfile(profile);
		return dto;
	}

	private UserCreateRequest mapStaffDataToDto(DataAccessor data, String collegeId) {
		UserCreateRequest dto = new UserCreateRequest();
		dto.setCollegeId(collegeId);
		dto.setUsername(data.get(0));
		dto.setName(data.get(1));
		dto.setEmail(data.get(2));
		dto.setPhone(data.get(3));
		dto.setDepartment(data.get(4));
		dto.setAadhaar(data.get(5));
		dto.setIsCollegeHead("true".equalsIgnoreCase(data.get(6)));

		AddressRequest addr = new AddressRequest();
		addr.setAddressLine1(data.get(7));
		addr.setVillage(data.get(8));
		addr.setCity(data.get(9));
		addr.setState(data.get(10));
		addr.setZip(data.get(11));
		addr.setCountry(data.get(12));
		dto.setAddress(addr);
		return dto;
	}

	// --- ACCESSORS & UTILS ---
	private interface DataAccessor {
		String get(int index);
	}

	private class ExcelAccessor implements DataAccessor {
		private Row row;

		ExcelAccessor(Row row) {
			this.row = row;
		}

		public String get(int i) {
			return getCellValue(row != null ? row.getCell(i) : null);
		}
	}

	private class CsvAccessor implements DataAccessor {
		private String[] data;

		CsvAccessor(String[] data) {
			this.data = data;
		}

		public String get(int i) {
			return (i < data.length) ? data[i].trim().replace("\"", "") : "";
		}
	}

	// --- REFINED CELL VALUE EXTRACTOR ---
	private String getCellValue(Cell cell) {
		if (cell == null)
			return "";
		return switch (cell.getCellType()) {
		case STRING -> cell.getStringCellValue().trim();
		case NUMERIC -> {
		    if (DateUtil.isCellDateFormatted(cell)) {
		        yield cell.getLocalDateTimeCellValue().toLocalDate().toString();
		    }
		    double val = cell.getNumericCellValue();
		    // Use DecimalFormat to prevent scientific notation for long numbers like Aadhaar
		    java.text.DecimalFormat df = new java.text.DecimalFormat("0");
		    df.setMaximumFractionDigits(2); 
		    if (val == (long) val) {
		        yield df.format(val); // Returns "112233445566" instead of "1.12233E+11"
		    } else {
		        yield String.valueOf(val); 
		    }
		}
		case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
		default -> "";
		};
	}

	private Integer parseInteger(String val) {
		try {
			return Integer.parseInt(val);
		} catch (Exception e) {
			return 0;
		}
	}

	
	
	// ============================================================
    // FINAL REPORT GENERATOR (WITH SUMMARY)
    // ============================================================
	public byte[] generateFinalReport(List<RowStatus> report, String format) throws IOException {
	    long total = report.size();
	    long success = report.stream().filter(r -> "SUCCESS".equals(r.status)).count();
	    long failed = report.stream().filter(r -> "FAILED".equals(r.status)).count();
	    long skipped = report.stream().filter(r -> "SKIPPED".equals(r.status)).count();

	    if ("csv".equalsIgnoreCase(format)) {
	        StringBuilder csv = new StringBuilder();
	        csv.append("SUMMARY,Total Records,").append(total).append("\n");
	        csv.append("SUMMARY,Total Success,").append(success).append("\n");
	        csv.append("SUMMARY,Total Failed,").append(failed).append("\n");
	        csv.append("SUMMARY,Total Skipped,").append(skipped).append("\n\n"); // Just one newline here
	        csv.append("Record Identifier,Status,Details\n");
	        for (RowStatus rs : report) {
	            // Added quotes around message to handle internal commas
	            csv.append(String.format("\"%s\",\"%s\",\"%s\"\n", rs.identifier, rs.status, rs.message));
	        }
	        return csv.toString().getBytes();
	    } else if ("txt".equalsIgnoreCase(format)) {
	        StringBuilder txt = new StringBuilder("BULK REPORT SUMMARY\n-------------------\n");
	        txt.append("Total: ").append(total)
	           .append("\nSuccess: ").append(success)
	           .append("\nFailed: ").append(failed)
	           .append("\nSkipped: ").append(skipped) // Added skipped to TXT
	           .append("\n\nDetails:\n");
	        for (RowStatus rs : report) {
	            txt.append(String.format("[%s] %s: %s\n", rs.status, rs.identifier, rs.message));
	        }
	        return txt.toString().getBytes();
	    } else {
	        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
	            Sheet sheet = workbook.createSheet("Report");
	            
	            // Fix: Use the correct row variables (r0, r1, r2, r3)
	            Row r0 = sheet.createRow(0); r0.createCell(0).setCellValue("Total Records:"); r0.createCell(1).setCellValue(total);
	            Row r1 = sheet.createRow(1); r1.createCell(0).setCellValue("Total Success:"); r1.createCell(1).setCellValue(success);
	            Row r2 = sheet.createRow(2); r2.createCell(0).setCellValue("Total Failed:"); r2.createCell(1).setCellValue(failed);
	            Row r3 = sheet.createRow(3); r3.createCell(0).setCellValue("Total Skipped:"); r3.createCell(1).setCellValue(skipped);

	            // Style for Header
	            CellStyle headerStyle = workbook.createCellStyle();
	            Font headerFont = workbook.createFont();
	            headerFont.setBold(true);
	            headerStyle.setFont(headerFont);

	            Row header = sheet.createRow(5); // Moved to row 5 to give space
	            String[] columns = {"Identifier", "Status", "Message"};
	            for(int i=0; i<columns.length; i++) {
	                Cell cell = header.createCell(i);
	                cell.setCellValue(columns[i]);
	                cell.setCellStyle(headerStyle);
	            }
	            
	            for (int i = 0; i < report.size(); i++) {
	                Row row = sheet.createRow(i + 6);
	                row.createCell(0).setCellValue(report.get(i).identifier);
	                row.createCell(1).setCellValue(report.get(i).status);
	                row.createCell(2).setCellValue(report.get(i).message);
	            }
	            
	            // Auto-size columns for readability
	            sheet.autoSizeColumn(0);
	            sheet.autoSizeColumn(1);
	            sheet.autoSizeColumn(2);

	            workbook.write(out);
	            return out.toByteArray();
	        }
	    }
	}

	// --- TEMPLATE GENERATORS ---
	public byte[] generateStaffTemplate(String format) throws IOException {
		String[] columns = { "Username", "Full Name", "Email", "Phone", "Department", "Aadhaar", "IsCollegeHead",
				"addressLine1", "Village", "City", "State", "Zip", "Country" };
		return generateTextOrExcel(columns, "Staff Template", format);
	}

	public byte[] generateDeleteTemplate(String format) throws IOException {
		String[] columns = { "Roll Number" };
		return generateTextOrExcel(columns, "Delete Template", format);
	}

	public byte[] generateStudentTemplate(String format) throws IOException {
		String[] columns = { "rollNumber", "fullName", "branch", "course", "batch", "gender", "dob", "aadhaarNumber",
				"nationality", "religion", "mentor", "advisor", "coordinator", "instituteEmail", "personalEmail",
				"phone", "whatsappNumber", "parentPhone", "parentEmail", "fatherName", "fatherOccupation", "motherName",
				"motherOccupation", "tenthBoard", "tenthInstitution", "tenthYear", "tenthScore", "tenthScoreType",
				"preUniversityType", "preUniversityBoard", "preUniversityInstitution", "preUniversityYear",
				"preUniversityScore", "preUniversityScoreType", "currentCGPA", "currentArrears", "sem1", "sem2", "sem3",
				"sem4", "sem5", "sem6", "sem7", "sem8" };
		return generateTextOrExcel(columns, "Student Template", format);
	}

	private byte[] generateTextOrExcel(String[] columns, String sheetName, String format) throws IOException {
		if ("csv".equalsIgnoreCase(format)) {
			return String.join(",", columns).getBytes();
		}
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet(sheetName);
			Row header = sheet.createRow(0);
			for (int i = 0; i < columns.length; i++)
				header.createCell(i).setCellValue(columns[i]);
			workbook.write(out);
			return out.toByteArray();
		}
	}

	public byte[] generateErrorLog(List<String> errors) throws IOException {
		List<RowStatus> errorReports = new ArrayList<>();
		for (String err : errors)
			errorReports.add(new RowStatus("Log Entry", "FAILED", err));
		return generateFinalReport(errorReports, "txt");
	}
}