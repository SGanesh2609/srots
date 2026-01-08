package com.srots.service;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.srots.model.EducationRecord;
import com.srots.model.StudentCertification;
import com.srots.model.StudentExperience;
import com.srots.model.StudentLanguage;
import com.srots.model.StudentProfile;
import com.srots.model.StudentProject;
import com.srots.model.StudentResume;
import com.srots.model.StudentSocialLink;
import com.srots.model.User;
import com.srots.repository.StudentProfileRepository;

@Service
public class PlacementToolServiceImpl implements PlacementToolService {

	@Autowired
	private StudentProfileRepository profileRepo;
	private final DataFormatter formatter = new DataFormatter();

	// --- 1. RESULT COMPARATOR ---
	@Override
	public Map<String, Object> compareFiles(MultipartFile master, MultipartFile resultFile, String compareField) throws Exception {
	    List<List<String>> masterRows = parseMultipartFile(master);
	    List<List<String>> resultRows = parseMultipartFile(resultFile);

	    // 1. Basic Validation
	    if (masterRows == null || masterRows.isEmpty() || resultRows == null || resultRows.isEmpty()) {
	        return Map.of("error", "One of the files is empty or invalid.");
	    }

	    List<String> masterHeader = masterRows.get(0);
	    List<String> resultHeader = resultRows.get(0);

	    int resultIdx = -1;
	    String strategyUsed = "";

	    // 2. STEP: Determine Strategy (User Input -> Email -> Roll Number)
	    
	    // Check if user actually selected a field from the dropdown
	    if (compareField != null && !compareField.trim().isEmpty()) {
	        resultIdx = findBestColumnIndex(resultHeader, compareField);
	        if (resultIdx != -1) {
	            strategyUsed = compareField;
	        }
	    }

	    // Auto-fallback 1: Search for Email columns
	    if (resultIdx == -1) {
	        resultIdx = findBestColumnIndex(resultHeader, "email", "mail", "personal email", "institute email", "mail id");
	        if (resultIdx != -1) strategyUsed = "email";
	    }

	    // Auto-fallback 2: Search for Roll Number columns
	    if (resultIdx == -1) {
	        resultIdx = findBestColumnIndex(resultHeader, "roll number", "roll no", "htno", "roll", "regno", "registration number");
	        if (resultIdx != -1) strategyUsed = "roll number";
	    }

	    // 3. ERROR: If no common identifier is found in the Result file
	    if (resultIdx == -1) {
	        return Map.of("error", "Please select a field to compare because we couldn't find 'Email' or 'Roll Number' columns in the result file.");
	    }

	    // 4. CROSS-CHECK: Does the Master file have this column?
	    // Note: We use the *actual* keyword found (strategyUsed) to search the master
	    int masterIdx = findBestColumnIndex(masterHeader, strategyUsed);
	    
	    // If exact match fails, try searching master for common roll/email keywords again
	    if (masterIdx == -1) {
	        if (strategyUsed.equals("email")) {
	            masterIdx = findBestColumnIndex(masterHeader, "email", "mail", "personal email", "institute email");
	        } else if (strategyUsed.equals("roll number")) {
	            masterIdx = findBestColumnIndex(masterHeader, "roll number", "roll no", "htno", "roll", "regno");
	        }
	    }

	    if (masterIdx == -1) {
	        return Map.of("error", "The field '" + strategyUsed + "' was identified for comparison but it is missing in the master file.");
	    }

	    // 5. EXTRACT IDENTIFIERS (Result File)
	    Set<String> resultIdentifiers = new HashSet<>();
	    for (int i = 1; i < resultRows.size(); i++) {
	        List<String> row = resultRows.get(i);
	        if (row != null && resultIdx < row.size()) {
	            String val = row.get(resultIdx).trim().toLowerCase();
	            if (!val.isEmpty()) resultIdentifiers.add(val);
	        }
	    }

	    // 6. PROCESS COMPARISON (Master vs Result)
	    List<List<String>> previewData = new ArrayList<>();
	    previewData.add(List.of("Identifier (" + strategyUsed + ")", "Status", "In Master", "In Result"));

	    List<List<String>> exportData = new ArrayList<>();
	    List<String> exportHeader = new ArrayList<>(masterHeader);
	    exportHeader.add("Comparison_Status");
	    exportData.add(exportHeader);

	    int passedCount = 0;
	    Set<String> masterValuesFound = new HashSet<>();

	    for (int i = 1; i < masterRows.size(); i++) {
	        List<String> row = masterRows.get(i);
	        if (row == null || row.isEmpty()) continue;

	        String mVal = (masterIdx < row.size()) ? row.get(masterIdx).trim().toLowerCase() : "";
	        if (!mVal.isEmpty()) masterValuesFound.add(mVal);

	        boolean isMatch = !mVal.isEmpty() && resultIdentifiers.contains(mVal);
	        String status = isMatch ? "Passed" : "Failed";
	        if (isMatch) passedCount++;

	        // For UI Table
	        previewData.add(List.of(!mVal.isEmpty() ? mVal : "Row " + i, status, "Yes", isMatch ? "Yes" : "No"));

	        // For Excel Export
	        List<String> exportRow = new ArrayList<>(row);
	        exportRow.add(status);
	        exportData.add(exportRow);
	    }

	    // 7. FIND UNEXPECTED (In Result but not in Master)
	    List<List<String>> notInMaster = new ArrayList<>();
	    for (String resVal : resultIdentifiers) {
	        if (!masterValuesFound.contains(resVal)) {
	            notInMaster.add(List.of(resVal));
	            previewData.add(List.of(resVal, "Unexpected (Not in Master)", "No", "Yes"));
	        }
	    }

	    return Map.of(
	        "passed", passedCount,
	        "failed", (masterRows.size() - 1) - passedCount,
	        "comparisonFieldUsed", strategyUsed,
	        "data", previewData,
	        "NotInMaster", notInMaster,
	        "exportData", exportData
	    );
	}

