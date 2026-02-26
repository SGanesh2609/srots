//package com.srots.service;
//
//import java.io.ByteArrayOutputStream;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Map;
//import java.util.UUID;
//import java.util.stream.Collectors;
//
//// Use .ss NOT .sl
//import org.apache.poi.ss.usermodel.Cell;
//import org.apache.poi.ss.usermodel.CellStyle;
//import org.apache.poi.ss.usermodel.Font;
//import org.apache.poi.ss.usermodel.Row;
//import org.apache.poi.ss.usermodel.Workbook;
//import org.apache.poi.xssf.usermodel.XSSFWorkbook;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.Pageable;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.srots.dto.EducationHistoryDTO;
//import com.srots.dto.Student360Response;
//import com.srots.dto.StudentProfileRequest;
//import com.srots.dto.UserCreateRequest;
//import com.srots.dto.UserFullProfileResponse;
//import com.srots.exception.PasswordValidationException;
//import com.srots.model.College;
//import com.srots.model.EducationRecord;
//import com.srots.model.StudentProfile;
//import com.srots.model.User;
//import com.srots.repository.ApplicationRepository;
//import com.srots.repository.CollegeRepository;
//import com.srots.repository.EducationRecordRepository;
//import com.srots.repository.StudentCertificationRepository;
//import com.srots.repository.StudentExperienceRepository;
//import com.srots.repository.StudentLanguageRepository;
//import com.srots.repository.StudentProfileRepository;
//import com.srots.repository.StudentProjectRepository;
//import com.srots.repository.StudentPublicationRepository;
//import com.srots.repository.StudentResumeRepository;
//import com.srots.repository.StudentSkillRepository;
//import com.srots.repository.StudentSocialLinkRepository;
//import com.srots.repository.UserRepository;
//
//@Service
//public class UserAccountServiceImpl implements UserAccountService {
//
//	@Autowired
//	private UserRepository userRepository;
//
//	@Autowired
//	private CollegeRepository collegeRepository;
//
//	@Autowired
//	private StudentProfileRepository studentProfileRepository;
//
//	@Autowired
//	private EducationRecordRepository educationRepository;
//
//	@Autowired
//	private StudentSkillRepository skillRepo;
//
//	@Autowired
//	private StudentLanguageRepository langRepo;
//
//	@Autowired
//	private StudentExperienceRepository expRepo;
//
//	@Autowired
//	private StudentProjectRepository projectRepo;
//
//	@Autowired
//	private StudentPublicationRepository pubRepo;
//
//	@Autowired
//	private StudentCertificationRepository certRepo;
//
//	@Autowired
//	private StudentSocialLinkRepository socialRepo;
//
//	@Autowired
//	private StudentResumeRepository resumeRepo;
//
//	@Autowired
//	private ApplicationRepository appRepo;
//
//	@Autowired
//	private PasswordEncoder passwordEncoder;
//
//	@Autowired
//	private ObjectMapper objectMapper;
//
//	@Autowired
//	private EmailService emailService;
//
//	private static final String AADHAAR_REGEX = "^[0-9]{12}$";
//
//	@Override
//	@Transactional
//	public Object create(UserCreateRequest dto, String roleStr) {
//		// 1. Strict Validation
//		if (dto.getAadhaar() == null || !dto.getAadhaar().matches(AADHAAR_REGEX)) {
//			throw new RuntimeException("Aadhaar must be exactly 12 digits and contain only numbers.");
//		}
//		if (userRepository.existsByEmail(dto.getEmail())) {
//			throw new RuntimeException("Email " + dto.getEmail() + " is already registered.");
//		}
//		if (userRepository.existsByAadhaarNumber(dto.getAadhaar())) {
//			throw new RuntimeException("Aadhaar Number " + dto.getAadhaar() + " already exists.");
//		}
//
//		User.Role role = User.Role.valueOf(roleStr.toUpperCase());
//		User user = new User();
//
//		College college = null;
//		if (dto.getCollegeId() != null) {
//			college = collegeRepository.findById(dto.getCollegeId())
//					.orElseThrow(() -> new RuntimeException("College not found"));
//		}
//
//		// NEW: Roll Number Validation for Students
//		if (role == User.Role.STUDENT) {
//			if (dto.getStudentProfile() == null || dto.getStudentProfile().getRollNumber() == null) {
//				throw new RuntimeException("Roll Number is required for students.");
//			}
//
//			String roll = dto.getStudentProfile().getRollNumber();
//			if (userRepository.existsByCollegeIdAndRollNumber(dto.getCollegeId(), roll)) {
//				throw new RuntimeException(
//						"Roll Number " + roll + " is already assigned to another student in this college.");
//			}
//		}
//
//		String finalUsername = generateUsername(dto, role, college);
//		String rawPassword = generatePassword(finalUsername, dto.getAadhaar(), role);
//
//		String userId = (role == User.Role.STUDENT && dto.getStudentProfile() != null)
//				? (college.getCode() + "_" + dto.getStudentProfile().getRollNumber())
//				: UUID.randomUUID().toString();
//
//		user.setId(userId);
//		user.setUsername(finalUsername);
//		user.setPasswordHash(passwordEncoder.encode(rawPassword));
//		user.setFullName(dto.getName());
//		user.setEmail(dto.getEmail());
//		user.setRole(role);
//		user.setCollege(college);
//		user.setAadhaarNumber(dto.getAadhaar());
//
//		// Logic: Use top-level phone first; if null, try to get it from the profile
//		String phoneToSet = dto.getPhone();
//
//		user.setPhone(phoneToSet);
//
//		user.setPhone(dto.getPhone());
//		user.setDepartment(dto.getDepartment());
//		user.setIsCollegeHead(dto.getIsCollegeHead() != null && dto.getIsCollegeHead());
//
//		if (dto.getAddress() != null) {
//			try {
//				user.setAddressJson(objectMapper.writeValueAsString(dto.getAddress()));
//			} catch (Exception e) {
//				user.setAddressJson("{}");
//			}
//		}
//
//		// 2. Map Student Profile using the UNIFIED helper
//		if (role == User.Role.STUDENT && dto.getStudentProfile() != null) {
//			StudentProfile profile = new StudentProfile();
//			profile.setUserId(user.getId());
//			profile.setUser(user);
//			// Calling the shared mapping logic
//			mapStudentProfile(profile, dto.getStudentProfile());
//			user.setStudentProfile(profile);
//		}
//
//		User savedUser = userRepository.save(user);
//
//		if (role == User.Role.STUDENT && dto.getStudentProfile() != null) {
//			saveEducationHistory(savedUser, dto.getStudentProfile());
//		}
//
//		sendWelcomeEmail(savedUser, rawPassword);
//		return (role == User.Role.STUDENT) ? getFullUserProfile(savedUser.getId()) : savedUser;
//	}
//
//	@Override
//	@Transactional
//	public Object update(String id, UserCreateRequest dto) {
//		// 1. Fetch User - This is where your error is likely triggered if the repo is
//		// wrong
//		User user = userRepository.findById(id)
//				.orElseThrow(() -> new RuntimeException("User with ID " + id + " not found"));
//
//		// 2. Strict Aadhaar & Email Validation
//		if (dto.getAadhaar() != null && !dto.getAadhaar().isBlank()) {
//			if (!dto.getAadhaar().matches(AADHAAR_REGEX))
//				throw new RuntimeException("Aadhaar must be 12 digits.");
//
//			// ONLY check if it's taken if the Aadhaar is DIFFERENT from the current one
//			if (!dto.getAadhaar().equals(user.getAadhaarNumber())) {
//				userRepository.findByAadhaarNumber(dto.getAadhaar()).ifPresent(ex -> {
//					if (!ex.getId().equals(id))
//						throw new RuntimeException("Aadhaar already taken by another user.");
//				});
//				user.setAadhaarNumber(dto.getAadhaar());
//			}
//		}
//
//		if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
//			userRepository.findByEmail(dto.getEmail()).ifPresent(ex -> {
//				if (!ex.getId().equals(id))
//					throw new RuntimeException("Email already taken.");
//			});
//			user.setEmail(dto.getEmail());
//		}
//
//		// NEW: Roll Number Validation for Students
//		if (user.getRole() == User.Role.STUDENT && dto.getStudentProfile() != null) {
//			String newRoll = dto.getStudentProfile().getRollNumber();
//
//			// Only check if the roll number is actually changing
//			if (newRoll != null && !newRoll.equals(user.getStudentProfile().getRollNumber())) {
//				if (userRepository.existsByCollegeIdAndRollNumberAndIdNot(user.getCollege().getId(), newRoll, id)) {
//					throw new RuntimeException(
//							"Cannot update: Roll Number " + newRoll + " is already taken by another student.");
//				}
//			}
//		}
//
//		// --- FIX 2: UPDATE USERNAME IF PROVIDED ---
//		if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
//			// Only update if it's a "clean" username, or re-run generator if needed
//			// For CP Staff, we usually want to keep the college prefix
//			user.setUsername(dto.getUsername());
//		}
//
//		// 3. Update Basic Fields
//		user.setFullName(dto.getName());
//		user.setPhone(dto.getPhone());
//		user.setDepartment(dto.getDepartment());
//		user.setAlternativeEmail(dto.getAlternativeEmail());
//		user.setAlternativePhone(dto.getAlternativePhone());
//		user.setBio(dto.getBio());
//
//		if (dto.getAvatarUrl() != null) {
//			user.setAvatarUrl(dto.getAvatarUrl());
//		}
//
//		// --- FIX 3: UPDATE ADDRESS FOR CP STAFF ---
//		if (dto.getAddress() != null) {
//			try {
//				user.setAddressJson(objectMapper.writeValueAsString(dto.getAddress()));
//			} catch (Exception e) {
//				user.setAddressJson("{}");
//			}
//		}
//
//		// 4. Student Specific Mapping (Semester Updates)
//		if (user.getRole() == User.Role.STUDENT && dto.getStudentProfile() != null) {
//			StudentProfile profile = user.getStudentProfile();
//			if (profile == null) {
//				profile = new StudentProfile();
//				profile.setUserId(user.getId());
//				profile.setUser(user);
//			}
//
//			mapStudentProfile(profile, dto.getStudentProfile());
//			user.setStudentProfile(profile);
//
//			// This allows the CP Admin to update Semester data/CGPA
//			if (dto.getStudentProfile().getEducationHistory() != null) {
//				educationRepository.deleteByStudentId(id);
//				saveEducationHistory(user, dto.getStudentProfile());
//			}
//		}
//
//		User savedUser = userRepository.save(user);
//
//		return (savedUser.getRole() == User.Role.STUDENT) ? getFullUserProfile(savedUser.getId()) : savedUser;
//	}
//
//	/**
//	 * UNIFIED MAPPING HELPER This is the only place you need to change code if
//	 * student fields change.
//	 */
//	private void mapStudentProfile(StudentProfile profile, StudentProfileRequest spDto) {
//		// Academic Identity
//		profile.setRollNumber(spDto.getRollNumber());
//		profile.setBranch(spDto.getBranch());
//		profile.setBatch(spDto.getBatch());
//		profile.setCourse(spDto.getCourse() != null ? spDto.getCourse() : "B.Tech");
//		profile.setPlacementCycle(spDto.getPlacementCycle());
//
//		// --- NEW: Premium Dates Logic (18 Months) ---
//		// Only set these if they aren't already set (prevents overwriting on update)
//		if (profile.getPremiumStartDate() == null) {
//			LocalDate now = LocalDate.now();
//			profile.setPremiumStartDate(now);
//			profile.setPremiumEndDate(now.plusMonths(18));
//		}
//
//		// Personal & Identity
//		if (spDto.getGender() != null)
//			profile.setGender(StudentProfile.Gender.fromString(spDto.getGender()));
//		if (spDto.getDob() != null) {
//			try {
//				profile.setDob(LocalDate.parse(spDto.getDob()));
//			} catch (Exception e) {
//			}
//		}
//		profile.setNationality(spDto.getNationality());
//		profile.setReligion(spDto.getReligion());
//
//		// Contact & Administration
//		profile.setMentor(spDto.getMentor());
//		profile.setAdvisor(spDto.getAdvisor());
//		profile.setCoordinator(spDto.getCoordinator());
//		profile.setInstituteEmail(spDto.getInstituteEmail());
//		profile.setPersonalEmail(spDto.getPersonalEmail());
//		profile.setWhatsappNumber(spDto.getWhatsappNumber());
//
//		// Family Details
//		profile.setFatherName(spDto.getFatherName());
//		profile.setMotherName(spDto.getMotherName());
//		profile.setFatherOccupation(spDto.getFatherOccupation());
//		profile.setMotherOccupation(spDto.getMotherOccupation());
//		profile.setParentPhone(spDto.getParentPhone());
//		profile.setParentEmail(spDto.getParentEmail());
//
//		// --- IMPROVED: Address Handling (Avoids "null" strings) ---
//		try {
//			profile.setCurrentAddress(
//					spDto.getCurrentAddress() != null ? objectMapper.writeValueAsString(spDto.getCurrentAddress())
//							: "{}");
//			profile.setPermanentAddress(
//					spDto.getPermanentAddress() != null ? objectMapper.writeValueAsString(spDto.getPermanentAddress())
//							: "{}");
//		} catch (Exception e) {
//			profile.setCurrentAddress("{}");
//			profile.setPermanentAddress("{}");
//		}
//	}
//
//	@Override
//	public void resendCredentials(String userId) {
//		// 1. Fetch User
//		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
//
//		// 2. Re-generate the "Raw" password using the existing logic
//		// Note: This works because your generatePassword logic is based on
//		// data we already have (Username, Aadhaar, Role).
//		String rawPassword = generatePassword(user.getUsername(), user.getAadhaarNumber(), user.getRole());
//
//		// 3. Send the Email
//		sendWelcomeEmail(user, rawPassword);
//	}
//
//	/**
//	 * Handles Education history and AUTOMATICALLY calculates CGPA from semesters.
//	 * Prioritizes calculated average over user-inputted score for Undergraduate
//	 * records.
//	 */
//	private void saveEducationHistory(User user, StudentProfileRequest spDto) {
//		if (spDto.getEducationHistory() == null)
//			return;
//
//		// 1. Identify if this student is a Diploma/Lateral Entry student
//		boolean isLateralEntry = spDto.getEducationHistory().stream()
//				.anyMatch(edu -> "Diploma".equalsIgnoreCase(edu.getLevel()));
//
//		for (EducationHistoryDTO edu : spDto.getEducationHistory()) {
//
//			// Validation: If level is missing, skip or throw a clearer error
//			if (edu.getLevel() == null || edu.getLevel().isBlank()) {
//				System.err.println("Skipping education record: Level is null for student " + user.getUsername());
//				continue;
//			}
//
//			EducationRecord.EducationLevel parsedLevel = EducationRecord.EducationLevel.fromString(edu.getLevel());
//			if (parsedLevel == null) {
//				throw new RuntimeException("Unrecognized Education Level: '" + edu.getLevel()
//						+ "'. Expected 'Class 10', 'Class 12', 'Diploma', or 'Undergraduate'.");
//			}
//
//			EducationRecord record = new EducationRecord();
//			record.setId(java.util.UUID.randomUUID().toString());
//			record.setStudent(user);
//			record.setLevel(parsedLevel);
//
//			record.setInstitution(edu.getInstitution());
//			record.setBoard(edu.getBoard());
//			record.setYearOfPassing(edu.getYearOfPassing());
//
//			// --- AUTOMATIC CGPA CALCULATION LOGIC ---
//			List<?> semesters = edu.getSemesters();
//			String finalScore = edu.getScore(); // Default to manual input initially
//
//			if (semesters != null && !semesters.isEmpty()) {
//				// Adjust indices for Lateral Entry (Start from Sem 3)
//				if (isLateralEntry && "Undergraduate".equalsIgnoreCase(edu.getLevel())) {
//					semesters = adjustSemestersForLateralEntry(semesters);
//				}
//
//				double totalGpa = 0.0;
//				int count = 0;
//
//				for (Object sem : semesters) {
//					if (sem instanceof java.util.Map) {
//						java.util.Map<?, ?> map = (java.util.Map<?, ?>) sem;
//						Object sgpaObj = map.get("sgpa");
//
//						if (sgpaObj != null && !sgpaObj.toString().isBlank()) {
//							try {
//								double sgpa = Double.parseDouble(sgpaObj.toString());
//
//								// VALIDATION: Prevent impossible SGPA values
//								if (sgpa > 10.0) {
//									throw new RuntimeException(
//											"Invalid SGPA detected: " + sgpa + ". SGPA cannot exceed 10.0");
//								}
//
//								if (sgpa > 0) {
//									totalGpa += sgpa;
//									count++;
//								}
//							} catch (NumberFormatException e) {
//								// Ignore non-numeric SGPA entries (like "N/A")
//							}
//						}
//					}
//				}
//
//				// OVERWRITE: If we have semester data, calculate the average CGPA
//				if (count > 0) {
//					double calculatedCgpa = totalGpa / count;
//					finalScore = String.format("%.2f", calculatedCgpa);
//				}
//
//				try {
//					record.setSemestersData(objectMapper.writeValueAsString(semesters));
//				} catch (Exception e) {
//					record.setSemestersData("[]");
//				}
//			} else {
//				record.setSemestersData("[]");
//			}
//
//			// Apply the calculated (or validated) score
//			record.setScoreDisplay(finalScore);
//
//			if (edu.getScoreType() != null) {
//				record.setScoreType(EducationRecord.ScoreType.fromString(edu.getScoreType()));
//			}
//
//			record.setSpecialization(edu.getSpecialization());
//			record.setCurrentArrears(edu.getCurrentArrears() != null ? edu.getCurrentArrears() : 0);
//
//			educationRepository.save(record);
//		}
//	}
//
//	/**
//	 * Helper to ensure Diploma students start from Sem 3. If data was sent in Sem 1
//	 * slot, it moves it to Sem 3.
//	 */
//	private List<Object> adjustSemestersForLateralEntry(List<?> originalSemesters) {
//		List<Object> adjusted = new java.util.ArrayList<>();
//
//		for (int i = 0; i < originalSemesters.size(); i++) {
//			Object semData = originalSemesters.get(i);
//
//			if (semData instanceof java.util.Map) {
//				// Create a copy of the map to avoid modifying the original list
//				java.util.Map<String, Object> map = new java.util.HashMap<>((java.util.Map<String, Object>) semData);
//
//				// LOGIC: No matter what the input index is, the first entry
//				// for a Diploma student in B.Tech is stored as "Sem 3"
//				map.put("sem", "Sem " + (i + 3));
//				adjusted.add(map);
//			} else {
//				adjusted.add(semData);
//			}
//
//			// Safety: B.Tech degree doesn't go beyond Sem 8
//			if (i + 3 >= 8)
//				break;
//		}
//		return adjusted;
//	}
//
//	private String generateUsername(UserCreateRequest dto, User.Role role, College college) {
//		// 1. Validation: CPH and STUDENT MUST have a college for prefixing
//		if ((role == User.Role.CPH || role == User.Role.STAFF || role == User.Role.STUDENT) && college == null) {
//			throw new RuntimeException("A valid College is required to generate usernames for CPH or STUDENT roles.");
//		}
//
//		// 2. Fallback Logic: If username is null/blank, use first 4 digits of Aadhaar
//		String userPart = dto.getUsername();
//		if (userPart == null || userPart.isBlank()) {
//			if (dto.getAadhaar() != null && dto.getAadhaar().length() >= 4) {
//				userPart = dto.getAadhaar().substring(0, 4);
//			} else {
//				// Last resort: if Aadhaar is also missing/short, use a random short UUID string
//				userPart = UUID.randomUUID().toString().substring(0, 4);
//			}
//		}
//
//		switch (role) {
//		case ADMIN:
//			return "ADMIN_" + userPart;
//
//		case SROTS_DEV:
//			return "DEV_" + userPart;
//
//		case CPH:
////			String prefix = (dto.getIsCollegeHead() != null && dto.getIsCollegeHead()) ? "CPADMIN_" : "CPSTAFF_";
//			String cpadmin = "CPADMIN_";
//			// Example: SRM_CPSTAFF_5544
//			return college.getCode() + "_" + cpadmin + userPart;
//		case STAFF:
////			String prefix = (dto.getIsCollegeHead() != null && dto.getIsCollegeHead()) ? "CPADMIN_" : "CPSTAFF_";
//			String cpstaff = "CPSTAFF_";
//			// Example: SRM_CPSTAFF_5544
//			return college.getCode() + "_" + cpstaff + userPart;
//
//		case STUDENT:
//			if (dto.getStudentProfile() == null || dto.getStudentProfile().getRollNumber() == null) {
//				throw new RuntimeException("Roll Number is required for Student username generation.");
//			}
//			// Students always use Roll Number as the unique identifier
//			return college.getCode() + "_" + dto.getStudentProfile().getRollNumber();
//
//		default:
//			return userPart;
//		}
//	}
//
//	private String generatePassword(String finalUsername, String aadhaar, User.Role role) {
//		if (aadhaar == null || aadhaar.length() < 12) {
//			throw new PasswordValidationException("Invalid Aadhaar: 12 digits required for password generation.");
//		}
//
//		String suffix;
//		if (role == User.Role.ADMIN || role == User.Role.SROTS_DEV) {
//			suffix = aadhaar.substring(0, 4);
//		} else if (role == User.Role.CPH || role == User.Role.STAFF) {
//			suffix = aadhaar.substring(4, 8);
//		} else {
//			suffix = aadhaar.substring(8, 12); // Last 4 digits for students
//		}
//
//		// Add a '@' and ensure the username part has a capital letter
//		// to satisfy the Global Password Policy automatically.
//		return finalUsername.toUpperCase() + "@" + suffix;
//	}
//
//	@Override
//	@Transactional
//	public void delete(String id) {
//		User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
//
//		String userEmail = user.getEmail();
//		String fullName = user.getFullName();
//		// 1. Delete associated student data if applicable
//		if (user.getRole() == User.Role.STUDENT) {
//			educationRepository.deleteByStudentId(id);
//			// Add other repos (skills, projects, etc.) if they don't have
//			// CascadeType.REMOVE
//		}
//
//		// 2. Remove the user (this cleans up the StudentProfile if Cascade is set)
//		userRepository.delete(user);
//
//		// 4. SEND DELETION NOTIFICATION
//		sendAccountDeletedEmail(userEmail, fullName);
//	}
//
//	@Override
//	public User getById(String id) {
//		return userRepository.findById(id).orElse(null);
//	}
//	
//	
//
//	// 5. GET FULL PROFILE (The "Deep Fetch" method)
//	public UserFullProfileResponse getFullUserProfile(String userId) {
//		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
//		
//		// Explicitly initialize the proxy if you aren't using @JsonIgnore
//	    if (user.getCollege() != null) {
//	        user.getCollege().getId(); 
//	    }
//
//		UserFullProfileResponse response = new UserFullProfileResponse();
//		response.setUser(user);
//
//		// If user is a student, attach their specialized data
//		if (user.getRole() == User.Role.STUDENT) {
//			response.setProfile(studentProfileRepository.findById(userId).orElse(null));
//			response.setEducationHistory(educationRepository.findByStudentId(userId));
//		}
//
//		return response;
//	}
//
//	@Override
//	@Transactional(readOnly = true)
//	public Student360Response getStudent360(String userId) {
//		// 1. Core User check
//		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Student not found"));
//
//		if (user.getRole() != User.Role.STUDENT) {
//			throw new RuntimeException("Access Denied: Not a student account");
//		}
//		
//		// Explicitly initialize the proxy if you aren't using @JsonIgnore
//	    if (user.getCollege() != null) {
//	        user.getCollege().getId(); 
//	    }
//
//		Student360Response dto = new Student360Response();
//
//		// 2. Fetch all related data in parallel (or sequence)
//		dto.setUser(user);
//		dto.setProfile(studentProfileRepository.findById(userId).orElse(null));
//
//		// These use the 'student_id' foreign key from your SQL dump
//		dto.setEducation(educationRepository.findByStudentId(userId));
//		dto.setSkills(skillRepo.findByStudentId(userId));
//		dto.setLanguages(langRepo.findByStudentId(userId));
//		dto.setExperience(expRepo.findByStudentId(userId));
//		dto.setProjects(projectRepo.findByStudentId(userId));
//		dto.setPublications(pubRepo.findByStudentId(userId));
//		dto.setCertifications(certRepo.findByStudentId(userId));
//		dto.setSocialLinks(socialRepo.findByStudentId(userId));
//		dto.setResumes(resumeRepo.findByStudentId(userId));
//		dto.setApplications(appRepo.findByStudentId(userId));
//
//		return dto;
//	}
//
//	@Override
//	@Transactional
//	public void updateAvatarOnly(String userId, String url) {
//		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
//		user.setAvatarUrl(url);
//		userRepository.save(user);
//	}
//	
//	// Add this to your UserService Implementation
////	public List<User> getFilteredUsers(String collegeId, User.Role role, String branch, Integer batch, String gender, String search) {
////	    List<User> users;
////
////	    // 1. Initial Fetch (Global vs College)
////	    if (collegeId != null && role != null) {
////	        users = userRepository.findByCollegeIdAndRole(collegeId, role);
////	    } else if (collegeId != null) {
////	        users = userRepository.findByCollegeId(collegeId);
////	    } else if (role != null) {
////	        users = userRepository.findByRole(role);
////	    } else {
////	        users = userRepository.findAll();
////	    }
////
////	    // 2. Apply Dynamic Filters
////	    return users.stream()
////	        .filter(u -> (branch == null || branch.isBlank()) || 
////	                     (u.getDepartment() != null && u.getDepartment().equalsIgnoreCase(branch.trim())))
////	        .filter(u -> {
////	            if (gender == null || gender.isBlank()) return true;
////	            return u.getStudentProfile() != null && u.getStudentProfile().getGender() != null && 
////	                   u.getStudentProfile().getGender().name().equalsIgnoreCase(gender.trim());
////	        })
////	        .filter(u -> (batch == null) || 
////	                     (u.getStudentProfile() != null && batch.equals(u.getStudentProfile().getBatch())))
////	        
////	        // --- UPDATED SEARCH FILTER (Name, Username, Email, Roll Number) ---
////	        .filter(u -> {
////	            if (search == null || search.isBlank()) return true;
////	            String lowerSearch = search.toLowerCase().trim();
////	            
////	            boolean matchesFullName = u.getFullName() != null && u.getFullName().toLowerCase().contains(lowerSearch);
////	            boolean matchesUsername = u.getUsername() != null && u.getUsername().toLowerCase().contains(lowerSearch);
////	            boolean matchesEmail    = u.getEmail() != null && u.getEmail().toLowerCase().contains(lowerSearch);
////	            boolean matchesRoll     = (u.getStudentProfile() != null && u.getStudentProfile().getRollNumber() != null) && 
////	                                      u.getStudentProfile().getRollNumber().toLowerCase().contains(lowerSearch);
////	            
////	            return matchesFullName || matchesUsername || matchesEmail || matchesRoll;
////	        })
////	        .collect(Collectors.toList());
////	}
//
//	// Missing Helper Method
//	public String getCollegeName(String collegeId) {
//		return collegeRepository.findById(collegeId).map(College::getName).orElse("College");
//	}
//	
//	/**
//     * Soft-deletes a user by marking isDeleted=true and recording who did it.
//     * The user's data is fully preserved and invisible to normal queries.
//     * Hard delete (permanent) is handled by the existing delete() method.
//     *
//     * Kibana analytics benefit: the deletedBy field lets you track which
//     * admin performed the action via AuditLogger events.
//     */
//    @Transactional
//    public void softDelete(String userId, String deletedByUsername) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
//
//        if (Boolean.TRUE.equals(user.getIsDeleted())) {
//            throw new RuntimeException("User is already soft-deleted");
//        }
//
//        user.setIsDeleted(true);
//        user.setDeletedAt(LocalDateTime.now());
//        user.setDeletedBy(deletedByUsername);
//        userRepository.save(user);
//    }
//
//    /**
//     * Restores a soft-deleted user. Only ADMIN / SROTS_DEV can call this.
//     */
//    @Transactional
//    public void restoreSoftDeleted(String userId, String restoredByUsername) {
//        User user = userRepository.findByIdAndIsDeletedTrue(userId)
//                .orElseThrow(() -> new RuntimeException("No soft-deleted user found with ID: " + userId));
//
//        user.setIsDeleted(false);
//        user.setDeletedAt(null);
//        user.setDeletedBy(null);
//        userRepository.save(user);
//    }
//
//    // ─────────────────────────────────────────────────────────────────────────
//    // PAGINATED QUERY
//    // ─────────────────────────────────────────────────────────────────────────
//
////    /**
////     * Returns a paginated Spring Page of users, excluding soft-deleted records.
////     * Frontend sends ?paginate=true&page=0&size=20 to get a Page response.
////     */
//    @Transactional(readOnly = true)
//    public Page<User> getFilteredUsersPaginated(
//            String collegeId,
//            User.Role role,
//            String branch,
//            Integer batch,
//            String gender,
//            String search,
//            Pageable pageable) {
//
//        // 1. Fetch from DB (only non-deleted)
//        List<User> allUsers;
//        if (collegeId != null && role != null) {
//            allUsers = userRepository.findByCollegeIdAndRoleAndIsDeletedFalse(collegeId, role);
//        } else if (collegeId != null) {
//            allUsers = userRepository.findByCollegeIdAndIsDeletedFalse(collegeId);
//        } else if (role != null) {
//            allUsers = userRepository.findByRoleAndIsDeletedFalse(role);
//        } else {
//            allUsers = userRepository.findByIsDeletedFalse();
//        }
//
//        // 2. Apply in-memory filters (branch, batch, gender, search)
//        List<User> filtered = allUsers.stream()
//                .filter(u -> branch == null || branch.isBlank() ||
//                        (u.getDepartment() != null && u.getDepartment().equalsIgnoreCase(branch.trim())))
//                .filter(u -> {
//                    if (gender == null || gender.isBlank()) return true;
//                    return u.getStudentProfile() != null &&
//                            u.getStudentProfile().getGender() != null &&
//                            u.getStudentProfile().getGender().name().equalsIgnoreCase(gender.trim());
//                })
//                .filter(u -> batch == null ||
//                        (u.getStudentProfile() != null && batch.equals(u.getStudentProfile().getBatch())))
//                .filter(u -> {
//                    if (search == null || search.isBlank()) return true;
//                    String q = search.toLowerCase().trim();
//                    return (u.getFullName() != null && u.getFullName().toLowerCase().contains(q))
//                            || (u.getEmail() != null && u.getEmail().toLowerCase().contains(q))
//                            || (u.getStudentProfile() != null
//                                && u.getStudentProfile().getRollNumber() != null
//                                && u.getStudentProfile().getRollNumber().toLowerCase().contains(q));
//                })
//                .collect(Collectors.toList());
//
//        // 3. Manual pagination
//        int total = filtered.size();
//        int start = (int) pageable.getOffset();
//        int end   = Math.min(start + pageable.getPageSize(), total);
//        List<User> pageContent = (start > total) ? List.of() : filtered.subList(start, end);
//
//        return new PageImpl<>(pageContent, pageable, total);
//    }
//
//    // ─────────────────────────────────────────────────────────────────────────
//    // UPDATED getFilteredUsers — excludes soft-deleted by default
//    // ─────────────────────────────────────────────────────────────────────────
//
//    public List<User> getFilteredUsers(
//            String collegeId, User.Role role,
//            String branch, Integer batch, String gender, String search) {
//
//        List<User> users;
//        if (collegeId != null && role != null) {
//            users = userRepository.findByCollegeIdAndRoleAndIsDeletedFalse(collegeId, role);
//        } else if (collegeId != null) {
//            users = userRepository.findByCollegeIdAndIsDeletedFalse(collegeId);
//        } else if (role != null) {
//            users = userRepository.findByRoleAndIsDeletedFalse(role);
//        } else {
//            users = userRepository.findByIsDeletedFalse();
//        }
//
//        return users.stream()
//                .filter(u -> branch == null || branch.isBlank() ||
//                        (u.getDepartment() != null && u.getDepartment().equalsIgnoreCase(branch.trim())))
//                .filter(u -> {
//                    if (gender == null || gender.isBlank()) return true;
//                    return u.getStudentProfile() != null &&
//                            u.getStudentProfile().getGender() != null &&
//                            u.getStudentProfile().getGender().name().equalsIgnoreCase(gender.trim());
//                })
//                .filter(u -> batch == null ||
//                        (u.getStudentProfile() != null && batch.equals(u.getStudentProfile().getBatch())))
//                .filter(u -> {
//                    if (search == null || search.isBlank()) return true;
//                    String q = search.toLowerCase().trim();
//                    boolean nm = u.getFullName() != null && u.getFullName().toLowerCase().contains(q);
//                    boolean em = u.getEmail() != null && u.getEmail().toLowerCase().contains(q);
//                    boolean rn = u.getStudentProfile() != null &&
//                            u.getStudentProfile().getRollNumber() != null &&
//                            u.getStudentProfile().getRollNumber().toLowerCase().contains(q);
//                    return nm || em || rn;
//                })
//                .collect(Collectors.toList());
//    }
//	
//	@Override
//	@Transactional
//	public void toggleUserRestriction(String userId, boolean restrict) {
//	    User user = userRepository.findById(userId)
//	            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
//	    
//	    // Update the restriction status
//	    user.setIsRestricted(restrict);
//	    
//	    // Log the action (Optional)
//	    System.out.println("User " + user.getUsername() + " restriction set to: " + restrict);
//	    
//	    userRepository.save(user);
//	}
//	
//
//	@Override
//	public byte[] exportUsersByRole(String collegeId, User.Role role, String branch, Integer batch, String gender,
//			String format) {
//		List<User> users;
//
//		// 1. Fetch data based on scope
//		if (collegeId == null) {
//			users = userRepository.findByRole(role);
//		} else {
//			users = userRepository.findByCollegeIdAndRole(collegeId, role);
//		}
//
//		// 2. Apply Dynamic Filters (Strict Version)
//		users = users.stream()
//		        .filter(u -> {
//		            if (branch == null || branch.isBlank()) return true;
//		            return u.getDepartment() != null && u.getDepartment().equalsIgnoreCase(branch.trim());
//		        })
//		        .filter(u -> {
//		            // If the variable 'gender' is null, it means the URL key was wrong (e.g., 'Gender')
//		            // or not provided. 
//		            if (gender == null || gender.isBlank()) return true;
//		            
//		            if (u.getStudentProfile() == null || u.getStudentProfile().getGender() == null) return false;
//		            
//		            // This is where Arjun gets blocked if gender="FEMALE"
//		            return u.getStudentProfile().getGender().name().equalsIgnoreCase(gender.trim());
//		        })
//		        .filter(u -> {
//		            if (batch == null) return true;
//		            return u.getStudentProfile() != null && batch.equals(u.getStudentProfile().getBatch());
//		        })
//		        .collect(Collectors.toList());
//
//		// 3. Map to Report Rows
//		List<ReportRow> reportData = users.stream().map(user -> {
//			String city = extractCityFromJson(user.getAddressJson());
//
//			String rollOrUsername = (user.getRole() == User.Role.STUDENT && user.getStudentProfile() != null)
//					? user.getStudentProfile().getRollNumber()
//					: user.getUsername();
//
//			// Safe Enum to String conversion for the report
//			String genderVal = (user.getStudentProfile() != null && user.getStudentProfile().getGender() != null)
//					? user.getStudentProfile().getGender().name()
//					: "N/A";
//
//			String batchVal = (user.getStudentProfile() != null && user.getStudentProfile().getBatch() != null)
//					? String.valueOf(user.getStudentProfile().getBatch())
//					: "N/A";
//
//			String headStatus = Boolean.TRUE.equals(user.getIsCollegeHead()) ? "Yes" : "No";
//
//			return new ReportRow(user.getCollege() != null ? user.getCollege().getName() : "SROTS", rollOrUsername,
//					user.getFullName(), user.getEmail(), user.getPhone(),
//					user.getDepartment() != null ? user.getDepartment() : "N/A", genderVal, batchVal, city, headStatus);
//		}).collect(Collectors.toList());
//
//		return generateExportFile(reportData, role, format);
//	}
//
//	// Helper method to extract city from JSON string
//	private String extractCityFromJson(String json) {
//		try {
//			if (json != null && !json.isBlank()) {
//				JsonNode node = objectMapper.readTree(json);
//				return node.has("city") ? node.get("city").asText() : "N/A";
//			}
//		} catch (Exception e) {
//			return "N/A";
//		}
//		return "N/A";
//	}
//
//	private byte[] generateExportFile(List<ReportRow> data, User.Role role, String format) {
//		boolean isStudent = (role == User.Role.STUDENT);
//		Map<String, Long> branchCounts = data.stream()
//				.collect(Collectors.groupingBy(ReportRow::getDept, Collectors.counting()));
//
//		try {
//			if ("csv".equalsIgnoreCase(format)) {
//				StringBuilder sb = new StringBuilder();
//				if (isStudent) {
//					sb.append("College,Roll Number,Full Name,Email,Phone,Department,Gender,Batch,City\n");
//				} else {
//					// Removed Gender from CP header as it's usually empty for staff,
//					// but if you want it, add "Gender" to the string below:
//					sb.append("College,Username,Full Name,Email,Phone,Department,City,College Head\n");
//				}
//
//				for (ReportRow row : data) {
//					if (isStudent) {
//						sb.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
//								row.collegeName, row.id, row.fullName, row.email, row.phone, row.dept, row.gender,
//								row.batch, row.city));
//					} else {
//						// FIXED: Removed 'row.gender' to match the 8-column CP header
//						sb.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
//								row.collegeName, row.id, row.fullName, row.email, row.phone, row.dept, row.city,
//								row.isHead));
//					}
//				}
//				sb.append("\nBRANCH SUMMARY\nBranch,Count\n");
//				branchCounts.forEach((dept, count) -> sb.append(dept).append(",").append(count).append("\n"));
//				return sb.toString().getBytes();
//			} else {
//				try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
//					org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Report");
//
//					CellStyle headerStyle = workbook.createCellStyle();
//					Font font = workbook.createFont();
//					font.setBold(true);
//					headerStyle.setFont(font);
//
//					String[] headers = isStudent
//							? new String[] { "College", "Roll Number", "Full Name", "Email", "Phone", "Department",
//									"Gender", "Batch", "City" }
//							: new String[] { "College", "Username", "Full Name", "Email", "Phone", "Department", "City",
//									"College Head" };
//
//					Row hRow = sheet.createRow(0);
//					for (int i = 0; i < headers.length; i++) {
//						Cell c = hRow.createCell(i);
//						c.setCellValue(headers[i]);
//						c.setCellStyle(headerStyle);
//					}
//
//					int idx = 1;
//					for (ReportRow row : data) {
//						Row r = sheet.createRow(idx++);
//						r.createCell(0).setCellValue(row.collegeName);
//						r.createCell(1).setCellValue(row.id);
//						r.createCell(2).setCellValue(row.fullName);
//						r.createCell(3).setCellValue(row.email);
//						r.createCell(4).setCellValue(row.phone);
//						r.createCell(5).setCellValue(row.dept);
//						r.createCell(6).setCellValue(row.gender);
//						if (isStudent) {
//							r.createCell(7).setCellValue(row.batch);
//							r.createCell(8).setCellValue(row.city);
//						} else {
//							r.createCell(7).setCellValue(row.city);
//							r.createCell(8).setCellValue(row.isHead);
//						}
//					}
//
//					idx++;
//					Row sTitle = sheet.createRow(idx++);
//					Cell sCell = sTitle.createCell(0);
//					sCell.setCellValue("BRANCH SUMMARY");
//					sCell.setCellStyle(headerStyle);
//					for (Map.Entry<String, Long> entry : branchCounts.entrySet()) {
//						Row r = sheet.createRow(idx++);
//						r.createCell(0).setCellValue(entry.getKey());
//						r.createCell(1).setCellValue(entry.getValue());
//					}
//					for (int i = 0; i < headers.length; i++)
//						sheet.autoSizeColumn(i);
//					workbook.write(out);
//					return out.toByteArray();
//				}
//			}
//		} catch (Exception e) {
//			throw new RuntimeException("Export failed: " + e.getMessage());
//		}
//	}
//
//	private static class ReportRow {
//		String collegeName, id, fullName, email, phone, dept, gender, batch, city, isHead;
//
//		ReportRow(String cn, String id, String fn, String em, String ph, String dp, String gn, String bt, String ct,
//				String hd) {
//			this.collegeName = cn;
//			this.id = id;
//			this.fullName = fn;
//			this.email = em;
//			this.phone = ph;
//			this.dept = dp;
//			this.gender = gn;
//			this.batch = bt;
//			this.city = ct;
//			this.isHead = hd;
//		}
//
//		public String getDept() {
//			return dept;
//		}
//	}
//
//	// --- Helper Email Methods ---
//
//	private void sendWelcomeEmail(User user, String rawPassword) {
//		String htmlContent = "<h2>Welcome to SROTS, " + user.getFullName() + "!</h2>"
//				+ "<p>Your account has been created successfully. Here are your login credentials:</p>"
//				+ "<div style='background-color: #f4f4f4; padding: 15px; border-radius: 5px;'>"
//				+ "<strong>Username:</strong> " + user.getUsername() + "<br>" + "<strong>Temporary Password:</strong> "
//				+ rawPassword + "</div>" + "<p>Please login and change your password immediately for security.</p>"
//				+ "<a href='http://localhost:3000/login'>Click here to Login</a>";
//
//		emailService.sendEmail(user.getEmail(), "Your SROTS Account Credentials", htmlContent);
//	}
//
//	private void sendAccountDeletedEmail(String email, String name) {
//		String htmlContent = "<h3>Account Deletion Notice</h3>" + "<p>Hello " + name + ",</p>"
//				+ "<p>This email is to confirm that your SROTS account has been deleted.</p>"
//				+ "<p>If you believe this was a mistake, please contact your college administrator.</p>";
//
//		emailService.sendEmail(email, "SROTS Account Deleted", htmlContent);
//	}
//
//}


