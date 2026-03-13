package com.srots.dto.jobdto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * JobResponseDTO — all field names match types.ts Job interface exactly.
 * Includes soft-delete metadata for CPH to see deleted jobs.
 */
@Data
public class JobResponseDTO {

    // ── Core identity ──────────────────────────────────────────────────────────
    private String id;
    private String collegeId;

    // ── Basic info ─────────────────────────────────────────────────────────────
    private String title;
    private String companyName;
    private String hiringDepartment;
    private String jobType;           // display: "Full-Time", "Internship" ...
    private String workMode;          // display: "On-Site", "Remote" ...
    private String location;
    private String salaryRange;
    private String summary;
    private String internalId;
    private String externalLink;
    private String companyCulture;
    private String physicalDemands;
    private String eeoStatement;
    private String status;            // "Active" | "Closed" | "Draft"

    // ── Dates ──────────────────────────────────────────────────────────────────
    private LocalDate applicationDeadline;
    private LocalDate postedAt;

    // ── Ownership / audit ──────────────────────────────────────────────────────
    private String postedBy;          // full name string
    private String postedById;
    private boolean canEdit;
    private String avoidListUrl;

    // ── Soft-delete metadata (visible to CPH/ADMIN only) ──────────────────────
    private boolean isDeleted;
    private String deletedAt;
    private String deletedBy;         // full name of who deleted
    private String deletionReason;

    // ── Applicant info ────────────────────────────────────────────────────────
    private Long applicantCount;

    // ── Eligibility ────────────────────────────────────────────────────────────
    private BigDecimal minUgScore;
    private String    formatUg;

    private BigDecimal min10thScore;
    private String    format10th;

    private BigDecimal min12thScore;
    private String    format12th;

    private BigDecimal minDiplomaScore;
    private String    formatDiploma;

    private Integer   maxBacklogs;
    private Boolean   isDiplomaEligible;
    private Boolean   allowGaps;
    private Integer   maxGapYears;

    // ── JSON-parsed arrays ─────────────────────────────────────────────────────
    private List<String> responsibilitiesJson;
    private List<String> qualificationsJson;
    private List<String> preferredQualificationsJson;
    private List<String> benefitsJson;

    // ── Extended job details ────────────────────────────────────────────────────
    private String  companyLogo;
    private String  serviceBond;
    private String  joiningDate;
    private Integer vacancies;

    // ── Branch / batch / rounds / required fields / documents ──────────────────
    private List<String>              allowedBranches;
    private List<Integer>             eligibleBatches;
    private List<Map<String, Object>> rounds;
    private List<String>              requiredStudentFields;
    private List<Map<String, String>> documents;

    public JobResponseDTO() {}

