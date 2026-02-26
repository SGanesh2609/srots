import React from 'react';
import {
    ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid
} from 'recharts';

interface AnalyticsChartsRowProps {
    branchData: { name: string; count: number }[];
    progressData: { name: string; placed: number }[];
}

const PremiumBarChart: React.FC<{ title: string; subtitle: string; data: any[]; dataKey: string; color: string }> = ({
    title, subtitle, data, dataKey, color
}) => (
    <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-6">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">{title}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{subtitle}</p>
        </div>
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    />
                    <Tooltip
                        cursor={{ fill: '#f1f5f9', radius: 4 }}
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                        }}
                        itemStyle={{ fontWeight: 800, color: '#1e293b' }}
                    />
                    <Bar
                        dataKey={dataKey}
                        fill={color}
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                        className="transition-all duration-300 hover:opacity-80"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const AnalyticsChartsRow: React.FC<AnalyticsChartsRowProps> = ({ branchData, progressData }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PremiumBarChart
                title="Departmental Density"
                subtitle="Student distribution by branch"
                data={branchData}
                dataKey="count"
                color="#6366f1"
            />
            <PremiumBarChart
                title="Recruitment Velocity"
                subtitle="Monthly placement trajectory"
                data={progressData}
                dataKey="placed"
                color="#10b981"
            />
        </div>
    );
};
