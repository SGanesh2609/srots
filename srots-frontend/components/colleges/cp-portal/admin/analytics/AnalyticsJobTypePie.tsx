
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

/**
 * Component Name: AnalyticsJobTypePie
 * Directory: components/colleges/cp-portal/admin/analytics/AnalyticsJobTypePie.tsx
 * 
 * Functionality:
 * - Renders a Pie Chart showing the distribution of Job Types (Full-Time, Internship, etc.).
 * - Displays a legend with counts below the chart.
 * 
 * Used In: AnalyticsDashboard
 */

interface AnalyticsJobTypePieProps {
    data: { name: string; value: number }[];
    colors: string[];
}

export const AnalyticsJobTypePie: React.FC<AnalyticsJobTypePieProps> = ({ data, colors }) => {
    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center justify-center">
            <h3 className="font-bold text-gray-800 mb-6 w-full text-left">Job Types Distribution</h3>
            {data.length > 0 ? (
                <>
                  <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={data}
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                  ))}
                              </Pie>
                              <Tooltip />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 text-xs font-bold text-gray-500 justify-center">
                      {data.map((entry, index) => (
                          <div key={index} className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                              {entry.name} ({entry.value})
                          </div>
                      ))}
                  </div>
                </>
            ) : (
                <div className="text-gray-400 text-sm">No job data available.</div>
            )}
        </div>
    );
};
