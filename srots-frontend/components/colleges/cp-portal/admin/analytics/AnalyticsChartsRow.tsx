
import React from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

/**
 * Component Name: AnalyticsChartsRow
 * Directory: components/colleges/cp-portal/admin/analytics/AnalyticsChartsRow.tsx
 * 
 * Functionality:
 * - Renders a two-column grid containing two bar charts:
 *   1. Student Distribution by Branch.
 *   2. Placement Progress (Projected/Monthly).
 * 
 * Used In: AnalyticsDashboard
 */

interface AnalyticsChartsRowProps {
    branchData: { name: string; count: number }[];
    progressData: { name: string; placed: number }[];
}

interface SimpleBarChartProps {
    title: string;
    data: any[];
    dataKey: string;
    color: string;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ title, data, dataKey, color }) => (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-bold text-gray-800 mb-6">{title}</h3>
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <Tooltip 
                        cursor={{ fill: '#f3f4f6' }} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const AnalyticsChartsRow: React.FC<AnalyticsChartsRowProps> = ({ branchData, progressData }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleBarChart 
                title="Student Distribution (Branch)" 
                data={branchData} 
                dataKey="count" 
                color="#4f46e5" 
            />
            <SimpleBarChart 
                title="Placement Progress (Projected)" 
                data={progressData} 
                dataKey="placed" 
                color="#10b981" 
            />
        </div>
    );
};
