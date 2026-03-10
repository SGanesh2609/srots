//package com.srots.controller;
//
//import java.io.IOException;
//import java.security.Principal;
//import java.util.List;
//import java.util.Map;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import com.srots.model.User;
//import com.srots.repository.UserRepository;
//import com.srots.service.BulkUploadService;
//
//@RestController
//@RequestMapping("/api/v1/admin/bulk")
//public class BulkUploadController {
//
//    @Autowired
//    private BulkUploadService bulkUploadService;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    // ─── EXISTING ENDPOINTS (unchanged) ──────────────────────────────────────
//
//    @PostMapping("/upload-students")
//    public ResponseEntity<byte[]> uploadStudents(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam("collegeId") String collegeId,
//            @RequestParam(value = "reportFormat", defaultValue = "excel") String reportFormat) {
//        try {
//            byte[] report = bulkUploadService.processBulkUploadAndGetReport(file, collegeId, false, reportFormat);
//            return createFormattedResponse(report, "Student_Upload_Report", reportFormat);
//        } catch (Exception e) {
//            try {
//                List<BulkUploadService.RowStatus> errorList = List.of(
//                        new BulkUploadService.RowStatus("CRITICAL_ERROR", "FAILED", e.getMessage()));
//                byte[] errorFile = bulkUploadService.generateFinalReport(errorList, reportFormat);
//                return createFormattedResponse(errorFile, "Critical_Failure_Report", reportFormat);
//            } catch (IOException ioe) {
//                return createErrorResponse(e);
//            }
//        }
//    }
//
//    @PostMapping("/update-students")
//    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV', 'ROLE_CPH')")
//    public ResponseEntity<byte[]> updateStudents(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam("collegeId") String collegeId,
//            @RequestParam(value = "reportFormat", defaultValue = "excel") String reportFormat) {
//        try {
//            byte[] report = bulkUploadService.processBulkUploadAndGetReport(file, collegeId, true, reportFormat);
//            return createFormattedResponse(report, "Student_Update_Report", reportFormat);
//        } catch (Exception e) {
//            return createErrorResponse(e);
//        }
//    }
//
//    @PostMapping("/delete-students")
//    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV', 'ROLE_CPH')")
//    public ResponseEntity<byte[]> deleteStudents(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam("collegeId") String collegeId,
//            @RequestParam(value = "reportFormat", defaultValue = "excel") String reportFormat) {
//        try {
//            byte[] report = bulkUploadService.processBulkDeleteAndGetReport(file, collegeId, reportFormat);
//            return createFormattedResponse(report, "Student_Delete_Report", reportFormat);
//        } catch (Exception e) {
//            return createErrorResponse(e);
//        }
//    }
//
//    @PostMapping("/upload-staff")
//    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
//    public ResponseEntity<byte[]> uploadStaff(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam(value = "collegeId", required = false) String requestedCollegeId,
//            @RequestParam(value = "reportFormat", defaultValue = "excel") String reportFormat,
//            Principal principal) {
//        try {
//            User currentUser = userRepository.findByUsername(principal.getName())
//                    .orElseThrow(() -> new RuntimeException("User not found"));
//
//            String finalCollegeId;
//            String roleToAssign;
//
//            if (currentUser.getRole() == User.Role.ADMIN || currentUser.getRole() == User.Role.SROTS_DEV) {
//                finalCollegeId = requestedCollegeId;
//                roleToAssign = (requestedCollegeId == null) ? "SROTS_DEV" : "CPH";
//            } else {
//                finalCollegeId = currentUser.getCollege().getId();
//                roleToAssign = "CPH";
//            }
//
//            byte[] report = bulkUploadService.processBulkStaffUploadAndGetReport(file, finalCollegeId, roleToAssign, reportFormat);
//            return createFormattedResponse(report, "Staff_Upload_Report", reportFormat);
//        } catch (Exception e) {
//            return createErrorResponse(e);
//        }
//    }
//
//    @PostMapping("/download-errors")
//    public ResponseEntity<byte[]> downloadErrorReport(@RequestBody List<String> errors) {
//        try {
//            if (errors == null || errors.isEmpty()) return ResponseEntity.badRequest().build();
//            byte[] fileContent = bulkUploadService.generateErrorLog(errors);
//            return createFormattedResponse(fileContent, "manual_error_log", "txt");
//        } catch (IOException e) {
//            return ResponseEntity.internalServerError().build();
//        }
//    }
//
//    // ─── TEMPLATE ENDPOINTS ───────────────────────────────────────────────────
//
//    @GetMapping("/template/staff")
//    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
//    public ResponseEntity<byte[]> downloadStaffTemplate(
//            @RequestParam(defaultValue = "excel") String format) throws IOException {
//        byte[] template = bulkUploadService.generateStaffTemplate(format);
//        return createFormattedResponse(template, "staff_bulk_template", format);
//    }
//
//    @GetMapping("/template/delete-students")
//    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV', 'ROLE_CPH')")
//    public ResponseEntity<byte[]> downloadDeleteTemplate(
//            @RequestParam(defaultValue = "excel") String format) throws IOException {
//        byte[] template = bulkUploadService.generateDeleteTemplate(format);
//        return createFormattedResponse(template, "student_delete_template", format);
//    }
//
//    @GetMapping("/template/students")
//    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV', 'ROLE_CPH')")
//    public ResponseEntity<byte[]> downloadStudentTemplate(
//            @RequestParam(defaultValue = "excel") String format) throws IOException {
//        byte[] template = bulkUploadService.generateStudentTemplate(format);
//        return createFormattedResponse(template, "student_bulk_template", format);
//    }
//
//    
//    @GetMapping("/template/renewal")
//    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
//    public ResponseEntity<byte[]> downloadRenewalTemplate(
//            @RequestParam(defaultValue = "excel") String format) throws IOException {
//        byte[] template = bulkUploadService.generateRenewalTemplate(format);
//        return createFormattedResponse(template, "student_renewal_template", format);
//    }
//
//    @PostMapping("/preview-delete")
//    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
//    public ResponseEntity<?> previewBulkDeletion(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam("collegeId") String collegeId) {
//        try {
//            Map<String, Object> preview = bulkUploadService.previewBulkDeletion(file, collegeId);
//            return ResponseEntity.ok(preview);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(Map.of("error", "Failed to parse file: " + e.getMessage()));
//        }
//    }
//
//    
//    @PostMapping("/preview-renew")
//    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
//    public ResponseEntity<?> previewBulkRenewal(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam("collegeId") String collegeId) {
//        try {
//            Map<String, Object> preview = bulkUploadService.previewBulkRenewal(file, collegeId);
//            return ResponseEntity.ok(preview);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(Map.of("error", "Failed to parse file: " + e.getMessage()));
//        }
//    }
//
//    // ─── HELPERS ─────────────────────────────────────────────────────────────
//
//    private ResponseEntity<byte[]> createFormattedResponse(byte[] content, String baseFileName, String format) {
//        MediaType mediaType;
//        String extension;
//
//        if ("csv".equalsIgnoreCase(format)) {
//            mediaType = MediaType.parseMediaType("text/csv");
//            extension = ".csv";
//        } else if ("txt".equalsIgnoreCase(format)) {
//            mediaType = MediaType.TEXT_PLAIN;
//            extension = ".txt";
//        } else {
//            mediaType = MediaType.APPLICATION_OCTET_STREAM;
//            extension = ".xlsx";
//        }
//
//        String finalFileName = baseFileName + "_" + System.currentTimeMillis() + extension;
//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + finalFileName)
//                .contentType(mediaType)
//                .body(content);
//    }
//
//    private ResponseEntity<byte[]> createErrorResponse(Exception e) {
//        String errorMessage = "CRITICAL SYSTEM ERROR: " + e.getMessage();
//        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=error_log.txt")
//                .contentType(MediaType.TEXT_PLAIN)
//                .body(errorMessage.getBytes());
//    }
//}

