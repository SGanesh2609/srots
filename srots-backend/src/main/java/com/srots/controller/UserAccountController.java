package com.srots.controller;

import java.io.InputStream;
import java.net.URLConnection;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
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
import com.srots.dto.Student360Response;
import com.srots.dto.UserCreateRequest;
import com.srots.dto.UserFullProfileResponse;
import com.srots.model.User;
import com.srots.repository.UserRepository;
import com.srots.service.FileService;
import com.srots.service.UserAccountService;
import com.srots.util.AuditLogger;

@RestController
@RequestMapping("/api/v1/accounts")
public class UserAccountController {

    @Autowired
    private UserAccountService userService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileService fileService;

    @Autowired
    private AuditLogger auditLogger;

    // ─────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────

    @PostMapping("/srots")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSrotsAccount(
            @Valid @RequestBody UserCreateRequest dto,
            @RequestParam String role,
            Authentication auth) {
        Object result = userService.create(dto, role);
        auditLogger.log("CREATE_ACCOUNT", auth.getName(), "role=" + role + ", email=" + dto.getEmail());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/cph")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> createCphAccount(
            @Valid @RequestBody UserCreateRequest dto,
            @RequestParam String role,
            Authentication auth) {
        Object result = userService.create(dto, role);
        auditLogger.log("CREATE_CPH_ACCOUNT", auth.getName(), "role=" + role + ", email=" + dto.getEmail());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/student")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> createStudentAccount(
            @Valid @RequestBody UserCreateRequest dto,
            Authentication auth) {
        Object result = userService.create(dto, "STUDENT");
        auditLogger.log("CREATE_STUDENT", auth.getName(),
                "roll=" + (dto.getStudentProfile() != null ? dto.getStudentProfile().getRollNumber() : "N/A")
                + ", collegeId=" + dto.getCollegeId());
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────
    // READ — paginated with account status filter
    // ─────────────────────────────────────────────────────────────

    /**
     * GET /accounts/college/{collegeId}/role/{roleName}
     *
     * NEW query param: `status`
     *   "active"        → only records where isDeleted=false  (default)
     *   "soft_deleted"  → only records where isDeleted=true
     *   "hard_deleted"  → records that were permanently removed (audit log; returns
     *                     empty list unless your backend keeps a deletion audit table)
     *
     * For CPH, the frontend always sends status=active (filter tabs are hidden in CPH portal).
     * For Admin / SrotsDev, the frontend passes whichever tab the user selected.
     */
    @GetMapping("/college/{collegeId}/role/{roleName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF')")
    public ResponseEntity<?> getCollegeUsersByRole(
            @PathVariable String collegeId,
            @PathVariable String roleName,
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) Integer batch,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "active") String status,   // NEW
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean paginate) {

        User.Role role = User.Role.valueOf(roleName.toUpperCase());

        if (paginate) {
            Pageable pageable = PageRequest.of(page, size, Sort.by("fullName").ascending());
            Page<User> result = userService.getFilteredUsersPaginated(
                    collegeId, role, branch, batch, gender, search, status, pageable);
            return ResponseEntity.ok(result);
        }

        // Legacy flat list — also honours status filter
        List<User> users = userService.getFilteredUsers(
                collegeId, role, branch, batch, gender, search, status);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/college/{collegeId}/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.collegeId == #collegeId)")
    public ResponseEntity<List<User>> getCollegeData(
            @PathVariable String collegeId,
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) Integer batch,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(userService.getFilteredUsers(collegeId, null, branch, batch, gender, search, "active"));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) Integer batch,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(userService.getFilteredUsers(null, null, branch, batch, gender, search, "active"));
    }

    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<List<User>> getUsersByRole(
            @PathVariable String roleName,
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) Integer batch,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String search) {
        User.Role role = User.Role.valueOf(roleName.toUpperCase());
        return ResponseEntity.ok(userService.getFilteredUsers(null, role, branch, batch, gender, search, "active"));
    }

    @GetMapping("/profile/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF') or (principal.userId == #id)")
    public ResponseEntity<UserFullProfileResponse> getFullProfile(@PathVariable String id) {
        return ResponseEntity.ok(userService.getFullUserProfile(id));
    }

    @GetMapping("/student-360/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH') or (principal.userId == #id)")
    public ResponseEntity<Student360Response> getFullStudentData(@PathVariable String id) {
        return ResponseEntity.ok(userService.getStudent360(id));
    }

    // ─────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH') or (principal.userId == #id) or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> updateAccount(
            @PathVariable String id,
            @Valid @RequestBody UserCreateRequest dto,
            Authentication auth) {
        Object result = userService.update(id, dto);
        auditLogger.log("UPDATE_ACCOUNT", auth.getName(), "targetUserId=" + id);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/manage/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> manageUserAccount(
            @PathVariable String id,
            @Valid @RequestBody UserCreateRequest dto,
            Authentication auth) {
        Object result = userService.update(id, dto);
        auditLogger.log("MANAGE_UPDATE_ACCOUNT", auth.getName(), "targetUserId=" + id);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{userId}/upload-photo")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (principal.userId == #userId)")
    public ResponseEntity<?> uploadPhoto(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "profiles") String category,
            Authentication auth) {
        User user = userService.getById(userId);
        if (user == null) return ResponseEntity.notFound().build();

        if (user.getAvatarUrl() != null) fileService.deleteFile(user.getAvatarUrl());

        String collegeCode = (user.getCollege() != null) ? user.getCollege().getCode() : "SROTS";
        String photoUrl = fileService.uploadFile(file, collegeCode, category, userId);
        userService.updateAvatarOnly(userId, photoUrl);

        auditLogger.log("UPLOAD_PHOTO", auth.getName(), "targetUserId=" + userId);
        return ResponseEntity.ok(Map.of("url", photoUrl, "status", "success"));
    }

    @GetMapping("/{collegeCode}/{category}/{userId}/{fileName:.+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF', 'STUDENT')")
    public ResponseEntity<InputStreamResource> getProfileImage(
            @PathVariable String collegeCode,
            @PathVariable String category,
            @PathVariable String userId,
            @PathVariable String fileName) {
        String fileUrl = "/api/v1/files/" + collegeCode + "/" + category + "/" + userId + "/" + fileName;
        InputStream stream = fileService.getFileStream(fileUrl);
        String mimeType = URLConnection.guessContentTypeFromName(fileName);
        if (mimeType == null) mimeType = "image/jpeg";
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(mimeType)).body(new InputStreamResource(stream));
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE (Soft & Hard)
    // ─────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<String> deleteAccount(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean permanent,
            Authentication auth) {

        User user = userService.getById(id);
        if (user == null) return ResponseEntity.notFound().build();

        if (permanent) {
            if (!auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SROTS_DEV"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Hard delete requires ADMIN or SROTS_DEV role");
            }
            if (user.getAvatarUrl() != null) fileService.deleteFile(user.getAvatarUrl());
            userService.delete(id);
            auditLogger.log("HARD_DELETE_ACCOUNT", auth.getName(),
                    "targetUserId=" + id + ", name=" + user.getFullName() + ", email=" + user.getEmail());
            return ResponseEntity.ok("Account permanently deleted");
        }

        userService.softDelete(id, auth.getName());
        auditLogger.log("SOFT_DELETE_ACCOUNT", auth.getName(),
                "targetUserId=" + id + ", name=" + user.getFullName() + ", email=" + user.getEmail());
        return ResponseEntity.ok("Account soft-deleted. Data retained for 90 days.");
    }

    // ─────────────────────────────────────────────────────────────
    // RESTRICTION TOGGLE
    // ─────────────────────────────────────────────────────────────

    @PatchMapping("/{userId}/restrict")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<?> updateRestriction(
            @PathVariable String userId,
            @RequestParam boolean status,
            Authentication auth) {
        try {
            userService.toggleUserRestriction(userId, status);
            auditLogger.log("TOGGLE_RESTRICTION", auth.getName(),
                    "targetUserId=" + userId + ", restricted=" + status);
            return ResponseEntity.ok(Map.of(
                    "message", status ? "User has been restricted" : "Restriction removed",
                    "userId", userId,
                    "isRestricted", status));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────
    // RESEND CREDENTIALS
    // ─────────────────────────────────────────────────────────────

    @PostMapping("/{userId}/resend-credentials")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> resendCredentials(
            @PathVariable String userId,
            Authentication auth) {
        userService.resendCredentials(userId);
        auditLogger.log("RESEND_CREDENTIALS", auth.getName(), "targetUserId=" + userId);
        return ResponseEntity.ok(Map.of("message", "Credentials resent to user's registered email."));
    }

    // ─────────────────────────────────────────────────────────────
    // EXPORT REPORTS
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/export/college/{collegeId}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.collegeId == #collegeId)")
    public ResponseEntity<byte[]> downloadCollegeStudents(
            @PathVariable String collegeId,
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) Integer batch,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "excel") String format,
            Authentication auth) {
        String collegeName = userService.getCollegeName(collegeId);
        byte[] report = userService.exportUsersByRole(collegeId, User.Role.STUDENT, branch, batch, gender, format);
        auditLogger.log("EXPORT_STUDENTS", auth.getName(),
                "collegeId=" + collegeId + ", format=" + format + ", branch=" + branch + ", batch=" + batch);
        if (report == null || report.length == 0) return ResponseEntity.noContent().build();
        return createReportResponse(report, collegeName + "_Students", format);
    }

    @GetMapping("/export/college/{collegeId}/cp")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.collegeId == #collegeId)")
    public ResponseEntity<byte[]> downloadCollegeCpUsers(
            @PathVariable String collegeId,
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) String gender,
            @RequestParam(defaultValue = "excel") String format,
            Authentication auth) {
        String collegeName = userService.getCollegeName(collegeId);
        byte[] report = userService.exportUsersByRole(collegeId, User.Role.CPH, branch, null, gender, format);
        auditLogger.log("EXPORT_CP_USERS", auth.getName(), "collegeId=" + collegeId + ", format=" + format);
        if (report == null || report.length == 0) return ResponseEntity.noContent().build();
        return createReportResponse(report, collegeName + "_CP_Users", format);
    }

    @GetMapping("/export/all/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<byte[]> downloadAllStudents(
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) Integer batch,
            @RequestParam(required = false) String gender,
            @RequestParam(defaultValue = "excel") String format,
            Authentication auth) {
        byte[] report = userService.exportUsersByRole(null, User.Role.STUDENT, branch, batch, gender, format);
        auditLogger.log("EXPORT_ALL_STUDENTS", auth.getName(), "format=" + format);
        if (report == null || report.length == 0) return ResponseEntity.noContent().build();
        return createReportResponse(report, "All_Colleges_Students", format);
    }

    @GetMapping("/export/all/cp")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<byte[]> downloadAllCpUsers(
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) String gender,
            @RequestParam(defaultValue = "excel") String format,
            Authentication auth) {
        byte[] report = userService.exportUsersByRole(null, User.Role.CPH, branch, null, gender, format);
        auditLogger.log("EXPORT_ALL_CP", auth.getName(), "format=" + format);
        if (report == null || report.length == 0) return ResponseEntity.noContent().build();
        return createReportResponse(report, "All_Colleges_CP_Users", format);
    }

    // ─────────────────────────────────────────────────────────────
    // BULK OPERATIONS
    // ─────────────────────────────────────────────────────────────

    @PostMapping("/bulk-delete")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> bulkDelete(
            @Valid @RequestBody Map<String, List<String>> body,
            Authentication auth) {
        List<String> ids = body.get("ids");
        if (ids == null || ids.isEmpty()) return ResponseEntity.badRequest().body("No IDs provided");
        ids.forEach(id -> userService.softDelete(id, auth.getName()));
        auditLogger.log("BULK_SOFT_DELETE", auth.getName(), "count=" + ids.size() + ", ids=" + ids);
        return ResponseEntity.ok(Map.of("deleted", ids.size()));
    }

    // ─────────────────────────────────────────────────────────────
    // RESTORE SOFT-DELETED
    // ─────────────────────────────────────────────────────────────

    /**
     * POST /accounts/{id}/restore
     * Restores a soft-deleted user. ADMIN / SROTS_DEV only.
     */
    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<?> restoreAccount(
            @PathVariable String id,
            Authentication auth) {
        userService.restoreSoftDeleted(id, auth.getName());
        auditLogger.log("RESTORE_ACCOUNT", auth.getName(), "targetUserId=" + id);
        return ResponseEntity.ok(Map.of("message", "Account restored successfully.", "userId", id));
    }
    
    @GetMapping("/check-username")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
    public ResponseEntity<?> checkUsernameAvailability(
            @RequestParam String username) {
        boolean exists = userRepository.existsByUsername(username);
        return ResponseEntity.ok(Map.of(
                "available", !exists,
                "username",  username
        ));
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    private ResponseEntity<byte[]> createReportResponse(byte[] data, String fileName, String format) {
        String extension = "excel".equalsIgnoreCase(format) ? ".xlsx" : ".csv";
        org.springframework.http.MediaType mediaType = "excel".equalsIgnoreCase(format)
                ? org.springframework.http.MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                : org.springframework.http.MediaType.TEXT_PLAIN;
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + fileName.replace(" ", "_") + extension)
                .contentType(mediaType)
                .body(data);
    }
}