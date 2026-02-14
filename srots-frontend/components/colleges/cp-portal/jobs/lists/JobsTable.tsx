import React from 'react';
import { Job, User, Role } from '../../../../../types';
import { Briefcase, Edit2, Trash2, Calendar, Users, MapPin, Eye } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

/**
 * Component Name: JobsTable
 * Directory: components/colleges/cp-portal/jobs/lists/JobsTable.tsx
 * 
 * Functionality:
 * - Renders a list of recruitment drives.
 * - Actions (Edit, Delete, Details) are now static and always visible.
 * - Permissions:
 *    - CPH: Can edit/delete any job.
 *    - STAFF: Can edit/delete only their own jobs.
 *    - BOTH: Can view details.
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
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-gray-50 text-gray-500 font-bold text-[10px] uppercase tracking-wider border-b">
                        <tr>
                            <th className="px-6 py-4 w-[25%]">Company & Position</th>
                            <th className="px-6 py-4 w-[15%]">Type / Mode</th>
                            <th className="px-6 py-4 w-[15%]">Key Dates</th>
                            <th className="px-6 py-4 w-[10%] text-center">Applicants</th>
                            <th className="px-6 py-4 w-[15%]">Status</th>
                            <th className="px-6 py-4 w-[20%] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {jobs.map(job => {
                            // Logic Tier 2: Check if current user has permission to modify this specific job
                            const canManage = JobService.canManageJob(user, job);
                            
                            return (
                                <tr key={job.id} onClick={() => onSelect(job)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-blue-600 border shadow-inner shrink-0 uppercase">
                                                {job.company ? job.company[0] : '?'}
                                            </div>
                                            <div className="truncate max-w-[200px]">
                                                <span className="font-bold text-gray-900 block truncate leading-none mb-1 group-hover:text-blue-600 transition-colors" title={job.title}>{job.title}</span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Briefcase size={10}/> {job.company}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold uppercase border">{job.type}</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1 font-medium"><MapPin size={10}/> {job.workArrangement}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs space-y-1">
                                            <div className="flex items-center gap-1.5 text-gray-500"><Calendar size={12}/> <span className="font-medium">Ends:</span> <span className="text-red-600 font-bold">{job.applicationDeadline}</span></div>
                                            <div className="text-[10px] text-gray-400 font-medium">Posted: {job.postedAt}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100">
                                                {job.applicants?.length || 0}
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-1 font-bold uppercase">Total</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border tracking-wider ${job.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                {job.status}
                                            </span>
                                            <div className="text-[10px] text-gray-400 flex items-center gap-1"><Users size={10}/> By {job.postedBy}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {/* Action container: Removed hover-only opacity classes */}
                                        <div className="flex justify-end items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                            
                                            {/* Management Actions: Only for CPH or the job owner */}
                                            {canManage && (
                                                <div className="flex gap-1.5 border-r border-gray-200 pr-2 mr-1">
                                                    <button 
                                                        onClick={(e) => onEdit(e, job)} 
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent transition-all" 
                                                        title="Edit Recruitment"
                                                    >
                                                        <Edit2 size={16}/>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => onDelete(e, job.id)} 
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-transparent transition-all" 
                                                        title="Delete Recruitment"
                                                    >
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            )}

                                            {/* Details Action: Always visible for both roles */}
                                            <button 
                                                onClick={() => onSelect(job)} 
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                                            >
                                                <Eye size={14} /> Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {jobs.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic bg-gray-50/50">
                                <div className="flex flex-col items-center">
                                    <Briefcase size={40} className="mb-3 opacity-20"/>
                                    <p className="font-bold text-gray-500">No jobs found.</p>
                                    <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
                                </div>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};