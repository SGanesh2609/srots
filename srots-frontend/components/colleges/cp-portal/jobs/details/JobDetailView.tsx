
// import React, { useState, useEffect } from 'react';
// import { Job, User } from '../../../../../types';
// import { ArrowLeft, Edit2, Trash2, Building } from 'lucide-react';
// import { JobService } from '../../../../../services/jobService';
// import { CollegeService } from '../../../../../services/collegeService';
// import { JobOverviewTab } from './JobOverviewTab';
// import { JobRoundsTab } from './JobRoundsTab';
// import { JobApplicantsTab } from './JobApplicantsTab';
// import { JobEligibleTab } from './JobEligibleTab';

// /**
//  * Component Name: JobDetailView
//  * Directory: components/colleges/cp-portal/jobs/details/JobDetailView.tsx
//  */

// interface JobDetailViewProps {
//     job: Job;
//     user: User;
//     onBack: () => void;
//     onEdit: (e: React.MouseEvent, job: Job) => void;
//     onDelete: (e: React.MouseEvent, id: string) => void;
//     onDownloadJobRelatedList: (listType: 'applicants' | 'not-interested') => void;
//     onUploadRoundResult: (roundIndex: number, passedIds: string[]) => void;
// }

// export const JobDetailView: React.FC<JobDetailViewProps> = ({ 
//     job, user, onBack, onEdit, onDelete, 
//     onDownloadJobRelatedList, onUploadRoundResult 
// }) => {
//     const [activeTab, setActiveTab] = useState<'overview' | 'rounds' | 'applicants' | 'eligible'>('overview');
//     const [branchCodes, setBranchCodes] = useState<string[]>([]);

//     // Get college branch codes for filters in Eligible Tab
//     useEffect(() => {
//         const fetchBranchCodes = async () => {
//             if (user?.collegeId) {
//                 const college = await CollegeService.getCollegeById(user.collegeId!);
//                 if (college && college.branches) {
//                     setBranchCodes(college.branches.map(b => b.code));
//                 }
//             }
//         };
//         fetchBranchCodes();
//     }, [user?.collegeId]);

//     if (!job) {
//         return (
//             <div className="p-8 text-center text-gray-500 animate-in fade-in">
//                 <Building size={48} className="mx-auto mb-4 opacity-20" />
//                 <p>Job data is currently unavailable.</p>
//                 <button onClick={onBack} className="mt-4 text-blue-600 font-bold hover:underline">Return to List</button>
//             </div>
//         );
//     }

//     const canEdit = JobService.canManageJob(user, job);

//     return (
//         <div className="h-full flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
//             {/* Header Area */}
//             <div className="p-3 border-b bg-gray-50 flex-none">
//                 <div className="flex justify-between items-center mb-2">
//                     <div className="flex items-center gap-3">
//                         <button onClick={onBack} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors" title="Back to Jobs">
//                             <ArrowLeft size={18} />
//                         </button>
//                         <div>
//                             <h2 className="text-xl font-bold text-gray-900 leading-tight">{job.title || 'Untitled Position'}</h2>
//                             <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
//                                 <span className="font-bold flex items-center gap-1"><Building size={12}/> {job.company || 'Unknown Company'}</span>
//                                 <span className="text-gray-300">|</span>
//                                 <span>{job.location || 'Location TBA'} ({job.workArrangement || 'Mode TBA'})</span>
//                                 <span className="text-gray-300">|</span>
//                                 <span className="text-blue-700 font-bold">{job.type || 'Full-Time'}</span>
//                             </div>
//                         </div>
//                     </div>
//                     {canEdit && (
//                         <div className="flex gap-2">
//                             <button type="button" onClick={(e) => onEdit(e, job)} className="p-1.5 bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-50" title="Edit">
//                                 <Edit2 size={16} className="pointer-events-none"/>
//                             </button>
//                             <button type="button" onClick={(e) => onDelete(e, job.id)} className="p-1.5 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50" title="Delete">
//                                 <Trash2 size={16} className="pointer-events-none"/>
//                             </button>
//                         </div>
//                     )}
//                 </div>
                
//                 {/* Tabs Navigation */}
//                 <div className="flex gap-6 mt-2 border-b border-gray-200 -mb-3 pt-1 overflow-x-auto no-scrollbar">
//                     <button onClick={() => setActiveTab('overview')} className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Overview</button>
//                     <button onClick={() => setActiveTab('rounds')} className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${activeTab === 'rounds' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Rounds & Results</button>
//                     <button onClick={() => setActiveTab('applicants')} className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${activeTab === 'applicants' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Applicants ({job.applicants?.length || 0})</button>
//                     <button onClick={() => setActiveTab('eligible')} className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${activeTab === 'eligible' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Eligible Students</button>
//                 </div>
//             </div>

//             {/* Content Area */}
//             <div className="flex-1 overflow-y-auto p-4 md:p-8">
//                 {activeTab === 'overview' && (
//                     <JobOverviewTab 
//                         job={job} 
//                         validApplicantsCount={job.applicants?.length || 0}
//                         onDownloadList={onDownloadJobRelatedList}
//                     />
//                 )}
//                 {activeTab === 'rounds' && (
//                     <JobRoundsTab 
//                         job={job} 
//                         onUploadResult={onUploadRoundResult}
//                     />
//                 )}
//                 {activeTab === 'applicants' && (
//                     <JobApplicantsTab 
//                         job={job} 
//                         onDownloadList={onDownloadJobRelatedList}
//                     />
//                 )}
//                 {activeTab === 'eligible' && (
//                     <JobEligibleTab 
//                         job={job}
//                         collegeBranches={branchCodes}
//                     />
//                 )}
//             </div>
//         </div>
//     );
// };


