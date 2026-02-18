//package com.srots.dto.jobdto;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.List;
//import java.util.Map;
//
//import com.fasterxml.jackson.annotation.JsonInclude;
//
//import lombok.Data;
//
//@Data
////@JsonInclude(JsonInclude.Include.NON_NULL)
//public class JobResponseDTO {
//    private String id;
//    private String title;
//    private String company;
//    private String hiringDepartment;
//    private String jobType;
//    private String workMode;
//    private String location;
//    private String salaryRange;
//    private String status;
//    private String summary;
//    
//    private String internalId;
//    private String externalLink;
//    private String companyCulture;
//    
//    private LocalDate postedAt;
//    private LocalDate applicationDeadline;
//    private String collegeId;
//    private String postedBy;
//    private String postedById;
//    private Long applicantCount; //19
//
//    private BigDecimal minUgScore;
//    private BigDecimal min10thScore;
//    private BigDecimal min12thScore;
//    private Integer maxBacklogs;
//    private Boolean isDiplomaEligible;
//    private Boolean allowGaps;
//    private Integer maxGapYears; //26
//    
//    private boolean canEdit;
//    private String avoidListUrl; // <--- ADD THIS FIELD
//
//    private List<String> responsibilities;
//    private List<String> qualifications;
//    private List<String> preferredQualifications;
//    private List<String> benefits;
//    private List<String> allowedBranches;
//    private List<String> eligibleBatches;
//    private List<Map<String, Object>> rounds;
//    private List<Map<String, String>> attachments; // List of {name, url}
//    private List<String> requiredFields;
//	public JobResponseDTO() {
//		super();
//		// TODO Auto-generated constructor stub
//	}
//	public JobResponseDTO(String id, String title, String company, String hiringDepartment, String jobType,
//			String workMode, String location, String salaryRange, String status, String summary, String internalId,
//			String externalLink, String companyCulture, LocalDate postedAt, LocalDate applicationDeadline,String collegeId,
//			String postedBy, String postedById, Long applicantCount, BigDecimal minUgScore, BigDecimal min10thScore,
//			BigDecimal min12thScore, Integer maxBacklogs, Boolean isDiplomaEligible, Boolean allowGaps,
//			Integer maxGapYears, boolean canEdit, String avoidListUrl, List<String> responsibilities,
//			List<String> qualifications, List<String> preferredQualifications, List<String> benefits,
//			List<String> allowedBranches, List<String> eligibleBatches, List<Map<String, Object>> rounds,
//			List<Map<String, String>> attachments, List<String> requiredFields) {
//		super();
//		this.id = id;
//		this.title = title;
//		this.company = company;
//		this.hiringDepartment = hiringDepartment;
//		this.jobType = jobType;
//		this.workMode = workMode;
//		this.location = location;
//		this.salaryRange = salaryRange;
//		this.status = status;
//		this.summary = summary;
//		this.internalId = internalId;
//		this.externalLink = externalLink;
//		this.companyCulture = companyCulture;
//		this.postedAt = postedAt;
//		this.applicationDeadline = applicationDeadline;
//		this.collegeId = collegeId;
//		this.postedBy = postedBy;
//		this.postedById = postedById;
//		this.applicantCount = applicantCount;
//		this.minUgScore = minUgScore;
//		this.min10thScore = min10thScore;
//		this.min12thScore = min12thScore;
//		this.maxBacklogs = maxBacklogs;
//		this.isDiplomaEligible = isDiplomaEligible;
//		this.allowGaps = allowGaps;
//		this.maxGapYears = maxGapYears;
//		this.canEdit = canEdit;
//		this.avoidListUrl = avoidListUrl;
//		this.responsibilities = responsibilities;
//		this.qualifications = qualifications;
//		this.preferredQualifications = preferredQualifications;
//		this.benefits = benefits;
//		this.allowedBranches = allowedBranches;
//		this.eligibleBatches = eligibleBatches;
//		this.rounds = rounds;
//		this.attachments = attachments;
//		this.requiredFields = requiredFields;
//	}
//	public String getId() {
//		return id;
//	}
//	public void setId(String id) {
//		this.id = id;
//	}
//	public String getTitle() {
//		return title;
//	}
//	public void setTitle(String title) {
//		this.title = title;
//	}
//	public String getCompany() {
//		return company;
//	}
//	public void setCompany(String company) {
//		this.company = company;
//	}
//	public String getHiringDepartment() {
//		return hiringDepartment;
//	}
//	public void setHiringDepartment(String hiringDepartment) {
//		this.hiringDepartment = hiringDepartment;
//	}
//	public String getJobType() {
//		return jobType;
//	}
//	public void setJobType(String jobType) {
//		this.jobType = jobType;
//	}
//	public String getWorkMode() {
//		return workMode;
//	}
//	public void setWorkMode(String workMode) {
//		this.workMode = workMode;
//	}
//	public String getLocation() {
//		return location;
//	}
//	public void setLocation(String location) {
//		this.location = location;
//	}
//	public String getSalaryRange() {
//		return salaryRange;
//	}
//	public void setSalaryRange(String salaryRange) {
//		this.salaryRange = salaryRange;
//	}
//	public String getStatus() {
//		return status;
//	}
//	public void setStatus(String status) {
//		this.status = status;
//	}
//	public String getSummary() {
//		return summary;
//	}
//	public void setSummary(String summary) {
//		this.summary = summary;
//	}
//	public String getInternalId() {
//		return internalId;
//	}
//	public void setInternalId(String internalId) {
//		this.internalId = internalId;
//	}
//	public String getExternalLink() {
//		return externalLink;
//	}
//	public void setExternalLink(String externalLink) {
//		this.externalLink = externalLink;
//	}
//	public String getCompanyCulture() {
//		return companyCulture;
//	}
//	public void setCompanyCulture(String companyCulture) {
//		this.companyCulture = companyCulture;
//	}
//	public LocalDate getPostedAt() {
//		return postedAt;
//	}
//	public void setPostedAt(LocalDate postedAt) {
//		this.postedAt = postedAt;
//	}
//	public LocalDate getApplicationDeadline() {
//		return applicationDeadline;
//	}
//	public void setApplicationDeadline(LocalDate applicationDeadline) {
//		this.applicationDeadline = applicationDeadline;
//	}
//	
//	
//	public String getCollegeId() {
//		return collegeId;
//	}
//	public void setCollegeId(String collegeId) {
//		this.collegeId = collegeId;
//	}
//	public String getPostedBy() {
//		return postedBy;
//	}
//	public void setPostedBy(String postedBy) {
//		this.postedBy = postedBy;
//	}
//	
//	public String getPostedById() {
//		return postedById;
//	}
//	public void setPostedById(String postedById) {
//		this.postedById = postedById;
//	}
//	public Long getApplicantCount() {
//		return applicantCount;
//	}
//	public void setApplicantCount(Long applicantCount) {
//		this.applicantCount = applicantCount;
//	}
//	public BigDecimal getMinUgScore() {
//		return minUgScore;
//	}
//	public void setMinUgScore(BigDecimal minUgScore) {
//		this.minUgScore = minUgScore;
//	}
//	public BigDecimal getMin10thScore() {
//		return min10thScore;
//	}
//	public void setMin10thScore(BigDecimal min10thScore) {
//		this.min10thScore = min10thScore;
//	}
//	public BigDecimal getMin12thScore() {
//		return min12thScore;
//	}
//	public void setMin12thScore(BigDecimal min12thScore) {
//		this.min12thScore = min12thScore;
//	}
//	public Integer getMaxBacklogs() {
//		return maxBacklogs;
//	}
//	public void setMaxBacklogs(Integer maxBacklogs) {
//		this.maxBacklogs = maxBacklogs;
//	}
//	public Boolean getIsDiplomaEligible() {
//		return isDiplomaEligible;
//	}
//	public void setIsDiplomaEligible(Boolean isDiplomaEligible) {
//		this.isDiplomaEligible = isDiplomaEligible;
//	}
//	public Boolean getAllowGaps() {
//		return allowGaps;
//	}
//	public void setAllowGaps(Boolean allowGaps) {
//		this.allowGaps = allowGaps;
//	}
//	public Integer getMaxGapYears() {
//		return maxGapYears;
//	}
//	public void setMaxGapYears(Integer maxGapYears) {
//		this.maxGapYears = maxGapYears;
//	}
//	public boolean isCanEdit() {
//		return canEdit;
//	}
//	public void setCanEdit(boolean canEdit) {
//		this.canEdit = canEdit;
//	}
//	public String getAvoidListUrl() {
//		return avoidListUrl;
//	}
//	public void setAvoidListUrl(String avoidListUrl) {
//		this.avoidListUrl = avoidListUrl;
//	}
//	public List<String> getResponsibilities() {
//		return responsibilities;
//	}
//	public void setResponsibilities(List<String> responsibilities) {
//		this.responsibilities = responsibilities;
//	}
//	public List<String> getQualifications() {
//		return qualifications;
//	}
//	public void setQualifications(List<String> qualifications) {
//		this.qualifications = qualifications;
//	}
//	public List<String> getPreferredQualifications() {
//		return preferredQualifications;
//	}
//	public void setPreferredQualifications(List<String> preferredQualifications) {
//		this.preferredQualifications = preferredQualifications;
//	}
//	public List<String> getBenefits() {
//		return benefits;
//	}
//	public void setBenefits(List<String> benefits) {
//		this.benefits = benefits;
//	}
//	public List<String> getAllowedBranches() {
//		return allowedBranches;
//	}
//	public void setAllowedBranches(List<String> allowedBranches) {
//		this.allowedBranches = allowedBranches;
//	}
//	public List<String> getEligibleBatches() {
//		return eligibleBatches;
//	}
//	public void setEligibleBatches(List<String> eligibleBatches) {
//		this.eligibleBatches = eligibleBatches;
//	}
//	public List<Map<String, Object>> getRounds() {
//		return rounds;
//	}
//	public void setRounds(List<Map<String, Object>> rounds) {
//		this.rounds = rounds;
//	}
//	public List<Map<String, String>> getAttachments() {
//		return attachments;
//	}
//	public void setAttachments(List<Map<String, String>> attachments) {
//		this.attachments = attachments;
//	}
//	public List<String> getRequiredFields() {
//		return requiredFields;
//	}
//	public void setRequiredFields(List<String> requiredFields) {
//		this.requiredFields = requiredFields;
//	}
//    
//    
//    
//    
//}

