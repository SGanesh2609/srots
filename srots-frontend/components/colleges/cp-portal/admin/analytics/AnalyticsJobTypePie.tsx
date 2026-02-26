import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface AnalyticsJobTypePieProps {
    data: { name: string; value: number }[];
    colors: string[];
}

export const AnalyticsJobTypePie: React.FC<AnalyticsJobTypePieProps> = ({ data, colors }) => {
    return (
        <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Job Classification</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Opportunity breakdown</p>
            </div>
            {data.length > 0 ? (
                <div className="flex-1 flex flex-col justify-between">
                    <div className="w-full h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={colors[index % colors.length]}
                                            className="hover:opacity-80 transition-opacity"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                    <p className="text-gray-400 text-sm font-bold italic">No Job Data Found</p>
                </div>
            )}
        </div>
    );
};