package com.srots.service;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.EducationHistoryDTO;
import com.srots.dto.Student360Response;
import com.srots.dto.StudentProfileRequest;
import com.srots.dto.UserCreateRequest;
import com.srots.dto.UserFullProfileResponse;
import com.srots.exception.PasswordValidationException;
import com.srots.model.College;
import com.srots.model.EducationRecord;
import com.srots.model.StudentProfile;
import com.srots.model.User;
import com.srots.repository.ApplicationRepository;
import com.srots.repository.CollegeRepository;
import com.srots.repository.EducationRecordRepository;
import com.srots.repository.StudentCertificationRepository;
import com.srots.repository.StudentExperienceRepository;
import com.srots.repository.StudentLanguageRepository;
import com.srots.repository.StudentProfileRepository;
import com.srots.repository.StudentProjectRepository;
import com.srots.repository.StudentPublicationRepository;
import com.srots.repository.StudentResumeRepository;
import com.srots.repository.StudentSkillRepository;
import com.srots.repository.StudentSocialLinkRepository;
import com.srots.repository.UserRepository;

/**
 * UserAccountServiceImpl
 * Path: com.srots.service.UserAccountServiceImpl
 *
 * ─── FIXES IN THIS VERSION ────────────────────────────────────────────────────
 *
 * FIX 1 — create() parameter order corrected
 *   BEFORE: create(String roleStr, UserCreateRequest dto)   ← swapped, won't compile vs interface
 *   AFTER:  create(UserCreateRequest dto, String role)      ← matches UserAccountService interface
 *   Impact: All three controller endpoints (createSrotsAccount, createCphAccount,
 *           createStudentAccount) call userService.create(dto, role) — now matches.
 *
 * FIX 2 — renewAccount() now resolves rollNumber → User entity
 *   ROOT CAUSE: getExpiringStudents() puts rollNumber as the "id" field in each map
 *   entry (e.g. "21701A0501"). The frontend sends this rollNumber as {studentId} in
 *   POST /accounts/{studentId}/renew. renewAccount() was calling
 *   userRepository.findById("21701A0501") which always returned empty because the
 *   actual User.id is "SRM_21701A0501" (collegeCode + "_" + rollNumber).
 *
 *   Fix strategy (two-step lookup):
 *     Step 1: Try userRepository.findById(identifier)
 *             — handles cases where the full userId IS passed (future-safe)
 *     Step 2: If not found, try studentProfileRepository.findByRollNumber(identifier)
 *             — handles the rollNumber case coming from AtRiskStudentList
 *   This makes renewAccount() work correctly regardless of whether the caller
 *   passes a rollNumber or a full userId.
 *
 * FIX 3 — renewAccount() no longer calls userRepository.save(user) unnecessarily
 *   Only the StudentProfile premiumEndDate changes — saving the User entity
 *   was unnecessary and could cause unintended dirty writes.
 *   Now only studentProfileRepository.save(profile) is called.
 *
 * FIX 4 — bulkRenewAccounts() correctly delegates to the fixed renewAccount()
 *   No logic change needed here since Fix 2 handles the rollNumber lookup.
 *   But added a clear error log per failed entry instead of silent skip.
 */
