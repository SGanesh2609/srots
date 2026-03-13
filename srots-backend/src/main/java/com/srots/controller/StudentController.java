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

import jakarta.validation.Valid;
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
            @Valid @RequestBody StudentProfile profile) {
        return ResponseEntity.ok(studentService.updateGeneralProfile(getAuthUserId(auth), profile));
    }

    // ─── Student Self-Service Update ──────────────────────────────────────────

    @PatchMapping("/self")
    public ResponseEntity<Student360Response> updateSelfProfile(
            Authentication auth,
            @Valid @RequestBody StudentSelfUpdateRequest request) {
        return ResponseEntity.ok(
                studentService.updateSelfProfile(getAuthUserId(auth), request));
    }

    // ─── Section Mutations ────────────────────────────────────────────────────

    @PutMapping("/sections/skills")
    public ResponseEntity<Student360Response> updateSkills(
            Authentication auth,
            @Valid @RequestBody SectionRequest<StudentSkill> request) {
        return ResponseEntity.ok(studentService.manageSkill(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/languages")
    public ResponseEntity<Student360Response> updateLanguages(
            Authentication auth,
            @Valid @RequestBody SectionRequest<StudentLanguage> request) {
        return ResponseEntity.ok(studentService.manageLanguage(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/experience")
    public ResponseEntity<Student360Response> updateExperience(
            Authentication auth,
            @Valid @RequestBody SectionRequest<StudentExperience> request) {
        return ResponseEntity.ok(studentService.manageExperience(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/projects")
    public ResponseEntity<Student360Response> updateProjects(
            Authentication auth,
            @Valid @RequestBody SectionRequest<StudentProject> request) {
        return ResponseEntity.ok(studentService.manageProject(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/certifications")
    public ResponseEntity<Student360Response> manageCertifications(
            Authentication auth,
            @Valid @RequestBody SectionRequest<StudentCertification> request) {
        return ResponseEntity.ok(studentService.manageCertification(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/publications")
    public ResponseEntity<Student360Response> managePublications(
            Authentication auth,
            @Valid @RequestBody SectionRequest<StudentPublication> request) {
        return ResponseEntity.ok(studentService.managePublication(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/social-links")
    public ResponseEntity<Student360Response> manageSocialLinks(
            Authentication auth,
            @Valid @RequestBody SectionRequest<StudentSocialLink> request) {
        return ResponseEntity.ok(studentService.manageSocialLink(getAuthUserId(auth), request));
    }

    // ─── Address ──────────────────────────────────────────────────────────────

    @PutMapping("/address/{addressType}")
    public ResponseEntity<?> updateAddress(
            Authentication auth,
            @PathVariable String addressType,
            @Valid @RequestBody AddressRequest address) {
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