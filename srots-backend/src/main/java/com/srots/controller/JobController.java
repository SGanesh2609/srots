package com.srots.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference; // Correct import
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.jobdto.ApplicationListDTO;
import com.srots.dto.jobdto.JobApplicantsDashboardDTO;
import com.srots.dto.jobdto.JobDetailDTO;
import com.srots.dto.jobdto.JobHiringStatsDTO;
import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.dto.jobdto.StudentJobViewDTO;
import com.srots.dto.jobdto.TimelineDTO;
import com.srots.model.Job;
import com.srots.service.ApplicantService;
import com.srots.service.JobManagementService;
import com.srots.service.JobSearchService;
import com.srots.service.JobService;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    @Autowired 
    private JobService jobService;
    
    @Autowired
    private JobManagementService jobManagementService;
    
    @Autowired
    private JobSearchService jobSearchService;
    
    @Autowired
    private ApplicantService applicantService;
    
    @Autowired
    private ObjectMapper mapper;

    /**
     * Helper to get user info from JWT Token
     */
    private Map<String, String> getCurrentUserContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return Map.of("userId", "anonymous");
        return Map.of("userId", auth.getName());
    }

    // --- 1. ADMIN & STAFF MANAGEMENT ---

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH', 'STAFF')")
    public ResponseEntity<JobResponseDTO> createJob(
        @RequestPart("jobData") String jsonData, 
        @RequestPart(value = "jdFiles", required = false) MultipartFile[] jdFiles,
        @RequestPart(value = "avoidList", required = false) MultipartFile avoidList,
        @RequestParam("collegeCode") String collegeCode
    ) throws Exception {
        Map<String, Object> data = mapper.readValue(jsonData, new TypeReference<Map<String, Object>>() {});
        return ResponseEntity.ok(jobManagementService.saveJobWithFiles(data, jdFiles, avoidList, collegeCode));
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH', 'STAFF')")
    public ResponseEntity<JobResponseDTO> updateJob(
            @PathVariable String id,
            @RequestPart("jobData") String jsonData,
            @RequestPart(value = "jdFiles", required = false) MultipartFile[] jdFiles,
            @RequestPart(value = "avoidList", required = false) MultipartFile avoidList,
            @RequestParam("collegeCode") String collegeCode) throws Exception {
        Map<String, Object> data = mapper.readValue(jsonData, new TypeReference<Map<String, Object>>() {});
        return ResponseEntity.ok(jobManagementService.updateJobWithFiles(id, data, jdFiles, avoidList, collegeCode));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH', 'STAFF')")
    public ResponseEntity<Map<String, String>> deleteJob(
            @PathVariable String id, 
            @RequestParam String collegeId) { 
    	jobManagementService.deleteJob(id, collegeId); 
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }
    

    // --- 2. HIRING PROCESS ---

    @GetMapping("/{id}/export-list")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH', 'STAFF')")
    public ResponseEntity<byte[]> export(
            @PathVariable String id, 
            @RequestParam(defaultValue = "excel") String format,
            @RequestParam(defaultValue = "applicants") String type) throws Exception {
        
        Job job = jobManagementService.getJobEntity(id); 
        byte[] fileData;

        // Logic to switch between the two buttons
        if ("eligible".equalsIgnoreCase(type)) {
            fileData = applicantService.exportAllEligibleStudents(id, format);
        } else {
            fileData = applicantService.exportApplicants(id, format);
        }
        
        String rawName = job.getTitle() + "_" + job.getCompanyName() + "_" + type;
        String safeName = rawName.replaceAll("[^a-zA-Z0-9]", "_");
        
        boolean isCsv = "csv".equalsIgnoreCase(format);
        String extension = isCsv ? ".csv" : ".xlsx";
        MediaType mediaType = isCsv ? MediaType.parseMediaType("text/csv") 
                                   : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeName + extension + "\"")
                .contentType(mediaType)
                .body(fileData);
    }
    
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH', 'STAFF')")
    @GetMapping("/{jobId}/applicants-dashboard")
    public ResponseEntity<JobApplicantsDashboardDTO> getApplicantsDashboard(@PathVariable String jobId) throws Exception {
        return ResponseEntity.ok(applicantService.getJobApplicantsDashboard(jobId));
    }
    
    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> applyToJob(@PathVariable String id) {
        String studentId = getCurrentUserContext().get("userId");
        applicantService.updateApplication(id, studentId, "Applied");
        return ResponseEntity.ok(Map.of("message", "Application submitted successfully"));
    }
    
    
    @PostMapping("/{jobId}/rounds/{roundIndex}/results")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH', 'STAFF'))")
    public ResponseEntity<?> uploadResults(
            @PathVariable String jobId,
            @PathVariable int roundIndex,
            @RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> response = applicantService.uploadRoundResults(jobId, roundIndex, file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    
    @GetMapping("/{jobId}/hiring-stats")
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH', 'STAFF')")
    public ResponseEntity<JobHiringStatsDTO> getJobStats(@PathVariable String jobId) {
        try {
            return ResponseEntity.ok(applicantService.getJobHiringStats(jobId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // --- 3. STUDENT PORTAL ---

    
    
    
    //aplication tracking
    
    
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("students/applications/my") // Changed URL to be generic
    public ResponseEntity<List<ApplicationListDTO>> getApplications() {
        // studentId is now fetched inside the service from the Security Context
        return ResponseEntity.ok(applicantService.getStudentApplications());
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("students/{jobId}/timeline") // Removed studentId from Path
    public ResponseEntity<List<TimelineDTO>> getTimeline(@PathVariable String jobId) throws Exception {
        return ResponseEntity.ok(applicantService.getHiringTimeline(jobId));
    }
    
    // --- 4. SHARED ---
    
    
    @GetMapping("/student/portal")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentPortal(
        @RequestParam(defaultValue = "all") String filterType,
        @RequestParam(required = false) String searchQuery, // Added this
        @RequestParam(name = "jobTypeFilters", required = false) List<String> jobTypeFilters,
        @RequestParam(name = "workModeFilters", required = false) List<String> workModeFilters,
        @RequestParam(name = "statusFilters", required = false) List<String> statusFilters
    ) {
        try {
            List<StudentJobViewDTO> jobs = jobSearchService.getStudentPortalJobs(
                filterType, searchQuery, jobTypeFilters, workModeFilters, statusFilters);
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SROTS_DEV','CPH', 'STAFF')")
    public ResponseEntity<List<JobResponseDTO>> listAdminJobs(
        @RequestParam String collegeId, 
        @RequestParam(required = false) String query,
        @RequestParam(required = false) Job.JobType jobType, 
        @RequestParam(required = false) Job.WorkMode workMode,
        @RequestParam(required = false) Job.JobStatus status
    ) {
        return ResponseEntity.ok(jobSearchService.getAdminJobs(collegeId, query, jobType, workMode, status));
    }

    

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<JobDetailDTO> getJob(@PathVariable String id) {
        return ResponseEntity.ok(jobSearchService.getJobDetail(id));
    }
}