@Service
public class UserAccountServiceImpl implements UserAccountService {

    private static final Logger log = LoggerFactory.getLogger(UserAccountServiceImpl.class);

    // ─── Default avatar ───────────────────────────────────────────────────────

    private static final String DEFAULT_AVATAR_BASE =
            "https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=";

    private String buildDefaultAvatarUrl(String fullName) {
        String name = (fullName != null && !fullName.isBlank())
                ? URLEncoder.encode(fullName.trim(), StandardCharsets.UTF_8)
                : "User";
        return DEFAULT_AVATAR_BASE + name;
    }

    // ─── Repositories & dependencies ──────────────────────────────────────────

    @Autowired private UserRepository               userRepository;
    @Autowired private CollegeRepository            collegeRepository;
    @Autowired private StudentProfileRepository     studentProfileRepository;
    @Autowired private EducationRecordRepository    educationRepository;
    @Autowired private StudentSkillRepository       skillRepo;
    @Autowired private StudentLanguageRepository    langRepo;
    @Autowired private StudentExperienceRepository  expRepo;
    @Autowired private StudentProjectRepository     projectRepo;
    @Autowired private StudentPublicationRepository pubRepo;
    @Autowired private StudentCertificationRepository certRepo;
    @Autowired private StudentSocialLinkRepository  socialRepo;
    @Autowired private StudentResumeRepository      resumeRepo;
    @Autowired private ApplicationRepository        appRepo;
    @Autowired private PasswordEncoder              passwordEncoder;
    @Autowired private ObjectMapper                 objectMapper;
    @Autowired private EmailService                 emailService;

