package com.srots.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.AddressRequest;
import com.srots.dto.Student360Response;
import com.srots.dto.studentDTOs.SectionRequest;
import com.srots.dto.studentDTOs.StudentSelfUpdateRequest;
import com.srots.exception.ResourceNotFoundException;
import com.srots.model.StudentCertification;
import com.srots.model.StudentExperience;
import com.srots.model.StudentLanguage;
import com.srots.model.StudentProfile;
import com.srots.model.StudentProject;
import com.srots.model.StudentPublication;
import com.srots.model.StudentResume;
import com.srots.model.StudentSkill;
import com.srots.model.StudentSocialLink;
import com.srots.model.User;
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

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;


@Service
public class StudentServiceImpl implements StudentService {

    // ─── Limits ───────────────────────────────────────────────────────────────
    private static final int MAX_RESUMES        = 3;
    private static final int MAX_PROJECTS       = 4;
    private static final int MAX_CERTIFICATIONS = 6;
    private static final int MAX_EXPERIENCE     = 4;
    private static final int MAX_PUBLICATIONS   = 4;

    // ─── Grace period thresholds (must match frontend lifecycle policy card) ──
    // 0 to -90 days past expiry  → Grace Period
    // -90+ days past expiry      → To Be Deleted
    private static final long GRACE_PERIOD_DAYS   = 90L;

    // ─── Dependencies ─────────────────────────────────────────────────────────
    @Autowired private StudentProfileRepository       profileRepo;
    @Autowired private StudentSkillRepository         skillRepo;
    @Autowired private StudentExperienceRepository    experienceRepo;
    @Autowired private StudentResumeRepository        resumeRepo;
    @Autowired private StudentProjectRepository       prjRepo;
    @Autowired private StudentCertificationRepository certRepo;
    @Autowired private StudentSocialLinkRepository    socialRepo;
    @Autowired private StudentLanguageRepository      languageRepo;
    @Autowired private StudentPublicationRepository   publicationRepo;
    @Autowired private ObjectMapper                   objectMapper;
    @Autowired private FileService                    fileService;
    @Autowired private UserAccountService             userAccountService;
    @Autowired private UserRepository                 userRepository;   // NEW: needed to fetch user.fullName / user.email

    @PersistenceContext
    private EntityManager entityManager;

    // ─── Helper: User reference (FK only) ────────────────────────────────────

    private User getStudentReference(String studentId) {
        User user = new User();
        user.setId(studentId);
        return user;
    }

    private void verifyOwnership(String recordOwnerId, String authenticatedId) {
        if (!recordOwnerId.equals(authenticatedId)) {
            throw new AccessDeniedException("Unauthorized: You do not own this record.");
        }
    }

    private Student360Response buildStudent360(String studentId) {
        return userAccountService.getStudent360(studentId);
    }

    // ─── Tab 1: General Profile (legacy) ─────────────────────────────────────

    @Override
    @Transactional
    public StudentProfile updateGeneralProfile(String studentId, StudentProfile updatedData) {
        StudentProfile existing = profileRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        existing.setPersonalEmail(updatedData.getPersonalEmail());
        existing.setLinkedinProfile(updatedData.getLinkedinProfile());
        existing.setGapInStudies(updatedData.getGapInStudies());
        existing.setGapDuration(updatedData.getGapDuration());
        existing.setGapReason(updatedData.getGapReason());
        existing.setDrivingLicense(updatedData.getDrivingLicense());
        return profileRepo.save(existing);
    }

    // ─── Student Self-Service Update ──────────────────────────────────────────

