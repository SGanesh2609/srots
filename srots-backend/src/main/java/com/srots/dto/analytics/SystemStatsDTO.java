package com.srots.dto.analytics;

public class SystemStatsDTO {

    private Long totalColleges;
    private Long activeStudents;
    private Long expiringAccounts;
    private Long totalJobs;

    public SystemStatsDTO() {}

    public SystemStatsDTO(Long totalColleges, Long activeStudents, Long expiringAccounts, Long totalJobs) {
        this.totalColleges    = totalColleges;
        this.activeStudents   = activeStudents;
        this.expiringAccounts = expiringAccounts;
        this.totalJobs        = totalJobs;
    }

    public Long getTotalColleges()    { return totalColleges; }
    public Long getActiveStudents()   { return activeStudents; }
    public Long getExpiringAccounts() { return expiringAccounts; }
    public Long getTotalJobs()        { return totalJobs; }

    public void setTotalColleges(Long v)    { this.totalColleges    = v; }
    public void setActiveStudents(Long v)   { this.activeStudents   = v; }
    public void setExpiringAccounts(Long v) { this.expiringAccounts = v; }
    public void setTotalJobs(Long v)        { this.totalJobs        = v; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long totalColleges;
        private Long activeStudents;
        private Long expiringAccounts;
        private Long totalJobs;

        public Builder totalColleges(Long v)    { this.totalColleges    = v; return this; }
        public Builder activeStudents(Long v)   { this.activeStudents   = v; return this; }
        public Builder expiringAccounts(Long v) { this.expiringAccounts = v; return this; }
        public Builder totalJobs(Long v)        { this.totalJobs        = v; return this; }

        public SystemStatsDTO build() {
            return new SystemStatsDTO(totalColleges, activeStudents, expiringAccounts, totalJobs);
        }
    }
}