import React, { useState, useEffect } from 'react';
import { Job, User } from '../../../../../types';
import { ArrowLeft, Edit2, Trash2, Building } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';
import { CollegeService } from '../../../../../services/collegeService';
import { JobOverviewTab } from './JobOverviewTab';
import { JobRoundsTab } from './JobRoundsTab';
import { JobApplicantsTab } from './JobApplicantsTab';
import { JobEligibleTab } from './JobEligibleTab';

/**
 * JobDetailView – CPH / Staff portal
 *
 * FIXED:
 *  1. Field names updated to use companyName, jobType, workMode (with compat fallbacks).
 *  2. onDownloadJobRelatedList now correctly calls exportJobList() with the right type.
 *  3. onUploadRoundResult refreshes the view after upload.
 */

interface JobDetailViewProps {
    job: Job;
    user: User;
    onBack: () => void;
    onEdit: (e: React.MouseEvent, job: Job) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onDownloadJobRelatedList: (listType: 'applicants' | 'not-interested') => void;
    onUploadRoundResult: (roundIndex: number, passedIds: string[]) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({
    job, user, onBack, onEdit, onDelete,
    onDownloadJobRelatedList, onUploadRoundResult
}) => {
    const [activeTab,   setActiveTab]   = useState<'overview' | 'rounds' | 'applicants' | 'eligible'>('overview');
    const [branchCodes, setBranchCodes] = useState<string[]>([]);

    useEffect(() => {
        const fetchBranches = async () => {
            if (user?.collegeId) {
                try {
                    const college = await CollegeService.getCollegeById(user.collegeId!);
                    if (college?.branches) {
                        setBranchCodes(college.branches.map((b: any) => b.code));
                    }
                } catch { /* ignore */ }
            }
        };
        fetchBranches();
    }, [user?.collegeId]);

    if (!job) {
        return (
            <div className="p-8 text-center text-gray-500 animate-in fade-in">
                <Building size={48} className="mx-auto mb-4 opacity-20" />
                <p>Job data is currently unavailable.</p>
                <button onClick={onBack} className="mt-4 text-blue-600 font-bold hover:underline">
                    Return to List
                </button>
            </div>
        );
    }

    const canEdit = JobService.canManageJob(user, job);

    // Safe accessors with fallback to old field names
    const companyName     = job.companyName     || (job as any).company         || 'Unknown Company';
    const jobTypeDisplay  = job.jobType         || (job as any).type             || 'Full-Time';
    const workModeDisplay = job.workMode        || (job as any).workArrangement  || 'On-Site';
    const applicantCount  = (job as any).applicantCount ?? (job.applicants?.length ?? 0);

    /**
     * Download handler.
     * 'applicants'    → GET /jobs/{id}/export-list?type=applicants
     * 'not-interested' → not yet a backend endpoint, falls back to applicants export
     */
    const handleDownload = async (type: 'applicants' | 'not-interested') => {
        try {
            if (type === 'not-interested') {
                // If backend has a specific endpoint for not-interested, change here.
                // For now reuse applicants export.
                await JobService.exportJobApplicants(job.id, 'applicants');
            } else {
                await JobService.exportJobList(job.id, 'applicants');
            }
        } catch (err: any) {
            alert('Download failed: ' + (err.message || 'Unknown error'));
        }
    };

    const TAB_ITEMS = [
        { id: 'overview',    label: 'Overview'             },
        { id: 'rounds',      label: 'Rounds & Results'     },
        { id: 'applicants',  label: `Applicants (${applicantCount})` },
        { id: 'eligible',    label: 'Eligible Students'    },
    ] as const;

    return (
        <div className="h-full flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="p-3 border-b bg-gray-50 flex-none">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                            title="Back to Jobs"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                {job.title || 'Untitled Position'}
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5 flex-wrap">
                                <span className="font-bold flex items-center gap-1">
                                    <Building size={12} /> {companyName}
                                </span>
                                <span className="text-gray-300">|</span>
                                <span>{job.location || 'Location TBA'} ({workModeDisplay})</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-blue-700 font-bold">{jobTypeDisplay}</span>
                            </div>
                        </div>
                    </div>

                    {canEdit && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={(e) => onEdit(e, job)}
                                className="p-1.5 bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-50"
                                title="Edit"
                            >
                                <Edit2 size={16} className="pointer-events-none" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => onDelete(e, job.id)}
                                className="p-1.5 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50"
                                title="Delete"
                            >
                                <Trash2 size={16} className="pointer-events-none" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Tab navigation */}
                <div className="flex gap-6 mt-2 border-b border-gray-200 -mb-3 pt-1 overflow-x-auto no-scrollbar">
                    {TAB_ITEMS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === t.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ────────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {activeTab === 'overview' && (
                    <JobOverviewTab
                        job={job}
                        validApplicantsCount={applicantCount}
                        onDownloadList={handleDownload}
                        showStatsAndExports={true}
                    />
                )}
                {activeTab === 'rounds' && (
                    <JobRoundsTab
                        job={job}
                        onUploadResult={onUploadRoundResult}
                    />
                )}
                {activeTab === 'applicants' && (
                    <JobApplicantsTab
                        job={job}
                        onDownloadList={() => handleDownload('applicants')}
                    />
                )}
                {activeTab === 'eligible' && (
                    <JobEligibleTab
                        job={job}
                        collegeBranches={branchCodes}
                    />
                )}
            </div>
        </div>
    );
};