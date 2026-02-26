
// import React, { useState, useEffect } from 'react';
// import { Job, Student } from '../../../../../types';
// import { Briefcase, Download, Loader2 } from 'lucide-react';
// import { JobService } from '../../../../../services/jobService';

// /**
//  * Component Name: JobApplicantsTab
//  * Directory: components/colleges/cp-portal/jobs/details/JobApplicantsTab.tsx
//  * 
//  * Functionality:
//  * - Lists all students who have applied for the job.
//  * - Shows Roll Number, Name, Branch, and current Application Status.
//  * - Provides a button to export this list as CSV via `onDownloadList`.
//  * - **3-Tier Sync**: Fetches data asynchronously from the backend.
//  * 
//  * Used In: JobDetailView
//  */

// interface JobApplicantsTabProps {
//     job: Job;
//     onDownloadList: (type: 'applicants') => void;
// }

// export const JobApplicantsTab: React.FC<JobApplicantsTabProps> = ({ job, onDownloadList }) => {
//     const [applicants, setApplicants] = useState<Student[]>([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         let isMounted = true;
        
//         const fetchApplicants = async () => {
//             try {
//                 setLoading(true);
//                 // 3-Tier Sync: Await the API response from backend
//                 const data = await JobService.getJobApplicants(job.id);
//                 if (isMounted) {
//                     setApplicants(data);
//                 }
//             } catch (error) {
//                 console.error("Failed to fetch applicants:", error);
//             } finally {
//                 if (isMounted) setLoading(false);
//             }
//         };

//         fetchApplicants();

//         return () => { isMounted = false; };
//     }, [job.id]);

//     if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Loading applicants...</div>;

//     return (
//         <div className="space-y-4 animate-in fade-in">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
//                 <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Briefcase size={20} className="text-blue-600"/><span>Applicant Directory</span><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{applicants.length}</span></h3>
//                 <button onClick={() => onDownloadList('applicants')} className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm transition-all"><Download size={14}/> Export CSV</button>
//             </div>
//             <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left text-sm">
//                         <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
//                             <tr><th className="px-6 py-3">Roll Number</th><th className="px-6 py-3">Name</th><th className="px-6 py-3">Branch</th><th className="px-6 py-3">Current Status</th></tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                             {applicants.map(student => (
//                                 <tr key={student.id} className="hover:bg-gray-50 transition-colors">
//                                     <td className="px-6 py-3 font-mono text-gray-600 font-medium">{student.profile?.rollNumber || 'N/A'}</td>
//                                     {/* Fix: Use student.fullName instead of student.name */}
//                                     <td className="px-6 py-3 font-bold text-gray-900">{student.fullName}</td>
//                                     <td className="px-6 py-3 text-gray-600"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">{student.profile?.branch || 'N/A'}</span></td>
//                                     <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold border ${job.studentStatus[student.id]?.includes('Passed') || job.studentStatus[student.id]?.includes('Hired') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{job.studentStatus[student.id] || 'Applied'}</span></td>
//                                 </tr>
//                             ))}
//                             {applicants.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No applicants yet.</td></tr>}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//             <div className="md:hidden space-y-3">
//                 {applicants.map(student => (
//                     <div key={student.id} className="bg-white p-4 rounded-xl border shadow-sm">
//                         <div className="flex justify-between items-start mb-2">
//                             {/* Fix: Use student.fullName instead of student.name */}
//                             <div><h4 className="font-bold text-gray-900 text-sm">{student.fullName}</h4><p className="text-xs font-mono text-gray-500 mt-0.5">{student.profile?.rollNumber || 'N/A'}</p></div>
//                             <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${job.studentStatus[student.id]?.includes('Passed') || job.studentStatus[student.id]?.includes('Hired') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{job.studentStatus[student.id] || 'Applied'}</span>
//                         </div>
//                         <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-600 border border-gray-200">{student.profile?.branch || 'N/A'}</span><span className="text-xs text-gray-400 truncate flex-1 text-right">{student.email}</span></div>
//                     </div>
//                 ))}
//                 {applicants.length === 0 && <div className="py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">No applicants yet.</div>}
//             </div>
//         </div>
//     );
// };


