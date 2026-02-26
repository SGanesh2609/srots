package com.srots.dto.analytics;

import java.util.List;

public class SystemAnalyticsDTO {

    private SystemStatsDTO             stats;
    private List<LeaderboardDTO>       leaderboard;
    private List<PlacementProgressDTO> placementProgress;
    private List<BranchDistributionDTO> branchDistribution;

    public SystemAnalyticsDTO() {}

    public SystemAnalyticsDTO(
            SystemStatsDTO              stats,
            List<LeaderboardDTO>        leaderboard,
            List<PlacementProgressDTO>  placementProgress,
            List<BranchDistributionDTO> branchDistribution) {
        this.stats              = stats;
        this.leaderboard        = leaderboard;
        this.placementProgress  = placementProgress;
        this.branchDistribution = branchDistribution;
    }

    public SystemStatsDTO              getStats()              { return stats; }
    public List<LeaderboardDTO>        getLeaderboard()        { return leaderboard; }
    public List<PlacementProgressDTO>  getPlacementProgress()  { return placementProgress; }
    public List<BranchDistributionDTO> getBranchDistribution() { return branchDistribution; }

    public void setStats(SystemStatsDTO v)                                { this.stats              = v; }
    public void setLeaderboard(List<LeaderboardDTO> v)                    { this.leaderboard        = v; }
    public void setPlacementProgress(List<PlacementProgressDTO> v)        { this.placementProgress  = v; }
    public void setBranchDistribution(List<BranchDistributionDTO> v)      { this.branchDistribution = v; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private SystemStatsDTO              stats;
        private List<LeaderboardDTO>        leaderboard;
        private List<PlacementProgressDTO>  placementProgress;
        private List<BranchDistributionDTO> branchDistribution;

        public Builder stats(SystemStatsDTO v)                          { this.stats              = v; return this; }
        public Builder leaderboard(List<LeaderboardDTO> v)             { this.leaderboard        = v; return this; }
        public Builder placementProgress(List<PlacementProgressDTO> v) { this.placementProgress  = v; return this; }
        public Builder branchDistribution(List<BranchDistributionDTO> v){ this.branchDistribution = v; return this; }

        public SystemAnalyticsDTO build() {
            return new SystemAnalyticsDTO(stats, leaderboard, placementProgress, branchDistribution);
        }
    }
}