	private int findBestColumnIndex(List<String> header, String... keywords) {
		for (String kw : keywords) {
			for (int i = 0; i < header.size(); i++) {
				if (header.get(i).trim().equalsIgnoreCase(kw))
					return i;
			}
		}
		for (String kw : keywords) {
			for (int i = 0; i < header.size(); i++) {
				if (header.get(i).toLowerCase().contains(kw.toLowerCase()))
					return i;
			}
		}
		return -1;
	}

	private Map<String, Object> extractIdentifiersFromRows(List<List<String>> rows) {
		Set<String> rolls = new HashSet<>();
		Set<String> emails = new HashSet<>();
		List<String> header = rows.get(0);
		int rollIdx = findBestColumnIndex(header, "roll number", "roll no", "roll", "htno");
		int emailIdx = findBestColumnIndex(header, "email", "mail", "personal email");

		for (int i = 1; i < rows.size(); i++) {
			List<String> row = rows.get(i);
			if (rollIdx != -1 && rollIdx < row.size()) {
				String val = row.get(rollIdx).trim();
				if (!val.isEmpty())
					rolls.add(val);
			}
			if (emailIdx != -1 && emailIdx < row.size()) {
				String val = row.get(emailIdx).trim();
				if (!val.isEmpty())
					emails.add(val);
			}
		}
		return Map.of("rolls", rolls, "emails", emails, "hasEmails", !emails.isEmpty());
	}

	private boolean containsIgnoreCase(Set<String> set, String value) {
		if (value == null || value.trim().isEmpty())
			return false;
		String target = value.trim().toLowerCase();
		return set.stream().anyMatch(s -> s.toLowerCase().equals(target));
	}

	// --- 2. CLEAN DATA ---
	/**
	 * Extracts the first row of any uploaded Excel/CSV to show as checkboxes in
	 * Frontend.
	 */
	@Override
	public List<String> getFileHeaders(MultipartFile file) throws Exception {
		List<List<String>> allRows = parseMultipartFile(file);
		if (allRows.isEmpty())
			return new ArrayList<>();
		return allRows.get(0); // Return only the header row
	}

