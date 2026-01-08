package com.srots.service;

import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.model.Job;
import com.srots.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class JobManagementServiceImpl implements JobManagementService {

    @Autowired private JobRepository jobRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private CollegeRepository collegeRepo;
    @Autowired private ObjectMapper mapper;
    @Autowired private FileService fileService;
    @Autowired private JobMapper jobMapper;

    private Map<String, String> getCurrentUserContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }
        String userId = auth.getName();
        String role = auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .findFirst().orElse("STUDENT");
        return Map.of("userId", userId, "role", role);
    }

    private void validateJobAccess(Job job, String requestCollegeId) {
        Map<String, String> context = getCurrentUserContext();
        String role = context.get("role");

        String collegeIdToCompare = (requestCollegeId != null) ? requestCollegeId : job.getCollege().getId();
        
        if (job.getCollege() == null || !job.getCollege().getId().equals(collegeIdToCompare)) {
            throw new AccessDeniedException("Security Violation: Access denied.");
        }

        if ("CPH".equals(role)) return; 
        
        if ("STUDENT".equals(role)) {
            if (job.getStatus() == Job.JobStatus.Active) return; 
            throw new AccessDeniedException("Access Denied: Job is not active.");
        }

        if ("STAFF".equals(role)) {
            if (job.getPostedBy() != null && job.getPostedBy().getId().equals(context.get("userId"))) return;
            throw new AccessDeniedException("Staff can only access their own jobs.");
        }

        throw new AccessDeniedException("Security Error: You do not have permission.");
    }

    @Override
    @Transactional
    public JobResponseDTO saveJobWithFiles(Map<String, Object> data, MultipartFile[] jdFiles, MultipartFile avoidList, String collegeCode) throws Exception {
        Job job = new Job();
        job.setId(UUID.randomUUID().toString());
        job.setPostedAt(LocalDateTime.now());
        mapJsonToJob(job, data);
        processJobFiles(job, jdFiles, avoidList, collegeCode);
        
        Job savedJob = jobRepo.saveAndFlush(job);
        Map<String, String> context = getCurrentUserContext();
        return jobMapper.toResponseDTO(savedJob, context.get("userId"), context.get("role"));
    }

    @Override
    @Transactional
    public JobResponseDTO updateJobWithFiles(String id, Map<String, Object> data, MultipartFile[] jdFiles, MultipartFile avoidList, String collegeCode) throws Exception {
        Job job = jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        validateJobAccess(job, job.getCollege().getId());
        
        mapJsonToJob(job, data);

        if (jdFiles != null && jdFiles.length > 0) {
            cleanupAttachments(job);
            processAttachments(job, jdFiles, collegeCode);
        }
        if (avoidList != null && !avoidList.isEmpty()) {
            if (job.getAvoidListUrl() != null) fileService.deleteFile(job.getAvoidListUrl());
            job.setAvoidListUrl(fileService.uploadFile(avoidList, collegeCode, "jobs/" + job.getId() + "/avoid-list"));
        }
        
        Job updatedJob = jobRepo.saveAndFlush(job);
        Map<String, String> context = getCurrentUserContext();
        return jobMapper.toResponseDTO(updatedJob, context.get("userId"), context.get("role"));
    }

    @Override
    @Transactional
    public void deleteJob(String id, String collegeId) {
        Job job = jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        validateJobAccess(job, collegeId);
        cleanupAttachments(job);
        if (job.getAvoidListUrl() != null) fileService.deleteFile(job.getAvoidListUrl());
        jobRepo.delete(job);
    }

    private void mapJsonToJob(Job job, Map<String, Object> data) throws Exception {
        // Basic Info
        job.setTitle((String) data.get("title"));
        job.setCompanyName((String) data.get("company"));
        job.setHiringDepartment((String) data.get("hiringDepartment"));
        job.setLocation((String) data.get("location"));
        job.setSalaryRange((String) data.get("salaryRange"));
        job.setSummary((String) data.get("summary"));
        job.setInternalId((String) data.get("internalId"));
        job.setExternalLink((String) data.get("externalLink"));

        // Enums & Dates
        if (data.get("jobType") != null) job.setJobType(Job.JobType.fromString((String) data.get("jobType")));
        if (data.get("workMode") != null) job.setWorkMode(Job.WorkMode.fromString((String) data.get("workMode")));
        if (data.get("status") != null) job.setStatus(Job.JobStatus.valueOf((String) data.get("status")));
        if (data.get("applicationDeadline") != null) job.setApplicationDeadline(LocalDate.parse((String) data.get("applicationDeadline")));

        // Relations
        job.setCollege(collegeRepo.getReferenceById((String) data.get("collegeId")));
        job.setPostedBy(userRepo.getReferenceById((String) data.get("postedById")));

        // Eligibility (Extracted from Root level to match your JSON)
        job.setMinUgScore(parseBigDecimal(data.get("minUgScore")));
        job.setFormatUg((String) data.get("formatUg")); // Assuming this might be sent or null
        
        job.setMin10thScore(parseBigDecimal(data.get("min10thScore")));
        job.setFormat10th((String) data.get("format10th"));
        
        job.setMin12thScore(parseBigDecimal(data.get("min12thScore")));
        job.setFormat12th((String) data.get("format12th"));
        
        job.setMaxBacklogs(data.get("maxBacklogs") != null ? (Integer) data.get("maxBacklogs") : 0);
        job.setIsDiplomaEligible(Boolean.TRUE.equals(data.get("isDiplomaEligible")));
        job.setAllowGaps(Boolean.TRUE.equals(data.get("allowGaps")));
        job.setMaxGapYears(data.get("maxGapYears") != null ? (Integer) data.get("maxGapYears") : 0);

        // JSON Lists
        job.setAllowedBranches(mapper.writeValueAsString(data.getOrDefault("allowedBranches", new ArrayList<>())));
        job.setEligibleBatches(mapper.writeValueAsString(data.getOrDefault("eligibleBatches", new ArrayList<>())));
        job.setRoundsJson(mapper.writeValueAsString(data.getOrDefault("rounds", new ArrayList<>())));
        
        // Note: Your JSON uses 'requiredFields' but your model uses 'requiredFieldsJson'
        job.setRequiredFieldsJson(mapper.writeValueAsString(data.getOrDefault("requiredFields", new ArrayList<>())));
        
        job.setResponsibilitiesJson(mapper.writeValueAsString(data.getOrDefault("responsibilities", new ArrayList<>())));
        job.setQualificationsJson(mapper.writeValueAsString(data.getOrDefault("qualifications", new ArrayList<>())));
        job.setBenefitsJson(mapper.writeValueAsString(data.getOrDefault("benefits", new ArrayList<>())));
    }

    private void processJobFiles(Job job, MultipartFile[] jdFiles, MultipartFile avoidList, String collegeCode) throws Exception {
        if (jdFiles != null && jdFiles.length > 0) processAttachments(job, jdFiles, collegeCode);
        if (avoidList != null && !avoidList.isEmpty()) {
            job.setAvoidListUrl(fileService.uploadFile(avoidList, collegeCode, "jobs/" + job.getId() + "/avoid-list"));
        }
    }

    private void processAttachments(Job job, MultipartFile[] jdFiles, String collegeCode) throws Exception {
        List<Map<String, String>> attachments = new ArrayList<>();
        for (MultipartFile file : jdFiles) {
            String url = fileService.uploadFile(file, collegeCode, "jobs/" + job.getId());
            attachments.add(Map.of("name", file.getOriginalFilename(), "url", url));
        }
        job.setAttachmentsJson(mapper.writeValueAsString(attachments));
    }

    private void cleanupAttachments(Job job) {
        if (job.getAttachmentsJson() == null) return;
        try {
            List<Map<String, String>> files = mapper.readValue(job.getAttachmentsJson(), new TypeReference<List<Map<String, String>>>() {});
            for (Map<String, String> f : files) {
                if (f.get("url") != null) fileService.deleteFile(f.get("url"));
            }
        } catch (Exception e) { /* log error */ }
    }

    private BigDecimal parseBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        try { return new BigDecimal(value.toString().trim()); } catch (Exception e) { return BigDecimal.ZERO; }
    }

    @Override
    public Job getJobEntity(String id) {
        return jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found: " + id));
    }
}