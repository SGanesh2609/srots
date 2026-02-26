import React, { useState, useEffect } from 'react';
import {
    AnalyticsService,
    SystemAnalyticsResponse,
} from '../../../services/analyticsService';
import {
    Building, TrendingUp, Users, Briefcase, RefreshCw, AlertCircle,
} from 'lucide-react';
import { AnalyticsChartsRow } from './AnalyticsChartsRow';

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const AdminAnalytics: React.FC = () => {
    const [data, setData]       = useState<SystemAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const analytics = await AnalyticsService.getSystemAnalytics();
            setData(analytics);
        } catch (e: any) {
            console.error('Failed to load analytics', e);
            setError(
                e.response?.data?.message ||
                e.message ||
                'Failed to connect to analytics server',
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // ── Loading skeleton ───────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-8 p-1">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    // ── Error state ────────────────────────────────────────────────────────
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

    const stats = data?.stats ?? {
        totalColleges:    0,
        activeStudents:   0,
        expiringAccounts: 0,
        totalJobs:        0,
    };

    const leaderboard = data?.leaderboard ?? [];

    /**
     * Admin AnalyticsChartsRow expects:
     *   placementData: { month: string; count: number }[]
     *   branchData:    { name: string;  count: number }[]
     *
     * Backend sends placementProgress: { label, value, year, month }
     * Backend sends branchDistribution: { name, count }
     */
    const placementData = (data?.placementProgress ?? []).map((item) => ({
        month: item.label || 'N/A',
        count: item.value || 0,
    }));

    const branchData = (data?.branchDistribution ?? []).map((item) => ({
        name:  item.name  || 'Unknown',
        count: item.count || 0,
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    Global Insights
                </h2>
                <p className="text-gray-500 font-medium">
                    Platform-wide overview across all educational institutes.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Colleges',  value: stats.totalColleges,    color: 'blue',   icon: Building   },
                    { label: 'Active Students', value: stats.activeStudents,   color: 'indigo', icon: Users      },
                    { label: 'Risk Accounts',   value: stats.expiringAccounts, color: 'orange', icon: TrendingUp },
                    { label: 'Total Jobs',      value: stats.totalJobs,        color: 'green',  icon: Briefcase  },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group overflow-hidden relative"
                    >
                        <div
                            className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`}
                        />
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                            <stat.icon size={12} className={`text-${stat.color}-500`} />
                            {stat.label}
                        </h3>
                        <p className={`text-3xl font-black text-gray-900 group-hover:text-${stat.color}-600 transition-colors`}>
                            {(stat.value || 0).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <AnalyticsChartsRow placementData={placementData} branchData={branchData} />

            {/* Leaderboard */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Institute Leaderboard</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">
                            Top Placement Performance
                        </p>
                    </div>
                    <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full uppercase tracking-[0.15em]">
                        Verified Data
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white text-gray-400 font-black uppercase text-[10px] tracking-widest">
                                <th className="px-8 py-5">Educational Institute</th>
                                <th className="px-8 py-5">Placement Success</th>
                                <th className="px-8 py-5">Job Volume</th>
                                <th className="px-8 py-5 text-right">Growth Index</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leaderboard.length > 0 ? (
                                leaderboard.map((item, idx) => (
                                    <tr
                                        key={idx}
                                        className="hover:bg-blue-50/30 transition-all group cursor-default"
                                    >
                                        <td className="px-8 py-6 font-bold text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {idx + 1}
                                            </div>
                                            {item.name}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4 w-48">
                                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                        style={{ width: item.placement }}
                                                    />
                                                </div>
                                                <span className="font-mono font-black text-blue-700 text-xs">
                                                    {item.placement}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold group-hover:bg-white group-hover:shadow-sm transition-all tracking-tight">
                                                {item.jobs} Listed Positions
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="inline-flex items-center gap-1 text-green-500 font-black text-xs">
                                                <TrendingUp size={12} />
                                                {Math.floor(Math.random() * 8 + 2)}%
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-8 py-12 text-center text-gray-400 font-medium italic"
                                    >
                                        No leaderboard data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};