package com.srots.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.jobdto.*;
import com.srots.model.Job;
import com.srots.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private static final Logger log = LoggerFactory.getLogger(JobController.class);

    @Autowired private JobManagementService jobManagementService;
    @Autowired private JobSearchService     jobSearchService;
    @Autowired private ApplicantService     applicantService;
    @Autowired private ObjectMapper         mapper;

    private Map<String, String> getCurrentUserContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return Map.of("userId", "anonymous", "role", "ANONYMOUS");
        String role = auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .findFirst().orElse("UNKNOWN");
        return Map.of("userId", auth.getName(), "role", role);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 1. ADMIN & STAFF MANAGEMENT — CREATE / UPDATE
    // ══════════════════════════════════════════════════════════════════════════

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<JobResponseDTO> createJob(
            @RequestPart("jobData") String jsonData,
            @RequestPart(value = "jdFiles", required = false) MultipartFile[] jdFiles,
            @RequestPart(value = "avoidList", required = false) MultipartFile avoidList,
            @RequestParam("collegeCode") String collegeCode) throws Exception {

        Map<String, String> ctx = getCurrentUserContext();
        log.info("[API][POST /jobs] userId={} role={} collegeCode={}", ctx.get("userId"), ctx.get("role"), collegeCode);

        Map<String, Object> data = mapper.readValue(jsonData, new TypeReference<>() {});
        JobResponseDTO result = jobManagementService.saveJobWithFiles(data, jdFiles, avoidList, collegeCode);
        return ResponseEntity.ok(result);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<JobResponseDTO> updateJob(
            @PathVariable String id,
            @RequestPart("jobData") String jsonData,
            @RequestPart(value = "jdFiles", required = false) MultipartFile[] jdFiles,
            @RequestPart(value = "avoidList", required = false) MultipartFile avoidList,
            @RequestParam("collegeCode") String collegeCode) throws Exception {

        Map<String, String> ctx = getCurrentUserContext();
        log.info("[API][PUT /jobs/{}] userId={} role={}", id, ctx.get("userId"), ctx.get("role"));

        Map<String, Object> data = mapper.readValue(jsonData, new TypeReference<>() {});
        JobResponseDTO result = jobManagementService.updateJobWithFiles(id, data, jdFiles, avoidList, collegeCode);
        return ResponseEntity.ok(result);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. SOFT DELETE — STAFF triggers this (also CPH can soft-delete)
    //    PUT /jobs/{id}/archive
    // ══════════════════════════════════════════════════════════════════════════

    @PutMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<Map<String, String>> softDeleteJob(
            @PathVariable String id,
            @RequestParam String collegeId,
            @RequestParam(defaultValue = "") String reason) {

        Map<String, String> ctx = getCurrentUserContext();
        log.info("[API][PUT /jobs/{}/archive] userId={} role={} reason='{}'",
                id, ctx.get("userId"), ctx.get("role"), reason);

        jobManagementService.softDeleteJob(id, collegeId, reason);
        return ResponseEntity.ok(Map.of("message", "Job archived (soft-deleted) successfully"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. RESTORE — CPH / ADMIN only
    //    PUT /jobs/{id}/restore
    // ══════════════════════════════════════════════════════════════════════════

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH')")
    public ResponseEntity<JobResponseDTO> restoreJob(@PathVariable String id) {
        Map<String, String> ctx = getCurrentUserContext();
        log.info("[API][PUT /jobs/{}/restore] userId={} role={}", id, ctx.get("userId"), ctx.get("role"));
        return ResponseEntity.ok(jobManagementService.restoreJob(id));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4. HARD DELETE — CPH / ADMIN only (permanent + file cleanup)
    //    DELETE /jobs/{id}/permanent
    // ══════════════════════════════════════════════════════════════════════════

    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH')")
    public ResponseEntity<Map<String, String>> hardDeleteJob(
            @PathVariable String id,
            @RequestParam String collegeId) {

        Map<String, String> ctx = getCurrentUserContext();
        log.info("[API][DELETE /jobs/{}/permanent] userId={} role={}", id, ctx.get("userId"), ctx.get("role"));

        jobManagementService.hardDeleteJob(id, collegeId);
        return ResponseEntity.ok(Map.of("message", "Job permanently deleted"));
    }

    // Legacy DELETE endpoint — soft-deletes (backward compat)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<Map<String, String>> deleteJobLegacy(
            @PathVariable String id,
            @RequestParam String collegeId) {

        Map<String, String> ctx = getCurrentUserContext();
        log.info("[API][DELETE /jobs/{}] (legacy→softDelete) userId={} role={}", id, ctx.get("userId"), ctx.get("role"));

        jobManagementService.softDeleteJob(id, collegeId, "Deleted via legacy endpoint");
        return ResponseEntity.ok(Map.of("message", "Job archived successfully"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5. LIST JOBS — WITH PAGINATION + SOFT-DELETE AWARENESS
    //    GET /jobs?collegeId=...&page=0&size=10&includeArchived=false
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<Map<String, Object>> listAdminJobs(
            @RequestParam String collegeId,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Job.JobType jobType,
            @RequestParam(required = false) Job.WorkMode workMode,
            @RequestParam(required = false) Job.JobStatus status,
            @RequestParam(required = false) String postedById,
            @RequestParam(defaultValue = "false") boolean includeArchived,
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "10")  int size) {

        // Cap page size to prevent loading thousands of rows in one request
        int effectiveSize = Math.min(size, 100);

        Map<String, String> ctx = getCurrentUserContext();

        // Only CPH / ADMIN can see archived jobs
        boolean canSeeArchived = "CPH".equals(ctx.get("role"))
                || "ADMIN".equals(ctx.get("role"))
                || "SROTS_DEV".equals(ctx.get("role"));

        boolean effectiveIncludeArchived = includeArchived && canSeeArchived;

        log.info("[API][GET /jobs] userId={} role={} collegeId={} page={} size={} includeArchived={}",
                ctx.get("userId"), ctx.get("role"), collegeId, page, effectiveSize, effectiveIncludeArchived);

        Pageable pageable = PageRequest.of(page, effectiveSize, Sort.by(Sort.Direction.DESC, "postedAt"));

        Page<JobResponseDTO> result = jobSearchService.getAdminJobsPaged(
                collegeId, query, jobType, workMode, status, postedById,
                effectiveIncludeArchived, pageable, ctx.get("userId"), ctx.get("role"));

        Map<String, Object> response = Map.of(
                "content",       result.getContent(),
                "totalElements", result.getTotalElements(),
                "totalPages",    result.getTotalPages(),
                "currentPage",   result.getNumber(),
                "pageSize",      result.getSize()
        );

        return ResponseEntity.ok(response);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6. JOB DETAIL
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<JobResponseDTO> getJob(@PathVariable String id) {
        Map<String, String> ctx = getCurrentUserContext();
        log.info("[API][GET /jobs/{}] userId={}", id, ctx.get("userId"));
        return ResponseEntity.ok(jobSearchService.getJobDetail(id));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 7. HIRING PROCESS
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/{id}/export-list")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<byte[]> export(
            @PathVariable String id,
            @RequestParam(defaultValue = "excel") String format,
            @RequestParam(defaultValue = "applicants") String type) throws Exception {

        Map<String, String> ctx = getCurrentUserContext();
        log.info("[API][GET /jobs/{}/export-list] userId={} type={} format={}", id, ctx.get("userId"), type, format);

        Job job = jobManagementService.getJobEntity(id);
        byte[] fileData = "eligible".equalsIgnoreCase(type)
                ? applicantService.exportAllEligibleStudents(id, format)
                : "not-interested".equalsIgnoreCase(type)
                ? applicantService.exportNotInterestedStudents(id, format)
                : applicantService.exportApplicants(id, format);

        String safeName = (job.getTitle() + "_" + job.getCompanyName() + "_" + type)
                .replaceAll("[^a-zA-Z0-9]", "_");
        boolean isCsv = "csv".equalsIgnoreCase(format);
        MediaType mediaType = isCsv
                ? MediaType.parseMediaType("text/csv")
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + safeName + (isCsv ? ".csv" : ".xlsx") + "\"")
                .contentType(mediaType)
                .body(fileData);
    }

    @GetMapping("/{jobId}/applicants-dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<JobApplicantsDashboardDTO> getApplicantsDashboard(@PathVariable String jobId) throws Exception {
        log.info("[API][GET /jobs/{}/applicants-dashboard]", jobId);
        return ResponseEntity.ok(applicantService.getJobApplicantsDashboard(jobId));
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> applyToJob(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String studentId = auth != null ? auth.getName() : "unknown";
        log.info("[API][POST /jobs/{}/apply] studentId={}", id, studentId);
        applicantService.updateApplication(id, studentId, "Applied");
        return ResponseEntity.ok(Map.of("message", "Application submitted successfully"));
    }

    @PostMapping("/{id}/not-interested")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> markNotInterested(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String studentId = auth != null ? auth.getName() : "unknown";
        log.info("[API][POST /jobs/{}/not-interested] studentId={}", id, studentId);
        applicantService.updateApplication(id, studentId, "Not_Interested");
        return ResponseEntity.ok(Map.of("message", "Marked as not interested"));
    }

    @PostMapping("/{jobId}/rounds/{roundIndex}/results")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<?> uploadResults(
            @PathVariable String jobId,
            @PathVariable int roundIndex,
            @RequestParam("file") MultipartFile file) {
        try {
            Map<String, String> ctx = getCurrentUserContext();
            log.info("[API][POST /jobs/{}/rounds/{}/results] userId={}", jobId, roundIndex, ctx.get("userId"));
            Map<String, Object> response = applicantService.uploadRoundResults(jobId, roundIndex, file);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | NoSuchElementException e) {
            // User input errors (bad file format, invalid round, job not found) → 400
            log.warn("[API][POST /jobs/{}/rounds/{}/results] Bad request: {}", jobId, roundIndex, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Unexpected system errors → 500
            log.error("[API][POST /jobs/{}/rounds/{}/results] ERROR: {}", jobId, roundIndex, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred. Please try again."));
        }
    }

    @GetMapping("/{jobId}/hiring-stats")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<JobHiringStatsDTO> getJobStats(@PathVariable String jobId) {
        try {
            return ResponseEntity.ok(applicantService.getJobHiringStats(jobId));
        } catch (Exception e) {
            log.error("[API][GET /jobs/{}/hiring-stats] ERROR: {}", jobId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 8. STUDENT PORTAL
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/student/portal")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentPortal(
            @RequestParam(defaultValue = "all") String filterType,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(name = "jobTypeFilters", required = false) List<String> jobTypeFilters,
            @RequestParam(name = "workModeFilters", required = false) List<String> workModeFilters,
            @RequestParam(name = "statusFilters",   required = false) List<String> statusFilters) {
        try {
            List<StudentJobViewDTO> jobs = jobSearchService.getStudentPortalJobs(
                    filterType, searchQuery, jobTypeFilters, workModeFilters, statusFilters);
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("students/applications/my")
    public ResponseEntity<List<ApplicationListDTO>> getApplications() {
        return ResponseEntity.ok(applicantService.getStudentApplications());
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("students/{jobId}/timeline")
    public ResponseEntity<List<TimelineDTO>> getTimeline(@PathVariable String jobId) throws Exception {
        return ResponseEntity.ok(applicantService.getHiringTimeline(jobId));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 9. ELIGIBLE STUDENTS
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/{jobId}/eligible-students")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH','STAFF')")
    public ResponseEntity<Map<String, Object>> getEligibleStudentsForDisplay(@PathVariable String jobId) {
        try {
            return ResponseEntity.ok(applicantService.getEligibleStudentsDisplay(jobId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}