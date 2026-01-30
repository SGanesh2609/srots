
import React, { useState, useEffect } from 'react';
import { Job, Student } from '../../../../../types';
import { Briefcase, Download, Loader2 } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

/**
 * Component Name: JobApplicantsTab
 * Directory: components/colleges/cp-portal/jobs/details/JobApplicantsTab.tsx
 * 
 * Functionality:
 * - Lists all students who have applied for the job.
 * - Shows Roll Number, Name, Branch, and current Application Status.
 * - Provides a button to export this list as CSV via `onDownloadList`.
 * - **3-Tier Sync**: Fetches data asynchronously from the backend.
 * 
 * Used In: JobDetailView
 */

interface JobApplicantsTabProps {
    job: Job;
    onDownloadList: (type: 'applicants') => void;
}

export const JobApplicantsTab: React.FC<JobApplicantsTabProps> = ({ job, onDownloadList }) => {
    const [applicants, setApplicants] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        
        const fetchApplicants = async () => {
            try {
                setLoading(true);
                // 3-Tier Sync: Await the API response from backend
                const data = await JobService.getJobApplicants(job.id);
                if (isMounted) {
                    setApplicants(data);
                }
            } catch (error) {
                console.error("Failed to fetch applicants:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchApplicants();

        return () => { isMounted = false; };
    }, [job.id]);

    if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Loading applicants...</div>;

    return (
        <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Briefcase size={20} className="text-blue-600"/><span>Applicant Directory</span><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{applicants.length}</span></h3>
                <button onClick={() => onDownloadList('applicants')} className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm transition-all"><Download size={14}/> Export CSV</button>
            </div>
            <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                            <tr><th className="px-6 py-3">Roll Number</th><th className="px-6 py-3">Name</th><th className="px-6 py-3">Branch</th><th className="px-6 py-3">Current Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {applicants.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 font-mono text-gray-600 font-medium">{student.profile?.rollNumber || 'N/A'}</td>
                                    {/* Fix: Use student.fullName instead of student.name */}
                                    <td className="px-6 py-3 font-bold text-gray-900">{student.fullName}</td>
                                    <td className="px-6 py-3 text-gray-600"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">{student.profile?.branch || 'N/A'}</span></td>
                                    <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold border ${job.studentStatus[student.id]?.includes('Passed') || job.studentStatus[student.id]?.includes('Hired') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{job.studentStatus[student.id] || 'Applied'}</span></td>
                                </tr>
                            ))}
                            {applicants.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No applicants yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="md:hidden space-y-3">
                {applicants.map(student => (
                    <div key={student.id} className="bg-white p-4 rounded-xl border shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            {/* Fix: Use student.fullName instead of student.name */}
                            <div><h4 className="font-bold text-gray-900 text-sm">{student.fullName}</h4><p className="text-xs font-mono text-gray-500 mt-0.5">{student.profile?.rollNumber || 'N/A'}</p></div>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${job.studentStatus[student.id]?.includes('Passed') || job.studentStatus[student.id]?.includes('Hired') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{job.studentStatus[student.id] || 'Applied'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-600 border border-gray-200">{student.profile?.branch || 'N/A'}</span><span className="text-xs text-gray-400 truncate flex-1 text-right">{student.email}</span></div>
                    </div>
                ))}
                {applicants.length === 0 && <div className="py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">No applicants yet.</div>}
            </div>
        </div>
    );
};
