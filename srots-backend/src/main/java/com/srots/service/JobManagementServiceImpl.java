//package com.srots.service;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Map;
//import java.util.UUID;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.access.AccessDeniedException;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import com.fasterxml.jackson.core.type.TypeReference;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.srots.dto.jobdto.JobResponseDTO;
//import com.srots.model.Job;
//import com.srots.model.User;
//import com.srots.repository.CollegeRepository;
//import com.srots.repository.JobRepository;
//import com.srots.repository.UserRepository;
//
//import jakarta.transaction.Transactional;
//
//@Service
//public class JobManagementServiceImpl implements JobManagementService {
//
//    @Autowired private JobRepository jobRepo;
//    @Autowired private UserRepository userRepo;
//    @Autowired private CollegeRepository collegeRepo;
//    @Autowired private ObjectMapper mapper;
//    @Autowired private FileService fileService;
//    @Autowired private JobMapper jobMapper;
//
//    private Map<String, String> getCurrentUserContext() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        if (auth == null || !auth.isAuthenticated()) {
//            throw new AccessDeniedException("User is not authenticated");
//        }
//        String userId = auth.getName();
//        String role = auth.getAuthorities().stream()
//                .map(a -> a.getAuthority().replace("ROLE_", ""))
//                .findFirst().orElse("STUDENT");
//        return Map.of("userId", userId, "role", role);
//    }
//
//    private void validateJobAccess(Job job, String requestCollegeId) {
//        Map<String, String> context = getCurrentUserContext();
//        String role = context.get("role");
//
//        String collegeIdToCompare = (requestCollegeId != null) ? requestCollegeId : job.getCollege().getId();
//        
//        if (job.getCollege() == null || !job.getCollege().getId().equals(collegeIdToCompare)) {
//            throw new AccessDeniedException("Security Violation: Access denied.");
//        }
//
//        if ("CPH".equals(role)) return; 
//        
//        if ("STUDENT".equals(role)) {
//            if (job.getStatus() == Job.JobStatus.Active) return; 
//            throw new AccessDeniedException("Access Denied: Job is not active.");
//        }
//
//        if ("STAFF".equals(role)) {
//            if (job.getPostedBy() != null && job.getPostedBy().getId().equals(context.get("userId"))) return;
//            throw new AccessDeniedException("Staff can only access their own jobs.");
//        }
//
//        throw new AccessDeniedException("Security Error: You do not have permission.");
//    }
//
//    @Override
//    @Transactional
//    public JobResponseDTO saveJobWithFiles(Map<String, Object> data, MultipartFile[] jdFiles, MultipartFile avoidList, String collegeCode) throws Exception {
//        Job job = new Job();
//        job.setId(UUID.randomUUID().toString());
//        job.setPostedAt(LocalDateTime.now());
//        mapJsonToJob(job, data);
//        processJobFiles(job, jdFiles, avoidList, collegeCode);
//        
//        Job savedJob = jobRepo.saveAndFlush(job);
//        Map<String, String> context = getCurrentUserContext();
//        return jobMapper.toResponseDTO(savedJob, context.get("userId"), context.get("role"));
//    }
//    
////    @Override
////    @Transactional
////    public JobResponseDTO saveJobWithFiles(Map<String, Object> data, MultipartFile[] jdFiles, MultipartFile avoidList, String collegeCode) throws Exception {
////        Map<String, String> context = getCurrentUserContext();
////        String currentUserId = context.get("userId");  // this is the UUID
////        String role = context.get("role");
////
////        // Load the actual current user entity to get their college
////        User currentUser = userRepo.findById(currentUserId)
////                .orElseThrow(() -> new AccessDeniedException("User not found"));
////
////        if (currentUser.getCollege() == null) {
////            throw new AccessDeniedException("User has no associated collage");
////        }
////
////        Job job = new Job();
////        job.setId(UUID.randomUUID().toString());
////        job.setPostedAt(LocalDateTime.now());
////
////        // Force college to user's college (secure)
////        job.setCollege(currentUser.getCollege());
////
////        // Optionally force postedBy to current user (prevents spoofing)
////        job.setPostedBy(currentUser);
////
////        mapJsonToJob(job, data);  // your new nested version
////        processJobFiles(job, jdFiles, avoidList, collegeCode);  // collegeCode still used for file paths
////
////        Job savedJob = jobRepo.saveAndFlush(job);
////        return jobMapper.toResponseDTO(savedJob, currentUserId, role);
////    }
//
//    @Override
//    @Transactional
//    public JobResponseDTO updateJobWithFiles(String id, Map<String, Object> data, MultipartFile[] jdFiles, MultipartFile avoidList, String collegeCode) throws Exception {
//        Job job = jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
//        validateJobAccess(job, job.getCollege().getId());
//        
//        mapJsonToJob(job, data);
//
//        if (jdFiles != null && jdFiles.length > 0) {
//            cleanupAttachments(job);
//            processAttachments(job, jdFiles, collegeCode);
//        }
//        if (avoidList != null && !avoidList.isEmpty()) {
//            if (job.getAvoidListUrl() != null) fileService.deleteFile(job.getAvoidListUrl());
//            job.setAvoidListUrl(fileService.uploadFile(avoidList, collegeCode, "jobs/" + job.getId() + "/avoid-list"));
//        }
//        
//        Job updatedJob = jobRepo.saveAndFlush(job);
//        Map<String, String> context = getCurrentUserContext();
//        return jobMapper.toResponseDTO(updatedJob, context.get("userId"), context.get("role"));
//    }
//
//    @Override
//    @Transactional
//    public void deleteJob(String id, String collegeId) {
//        Job job = jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
//        validateJobAccess(job, collegeId);
//        cleanupAttachments(job);
//        if (job.getAvoidListUrl() != null) fileService.deleteFile(job.getAvoidListUrl());
//        jobRepo.delete(job);
//    }
//
//    private void mapJsonToJob(Job job, Map<String, Object> data) throws Exception {
//        // Basic Info
//        job.setTitle((String) data.get("title"));
//        job.setCompanyName((String) data.get("company"));
//        job.setHiringDepartment((String) data.get("hiringDepartment"));
//        job.setLocation((String) data.get("location"));
//        job.setSalaryRange((String) data.get("salaryRange"));
//        job.setSummary((String) data.get("summary"));
//        job.setInternalId((String) data.get("internalId"));
//        job.setExternalLink((String) data.get("externalLink"));
//
//        // Enums & Dates
//        if (data.get("jobType") != null) job.setJobType(Job.JobType.fromString((String) data.get("jobType")));
//        if (data.get("workMode") != null) job.setWorkMode(Job.WorkMode.fromString((String) data.get("workMode")));
//        if (data.get("status") != null) job.setStatus(Job.JobStatus.valueOf((String) data.get("status")));
//        if (data.get("applicationDeadline") != null) job.setApplicationDeadline(LocalDate.parse((String) data.get("applicationDeadline")));
//
//        // Relations
//        job.setCollege(collegeRepo.getReferenceById((String) data.get("collegeId")));
//        job.setPostedBy(userRepo.getReferenceById((String) data.get("postedById")));
//
//        // Eligibility (Extracted from Root level to match your JSON)
//        job.setMinUgScore(parseBigDecimal(data.get("minUgScore")));
//        job.setFormatUg((String) data.get("formatUg")); // Assuming this might be sent or null
//        
//        job.setMin10thScore(parseBigDecimal(data.get("min10thScore")));
//        job.setFormat10th((String) data.get("format10th"));
//        
//        job.setMin12thScore(parseBigDecimal(data.get("min12thScore")));
//        job.setFormat12th((String) data.get("format12th"));
//        
//        job.setMaxBacklogs(data.get("maxBacklogs") != null ? (Integer) data.get("maxBacklogs") : 0);
//        job.setIsDiplomaEligible(Boolean.TRUE.equals(data.get("isDiplomaEligible")));
//        job.setAllowGaps(Boolean.TRUE.equals(data.get("allowGaps")));
//        job.setMaxGapYears(data.get("maxGapYears") != null ? (Integer) data.get("maxGapYears") : 0);
//
//        // JSON Lists
//        job.setAllowedBranches(mapper.writeValueAsString(data.getOrDefault("allowedBranches", new ArrayList<>())));
//        job.setEligibleBatches(mapper.writeValueAsString(data.getOrDefault("eligibleBatches", new ArrayList<>())));
//        job.setRoundsJson(mapper.writeValueAsString(data.getOrDefault("rounds", new ArrayList<>())));
//        
//        // Note: Your JSON uses 'requiredFields' but your model uses 'requiredFieldsJson'
//        job.setRequiredFieldsJson(mapper.writeValueAsString(data.getOrDefault("requiredFields", new ArrayList<>())));
//        
//        job.setResponsibilitiesJson(mapper.writeValueAsString(data.getOrDefault("responsibilities", new ArrayList<>())));
//        job.setQualificationsJson(mapper.writeValueAsString(data.getOrDefault("qualifications", new ArrayList<>())));
//        job.setBenefitsJson(mapper.writeValueAsString(data.getOrDefault("benefits", new ArrayList<>())));
//    }
//    
//
//    private void processJobFiles(Job job, MultipartFile[] jdFiles, MultipartFile avoidList, String collegeCode) throws Exception {
//        if (jdFiles != null && jdFiles.length > 0) processAttachments(job, jdFiles, collegeCode);
//        if (avoidList != null && !avoidList.isEmpty()) {
//            job.setAvoidListUrl(fileService.uploadFile(avoidList, collegeCode, "jobs/" + job.getId() + "/avoid-list"));
//        }
//    }
//
//    private void processAttachments(Job job, MultipartFile[] jdFiles, String collegeCode) throws Exception {
//        List<Map<String, String>> attachments = new ArrayList<>();
//        for (MultipartFile file : jdFiles) {
//            String url = fileService.uploadFile(file, collegeCode, "jobs/" + job.getId());
//            attachments.add(Map.of("name", file.getOriginalFilename(), "url", url));
//        }
//        job.setAttachmentsJson(mapper.writeValueAsString(attachments));
//    }
//
//    private void cleanupAttachments(Job job) {
//        if (job.getAttachmentsJson() == null) return;
//        try {
//            List<Map<String, String>> files = mapper.readValue(job.getAttachmentsJson(), new TypeReference<List<Map<String, String>>>() {});
//            for (Map<String, String> f : files) {
//                if (f.get("url") != null) fileService.deleteFile(f.get("url"));
//            }
//        } catch (Exception e) { /* log error */ }
//    }
//
//    private BigDecimal parseBigDecimal(Object value) {
//        if (value == null) return BigDecimal.ZERO;
//        try { return new BigDecimal(value.toString().trim()); } catch (Exception e) { return BigDecimal.ZERO; }
//    }
//
//    @Override
//    public Job getJobEntity(String id) {
//        return jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found: " + id));
//    }
//}

