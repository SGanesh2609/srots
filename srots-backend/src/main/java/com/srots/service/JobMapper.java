package com.srots.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.jobdto.JobResponseDTO;
import com.srots.model.Job;
import com.srots.repository.ApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * JobMapper — maps Job entity → JobResponseDTO.
 *
 * Key contracts:
 *  - eligibleBatches is List<Integer> (not strings)
 *  - allowedBranches is List<String> of branch codes
 *  - jobType / workMode use display values ("Full-Time", "On-Site")
 *  - Soft-delete metadata included (deletedAt, deletedBy, isDeleted)
 */
@Component
public class JobMapper {

    private static final Logger log = LoggerFactory.getLogger(JobMapper.class);
    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Autowired private ObjectMapper mapper;
    @Autowired private ApplicationRepository appRepo;

    public JobResponseDTO toResponseDTO(Job job, String currentUserId, String currentUserRole) {
        JobResponseDTO dto = new JobResponseDTO();

        // ── Core ──────────────────────────────────────────────────────────────
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setCompanyName(job.getCompanyName());
        dto.setHiringDepartment(job.getHiringDepartment());
        dto.setLocation(job.getLocation());
        dto.setSalaryRange(job.getSalaryRange());
        dto.setSummary(job.getSummary());
        dto.setInternalId(job.getInternalId());
        dto.setExternalLink(job.getExternalLink());
        dto.setCompanyCulture(job.getCompanyCulture());
        dto.setPhysicalDemands(job.getPhysicalDemands());
        dto.setEeoStatement(job.getEeoStatement());
        dto.setAvoidListUrl(job.getAvoidListUrl());
        dto.setCompanyLogo(job.getCompanyLogo());
        dto.setServiceBond(job.getServiceBond());
        dto.setJoiningDate(job.getJoiningDate());
        dto.setVacancies(job.getVacancies());

        // ── Status ────────────────────────────────────────────────────────────
        dto.setStatus(job.getStatus() != null ? job.getStatus().name() : "Active");

        // ── Enums display values ──────────────────────────────────────────────
        dto.setJobType(job.getJobType()   != null ? job.getJobType().getDisplay()   : null);
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
        try {
            dto.setApplicantCount(appRepo.countByJobId(job.getId()));
        } catch (Exception e) {
            dto.setApplicantCount(0L);
        }

        // ── Can edit ──────────────────────────────────────────────────────────
        boolean isOwner = job.getPostedBy() != null
                && job.getPostedBy().getId().equals(currentUserId);
        dto.setCanEdit("CPH".equals(currentUserRole)
                || "ADMIN".equals(currentUserRole)
                || "SROTS_DEV".equals(currentUserRole)
                || isOwner);

        // ── Soft-delete metadata ──────────────────────────────────────────────
        dto.setDeleted(job.isDeleted());
        if (job.getDeletedAt() != null) {
            dto.setDeletedAt(job.getDeletedAt().format(DT_FMT));
        }
        if (job.getDeletedBy() != null) {
            dto.setDeletedBy(job.getDeletedBy().getFullName());
        }
        dto.setDeletionReason(job.getDeletionReason());

        // ── Eligibility ────────────────────────────────────────────────────────
        dto.setMinUgScore(job.getMinUgScore());
        dto.setFormatUg(job.getFormatUg());

        dto.setMin10thScore(job.getMin10thScore());
        dto.setFormat10th(job.getFormat10th());

        dto.setMin12thScore(job.getMin12thScore());
        dto.setFormat12th(job.getFormat12th());

        dto.setMinDiplomaScore(job.getMinDiplomaScore());
        dto.setFormatDiploma(job.getFormatDiploma());

        dto.setMaxBacklogs(job.getMaxBacklogs());
        dto.setIsDiplomaEligible(job.getIsDiplomaEligible());
        dto.setAllowGaps(job.getAllowGaps());
        dto.setMaxGapYears(job.getMaxGapYears());

        // ── JSON arrays → typed Java lists ────────────────────────────────────
        dto.setResponsibilitiesJson(parseList(job.getResponsibilitiesJson(), new TypeReference<List<String>>() {}));
        dto.setQualificationsJson(parseList(job.getQualificationsJson(), new TypeReference<List<String>>() {}));
        dto.setPreferredQualificationsJson(parseList(job.getPreferredQualificationsJson(), new TypeReference<List<String>>() {}));
        dto.setBenefitsJson(parseList(job.getBenefitsJson(), new TypeReference<List<String>>() {}));

        dto.setAllowedBranches(parseList(job.getAllowedBranches(), new TypeReference<List<String>>() {}));

        // eligibleBatches — stored as JSON array of ints
        dto.setEligibleBatches(parseList(job.getEligibleBatches(), new TypeReference<List<Integer>>() {}));

        dto.setRounds(parseList(job.getRoundsJson(), new TypeReference<List<Map<String, Object>>>() {}));
        dto.setRequiredStudentFields(parseList(job.getRequiredFieldsJson(), new TypeReference<List<String>>() {}));
        dto.setDocuments(parseList(job.getAttachmentsJson(), new TypeReference<List<Map<String, String>>>() {}));

        return dto;
    }

    @SuppressWarnings("unchecked")
    public <T> T parseList(String json, TypeReference<T> typeRef) {
        if (json == null || json.isBlank() || json.equals("null")) {
            return (T) new ArrayList<>();
        }
        try {
            return mapper.readValue(json, typeRef);
        } catch (Exception e) {
            log.warn("[JobMapper] Failed to parse JSON: {} → {}", json, e.getMessage());
            return (T) new ArrayList<>();
        }
    }
}