package com.srots.controller;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.srots.model.User;
import com.srots.repository.UserRepository;
import com.srots.service.BulkUploadService;

@RestController
@RequestMapping("/api/v1/admin/bulk")
public class BulkUploadController {

    @Autowired
    private BulkUploadService bulkUploadService;

    @Autowired
    private UserRepository userRepository;

    // ─── EXISTING ENDPOINTS (unchanged) ──────────────────────────────────────

    @PostMapping("/upload-students")
    public ResponseEntity<byte[]> uploadStudents(
            @RequestParam("file") MultipartFile file,
            @RequestParam("collegeId") String collegeId,
            @RequestParam(value = "reportFormat", defaultValue = "excel") String reportFormat) {
        try {
            byte[] report = bulkUploadService.processBulkUploadAndGetReport(file, collegeId, false, reportFormat);
            return createFormattedResponse(report, "Student_Upload_Report", reportFormat);
        } catch (Exception e) {
            try {
                List<BulkUploadService.RowStatus> errorList = List.of(
                        new BulkUploadService.RowStatus("CRITICAL_ERROR", "FAILED", e.getMessage()));
                byte[] errorFile = bulkUploadService.generateFinalReport(errorList, reportFormat);
                return createFormattedResponse(errorFile, "Critical_Failure_Report", reportFormat);
            } catch (IOException ioe) {
                return createErrorResponse(e);
            }
        }
    }

