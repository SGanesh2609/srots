package com.srots.dto.collegedto;

/**
 * Response DTO for GET /api/v1/colleges/{id}/stats
 */
public class CollegeStatsDTO {

    private long studentCount;
    private long cpCount;
    private long totalJobs;
    private long activeJobs;

    public CollegeStatsDTO() {}

    public CollegeStatsDTO(long studentCount, long cpCount, long totalJobs, long activeJobs) {
        this.studentCount = studentCount;
        this.cpCount      = cpCount;
        this.totalJobs    = totalJobs;
        this.activeJobs   = activeJobs;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public long getStudentCount() { return studentCount; }
    public void setStudentCount(long studentCount) { this.studentCount = studentCount; }

    public long getCpCount() { return cpCount; }
    public void setCpCount(long cpCount) { this.cpCount = cpCount; }

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getActiveJobs() { return activeJobs; }
    public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }
}