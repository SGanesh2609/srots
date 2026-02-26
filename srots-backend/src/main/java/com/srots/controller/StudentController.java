//package com.srots.controller;
//
//import java.security.Principal;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.multipart.MultipartFile;
//
//import com.srots.dto.AddressRequest;
//import com.srots.dto.studentDTOs.SectionRequest;
//import com.srots.model.StudentCertification;
//import com.srots.model.StudentExperience;
//import com.srots.model.StudentLanguage;
//import com.srots.model.StudentProfile;
//import com.srots.model.StudentProject;
//import com.srots.model.StudentPublication;
//import com.srots.model.StudentSkill;
//import com.srots.model.StudentSocialLink;
//import com.srots.service.StudentService;
//
//@RestController
//@RequestMapping("/api/v1/students/profile")
//public class StudentController {
//
//    @Autowired
//    private StudentService studentService;
//
//    // Standard way to extract the ID from the Auth Token
//    private String getAuthUserId(Authentication auth) {
//        if (auth == null) throw new RuntimeException("User not authenticated");
//        return auth.getName(); 
//    }
//
//    @PutMapping
//    public ResponseEntity<?> updateGeneralProfile(Authentication auth, @RequestBody StudentProfile profile) {
//        return ResponseEntity.ok(studentService.updateGeneralProfile(getAuthUserId(auth), profile));
//    }
//
//    @PutMapping("/sections/skills")
//    public ResponseEntity<?> updateSkills(Authentication auth, @RequestBody SectionRequest<StudentSkill> request) {
//        return ResponseEntity.ok(studentService.manageSkill(getAuthUserId(auth), request));
//    }
//    
//    @PutMapping("/sections/languages")
//    public ResponseEntity<?> updateLanguages(Authentication auth, @RequestBody SectionRequest<StudentLanguage> request) {
//        return ResponseEntity.ok(studentService.manageLanguage(getAuthUserId(auth), request));
//    }
//
//    @PutMapping("/sections/experience")
//    public ResponseEntity<?> updateExperience(Authentication auth, @RequestBody SectionRequest<StudentExperience> request) {
//        return ResponseEntity.ok(studentService.manageExperience(getAuthUserId(auth), request));
//    }
//
//    @PutMapping("/sections/projects")
//    public ResponseEntity<?> updateProjects(Authentication auth, @RequestBody SectionRequest<StudentProject> request) {
//        return ResponseEntity.ok(studentService.manageProject(getAuthUserId(auth), request));
//    }
//
//    @PutMapping("/sections/certifications")
//    public ResponseEntity<?> manageCertifications(Authentication auth, @RequestBody SectionRequest<StudentCertification> request) {
//        return ResponseEntity.ok(studentService.manageCertification(getAuthUserId(auth), request));
//    }
//
//    @PutMapping("/sections/publications")
//    public ResponseEntity<?> managePublications(Authentication auth, @RequestBody SectionRequest<StudentPublication> request) {
//        return ResponseEntity.ok(studentService.managePublication(getAuthUserId(auth), request));
//    }
//
//    @PutMapping("/sections/social-links")
//    public ResponseEntity<?> manageSocialLinks(Authentication auth, @RequestBody SectionRequest<StudentSocialLink> request) {
//        return ResponseEntity.ok(studentService.manageSocialLink(getAuthUserId(auth), request));
//    }
//
//    @PutMapping("/address/{addressType}")
//    public ResponseEntity<?> updateAddress(Authentication auth, @PathVariable String addressType, @RequestBody AddressRequest address) {
//        return ResponseEntity.ok(studentService.updateAddress(getAuthUserId(auth), addressType, address));
//    }
//
//    @PostMapping(value = "/resumes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<?> uploadResume(Authentication auth, @RequestParam("file") MultipartFile file) {
//        return ResponseEntity.ok(studentService.uploadResume(getAuthUserId(auth), file));
//    }
//
//    @DeleteMapping("/resumes/{resumeId}")
//    public ResponseEntity<?> deleteResume(Authentication auth, @PathVariable String resumeId) {
//        return ResponseEntity.ok(studentService.deleteResume(getAuthUserId(auth), resumeId));
//    }
//    
//    @PutMapping("/resumes/{resumeId}/set-default")
//    public ResponseEntity<?> setDefaultResume(Authentication auth, @PathVariable String resumeId) {
//        studentService.setDefaultResume(getAuthUserId(auth), resumeId);
//        return ResponseEntity.ok("Resume set as default successfully");
//    }
//    
//    
// // --- Dedicated Delete Endpoints ---
//
//
//    @DeleteMapping("/sections/skills/{id}")
//    public ResponseEntity<?> deleteSkill(Authentication auth, @PathVariable String id) {
//        studentService.removeSkill(getAuthUserId(auth), id);
//        return ResponseEntity.ok("Skill removed successfully");
//    }
//
//    @DeleteMapping("/sections/projects/{id}")
//    public ResponseEntity<?> deleteProject(Authentication auth, @PathVariable String id) {
//        studentService.removeProject(getAuthUserId(auth), id);
//        return ResponseEntity.ok("Project removed successfully");
//    }
//
//    @DeleteMapping("/sections/experience/{id}")
//    public ResponseEntity<?> deleteExperience(Authentication auth, @PathVariable String id) {
//        studentService.removeExperience(getAuthUserId(auth), id);
//        return ResponseEntity.ok("Experience removed successfully");
//    }
//
//    @DeleteMapping("/sections/certifications/{id}")
//    public ResponseEntity<?> deleteCertification(Authentication auth, @PathVariable String id) {
//        studentService.removeCertification(getAuthUserId(auth), id);
//        return ResponseEntity.ok("Certification removed successfully");
//    }
//
//    @DeleteMapping("/sections/languages/{id}")
//    public ResponseEntity<?> deleteLanguage(Authentication auth, @PathVariable String id) {
//        studentService.removeLanguage(getAuthUserId(auth), id);
//        return ResponseEntity.ok("Language removed successfully");
//    }
//
//    @DeleteMapping("/sections/publications/{id}")
//    public ResponseEntity<?> deletePublication(Authentication auth, @PathVariable String id) {
//        studentService.removePublication(getAuthUserId(auth), id);
//        return ResponseEntity.ok("Publication removed successfully");
//    }
//
//    @DeleteMapping("/sections/social-links/{id}")
//    public ResponseEntity<?> deleteSocialLink(Authentication auth, @PathVariable String id) {
//        studentService.removeSocialLink(getAuthUserId(auth), id);
//        return ResponseEntity.ok("Social link removed successfully");
//    }
//}

