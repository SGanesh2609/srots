
import React from 'react';
import { Job } from '../../../../../types';

/**
 * Component Name: AnalyticsRecentJobs
 * Directory: components/colleges/cp-portal/admin/analytics/AnalyticsRecentJobs.tsx
 */

interface AnalyticsRecentJobsProps {
    jobs: Job[];
}

export const AnalyticsRecentJobs: React.FC<AnalyticsRecentJobsProps> = ({ jobs }) => {
    // Safety check to filter out any undefined/null jobs in the array
    const validJobs = (jobs || []).filter(j => !!j).slice(0, 5);

    return (
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Recent Job Postings</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-xs text-gray-500 font-bold uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Company</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Posted</th>
                            <th className="px-4 py-3 rounded-tr-lg">Applicants</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {validJobs.map(job => (
                            <tr key={job.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-bold text-gray-800">{job.company || 'N/A'}</td>
                                <td className="px-4 py-3 text-gray-500">{job.title || 'Untitled'}</td>
                                <td className="px-4 py-3 text-gray-500">{job.postedAt || '-'}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                        {job.applicants?.length || 0}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {validJobs.length === 0 && <tr><td colSpan={4} className="px-4 py-3 text-center text-gray-400">No jobs posted yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
