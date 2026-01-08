package com.srots.dto.jobdto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquivalentJobDTO {
    private String id;
    private String title;
    private String companyName;
    private String hiringDepartment;
    private String jobType;
    private String workMode;
    private String location;
    private String salaryRange;
    private String summary;
    
    // These must be Strings to hold the JSON text from the Entity
    private String responsibilitiesJson;
    private String qualificationsJson;
    private String preferredQualificationsJson;
    private String benefitsJson;
    
    private String companyCulture;
    private String physicalDemands;
    private String eeoStatement;
    private String internalId;
    private LocalDate applicationDeadline;
    private String externalLink;
    private String status;
    private LocalDateTime postedAt; // Matches Entity LocalDateTime

    // Eligibility Criteria
    private BigDecimal minUgScore;
    private Integer maxBacklogs;
    private BigDecimal min10thScore;
    private BigDecimal min12thScore;
    private Boolean allowGaps;
    
    // Updated to String to match your Entity's @JdbcTypeCode(SqlTypes.JSON) String fields
    private String allowedBranches;
    private String eligibleBatches;
    private String roundsJson;
    private String requiredFieldsJson;
    private String attachmentsJson;

    // Flat DTOs to stop recursion
    private CollegeSummaryDTO college;
    private UserSummaryDTO postedBy;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
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
	public String getResponsibilitiesJson() {
		return responsibilitiesJson;
	}
	public void setResponsibilitiesJson(String responsibilitiesJson) {
		this.responsibilitiesJson = responsibilitiesJson;
	}
	public String getQualificationsJson() {
		return qualificationsJson;
	}
	public void setQualificationsJson(String qualificationsJson) {
		this.qualificationsJson = qualificationsJson;
	}
	public String getPreferredQualificationsJson() {
		return preferredQualificationsJson;
	}
	public void setPreferredQualificationsJson(String preferredQualificationsJson) {
		this.preferredQualificationsJson = preferredQualificationsJson;
	}
	public String getBenefitsJson() {
		return benefitsJson;
	}
	public void setBenefitsJson(String benefitsJson) {
		this.benefitsJson = benefitsJson;
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
	public String getInternalId() {
		return internalId;
	}
	public void setInternalId(String internalId) {
		this.internalId = internalId;
	}
	public LocalDate getApplicationDeadline() {
		return applicationDeadline;
	}
	public void setApplicationDeadline(LocalDate applicationDeadline) {
		this.applicationDeadline = applicationDeadline;
	}
	public String getExternalLink() {
		return externalLink;
	}
	public void setExternalLink(String externalLink) {
		this.externalLink = externalLink;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public LocalDateTime getPostedAt() {
		return postedAt;
	}
	public void setPostedAt(LocalDateTime postedAt) {
		this.postedAt = postedAt;
	}
	public BigDecimal getMinUgScore() {
		return minUgScore;
	}
	public void setMinUgScore(BigDecimal minUgScore) {
		this.minUgScore = minUgScore;
	}
	public Integer getMaxBacklogs() {
		return maxBacklogs;
	}
	public void setMaxBacklogs(Integer maxBacklogs) {
		this.maxBacklogs = maxBacklogs;
	}
	public BigDecimal getMin10thScore() {
		return min10thScore;
	}
	public void setMin10thScore(BigDecimal min10thScore) {
		this.min10thScore = min10thScore;
	}
	public BigDecimal getMin12thScore() {
		return min12thScore;
	}
	public void setMin12thScore(BigDecimal min12thScore) {
		this.min12thScore = min12thScore;
	}
	public Boolean getAllowGaps() {
		return allowGaps;
	}
	public void setAllowGaps(Boolean allowGaps) {
		this.allowGaps = allowGaps;
	}
	public String getAllowedBranches() {
		return allowedBranches;
	}
	public void setAllowedBranches(String allowedBranches) {
		this.allowedBranches = allowedBranches;
	}
	public String getEligibleBatches() {
		return eligibleBatches;
	}
	public void setEligibleBatches(String eligibleBatches) {
		this.eligibleBatches = eligibleBatches;
	}
	public String getRoundsJson() {
		return roundsJson;
	}
	public void setRoundsJson(String roundsJson) {
		this.roundsJson = roundsJson;
	}
	public String getRequiredFieldsJson() {
		return requiredFieldsJson;
	}
	public void setRequiredFieldsJson(String requiredFieldsJson) {
		this.requiredFieldsJson = requiredFieldsJson;
	}
	public String getAttachmentsJson() {
		return attachmentsJson;
	}
	public void setAttachmentsJson(String attachmentsJson) {
		this.attachmentsJson = attachmentsJson;
	}
	public CollegeSummaryDTO getCollege() {
		return college;
	}
	public void setCollege(CollegeSummaryDTO college) {
		this.college = college;
	}
	public UserSummaryDTO getPostedBy() {
		return postedBy;
	}
	public void setPostedBy(UserSummaryDTO postedBy) {
		this.postedBy = postedBy;
	}
    
    
    
}