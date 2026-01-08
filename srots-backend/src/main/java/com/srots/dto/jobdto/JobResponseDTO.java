package com.srots.dto.jobdto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;

@Data
//@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobResponseDTO {
    private String id;
    private String title;
    private String company;
    private String hiringDepartment;
    private String jobType;
    private String workMode;
    private String location;
    private String salaryRange;
    private String status;
    private String summary;
    private String internalId;
    private String externalLink;
    private String companyCulture;
    
    private LocalDate postedAt;
    private LocalDate applicationDeadline;
    private String collegeId;
    private String postedBy;
    private String postedById;
    private Long applicantCount;

    private BigDecimal minUgScore;
    private BigDecimal min10thScore;
    private BigDecimal min12thScore;
    private Integer maxBacklogs;
    private Boolean isDiplomaEligible;
    private Boolean allowGaps;
    private Integer maxGapYears;
    
    private boolean canEdit;
    private String avoidListUrl; // <--- ADD THIS FIELD

    private List<String> responsibilities;
    private List<String> qualifications;
    private List<String> preferredQualifications;
    private List<String> benefits;
    private List<String> allowedBranches;
    private List<String> eligibleBatches;
    private List<Map<String, Object>> rounds;
    private List<Map<String, String>> attachments; // List of {name, url}
    private List<String> requiredFields;
	public JobResponseDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public JobResponseDTO(String id, String title, String company, String hiringDepartment, String jobType,
			String workMode, String location, String salaryRange, String status, String summary, String internalId,
			String externalLink, String companyCulture, LocalDate postedAt, LocalDate applicationDeadline,String collegeId,
			String postedBy, String postedById, Long applicantCount, BigDecimal minUgScore, BigDecimal min10thScore,
			BigDecimal min12thScore, Integer maxBacklogs, Boolean isDiplomaEligible, Boolean allowGaps,
			Integer maxGapYears, boolean canEdit, String avoidListUrl, List<String> responsibilities,
			List<String> qualifications, List<String> preferredQualifications, List<String> benefits,
			List<String> allowedBranches, List<String> eligibleBatches, List<Map<String, Object>> rounds,
			List<Map<String, String>> attachments, List<String> requiredFields) {
		super();
		this.id = id;
		this.title = title;
		this.company = company;
		this.hiringDepartment = hiringDepartment;
		this.jobType = jobType;
		this.workMode = workMode;
		this.location = location;
		this.salaryRange = salaryRange;
		this.status = status;
		this.summary = summary;
		this.internalId = internalId;
		this.externalLink = externalLink;
		this.companyCulture = companyCulture;
		this.postedAt = postedAt;
		this.applicationDeadline = applicationDeadline;
		this.collegeId = collegeId;
		this.postedBy = postedBy;
		this.postedById = postedById;
		this.applicantCount = applicantCount;
		this.minUgScore = minUgScore;
		this.min10thScore = min10thScore;
		this.min12thScore = min12thScore;
		this.maxBacklogs = maxBacklogs;
		this.isDiplomaEligible = isDiplomaEligible;
		this.allowGaps = allowGaps;
		this.maxGapYears = maxGapYears;
		this.canEdit = canEdit;
		this.avoidListUrl = avoidListUrl;
		this.responsibilities = responsibilities;
		this.qualifications = qualifications;
		this.preferredQualifications = preferredQualifications;
		this.benefits = benefits;
		this.allowedBranches = allowedBranches;
		this.eligibleBatches = eligibleBatches;
		this.rounds = rounds;
		this.attachments = attachments;
		this.requiredFields = requiredFields;
	}
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
	public String getCompany() {
		return company;
	}
	public void setCompany(String company) {
		this.company = company;
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
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
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
	public LocalDate getPostedAt() {
		return postedAt;
	}
	public void setPostedAt(LocalDate postedAt) {
		this.postedAt = postedAt;
	}
	public LocalDate getApplicationDeadline() {
		return applicationDeadline;
	}
	public void setApplicationDeadline(LocalDate applicationDeadline) {
		this.applicationDeadline = applicationDeadline;
	}
	
	
	public String getCollegeId() {
		return collegeId;
	}
	public void setCollegeId(String collegeId) {
		this.collegeId = collegeId;
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
	public List<String> getResponsibilities() {
		return responsibilities;
	}
	public void setResponsibilities(List<String> responsibilities) {
		this.responsibilities = responsibilities;
	}
	public List<String> getQualifications() {
		return qualifications;
	}
	public void setQualifications(List<String> qualifications) {
		this.qualifications = qualifications;
	}
	public List<String> getPreferredQualifications() {
		return preferredQualifications;
	}
	public void setPreferredQualifications(List<String> preferredQualifications) {
		this.preferredQualifications = preferredQualifications;
	}
	public List<String> getBenefits() {
		return benefits;
	}
	public void setBenefits(List<String> benefits) {
		this.benefits = benefits;
	}
	public List<String> getAllowedBranches() {
		return allowedBranches;
	}
	public void setAllowedBranches(List<String> allowedBranches) {
		this.allowedBranches = allowedBranches;
	}
	public List<String> getEligibleBatches() {
		return eligibleBatches;
	}
	public void setEligibleBatches(List<String> eligibleBatches) {
		this.eligibleBatches = eligibleBatches;
	}
	public List<Map<String, Object>> getRounds() {
		return rounds;
	}
	public void setRounds(List<Map<String, Object>> rounds) {
		this.rounds = rounds;
	}
	public List<Map<String, String>> getAttachments() {
		return attachments;
	}
	public void setAttachments(List<Map<String, String>> attachments) {
		this.attachments = attachments;
	}
	public List<String> getRequiredFields() {
		return requiredFields;
	}
	public void setRequiredFields(List<String> requiredFields) {
		this.requiredFields = requiredFields;
	}
    
    
    
    
}