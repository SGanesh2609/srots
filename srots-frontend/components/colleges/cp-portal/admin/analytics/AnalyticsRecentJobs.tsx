import React from 'react';
import { ExternalLink } from 'lucide-react';

/** Self-contained shape — normalized in AnalyticsDashboard before passing here */
interface RecentJobRow {
    id: string;
    title: string;
    company: string;
    postedAt: string;
    applicants?: any[];
}

interface AnalyticsRecentJobsProps {
    jobs: RecentJobRow[];
}

export const AnalyticsRecentJobs: React.FC<AnalyticsRecentJobsProps> = ({ jobs }) => {
    const validJobs = (jobs || []).filter(Boolean).slice(0, 5);

    return (
        <div className="lg:col-span-2 bg-white p-7 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6 px-1">
                <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">
                        Recent Postings
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                        Latest recruitment drives
                    </p>
                </div>
                <button className="text-xs font-black text-blue-600 hover:text-blue-700 underline flex items-center gap-1 uppercase tracking-tighter transition-colors">
                    View Pipeline <ExternalLink size={12} />
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-50">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                            <th className="px-5 py-4">Corporate Partner</th>
                            <th className="px-5 py-4">Designation</th>
                            <th className="px-5 py-4">Timeline</th>
                            <th className="px-5 py-4 text-right">Applicants</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {validJobs.length > 0 ? (
                            validJobs.map((job) => (
                                <tr
                                    key={job.id}
                                    className="hover:bg-blue-50/30 transition-all group"
                                >
                                    <td className="px-5 py-4 font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                                        {job.company || 'Legacy Partner'}
                                    </td>
                                    <td className="px-5 py-4 text-xs font-bold text-gray-500">
                                        {job.title || 'Untitled Role'}
                                    </td>
                                    <td className="px-5 py-4 text-xs font-medium text-gray-400 italic">
                                        {job.postedAt
                                            ? new Date(job.postedAt).toLocaleDateString('en-IN', {
                                                  day:   '2-digit',
                                                  month: 'short',
                                                  year:  'numeric',
                                              })
                                            : 'Recently'}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                            {job.applicants?.length ?? 0}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-5 py-12 text-center text-gray-400 font-bold italic text-sm"
                                >
                                    No active recruitment drives found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};