package com.srots.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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
import com.srots.service.StudentService;

/**
 * StudentController
 * Path: com.srots.controller.StudentController
 *
 * ─── FIX IN THIS VERSION ──────────────────────────────────────────────────────
 *
 * ADDED: @PatchMapping("/self") — updateSelfProfile()
 *
 * ROOT CAUSE OF 500 ON PATCH /api/v1/students/profile/self:
 *   The frontend calls PATCH /api/v1/students/profile/self to save contact
 *   info, education gaps, driving license, passport details, etc.
 *
 *   The backend had:
 *     - StudentServiceImpl.updateSelfProfile() ← EXISTS and is correct
 *     - StudentSelfUpdateRequest DTO           ← EXISTS and is correct
 *     - StudentProfile entity with all fields  ← EXISTS and is correct
 *
 *   But NO @PatchMapping("/self") handler in this controller.
 *
 *   What happened at runtime:
 *     1. Request arrives: PATCH /api/v1/students/profile/self
 *     2. Spring Security: authentication succeeds (JWT valid) → logs show
 *        "Looking for user in DB: SRM_21701A0501" and "User found!"
 *     3. DispatcherServlet: tries to find a @PatchMapping handler → NONE EXISTS
 *     4. Spring falls through to BasicErrorController → returns 500
 *        (or 404 depending on Spring Boot version / error config)
 *     5. The frontend sees 500 — no UPDATE SQL was ever issued because
 *        the request never reached the service layer
 *
 *   This explains exactly what the logs showed:
 *     - Authentication succeeded (2 SELECT queries ran)
 *     - "User found! Hash in DB is: ..." was logged
 *     - But NO UPDATE SQL appeared after
 *     - Frontend got 500
 *
 *   FIX: Add the @PatchMapping("/self") endpoint below.
 *
 * ─── OTHER ENDPOINTS ──────────────────────────────────────────────────────────
 * All other endpoints are unchanged from the previous version.
 */
@RestController
@RequestMapping("/api/v1/students/profile")
public class StudentController {

    @Autowired
    private StudentService studentService;

    /** Extract the authenticated user's ID from the JWT principal. */
    private String getAuthUserId(Authentication auth) {
        if (auth == null) throw new RuntimeException("User not authenticated");
        return auth.getName();
    }

    // ─── General Profile (legacy PUT) ─────────────────────────────────────────

    
    @PutMapping
    public ResponseEntity<?> updateGeneralProfile(
            Authentication auth,
            @RequestBody StudentProfile profile) {
        return ResponseEntity.ok(studentService.updateGeneralProfile(getAuthUserId(auth), profile));
    }

    // ─── Student Self-Service Update ──────────────────────────────────────────

