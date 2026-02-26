package com.srots.service;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.model.Job;

public interface JobManagementService {

//	// Creating a new job
//    JobResponseDTO saveJobWithFiles(Map<String, Object> data, MultipartFile[] jdFiles, 
//                                    MultipartFile avoidList, String collegeCode) throws Exception;
//    
//    // Updating existing job details
//    JobResponseDTO updateJobWithFiles(String id, Map<String, Object> data, MultipartFile[] jdFiles, 
//                                      MultipartFile avoidList, String collegeCode) throws Exception;
//    
//    // Deleting a job
//    void deleteJob(String id, String collegeId);
//
//    // Internal helper used by other services to get the raw entity
//    Job getJobEntity(String id);

	JobResponseDTO saveJobWithFiles(Map<String, Object> data, MultipartFile[] jdFiles, MultipartFile avoidList,
			String collegeCode) throws Exception;

	JobResponseDTO updateJobWithFiles(String id, Map<String, Object> data, MultipartFile[] jdFiles,
			MultipartFile avoidList, String collegeCode) throws Exception;

	/** Soft-delete — marks deletedAt/deletedBy. Files are KEPT. */
	void softDeleteJob(String id, String collegeId, String reason);

	/**
	 * Hard-delete — permanent removal including all files from storage. CPH/ADMIN
	 * only.
	 */
	void hardDeleteJob(String id, String collegeId);

	/** Restore a soft-deleted job. CPH/ADMIN only. */
	JobResponseDTO restoreJob(String id);

	/** Legacy — routes to softDeleteJob. */
	void deleteJob(String id, String collegeId);

	Job getJobEntity(String id);

}
