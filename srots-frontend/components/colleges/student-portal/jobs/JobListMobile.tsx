import React, { useState } from 'react';
import { StudentJobView } from '../../../../types';
import { Calendar as CalendarIcon, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { JobStatusBadge } from './JobStatusBadge';

const PAGE_SIZE = 10;

/**
 * FIXED JobListMobile Component
 * 
 * KEY FIXES:
 * 1. Properly displays job.type and job.workArrangement (already transformed)
 * 2. Shows correct status badges
 * 3. Better null safety
 */

interface JobListMobileProps {
    jobs: StudentJobView[];
    onSelectJob: (job: StudentJobView) => void;
}

export const JobListMobile: React.FC<JobListMobileProps> = ({ jobs, onSelectJob }) => {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(jobs.length / PAGE_SIZE);
    const pageJobs = jobs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    React.useEffect(() => { setPage(0); }, [jobs.length]);

    return (
        <div className="md:hidden flex-1 overflow-y-auto space-y-3 pb-4 no-scrollbar">
            {pageJobs.map(view => {
                const { job, isApplied } = view;
                if (!job) return null;

                return (
                    <div 
                        key={job.id} 
                        onClick={() => onSelectJob(view)} 
                        className="bg-white p-4 rounded-xl border shadow-sm active:scale-[0.98] transition-transform"
                    >
                        <div className="flex gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 border shrink-0">
                                {job.company?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 line-clamp-1">{job.title}</h3>
                                <p className="text-sm text-gray-500">{job.company || 'N/A'}</p>
                            </div>
                        </div>
                        
                        {/* Type and Work Mode Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 font-medium">
                                {job.type || 'N/A'}
                            </span>
                            <span className={`inline-block px-2.5 py-0.5 text-xs rounded border font-medium ${
                                job.workArrangement === 'Remote' ? 'bg-green-50 text-green-700 border-green-200' :
                                job.workArrangement === 'Hybrid' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                                {job.workArrangement || 'N/A'}
                            </span>
                        </div>

                        {/* Deadline */}
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1 text-xs">
                                <CalendarIcon size={12}/> 
                                Deadline: {job.applicationDeadline || 'N/A'}
                            </span>
                        </div>

                        {/* Status and Action */}
                        <div className="flex justify-between items-center pt-3 border-t">
                            <JobStatusBadge view={view} />
                            <button className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">
                                {isApplied ? 'Track Status' : 'View Details'}
                            </button>
                        </div>
                    </div>
                );
            })}
            {jobs.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed">
                    <Briefcase size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No jobs found.</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between py-2">
                    <p className="text-xs text-gray-500">
                        {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, jobs.length)} of {jobs.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pg = totalPages <= 5 ? i : page <= 2 ? i : page >= totalPages - 3 ? totalPages - 5 + i : page - 2 + i;
                            return (
                                <button key={pg} onClick={() => setPage(pg)} className={`w-7 h-7 rounded-lg text-xs font-bold border ${page === pg ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>{pg + 1}</button>
                            );
                        })}
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="p-1.5 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};