    @PostMapping("/update-students")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV', 'ROLE_CPH')")
    public ResponseEntity<byte[]> updateStudents(
            @RequestParam("file") MultipartFile file,
            @RequestParam("collegeId") String collegeId,
            @RequestParam(value = "reportFormat", defaultValue = "excel") String reportFormat) {
        try {
            byte[] report = bulkUploadService.processBulkUploadAndGetReport(file, collegeId, true, reportFormat);
            return createFormattedResponse(report, "Student_Update_Report", reportFormat);
        } catch (Exception e) {
            return createErrorResponse(e);
        }
    }

    @PostMapping("/delete-students")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV', 'ROLE_CPH')")
    public ResponseEntity<byte[]> deleteStudents(
            @RequestParam("file") MultipartFile file,
            @RequestParam("collegeId") String collegeId,
            @RequestParam(value = "reportFormat", defaultValue = "excel") String reportFormat) {
        try {
            byte[] report = bulkUploadService.processBulkDeleteAndGetReport(file, collegeId, reportFormat);
            return createFormattedResponse(report, "Student_Delete_Report", reportFormat);
        } catch (Exception e) {
            return createErrorResponse(e);
        }
    }

    /**
     * POST /admin/bulk/upload-staff
     *
     * Role assignment logic (in priority order):
     *
     *   1. If caller is ADMIN or SROTS_DEV:
     *        - `roleToAssign` request param is REQUIRED and must be "CPH" or "STAFF".
     *        - `collegeId`   request param is REQUIRED when roleToAssign = CPH or STAFF.
     *        - If roleToAssign = "SROTS_DEV", collegeId may be omitted.
     *
     *   2. If caller is CPH (a college head uploading their own staff):
     *        - Role is always STAFF (a CPH cannot create other CPHs via bulk upload).
     *        - collegeId is taken from the authenticated user's own college, ignoring
     *          any collegeId sent in the request.
     *
     * ──────────────────────────────────────────────────────────────────────────
     * CHANGE vs original:
     *   OLD: ADMIN/SROTS_DEV always assigned "CPH" when collegeId was present.
     *        `roleToAssign` was appended to FormData but the endpoint never read it.
     *   NEW: `roleToAssign` is now a proper @RequestParam (URL query param or form
     *        field) that the caller MUST supply for ADMIN/SROTS_DEV callers.
     *        The frontend passes it as a URL query param (?roleToAssign=STAFF).
     * ──────────────────────────────────────────────────────────────────────────
     */
    @PostMapping("/upload-staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
    public ResponseEntity<byte[]> uploadStaff(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "collegeId",     required = false) String requestedCollegeId,
            @RequestParam(value = "reportFormat",  defaultValue = "excel") String reportFormat,
            // ── NEW: explicit role override from the caller ──────────────────
            // ADMIN/SROTS_DEV must supply this; CPH callers are ignored (forced STAFF).
            @RequestParam(value = "roleToAssign",  required = false) String requestedRole,
            Principal principal) {
        try {
            User currentUser = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));

            String finalCollegeId;
            String roleToAssign;

