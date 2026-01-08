package com.srots.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "jobs", "posts", "users"})
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by_id")
    @JsonIgnoreProperties({
        "hibernateLazyInitializer", 
        "handler", 
        "passwordHash", 
        "jobs",      // Stop loop back to jobs
        "college",   // Stop loop back to college (since Job already has college)
        "studentProfile",
        "educationRecords"
    })
    private User postedBy;

    private String title;
    private String companyName;
    private String hiringDepartment;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    private WorkMode workMode;

    private String location;
    private String salaryRange;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    private String responsibilitiesJson;

    @JdbcTypeCode(SqlTypes.JSON)
    private String qualificationsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    private String preferredQualificationsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    private String benefitsJson;

    @Column(columnDefinition = "TEXT")
    private String companyCulture;

    @Column(columnDefinition = "TEXT")
    private String physicalDemands;

    @Column(columnDefinition = "TEXT")
    private String eeoStatement;

    private String internalId;
    private LocalDate applicationDeadline;

    @Column(columnDefinition = "TEXT")
    private String externalLink;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.Active;

    @CreationTimestamp
    private LocalDateTime postedAt;

    @Column(precision = 5, scale = 2)
    private BigDecimal minUgScore;
    private String formatUg;
    private Integer maxBacklogs;

    @Column(precision = 5, scale = 2)
    private BigDecimal min10thScore;
    private String format10th;

    @Column(precision = 5, scale = 2)
    private BigDecimal min12thScore;
    private String format12th;

    private Boolean isDiplomaEligible = false;

    @Column(precision = 5, scale = 2)
    private BigDecimal minDiplomaScore;
    private String formatDiploma;

    private Boolean allowGaps = false;
    private Integer maxGapYears = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    private String allowedBranches;

    @JdbcTypeCode(SqlTypes.JSON)
    private String eligibleBatches;

    @JdbcTypeCode(SqlTypes.JSON)
    private String roundsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    private String requiredFieldsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    private String attachmentsJson;

    private String avoidListUrl;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Application> applications;

    // --- ENUMS ---

    public enum JobStatus { Active, Closed, Draft }

    public enum JobType {
        Full_Time("Full Time"), Internship("Internship"), Contract("Contract");
        private final String display;
        JobType(String display) { this.display = display; }
        @JsonValue public String getDisplay() { return display; }

        public static JobType fromString(String text) {
            if (text == null || text.isBlank()) return null;
            String clean = text.trim().replace(" ", "").replace("_", "").toLowerCase();
            for (JobType t : JobType.values()) {
                if (t.name().replace("_", "").toLowerCase().equals(clean)) return t;
            }
            return null;
        }
    }

    public enum WorkMode {
        On_Site("On-Site"), Remote("Remote"), Hybrid("Hybrid");
        private final String display;
        WorkMode(String display) { this.display = display; }
        @JsonValue public String getDisplay() { return display; }

        public static WorkMode fromString(String text) {
            if (text == null || text.isBlank()) return null;
            String clean = text.trim().replace(" ", "").replace("-", "").replace("_", "").toLowerCase();
            for (WorkMode m : WorkMode.values()) {
                if (m.name().replace("_", "").toLowerCase().equals(clean)) return m;
            }
            return null;
        }
    }

	public Job() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Job(String id, College college, User postedBy, String title, String companyName, String hiringDepartment,
			JobType jobType, WorkMode workMode, String location, String salaryRange, String summary,
			String responsibilitiesJson, String qualificationsJson, String preferredQualificationsJson,
			String benefitsJson, String companyCulture, String physicalDemands, String eeoStatement, String internalId,
			LocalDate applicationDeadline, String externalLink, JobStatus status, LocalDateTime postedAt,
			BigDecimal minUgScore, String formatUg, Integer maxBacklogs, BigDecimal min10thScore, String format10th,
			BigDecimal min12thScore, String format12th, Boolean isDiplomaEligible, BigDecimal minDiplomaScore,
			String formatDiploma, Boolean allowGaps, Integer maxGapYears, String allowedBranches,
			String eligibleBatches, String roundsJson, String requiredFieldsJson, String attachmentsJson,
			String avoidListUrl, List<Application> applications) {
		super();
		this.id = id;
		this.college = college;
		this.postedBy = postedBy;
		this.title = title;
		this.companyName = companyName;
		this.hiringDepartment = hiringDepartment;
		this.jobType = jobType;
		this.workMode = workMode;
		this.location = location;
		this.salaryRange = salaryRange;
		this.summary = summary;
		this.responsibilitiesJson = responsibilitiesJson;
		this.qualificationsJson = qualificationsJson;
		this.preferredQualificationsJson = preferredQualificationsJson;
		this.benefitsJson = benefitsJson;
		this.companyCulture = companyCulture;
		this.physicalDemands = physicalDemands;
		this.eeoStatement = eeoStatement;
		this.internalId = internalId;
		this.applicationDeadline = applicationDeadline;
		this.externalLink = externalLink;
		this.status = status;
		this.postedAt = postedAt;
		this.minUgScore = minUgScore;
		this.formatUg = formatUg;
		this.maxBacklogs = maxBacklogs;
		this.min10thScore = min10thScore;
		this.format10th = format10th;
		this.min12thScore = min12thScore;
		this.format12th = format12th;
		this.isDiplomaEligible = isDiplomaEligible;
		this.minDiplomaScore = minDiplomaScore;
		this.formatDiploma = formatDiploma;
		this.allowGaps = allowGaps;
		this.maxGapYears = maxGapYears;
		this.allowedBranches = allowedBranches;
		this.eligibleBatches = eligibleBatches;
		this.roundsJson = roundsJson;
		this.requiredFieldsJson = requiredFieldsJson;
		this.attachmentsJson = attachmentsJson;
		this.avoidListUrl = avoidListUrl;
		this.applications = applications;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public College getCollege() {
		return college;
	}

	public void setCollege(College college) {
		this.college = college;
	}

	public User getPostedBy() {
		return postedBy;
	}

	public void setPostedBy(User postedBy) {
		this.postedBy = postedBy;
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

	public JobType getJobType() {
		return jobType;
	}

	public void setJobType(JobType jobType) {
		this.jobType = jobType;
	}

	public WorkMode getWorkMode() {
		return workMode;
	}

	public void setWorkMode(WorkMode workMode) {
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

	public JobStatus getStatus() {
		return status;
	}

	public void setStatus(JobStatus status) {
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

	public String getFormatUg() {
		return formatUg;
	}

	public void setFormatUg(String formatUg) {
		this.formatUg = formatUg;
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

	public Boolean getIsDiplomaEligible() {
		return isDiplomaEligible;
	}

	public void setIsDiplomaEligible(Boolean isDiplomaEligible) {
		this.isDiplomaEligible = isDiplomaEligible;
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

	public String getAvoidListUrl() {
		return avoidListUrl;
	}

	public void setAvoidListUrl(String avoidListUrl) {
		this.avoidListUrl = avoidListUrl;
	}

	public List<Application> getApplications() {
		return applications;
	}

	public void setApplications(List<Application> applications) {
		this.applications = applications;
	}
    
    
    
    
}