	/**
	 * Cleans the data by removing selected columns and specific student roll
	 * numbers.
	 */
	@Override
	public Map<String, Object> cleanData(MultipartFile file, String excludeCols, String excludeIds) throws Exception {
		List<List<String>> allRows = parseMultipartFile(file);
		if (allRows.isEmpty())
			return Map.of("data", new ArrayList<>());

		// Parse exclusion lists
		List<String> colRemoveList = Arrays.stream(excludeCols.split(",")).map(String::trim).map(String::toLowerCase)
				.filter(s -> !s.isEmpty()).toList();

		// Handle roll numbers which might be separated by commas or newlines
		List<String> idRemoveList = Arrays.stream(excludeIds.split("[,\\n\\r]+")).map(String::trim)
				.map(String::toLowerCase).filter(s -> !s.isEmpty()).toList();

		List<String> header = allRows.get(0);
		int rollIdx = findBestColumnIndex(header, "roll number", "roll no", "roll", "htno");

		Set<String> foundCols = new HashSet<>();
		Set<String> foundIds = new HashSet<>();
		List<Integer> validIdx = new ArrayList<>();

		// Identify which column indices to KEEP
		for (int i = 0; i < header.size(); i++) {
			String headerName = header.get(i).toLowerCase();
			if (colRemoveList.contains(headerName)) {
				foundCols.add(headerName);
			} else {
				validIdx.add(i);
			}
		}

		List<List<String>> finalData = new ArrayList<>();
		for (int i = 0; i < allRows.size(); i++) {
			List<String> row = allRows.get(i);

			// If not the header row, check if this roll number should be excluded
			if (i != 0 && rollIdx != -1 && rollIdx < row.size()) {
				String roll = row.get(rollIdx).trim().toLowerCase();
				if (idRemoveList.contains(roll)) {
					foundIds.add(roll);
					continue; // Skip this student
				}
			}

			// Build the filtered row (keeping only non-excluded columns)
			List<String> filteredRow = new ArrayList<>();
			for (int idx : validIdx) {
				filteredRow.add(idx < row.size() ? row.get(idx) : "");
			}
			finalData.add(filteredRow);
		}

		// Return the processed data plus metadata for the frontend
		return Map.of("data", finalData, "originalRows", allRows.size() - 1, "finalRows", finalData.size() - 1,
				"removedFieldsCount", foundCols.size(), "unknownRollNumbers",
				idRemoveList.stream().filter(id -> !foundIds.contains(id)) // If it wasn't found in the file loop, it's
																			// unknown
						.toList());
	}

	// --- 3. CUSTOM GATHERING ---
	@Override
	public Map<String, Object> gatherData(Map<String, Object> request, String collegeId) {
		List<String> rawRolls = Arrays.asList(((String) request.get("rollNumbers")).split("\\r?\\n"));
		List<String> requestedFields = (List<String>) request.get("fields");

		// 1. Build a Master Pool of all valid field names from all relevant tables
		Set<String> allValidFields = new HashSet<>();
		allValidFields.addAll(getFieldNames(StudentProfile.class));
		allValidFields.addAll(getFieldNames(User.class));
		allValidFields.addAll(getFieldNames(EducationRecord.class));
		allValidFields.addAll(getFieldNames(StudentProject.class));
		allValidFields.addAll(getFieldNames(StudentExperience.class));
		allValidFields.addAll(getFieldNames(StudentSocialLink.class));
		allValidFields.addAll(getFieldNames(StudentLanguage.class));
		allValidFields.addAll(getFieldNames(StudentResume.class));

		// 2. Identify Unknown Fields and filter the table header
		List<String> unknownFields = requestedFields.stream().filter(f -> !allValidFields.contains(f))
				.collect(Collectors.toList());

		List<String> finalHeader = requestedFields.stream().filter(f -> allValidFields.contains(f))
				.collect(Collectors.toList());

		List<List<String>> dataRows = new ArrayList<>();
		dataRows.add(finalHeader);

		Set<String> foundRolls = new HashSet<>();

		// 3. Process each student
		for (String roll : rawRolls) {
			String r = roll.trim();
			if (r.isEmpty())
				continue;

			profileRepo.findByRollNumberAndUserCollegeId(r, collegeId).ifPresent(profile -> {
				foundRolls.add(r.toLowerCase());
				List<String> row = new ArrayList<>();
				for (String field : finalHeader) {
					row.add(resolveDeepValue(profile, field));
				}
				dataRows.add(row);
			});
		}

		List<String> unknownRolls = rawRolls.stream().map(String::trim)
				.filter(r -> !r.isEmpty() && !foundRolls.contains(r.toLowerCase())).distinct()
				.collect(Collectors.toList());

		return Map.of("data", dataRows, "unknownFields", unknownFields, "unknownRollNumbers", unknownRolls);
	}

	@Override
	public Map<String, List<String>> getAvailableFields() {
		Map<String, List<String>> fieldMap = new LinkedHashMap<>();

		fieldMap.put("Basic Info (User)", getCleanFieldNames(User.class));
		fieldMap.put("Academic Profile", getCleanFieldNames(StudentProfile.class));
		fieldMap.put("Education Records", getCleanFieldNames(EducationRecord.class));
		fieldMap.put("Projects", getCleanFieldNames(StudentProject.class));
		fieldMap.put("Experience", getCleanFieldNames(StudentExperience.class));
		fieldMap.put("Certifications", getCleanFieldNames(StudentCertification.class));
		fieldMap.put("Languages", getCleanFieldNames(StudentLanguage.class));
		fieldMap.put("Social Links", getCleanFieldNames(StudentSocialLink.class));
		fieldMap.put("Resumes", getCleanFieldNames(StudentResume.class));

		return fieldMap;
	}