    @PatchMapping("/self")
    public ResponseEntity<Student360Response> updateSelfProfile(
            Authentication auth,
            @RequestBody StudentSelfUpdateRequest request) {
        return ResponseEntity.ok(
                studentService.updateSelfProfile(getAuthUserId(auth), request));
    }

    // ─── Section Mutations ────────────────────────────────────────────────────

    @PutMapping("/sections/skills")
    public ResponseEntity<Student360Response> updateSkills(
            Authentication auth,
            @RequestBody SectionRequest<StudentSkill> request) {
        return ResponseEntity.ok(studentService.manageSkill(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/languages")
    public ResponseEntity<Student360Response> updateLanguages(
            Authentication auth,
            @RequestBody SectionRequest<StudentLanguage> request) {
        return ResponseEntity.ok(studentService.manageLanguage(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/experience")
    public ResponseEntity<Student360Response> updateExperience(
            Authentication auth,
            @RequestBody SectionRequest<StudentExperience> request) {
        return ResponseEntity.ok(studentService.manageExperience(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/projects")
    public ResponseEntity<Student360Response> updateProjects(
            Authentication auth,
            @RequestBody SectionRequest<StudentProject> request) {
        return ResponseEntity.ok(studentService.manageProject(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/certifications")
    public ResponseEntity<Student360Response> manageCertifications(
            Authentication auth,
            @RequestBody SectionRequest<StudentCertification> request) {
        return ResponseEntity.ok(studentService.manageCertification(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/publications")
    public ResponseEntity<Student360Response> managePublications(
            Authentication auth,
            @RequestBody SectionRequest<StudentPublication> request) {
        return ResponseEntity.ok(studentService.managePublication(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/social-links")
    public ResponseEntity<Student360Response> manageSocialLinks(
            Authentication auth,
            @RequestBody SectionRequest<StudentSocialLink> request) {
        return ResponseEntity.ok(studentService.manageSocialLink(getAuthUserId(auth), request));
    }

    // ─── Address ──────────────────────────────────────────────────────────────

    @PutMapping("/address/{addressType}")
    public ResponseEntity<?> updateAddress(
            Authentication auth,
            @PathVariable String addressType,
            @RequestBody AddressRequest address) {
        return ResponseEntity.ok(
                studentService.updateAddress(getAuthUserId(auth), addressType, address));
    }

    // ─── Resumes ──────────────────────────────────────────────────────────────

    @PostMapping(value = "/resumes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Student360Response> uploadResume(
            Authentication auth,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(studentService.uploadResume(getAuthUserId(auth), file));
    }

    @DeleteMapping("/resumes/{resumeId}")
    public ResponseEntity<Student360Response> deleteResume(
            Authentication auth,
            @PathVariable String resumeId) {
        return ResponseEntity.ok(studentService.deleteResume(getAuthUserId(auth), resumeId));
    }

    @PutMapping("/resumes/{resumeId}/set-default")
    public ResponseEntity<Student360Response> setDefaultResume(
            Authentication auth,
            @PathVariable String resumeId) {
        return ResponseEntity.ok(studentService.setDefaultResume(getAuthUserId(auth), resumeId));
    }

    // ─── Section Deletes ──────────────────────────────────────────────────────

    @DeleteMapping("/sections/skills/{id}")
    public ResponseEntity<Student360Response> deleteSkill(
            Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(studentService.removeSkill(getAuthUserId(auth), id));
    }

    @DeleteMapping("/sections/projects/{id}")
    public ResponseEntity<Student360Response> deleteProject(
            Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(studentService.removeProject(getAuthUserId(auth), id));
    }

    @DeleteMapping("/sections/experience/{id}")
    public ResponseEntity<Student360Response> deleteExperience(
            Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(studentService.removeExperience(getAuthUserId(auth), id));
    }

    @DeleteMapping("/sections/certifications/{id}")
    public ResponseEntity<Student360Response> deleteCertification(
            Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(studentService.removeCertification(getAuthUserId(auth), id));
    }

    @DeleteMapping("/sections/languages/{id}")
    public ResponseEntity<Student360Response> deleteLanguage(
            Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(studentService.removeLanguage(getAuthUserId(auth), id));
    }

    @DeleteMapping("/sections/publications/{id}")
    public ResponseEntity<Student360Response> deletePublication(
            Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(studentService.removePublication(getAuthUserId(auth), id));
    }

    @DeleteMapping("/sections/social-links/{id}")
    public ResponseEntity<Student360Response> deleteSocialLink(
            Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(studentService.removeSocialLink(getAuthUserId(auth), id));
    }
    
    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> getExpiringStudents(@RequestParam String collegeId) {
        return ResponseEntity.ok(studentService.getExpiringStudents(collegeId));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> getAccountStats(@RequestParam String collegeId) {
        return ResponseEntity.ok(studentService.getAccountStats(collegeId));
    }
}