// import React, { useState, useEffect } from 'react';
// import { Job } from '../../../../../types';
// import { Briefcase, Download, Loader2 } from 'lucide-react';
// import { JobService } from '../../../../../services/jobService';

// /**
//  * JobApplicantsTab – FIXED
//  *
//  * Issues fixed:
//  *  1. Was calling getJobApplicants() which returned Student[] – those objects
//  *     don't have profile.rollNumber etc populated correctly.
//  *     NOW calls getJobApplicantsDashboard() and uses the pre-built students[]
//  *     + headers[] that the backend already assembled.
//  *
//  *  2. Download button now calls exportJobList('applicants') correctly.
//  */

// interface JobApplicantsTabProps {
//     job: Job;
//     onDownloadList: (type: 'applicants') => void;
// }

// export const JobApplicantsTab: React.FC<JobApplicantsTabProps> = ({ job, onDownloadList }) => {
//     const [dashboard, setDashboard]   = useState<any>(null);
//     const [loading,   setLoading]     = useState(true);
//     const [error,     setError]       = useState<string | null>(null);

//     useEffect(() => {
//         let mounted = true;
//         const load = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
//                 const data = await JobService.getJobApplicantsDashboard(job.id);
//                 if (mounted) setDashboard(data);
//             } catch (err: any) {
//                 console.error('[JobApplicantsTab] Failed:', err);
//                 if (mounted) setError('Failed to load applicants. Please try again.');
//             } finally {
//                 if (mounted) setLoading(false);
//             }
//         };
//         load();
//         return () => { mounted = false; };
//     }, [job.id]);

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center py-20 text-gray-500">
//                 <Loader2 className="animate-spin mr-2" size={20} /> Loading applicants…
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex items-center justify-center py-20 text-red-500 flex-col gap-2">
//                 <p>{error}</p>
//                 <button
//                     onClick={() => window.location.reload()}
//                     className="text-blue-600 underline text-sm"
//                 >
//                     Retry
//                 </button>
//             </div>
//         );
//     }

//     const students: any[] = dashboard?.students || [];
//     const headers:  any[] = dashboard?.headers  || [];

//     // columns to show in the table (use backend-provided headers)
//     const displayHeaders = headers.length > 0
//         ? headers
//         : ['Roll Number', 'Full Name', 'Current Status'];

//     return (
//         <div className="space-y-4 animate-in fade-in">
//             {/* Header row */}
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
//                 <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//                     <Briefcase size={20} className="text-blue-600" />
//                     Applicant Directory
//                     <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
//                         {students.length}
//                     </span>
//                 </h3>
//                 <button
//                     onClick={() => onDownloadList('applicants')}
//                     className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm"
//                 >
//                     <Download size={14} /> Export CSV / Excel
//                 </button>
//             </div>

