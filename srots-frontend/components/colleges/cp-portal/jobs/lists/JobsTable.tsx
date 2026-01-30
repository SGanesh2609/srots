
import React from 'react';
import { Job, User } from '../../../../../types';
import { Briefcase, Edit2, Trash2 } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

/**
 * Component Name: JobsTable
 * Directory: components/colleges/cp-portal/jobs/lists/JobsTable.tsx
 * 
 * Functionality:
 * - Renders the list of jobs in a responsive table format.
 * - Handles the click event to open job details (`onSelect`).
 * - Provides "Edit" and "Delete" actions based on user permissions.
 * - Displays a "No Jobs Found" empty state.
 * 
 * Used In: JobsSection (List View)
 */

interface JobsTableProps {
    jobs: Job[];
    user: User;
    onSelect: (job: Job) => void;
    onEdit: (e: React.MouseEvent, job: Job) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
}

export const JobsTable: React.FC<JobsTableProps> = ({ jobs, user, onSelect, onEdit, onDelete }) => {
    return (
        <div className="flex-1 overflow-hidden bg-white rounded-xl border shadow-sm flex flex-col">
            <div className="overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b">Company</th>
                            <th className="px-6 py-4 border-b">Job Title</th>
                            <th className="px-6 py-4 border-b">Type</th>
                            <th className="px-6 py-4 border-b text-center">Rounds</th>
                            <th className="px-6 py-4 border-b">Created At</th>
                            <th className="px-6 py-4 border-b">Deadline</th>
                            <th className="px-6 py-4 border-b text-center">Applicants</th>
                            <th className="px-6 py-4 border-b">Created By</th>
                            <th className="px-6 py-4 border-b">Status</th>
                            <th className="px-6 py-4 border-b text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {jobs.map(job => (
                            <tr key={job.id} onClick={() => onSelect(job)} className="hover:bg-blue-50 cursor-pointer transition-colors group">
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">{job.company[0]}</div>
                                    {job.company}
                                </td>
                                <td className="px-6 py-4 font-bold text-blue-600 group-hover:underline">{job.title}</td>
                                <td className="px-6 py-4 text-gray-600">{job.type}</td>
                                <td className="px-6 py-4 text-center font-mono">{job.rounds.length}</td>
                                <td className="px-6 py-4 text-gray-500 text-xs">{job.postedAt}</td>
                                <td className="px-6 py-4 text-red-600 font-medium text-xs">{job.applicationDeadline}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                                        {job.applicants.length}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-xs">{job.postedBy}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right relative z-20">
                                    {JobService.canManageJob(user, job) && (
                                        <>
                                            <button 
                                                type="button" 
                                                onClick={(e) => onEdit(e, job)} 
                                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors mr-1" 
                                                title="Edit Job"
                                            >
                                                <Edit2 size={16} className="pointer-events-none"/>
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={(e) => onDelete(e, job.id)} 
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                                                title="Delete Job"
                                            >
                                                <Trash2 size={16} className="pointer-events-none"/>
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {jobs.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                                    <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No jobs found matching your criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