package com.srots.dto.jobdto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * FIXED: JobResponseDTO
 *
 * All field names now match the types.ts Job interface EXACTLY so the frontend
 * can use them without any renaming in the service layer.
 *
 * Key fixes:
 *  - company      → companyName       (matched types.ts)
 *  - responsibilities/qualifications/etc → responsibilitiesJson / qualificationsJson / etc (matched types.ts array fields)
 *  - requiredFields   → requiredStudentFields  (matched types.ts)
 *  - attachments      → documents              (matched types.ts)
 *  - applicantCount   → kept, plus applicants[] array added
 *  - Added: formatUg, format10th, format12th, physicalDemands, eeoStatement
 *  - allowedBranches, eligibleBatches → now List<String> so frontend can use directly
 */
@Data
public class JobResponseDTO {

    // ── Core identity ──────────────────────────────────────────────────────────
    private String id;
    private String collegeId;

    // ── Basic info  (names match types.ts Job exactly) ────────────────────────
    private String title;
    private String companyName;          // was "company" – now matches types.ts
    private String hiringDepartment;
    private String jobType;              // display value: "Full Time", "Internship" ...
    private String workMode;             // display value: "Remote", "On-Site" ...
    private String location;
    private String salaryRange;
    private String summary;
    private String internalId;
    private String externalLink;
    private String companyCulture;
    private String physicalDemands;      // was missing
    private String eeoStatement;         // was missing
    private String status;               // "Active" | "Closed" | "Draft"

