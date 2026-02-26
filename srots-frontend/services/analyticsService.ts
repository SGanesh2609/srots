import api from './api';

// ── Backend DTO types (mirror of Java DTOs) ────────────────────────────────

export interface BranchDistribution {
    name: string;
    count: number;
}

export interface PlacementProgress {
    year?: number;
    month?: number;
    label: string;   // e.g. "January"
    value: number;   // placed count
}

export interface JobType {
    name: string;
    count: number;
}

export interface OverviewStats {
    totalStudents: number;
    placedStudents: number;
    placementRate: number;
    companiesVisited: number;
}

/** Matches JobResponseDTO fields used in the analytics recent-jobs list */
export interface AnalyticsRecentJob {
    id: string;
    title: string;
    companyName: string;   // backend sends companyName
    postedAt: string;
    applicants?: any[];    // full applicant list if present
    applicantCount?: number;
}

/** Response shape from GET /api/v1/analytics/overview */
export interface AnalyticsOverviewResponse {
    branchDistribution: BranchDistribution[];
    placementProgress: PlacementProgress[];
    jobTypes: JobType[];
    stats: OverviewStats;
    recentJobs: AnalyticsRecentJob[];
}

export interface SystemStats {
    totalColleges: number;
    activeStudents: number;
    expiringAccounts: number;
    totalJobs: number;
}

export interface LeaderboardEntry {
    name: string;
    placement: string;   // e.g. "85%"
    jobs: number;
}

/** Response shape from GET /api/v1/analytics/system */
export interface SystemAnalyticsResponse {
    stats: SystemStats;
    leaderboard: LeaderboardEntry[];
    placementProgress: PlacementProgress[];
    branchDistribution: BranchDistribution[];
}

// ── API calls ──────────────────────────────────────────────────────────────

export const AnalyticsService = {

    /**
     * getOverview — scoped by backend based on authenticated user's role.
     * CPH/STAFF → college-scoped
     * ADMIN/SROTS_DEV → system-wide
     */
    async getOverview(): Promise<AnalyticsOverviewResponse> {
        try {
            const res = await api.get('/analytics/overview');

            if (!res.data) throw new Error('Empty response from analytics server');

            return {
                branchDistribution: res.data.branchDistribution ?? [],
                placementProgress:  res.data.placementProgress  ?? [],
                jobTypes:           res.data.jobTypes           ?? [],
                stats: res.data.stats ?? {
                    totalStudents:   0,
                    placedStudents:  0,
                    placementRate:   0,
                    companiesVisited: 0,
                },
                recentJobs: res.data.recentJobs ?? [],
            };
        } catch (error: any) {
            console.error('Error fetching analytics overview:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * getSystemAnalytics — for ADMIN / SROTS_DEV only.
     */
    async getSystemAnalytics(): Promise<SystemAnalyticsResponse> {
        try {
            const res = await api.get('/analytics/system');

            if (!res.data) throw new Error('Empty response from platform analytics');

            return {
                stats: res.data.stats ?? {
                    totalColleges:    0,
                    activeStudents:   0,
                    expiringAccounts: 0,
                    totalJobs:        0,
                },
                leaderboard:       res.data.leaderboard        ?? [],
                placementProgress: res.data.placementProgress  ?? [],
                branchDistribution: res.data.branchDistribution ?? [],
            };
        } catch (error: any) {
            console.error('Error fetching system analytics:', error.response?.data || error.message);
            throw error;
        }
    },
};