	private List<String> getCleanFieldNames(Class<?> clazz) {
		// We filter out internal JPA fields and IDs to keep the frontend clean
		List<String> excluded = List.of("id", "user", "student", "passwordHash", "createdAt", "updatedAt",
				"studentProfile");

		return Arrays.stream(clazz.getDeclaredFields()).map(Field::getName).filter(name -> !excluded.contains(name))
				.collect(Collectors.toList());
	}

	/**
	 * Recursively searches for a field value in Profile, User, and then all linked
	 * Collections
	 */
	private String resolveDeepValue(StudentProfile profile, String fieldName) {
		// Step 1: Check Profile
		String val = extractValue(profile, fieldName);
		if (!"N/A".equals(val))
			return val;

		User user = profile.getUser();
		if (user == null)
			return "N/A";

		// Step 2: Check User
		val = extractValue(user, fieldName);
		if (!"N/A".equals(val))
			return val;

		// Step 3: Loop through all List/Collection fields (Projects, Languages, etc.)
		for (Field userField : User.class.getDeclaredFields()) {
			if (Collection.class.isAssignableFrom(userField.getType())) {
				try {
					userField.setAccessible(true);
					Collection<?> collection = (Collection<?>) userField.get(user);
					if (collection != null) {
						for (Object item : collection) {
							String itemVal = extractValue(item, fieldName);
							// If we found the field in any item (e.g., any Project), return it
							if (!"N/A".equals(itemVal))
								return itemVal;
						}
					}
				} catch (Exception e) {
					/* continue search */ }
			}
		}
		return "N/A";
	}

	private String extractValue(Object obj, String fieldName) {
		try {
			Field f = obj.getClass().getDeclaredField(fieldName);
			f.setAccessible(true);
			Object v = f.get(obj);
			return (v != null) ? v.toString() : "N/A";
		} catch (NoSuchFieldException e) {
			return "N/A";
		} catch (Exception e) {
			return "N/A";
		}
	}

	private Set<String> getFieldNames(Class<?> clazz) {
		return Arrays.stream(clazz.getDeclaredFields()).map(Field::getName).collect(Collectors.toSet());
	}

	private List<List<String>> parseMultipartFile(MultipartFile file) throws Exception {
		List<List<String>> data = new ArrayList<>();
		String filename = file.getOriginalFilename().toLowerCase();
		if (filename.endsWith(".csv")) {
			try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
				String line;
				while ((line = br.readLine()) != null) {
					String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
					data.add(Arrays.stream(values).map(v -> v.replaceAll("\"", "").trim()).toList());
				}
			}
		} else {
			try (InputStream is = new BufferedInputStream(file.getInputStream());
					Workbook wb = WorkbookFactory.create(is)) {
				Sheet s = wb.getSheetAt(0);
				for (Row r : s) {
					List<String> row = new ArrayList<>();
					for (int i = 0; i < r.getLastCellNum(); i++) {
						Cell c = r.getCell(i);
						row.add(c == null ? "" : formatter.formatCellValue(c).trim());
					}
					data.add(row);
				}
			}
		}
		return data;
	}

	private String getFieldValue(Object obj, String fieldName) {
		try {
			Field f = obj.getClass().getDeclaredField(fieldName);
			f.setAccessible(true);
			Object v = f.get(obj);
			return v != null ? v.toString() : "N/A";
		} catch (Exception e) {
			return "N/A";
		}
	}

	@Override
	public byte[] exportData(List<List<String>> data, String format) throws Exception {
		if ("csv".equalsIgnoreCase(format)) {
			StringBuilder sb = new StringBuilder();
			for (List<String> row : data) {
				sb.append(String.join(",", row.stream().map(s -> "\"" + s + "\"").toList())).append("\n");
			}
			return sb.toString().getBytes();
		}
		try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet s = wb.createSheet("Report");
			for (int i = 0; i < data.size(); i++) {
				Row r = s.createRow(i);
				for (int j = 0; j < data.get(i).size(); j++)
					r.createCell(j).setCellValue(data.get(i).get(j));
			}
			wb.write(out);
			return out.toByteArray();
		}
	}
}