    // ── Dates ──────────────────────────────────────────────────────────────────
    private LocalDate applicationDeadline;
    private LocalDate postedAt;

    // ── Ownership ─────────────────────────────────────────────────────────────
    private String postedBy;             // full name string
    private String postedById;
    private boolean canEdit;
    private String avoidListUrl;

    // ── Applicant info ────────────────────────────────────────────────────────
    private Long applicantCount;         // fast count for badges
    // applicants[] (array of IDs) not sent here – fetched separately via dashboard

    // ── Eligibility (root-level, matching types.ts) ───────────────────────────
    private BigDecimal minUgScore;
    private String    formatUg;          // was missing

    private BigDecimal min10thScore;
    private String    format10th;        // was missing

    private BigDecimal min12thScore;
    private String    format12th;        // was missing

    private BigDecimal minDiplomaScore;  // was missing
    private String    formatDiploma;     // was missing

    private Integer   maxBacklogs;
    private Boolean   isDiplomaEligible;
    private Boolean   allowGaps;
    private Integer   maxGapYears;

    // ── JSON-parsed arrays  (names match types.ts array fields exactly) ────────
    // types.ts declares these as string[] – backend parses JSON strings into List<String>
    private List<String> responsibilitiesJson;         // was "responsibilities"
    private List<String> qualificationsJson;           // was "qualifications"
    private List<String> preferredQualificationsJson;  // was "preferredQualifications"
    private List<String> benefitsJson;                 // was "benefits"

    // ── Branch / batch / rounds / required fields ──────────────────────────────
    private List<String>              allowedBranches;   // parsed List (not JSON string)
    private List<String>              eligibleBatches;   // parsed List (not JSON string)
    private List<Map<String, Object>> rounds;            // parsed list
    private List<String>              requiredStudentFields; // was "requiredFields"
    private List<Map<String, String>> documents;         // was "attachments" – matches types.ts
	public JobResponseDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	public JobResponseDTO(String id, String collegeId, String title, String companyName, String hiringDepartment,
			String jobType, String workMode, String location, String salaryRange, String summary, String internalId,
			String externalLink, String companyCulture, String physicalDemands, String eeoStatement, String status,
			LocalDate applicationDeadline, LocalDate postedAt, String postedBy, String postedById, boolean canEdit,
			String avoidListUrl, Long applicantCount, BigDecimal minUgScore, String formatUg, BigDecimal min10thScore,
			String format10th, BigDecimal min12thScore, String format12th, BigDecimal minDiplomaScore,
			String formatDiploma, Integer maxBacklogs, Boolean isDiplomaEligible, Boolean allowGaps,
			Integer maxGapYears, List<String> responsibilitiesJson, List<String> qualificationsJson,
			List<String> preferredQualificationsJson, List<String> benefitsJson, List<String> allowedBranches,
			List<String> eligibleBatches, List<Map<String, Object>> rounds, List<String> requiredStudentFields,
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
    
    
    
}