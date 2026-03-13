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
@Table(name = "jobs", indexes = {
    @Index(name = "idx_job_college_id",  columnList = "college_id"),
    @Index(name = "idx_job_status",      columnList = "status"),
    @Index(name = "idx_job_type",        columnList = "job_type"),
    @Index(name = "idx_job_work_mode",   columnList = "work_mode"),
    @Index(name = "idx_job_deadline",    columnList = "application_deadline"),
    @Index(name = "idx_job_posted_by",   columnList = "posted_by_id"),
    @Index(name = "idx_job_posted_at",   columnList = "posted_at")
})
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
        "hibernateLazyInitializer", "handler", "passwordHash", "jobs", "college",
        "studentProfile", "educationRecords"
    })
    private User postedBy;

    // ═══════════════════════════════════════════════════════════════════════
    // BASIC INFO
    // ═══════════════════════════════════════════════════════════════════════
    private String title;
    private String companyName;
    private String hiringDepartment;

    /**
     * CHANGED from @Enumerated(EnumType.STRING) to @Convert.
     * Handles legacy DB values: "Full_time" → Full_Time, "Internship" → Internship
     */
    @Convert(converter = Job.JobTypeConverter.class)
    private JobType jobType;

    /**
     * CHANGED from @Enumerated(EnumType.STRING) to @Convert.
     * Handles legacy DB values: "On_site" → On_Site, "Remote" → Remote
     */
    @Convert(converter = Job.WorkModeConverter.class)
    private WorkMode workMode;

    private String location;
    private String salaryRange;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String externalLink;

    private String internalId;

    // ═══════════════════════════════════════════════════════════════════════
    // JSON ARRAYS
    // ═══════════════════════════════════════════════════════════════════════
    @JdbcTypeCode(SqlTypes.JSON)
    private String responsibilitiesJson;

    @JdbcTypeCode(SqlTypes.JSON)
    private String qualificationsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    private String preferredQualificationsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    private String benefitsJson;

    // ═══════════════════════════════════════════════════════════════════════
    // ADDITIONAL DETAILS
    // ═══════════════════════════════════════════════════════════════════════
    @Column(columnDefinition = "TEXT")
    private String companyCulture;

    @Column(columnDefinition = "TEXT")
    private String physicalDemands;

    @Column(columnDefinition = "TEXT")
    private String eeoStatement;

    private LocalDate applicationDeadline;

    // JobStatus values (Active/Closed/Draft) haven't changed — safe to keep @Enumerated
    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.Active;

    // ═══════════════════════════════════════════════════════════════════════
    // TIMESTAMPS & AUDIT
    // ═══════════════════════════════════════════════════════════════════════
    @CreationTimestamp
    private LocalDateTime postedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User updatedBy;

    // ═══════════════════════════════════════════════════════════════════════
    // SOFT DELETE FIELDS
    // ═══════════════════════════════════════════════════════════════════════
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User deletedBy;

    @Column(name = "restored_at")
    private LocalDateTime restoredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restored_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User restoredBy;

    @Column(name = "deletion_reason")
    private String deletionReason;

    // ═══════════════════════════════════════════════════════════════════════
    // ELIGIBILITY CRITERIA (flat fields)
    // ═══════════════════════════════════════════════════════════════════════
    @Column(precision = 5, scale = 2)
    private BigDecimal minUgScore;
    private String formatUg;

    @Column(precision = 5, scale = 2)
    private BigDecimal min10thScore;
    private String format10th;

    @Column(precision = 5, scale = 2)
    private BigDecimal min12thScore;
    private String format12th;

    @Column(precision = 5, scale = 2)
    private BigDecimal minDiplomaScore;
    private String formatDiploma;

    private Integer maxBacklogs;
    private Boolean isDiplomaEligible = false;
    private Boolean allowGaps = false;
    private Integer maxGapYears = 0;

    // ═══════════════════════════════════════════════════════════════════════
    // JSON FIELDS
    // ═══════════════════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════════════════
    // EXTENDED JOB DETAILS
    // ═══════════════════════════════════════════════════════════════════════
    /** URL to company logo image (optional) */
    private String companyLogo;

    /** Service bond requirement, e.g. "2 years" or null */
    private String serviceBond;

    /** Expected joining date as a string, e.g. "June 2025" or "Immediate" */
    private String joiningDate;

    /** Number of open positions */
    private Integer vacancies;

    // ═══════════════════════════════════════════════════════════════════════
    // RELATIONS
    // ═══════════════════════════════════════════════════════════════════════
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Application> applications;

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════
    public boolean isDeleted() {
        return deletedAt != null;
    }

    public boolean isActive() {
        return !isDeleted() && status == JobStatus.Active;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════════════════════════════════

    public enum JobStatus {
        Active, Closed, Draft
    }

    public enum JobType {
        Full_Time("Full-Time"),
        Internship("Internship"),
        Contract("Contract"),
        Part_Time("Part-Time");

        private final String display;

        JobType(String display) { this.display = display; }

        @JsonValue
        public String getDisplay() { return display; }

        /**
         * Normalises any variant before matching:
         * "Full-Time", "Full Time", "Full_Time", "full_time", "fulltime",
         * "Full_time" (old DB value) → all map to Full_Time.
         */
        public static JobType fromString(String text) {
            if (text == null || text.isBlank()) return Full_Time;
            String clean = text.trim()
                    .replace(" ", "").replace("-", "").replace("_", "").toLowerCase();
            for (JobType t : JobType.values()) {
                // match against enum constant name
                if (t.name().replace("_", "").toLowerCase().equals(clean)) return t;
                // also match against display string
                if (t.display.replace(" ", "").replace("-", "").toLowerCase().equals(clean)) return t;
            }
            return Full_Time;
        }
    }

    public enum WorkMode {
        On_Site("On-Site"),
        Remote("Remote"),
        Hybrid("Hybrid");

        private final String display;

        WorkMode(String display) { this.display = display; }

        @JsonValue
        public String getDisplay() { return display; }

        /**
         * Normalises any variant before matching:
         * "On-Site", "On_Site", "On_site" (old DB!), "onsite", "on-site"
         * → all collapse to "onsite" after stripping → match On_Site.
         */
        public static WorkMode fromString(String text) {
            if (text == null || text.isBlank()) return On_Site;
            String clean = text.trim()
                    .replace(" ", "").replace("-", "").replace("_", "").toLowerCase();
            for (WorkMode m : WorkMode.values()) {
                if (m.name().replace("_", "").toLowerCase().equals(clean)) return m;
                if (m.display.replace(" ", "").replace("-", "").toLowerCase().equals(clean)) return m;
            }
            return On_Site;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ATTRIBUTE CONVERTERS  ← THE ACTUAL FIX
    //
    // Why these exist:
    //   @Enumerated(EnumType.STRING) calls Enum.valueOf(dbValue) internally.
    //   Enum.valueOf() is strict — "On_site" ≠ "On_Site" → exception.
    //
    //   These converters intercept Hibernate's read/write path:
    //   • convertToDatabaseColumn → always writes the canonical enum name
    //     ("On_Site", "Full_Time") so new rows are consistent.
    //   • convertToEntityAttribute → calls fromString() which normalises the
    //     raw DB string before matching, so old "On_site" rows work fine.
    // ═══════════════════════════════════════════════════════════════════════

    @Converter
    public static class WorkModeConverter implements AttributeConverter<WorkMode, String> {

        @Override
        public String convertToDatabaseColumn(WorkMode attribute) {
            // Write canonical name → new rows always get "On_Site" not "On_site"
            return (attribute == null) ? null : attribute.name();
        }

        @Override
        public WorkMode convertToEntityAttribute(String dbData) {
            // fromString() normalises "On_site" → On_Site safely
            return (dbData == null || dbData.isBlank()) ? null : WorkMode.fromString(dbData);
        }
    }

    @Converter
    public static class JobTypeConverter implements AttributeConverter<JobType, String> {

        @Override
        public String convertToDatabaseColumn(JobType attribute) {
            return (attribute == null) ? null : attribute.name();
        }

        @Override
        public JobType convertToEntityAttribute(String dbData) {
            return (dbData == null || dbData.isBlank()) ? null : JobType.fromString(dbData);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPLICIT CONSTRUCTORS (required because @AllArgsConstructor from Lombok
    // conflicts with manually-written ones when both @Data and explicit
    // constructors are present — keep only what you need below)
    // ═══════════════════════════════════════════════════════════════════════
    
    

    // ─── Getters & Setters ───────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public College getCollege() { return college; }
    public void setCollege(College college) { this.college = college; }

    public User getPostedBy() { return postedBy; }
    public void setPostedBy(User postedBy) { this.postedBy = postedBy; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getHiringDepartment() { return hiringDepartment; }
    public void setHiringDepartment(String hiringDepartment) { this.hiringDepartment = hiringDepartment; }

    public JobType getJobType() { return jobType; }
    public void setJobType(JobType jobType) { this.jobType = jobType; }

    public WorkMode getWorkMode() { return workMode; }
    public void setWorkMode(WorkMode workMode) { this.workMode = workMode; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getExternalLink() { return externalLink; }
    public void setExternalLink(String externalLink) { this.externalLink = externalLink; }

    public String getInternalId() { return internalId; }
    public void setInternalId(String internalId) { this.internalId = internalId; }

    public String getResponsibilitiesJson() { return responsibilitiesJson; }
    public void setResponsibilitiesJson(String v) { this.responsibilitiesJson = v; }

    public String getQualificationsJson() { return qualificationsJson; }
    public void setQualificationsJson(String v) { this.qualificationsJson = v; }

    public String getPreferredQualificationsJson() { return preferredQualificationsJson; }
    public void setPreferredQualificationsJson(String v) { this.preferredQualificationsJson = v; }

    public String getBenefitsJson() { return benefitsJson; }
    public void setBenefitsJson(String v) { this.benefitsJson = v; }

    public String getCompanyCulture() { return companyCulture; }
    public void setCompanyCulture(String companyCulture) { this.companyCulture = companyCulture; }

    public String getPhysicalDemands() { return physicalDemands; }
    public void setPhysicalDemands(String physicalDemands) { this.physicalDemands = physicalDemands; }

    public String getEeoStatement() { return eeoStatement; }
    public void setEeoStatement(String eeoStatement) { this.eeoStatement = eeoStatement; }

    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate v) { this.applicationDeadline = v; }

    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }

    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public User getDeletedBy() { return deletedBy; }
    public void setDeletedBy(User deletedBy) { this.deletedBy = deletedBy; }

    public LocalDateTime getRestoredAt() { return restoredAt; }
    public void setRestoredAt(LocalDateTime restoredAt) { this.restoredAt = restoredAt; }

    public User getRestoredBy() { return restoredBy; }
    public void setRestoredBy(User restoredBy) { this.restoredBy = restoredBy; }

    public String getDeletionReason() { return deletionReason; }
    public void setDeletionReason(String deletionReason) { this.deletionReason = deletionReason; }

    public BigDecimal getMinUgScore() { return minUgScore; }
    public void setMinUgScore(BigDecimal v) { this.minUgScore = v; }

    public String getFormatUg() { return formatUg; }
    public void setFormatUg(String formatUg) { this.formatUg = formatUg; }

    public BigDecimal getMin10thScore() { return min10thScore; }
    public void setMin10thScore(BigDecimal v) { this.min10thScore = v; }

    public String getFormat10th() { return format10th; }
    public void setFormat10th(String format10th) { this.format10th = format10th; }

    public BigDecimal getMin12thScore() { return min12thScore; }
    public void setMin12thScore(BigDecimal v) { this.min12thScore = v; }

    public String getFormat12th() { return format12th; }
    public void setFormat12th(String format12th) { this.format12th = format12th; }

    public BigDecimal getMinDiplomaScore() { return minDiplomaScore; }
    public void setMinDiplomaScore(BigDecimal v) { this.minDiplomaScore = v; }

    public String getFormatDiploma() { return formatDiploma; }
    public void setFormatDiploma(String formatDiploma) { this.formatDiploma = formatDiploma; }

    public Integer getMaxBacklogs() { return maxBacklogs; }
    public void setMaxBacklogs(Integer maxBacklogs) { this.maxBacklogs = maxBacklogs; }

    public Boolean getIsDiplomaEligible() { return isDiplomaEligible; }
    public void setIsDiplomaEligible(Boolean v) { this.isDiplomaEligible = v; }

    public Boolean getAllowGaps() { return allowGaps; }
    public void setAllowGaps(Boolean allowGaps) { this.allowGaps = allowGaps; }

    public Integer getMaxGapYears() { return maxGapYears; }
    public void setMaxGapYears(Integer maxGapYears) { this.maxGapYears = maxGapYears; }

    public String getAllowedBranches() { return allowedBranches; }
    public void setAllowedBranches(String v) { this.allowedBranches = v; }

    public String getEligibleBatches() { return eligibleBatches; }
    public void setEligibleBatches(String v) { this.eligibleBatches = v; }

    public String getRoundsJson() { return roundsJson; }
    public void setRoundsJson(String roundsJson) { this.roundsJson = roundsJson; }

    public String getRequiredFieldsJson() { return requiredFieldsJson; }
    public void setRequiredFieldsJson(String v) { this.requiredFieldsJson = v; }

    public String getAttachmentsJson() { return attachmentsJson; }
    public void setAttachmentsJson(String v) { this.attachmentsJson = v; }

    public String getAvoidListUrl() { return avoidListUrl; }
    public void setAvoidListUrl(String avoidListUrl) { this.avoidListUrl = avoidListUrl; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public String getServiceBond() { return serviceBond; }
    public void setServiceBond(String serviceBond) { this.serviceBond = serviceBond; }

    public String getJoiningDate() { return joiningDate; }
    public void setJoiningDate(String joiningDate) { this.joiningDate = joiningDate; }

    public Integer getVacancies() { return vacancies; }
    public void setVacancies(Integer vacancies) { this.vacancies = vacancies; }

    public List<Application> getApplications() { return applications; }
    public void setApplications(List<Application> applications) { this.applications = applications; }
}