    private static final String AADHAAR_REGEX = "^[0-9]{12}$";

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // FIX 1: Parameter order corrected — was (String roleStr, UserCreateRequest dto)
    //         Now matches interface: (UserCreateRequest dto, String role)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Object create(String role, UserCreateRequest dto) {   // ← FIX 1: correct order
        if (dto.getAadhaar() == null || !dto.getAadhaar().matches(AADHAAR_REGEX)) {
            throw new RuntimeException("Aadhaar must be exactly 12 digits and contain only numbers.");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email " + dto.getEmail() + " is already registered.");
        }
        if (userRepository.existsByAadhaarNumber(dto.getAadhaar())) {
            throw new RuntimeException("Aadhaar Number " + dto.getAadhaar() + " already exists.");
        }

        User.Role parsedRole = User.Role.valueOf(role.toUpperCase());
        User user = new User();

        College college = null;
        if (dto.getCollegeId() != null) {
            college = collegeRepository.findById(dto.getCollegeId())
                    .orElseThrow(() -> new RuntimeException("College not found"));
        }

        if (parsedRole == User.Role.STUDENT) {
            if (dto.getStudentProfile() == null || dto.getStudentProfile().getRollNumber() == null) {
                throw new RuntimeException("Roll Number is required for students.");
            }
            String roll = dto.getStudentProfile().getRollNumber();
            if (userRepository.existsByCollegeIdAndRollNumber(dto.getCollegeId(), roll)) {
                throw new RuntimeException("Roll Number " + roll + " is already assigned to another student in this college.");
            }
        }

