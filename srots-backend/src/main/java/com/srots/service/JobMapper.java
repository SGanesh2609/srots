//package com.srots.service;
//
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Map;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//import com.fasterxml.jackson.core.type.TypeReference;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.srots.dto.jobdto.JobResponseDTO;
//import com.srots.model.Job;
//import com.srots.repository.ApplicationRepository;
//import com.srots.repository.UserRepository;
//
//@Component
//public class JobMapper {
//
//    @Autowired
//    private ObjectMapper mapper;
//
//    @Autowired
//    private ApplicationRepository appRepo;
//    
//    @Autowired
//    private UserRepository userRepo;
//
//    public JobResponseDTO toResponseDTO(Job job, String currentUserId, String currentUserRole) {
//        JobResponseDTO dto = new JobResponseDTO();
//
//        dto.setId(job.getId());
//        dto.setTitle(job.getTitle());
//        dto.setCompany(job.getCompanyName());
//        dto.setHiringDepartment(job.getHiringDepartment());
//        dto.setLocation(job.getLocation());
//        dto.setSalaryRange(job.getSalaryRange());
//        dto.setSummary(job.getSummary());
//        dto.setInternalId(job.getInternalId());
//        dto.setExternalLink(job.getExternalLink());
//        dto.setStatus(job.getStatus() != null ? job.getStatus().name() : "Active");
//        dto.setAvoidListUrl(job.getAvoidListUrl());
//        dto.setJobType(job.getJobType() != null ? job.getJobType().getDisplay() : null);
//        dto.setWorkMode(job.getWorkMode() != null ? job.getWorkMode().getDisplay() : null);
//        dto.setApplicationDeadline(job.getApplicationDeadline());
//        
//        if (job.getCollege() != null) {
//            dto.setCollegeId(job.getCollege().getId());
//        }
//        
//        if (job.getPostedBy() != null) {
//            dto.setPostedById(job.getPostedBy().getId());
//        }
//        
//
//        if (job.getPostedAt() != null)
//            dto.setPostedAt(job.getPostedAt().toLocalDate());
//        
//        dto.setPostedBy(job.getPostedBy() != null ? job.getPostedBy().getFullName() : "Admin");
//        
//        // Count applications for this job
//        dto.setApplicantCount(appRepo.countByJobId(job.getId()));
//
//        // Ownership logic
//        boolean isOwner = job.getPostedBy() != null && job.getPostedBy().getId().equals(currentUserId);
//        dto.setCanEdit("CPH".equals(currentUserRole) || isOwner);
//
//        // Eligibility Fields
//        dto.setMinUgScore(job.getMinUgScore());
//        dto.setMin10thScore(job.getMin10thScore());
//        dto.setMin12thScore(job.getMin12thScore());
//        dto.setMaxBacklogs(job.getMaxBacklogs());
//        dto.setIsDiplomaEligible(job.getIsDiplomaEligible());
//        dto.setAllowGaps(job.getAllowGaps());
//        dto.setMaxGapYears(job.getMaxGapYears());
//
//        // Use the helper for all JSON list fields
//        dto.setResponsibilities(parseJsonList(job.getResponsibilitiesJson(), new TypeReference<List<String>>() {}));
//        dto.setQualifications(parseJsonList(job.getQualificationsJson(), new TypeReference<List<String>>() {}));
//        dto.setPreferredQualifications(parseJsonList(job.getPreferredQualificationsJson(), new TypeReference<List<String>>() {}));
//        dto.setBenefits(parseJsonList(job.getBenefitsJson(), new TypeReference<List<String>>() {}));
//        dto.setAllowedBranches(parseJsonList(job.getAllowedBranches(), new TypeReference<List<String>>() {}));
//        dto.setEligibleBatches(parseJsonList(job.getEligibleBatches(), new TypeReference<List<String>>() {}));
//        dto.setRequiredFields(parseJsonList(job.getRequiredFieldsJson(), new TypeReference<List<String>>() {}));
//        dto.setRounds(parseJsonList(job.getRoundsJson(), new TypeReference<List<Map<String, Object>>>() {}));
//        dto.setAttachments(parseJsonList(job.getAttachmentsJson(), new TypeReference<List<Map<String, String>>>() {}));
//
//        return dto;
//    }
//
//    /**
//     * Helper moved here so it can be used by any service via the Mapper
//     */
//    public <T> T parseJsonList(String json, TypeReference<T> typeRef) {
//        if (json == null || json.isEmpty()) {
//            return (T) new ArrayList<>();
//        }
//        try {
//            return mapper.readValue(json, typeRef);
//        } catch (Exception e) {
//            return (T) new ArrayList<>();
//        }
//    }
//}

package com.srots.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.model.Job;
import com.srots.repository.ApplicationRepository;
import com.srots.repository.UserRepository;

/**
 * FIXED: JobMapper
 *
 * Changes:
 *  - company          → companyName
 *  - responsibilities → responsibilitiesJson   (matches types.ts field name)
 *  - qualifications   → qualificationsJson
 *  - preferredQualifications → preferredQualificationsJson
 *  - benefits         → benefitsJson
 *  - requiredFields   → requiredStudentFields
 *  - attachments      → documents
 *  - Added: formatUg, format10th, format12th, minDiplomaScore, formatDiploma,
 *            physicalDemands, eeoStatement
 */
