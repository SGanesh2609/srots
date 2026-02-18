package com.srots.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.jobdto.ApplicationListDTO;
import com.srots.dto.jobdto.JobApplicantsDashboardDTO;
import com.srots.dto.jobdto.JobDetailDTO;
import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.dto.jobdto.StudentJobViewDTO;
import com.srots.dto.jobdto.TimelineDTO;
import com.srots.model.Job;
import com.srots.model.User;

public interface JobService {
    // Admin/Staff Operations
	public List<JobResponseDTO> getAdminJobs(String collegeId, String query, Job.JobType jobType, Job.WorkMode workMode, Job.JobStatus status);
	
//	List<JobResponseDTO> getAdminJobs(String collegeId, String query,
//	        Job.JobType jobType, Job.WorkMode workMode, Job.JobStatus status,
//	        String postedById);
	
	public Job getJobEntity(String id);
   
    public JobDetailDTO getJobDetail(String jobId);
    public JobResponseDTO saveJobWithFiles(Map<String, Object> data, MultipartFile[] jdFiles, MultipartFile avoidList,
			String collegeCode) throws Exception;
    public JobResponseDTO updateJobWithFiles(String id, Map<String, Object> data, MultipartFile[] jdFiles, MultipartFile avoidList,
			String collegeCode) throws Exception; // New
    
    public void deleteJob(String id, String collegeId);
    List<User> getApplicants(String jobId);
    List<User> getEligibleStudents(String jobId); // Logic using EducationRecord
    
    public byte[] exportApplicants(String jobId, String format) throws Exception;
    public byte[] exportAllEligibleStudents(String jobId, String format) throws Exception;
    
    public JobApplicantsDashboardDTO getJobApplicantsDashboard(String jobId) throws Exception;
    
    // Student Operations
    public List<StudentJobViewDTO> getStudentPortalJobs(String filterType, List<String> jobTypeFilters);
    StudentJobViewDTO getStudentJobStatus(String jobId, String studentId);
    void updateApplication(String jobId, String studentId, String status);
    
    
    
    public Map<String, Object> uploadRoundResults(String jobId, int roundIndex, MultipartFile file) throws Exception;
    public List<ApplicationListDTO> getStudentApplications(String studentId);
    public List<TimelineDTO> getHiringTimeline(String jobId, String studentId) throws Exception;
    
    
    

}