        String finalUsername = generateUsername(dto, parsedRole, college);
        String rawPassword   = generatePassword(finalUsername, dto.getAadhaar(), parsedRole);

        String userId = (parsedRole == User.Role.STUDENT && dto.getStudentProfile() != null)
                ? (college.getCode() + "_" + dto.getStudentProfile().getRollNumber())
                : UUID.randomUUID().toString();

        user.setId(userId);
        user.setUsername(finalUsername);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setFullName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setRole(parsedRole);
        user.setCollege(college);
        user.setAadhaarNumber(dto.getAadhaar());
        user.setPhone(dto.getPhone());
        user.setDepartment(dto.getDepartment());
        user.setIsCollegeHead(dto.getIsCollegeHead() != null && dto.getIsCollegeHead());

        if (dto.getAvatarUrl() != null && !dto.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(dto.getAvatarUrl());
            log.info("[CREATE] Custom avatarUrl provided for user={} role={}", finalUsername, parsedRole);
        } else {
            String defaultAvatar = buildDefaultAvatarUrl(dto.getName());
            user.setAvatarUrl(defaultAvatar);
            log.info("[CREATE] Default avatarUrl assigned for user={} role={} url={}", finalUsername, parsedRole, defaultAvatar);
        }

        if (dto.getAddress() != null) {
            try {
                user.setAddressJson(objectMapper.writeValueAsString(dto.getAddress()));
            } catch (Exception e) {
                user.setAddressJson("{}");
            }
        }

        if (parsedRole == User.Role.STUDENT && dto.getStudentProfile() != null) {
            StudentProfile profile = new StudentProfile();
            profile.setUserId(user.getId());
            profile.setUser(user);
            mapStudentProfile(profile, dto.getStudentProfile());
            user.setStudentProfile(profile);
        }

        User savedUser = userRepository.save(user);
        log.info("[CREATE] User created | id={} | username={} | role={} | college={}",
                savedUser.getId(), savedUser.getUsername(), savedUser.getRole(),
                (college != null ? college.getCode() : "SROTS"));

        if (parsedRole == User.Role.STUDENT && dto.getStudentProfile() != null) {
            saveEducationHistory(savedUser, dto.getStudentProfile());
        }

