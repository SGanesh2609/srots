package com.srots.service;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.model.Job;

public interface JobManagementService {
	
	// Creating a new job
    JobResponseDTO saveJobWithFiles(Map<String, Object> data, MultipartFile[] jdFiles, 
                                    MultipartFile avoidList, String collegeCode) throws Exception;
    
    // Updating existing job details
    JobResponseDTO updateJobWithFiles(String id, Map<String, Object> data, MultipartFile[] jdFiles, 
                                      MultipartFile avoidList, String collegeCode) throws Exception;
    
    // Deleting a job
    void deleteJob(String id, String collegeId);

    // Internal helper used by other services to get the raw entity
    Job getJobEntity(String id);

}
