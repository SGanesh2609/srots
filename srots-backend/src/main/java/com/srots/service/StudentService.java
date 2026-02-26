////package com.srots.service;
////
////import org.springframework.web.multipart.MultipartFile;
////
////import com.srots.dto.AddressRequest;
////import com.srots.dto.studentDTOs.SectionRequest;
////import com.srots.model.StudentCertification;
////import com.srots.model.StudentExperience;
////import com.srots.model.StudentLanguage;
////import com.srots.model.StudentProfile;
////import com.srots.model.StudentProject;
////import com.srots.model.StudentPublication;
////import com.srots.model.StudentResume;
////import com.srots.model.StudentSkill;
////import com.srots.model.StudentSocialLink;
////
////public interface StudentService {
////	
////	public StudentProfile updateGeneralProfile(String studentId, StudentProfile updatedData);
////	public StudentProfile updateAddress(String studentId, String type, AddressRequest dto);
////	
////	public Object manageSkill(String studentId, SectionRequest<StudentSkill> request);
////	public void removeSkill(String studentId, String skillId);
////	
////	public StudentResume uploadResume(String studentId, MultipartFile file);
////	public String deleteResume(String studentId, String resumeId);
////	public void setDefaultResume(String studentId, String resumeId);
////	
////	public Object manageProject(String studentId, SectionRequest<StudentProject> request);
////	public void removeProject(String studentId, String projectId);
////	
////	public Object manageCertification(String studentId, SectionRequest<StudentCertification> request);
////	public void removeCertification(String studentId, String certId);
////	
////	public Object manageSocialLink(String studentId, SectionRequest<StudentSocialLink> request);
////	public void removeSocialLink(String studentId, String linkId);
////	
////	public Object manageLanguage(String studentId, SectionRequest<StudentLanguage> request);
////	public void removeLanguage(String studentId, String langId);
////	
////	public Object manageExperience(String studentId, SectionRequest<StudentExperience> request);
////	public void removeExperience(String studentId, String expId);
////	
////	public Object managePublication(String studentId, SectionRequest<StudentPublication> request);
////	public void removePublication(String studentId, String pubId);
////
////}
//
//
//package com.srots.service;
//
//import java.util.List;
//import java.util.Map;
//
//import org.springframework.web.multipart.MultipartFile;
//
//import com.srots.dto.AddressRequest;
//import com.srots.dto.Student360Response;
//import com.srots.dto.studentDTOs.SectionRequest;
//import com.srots.dto.studentDTOs.StudentSelfUpdateRequest;
//import com.srots.model.StudentCertification;
//import com.srots.model.StudentExperience;
//import com.srots.model.StudentLanguage;
//import com.srots.model.StudentProfile;
//import com.srots.model.StudentProject;
//import com.srots.model.StudentPublication;
//import com.srots.model.StudentSkill;
//import com.srots.model.StudentSocialLink;
//
///**
// * StudentService interface
// * Path: com.srots.service.StudentService
// *
// * ─── CHANGES ──────────────────────────────────────────────────────────────────
// *
// * 1. updateAddress() now returns Student360Response instead of StudentProfile.
// *    This fixes the "white blank page" crash where the frontend was receiving a
// *    raw StudentProfile entity instead of the full Student object it expected.
// *
// * 2. Added updateSelfProfile(studentId, request) → Student360Response.
// *    This is the single endpoint students call to save:
// *      - Contact info  (communicationEmail, personalEmail, preferredContactMethod, linkedInProfile)
// *      - Education gaps (gapInStudies, gapDuration, gapReason)
// *      - More info      (drivingLicense, passportNumber, passportIssueDate, passportExpiryDate, dayScholar)
// *    Previously these sections had NO backend persistence — the frontend only
// *    updated local React state, so changes were lost on refresh.
// *
// * 3. All section manage* and remove* methods return Student360Response (unchanged).
// */
//public interface StudentService {
//
//    // ─── Profile ─────────────────────────────────────────────────────────────
//
//    /**
//     * Legacy general profile update (kept for backward compatibility).
//     * Prefer updateSelfProfile() for student-editable fields.
//     */
//    StudentProfile updateGeneralProfile(String studentId, StudentProfile updatedData);
//
//    /**
//     * Student self-service update: persists contact info, education gaps, and
//     * more-info fields to the student_profiles table, then returns a full
//     * Student360Response so the frontend can update all tabs at once.
//     *
//     * Security: Only the student who owns the profile may call this endpoint.
//     * The controller extracts the studentId from the JWT — the body is never
//     * trusted for identity.
//     */
//    Student360Response updateSelfProfile(String studentId, StudentSelfUpdateRequest request);
//
//    /**
//     * Update current or permanent address.
//     *
//     * FIX: Return type changed from StudentProfile → Student360Response.
//     * The frontend called onUpdateUser(updatedStudent) with the response, but
//     * StudentProfile is NOT a Student — this caused a white blank page crash
//     * because required Student fields (id, fullName, role, etc.) were missing.
//     */
//    Student360Response updateAddress(String studentId, String type, AddressRequest dto);
//
//    // ─── Resumes ─────────────────────────────────────────────────────────────
//
//    Student360Response uploadResume(String studentId, MultipartFile file);
//
//    Student360Response deleteResume(String studentId, String resumeId);
//
//    Student360Response setDefaultResume(String studentId, String resumeId);
//
//    // ─── Portfolio Sections — manage (create/update) ──────────────────────────
//
//    Student360Response manageSkill(String studentId, SectionRequest<StudentSkill> request);
//
//    Student360Response manageCertification(String studentId, SectionRequest<StudentCertification> request);
//
//    Student360Response manageProject(String studentId, SectionRequest<StudentProject> request);
//
//    Student360Response manageExperience(String studentId, SectionRequest<StudentExperience> request);
//
//    Student360Response manageLanguage(String studentId, SectionRequest<StudentLanguage> request);
//
//    Student360Response managePublication(String studentId, SectionRequest<StudentPublication> request);
//
//    Student360Response manageSocialLink(String studentId, SectionRequest<StudentSocialLink> request);
//
//    // ─── Portfolio Sections — remove ──────────────────────────────────────────
//
//    Student360Response removeSkill(String studentId, String skillId);
//
//    Student360Response removeProject(String studentId, String id);
//
//    Student360Response removeExperience(String studentId, String id);
//
//    Student360Response removeCertification(String studentId, String id);
//
//    Student360Response removeLanguage(String studentId, String id);
//
//    Student360Response removePublication(String studentId, String id);
//
//    Student360Response removeSocialLink(String studentId, String id);
//    
//    public List<StudentProfile> getExpiringStudents(String collegeId);
//    public Map<String, Long> getAccountStats(String collegeId);
//}

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