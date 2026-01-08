package com.srots.service;

import java.math.BigDecimal;
import java.util.List;

import com.srots.dto.jobdto.JobDetailDTO;
import com.srots.dto.jobdto.JobHiringStatsDTO;
import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.dto.jobdto.StudentJobViewDTO;
import com.srots.model.EducationRecord;
import com.srots.model.Job;

public interface JobSearchService {
	
	// Admin/Staff view of jobs with broad filters
    List<JobResponseDTO> getAdminJobs(String collegeId, String query, Job.JobType jobType, Job.WorkMode workMode, Job.JobStatus status);
    
    // Student portal view (Only shows active/relevant jobs)
//    List<StudentJobViewDTO> getStudentPortalJobs(String filterType, List<String> jobTypeFilters);
//    public List<StudentJobViewDTO> getStudentPortalJobs(String filterType, List<String> jobTypeFilters, List<String> workModeFilters, List<String> statusFilters);
    public List<StudentJobViewDTO> getStudentPortalJobs(String filterType, String searchQuery, List<String> jobTypeFilters, List<String> workModeFilters, List<String> statusFilters);
    
    // Full job description and requirement details
    JobDetailDTO getJobDetail(String jobId);

    // The core engine for checking if a specific student qualifies
    StudentJobViewDTO getStudentJobStatus(String jobId, String studentId);
    
    
    public BigDecimal getNormalizedScore(List<EducationRecord> records, String level);
    
    

}