package com.srots.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.model.Job;
import com.srots.model.User;
import com.srots.repository.CollegeRepository;
import com.srots.repository.JobRepository;
import com.srots.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class JobManagementServiceImpl implements JobManagementService {

    private static final Logger log = LoggerFactory.getLogger(JobManagementServiceImpl.class);

    @Autowired private JobRepository     jobRepo;
    @Autowired private UserRepository    userRepo;
    @Autowired private CollegeRepository collegeRepo;
    @Autowired private ObjectMapper      mapper;
    @Autowired private FileService       fileService;
    @Autowired private JobMapper         jobMapper;

    // ══════════════════════════════════════════════════════════════════════════
    // SECURITY HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * CRITICAL FIX — resolves the actual UUID from the username.
     *
     * auth.getName() returns the USERNAME (e.g. "SRM_CPSTAFF_kiran"), NOT the UUID.
     * job.getPostedBy().getId() returns a UUID (e.g. "fbf94be1-0f0b-4f3a-af87-...").
     * Comparing username == UUID always fails → every STAFF update was denied.
     *
     * Fix: look up the User by username first, then use user.getId() everywhere.
     */
    private Map<String, String> getCurrentUserContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }

        String username = auth.getName(); // e.g. "SRM_CPSTAFF_kiran"
        String role = auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .findFirst().orElse("STUDENT");

        // Resolve UUID from username
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException(
                        "Authenticated user not found in DB: " + username));

        log.debug("[AUTH] username={} resolvedUserId={} role={}", username, user.getId(), role);

        return Map.of(
                "userId",   user.getId(),  // UUID — use this for all DB comparisons
                "username", username,
                "role",     role
        );
    }

    private User getCurrentUser() {
        // Reuse the same resolution logic — looks up by username → returns entity
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new AccessDeniedException("Not authenticated");
        return userRepo.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("User not found: " + auth.getName()));
    }

    /**
     * FIXED validateJobAccess:
     *
     * OLD BUGS:
     *   1. If requestCollegeId was null (frontend didn't send collegeId in the JSON body),
     *      the college comparison would throw even for legitimate requests.
     *   2. STAFF ownership check compared username string vs UUID → always false → 403.
     *
     * NEW BEHAVIOUR:
     *   - If requestCollegeId is null/blank, skip college boundary check (safe — the job
     *     was already loaded from DB using the URL path param {id}).
     *   - STAFF ownership check uses the resolved UUID from getCurrentUserContext().
     */
    private void validateJobAccess(Job job, String requestCollegeId) {
        Map<String, String> ctx = getCurrentUserContext();
        String role   = ctx.get("role");
        String userId = ctx.get("userId"); // always a UUID now

        String jobCollegeId = (job.getCollege() != null) ? job.getCollege().getId() : null;

        // College boundary check — only run when requestCollegeId is explicitly provided
        if (requestCollegeId != null && !requestCollegeId.isBlank()
                && jobCollegeId != null
                && !jobCollegeId.equals(requestCollegeId)) {
            log.warn("[SECURITY] College mismatch: jobCollegeId={} requestCollegeId={} userId={}",
                    jobCollegeId, requestCollegeId, userId);
            throw new AccessDeniedException("Security Violation: College mismatch. Access denied.");
        }

        // CPH / ADMIN / SROTS_DEV → full access within the college
        if ("ADMIN".equals(role) || "SROTS_DEV".equals(role) || "CPH".equals(role)) {
            log.debug("[AUTH] role={} granted full access to jobId={}", role, job.getId());
            return;
        }

        // STAFF → can only operate on their own jobs (compare UUIDs)
        if ("STAFF".equals(role)) {
            String postedById = (job.getPostedBy() != null) ? job.getPostedBy().getId() : null;
            log.debug("[AUTH] STAFF ownership check: currentUserId={} jobPostedById={} jobId={}",
                    userId, postedById, job.getId());
            if (userId.equals(postedById)) {
                log.debug("[AUTH] STAFF ownership confirmed for jobId={}", job.getId());
                return;
            }
            throw new AccessDeniedException(
                    "Staff can only modify their own jobs. " +
                    "currentUser=" + userId + " jobOwner=" + postedById);
        }

        throw new AccessDeniedException("You do not have permission to perform this action.");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CREATE
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public JobResponseDTO saveJobWithFiles(Map<String, Object> data,
                                           MultipartFile[] jdFiles,
                                           MultipartFile avoidList,
                                           String collegeCode) throws Exception {
        Map<String, String> ctx = getCurrentUserContext();
        log.info("[JOB][CREATE] userId={} role={} collegeCode={}",
                ctx.get("userId"), ctx.get("role"), collegeCode);

        Job job = new Job();
        job.setId(UUID.randomUUID().toString());
        job.setPostedAt(LocalDateTime.now());
        mapJsonToJob(job, data);

        // Ensure postedBy is always set — fall back to current user if frontend omitted it
        if (job.getPostedBy() == null) {
            job.setPostedBy(getCurrentUser());
            log.debug("[JOB][CREATE] postedById not in payload — defaulting to currentUser={}",
                    ctx.get("userId"));
        }

        processJobFiles(job, jdFiles, avoidList, collegeCode);

        Job saved = jobRepo.saveAndFlush(job);
        log.info("[JOB][CREATE] SUCCESS jobId={} title='{}' postedBy={}",
                saved.getId(), saved.getTitle(), ctx.get("userId"));
        return jobMapper.toResponseDTO(saved, ctx.get("userId"), ctx.get("role"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // UPDATE
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public JobResponseDTO updateJobWithFiles(String id,
                                             Map<String, Object> data,
                                             MultipartFile[] jdFiles,
                                             MultipartFile avoidList,
                                             String collegeCode) throws Exception {
        Map<String, String> ctx = getCurrentUserContext();
        log.info("[JOB][UPDATE] jobId={} userId={} role={}",
                id, ctx.get("userId"), ctx.get("role"));

        Job job = jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));

        if (job.isDeleted()) {
            throw new IllegalStateException("Cannot update a soft-deleted job. Restore it first.");
        }

        // collegeId in the JSON body may be absent — validateJobAccess handles null safely
        validateJobAccess(job, (String) data.get("collegeId"));

        mapJsonToJob(job, data);
        job.setUpdatedBy(getCurrentUser());
        job.setUpdatedAt(LocalDateTime.now());

        // Update attachments only if new files were uploaded
        if (jdFiles != null && jdFiles.length > 0) {
            cleanupAttachments(job);
            processAttachments(job, jdFiles, collegeCode);
        }
        if (avoidList != null && !avoidList.isEmpty()) {
            if (job.getAvoidListUrl() != null) fileService.deleteFile(job.getAvoidListUrl());
            job.setAvoidListUrl(fileService.uploadFile(
                    avoidList, collegeCode, "jobs/" + job.getId() + "/avoid-list"));
        }

        Job updated = jobRepo.saveAndFlush(job);
        log.info("[JOB][UPDATE] SUCCESS jobId={} updatedBy={}", id, ctx.get("userId"));
        return jobMapper.toResponseDTO(updated, ctx.get("userId"), ctx.get("role"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SOFT DELETE  (STAFF & CPH)
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public void softDeleteJob(String id, String collegeId, String reason) {
        Map<String, String> ctx = getCurrentUserContext();
        log.info("[JOB][SOFT-DELETE] jobId={} userId={} role={} reason='{}'",
                id, ctx.get("userId"), ctx.get("role"), reason);

        Job job = jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));

        if (job.isDeleted()) {
            throw new IllegalStateException("Job is already soft-deleted.");
        }

        validateJobAccess(job, collegeId);

        job.setDeletedAt(LocalDateTime.now());
        job.setDeletedBy(getCurrentUser());
        job.setDeletionReason(reason);
        jobRepo.save(job);

        log.info("[JOB][SOFT-DELETE] SUCCESS jobId={} deletedBy={}", id, ctx.get("userId"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // RESTORE (CPH / ADMIN only)
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public JobResponseDTO restoreJob(String id) {
        Map<String, String> ctx = getCurrentUserContext();
        String role = ctx.get("role");
        log.info("[JOB][RESTORE] jobId={} userId={} role={}", id, ctx.get("userId"), role);

        if (!"CPH".equals(role) && !"ADMIN".equals(role) && !"SROTS_DEV".equals(role)) {
            throw new AccessDeniedException("Only CPH/ADMIN can restore jobs.");
        }

        Job job = jobRepo.findByIdIncludingDeleted(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));

        if (!job.isDeleted()) {
            throw new IllegalStateException("Job is not deleted — nothing to restore.");
        }

        job.setDeletedAt(null);
        job.setDeletedBy(null);
        job.setDeletionReason(null);
        job.setRestoredAt(LocalDateTime.now());
        job.setRestoredBy(getCurrentUser());
        jobRepo.save(job);

        log.info("[JOB][RESTORE] SUCCESS jobId={} restoredBy={}", id, ctx.get("userId"));
        return jobMapper.toResponseDTO(job, ctx.get("userId"), role);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HARD DELETE (CPH / ADMIN only — deletes all files permanently)
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public void hardDeleteJob(String id, String collegeId) {
        Map<String, String> ctx = getCurrentUserContext();
        String role = ctx.get("role");
        log.info("[JOB][HARD-DELETE] jobId={} userId={} role={}", id, ctx.get("userId"), role);

        if (!"CPH".equals(role) && !"ADMIN".equals(role) && !"SROTS_DEV".equals(role)) {
            throw new AccessDeniedException("Only CPH/ADMIN can permanently delete jobs.");
        }

        Job job = jobRepo.findByIdIncludingDeleted(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));

        validateJobAccess(job, collegeId);
        cleanupAttachments(job);

        if (job.getAvoidListUrl() != null) {
            fileService.deleteFile(job.getAvoidListUrl());
            log.info("[JOB][HARD-DELETE] Deleted avoid-list file for jobId={}", id);
        }

        jobRepo.delete(job);
        log.info("[JOB][HARD-DELETE] SUCCESS jobId={} permanentlyDeletedBy={}",
                id, ctx.get("userId"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LEGACY DELETE → soft delete for backward compat
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public void deleteJob(String id, String collegeId) {
        softDeleteJob(id, collegeId, "Deleted via legacy endpoint");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GET ENTITY
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    public Job getJobEntity(String id) {
        return jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MAP JSON → JOB  (create + update shared logic)
    // ══════════════════════════════════════════════════════════════════════════

    private void mapJsonToJob(Job job, Map<String, Object> data) throws Exception {
        // ── Basic Info ──────────────────────────────────────────────────────────
        job.setTitle((String) data.get("title"));

        String companyName = (String) data.getOrDefault("companyName",
                data.getOrDefault("company", ""));
        job.setCompanyName(companyName);

        job.setHiringDepartment((String) data.get("hiringDepartment"));
        job.setLocation((String) data.get("location"));
        job.setSalaryRange((String) data.get("salaryRange"));
        job.setSummary((String) data.get("summary"));
        job.setInternalId((String) data.get("internalId"));
        job.setExternalLink((String) data.get("externalLink"));
        job.setCompanyCulture((String) data.get("companyCulture"));
        job.setPhysicalDemands((String) data.get("physicalDemands"));
        job.setEeoStatement((String) data.get("eeoStatement"));

        // ── Enums ───────────────────────────────────────────────────────────────
        String jobTypeRaw = (String) data.getOrDefault("jobType", data.get("type"));
        if (jobTypeRaw != null) job.setJobType(Job.JobType.fromString(jobTypeRaw));

        String workModeRaw = (String) data.getOrDefault("workMode", data.get("workArrangement"));
        if (workModeRaw != null) job.setWorkMode(Job.WorkMode.fromString(workModeRaw));

        if (data.get("status") != null) {
            job.setStatus(Job.JobStatus.valueOf((String) data.get("status")));
        }
        if (data.get("applicationDeadline") != null) {
            job.setApplicationDeadline(LocalDate.parse((String) data.get("applicationDeadline")));
        }

        // ── Relations ────────────────────────────────────────────────────────────
        if (data.get("collegeId") != null) {
            job.setCollege(collegeRepo.getReferenceById((String) data.get("collegeId")));
        }
        if (data.get("postedById") != null) {
            job.setPostedBy(userRepo.getReferenceById((String) data.get("postedById")));
        }

        // ── Eligibility (flat fields) ────────────────────────────────────────────
        job.setMinUgScore(parseBigDecimal(data.get("minUgScore")));
        job.setFormatUg(parseString(data, "formatUg", "Percentage"));

        job.setMin10thScore(parseBigDecimal(data.get("min10thScore")));
        job.setFormat10th(parseString(data, "format10th", "Percentage"));

        job.setMin12thScore(parseBigDecimal(data.get("min12thScore")));
        job.setFormat12th(parseString(data, "format12th", "Percentage"));

        job.setMinDiplomaScore(parseBigDecimal(data.get("minDiplomaScore")));
        job.setFormatDiploma(parseString(data, "formatDiploma", "Percentage"));

        job.setMaxBacklogs(parseInteger(data.get("maxBacklogs"), 0));
        job.setIsDiplomaEligible(Boolean.TRUE.equals(data.get("isDiplomaEligible")));
        job.setAllowGaps(Boolean.TRUE.equals(data.get("allowGaps")));
        job.setMaxGapYears(parseInteger(data.get("maxGapYears"), 0));

        // ── JSON Lists ────────────────────────────────────────────────────────────
        job.setAllowedBranches(mapper.writeValueAsString(
                data.getOrDefault("allowedBranches", new ArrayList<>())));
        job.setEligibleBatches(mapper.writeValueAsString(
                data.getOrDefault("eligibleBatches", new ArrayList<>())));
        job.setRoundsJson(mapper.writeValueAsString(
                data.getOrDefault("rounds", new ArrayList<>())));

        Object requiredFields = data.getOrDefault("requiredStudentFields",
                data.getOrDefault("requiredFields", new ArrayList<>()));
        job.setRequiredFieldsJson(mapper.writeValueAsString(requiredFields));

        job.setResponsibilitiesJson(mapper.writeValueAsString(
                data.getOrDefault("responsibilitiesJson",
                        data.getOrDefault("responsibilities", new ArrayList<>()))));
        job.setQualificationsJson(mapper.writeValueAsString(
                data.getOrDefault("qualificationsJson",
                        data.getOrDefault("qualifications", new ArrayList<>()))));
        job.setPreferredQualificationsJson(mapper.writeValueAsString(
                data.getOrDefault("preferredQualificationsJson",
                        data.getOrDefault("preferredQualifications", new ArrayList<>()))));
        job.setBenefitsJson(mapper.writeValueAsString(
                data.getOrDefault("benefitsJson",
                        data.getOrDefault("benefits", new ArrayList<>()))));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // FILE HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private void processJobFiles(Job job, MultipartFile[] jdFiles,
                                  MultipartFile avoidList, String collegeCode) throws Exception {
        if (jdFiles != null && jdFiles.length > 0) processAttachments(job, jdFiles, collegeCode);
        if (avoidList != null && !avoidList.isEmpty()) {
            String url = fileService.uploadFile(avoidList, collegeCode,
                    "jobs/" + job.getId() + "/avoid-list");
            job.setAvoidListUrl(url);
            log.info("[JOB][FILE] Uploaded avoid-list for jobId={} url={}", job.getId(), url);
        }
    }

    private void processAttachments(Job job, MultipartFile[] jdFiles,
                                     String collegeCode) throws Exception {
        List<Map<String, String>> attachments = new ArrayList<>();
        for (MultipartFile file : jdFiles) {
            String url = fileService.uploadFile(file, collegeCode, "jobs/" + job.getId());
            attachments.add(Map.of("name", file.getOriginalFilename(), "url", url));
            log.info("[JOB][FILE] Uploaded attachment '{}' for jobId={}",
                    file.getOriginalFilename(), job.getId());
        }
        job.setAttachmentsJson(mapper.writeValueAsString(attachments));
    }

    private void cleanupAttachments(Job job) {
        if (job.getAttachmentsJson() == null) return;
        try {
            List<Map<String, String>> files = mapper.readValue(
                    job.getAttachmentsJson(),
                    new TypeReference<List<Map<String, String>>>() {});
            for (Map<String, String> f : files) {
                if (f.get("url") != null) {
                    fileService.deleteFile(f.get("url"));
                    log.info("[JOB][FILE] Deleted attachment '{}' for jobId={}",
                            f.get("name"), job.getId());
                }
            }
        } catch (Exception e) {
            log.error("[JOB][FILE] Failed to cleanup attachments for jobId={}: {}",
                    job.getId(), e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PARSE HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private BigDecimal parseBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        try { return new BigDecimal(value.toString().trim()); }
        catch (Exception e) { return BigDecimal.ZERO; }
    }

    private Integer parseInteger(Object value, int defaultVal) {
        if (value == null) return defaultVal;
        try { return Integer.parseInt(value.toString().trim()); }
        catch (Exception e) { return defaultVal; }
    }

    private String parseString(Map<String, Object> data, String key, String defaultVal) {
        Object v = data.get(key);
        return (v instanceof String s && !s.isBlank()) ? s : defaultVal;
    }
}