//             {/* Round stats (if any) */}
//             {dashboard?.roundSummary?.length > 0 && (
//                 <div className="flex gap-3 flex-wrap mb-2">
//                     {dashboard.roundSummary.map((r: any) => (
//                         <div key={r.roundNumber} className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs">
//                             <span className="font-bold text-indigo-800">Round {r.roundNumber}: {r.roundName}</span>
//                             <span className="ml-2 text-indigo-600">{r.studentCount} students</span>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Table – desktop */}
//             <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left text-sm">
//                         <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
//                             <tr>
//                                 {displayHeaders.map((h: string) => (
//                                     <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                             {students.length === 0 && (
//                                 <tr>
//                                     <td colSpan={displayHeaders.length} className="px-6 py-12 text-center text-gray-400">
//                                         No applicants yet.
//                                     </td>
//                                 </tr>
//                             )}
//                             {students.map((student: any, idx: number) => (
//                                 <tr key={student.studentId || idx} className="hover:bg-gray-50 transition-colors">
//                                     {displayHeaders.map((h: string) => {
//                                         const val = student[h] ?? '—';
//                                         const isBadge = h === 'Current Status' || h === 'Application Source';
//                                         return (
//                                             <td key={h} className="px-4 py-3">
//                                                 {isBadge ? (
//                                                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
//                                                         String(val).toLowerCase().includes('hired')
//                                                             ? 'bg-green-100 text-green-700 border-green-200'
//                                                             : String(val).toLowerCase().includes('rejected')
//                                                             ? 'bg-red-100 text-red-700 border-red-200'
//                                                             : 'bg-blue-50 text-blue-700 border-blue-200'
//                                                     }`}>
//                                                         {val}
//                                                     </span>
//                                                 ) : (
//                                                     <span className="text-gray-800">{val}</span>
//                                                 )}
//                                             </td>
//                                         );
//                                     })}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Cards – mobile */}
//             <div className="md:hidden space-y-3">
//                 {students.length === 0 && (
//                     <div className="py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">
//                         No applicants yet.
//                     </div>
//                 )}
//                 {students.map((student: any, idx: number) => (
//                     <div key={student.studentId || idx} className="bg-white p-4 rounded-xl border shadow-sm">
//                         <div className="flex justify-between items-start mb-2">
//                             <div>
//                                 <h4 className="font-bold text-gray-900 text-sm">
//                                     {student['Full Name'] || '—'}
//                                 </h4>
//                                 <p className="text-xs font-mono text-gray-500 mt-0.5">
//                                     {student['Roll Number'] || '—'}
//                                 </p>
//                             </div>
//                             <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
//                                 String(student['Current Status']).toLowerCase().includes('hired')
//                                     ? 'bg-green-50 text-green-700 border-green-200'
//                                     : String(student['Current Status']).toLowerCase().includes('rejected')
//                                     ? 'bg-red-50 text-red-700 border-red-200'
//                                     : 'bg-blue-50 text-blue-700 border-blue-200'
//                             }`}>
//                                 {student['Current Status'] || 'Applied'}
//                             </span>
//                         </div>
//                         {/* Extra fields */}
//                         <div className="text-xs text-gray-500 mt-2 space-y-1">
//                             {displayHeaders
//                                 .filter(h => !['Full Name', 'Roll Number', 'Current Status'].includes(h))
//                                 .map(h => (
//                                     <div key={h} className="flex justify-between">
//                                         <span className="font-medium text-gray-400">{h}:</span>
//                                         <span>{student[h] || '—'}</span>
//                                     </div>
//                                 ))}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// import React, { useState, useEffect } from 'react';
// import { Job } from '../../../../../types';
// import { Briefcase, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
// import { JobService } from '../../../../../services/jobService';

// /**
//  * JobApplicantsTab – COMPLETE VERSION
//  * 
//  * Shows all applicants with dynamic columns from backend:
//  * - Roll Number
//  * - Full Name  
//  * - Current Status
//  * - Application Source
//  * - All fields from job.requiredStudentFields (Branch, CGPA, etc.)
//  * 
//  * Synced with backend getJobApplicantsDashboard() which returns:
//  * {
//  *   headers: ["Roll Number", "Full Name", "Current Status", "Application Source", ...requiredFields],
//  *   students: [{...}, {...}],
//  *   globalStats: {...},
//  *   roundSummary: [...]
//  * }
//  */

// interface JobApplicantsTabProps {
//     job: Job;
//     onDownloadList: (type: 'applicants') => void;
// }

// export const JobApplicantsTab: React.FC<JobApplicantsTabProps> = ({ job, onDownloadList }) => {
//     const [dashboard, setDashboard] = useState<any>(null);
//     const [loading,   setLoading]   = useState(true);
//     const [error,     setError]     = useState<string | null>(null);

//     useEffect(() => {
//         loadApplicants();
//     }, [job.id]);

//     const loadApplicants = async () => {
//         try {
//             setLoading(true);
//             setError(null);
            
//             // Backend endpoint: GET /jobs/{id}/applicants-dashboard
//             // Returns: { headers, students, globalStats, roundSummary }
//             const data = await JobService.getJobApplicantsDashboard(job.id);
//             setDashboard(data);
//         } catch (err: any) {
//             console.error('[JobApplicantsTab] Load error:', err);
//             setError('Failed to load applicants. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center py-20 text-gray-500">
//                 <Loader2 className="animate-spin mr-2" size={20} /> Loading applicants…
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex items-center justify-center py-20 text-red-500 flex-col gap-3">
//                 <AlertCircle size={32} />
//                 <p className="text-sm">{error}</p>
//                 <button
//                     onClick={loadApplicants}
//                     className="text-xs text-blue-600 underline"
//                 >
//                     Retry
//                 </button>
//             </div>
//         );
//     }

