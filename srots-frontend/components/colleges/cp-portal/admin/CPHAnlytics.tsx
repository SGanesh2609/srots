// components/colleges/cp-portal/admin/analytics/CPHAnalytics.tsx
// Assuming this is a new file for CPH analytics dashboard

import React, { useState, useEffect } from 'react';
import { AnalyticsService, AnalyticsOverviewResponse } from '../../../../services/analyticsService';
import { Users, Briefcase, TrendingUp, Building, RefreshCw, AlertCircle } from 'lucide-react';
import { AnalyticsChartsRow } from '../admin/analytics/AnalyticsChartsRow'; // CPH version
import { AnalyticsJobTypePie } from '../admin/analytics/AnalyticsJobTypePie';
import { AnalyticsRecentJobs } from '../admin/analytics/AnalyticsRecentJobs';
import { AnalyticsStatsGrid } from '../admin/analytics/AnalyticsStatsGrid';

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export const CPHAnalytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const analytics = await AnalyticsService.getOverview();
            setData(analytics);
        } catch (e: any) {
            console.error("Failed to load analytics", e);
            setError(e.response?.data?.message || e.message || "Failed to connect to analytics server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 p-1">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                    <Skeleton className="h-[300px] w-full rounded-2xl lg:col-span-2" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-red-100 shadow-sm">
                <div className="p-4 bg-red-50 rounded-full mb-4">
                    <AlertCircle className="text-red-500" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Analytics Error</h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">{error}</p>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    <RefreshCw size={16} /> Retry Now
                </button>
            </div>
        );
    }

    const stats = data?.stats || { totalStudents: 0, placedStudents: 0, placementRate: 0, companiesVisited: 0 };

    // Mapped Stats for Grid
    const mappedStats = [
        {
            label: 'Enrolled Talent',
            value: stats.totalStudents.toLocaleString(),
            change: '+12%',
            icon: Users,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Placed Professionals',
            value: stats.placedStudents.toLocaleString(),
            change: '+8%',
            icon: Briefcase,
            color: 'text-green-500',
            bg: 'bg-green-50'
        },
        {
            label: 'Success Ratio',
            value: `${stats.placementRate.toFixed(1)}%`,
            change: '+2.5%',
            icon: TrendingUp,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            label: 'Corporate Visits',
            value: stats.companiesVisited.toLocaleString(),
            change: '+15%',
            icon: Building,
            color: 'text-orange-500',
            bg: 'bg-orange-50'
        }
    ];

    // Mapped Data for Charts
    const progressData = (data?.placementProgress || []).map((item: any) => ({
        name: item.label || item.month || item.name || "N/A",
        placed: item.value || item.count || item.placed || 0
    }));

    const branchData = (data?.branchDistribution || []).map((item: any) => ({
        name: item.name || item.label || item.branch || "Unknown",
        count: item.count || item.value || item.students || 0
    }));

    const jobTypesData = (data?.jobTypes || []).map((item: any) => ({
        name: item.name,
        value: item.count || 0
    }));

    const recentJobs = data?.recentJobs || [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Placement Insights</h2>
                <p className="text-gray-500 font-medium">College-wide overview of recruitment activities.</p>
            </div>

            {/* Stats Grid */}
            <AnalyticsStatsGrid stats={mappedStats} />

            {/* Charts Row */}
            <AnalyticsChartsRow progressData={progressData} branchData={branchData} />

            {/* Job Types and Recent Jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <AnalyticsJobTypePie data={jobTypesData} colors={COLORS} />
                <AnalyticsRecentJobs jobs={recentJobs} />
            </div>
        </div>
    );
};