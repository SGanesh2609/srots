package com.srots.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.AddressRequest;
import com.srots.dto.Student360Response;
import com.srots.dto.studentDTOs.SectionRequest;
import com.srots.dto.studentDTOs.StudentSelfUpdateRequest;
import com.srots.model.StudentCertification;
import com.srots.model.StudentExperience;
import com.srots.model.StudentLanguage;
import com.srots.model.StudentProfile;
import com.srots.model.StudentProject;
import com.srots.model.StudentPublication;
import com.srots.model.StudentSkill;
import com.srots.model.StudentSocialLink;

/**
 * StudentService Interface
 * Path: com.srots.service.StudentService
 *
 * ─── FIXES IN THIS VERSION ────────────────────────────────────────────────────
 *
 * FIX 1: getExpiringStudents() return type corrected
 *   BEFORE: List<StudentProfile>  — raw entity, frontend AtRiskStudentList got blank table
 *   AFTER:  List<Map<String, Object>>  — flat DTO: { id, name, email, expiryIn, status }
 *
 * FIX 2: getAccountStats() keys corrected
 *   BEFORE keys returned: { total, active, expiring30, expiring7, expired }
 *   AFTER keys returned:  { expiring, grace, toBeDeleted }
 *   → Matches AccountStatsProps exactly; stat cards no longer show 0
 */
public interface StudentService {

    // ─── General Profile ──────────────────────────────────────────────────────
    StudentProfile updateGeneralProfile(String studentId, StudentProfile profile);

    // ─── Self-Service ─────────────────────────────────────────────────────────
    Student360Response updateSelfProfile(String studentId, StudentSelfUpdateRequest request);

    // ─── Address ──────────────────────────────────────────────────────────────
    Student360Response updateAddress(String studentId, String type, AddressRequest dto);

    // ─── Resumes ──────────────────────────────────────────────────────────────
    Student360Response uploadResume(String studentId, MultipartFile file);
    Student360Response deleteResume(String studentId, String resumeId);
    Student360Response setDefaultResume(String studentId, String resumeId);

    // ─── Section Mutations ────────────────────────────────────────────────────
    Student360Response manageSkill(String studentId, SectionRequest<StudentSkill> request);
    Student360Response manageCertification(String studentId, SectionRequest<StudentCertification> request);
    Student360Response manageProject(String studentId, SectionRequest<StudentProject> request);
    Student360Response manageExperience(String studentId, SectionRequest<StudentExperience> request);
    Student360Response manageLanguage(String studentId, SectionRequest<StudentLanguage> request);
    Student360Response managePublication(String studentId, SectionRequest<StudentPublication> request);
    Student360Response manageSocialLink(String studentId, SectionRequest<StudentSocialLink> request);

    // ─── Section Removes ─────────────────────────────────────────────────────
    Student360Response removeSkill(String studentId, String id);
    Student360Response removeProject(String studentId, String id);
    Student360Response removeExperience(String studentId, String id);
    Student360Response removeCertification(String studentId, String id);
    Student360Response removeLanguage(String studentId, String id);
    Student360Response removePublication(String studentId, String id);
    Student360Response removeSocialLink(String studentId, String id);

    // ─── Account Management ───────────────────────────────────────────────────

    /**
     * Returns at-risk students (expiring soon OR already expired).
     *
     * Each entry is a FLAT map matching AtRiskStudentList expectations:
     *   {
     *     id:       String  — rollNumber (display column "Roll Number")
     *     name:     String  — user.fullName
     *     email:    String  — user.email
     *     expiryIn: long    — days until expiry; NEGATIVE when already expired
     *     status:   String  — "Expiring Soon" | "Grace Period" | "To Be Deleted"
     *   }
     *
     * Includes:
     *   - Accounts expiring within next 30 days (expiryIn >= 0 && <= 30)
     *   - Accounts already expired, up to 180 days past expiry (grace + to-be-deleted)
     *
     * FIX: Was returning List<StudentProfile> — all table cells rendered blank
     * because stu.id, stu.name, stu.email, stu.expiryIn don't exist on StudentProfile.
     */
    List<Map<String, Object>> getExpiringStudents(String collegeId);

    /**
     * Returns account lifecycle statistics.
     * Keys MUST exactly match AccountStatsProps:
     *   {
     *     expiring:    long  — accounts expiring in next 30 days (premiumEndDate > today && <= today+30)
     *     grace:       long  — accounts 1–90 days past premiumEndDate
     *     toBeDeleted: long  — accounts 90+ days past premiumEndDate
     *   }
     *
     * FIX: Was returning { total, active, expiring30, expiring7, expired }
     * — all three stat cards showed 0 because the keys didn't match.
     */
    Map<String, Long> getAccountStats(String collegeId);
}