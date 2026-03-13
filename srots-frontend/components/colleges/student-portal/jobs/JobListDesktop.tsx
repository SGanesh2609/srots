import React, { useState } from 'react';
import { StudentJobView } from '../../../../types';
import { Calendar as CalendarIcon, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { JobStatusBadge } from './JobStatusBadge';

const PAGE_SIZE = 15;

/**
 * FIXED JobListDesktop Component
 * 
 * KEY FIXES:
 * 1. Properly displays job.type and job.workArrangement (already transformed)
 * 2. Shows correct status badges
 * 3. Better null safety
 */

interface JobListDesktopProps {
    jobs: StudentJobView[];
    onSelectJob: (job: StudentJobView) => void;
    statusFilter: string;
}

export const JobListDesktop: React.FC<JobListDesktopProps> = ({ jobs, onSelectJob, statusFilter }) => {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(jobs.length / PAGE_SIZE);
    const pageJobs = jobs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    // Reset page when jobs list changes (filter applied)
    React.useEffect(() => { setPage(0); }, [jobs.length]);

    return (
        <div className="hidden md:flex flex-1 bg-white rounded-xl border shadow-sm overflow-hidden flex-col">
            <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b">Company</th>
                            <th className="px-6 py-4 border-b">Role</th>
                            <th className="px-6 py-4 border-b">Type</th>
                            <th className="px-6 py-4 border-b">Work Mode</th>
                            <th className="px-6 py-4 border-b">Deadline</th>
                            <th className="px-6 py-4 border-b text-center">Status</th>
                            <th className="px-6 py-4 border-b text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {pageJobs.map(view => {
                            const { job, isApplied, isEligible } = view;
                            if (!job) return null;
                            
                            // Visual State: Dim if not eligible and not applied
                            const rowOpacity = !isEligible && !isApplied ? 'opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100' : '';
                            
                            return (
                                <tr 
                                    key={job.id} 
                                    onClick={() => onSelectJob(view)} 
                                    className={`hover:bg-blue-50 cursor-pointer transition-all group ${rowOpacity}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 border text-xs shrink-0">
                                                {job.company?.[0] || '?'}
                                            </div>
                                            <span className="font-bold text-gray-900">{job.company || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600 group-hover:underline">
                                        {job.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 font-medium">
                                            {job.type || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                            job.workArrangement === 'Remote' ? 'bg-green-50 text-green-700 border-green-200' :
                                            job.workArrangement === 'Hybrid' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            'bg-orange-50 text-orange-700 border-orange-200'
                                        }`}>
                                            {job.workArrangement || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon size={14} className="text-gray-400"/>
                                            {job.applicationDeadline || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <JobStatusBadge view={view} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
                                            {isApplied ? 'View Status' : 'View Details'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {jobs.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                    <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No jobs found matching your criteria.</p>
                                    {statusFilter === 'for_you' && (
                                        <p className="text-xs mt-2 text-gray-500">
                                            Tip: 'For You' shows all jobs you are eligible for.
                                        </p>
                                    )}
                                    {statusFilter === 'expired' && (
                                        <p className="text-xs mt-2 text-gray-500">
                                            Note: 'Expired' shows missed opportunities you were eligible for.
                                        </p>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
                    <p className="text-xs text-gray-500">
                        Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, jobs.length)} of {jobs.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-lg border text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            const pg = totalPages <= 7 ? i : page <= 3 ? i : page >= totalPages - 4 ? totalPages - 7 + i : page - 3 + i;
                            return (
                                <button key={pg} onClick={() => setPage(pg)} className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${page === pg ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 hover:bg-white'}`}>{pg + 1}</button>
                            );
                        })}
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="p-1.5 rounded-lg border text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};