@Component
public class JobMapper {

    @Autowired private ObjectMapper mapper;
    @Autowired private ApplicationRepository appRepo;
    @Autowired private UserRepository userRepo;

    public JobResponseDTO toResponseDTO(Job job, String currentUserId, String currentUserRole) {
        JobResponseDTO dto = new JobResponseDTO();

        // ── Core ─────────────────────────────────────────────────────────────
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setCompanyName(job.getCompanyName());          // FIXED: was setCompany()
        dto.setHiringDepartment(job.getHiringDepartment());
        dto.setLocation(job.getLocation());
        dto.setSalaryRange(job.getSalaryRange());
        dto.setSummary(job.getSummary());
        dto.setInternalId(job.getInternalId());
        dto.setExternalLink(job.getExternalLink());
        dto.setCompanyCulture(job.getCompanyCulture());
        dto.setPhysicalDemands(job.getPhysicalDemands());  // FIXED: was missing
        dto.setEeoStatement(job.getEeoStatement());         // FIXED: was missing
        dto.setStatus(job.getStatus() != null ? job.getStatus().name() : "Active");
        dto.setAvoidListUrl(job.getAvoidListUrl());

        // ── Enums (display values) ────────────────────────────────────────────
        dto.setJobType(job.getJobType() != null ? job.getJobType().getDisplay() : null);
        dto.setWorkMode(job.getWorkMode() != null ? job.getWorkMode().getDisplay() : null);

        // ── Dates ─────────────────────────────────────────────────────────────
        dto.setApplicationDeadline(job.getApplicationDeadline());
        if (job.getPostedAt() != null) dto.setPostedAt(job.getPostedAt().toLocalDate());

        // ── Relations ─────────────────────────────────────────────────────────
        if (job.getCollege() != null) dto.setCollegeId(job.getCollege().getId());
        if (job.getPostedBy() != null) {
            dto.setPostedById(job.getPostedBy().getId());
            dto.setPostedBy(job.getPostedBy().getFullName());
        } else {
            dto.setPostedBy("Admin");
        }

        // ── Applicant count ───────────────────────────────────────────────────
        dto.setApplicantCount(appRepo.countByJobId(job.getId()));

        // ── Ownership ─────────────────────────────────────────────────────────
        boolean isOwner = job.getPostedBy() != null && job.getPostedBy().getId().equals(currentUserId);
        dto.setCanEdit("CPH".equals(currentUserRole) || "ADMIN".equals(currentUserRole)
                || "SROTS_DEV".equals(currentUserRole) || isOwner);

        // ── Eligibility (all fields including format strings) ─────────────────
        dto.setMinUgScore(job.getMinUgScore());
        dto.setFormatUg(job.getFormatUg());                // FIXED: was missing

        dto.setMin10thScore(job.getMin10thScore());
        dto.setFormat10th(job.getFormat10th());             // FIXED: was missing

        dto.setMin12thScore(job.getMin12thScore());
        dto.setFormat12th(job.getFormat12th());             // FIXED: was missing

        dto.setMinDiplomaScore(job.getMinDiplomaScore());   // FIXED: was missing
        dto.setFormatDiploma(job.getFormatDiploma());       // FIXED: was missing

        dto.setMaxBacklogs(job.getMaxBacklogs());
        dto.setIsDiplomaEligible(job.getIsDiplomaEligible());
        dto.setAllowGaps(job.getAllowGaps());
        dto.setMaxGapYears(job.getMaxGapYears());

        // ── JSON arrays  (parse JSON strings → typed Java lists) ──────────────
        // Field names now match types.ts exactly
        dto.setResponsibilitiesJson(parseJsonList(job.getResponsibilitiesJson(), new TypeReference<List<String>>() {}));
        dto.setQualificationsJson(parseJsonList(job.getQualificationsJson(), new TypeReference<List<String>>() {}));
        dto.setPreferredQualificationsJson(parseJsonList(job.getPreferredQualificationsJson(), new TypeReference<List<String>>() {}));
        dto.setBenefitsJson(parseJsonList(job.getBenefitsJson(), new TypeReference<List<String>>() {}));

        dto.setAllowedBranches(parseJsonList(job.getAllowedBranches(), new TypeReference<List<String>>() {}));
        dto.setEligibleBatches(parseJsonList(job.getEligibleBatches(), new TypeReference<List<String>>() {}));
        dto.setRounds(parseJsonList(job.getRoundsJson(), new TypeReference<List<Map<String, Object>>>() {}));
        dto.setRequiredStudentFields(parseJsonList(job.getRequiredFieldsJson(), new TypeReference<List<String>>() {})); // FIXED name
        dto.setDocuments(parseJsonList(job.getAttachmentsJson(), new TypeReference<List<Map<String, String>>>() {}));   // FIXED name

        return dto;
    }

    public <T> T parseJsonList(String json, TypeReference<T> typeRef) {
        if (json == null || json.isBlank()) {
            return (T) new ArrayList<>();
        }
        try {
            return mapper.readValue(json, typeRef);
        } catch (Exception e) {
            return (T) new ArrayList<>();
        }
    }
}