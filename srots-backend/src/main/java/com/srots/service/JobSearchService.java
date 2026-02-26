//package com.srots.service;
//
//import java.math.BigDecimal;
//import java.util.List;
//
//import com.srots.dto.jobdto.JobDetailDTO;
//import com.srots.dto.jobdto.JobHiringStatsDTO;
//import com.srots.dto.jobdto.JobResponseDTO;
//import com.srots.dto.jobdto.StudentJobViewDTO;
//import com.srots.model.EducationRecord;
//import com.srots.model.Job;
//
//public interface JobSearchService {
//	
//	// Admin/Staff view of jobs with broad filters
////    List<JobResponseDTO> getAdminJobs(String collegeId, String query, Job.JobType jobType, Job.WorkMode workMode, Job.JobStatus status);
//	List<JobResponseDTO> getAdminJobs(String collegeId, String query,
//	        Job.JobType jobType, Job.WorkMode workMode, Job.JobStatus status,
//	        String postedById);
//    
//    // Student portal view (Only shows active/relevant jobs)
////    List<StudentJobViewDTO> getStudentPortalJobs(String filterType, List<String> jobTypeFilters);
////    public List<StudentJobViewDTO> getStudentPortalJobs(String filterType, List<String> jobTypeFilters, List<String> workModeFilters, List<String> statusFilters);
//    public List<StudentJobViewDTO> getStudentPortalJobs(String filterType, String searchQuery, List<String> jobTypeFilters, List<String> workModeFilters, List<String> statusFilters);
//    
//    // Full job description and requirement details
//    JobDetailDTO getJobDetail(String jobId);
//
//    // The core engine for checking if a specific student qualifies
//    StudentJobViewDTO getStudentJobStatus(String jobId, String studentId);
//    
//    
//    public BigDecimal getNormalizedScore(List<EducationRecord> records, String level);
//    
//    
//
//}


package com.srots.service;

import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.dto.jobdto.StudentJobViewDTO;
import com.srots.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * JobSearchService — read-only query operations.
 *
 * Enterprise contract:
 *  - getAdminJobsPaged()  → paginated list for admin/staff panel (pagination + soft-delete aware)
 *  - getAdminJobs()       → legacy non-paginated list (kept for backward compat)
 *  - getJobDetail()       → single job detail returning JobResponseDTO
 *  - getStudentPortalJobs() → filtered job list for student portal
 *  - getStudentJobStatus() → per-student eligibility + application status
 */
public interface JobSearchService {

    // ── ADMIN / STAFF ──────────────────────────────────────────────────────────

    /**
     * Paginated job listing with full filter support.
     * Used by GET /jobs (the enterprise paginated endpoint).
     *
     * @param collegeId          Required — scopes results to one college
     * @param query              Optional free-text search (title, company)
     * @param jobType            Optional enum filter
     * @param workMode           Optional enum filter
     * @param status             Optional enum filter
     * @param postedById         Optional — "My Jobs" filter (pass null for all)
     * @param includeArchived    true → include soft-deleted jobs (CPH/ADMIN only)
     * @param pageable           Spring Pageable (page, size, sort)
     * @param currentUserId      From JWT — used for canEdit flag
     * @param currentUserRole    From JWT — used for canEdit flag
     * @return Page of JobResponseDTO with pagination metadata
     */
    Page<JobResponseDTO> getAdminJobsPaged(
            String collegeId,
            String query,
            Job.JobType jobType,
            Job.WorkMode workMode,
            Job.JobStatus status,
            String postedById,
            boolean includeArchived,
            Pageable pageable,
            String currentUserId,
            String currentUserRole
    );

    /**
     * Legacy non-paginated admin job list.
     * Kept for backward compatibility — prefer getAdminJobsPaged() for new code.
     */
    List<JobResponseDTO> getAdminJobs(
            String collegeId,
            String query,
            Job.JobType jobType,
            Job.WorkMode workMode,
            Job.JobStatus status,
            String postedById
    );

    // ── JOB DETAIL ─────────────────────────────────────────────────────────────

    /**
     * Fetch full job detail for any authenticated user.
     * Returns JobResponseDTO (includes rounds, eligibility, soft-delete metadata).
     *
     * NOTE: Previously returned JobDetailDTO — changed to JobResponseDTO so the
     * controller return type is consistent across all endpoints.
     */
    JobResponseDTO getJobDetail(String jobId);

    // ── STUDENT PORTAL ─────────────────────────────────────────────────────────

    /**
     * Returns filtered + eligibility-annotated job list for the student portal.
     * Student identity is resolved from the Security Context inside the impl.
     */
    List<StudentJobViewDTO> getStudentPortalJobs(
            String filterType,
            String searchQuery,
            List<String> jobTypeFilters,
            List<String> workModeFilters,
            List<String> statusFilters
    );

    /**
     * Calculates per-student eligibility and application status for a single job.
     * Called internally by getStudentPortalJobs() and by ApplicantService.
     */
    StudentJobViewDTO getStudentJobStatus(String jobId, String studentId);
}