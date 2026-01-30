
import React, { useState, useEffect } from 'react';
import { CompanyService } from '../../../services/companyService';
import { Building, TrendingUp, Users, Briefcase } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const analytics = await CompanyService.getSystemAnalytics();
              setData(analytics);
          } catch (e) {
              console.error("Failed to load analytics", e);
          }
      };
      fetchData();
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">Loading system analytics...</div>;

  const stats = data.stats || { totalColleges: 0, activeStudents: 0, expiringAccounts: 0, totalJobs: 0 };

  return (
    <div className="space-y-8 animate-in fade-in">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Global Platform Analytics</h2>
            <p className="text-sm text-gray-500">Across all onboarded educational institutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm group hover:border-blue-300 transition-colors">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2"><Building size={14}/> Total Colleges</h3>
                <p className="text-3xl font-extrabold text-blue-600">{stats.totalColleges}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm group hover:border-indigo-300 transition-colors">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2"><Users size={14}/> Active Students</h3>
                <p className="text-3xl font-extrabold text-indigo-600">{stats.activeStudents}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm group hover:border-orange-300 transition-colors">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2"><TrendingUp size={14}/> Risk Accounts</h3>
                <p className="text-3xl font-extrabold text-orange-600">{stats.expiringAccounts}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm group hover:border-green-300 transition-colors">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2"><Briefcase size={14}/> Total Jobs</h3>
                <p className="text-3xl font-extrabold text-green-600">{stats.totalJobs}</p>
            </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Placement Performance by College</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">Top Performing</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-500 font-bold uppercase text-[10px]">
                        <tr>
                            <th className="px-6 py-4">Institute Name</th>
                            <th className="px-6 py-4">Placement Rate</th>
                            <th className="px-6 py-4">Jobs Listed</th>
                            <th className="px-6 py-4 text-right">Trend</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.leaderboard?.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 w-32">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: item.placement }}></div>
                                        </div>
                                        <span className="font-mono font-bold text-blue-600">{item.placement}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-600">{item.jobs} Positions</td>
                                <td className="px-6 py-4 text-right text-green-600 font-bold">+{Math.floor(Math.random() * 5)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