            if (currentUser.getRole() == User.Role.ADMIN
                    || currentUser.getRole() == User.Role.SROTS_DEV) {
                // ── Admin / SROTS_DEV path ────────────────────────────────────
                // They must explicitly tell us what role to assign.
                // Default to "STAFF" if not provided (safe fallback, avoids
                // accidentally creating CPH accounts).
                roleToAssign  = (requestedRole != null && !requestedRole.isBlank())
                        ? requestedRole.toUpperCase()
                        : "STAFF";

                // SROTS_DEV accounts have no college, so collegeId may be null.
                finalCollegeId = "SROTS_DEV".equals(roleToAssign)
                        ? null
                        : requestedCollegeId;

            } else {
                // ── CPH path ─────────────────────────────────────────────────
                // A CPH can only create STAFF under their own college.
                // Ignore any roleToAssign or collegeId they send.
                finalCollegeId = currentUser.getCollege().getId();
                roleToAssign   = "STAFF";
            }

            byte[] report = bulkUploadService.processBulkStaffUploadAndGetReport(
                    file, finalCollegeId, roleToAssign, reportFormat);
            return createFormattedResponse(report, "Staff_Upload_Report", reportFormat);

        } catch (Exception e) {
            return createErrorResponse(e);
        }
    }

    @PostMapping("/download-errors")
    public ResponseEntity<byte[]> downloadErrorReport(@RequestBody List<String> errors) {
        try {
            if (errors == null || errors.isEmpty()) return ResponseEntity.badRequest().build();
            byte[] fileContent = bulkUploadService.generateErrorLog(errors);
            return createFormattedResponse(fileContent, "manual_error_log", "txt");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ─── TEMPLATE ENDPOINTS ───────────────────────────────────────────────────

    @GetMapping("/template/staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
    public ResponseEntity<byte[]> downloadStaffTemplate(
            @RequestParam(defaultValue = "excel") String format) throws IOException {
        byte[] template = bulkUploadService.generateStaffTemplate(format);
        return createFormattedResponse(template, "staff_bulk_template", format);
    }

    @GetMapping("/template/delete-students")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV', 'ROLE_CPH')")
    public ResponseEntity<byte[]> downloadDeleteTemplate(
            @RequestParam(defaultValue = "excel") String format) throws IOException {
        byte[] template = bulkUploadService.generateDeleteTemplate(format);
        return createFormattedResponse(template, "student_delete_template", format);
    }

    @GetMapping("/template/students")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV', 'ROLE_CPH')")
    public ResponseEntity<byte[]> downloadStudentTemplate(
            @RequestParam(defaultValue = "excel") String format) throws IOException {
        byte[] template = bulkUploadService.generateStudentTemplate(format);
        return createFormattedResponse(template, "student_bulk_template", format);
    }

    @GetMapping("/template/renewal")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<byte[]> downloadRenewalTemplate(
            @RequestParam(defaultValue = "excel") String format) throws IOException {
        byte[] template = bulkUploadService.generateRenewalTemplate(format);
        return createFormattedResponse(template, "student_renewal_template", format);
    }

    @PostMapping("/preview-delete")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> previewBulkDeletion(
            @RequestParam("file") MultipartFile file,
            @RequestParam("collegeId") String collegeId) {
        try {
            Map<String, Object> preview = bulkUploadService.previewBulkDeletion(file, collegeId);
            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to parse file: " + e.getMessage()));
        }
    }

    @PostMapping("/preview-renew")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<?> previewBulkRenewal(
            @RequestParam("file") MultipartFile file,
            @RequestParam("collegeId") String collegeId) {
        try {
            Map<String, Object> preview = bulkUploadService.previewBulkRenewal(file, collegeId);
            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to parse file: " + e.getMessage()));
        }
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private ResponseEntity<byte[]> createFormattedResponse(byte[] content, String baseFileName, String format) {
        MediaType mediaType;
        String extension;

        if ("csv".equalsIgnoreCase(format)) {
            mediaType = MediaType.parseMediaType("text/csv");
            extension = ".csv";
        } else if ("txt".equalsIgnoreCase(format)) {
            mediaType = MediaType.TEXT_PLAIN;
            extension = ".txt";
        } else {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
            extension = ".xlsx";
        }

        String finalFileName = baseFileName + "_" + System.currentTimeMillis() + extension;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + finalFileName)
                .contentType(mediaType)
                .body(content);
    }

    private ResponseEntity<byte[]> createErrorResponse(Exception e) {
        String errorMessage = "CRITICAL SYSTEM ERROR: " + e.getMessage();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=error_log.txt")
                .contentType(MediaType.TEXT_PLAIN)
                .body(errorMessage.getBytes());
    }
}