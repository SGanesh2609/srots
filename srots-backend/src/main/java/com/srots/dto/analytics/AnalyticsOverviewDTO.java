package com.srots.dto.analytics;

import com.srots.dto.jobdto.JobResponseDTO;
import java.util.List;

public class AnalyticsOverviewDTO {

    private List<BranchDistributionDTO> branchDistribution;
    private List<PlacementProgressDTO>  placementProgress;
    private List<JobTypeDTO>            jobTypes;
    private StatsDTO                    stats;
    private List<JobResponseDTO>        recentJobs;

    public AnalyticsOverviewDTO() {}

    public AnalyticsOverviewDTO(
            List<BranchDistributionDTO> branchDistribution,
            List<PlacementProgressDTO>  placementProgress,
            List<JobTypeDTO>            jobTypes,
            StatsDTO                    stats,
            List<JobResponseDTO>        recentJobs) {
        this.branchDistribution = branchDistribution;
        this.placementProgress  = placementProgress;
        this.jobTypes           = jobTypes;
        this.stats              = stats;
        this.recentJobs         = recentJobs;
    }

    public List<BranchDistributionDTO> getBranchDistribution() { return branchDistribution; }
    public List<PlacementProgressDTO>  getPlacementProgress()  { return placementProgress; }
    public List<JobTypeDTO>            getJobTypes()           { return jobTypes; }
    public StatsDTO                    getStats()              { return stats; }
    public List<JobResponseDTO>        getRecentJobs()         { return recentJobs; }

    public void setBranchDistribution(List<BranchDistributionDTO> v) { this.branchDistribution = v; }
    public void setPlacementProgress(List<PlacementProgressDTO> v)   { this.placementProgress  = v; }
    public void setJobTypes(List<JobTypeDTO> v)                       { this.jobTypes           = v; }
    public void setStats(StatsDTO v)                                  { this.stats              = v; }
    public void setRecentJobs(List<JobResponseDTO> v)                 { this.recentJobs         = v; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private List<BranchDistributionDTO> branchDistribution;
        private List<PlacementProgressDTO>  placementProgress;
        private List<JobTypeDTO>            jobTypes;
        private StatsDTO                    stats;
        private List<JobResponseDTO>        recentJobs;

        public Builder branchDistribution(List<BranchDistributionDTO> v) { this.branchDistribution = v; return this; }
        public Builder placementProgress(List<PlacementProgressDTO> v)   { this.placementProgress  = v; return this; }
        public Builder jobTypes(List<JobTypeDTO> v)                       { this.jobTypes           = v; return this; }
        public Builder stats(StatsDTO v)                                  { this.stats              = v; return this; }
        public Builder recentJobs(List<JobResponseDTO> v)                 { this.recentJobs         = v; return this; }

        public AnalyticsOverviewDTO build() {
            return new AnalyticsOverviewDTO(branchDistribution, placementProgress, jobTypes, stats, recentJobs);
        }
    }
}