    @Override
    @Transactional
    public Student360Response updateSelfProfile(String studentId, StudentSelfUpdateRequest request) {
        StudentProfile existing = profileRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found: " + studentId));

        if (request.getCommunicationEmail() != null)
            existing.setCommunicationEmail(request.getCommunicationEmail());
        if (request.getPersonalEmail() != null)
            existing.setPersonalEmail(request.getPersonalEmail());
        if (request.getPreferredContactMethod() != null)
            existing.setPreferredContactMethod(request.getPreferredContactMethod());
        if (request.getLinkedInProfile() != null)
            existing.setLinkedinProfile(request.getLinkedInProfile());
        if (request.getGapInStudies() != null)
            existing.setGapInStudies(request.getGapInStudies());
        if (request.getGapDuration() != null)
            existing.setGapDuration(request.getGapDuration());
        if (request.getGapReason() != null)
            existing.setGapReason(request.getGapReason());
        if (request.getDrivingLicense() != null)
            existing.setDrivingLicense(request.getDrivingLicense());
        if (request.getPassportNumber() != null)
            existing.setPassportNumber(request.getPassportNumber());
        if (request.getPassportIssueDate() != null)
            existing.setPassportIssueDate(request.getPassportIssueDate());
        if (request.getPassportExpiryDate() != null)
            existing.setPassportExpiryDate(request.getPassportExpiryDate());
        if (request.getDayScholar() != null)
            existing.setDayScholar(request.getDayScholar());

        profileRepo.save(existing);
        return buildStudent360(studentId);
    }

