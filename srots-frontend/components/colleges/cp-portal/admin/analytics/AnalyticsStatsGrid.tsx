
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
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group overflow-hidden relative">
                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 ${stat.bg} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`}></div>

                    <div className="flex justify-between items-start relative z-10">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color} opacity-70`}>{stat.change}</span>
                    </div>

                    <div className="mt-6 relative z-10">
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
                        <p className="text-3xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                            {stat.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