	public JobResponseDTO(String id, String collegeId, String title, String companyName, String hiringDepartment,
			String jobType, String workMode, String location, String salaryRange, String summary, String internalId,
			String externalLink, String companyCulture, String physicalDemands, String eeoStatement, String status,
			LocalDate applicationDeadline, LocalDate postedAt, String postedBy, String postedById, boolean canEdit,
			String avoidListUrl, boolean isDeleted, String deletedAt, String deletedBy, String deletionReason,
			Long applicantCount, BigDecimal minUgScore, String formatUg, BigDecimal min10thScore, String format10th,
			BigDecimal min12thScore, String format12th, BigDecimal minDiplomaScore, String formatDiploma,
			Integer maxBacklogs, Boolean isDiplomaEligible, Boolean allowGaps, Integer maxGapYears,
			List<String> responsibilitiesJson, List<String> qualificationsJson,
			List<String> preferredQualificationsJson, List<String> benefitsJson, List<String> allowedBranches,
			List<Integer> eligibleBatches, List<Map<String, Object>> rounds, List<String> requiredStudentFields,
			List<Map<String, String>> documents) {
		super();
		this.id = id;
		this.collegeId = collegeId;
		this.title = title;
		this.companyName = companyName;
		this.hiringDepartment = hiringDepartment;
		this.jobType = jobType;
		this.workMode = workMode;
		this.location = location;
		this.salaryRange = salaryRange;
		this.summary = summary;
		this.internalId = internalId;
		this.externalLink = externalLink;
		this.companyCulture = companyCulture;
		this.physicalDemands = physicalDemands;
		this.eeoStatement = eeoStatement;
		this.status = status;
		this.applicationDeadline = applicationDeadline;
		this.postedAt = postedAt;
		this.postedBy = postedBy;
		this.postedById = postedById;
		this.canEdit = canEdit;
		this.avoidListUrl = avoidListUrl;
		this.isDeleted = isDeleted;
		this.deletedAt = deletedAt;
		this.deletedBy = deletedBy;
		this.deletionReason = deletionReason;
		this.applicantCount = applicantCount;
		this.minUgScore = minUgScore;
		this.formatUg = formatUg;
		this.min10thScore = min10thScore;
		this.format10th = format10th;
		this.min12thScore = min12thScore;
		this.format12th = format12th;
		this.minDiplomaScore = minDiplomaScore;
		this.formatDiploma = formatDiploma;
		this.maxBacklogs = maxBacklogs;
		this.isDiplomaEligible = isDiplomaEligible;
		this.allowGaps = allowGaps;
		this.maxGapYears = maxGapYears;
		this.responsibilitiesJson = responsibilitiesJson;
		this.qualificationsJson = qualificationsJson;
		this.preferredQualificationsJson = preferredQualificationsJson;
		this.benefitsJson = benefitsJson;
		this.allowedBranches = allowedBranches;
		this.eligibleBatches = eligibleBatches;
		this.rounds = rounds;
		this.requiredStudentFields = requiredStudentFields;
		this.documents = documents;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getCollegeId() {
		return collegeId;
	}

	public void setCollegeId(String collegeId) {
		this.collegeId = collegeId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getCompanyName() {
		return companyName;
	}

	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}

	public String getHiringDepartment() {
		return hiringDepartment;
	}

	public void setHiringDepartment(String hiringDepartment) {
		this.hiringDepartment = hiringDepartment;
	}

	public String getJobType() {
		return jobType;
	}

	public void setJobType(String jobType) {
		this.jobType = jobType;
	}

	public String getWorkMode() {
		return workMode;
	}

	public void setWorkMode(String workMode) {
		this.workMode = workMode;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getSalaryRange() {
		return salaryRange;
	}

	public void setSalaryRange(String salaryRange) {
		this.salaryRange = salaryRange;
	}

	public String getSummary() {
		return summary;
	}

	public void setSummary(String summary) {
		this.summary = summary;
	}

	public String getInternalId() {
		return internalId;
	}

	public void setInternalId(String internalId) {
		this.internalId = internalId;
	}

	public String getExternalLink() {
		return externalLink;
	}

	public void setExternalLink(String externalLink) {
		this.externalLink = externalLink;
	}

	public String getCompanyCulture() {
		return companyCulture;
	}

	public void setCompanyCulture(String companyCulture) {
		this.companyCulture = companyCulture;
	}

	public String getPhysicalDemands() {
		return physicalDemands;
	}

	public void setPhysicalDemands(String physicalDemands) {
		this.physicalDemands = physicalDemands;
	}

	public String getEeoStatement() {
		return eeoStatement;
	}

	public void setEeoStatement(String eeoStatement) {
		this.eeoStatement = eeoStatement;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public LocalDate getApplicationDeadline() {
		return applicationDeadline;
	}

	public void setApplicationDeadline(LocalDate applicationDeadline) {
		this.applicationDeadline = applicationDeadline;
	}

	public LocalDate getPostedAt() {
		return postedAt;
	}

	public void setPostedAt(LocalDate postedAt) {
		this.postedAt = postedAt;
	}

	public String getPostedBy() {
		return postedBy;
	}

	public void setPostedBy(String postedBy) {
		this.postedBy = postedBy;
	}

	public String getPostedById() {
		return postedById;
	}

	public void setPostedById(String postedById) {
		this.postedById = postedById;
	}

	public boolean isCanEdit() {
		return canEdit;
	}

	public void setCanEdit(boolean canEdit) {
		this.canEdit = canEdit;
	}

	public String getAvoidListUrl() {
		return avoidListUrl;
	}

	public void setAvoidListUrl(String avoidListUrl) {
		this.avoidListUrl = avoidListUrl;
	}

	public boolean isDeleted() {
		return isDeleted;
	}

	public void setDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public String getDeletedAt() {
		return deletedAt;
	}

	public void setDeletedAt(String deletedAt) {
		this.deletedAt = deletedAt;
	}

	public String getDeletedBy() {
		return deletedBy;
	}

	public void setDeletedBy(String deletedBy) {
		this.deletedBy = deletedBy;
	}

	public String getDeletionReason() {
		return deletionReason;
	}

	public void setDeletionReason(String deletionReason) {
		this.deletionReason = deletionReason;
	}

	public Long getApplicantCount() {
		return applicantCount;
	}

	public void setApplicantCount(Long applicantCount) {
		this.applicantCount = applicantCount;
	}

	public BigDecimal getMinUgScore() {
		return minUgScore;
	}

	public void setMinUgScore(BigDecimal minUgScore) {
		this.minUgScore = minUgScore;
	}

	public String getFormatUg() {
		return formatUg;
	}

	public void setFormatUg(String formatUg) {
		this.formatUg = formatUg;
	}

	public BigDecimal getMin10thScore() {
		return min10thScore;
	}

	public void setMin10thScore(BigDecimal min10thScore) {
		this.min10thScore = min10thScore;
	}

	public String getFormat10th() {
		return format10th;
	}

	public void setFormat10th(String format10th) {
		this.format10th = format10th;
	}

	public BigDecimal getMin12thScore() {
		return min12thScore;
	}

	public void setMin12thScore(BigDecimal min12thScore) {
		this.min12thScore = min12thScore;
	}

	public String getFormat12th() {
		return format12th;
	}

	public void setFormat12th(String format12th) {
		this.format12th = format12th;
	}

	public BigDecimal getMinDiplomaScore() {
		return minDiplomaScore;
	}

	public void setMinDiplomaScore(BigDecimal minDiplomaScore) {
		this.minDiplomaScore = minDiplomaScore;
	}

	public String getFormatDiploma() {
		return formatDiploma;
	}

	public void setFormatDiploma(String formatDiploma) {
		this.formatDiploma = formatDiploma;
	}

	public Integer getMaxBacklogs() {
		return maxBacklogs;
	}

	public void setMaxBacklogs(Integer maxBacklogs) {
		this.maxBacklogs = maxBacklogs;
	}

	public Boolean getIsDiplomaEligible() {
		return isDiplomaEligible;
	}

	public void setIsDiplomaEligible(Boolean isDiplomaEligible) {
		this.isDiplomaEligible = isDiplomaEligible;
	}

	public Boolean getAllowGaps() {
		return allowGaps;
	}

	public void setAllowGaps(Boolean allowGaps) {
		this.allowGaps = allowGaps;
	}

	public Integer getMaxGapYears() {
		return maxGapYears;
	}

	public void setMaxGapYears(Integer maxGapYears) {
		this.maxGapYears = maxGapYears;
	}

	public List<String> getResponsibilitiesJson() {
		return responsibilitiesJson;
	}

	public void setResponsibilitiesJson(List<String> responsibilitiesJson) {
		this.responsibilitiesJson = responsibilitiesJson;
	}

	public List<String> getQualificationsJson() {
		return qualificationsJson;
	}

	public void setQualificationsJson(List<String> qualificationsJson) {
		this.qualificationsJson = qualificationsJson;
	}

	public List<String> getPreferredQualificationsJson() {
		return preferredQualificationsJson;
	}

	public void setPreferredQualificationsJson(List<String> preferredQualificationsJson) {
		this.preferredQualificationsJson = preferredQualificationsJson;
	}

	public List<String> getBenefitsJson() {
		return benefitsJson;
	}

	public void setBenefitsJson(List<String> benefitsJson) {
		this.benefitsJson = benefitsJson;
	}

	public List<String> getAllowedBranches() {
		return allowedBranches;
	}

	public void setAllowedBranches(List<String> allowedBranches) {
		this.allowedBranches = allowedBranches;
	}

	public List<Integer> getEligibleBatches() {
		return eligibleBatches;
	}

	public void setEligibleBatches(List<Integer> eligibleBatches) {
		this.eligibleBatches = eligibleBatches;
	}

	public List<Map<String, Object>> getRounds() {
		return rounds;
	}

	public void setRounds(List<Map<String, Object>> rounds) {
		this.rounds = rounds;
	}

	public List<String> getRequiredStudentFields() {
		return requiredStudentFields;
	}

	public void setRequiredStudentFields(List<String> requiredStudentFields) {
		this.requiredStudentFields = requiredStudentFields;
	}

	public List<Map<String, String>> getDocuments() {
		return documents;
	}

	public void setDocuments(List<Map<String, String>> documents) {
		this.documents = documents;
	}

	public String getCompanyLogo() { return companyLogo; }
	public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

	public String getServiceBond() { return serviceBond; }
	public void setServiceBond(String serviceBond) { this.serviceBond = serviceBond; }

	public String getJoiningDate() { return joiningDate; }
	public void setJoiningDate(String joiningDate) { this.joiningDate = joiningDate; }

	public Integer getVacancies() { return vacancies; }
	public void setVacancies(Integer vacancies) { this.vacancies = vacancies; }


}