    // ─── Address ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Student360Response updateAddress(String studentId, String type, AddressRequest dto) {
        StudentProfile profile = profileRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found: " + studentId));
        try {
            String jsonString = objectMapper.writeValueAsString(dto);
            if ("current".equalsIgnoreCase(type)) {
                profile.setCurrentAddress(jsonString);
            } else if ("permanent".equalsIgnoreCase(type)) {
                profile.setPermanentAddress(jsonString);
            } else {
                throw new IllegalArgumentException(
                        "Invalid address type: '" + type + "'. Use 'current' or 'permanent'.");
            }
            profileRepo.save(profile);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Address update failed: " + e.getMessage());
        }
        return buildStudent360(studentId);
    }

    // ─── Resumes ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Student360Response uploadResume(String studentId, MultipartFile file) {
        long count = resumeRepo.countByStudent_Id(studentId);
        if (count >= MAX_RESUMES) {
            throw new RuntimeException(
                    "Maximum " + MAX_RESUMES + " resumes allowed. Please delete an existing one first.");
        }

        String fileUrl = fileService.uploadFile(file, "resumes", "students");

        StudentResume resume = new StudentResume();
        resume.setStudent(getStudentReference(studentId));
        resume.setFileName(file.getOriginalFilename());
        resume.setFileUrl(fileUrl);
        resume.setUploadedAt(LocalDateTime.now());
        resume.setIsDefault(count == 0);
        resumeRepo.save(resume);

        return buildStudent360(studentId);
    }

    @Override
    @Transactional
    public Student360Response deleteResume(String studentId, String resumeId) {
        StudentResume resume = resumeRepo.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        verifyOwnership(resume.getStudent().getId(), studentId);

        boolean wasDefault = Boolean.TRUE.equals(resume.getIsDefault());
        String fileUrl = resume.getFileUrl();

        resumeRepo.delete(resume);
        fileService.deleteFile(fileUrl);

        if (wasDefault) {
            resumeRepo.findFirstByStudent_Id(studentId).ifPresent(next -> {
                next.setIsDefault(true);
                resumeRepo.save(next);
            });
        }

        return buildStudent360(studentId);
    }

    @Override
    @Transactional
    public Student360Response setDefaultResume(String studentId, String resumeId) {
        StudentResume targetResume = resumeRepo.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        verifyOwnership(targetResume.getStudent().getId(), studentId);

        resumeRepo.findAllByStudent_Id(studentId).forEach(r -> {
            r.setIsDefault(false);
            resumeRepo.save(r);
        });

        targetResume.setIsDefault(true);
        resumeRepo.save(targetResume);

        entityManager.flush();
        entityManager.clear();

        return buildStudent360(studentId);
    }

    // ─── Skills ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Student360Response manageSkill(String studentId, SectionRequest<StudentSkill> request) {
        StudentSkill data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentSkill existing = skillRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);
            existing.setName(data.getName());
            existing.setProficiency(data.getProficiency());
            skillRepo.save(existing);
        } else {
            data.setId(UUID.randomUUID().toString());
            data.setStudent(getStudentReference(studentId));
            skillRepo.save(data);
        }
        return buildStudent360(studentId);
    }

    // ─── Certifications ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public Student360Response manageCertification(String studentId, SectionRequest<StudentCertification> request) {
        StudentCertification data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentCertification existing = certRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Certification not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);
            existing.setName(data.getName());
            existing.setOrganizer(data.getOrganizer());
            existing.setCredentialUrl(data.getCredentialUrl());
            existing.setIssueDate(data.getIssueDate());
            existing.setExpiryDate(data.getExpiryDate());
            existing.setScore(data.getScore());
            certRepo.save(existing);
        } else {
            long count = certRepo.countByStudent_Id(studentId);
            if (count >= MAX_CERTIFICATIONS) {
                throw new RuntimeException(
                        "Maximum " + MAX_CERTIFICATIONS + " certifications allowed. Please delete an existing one first.");
            }
            data.setId(UUID.randomUUID().toString());
            data.setStudent(getStudentReference(studentId));
            certRepo.save(data);
        }
        return buildStudent360(studentId);
    }

    // ─── Projects ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Student360Response manageProject(String studentId, SectionRequest<StudentProject> request) {
        StudentProject data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentProject existing = prjRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);
            existing.setTitle(data.getTitle());
            existing.setDomain(data.getDomain());
            existing.setTechUsed(data.getTechUsed());
            existing.setProjectLink(data.getProjectLink());
            existing.setDescription(data.getDescription());
            existing.setStartDate(data.getStartDate());
            existing.setEndDate(data.getEndDate());
            existing.setIsCurrent(data.getIsCurrent());
            prjRepo.save(existing);
        } else {
            long count = prjRepo.countByStudent_Id(studentId);
            if (count >= MAX_PROJECTS) {
                throw new RuntimeException(
                        "Maximum " + MAX_PROJECTS + " projects allowed. Please delete an existing one first.");
            }
            data.setId(UUID.randomUUID().toString());
            data.setStudent(getStudentReference(studentId));
            prjRepo.save(data);
        }
        return buildStudent360(studentId);
    }

    // ─── Experience ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Student360Response manageExperience(String studentId, SectionRequest<StudentExperience> request) {
        StudentExperience data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentExperience existing = experienceRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Experience not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);
            existing.setTitle(data.getTitle());
            existing.setCompany(data.getCompany());
            existing.setLocation(data.getLocation());
            existing.setType(data.getType());
            existing.setStartDate(data.getStartDate());
            existing.setEndDate(data.getEndDate());
            existing.setIsCurrent(data.getIsCurrent());
            existing.setDescription(data.getDescription());
            experienceRepo.save(existing);
        } else {
            long count = experienceRepo.countByStudent_Id(studentId);
            if (count >= MAX_EXPERIENCE) {
                throw new RuntimeException(
                        "Maximum " + MAX_EXPERIENCE + " experience entries allowed. Please delete an existing one first.");
            }
            data.setId(UUID.randomUUID().toString());
            data.setStudent(getStudentReference(studentId));
            experienceRepo.save(data);
        }
        return buildStudent360(studentId);
    }

    // ─── Languages ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Student360Response manageLanguage(String studentId, SectionRequest<StudentLanguage> request) {
        StudentLanguage data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentLanguage existing = languageRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Language not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);
            existing.setName(data.getName());
            existing.setProficiency(data.getProficiency());
            languageRepo.save(existing);
        } else {
            data.setId(UUID.randomUUID().toString());
            data.setStudent(getStudentReference(studentId));
            languageRepo.save(data);
        }
        return buildStudent360(studentId);
    }

    // ─── Publications ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Student360Response managePublication(String studentId, SectionRequest<StudentPublication> request) {
        StudentPublication data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentPublication existing = publicationRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Publication not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);
            existing.setTitle(data.getTitle());
            existing.setPublisher(data.getPublisher());
            existing.setPublicationUrl(data.getPublicationUrl());
            existing.setPublishDate(data.getPublishDate());
            publicationRepo.save(existing);
        } else {
            long count = publicationRepo.countByStudent_Id(studentId);
            if (count >= MAX_PUBLICATIONS) {
                throw new RuntimeException(
                        "Maximum " + MAX_PUBLICATIONS + " publications allowed. Please delete an existing one first.");
            }
            data.setId(UUID.randomUUID().toString());
            data.setStudent(getStudentReference(studentId));
            publicationRepo.save(data);
        }
        return buildStudent360(studentId);
    }

    // ─── Social Links ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Student360Response manageSocialLink(String studentId, SectionRequest<StudentSocialLink> request) {
        StudentSocialLink data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentSocialLink existing = socialRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Social link not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);
            existing.setPlatform(data.getPlatform());
            existing.setUrl(data.getUrl());
            socialRepo.save(existing);
        } else {
            data.setId(UUID.randomUUID().toString());
            data.setStudent(getStudentReference(studentId));
            socialRepo.save(data);
        }
        return buildStudent360(studentId);
    }

    // ─── Remove methods ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public Student360Response removeSkill(String studentId, String skillId) {
        int deleted = skillRepo.deleteBySkillIdAndStudentId(skillId, studentId);
        validateDelete(deleted, "Skill");
        return buildStudent360(studentId);
    }

    @Override
    @Transactional
    public Student360Response removeProject(String studentId, String id) {
        int deleted = prjRepo.deleteByProjectIdAndStudentId(id, studentId);
        validateDelete(deleted, "Project");
        return buildStudent360(studentId);
    }

    @Override
    @Transactional
    public Student360Response removeExperience(String studentId, String id) {
        int deleted = experienceRepo.deleteByExperienceIdAndStudentId(id, studentId);
        validateDelete(deleted, "Experience");
        return buildStudent360(studentId);
    }

    @Override
    @Transactional
    public Student360Response removeCertification(String studentId, String id) {
        int deleted = certRepo.deleteByCertificationIdAndStudentId(id, studentId);
        validateDelete(deleted, "Certification");
        return buildStudent360(studentId);
    }

    @Override
    @Transactional
    public Student360Response removeLanguage(String studentId, String id) {
        int deleted = languageRepo.deleteByLanguageIdAndStudentId(id, studentId);
        validateDelete(deleted, "Language");
        return buildStudent360(studentId);
    }

    @Override
    @Transactional
    public Student360Response removePublication(String studentId, String id) {
        int deleted = publicationRepo.deleteByPublicationIdAndStudentId(id, studentId);
        validateDelete(deleted, "Publication");
        return buildStudent360(studentId);
    }

    @Override
    @Transactional
    public Student360Response removeSocialLink(String studentId, String id) {
        int deleted = socialRepo.deleteBySocialLinkIdAndStudentId(id, studentId);
        validateDelete(deleted, "Social Link");
        return buildStudent360(studentId);
    }

    // ─── Account Management ───────────────────────────────────────────────────

    /**
     * FIXED: Was returning List<StudentProfile> (raw entity) — frontend got blank table.
     *
     * Now returns List<Map<String, Object>> with flat shape:
     *   { id, name, email, expiryIn, status }
     *
     * The `id` field is the rollNumber — this is what AtRiskStudentList renders
     * in the "Roll Number" column via {stu.id}.
     *
     * The `expiryIn` field is the signed number of days until expiry:
     *   Positive  → account still active, expiring in N days
     *   Negative  → account already expired N days ago
     *
     * Status logic (matches the lifecycle policy card in the UI):
     *   expiryIn >= 0                → "Expiring Soon"
     *   expiryIn < 0 && >= -90       → "Grace Period"
     *   expiryIn < -90               → "To Be Deleted"
     *
     * Includes: accounts expiring within 30 days AND accounts up to 180 days past expiry.
     * Accounts more than 180 days past expiry are assumed already deleted and excluded.
     */
    @Override
    public List<Map<String, Object>> getExpiringStudents(String collegeId) {
        LocalDate today = LocalDate.now();
        LocalDate warningWindow = today.plusDays(30);
        LocalDate cutoff = today.minusDays(180); // Stop showing after 180 days past expiry

        List<StudentProfile> profiles = profileRepo.findByCollegeId(collegeId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (StudentProfile profile : profiles) {
            LocalDate expiry = profile.getPremiumEndDate();
            if (expiry == null) continue;

            // Only include if within the warning window (30 days ahead) or still in grace/deletion range
            if (expiry.isAfter(warningWindow) || expiry.isBefore(cutoff)) continue;

            // Calculate signed days to expiry
            long daysToExpiry = today.until(expiry, ChronoUnit.DAYS);
            // Note: if expiry is today, daysToExpiry = 0 (boundary — show as Expiring Soon)
            // if expiry was yesterday, daysToExpiry = -1 (Grace Period)

            String status;
            if (daysToExpiry >= 0) {
                status = "Expiring Soon";
            } else if (daysToExpiry >= -GRACE_PERIOD_DAYS) {
                status = "Grace Period";
            } else {
                status = "To Be Deleted";
            }

            // Fetch User to get fullName and email
            // profileRepo.findByCollegeId should JOIN fetch the user — if not, we fall back to userRepository
            User user = profile.getUser();
            if (user == null) {
                user = userRepository.findById(profile.getUserId()).orElse(null);
            }
            if (user == null) continue; // Orphaned profile — skip

            Map<String, Object> entry = new HashMap<>();
            entry.put("id", profile.getRollNumber());       // "Roll Number" column: stu.id
            entry.put("name", user.getFullName());           // "Name" column: stu.name
            entry.put("email", user.getEmail());             // "Email" column: stu.email
            entry.put("expiryIn", daysToExpiry);             // "Days to Expiry" column: stu.expiryIn
            entry.put("status", status);                     // Status badge: stu.status

            result.add(entry);
        }

        // Sort: expiring soonest first, then deepest in grace/deletion last
        result.sort((a, b) -> Long.compare((long) a.get("expiryIn"), (long) b.get("expiryIn")));

        return result;
    }

    /**
     * FIXED: Was returning { total, active, expiring30, expiring7, expired }.
     * Frontend AccountStats reads stats.expiring, stats.grace, stats.toBeDeleted —
     * all three showed 0 because none of those keys existed.
     *
     * Now returns exactly { expiring, grace, toBeDeleted } matching AccountStatsProps.
     *
     * Lifecycle boundaries (matching the policy card displayed in ManagingStudentAccounts):
     *   expiring:    premiumEndDate is between today (exclusive) and today+30 (inclusive)
     *   grace:       premiumEndDate is between today-90 (exclusive) and today (inclusive)
     *   toBeDeleted: premiumEndDate is today-90 or earlier
     */
    @Override
    public Map<String, Long> getAccountStats(String collegeId) {
        List<StudentProfile> profiles = profileRepo.findByCollegeId(collegeId);
        LocalDate today = LocalDate.now();
        LocalDate graceCutoff = today.minusDays(GRACE_PERIOD_DAYS);  // 90 days ago
        LocalDate expiryWindow = today.plusDays(30);                  // 30 days ahead

        long expiring = profiles.stream()
                .filter(p -> p.getPremiumEndDate() != null)
                // Active but expiring within 30 days (not yet expired)
                .filter(p -> p.getPremiumEndDate().isAfter(today) && !p.getPremiumEndDate().isAfter(expiryWindow))
                .count();

        long grace = profiles.stream()
                .filter(p -> p.getPremiumEndDate() != null)
                // Expired but within 90-day grace window
                .filter(p -> !p.getPremiumEndDate().isAfter(today) && p.getPremiumEndDate().isAfter(graceCutoff))
                .count();

        long toBeDeleted = profiles.stream()
                .filter(p -> p.getPremiumEndDate() != null)
                // Expired more than 90 days ago — scheduled for deletion
                .filter(p -> !p.getPremiumEndDate().isAfter(graceCutoff))
                .count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("expiring", expiring);         // matches stats.expiring in AccountStats
        stats.put("grace", grace);               // matches stats.grace in AccountStats
        stats.put("toBeDeleted", toBeDeleted);   // matches stats.toBeDeleted in AccountStats
        return stats;
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private void validateDelete(int rowsAffected, String section) {
        if (rowsAffected == 0) {
            throw new ResourceNotFoundException(section + " not found or unauthorized");
        }
        entityManager.flush();
        entityManager.clear();
    }
}