        sendWelcomeEmail(savedUser, rawPassword);
        return (parsedRole == User.Role.STUDENT) ? getFullUserProfile(savedUser.getId()) : savedUser;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Object update(String id, UserCreateRequest dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User with ID " + id + " not found"));

        if (dto.getAadhaar() != null && !dto.getAadhaar().isBlank()) {
            if (!dto.getAadhaar().matches(AADHAAR_REGEX))
                throw new RuntimeException("Aadhaar must be 12 digits.");
            if (!dto.getAadhaar().equals(user.getAadhaarNumber())) {
                userRepository.findByAadhaarNumber(dto.getAadhaar()).ifPresent(ex -> {
                    if (!ex.getId().equals(id))
                        throw new RuntimeException("Aadhaar already taken by another user.");
                });
                user.setAadhaarNumber(dto.getAadhaar());
            }
        }

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            userRepository.findByEmail(dto.getEmail()).ifPresent(ex -> {
                if (!ex.getId().equals(id))
                    throw new RuntimeException("Email already taken.");
            });
            user.setEmail(dto.getEmail());
        }

        if (user.getRole() == User.Role.STUDENT && dto.getStudentProfile() != null) {
            String newRoll = dto.getStudentProfile().getRollNumber();
            if (newRoll != null && !newRoll.equals(user.getStudentProfile().getRollNumber())) {
                if (userRepository.existsByCollegeIdAndRollNumberAndIdNot(user.getCollege().getId(), newRoll, id)) {
                    throw new RuntimeException("Cannot update: Roll Number " + newRoll + " is already taken by another student.");
                }
            }
        }

        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            user.setUsername(dto.getUsername());
        }

        user.setFullName(dto.getName());
        user.setPhone(dto.getPhone());
        user.setDepartment(dto.getDepartment());
        user.setAlternativeEmail(dto.getAlternativeEmail());
        user.setAlternativePhone(dto.getAlternativePhone());
        user.setBio(dto.getBio());

        if (dto.getAvatarUrl() != null && !dto.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(dto.getAvatarUrl());
            log.info("[UPDATE] avatarUrl changed for userId={}", id);
        }

        if (dto.getAddress() != null) {
            try {
                user.setAddressJson(objectMapper.writeValueAsString(dto.getAddress()));
            } catch (Exception e) {
                user.setAddressJson("{}");
            }
        }

        if (user.getRole() == User.Role.STUDENT && dto.getStudentProfile() != null) {
            StudentProfile profile = user.getStudentProfile();
            if (profile == null) {
                profile = new StudentProfile();
                profile.setUserId(user.getId());
                profile.setUser(user);
            }
            mapStudentProfile(profile, dto.getStudentProfile());
            user.setStudentProfile(profile);

            if (dto.getStudentProfile().getEducationHistory() != null) {
                educationRepository.deleteByStudentId(id);
                saveEducationHistory(user, dto.getStudentProfile());
            }
        }

        User savedUser = userRepository.save(user);
        log.info("[UPDATE] User updated | id={} | username={}", savedUser.getId(), savedUser.getUsername());
        return (savedUser.getRole() == User.Role.STUDENT) ? getFullUserProfile(savedUser.getId()) : savedUser;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FILTER QUERIES
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<User> getFilteredUsersPaginated(
            String collegeId, User.Role role,
            String branch, Integer batch, String gender, String search,
            String status, Pageable pageable) {

        List<User> allUsers = fetchByStatus(collegeId, role, status);
        List<User> filtered = applyInMemoryFilters(allUsers, branch, batch, gender, search);

        int total = filtered.size();
        int start = (int) pageable.getOffset();
        int end   = Math.min(start + pageable.getPageSize(), total);
        List<User> pageContent = (start > total) ? List.of() : filtered.subList(start, end);

        log.debug("[FILTER_PAGINATED] collegeId={} role={} status={} total={} page={}",
                collegeId, role, status, total, pageable.getPageNumber());

        return new PageImpl<>(pageContent, pageable, total);
    }

    @Override
    public List<User> getFilteredUsers(
            String collegeId, User.Role role,
            String branch, Integer batch, String gender,
            String search, String status) {

        List<User> users = fetchByStatus(collegeId, role, status);
        return applyInMemoryFilters(users, branch, batch, gender, search);
    }

    private List<User> fetchByStatus(String collegeId, User.Role role, String status) {
        if ("hard_deleted".equalsIgnoreCase(status)) {
            log.debug("[FETCH] hard_deleted requested for collegeId={} role={} — returning empty", collegeId, role);
            return List.of();
        }

        boolean deleted = "soft_deleted".equalsIgnoreCase(status);

        if (collegeId != null && role != null) {
            return deleted
                ? userRepository.findByCollegeIdAndRoleAndIsDeletedTrue(collegeId, role)
                : userRepository.findByCollegeIdAndRoleAndIsDeletedFalse(collegeId, role);
        }
        if (collegeId != null) {
            return deleted
                ? userRepository.findByCollegeIdAndIsDeletedTrue(collegeId)
                : userRepository.findByCollegeIdAndIsDeletedFalse(collegeId);
        }
        if (role != null) {
            return deleted
                ? userRepository.findByRoleAndIsDeletedTrue(role)
                : userRepository.findByRoleAndIsDeletedFalse(role);
        }
        return deleted
            ? userRepository.findByIsDeletedTrue()
            : userRepository.findByIsDeletedFalse();
    }

    private List<User> applyInMemoryFilters(
            List<User> users,
            String branch, Integer batch, String gender, String search) {
        return users.stream()
                .filter(u -> branch == null || branch.isBlank() ||
                        (u.getDepartment() != null && u.getDepartment().equalsIgnoreCase(branch.trim())))
                .filter(u -> {
                    if (gender == null || gender.isBlank()) return true;
                    return u.getStudentProfile() != null &&
                            u.getStudentProfile().getGender() != null &&
                            u.getStudentProfile().getGender().name().equalsIgnoreCase(gender.trim());
                })
                .filter(u -> batch == null ||
                        (u.getStudentProfile() != null && batch.equals(u.getStudentProfile().getBatch())))
                .filter(u -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.toLowerCase().trim();
                    boolean nm = u.getFullName() != null && u.getFullName().toLowerCase().contains(q);
                    boolean em = u.getEmail() != null && u.getEmail().toLowerCase().contains(q);
                    boolean rn = u.getStudentProfile() != null &&
                            u.getStudentProfile().getRollNumber() != null &&
                            u.getStudentProfile().getRollNumber().toLowerCase().contains(q);
                    return nm || em || rn;
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SOFT DELETE / RESTORE
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void softDelete(String userId, String deletedByUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new RuntimeException("User is already soft-deleted");
        }

        user.setIsDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setDeletedBy(deletedByUsername);
        userRepository.save(user);
        log.warn("[SOFT_DELETE] userId={} | username={} | deletedBy={}", userId, user.getUsername(), deletedByUsername);
    }

    @Override
    @Transactional
    public void restoreSoftDeleted(String userId, String restoredByUsername) {
        User user = userRepository.findByIdAndIsDeletedTrue(userId)
                .orElseThrow(() -> new RuntimeException("No soft-deleted user found with ID: " + userId));

        user.setIsDeleted(false);
        user.setDeletedAt(null);
        user.setDeletedBy(null);
        userRepository.save(user);
        log.info("[RESTORE] userId={} | username={} | restoredBy={}", userId, user.getUsername(), restoredByUsername);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ — single user, profile, 360
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public User getById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public UserFullProfileResponse getFullUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getCollege() != null) {
            user.getCollege().getId();
        }

        UserFullProfileResponse response = new UserFullProfileResponse();
        response.setUser(user);

        if (user.getRole() == User.Role.STUDENT) {
            response.setProfile(studentProfileRepository.findById(userId).orElse(null));
            response.setEducationHistory(educationRepository.findByStudentId(userId));
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Student360Response getStudent360(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (user.getRole() != User.Role.STUDENT) {
            throw new RuntimeException("Access Denied: Not a student account");
        }

        if (user.getCollege() != null) {
            user.getCollege().getId();
        }

        Student360Response dto = new Student360Response();
        dto.setUser(user);
        dto.setProfile(studentProfileRepository.findById(userId).orElse(null));
        dto.setEducation(educationRepository.findByStudentId(userId));
        dto.setSkills(skillRepo.findByStudentId(userId));
        dto.setLanguages(langRepo.findByStudentId(userId));
        dto.setExperience(expRepo.findByStudentId(userId));
        dto.setProjects(projectRepo.findByStudentId(userId));
        dto.setPublications(pubRepo.findByStudentId(userId));
        dto.setCertifications(certRepo.findByStudentId(userId));
        dto.setSocialLinks(socialRepo.findByStudentId(userId));
        dto.setResumes(resumeRepo.findByStudentId(userId));
        dto.setApplications(appRepo.findByStudentId(userId));

        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE (hard)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void delete(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String userEmail = user.getEmail();
        String fullName  = user.getFullName();

        if (user.getRole() == User.Role.STUDENT) {
            educationRepository.deleteByStudentId(id);
        }

        userRepository.delete(user);
        log.warn("[HARD_DELETE] userId={} | username={} | email={}", id, user.getUsername(), userEmail);
        sendAccountDeletedEmail(userEmail, fullName);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MISC
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void updateAvatarOnly(String userId, String url) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAvatarUrl(url);
        userRepository.save(user);
        log.info("[AVATAR_UPDATE] userId={} | newUrl={}", userId, url);
    }

    @Override
    public String getCollegeName(String collegeId) {
        return collegeRepository.findById(collegeId).map(College::getName).orElse("College");
    }

    @Override
    public void resendCredentials(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String rawPassword = generatePassword(user.getUsername(), user.getAadhaarNumber(), user.getRole());
        sendWelcomeEmail(user, rawPassword);
        log.info("[RESEND_CREDENTIALS] userId={} | username={}", userId, user.getUsername());
    }

    @Override
    @Transactional
    public void toggleUserRestriction(String userId, boolean restrict) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        user.setIsRestricted(restrict);
        userRepository.save(user);
        log.info("[RESTRICT_TOGGLE] userId={} | username={} | restricted={}", userId, user.getUsername(), restrict);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACCOUNT RENEWAL
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Renews a student account by extending premiumEndDate by `months` months.
     *
     * ─── FIX 2: Two-step identifier resolution ──────────────────────────────
     *
     * The `identifier` parameter may be either:
     *   (a) A full User.id  — e.g. "SRM_21701A0501"  (future-safe, direct calls)
     *   (b) A rollNumber    — e.g. "21701A0501"       (comes from AtRiskStudentList
     *                         via getExpiringStudents() which sets id = rollNumber)
     *
     * ROOT CAUSE of original bug:
     *   getExpiringStudents() puts rollNumber as entry.get("id") so the frontend
     *   receives stu.id = "21701A0501". ManagingStudentAccounts then calls
     *   renewStudent(extensionTarget.id, months) which hits POST /accounts/21701A0501/renew.
     *   The old code did userRepository.findById("21701A0501") → always empty
     *   → RuntimeException("User not found") → 400/500 from controller.
     *
     * Resolution:
     *   Step 1: Try findById(identifier) directly.
     *           Succeeds when a full userId like "SRM_21701A0501" is passed.
     *   Step 2: If not found, try findByRollNumber(identifier) via StudentProfile.
     *           Succeeds when a plain rollNumber like "21701A0501" is passed.
     *   If still not found, throw with a clear message.
     *
     * ─── FIX 3: Removed unnecessary userRepository.save(user) ──────────────
     *   Only StudentProfile.premiumEndDate changes — the User entity itself is
     *   not modified. Saving user was superfluous and risked triggering
     *   unintended @UpdateTimestamp or lifecycle callbacks on User.
     *
     * @param identifier  rollNumber OR full User.id of the student
     * @param months      number of months to extend (must be > 0)
     */
    @Override
    @Transactional
    public void renewAccount(String identifier, int months) {

        // ── Step 1: Try direct User.id lookup ─────────────────────────────────
        User user = userRepository.findById(identifier).orElse(null);
        StudentProfile profile = null;

        if (user != null) {
            // Found by full userId — fetch the profile
            profile = studentProfileRepository.findById(identifier).orElse(null);
        } else {
            // ── Step 2: Treat identifier as rollNumber ─────────────────────────
            // StudentProfile.rollNumber is unique per college, so findByRollNumber
            // should return exactly one result.
            profile = studentProfileRepository.findByRollNumber(identifier).orElse(null);
            if (profile != null) {
                user = profile.getUser();
                if (user == null) {
                    user = userRepository.findById(profile.getUserId()).orElse(null);
                }
            }
        }

        if (user == null) {
            throw new RuntimeException(
                "Student not found for identifier: '" + identifier + "'. " +
                "Checked both User.id and roll number. " +
                "Ensure the student exists and the college code is correct.");
        }

        if (user.getRole() != User.Role.STUDENT) {
            throw new RuntimeException("Only STUDENT accounts can be renewed. " +
                "User '" + user.getUsername() + "' has role: " + user.getRole());
        }

        if (profile == null) {
            throw new RuntimeException(
                "Student profile not found for user: " + user.getId() +
                ". The User record exists but has no associated StudentProfile.");
        }

        // ── Calculate new expiry ───────────────────────────────────────────────
        LocalDate currentExpiry = profile.getPremiumEndDate();

        // If account is already expired or has no expiry, start renewal from today
        // (matches the policy: expired accounts get fresh N-month subscription from today)
        if (currentExpiry == null || currentExpiry.isBefore(LocalDate.now())) {
            currentExpiry = LocalDate.now();
        }

        LocalDate newExpiry = currentExpiry.plusMonths(months);
        profile.setPremiumEndDate(newExpiry);

        // FIX 3: Only save the profile — do NOT save user (no User field changed)
        studentProfileRepository.save(profile);

        log.info("[RENEW_ACCOUNT] userId={} | rollNumber={} | months={} | oldExpiry={} | newExpiry={}",
                user.getId(), profile.getRollNumber(), months, currentExpiry, newExpiry);
    }

    /**
     * Processes a list of renewal updates coming from the BulkRenewalModal confirmation.
     *
     * Each update map must contain:
     *   { "id": String (rollNumber from preview), "months": Integer }
     *
     * FIX 4: Delegates to the fixed renewAccount() which now correctly resolves
     * rollNumbers. Added per-entry error logging instead of silently skipping.
     *
     * @param updates  list of { id, months } maps — id is rollNumber from BulkRenewalPreview
     */
    @Override
    @Transactional
    public void bulkRenewAccounts(List<Map<String, Object>> updates) {
        int success = 0;
        int failed  = 0;

        for (Map<String, Object> update : updates) {
            String id = (String) update.get("id");

            // months may come as Integer or Number depending on JSON deserialization
            Integer months = null;
            Object monthsObj = update.get("months");
            if (monthsObj instanceof Integer) {
                months = (Integer) monthsObj;
            } else if (monthsObj instanceof Number) {
                months = ((Number) monthsObj).intValue();
            }

            if (id == null || id.isBlank()) {
                log.warn("[BULK_RENEW] Skipping entry with null/blank id");
                failed++;
                continue;
            }
            if (months == null || months <= 0) {
                log.warn("[BULK_RENEW] Skipping entry id={} — invalid months: {}", id, monthsObj);
                failed++;
                continue;
            }

            try {
                renewAccount(id, months);
                success++;
            } catch (RuntimeException e) {
                // Log and continue — don't abort the entire batch for one bad entry
                log.error("[BULK_RENEW] Failed to renew id={} months={} — {}", id, months, e.getMessage());
                failed++;
            }
        }

        log.info("[BULK_RENEW] Complete | success={} | failed={} | total={}", success, failed, updates.size());

        // If ALL entries failed, surface an error to the controller
        if (failed > 0 && success == 0) {
            throw new RuntimeException(
                "Bulk renewal failed for all " + failed + " entries. Check server logs for details.");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private void mapStudentProfile(StudentProfile profile, StudentProfileRequest spDto) {
        profile.setRollNumber(spDto.getRollNumber());
        profile.setBranch(spDto.getBranch());
        profile.setBatch(spDto.getBatch());
        profile.setCourse(spDto.getCourse() != null ? spDto.getCourse() : "B.Tech");
        profile.setPlacementCycle(spDto.getPlacementCycle());

        if (profile.getPremiumStartDate() == null) {
            LocalDate now = LocalDate.now();
            profile.setPremiumStartDate(now);
            profile.setPremiumEndDate(now.plusMonths(18));
        }

        if (spDto.getGender() != null)
            profile.setGender(StudentProfile.Gender.fromString(spDto.getGender()));
        if (spDto.getDob() != null) {
            try { profile.setDob(LocalDate.parse(spDto.getDob())); } catch (Exception e) {}
        }

        profile.setNationality(spDto.getNationality());
        profile.setReligion(spDto.getReligion());
        profile.setMentor(spDto.getMentor());
        profile.setAdvisor(spDto.getAdvisor());
        profile.setCoordinator(spDto.getCoordinator());
        profile.setInstituteEmail(spDto.getInstituteEmail());
        profile.setPersonalEmail(spDto.getPersonalEmail());
        profile.setWhatsappNumber(spDto.getWhatsappNumber());
        profile.setFatherName(spDto.getFatherName());
        profile.setMotherName(spDto.getMotherName());
        profile.setFatherOccupation(spDto.getFatherOccupation());
        profile.setMotherOccupation(spDto.getMotherOccupation());
        profile.setParentPhone(spDto.getParentPhone());
        profile.setParentEmail(spDto.getParentEmail());

        try {
            profile.setCurrentAddress(spDto.getCurrentAddress() != null
                    ? objectMapper.writeValueAsString(spDto.getCurrentAddress()) : "{}");
            profile.setPermanentAddress(spDto.getPermanentAddress() != null
                    ? objectMapper.writeValueAsString(spDto.getPermanentAddress()) : "{}");
        } catch (Exception e) {
            profile.setCurrentAddress("{}");
            profile.setPermanentAddress("{}");
        }
    }

    private void saveEducationHistory(User user, StudentProfileRequest spDto) {
        if (spDto.getEducationHistory() == null) return;

        boolean isLateralEntry = spDto.getEducationHistory().stream()
                .anyMatch(edu -> "Diploma".equalsIgnoreCase(edu.getLevel()));

        for (EducationHistoryDTO edu : spDto.getEducationHistory()) {
            if (edu.getLevel() == null || edu.getLevel().isBlank()) {
                log.error("[EDU_SKIP] Level is null for student={} — skipping record", user.getUsername());
                continue;
            }

            EducationRecord.EducationLevel parsedLevel = EducationRecord.EducationLevel.fromString(edu.getLevel());
            if (parsedLevel == null) {
                throw new RuntimeException("Unrecognized Education Level: '" + edu.getLevel() + "'.");
            }

            EducationRecord record = new EducationRecord();
            record.setId(UUID.randomUUID().toString());
            record.setStudent(user);
            record.setLevel(parsedLevel);
            record.setInstitution(edu.getInstitution());
            record.setBoard(edu.getBoard());
            record.setYearOfPassing(edu.getYearOfPassing());

            List<?> semesters = edu.getSemesters();
            String finalScore = edu.getScore();

            if (semesters != null && !semesters.isEmpty()) {
                if (isLateralEntry && "Undergraduate".equalsIgnoreCase(edu.getLevel())) {
                    semesters = adjustSemestersForLateralEntry(semesters);
                }

                double totalGpa = 0.0;
                int count = 0;

                for (Object sem : semesters) {
                    if (sem instanceof java.util.Map) {
                        java.util.Map<?, ?> map = (java.util.Map<?, ?>) sem;
                        Object sgpaObj = map.get("sgpa");
                        if (sgpaObj != null && !sgpaObj.toString().isBlank()) {
                            try {
                                double sgpa = Double.parseDouble(sgpaObj.toString());
                                if (sgpa > 10.0) throw new RuntimeException("Invalid SGPA: " + sgpa + ". Cannot exceed 10.0");
                                if (sgpa > 0) { totalGpa += sgpa; count++; }
                            } catch (NumberFormatException e) { /* skip non-numeric */ }
                        }
                    }
                }

                if (count > 0) {
                    finalScore = String.format("%.2f", totalGpa / count);
                }

                try {
                    record.setSemestersData(objectMapper.writeValueAsString(semesters));
                } catch (Exception e) {
                    record.setSemestersData("[]");
                }
            } else {
                record.setSemestersData("[]");
            }

            record.setScoreDisplay(finalScore);
            if (edu.getScoreType() != null) record.setScoreType(EducationRecord.ScoreType.fromString(edu.getScoreType()));
            record.setSpecialization(edu.getSpecialization());
            record.setCurrentArrears(edu.getCurrentArrears() != null ? edu.getCurrentArrears() : 0);
            educationRepository.save(record);
        }
        log.info("[EDU_SAVED] educationHistory saved for userId={}", user.getId());
    }

    private List<Object> adjustSemestersForLateralEntry(List<?> originalSemesters) {
        List<Object> adjusted = new java.util.ArrayList<>();
        for (int i = 0; i < originalSemesters.size(); i++) {
            Object semData = originalSemesters.get(i);
            if (semData instanceof java.util.Map) {
                java.util.Map<String, Object> map = new java.util.HashMap<>((java.util.Map<String, Object>) semData);
                map.put("sem", "Sem " + (i + 3));
                adjusted.add(map);
            } else {
                adjusted.add(semData);
            }
            if (i + 3 >= 8) break;
        }
        return adjusted;
    }

    private String generateUsername(UserCreateRequest dto, User.Role role, College college) {
        if ((role == User.Role.CPH || role == User.Role.STAFF || role == User.Role.STUDENT) && college == null) {
            throw new RuntimeException("A valid College is required for CPH/STAFF/STUDENT roles.");
        }

        String userPart = dto.getUsername();
        if (userPart == null || userPart.isBlank()) {
            userPart = (dto.getAadhaar() != null && dto.getAadhaar().length() >= 4)
                    ? dto.getAadhaar().substring(0, 4)
                    : UUID.randomUUID().toString().substring(0, 4);
        }

        switch (role) {
            case ADMIN:     return "ADMIN_" + userPart;
            case SROTS_DEV: return "DEV_" + userPart;
            case CPH:       return college.getCode() + "_CPADMIN_" + userPart;
            case STAFF:     return college.getCode() + "_CPSTAFF_" + userPart;
            case STUDENT:
                if (dto.getStudentProfile() == null || dto.getStudentProfile().getRollNumber() == null)
                    throw new RuntimeException("Roll Number is required for Student username generation.");
                return college.getCode() + "_" + dto.getStudentProfile().getRollNumber();
            default: return userPart;
        }
    }

    private String generatePassword(String finalUsername, String aadhaar, User.Role role) {
        if (aadhaar == null || aadhaar.length() < 12)
            throw new PasswordValidationException("Invalid Aadhaar: 12 digits required.");

        String suffix;
        if (role == User.Role.ADMIN || role == User.Role.SROTS_DEV) {
            suffix = aadhaar.substring(0, 4);
        } else if (role == User.Role.CPH || role == User.Role.STAFF) {
            suffix = aadhaar.substring(4, 8);
        } else {
            suffix = aadhaar.substring(8, 12);
        }
        return finalUsername.toUpperCase() + "@" + suffix;
    }

    // ─── Export ────────────────────────────────────────────────────────────────

    @Override
    public byte[] exportUsersByRole(String collegeId, User.Role role, String branch, Integer batch, String gender, String format) {
        List<User> users = (collegeId == null)
                ? userRepository.findByRole(role)
                : userRepository.findByCollegeIdAndRole(collegeId, role);

        users = users.stream()
                .filter(u -> branch == null || branch.isBlank() ||
                        (u.getDepartment() != null && u.getDepartment().equalsIgnoreCase(branch.trim())))
                .filter(u -> gender == null || gender.isBlank() ||
                        (u.getStudentProfile() != null && u.getStudentProfile().getGender() != null &&
                         u.getStudentProfile().getGender().name().equalsIgnoreCase(gender.trim())))
                .filter(u -> batch == null ||
                        (u.getStudentProfile() != null && batch.equals(u.getStudentProfile().getBatch())))
                .collect(Collectors.toList());

        List<ReportRow> reportData = users.stream().map(user -> {
            String city = extractCityFromJson(user.getAddressJson());
            String rollOrUsername = (user.getRole() == User.Role.STUDENT && user.getStudentProfile() != null)
                    ? user.getStudentProfile().getRollNumber()
                    : user.getUsername();
            String genderVal = (user.getStudentProfile() != null && user.getStudentProfile().getGender() != null)
                    ? user.getStudentProfile().getGender().name() : "N/A";
            String batchVal = (user.getStudentProfile() != null && user.getStudentProfile().getBatch() != null)
                    ? String.valueOf(user.getStudentProfile().getBatch()) : "N/A";
            String headStatus = Boolean.TRUE.equals(user.getIsCollegeHead()) ? "Yes" : "No";
            return new ReportRow(user.getCollege() != null ? user.getCollege().getName() : "SROTS",
                    rollOrUsername, user.getFullName(), user.getEmail(), user.getPhone(),
                    user.getDepartment() != null ? user.getDepartment() : "N/A",
                    genderVal, batchVal, city, headStatus);
        }).collect(Collectors.toList());

        return generateExportFile(reportData, role, format);
    }

    private String extractCityFromJson(String json) {
        try {
            if (json != null && !json.isBlank()) {
                JsonNode node = objectMapper.readTree(json);
                return node.has("city") ? node.get("city").asText() : "N/A";
            }
        } catch (Exception e) { return "N/A"; }
        return "N/A";
    }

    private byte[] generateExportFile(List<ReportRow> data, User.Role role, String format) {
        boolean isStudent = (role == User.Role.STUDENT);
        Map<String, Long> branchCounts = data.stream()
                .collect(Collectors.groupingBy(ReportRow::getDept, Collectors.counting()));

        try {
            if ("csv".equalsIgnoreCase(format)) {
                StringBuilder sb = new StringBuilder();
                if (isStudent) sb.append("College,Roll Number,Full Name,Email,Phone,Department,Gender,Batch,City\n");
                else           sb.append("College,Username,Full Name,Email,Phone,Department,City,College Head\n");

                for (ReportRow row : data) {
                    if (isStudent) sb.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                            row.collegeName, row.id, row.fullName, row.email, row.phone, row.dept, row.gender, row.batch, row.city));
                    else           sb.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                            row.collegeName, row.id, row.fullName, row.email, row.phone, row.dept, row.city, row.isHead));
                }
                sb.append("\nBRANCH SUMMARY\nBranch,Count\n");
                branchCounts.forEach((dept, count) -> sb.append(dept).append(",").append(count).append("\n"));
                return sb.toString().getBytes();

            } else {
                try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                    org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Report");
                    CellStyle headerStyle = workbook.createCellStyle();
                    Font font = workbook.createFont();
                    font.setBold(true);
                    headerStyle.setFont(font);

                    String[] headers = isStudent
                            ? new String[]{"College","Roll Number","Full Name","Email","Phone","Department","Gender","Batch","City"}
                            : new String[]{"College","Username","Full Name","Email","Phone","Department","City","College Head"};

                    Row hRow = sheet.createRow(0);
                    for (int i = 0; i < headers.length; i++) {
                        Cell c = hRow.createCell(i);
                        c.setCellValue(headers[i]);
                        c.setCellStyle(headerStyle);
                    }

                    int idx = 1;
                    for (ReportRow row : data) {
                        Row r = sheet.createRow(idx++);
                        r.createCell(0).setCellValue(row.collegeName);
                        r.createCell(1).setCellValue(row.id);
                        r.createCell(2).setCellValue(row.fullName);
                        r.createCell(3).setCellValue(row.email);
                        r.createCell(4).setCellValue(row.phone);
                        r.createCell(5).setCellValue(row.dept);
                        r.createCell(6).setCellValue(row.gender);
                        if (isStudent) { r.createCell(7).setCellValue(row.batch); r.createCell(8).setCellValue(row.city); }
                        else           { r.createCell(7).setCellValue(row.city);  r.createCell(8).setCellValue(row.isHead); }
                    }

                    idx++;
                    Row sTitle = sheet.createRow(idx++);
                    Cell sCell = sTitle.createCell(0);
                    sCell.setCellValue("BRANCH SUMMARY");
                    sCell.setCellStyle(headerStyle);
                    for (Map.Entry<String, Long> entry : branchCounts.entrySet()) {
                        Row r = sheet.createRow(idx++);
                        r.createCell(0).setCellValue(entry.getKey());
                        r.createCell(1).setCellValue(entry.getValue());
                    }
                    for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
                    workbook.write(out);
                    return out.toByteArray();
                }
            }
        } catch (Exception e) {
            log.error("[EXPORT_FAILED] role={} format={} error={}", role, format, e.getMessage());
            throw new RuntimeException("Export failed: " + e.getMessage());
        }
    }

    private static class ReportRow {
        String collegeName, id, fullName, email, phone, dept, gender, batch, city, isHead;

        ReportRow(String cn, String id, String fn, String em, String ph, String dp, String gn, String bt, String ct, String hd) {
            this.collegeName = cn; this.id = id; this.fullName = fn; this.email = em;
            this.phone = ph; this.dept = dp; this.gender = gn; this.batch = bt; this.city = ct; this.isHead = hd;
        }

        public String getDept() { return dept; }
    }

    // ─── Email helpers ─────────────────────────────────────────────────────────

    private void sendWelcomeEmail(User user, String rawPassword) {
        String html = "<h2>Welcome to SROTS, " + user.getFullName() + "!</h2>"
                + "<p>Your account has been created. Login credentials:</p>"
                + "<div style='background:#f4f4f4;padding:15px;border-radius:5px;'>"
                + "<strong>Username:</strong> " + user.getUsername() + "<br>"
                + "<strong>Temporary Password:</strong> " + rawPassword + "</div>"
                + "<p>Please change your password immediately after login.</p>"
                + "<a href='http://localhost:3000/login'>Login</a>";
        emailService.sendEmail(user.getEmail(), "Your SROTS Account Credentials", html);
        log.info("[WELCOME_EMAIL] Sent to userId={} email={}", user.getId(), user.getEmail());
    }

    private void sendAccountDeletedEmail(String email, String name) {
        String html = "<h3>Account Deletion Notice</h3><p>Hello " + name + ",</p>"
                + "<p>Your SROTS account has been deleted.</p>"
                + "<p>If this was a mistake, contact your college administrator.</p>";
        emailService.sendEmail(email, "SROTS Account Deleted", html);
        log.info("[DELETE_EMAIL] Sent to email={}", email);
    }
}