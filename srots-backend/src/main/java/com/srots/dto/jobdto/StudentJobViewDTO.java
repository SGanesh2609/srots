package com.srots.dto.jobdto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * StudentJobViewDTO — response object for the student portal job list.
 *
 * IMPORTANT: Uses JobResponseDTO (not the raw Job entity) so that all parsed
 * arrays (rounds, documents, requiredStudentFields) are available to the frontend
 * as typed lists, not raw JSON strings.
 */
@Data
@NoArgsConstructor
public class StudentJobViewDTO {

    /** Fully mapped job response — never the raw entity. */
    private JobResponseDTO job;

    /** True if the student meets all eligibility criteria. */
    private boolean eligible;

    /** Human-readable reason for ineligibility (empty string when eligible). */
    private String notEligibilityReason;

    /** True if the student has submitted an application (status ≠ Not_Interested). */
    private boolean applied;

    /** True if the application deadline has passed. */
    private boolean expired;

    /** True if the student explicitly marked this job as Not Interested. */
    private boolean notInterested;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public JobResponseDTO getJob() { return job; }
    public void setJob(JobResponseDTO job) { this.job = job; }

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public String getNotEligibilityReason() { return notEligibilityReason; }
    public void setNotEligibilityReason(String notEligibilityReason) { this.notEligibilityReason = notEligibilityReason; }

    public boolean isApplied() { return applied; }
    public void setApplied(boolean applied) { this.applied = applied; }

    public boolean isExpired() { return expired; }
    public void setExpired(boolean expired) { this.expired = expired; }

    public boolean isNotInterested() { return notInterested; }
    public void setNotInterested(boolean notInterested) { this.notInterested = notInterested; }
}
