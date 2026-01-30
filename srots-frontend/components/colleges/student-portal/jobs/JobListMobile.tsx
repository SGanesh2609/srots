
import React from 'react';
import { StudentJobView } from '../../../../types';
import { Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import { JobStatusBadge } from './JobStatusBadge';

/**
 * Component Name: JobListMobile
 * Directory: components/colleges/student-portal/jobs/JobListMobile.tsx
 * 
 * Functionality:
 * - Renders the list of jobs as cards for mobile/small screens.
 * - Displays Status Badges via shared component.
 * - Handles tap to view details.
 * 
 * Used In: StudentJobs
 */

interface JobListMobileProps {
    jobs: StudentJobView[];
    onSelectJob: (job: StudentJobView) => void;
}

export const JobListMobile: React.FC<JobListMobileProps> = ({ jobs, onSelectJob }) => {
    return (
        <div className="md:hidden flex-1 overflow-y-auto space-y-3 pb-20 no-scrollbar">
            {jobs.map(view => {
                const { job, isApplied } = view;
                if (!job) return null;

                return (
                    <div key={job.id} onClick={() => onSelectJob(view)} className="bg-white p-4 rounded-xl border shadow-sm active:scale-[0.98] transition-transform">
                        <div className="flex gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 border shrink-0">
                                {job.company?.[0] || '?'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-1">{job.title}</h3>
                                <p className="text-sm text-gray-500">{job.company || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="inline-block px-2.5 py-0.5 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200 font-medium">
                                {job.type}
                            </span>
                            <span className="inline-block px-2.5 py-0.5 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200 font-medium">
                                {job.workArrangement}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1 text-xs"><CalendarIcon size={12}/> Deadline: {job.applicationDeadline}</span>
                        </div>

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
        </div>
    );
};
