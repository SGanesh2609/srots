package com.srots.controller;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

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

    /**
     * UPLOAD STUDENTS: Atomic process. 
     */
    @PostMapping("/upload-students")
    public ResponseEntity<byte[]> uploadStudents(
    		@RequestParam("file") MultipartFile file, 
            @RequestParam("collegeId") String collegeId,
            @RequestParam(value = "reportFormat", defaultValue = "excel") String reportFormat ) {
        try {
            byte[] report = bulkUploadService.processBulkUploadAndGetReport(file, collegeId, false, reportFormat);
            return createFormattedResponse(report, "Student_Upload_Report", reportFormat);
        } catch (Exception e) {
            // Instead of returning a simple string, let's generate a proper Error Report File even on crash
            try {
                List<BulkUploadService.RowStatus> errorList = List.of(
                    new BulkUploadService.RowStatus("CRITICAL_ERROR", "FAILED", e.getMessage())
                );
                byte[] errorFile = bulkUploadService.generateFinalReport(errorList, reportFormat);
                return createFormattedResponse(errorFile, "Critical_Failure_Report", reportFormat);
            } catch (IOException ioe) {
                return createErrorResponse(e); // Fallback to plain text
            }
        }
    }

    /**
     * UPDATE STUDENTS: Atomic process. 
     */
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
    
    /**
     * DELETE STUDENTS: Atomic process.
     */
    @PostMapping("/delete-students")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV', 'ROLE_CPH')")
    public ResponseEntity<byte[]> deleteStudents(
            @RequestParam("file") MultipartFile file, 
            @RequestParam("collegeId") String collegeId, // Changed from collegeCode
            @RequestParam(value = "reportFormat", defaultValue = "excel") String reportFormat) {
        try {
            byte[] report = bulkUploadService.processBulkDeleteAndGetReport(file, collegeId, reportFormat);
            return createFormattedResponse(report, "Student_Delete_Report", reportFormat);
        } catch (Exception e) {
            return createErrorResponse(e);
        }
    }
    /**
     * UPLOAD STAFF: Atomic process. 
     */
    @PostMapping("/upload-staff")
//    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV') or (hasRole('ROLE_CPH'))")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
    public ResponseEntity<byte[]> uploadStaff(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "collegeId", required = false) String requestedCollegeId,
            @RequestParam(value = "reportFormat", defaultValue = "excel") String reportFormat,
            Principal principal) {
        try {
            User currentUser = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String finalCollegeId;
            String roleToAssign;

            if (currentUser.getRole() == User.Role.ADMIN || currentUser.getRole() == User.Role.SROTS_DEV) {
                finalCollegeId = requestedCollegeId;
                roleToAssign = (requestedCollegeId == null) ? "SROTS_DEV" : "CPH";
            } else {
                finalCollegeId = currentUser.getCollege().getId();
                roleToAssign = "CPH";
            }

            byte[] report = bulkUploadService.processBulkStaffUploadAndGetReport(file, finalCollegeId, roleToAssign, reportFormat);
            return createFormattedResponse(report, "Staff_Upload_Report", reportFormat);
        } catch (Exception e) {
            return createErrorResponse(e);
        }
    }

    /**
     * MANUAL ERROR DOWNLOAD
     */
    @PostMapping("/download-errors")
    public ResponseEntity<byte[]> downloadErrorReport(@RequestBody List<String> errors) {
        try {
            if (errors == null || errors.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            byte[] fileContent = bulkUploadService.generateErrorLog(errors);
            // Defaulting to TXT for error logs for better readability
            return createFormattedResponse(fileContent, "manual_error_log", "txt");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // --- TEMPLATE ENDPOINTS ---

    @GetMapping("/template/staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
    public ResponseEntity<byte[]> downloadStaffTemplate(@RequestParam(defaultValue = "excel") String format) throws IOException {
        byte[] template = bulkUploadService.generateStaffTemplate(format);
        return createFormattedResponse(template, "staff_bulk_template", format);
    }

    @GetMapping("/template/delete-students")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV', 'ROLE_CPH')")
    public ResponseEntity<byte[]> downloadDeleteTemplate(@RequestParam(defaultValue = "excel") String format) throws IOException {
        byte[] template = bulkUploadService.generateDeleteTemplate(format);
        return createFormattedResponse(template, "student_delete_template", format);
    }
    
    @GetMapping("/template/students")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SROTS_DEV', 'ROLE_CPH')")
    public ResponseEntity<byte[]> downloadStudentTemplate(@RequestParam(defaultValue = "excel") String format) throws IOException {
        byte[] template = bulkUploadService.generateStudentTemplate(format);
        return createFormattedResponse(template, "student_bulk_template", format);
    }

    // --- UNIFIED HELPER METHODS ---

    /**
     * Dynamic response generator for Excel, CSV, or TXT
     */
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