//     // Extract data from dashboard
//     const students: any[]  = dashboard?.students || [];
//     const headers: string[] = dashboard?.headers  || [];
//     const globalStats      = dashboard?.globalStats || {};
//     const roundSummary     = dashboard?.roundSummary || [];

//     // Use backend-provided headers (includes Roll Number, Full Name, Status, Source, + required fields)
//     const displayHeaders = headers.length > 0
//         ? headers
//         : ['Roll Number', 'Full Name', 'Current Status', 'Application Source'];

//     return (
//         <div className="space-y-4 animate-in fade-in">
            
//             {/* ── Header with stats and download button ──────────────────── */}
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                 <div className="flex items-center gap-3">
//                     <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//                         <Briefcase size={20} className="text-blue-600" />
//                         Applicant Directory
//                         <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
//                             {students.length}
//                         </span>
//                     </h3>
//                     <button
//                         onClick={loadApplicants}
//                         className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600"
//                         title="Refresh applicants"
//                     >
//                         <RefreshCw size={12} />
//                     </button>
//                 </div>

//                 <button
//                     onClick={() => onDownloadList('applicants')}
//                     className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm transition-all"
//                 >
//                     <Download size={14} /> Export CSV / Excel
//                 </button>
//             </div>

//             {/* ── Global stats badges ─────────────────────────────────────── */}
//             {(globalStats.Hired > 0 || globalStats.Rejected > 0 || globalStats.Pending > 0) && (
//                 <div className="flex gap-3 flex-wrap">
//                     {globalStats.Hired > 0 && (
//                         <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 text-xs">
//                             <span className="font-bold text-green-800">Hired:</span>
//                             <span className="ml-2 text-green-600">{globalStats.Hired}</span>
//                         </div>
//                     )}
//                     {globalStats.Rejected > 0 && (
//                         <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-xs">
//                             <span className="font-bold text-red-800">Rejected:</span>
//                             <span className="ml-2 text-red-600">{globalStats.Rejected}</span>
//                         </div>
//                     )}
//                     {globalStats.Pending > 0 && (
//                         <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xs">
//                             <span className="font-bold text-blue-800">Pending:</span>
//                             <span className="ml-2 text-blue-600">{globalStats.Pending}</span>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* ── Round-wise summary ───────────────────────────────────────── */}
//             {roundSummary.length > 0 && (
//                 <div className="flex gap-3 flex-wrap">
//                     {roundSummary.map((r: any) => (
//                         <div key={r.roundNumber} className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs">
//                             <span className="font-bold text-indigo-800">
//                                 Round {r.roundNumber}: {r.roundName}
//                             </span>
//                             <span className="ml-2 text-indigo-600">
//                                 {r.studentCount} student{r.studentCount !== 1 ? 's' : ''}
//                             </span>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* ── Desktop Table ────────────────────────────────────────────── */}
//             <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left text-sm">
//                         <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
//                             <tr>
//                                 {displayHeaders.map((h: string) => (
//                                     <th key={h} className="px-4 py-3 whitespace-nowrap">
//                                         {h}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                             {students.length === 0 ? (
//                                 <tr>
//                                     <td colSpan={displayHeaders.length} className="px-6 py-12 text-center text-gray-400">
//                                         No applicants yet for this job.
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 students.map((student: any, idx: number) => (
//                                     <tr key={student.studentId || idx} className="hover:bg-gray-50 transition-colors">
//                                         {displayHeaders.map((h: string) => {
//                                             const val = student[h] ?? '—';
                                            
//                                             // Special rendering for status columns
//                                             if (h === 'Current Status') {
//                                                 const status = String(val).toLowerCase();
//                                                 const badgeClass = status.includes('hired')
//                                                     ? 'bg-green-100 text-green-700 border-green-200'
//                                                     : status.includes('rejected')
//                                                     ? 'bg-red-100 text-red-700 border-red-200'
//                                                     : status.includes('cleared')
//                                                     ? 'bg-blue-100 text-blue-700 border-blue-200'
//                                                     : 'bg-gray-100 text-gray-600 border-gray-200';
                                                
//                                                 return (
//                                                     <td key={h} className="px-4 py-3">
//                                                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badgeClass}`}>
//                                                             {val}
//                                                         </span>
//                                                     </td>
//                                                 );
//                                             }
                                            
//                                             if (h === 'Application Source') {
//                                                 return (
//                                                     <td key={h} className="px-4 py-3">
//                                                         <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-100">
//                                                             {val}
//                                                         </span>
//                                                     </td>
//                                                 );
//                                             }
                                            
//                                             // Regular text column
//                                             return (
//                                                 <td key={h} className="px-4 py-3 text-gray-700">
//                                                     {val}
//                                                 </td>
//                                             );
//                                         })}
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* ── Mobile Cards ──────────────────────────────────────────────── */}
//             <div className="md:hidden space-y-3">
//                 {students.length === 0 ? (
//                     <div className="py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">
//                         No applicants yet for this job.
//                     </div>
//                 ) : (
//                     students.map((student: any, idx: number) => {
//                         const status = String(student['Current Status'] || 'Applied').toLowerCase();
//                         const badgeClass = status.includes('hired')
//                             ? 'bg-green-50 text-green-700 border-green-200'
//                             : status.includes('rejected')
//                             ? 'bg-red-50 text-red-700 border-red-200'
//                             : status.includes('cleared')
//                             ? 'bg-blue-50 text-blue-700 border-blue-200'
//                             : 'bg-gray-100 text-gray-600 border-gray-200';

//                         return (
//                             <div key={student.studentId || idx} className="bg-white p-4 rounded-xl border shadow-sm">
//                                 {/* Header */}
//                                 <div className="flex justify-between items-start mb-3">
//                                     <div className="flex-1">
//                                         <h4 className="font-bold text-gray-900 text-sm">
//                                             {student['Full Name'] || '—'}
//                                         </h4>
//                                         <p className="text-xs font-mono text-gray-500 mt-0.5">
//                                             {student['Roll Number'] || '—'}
//                                         </p>
//                                     </div>
//                                     <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${badgeClass}`}>
//                                         {student['Current Status'] || 'Applied'}
//                                     </span>
//                                 </div>

//                                 {/* Details */}
//                                 <div className="text-xs text-gray-600 space-y-1.5 pt-3 border-t border-gray-100">
//                                     {displayHeaders
//                                         .filter(h => !['Full Name', 'Roll Number', 'Current Status'].includes(h))
//                                         .map(h => (
//                                             <div key={h} className="flex justify-between items-center">
//                                                 <span className="font-medium text-gray-500">{h}:</span>
//                                                 <span className="text-gray-800 font-medium text-right">
//                                                     {student[h] ?? '—'}
//                                                 </span>
//                                             </div>
//                                         ))}
//                                 </div>
//                             </div>
//                         );
//                     })
//                 )}
//             </div>

//             {/* ── Footer summary ────────────────────────────────────────────── */}
//             <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
//                 <p>
//                     Showing <strong className="text-gray-700">{students.length}</strong> applicant{students.length !== 1 ? 's' : ''}.
//                 </p>
//                 <p className="text-right">
//                     Export includes all columns: Roll Number, Name, Status, Source, and all required student fields.
//                 </p>
//             </div>
//         </div>
//     );
// };

// import React, { useState, useEffect } from 'react';
// import { Job } from '../../../../../types';
// import { Briefcase, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
// import { JobService } from '../../../../../services/jobService';

// interface JobApplicantsTabProps {
//     job: Job;
//     onDownloadList: (type: 'applicants') => void;
// }

// export const JobApplicantsTab: React.FC<JobApplicantsTabProps> = ({ job, onDownloadList }) => {
//     const [dashboard, setDashboard] = useState<any>(null);
//     const [loading,   setLoading]   = useState(true);
//     const [error,     setError]     = useState<string | null>(null);

//     useEffect(() => {
//         loadApplicants();
//     }, [job.id]);

//     const loadApplicants = async () => {
//         try {
//             setLoading(true);
//             setError(null);
//             const data = await JobService.getJobApplicantsDashboard(job.id);
//             setDashboard(data);
//         } catch (err: any) {
//             setError('Failed to load applicants.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
//     if (error) return <div className="text-red-500 text-center py-20"><AlertCircle className="mx-auto" /><p>{error}</p></div>;

//     const students: any[]  = dashboard?.students || [];
//     const headers: string[] = dashboard?.headers  || [];
//     const globalStats      = dashboard?.globalStats || {};
//     const roundSummary     = dashboard?.roundSummary || [];

//     // If headers is empty, only then use a minimal fallback
//     const displayHeaders = headers.length > 0 ? headers : ['Current Status', 'Application Source'];

//     return (
//         <div className="space-y-4 animate-in fade-in">
//             {/* Header */}
//             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//                 <div className="flex items-center gap-3">
//                     <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//                         <Briefcase size={20} className="text-blue-600" />
//                         Applicant Directory ({students.length})
//                     </h3>
//                     <button onClick={loadApplicants} className="text-gray-400 hover:text-blue-600">
//                         <RefreshCw size={14} />
//                     </button>
//                 </div>
//                 <button
//                     onClick={() => onDownloadList('applicants')}
//                     className="px-4 py-2 bg-white border rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
//                 >
//                     <Download size={14} /> Export List
//                 </button>
//             </div>

//             {/* Global Stats */}
//             <div className="flex gap-2 flex-wrap">
//                 {Object.entries(globalStats).map(([label, count]: [string, any]) => (
//                     count > 0 && (
//                         <div key={label} className="bg-gray-50 border px-3 py-1 rounded-full text-[10px] font-bold uppercase">
//                             {label}: <span className="text-blue-600">{count}</span>
//                         </div>
//                     )
//                 ))}
//             </div>

//             {/* Desktop Table */}
//             <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left text-sm">
//                         <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
//                             <tr>
//                                 {displayHeaders.map(h => <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>)}
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                             {students.map((student, idx) => (
//                                 <tr key={idx} className="hover:bg-gray-50 transition-colors">
//                                     {displayHeaders.map(h => {
//                                         const val = student[h] ?? '—';
//                                         if (h === 'Current Status') {
//                                             return (
//                                                 <td key={h} className="px-4 py-3">
//                                                     <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
//                                                         {val}
//                                                     </span>
//                                                 </td>
//                                             );
//                                         }
//                                         return <td key={h} className="px-4 py-3 text-gray-700">{val}</td>;
//                                     })}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Mobile Cards - RESOLVED DUPLICATION HERE */}
//             <div className="md:hidden space-y-3">
//                 {students.map((student, idx) => (
//                     <div key={idx} className="bg-white p-4 rounded-xl border shadow-sm">
//                         <div className="flex justify-between items-start mb-3">
//                             <div>
//                                 {/* Dynamically pick the first header (usually Name or Roll) */}
//                                 <h4 className="font-bold text-gray-900 text-sm">{student[displayHeaders[1]] || '—'}</h4>
//                                 <p className="text-xs font-mono text-gray-500">{student[displayHeaders[0]] || '—'}</p>
//                             </div>
//                             <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
//                                 {student['Current Status'] || 'Applied'}
//                             </span>
//                         </div>
//                         <div className="text-xs space-y-1.5 pt-2 border-t border-gray-50">
//                             {/* Render everything ELSE that isn't the first two headers or status */}
//                             {displayHeaders.slice(2).filter(h => h !== 'Current Status').map(h => (
//                                 <div key={h} className="flex justify-between">
//                                     <span className="text-gray-500">{h}:</span>
//                                     <span className="font-medium text-gray-800">{student[h] ?? '—'}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

import React, { useState, useEffect } from 'react';
import { Job } from '../../../../../types';
import { Briefcase, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

/**
 * JobApplicantsTab
 * - Restored Global Stats and Round Summary
 * - Added Horizontal Scroll for large column sets
 * - Syncs with backend headers (Roll Number, Name, Status, Source, etc.)
 */

interface JobApplicantsTabProps {
    job: Job;
    onDownloadList: (type: 'applicants') => void;
}

export const JobApplicantsTab: React.FC<JobApplicantsTabProps> = ({ job, onDownloadList }) => {
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadApplicants();
    }, [job.id]);

    const loadApplicants = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await JobService.getJobApplicantsDashboard(job.id);
            setDashboard(data);
        } catch (err: any) {
            console.error('[JobApplicantsTab] Load error:', err);
            setError('Failed to load applicants directory.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500">
                <Loader2 className="animate-spin mr-2" size={20} /> Loading directory...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
                <AlertCircle size={32} />
                <p className="text-sm">{error}</p>
                <button onClick={loadApplicants} className="text-xs text-blue-600 underline">Retry</button>
            </div>
        );
    }

    const students: any[] = dashboard?.students || [];
    const headers: string[] = dashboard?.headers || [];
    const globalStats = dashboard?.globalStats || {};
    const roundSummary = dashboard?.roundSummary || [];

    // Fallback if backend headers aren't ready
    const displayHeaders = headers.length > 0 ? headers : ['Roll Number', 'Full Name', 'Current Status'];

    return (
        <div className="space-y-6 animate-in fade-in">
            
            {/* ── Header Section ────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Briefcase size={20} className="text-blue-600" />
                        Applicant Directory
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                            {students.length}
                        </span>
                    </h3>
                    <button onClick={loadApplicants} className="text-gray-400 hover:text-blue-600 transition-colors">
                        <RefreshCw size={14} />
                    </button>
                </div>

                <button
                    onClick={() => onDownloadList('applicants')}
                    className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                    <Download size={14} /> Export CSV / Excel
                </button>
            </div>

            {/* ── Stats Badges (Global & Rounds) ─────────────────────────── */}
            <div className="space-y-3">
                {/* Global Status Counters */}
                <div className="flex gap-3 flex-wrap">
                    {Object.entries(globalStats).map(([label, count]: [string, any]) => (
                        count > 0 && (
                            <div key={label} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs shadow-sm">
                                <span className="font-bold text-gray-700 uppercase">{label}:</span>
                                <span className="ml-2 text-blue-600 font-bold">{count}</span>
                            </div>
                        )
                    ))}
                </div>

                {/* Round-wise Breakdown */}
                {roundSummary.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                        {roundSummary.map((r: any) => (
                            <div key={r.roundNumber} className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs">
                                <span className="font-bold text-indigo-800">
                                    Round {r.roundNumber}: {r.roundName}
                                </span>
                                <span className="ml-2 text-indigo-600">
                                    {r.studentCount} student{r.studentCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Desktop Table with Scrollbar ───────────────────────────── */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Horizontal Scroll Wrapper */}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm min-w-[1000px]">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                {displayHeaders.map((h) => (
                                    <th key={h} className="px-4 py-4 whitespace-nowrap border-b">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={displayHeaders.length} className="px-6 py-12 text-center text-gray-400">
                                        No applicants found for this job.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        {displayHeaders.map((h) => {
                                            const val = student[h] ?? '—';
                                            
                                            if (h === 'Current Status') {
                                                const status = String(val).toLowerCase();
                                                const badgeClass = status.includes('hired') 
                                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                                    : status.includes('rejected') 
                                                    ? 'bg-red-100 text-red-700 border-red-200' 
                                                    : 'bg-blue-100 text-blue-700 border-blue-200';

                                                return (
                                                    <td key={h} className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badgeClass}`}>
                                                            {val}
                                                        </span>
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td key={h} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Mobile Card View ───────────────────────────────────────── */}
            <div className="md:hidden space-y-3">
                {students.map((student, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">{student['Full Name'] || '—'}</h4>
                                <p className="text-xs font-mono text-gray-500">{student['Roll Number'] || '—'}</p>
                            </div>
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                                {student['Current Status'] || 'Applied'}
                            </span>
                        </div>
                        <div className="text-xs space-y-2 pt-3 border-t border-gray-100">
                            {displayHeaders.slice(3).map(h => (
                                <div key={h} className="flex justify-between">
                                    <span className="text-gray-500">{h}:</span>
                                    <span className="font-medium text-gray-800 text-right">{student[h] ?? '—'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Footer Summary ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 pt-4 border-t border-gray-100 gap-2">
                <p>
                    Showing <strong className="text-gray-700">{students.length}</strong> total records.
                </p>
                <p className="text-center sm:text-right">
                    Scroll horizontally to view all academic and personal details.
                </p>
            </div>
        </div>
    );
};