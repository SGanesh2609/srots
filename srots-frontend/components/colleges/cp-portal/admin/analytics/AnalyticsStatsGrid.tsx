
import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Component Name: AnalyticsStatsGrid
 * Directory: components/colleges/cp-portal/admin/analytics/AnalyticsStatsGrid.tsx
 * 
 * Functionality:
 * - Renders a grid of 4 cards displaying key placement metrics.
 * - Each card shows a label, value, icon, and a small tag/badge.
 * 
 * Used In: AnalyticsDashboard
 */

interface StatItem {
    label: string;
    value: string;
    change: string;
    icon: LucideIcon;
    color: string;
    bg: string;
}

interface AnalyticsStatsGridProps {
    stats: StatItem[];
}

export const AnalyticsStatsGrid: React.FC<AnalyticsStatsGridProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600`}>
                            {stat.change}
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};
