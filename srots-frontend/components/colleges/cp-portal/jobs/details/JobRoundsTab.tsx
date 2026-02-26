
// import React from 'react';
// import { Job } from '../../../../../types';
// import { Calendar as CalendarIcon, CheckCircle, UploadCloud } from 'lucide-react';
// import { JobService } from '../../../../../services/jobService';

// /**
//  * Component Name: JobRoundsTab
//  * Directory: components/colleges/cp-portal/jobs/details/JobRoundsTab.tsx
//  * 
//  * Functionality:
//  * - Lists all selection rounds (e.g., Aptitude, Interview).
//  * - Shows status of each round.
//  * - Provides button to upload result Excel/CSV for each round.
//  * - Passes file to Backend Service for processing.
//  * 
//  * Used In: JobDetailView
//  */

// interface JobRoundsTabProps {
//     job: Job;
//     onUploadResult: (roundIndex: number, passedIds: string[]) => void;
// }

// export const JobRoundsTab: React.FC<JobRoundsTabProps> = ({ job, onUploadResult }) => {

//     const handleUploadRoundResult = (roundIdx: number) => {
//         const input = document.createElement('input'); 
//         input.type = 'file'; 
//         input.accept = '.csv, .xlsx, .xls'; 
        
//         input.onchange = async (e) => {
//             const file = (e.target as HTMLInputElement).files?.[0];
//             if (!file) return;

//             try {
//                 // Delegate logic to backend service
//                 const result = await JobService.processRoundResultUpload(job.id, roundIdx, file);
//                 onUploadResult(roundIdx, []); // Refresh UI handled by parent re-fetch
//                 alert(`Results Processed Successfully!\n${result.count} Students marked as Passed.`); 
//             } catch (err: any) {
//                 console.error(err);
//                 alert("Error processing file: " + err.message);
//             }
//         };
//         input.click();
//     };

//     return (
//         <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
//             <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-gray-800">Selection Process Rounds</h3></div>
//             {job.rounds.map((round, idx) => {
//                 // 3-Tier Sync: Use backend provided count instead of calculating on client
//                 const qualifiedCount = round.qualifiedCount !== undefined ? round.qualifiedCount : 0;
                
//                 return (
//                 <div key={idx} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-center gap-6">
//                     <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl shrink-0 border-2 border-white shadow-sm">{idx + 1}</div>
//                     <div className="flex-1">
//                         <h4 className="font-bold text-lg text-gray-900">{round.name}</h4>
//                         <p className="text-sm text-gray-500 flex items-center gap-2 mt-1"><CalendarIcon size={14} className="text-gray-400"/> {round.date}<span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${round.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>{round.status}</span></p>
//                     </div>
//                     <div className="flex flex-col items-end gap-2 w-full md:w-auto">
//                         <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded border"><CheckCircle size={12} className="text-green-600"/>{qualifiedCount} Qualified</div>
//                         <button onClick={() => handleUploadRoundResult(idx)} className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition-all"><UploadCloud size={14}/> Upload Results (Excel/CSV)</button>
//                     </div>
//                 </div>
//             )})}
//             {job.rounds.length === 0 && <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">No specific rounds configured for this job.</div>}
//         </div>
//     );
// };

// import React, { useState, useEffect } from 'react';
// import { Job } from '../../../../../types';
// import { Calendar as CalendarIcon, CheckCircle, UploadCloud, Loader2, RefreshCw } from 'lucide-react';
// import { JobService } from '../../../../../services/jobService';

// /**
//  * JobRoundsTab – FIXED
//  *
//  * Issues fixed:
//  *  1. job.rounds may not be populated if the job came from a stale prop –
//  *     the component now also reads from roundsJson (parsed by mapDtoToJob).
//  *  2. After upload, fetches updated hiring stats from backend to show live counts.
//  *  3. Alert shows passed/rejected/errors from backend response.
//  *  4. roundIndex passed as 1-based to match backend: roundIndex + 1.
//  */

// interface JobRoundsTabProps {
//     job: Job;
//     onUploadResult: (roundIndex: number, passedIds: string[]) => void;
// }

// export const JobRoundsTab: React.FC<JobRoundsTabProps> = ({ job, onUploadResult }) => {
//     const [hiringStats, setHiringStats] = useState<any>(null);
//     const [uploading,   setUploading]   = useState<number | null>(null); // roundIndex being uploaded
//     const [statsLoading, setStatsLoading] = useState(false);

//     // Rounds come from the parsed `rounds` array (populated by mapDtoToJob)
//     // Fall back to empty array if not loaded yet.
//     const rounds: any[] = job.rounds || [];

//     // Load hiring stats on mount so we can show qualified counts per round
//     useEffect(() => {
//         loadStats();
//     }, [job.id]);

//     const loadStats = async () => {
//         try {
//             setStatsLoading(true);
//             const stats = await JobService.getJobHiringStats(job.id);
//             setHiringStats(stats);
//         } catch (err) {
//             console.warn('[JobRoundsTab] Could not load hiring stats:', err);
//         } finally {
//             setStatsLoading(false);
//         }
//     };

//     /**
//      * handleUpload – triggers file picker, uploads to backend, refreshes stats.
//      * roundIdx is 0-based (array index); backend expects 1-based roundIndex.
//      */
//     const handleUpload = (roundIdx: number) => {
//         const input = document.createElement('input');
//         input.type   = 'file';
//         input.accept = '.csv,.xlsx,.xls';

//         input.onchange = async (e) => {
//             const file = (e.target as HTMLInputElement).files?.[0];
//             if (!file) return;

//             setUploading(roundIdx);
//             try {
//                 // Backend: POST /jobs/{id}/rounds/{roundIndex}/results
//                 // roundIndex is 1-based → pass roundIdx + 1
//                 const result = await JobService.processRoundResultUpload(job.id, roundIdx + 1, file);

//                 // Refresh stats from backend
//                 await loadStats();

//                 // Notify parent to re-fetch job if needed
//                 onUploadResult(roundIdx + 1, []);

//                 // Show detailed result from backend
//                 const lines = [
//                     `✅ Round ${roundIdx + 1} results processed!`,
//                     `Passed:  ${result.passed   ?? 0}`,
//                     `Rejected: ${result.rejected ?? 0}`,
//                 ];
//                 if (result.newApplicationsCreated > 0)
//                     lines.push(`New applications created: ${result.newApplicationsCreated}`);
//                 if (result.errors?.length > 0)
//                     lines.push(`\nWarnings:\n${result.errors.slice(0, 5).join('\n')}`);

//                 alert(lines.join('\n'));
//             } catch (err: any) {
//                 const msg = err.response?.data?.error || err.message || 'Unknown error';
//                 alert(`❌ Upload failed:\n${msg}`);
//             } finally {
//                 setUploading(null);
//             }
//         };

//         input.click();
//     };

//     if (rounds.length === 0) {
//         return (
//             <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
//                 No selection rounds configured for this job.
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
//             <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-bold text-gray-800">Selection Process Rounds</h3>
//                 <button
//                     onClick={loadStats}
//                     disabled={statsLoading}
//                     className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600"
//                 >
//                     <RefreshCw size={12} className={statsLoading ? 'animate-spin' : ''} />
//                     Refresh Stats
//                 </button>
//             </div>

//             {rounds.map((round: any, idx: number) => {
//                 // Get qualified count from hiring stats (backend provides per-round counts)
//                 const roundStat   = hiringStats?.rounds?.find((r: any) => r.roundNumber === idx + 1);
//                 const qualifiedCount = roundStat?.passed   ?? round.qualifiedCount ?? 0;
//                 const rejectedCount  = roundStat?.rejected ?? 0;
//                 const roundStatus    = roundStat?.roundStatus ?? round.status ?? 'Upcoming';

//                 const isUploading = uploading === idx;

//                 return (
//                     <div
//                         key={idx}
//                         className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6"
//                     >
//                         {/* Round number badge */}
//                         <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl shrink-0 border-2 border-white shadow-sm">
//                             {idx + 1}
//                         </div>

//                         {/* Round info */}
//                         <div className="flex-1">
//                             <h4 className="font-bold text-lg text-gray-900">{round.name || `Round ${idx + 1}`}</h4>
//                             <p className="text-sm text-gray-500 flex items-center flex-wrap gap-2 mt-1">
//                                 {round.date && (
//                                     <span className="flex items-center gap-1">
//                                         <CalendarIcon size={14} className="text-gray-400" />
//                                         {round.date}
//                                     </span>
//                                 )}
//                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
//                                     roundStatus === 'Completed'
//                                         ? 'bg-green-100 text-green-700 border-green-200'
//                                         : roundStatus === 'In Progress'
//                                         ? 'bg-blue-100 text-blue-700 border-blue-200'
//                                         : 'bg-orange-100 text-orange-700 border-orange-200'
//                                 }`}>
//                                     {roundStatus}
//                                 </span>
//                             </p>
//                         </div>

//                         {/* Stats + action */}
//                         <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0">
//                             <div className="flex gap-3">
//                                 <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-green-50 px-2 py-1 rounded border border-green-100">
//                                     <CheckCircle size={12} className="text-green-600" />
//                                     {statsLoading ? '—' : qualifiedCount} Passed
//                                 </div>
//                                 {rejectedCount > 0 && (
//                                     <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded border border-red-100">
//                                         {rejectedCount} Rejected
//                                     </div>
//                                 )}
//                             </div>

//                             <button
//                                 onClick={() => handleUpload(idx)}
//                                 disabled={isUploading}
//                                 className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
//                             >
//                                 {isUploading
//                                     ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
//                                     : <><UploadCloud size={14} /> Upload Results (Excel/CSV)</>
//                                 }
//                             </button>

//                             <p className="text-[10px] text-gray-400 text-right">
//                                 Excel must have columns: Roll Number, Result/Status
//                             </p>
//                         </div>
//                     </div>
//                 );
//             })}
//         </div>
//     );
// };

// import React, { useState, useEffect } from 'react';
// import { Job } from '../../../../../types';
// import { Calendar as CalendarIcon, CheckCircle, UploadCloud, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
// import { JobService } from '../../../../../services/jobService';

// /**
//  * JobRoundsTab – COMPLETE FIX
//  * 
//  * FIXES:
//  * 1. ✅ Properly shows round status (Completed/In Progress/Upcoming) from hiring stats
//  * 2. ✅ Shows qualified/rejected counts from hiring stats
//  * 3. ✅ Handles missing date field - shows "Date not set" if missing
//  * 4. ✅ Upload feedback with detailed backend response
//  */

// interface JobRoundsTabProps {
//     job: Job;
//     onUploadResult: (roundIndex: number, passedIds: string[]) => void;
// }

// export const JobRoundsTab: React.FC<JobRoundsTabProps> = ({ job, onUploadResult }) => {
//     const [hiringStats, setHiringStats] = useState<any>(null);
//     const [uploading,   setUploading]   = useState<number | null>(null);
//     const [loading,     setLoading]     = useState(false);
//     const [error,       setError]       = useState<string | null>(null);

//     // Get rounds from job object (parsed by backend into rounds[] array)
//     const rounds: any[] = job.rounds || [];

//     useEffect(() => {
//         loadStats();
//     }, [job.id]);

//     const loadStats = async () => {
//         try {
//             setLoading(true);
//             setError(null);
//             const stats = await JobService.getJobHiringStats(job.id);
//             setHiringStats(stats);
//         } catch (err: any) {
//             console.error('[JobRoundsTab] Stats load error:', err);
//             setError('Could not load round statistics');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleUpload = (roundIdx: number) => {
//         const input = document.createElement('input');
//         input.type   = 'file';
//         input.accept = '.csv,.xlsx,.xls';

//         input.onchange = async (e) => {
//             const file = (e.target as HTMLInputElement).files?.[0];
//             if (!file) return;

//             setUploading(roundIdx);
//             try {
//                 // Backend expects 1-based roundIndex
//                 const result = await JobService.processRoundResultUpload(job.id, roundIdx + 1, file);

//                 // Refresh stats
//                 await loadStats();

//                 // Notify parent
//                 onUploadResult(roundIdx + 1, []);

//                 // Show detailed result
//                 const messages = [
//                     `✅ Round ${roundIdx + 1} results uploaded successfully!`,
//                     ``,
//                     `Passed: ${result.passed ?? 0}`,
//                     `Rejected: ${result.rejected ?? 0}`,
//                 ];

//                 if (result.newApplicationsCreated > 0) {
//                     messages.push(`New applications created: ${result.newApplicationsCreated}`);
//                 }

//                 if (result.errors && result.errors.length > 0) {
//                     messages.push(``, `⚠️ Warnings:`, ...result.errors.slice(0, 5));
//                     if (result.errors.length > 5) {
//                         messages.push(`... and ${result.errors.length - 5} more warnings`);
//                     }
//                 }

//                 alert(messages.join('\n'));
//             } catch (err: any) {
//                 const msg = err.response?.data?.error || err.message || 'Unknown error';
//                 alert(`❌ Upload failed:\n${msg}`);
//             } finally {
//                 setUploading(null);
//             }
//         };

//         input.click();
//     };

//     if (rounds.length === 0) {
//         return (
//             <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
//                 No selection rounds configured for this job.
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
//             {/* Header with refresh button */}
//             <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-bold text-gray-800">Selection Process Rounds</h3>
//                 <button
//                     onClick={loadStats}
//                     disabled={loading}
//                     className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600 disabled:opacity-50"
//                     title="Refresh round statistics"
//                 >
//                     <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
//                     Refresh Stats
//                 </button>
//             </div>

//             {/* Error banner */}
//             {error && (
//                 <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
//                     <AlertCircle size={16} className="shrink-0" />
//                     <span>{error}</span>
//                     <button onClick={loadStats} className="ml-auto text-xs underline">
//                         Retry
//                     </button>
//                 </div>
//             )}

//             {/* Rounds list */}
//             <div className="space-y-4">
//                 {rounds.map((round: any, idx: number) => {
//                     // Get stats for this round from backend
//                     const roundStat = hiringStats?.rounds?.find((r: any) => r.roundNumber === idx + 1);
                    
//                     // FIXED: Use backend-calculated status with proper logic
//                     const roundStatus = roundStat?.roundStatus || 'Upcoming';
//                     const qualifiedCount = roundStat?.passed ?? 0;
//                     const rejectedCount = roundStat?.rejected ?? 0;
                    
//                     // FIXED: Handle missing date field
//                     const roundDate = round.date || null;
//                     const hasDate = roundDate && roundDate.trim().length > 0;
                    
//                     const isUploading = uploading === idx;
                    
//                     // Status badge styling
//                     const statusColors = {
//                         'Completed':   'bg-green-100 text-green-700 border-green-200',
//                         'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
//                         'Upcoming':    'bg-orange-100 text-orange-700 border-orange-200',
//                     };
//                     const statusColor = statusColors[roundStatus as keyof typeof statusColors] || statusColors['Upcoming'];

//                     return (
//                         <div
//                             key={idx}
//                             className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md transition-shadow"
//                         >
//                             {/* Round number badge */}
//                             <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl shrink-0 border-2 border-white shadow-sm">
//                                 {idx + 1}
//                             </div>

//                             {/* Round info */}
//                             <div className="flex-1 min-w-0">
//                                 <h4 className="font-bold text-lg text-gray-900 truncate">
//                                     {round.name || `Round ${idx + 1}`}
//                                 </h4>
//                                 <div className="flex items-center flex-wrap gap-2 mt-1.5 text-sm text-gray-500">
//                                     {/* Date display - FIXED to handle missing dates */}
//                                     <span className="flex items-center gap-1">
//                                         <CalendarIcon size={14} className="text-gray-400" />
//                                         {hasDate ? (
//                                             <span className="font-medium">{roundDate}</span>
//                                         ) : (
//                                             <span className="italic text-gray-400">Date not set</span>
//                                         )}
//                                     </span>

//                                     {/* Status badge - FIXED to show correct status */}
//                                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusColor}`}>
//                                         {roundStatus}
//                                     </span>
//                                 </div>

//                                 {/* Description from round object if present */}
//                                 {round.description && (
//                                     <p className="text-xs text-gray-500 mt-2 line-clamp-2">
//                                         {round.description}
//                                     </p>
//                                 )}
//                             </div>

//                             {/* Stats and actions */}
//                             <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0">
//                                 {/* Stats badges */}
//                                 <div className="flex gap-2 flex-wrap justify-end">
//                                     {loading ? (
//                                         <div className="text-xs text-gray-400 flex items-center gap-1">
//                                             <Loader2 size={12} className="animate-spin" /> Loading...
//                                         </div>
//                                     ) : (
//                                         <>
//                                             <div className="flex items-center gap-1.5 text-xs font-medium bg-green-50 px-2.5 py-1 rounded border border-green-100">
//                                                 <CheckCircle size={12} className="text-green-600" />
//                                                 <span className="text-green-700">{qualifiedCount} Passed</span>
//                                             </div>
//                                             {rejectedCount > 0 && (
//                                                 <div className="flex items-center gap-1.5 text-xs font-medium bg-red-50 px-2.5 py-1 rounded border border-red-100">
//                                                     <span className="text-red-700">{rejectedCount} Rejected</span>
//                                                 </div>
//                                             )}
//                                         </>
//                                     )}
//                                 </div>

//                                 {/* Upload button */}
//                                 <button
//                                     onClick={() => handleUpload(idx)}
//                                     disabled={isUploading}
//                                     className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
//                                 >
//                                     {isUploading ? (
//                                         <>
//                                             <Loader2 size={14} className="animate-spin" />
//                                             Uploading...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <UploadCloud size={14} />
//                                             Upload Results
//                                         </>
//                                     )}
//                                 </button>

//                                 {/* Helper text */}
//                                 <p className="text-[10px] text-gray-400 text-right leading-tight max-w-[200px]">
//                                     Excel must have: Roll Number, Result/Status columns
//                                 </p>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* Info banner */}
//             <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
//                 <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
//                 <div className="text-xs text-blue-800 leading-relaxed">
//                     <p className="font-bold mb-1">Round Result Upload Instructions:</p>
//                     <ul className="list-disc list-inside space-y-0.5 text-blue-700">
//                         <li>Excel must contain columns: <strong>Roll Number</strong> and <strong>Result</strong> (or Status)</li>
//                         <li>Result values: <strong>Passed</strong> / <strong>Qualified</strong> (cleared) or <strong>Rejected</strong> / <strong>Failed</strong></li>
//                         <li>Only Round 1 can create new applications automatically for eligible students</li>
//                         <li>Rounds 2+ require students to have cleared the previous round</li>
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// };

// import React, { useState, useEffect } from 'react';
// import { Job } from '../../../../../types';
// import { Calendar as CalendarIcon, CheckCircle, UploadCloud, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
// import { JobService } from '../../../../../services/jobService';

// /**
//  * JobRoundsTab – COMPLETE VERSION
//  * 
//  * Shows all selection rounds with live statistics from backend:
//  * - Round number and name
//  * - Date (or "Date not set" if missing)
//  * - Status (Completed / In Progress / Upcoming)
//  * - Passed count (students who cleared this round)
//  * - Rejected count (students rejected in this round)
//  * 
//  * Features:
//  * - Upload round results (Excel/CSV with Roll Number + Result columns)
//  * - Live stats refresh after upload
//  * - Handles completed rounds correctly (shows proper passed counts even when all rounds done)
//  * 
//  * Synced with backend getJobHiringStats() which uses fixed counting logic:
//  * - Counts students who MOVED PAST each round (currentRound > roundNum)
//  * - Properly handles final "Hired" status
//  */

// interface JobRoundsTabProps {
//     job: Job;
//     onUploadResult: (roundIndex: number, passedIds: string[]) => void;
// }

// export const JobRoundsTab: React.FC<JobRoundsTabProps> = ({ job, onUploadResult }) => {
//     const [hiringStats, setHiringStats] = useState<any>(null);
//     const [uploading,   setUploading]   = useState<number | null>(null);
//     const [loading,     setLoading]     = useState(false);
//     const [error,       setError]       = useState<string | null>(null);

//     // Get rounds from job object (parsed by backend into rounds[] array)
//     const rounds: any[] = job.rounds || [];

//     useEffect(() => {
//         loadStats();
//     }, [job.id]);

//     const loadStats = async () => {
//         try {
//             setLoading(true);
//             setError(null);
            
//             // Backend endpoint: GET /jobs/{id}/hiring-stats
//             // Returns: { jobId, jobTitle, totalRounds, rounds: [...] }
//             // Each round has: { roundNumber, roundName, passed, rejected, pending, roundStatus }
//             const stats = await JobService.getJobHiringStats(job.id);
//             setHiringStats(stats);
//         } catch (err: any) {
//             console.error('[JobRoundsTab] Stats load error:', err);
//             setError('Could not load round statistics');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleUpload = (roundIdx: number) => {
//         const input = document.createElement('input');
//         input.type   = 'file';
//         input.accept = '.csv,.xlsx,.xls';

//         input.onchange = async (e) => {
//             const file = (e.target as HTMLInputElement).files?.[0];
//             if (!file) return;

//             setUploading(roundIdx);
//             try {
//                 // Backend endpoint: POST /jobs/{id}/rounds/{roundIndex}/results
//                 // roundIndex is 1-based, so pass roundIdx + 1
//                 const result = await JobService.processRoundResultUpload(job.id, roundIdx + 1, file);

//                 // Refresh stats from backend
//                 await loadStats();

//                 // Notify parent to re-fetch job if needed
//                 onUploadResult(roundIdx + 1, []);

//                 // Show detailed result from backend
//                 const messages = [
//                     `✅ Round ${roundIdx + 1} results uploaded successfully!`,
//                     ``,
//                     `Passed: ${result.passed ?? 0}`,
//                     `Rejected: ${result.rejected ?? 0}`,
//                 ];

//                 if (result.newApplicationsCreated > 0) {
//                     messages.push(`New applications created: ${result.newApplicationsCreated}`);
//                 }

//                 if (result.errors && result.errors.length > 0) {
//                     messages.push(``, `⚠️ Warnings:`, ...result.errors.slice(0, 5));
//                     if (result.errors.length > 5) {
//                         messages.push(`... and ${result.errors.length - 5} more warnings`);
//                     }
//                 }

//                 alert(messages.join('\n'));
//             } catch (err: any) {
//                 const msg = err.response?.data?.error || err.message || 'Unknown error';
//                 alert(`❌ Upload failed:\n${msg}`);
//             } finally {
//                 setUploading(null);
//             }
//         };

//         input.click();
//     };

//     if (rounds.length === 0) {
//         return (
//             <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
//                 No selection rounds configured for this job.
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
//             {/* Header with refresh button */}
//             <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-bold text-gray-800">Selection Process Rounds</h3>
//                 <button
//                     onClick={loadStats}
//                     disabled={loading}
//                     className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600 disabled:opacity-50"
//                     title="Refresh round statistics"
//                 >
//                     <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
//                     Refresh Stats
//                 </button>
//             </div>

//             {/* Error banner */}
//             {error && (
//                 <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
//                     <AlertCircle size={16} className="shrink-0" />
//                     <span>{error}</span>
//                     <button onClick={loadStats} className="ml-auto text-xs underline">
//                         Retry
//                     </button>
//                 </div>
//             )}

//             {/* Rounds list */}
//             <div className="space-y-4">
//                 {rounds.map((round: any, idx: number) => {
//                     // Get stats for this round from backend
//                     // Backend returns: { roundNumber, roundName, passed, rejected, pending, roundStatus }
//                     const roundStat = hiringStats?.rounds?.find((r: any) => r.roundNumber === idx + 1);
                    
//                     // Use backend-calculated status and counts
//                     const roundStatus = roundStat?.roundStatus || 'Upcoming';
//                     const qualifiedCount = roundStat?.passed ?? 0;
//                     const rejectedCount = roundStat?.rejected ?? 0;
                    
//                     // Handle missing date field
//                     const roundDate = round.date || null;
//                     const hasDate = roundDate && roundDate.trim().length > 0;
                    
//                     const isUploading = uploading === idx;
                    
//                     // Status badge styling
//                     const statusColors = {
//                         'Completed':   'bg-green-100 text-green-700 border-green-200',
//                         'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
//                         'Upcoming':    'bg-orange-100 text-orange-700 border-orange-200',
//                     };
//                     const statusColor = statusColors[roundStatus as keyof typeof statusColors] || statusColors['Upcoming'];

//                     return (
//                         <div
//                             key={idx}
//                             className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md transition-shadow"
//                         >
//                             {/* Round number badge */}
//                             <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl shrink-0 border-2 border-white shadow-sm">
//                                 {idx + 1}
//                             </div>

//                             {/* Round info */}
//                             <div className="flex-1 min-w-0">
//                                 <h4 className="font-bold text-lg text-gray-900 truncate">
//                                     {round.name || `Round ${idx + 1}`}
//                                 </h4>
//                                 <div className="flex items-center flex-wrap gap-2 mt-1.5 text-sm text-gray-500">
//                                     {/* Date display */}
//                                     <span className="flex items-center gap-1">
//                                         <CalendarIcon size={14} className="text-gray-400" />
//                                         {hasDate ? (
//                                             <span className="font-medium">{roundDate}</span>
//                                         ) : (
//                                             <span className="italic text-gray-400">Date not set</span>
//                                         )}
//                                     </span>

//                                     {/* Status badge */}
//                                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusColor}`}>
//                                         {roundStatus}
//                                     </span>
//                                 </div>

//                                 {/* Description from round object if present */}
//                                 {round.description && (
//                                     <p className="text-xs text-gray-500 mt-2 line-clamp-2">
//                                         {round.description}
//                                     </p>
//                                 )}
//                             </div>

//                             {/* Stats and actions */}
//                             <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0">
//                                 {/* Stats badges */}
//                                 <div className="flex gap-2 flex-wrap justify-end">
//                                     {loading ? (
//                                         <div className="text-xs text-gray-400 flex items-center gap-1">
//                                             <Loader2 size={12} className="animate-spin" /> Loading...
//                                         </div>
//                                     ) : (
//                                         <>
//                                             <div className="flex items-center gap-1.5 text-xs font-medium bg-green-50 px-2.5 py-1 rounded border border-green-100">
//                                                 <CheckCircle size={12} className="text-green-600" />
//                                                 <span className="text-green-700">{qualifiedCount} Passed</span>
//                                             </div>
//                                             {rejectedCount > 0 && (
//                                                 <div className="flex items-center gap-1.5 text-xs font-medium bg-red-50 px-2.5 py-1 rounded border border-red-100">
//                                                     <span className="text-red-700">{rejectedCount} Rejected</span>
//                                                 </div>
//                                             )}
//                                         </>
//                                     )}
//                                 </div>

//                                 {/* Upload button */}
//                                 <button
//                                     onClick={() => handleUpload(idx)}
//                                     disabled={isUploading}
//                                     className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
//                                 >
//                                     {isUploading ? (
//                                         <>
//                                             <Loader2 size={14} className="animate-spin" />
//                                             Uploading...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <UploadCloud size={14} />
//                                             Upload Results
//                                         </>
//                                     )}
//                                 </button>

//                                 {/* Helper text */}
//                                 <p className="text-[10px] text-gray-400 text-right leading-tight max-w-[200px]">
//                                     Excel must have: Roll Number, Result/Status columns
//                                 </p>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* Info banner */}
//             <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
//                 <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
//                 <div className="text-xs text-blue-800 leading-relaxed">
//                     <p className="font-bold mb-1">Round Result Upload Instructions:</p>
//                     <ul className="list-disc list-inside space-y-0.5 text-blue-700">
//                         <li>Excel must contain columns: <strong>Roll Number</strong> and <strong>Result</strong> (or Status)</li>
//                         <li>Result values: <strong>Passed</strong> / <strong>Qualified</strong> (cleared) or <strong>Rejected</strong> / <strong>Failed</strong></li>
//                         <li>Only Round 1 can create new applications automatically for eligible students</li>
//                         <li>Rounds 2+ require students to have cleared the previous round</li>
//                         <li>Stats automatically refresh after each upload to show latest counts</li>
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// };

import React, { useState, useEffect } from 'react';
import { Job } from '../../../../../types';
import { Calendar as CalendarIcon, CheckCircle, UploadCloud, Loader2, RefreshCw, AlertCircle, XCircle } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

/**
 * JobRoundsTab – FIXED VERSION
 * * Corrected mapping for hiring-stats API:
 * - roundStatus -> status
 * - passed -> passedCount
 * - rejected -> rejectedCount
 */

interface JobRoundsTabProps {
    job: Job;
    onUploadResult: (roundIndex: number, passedIds: string[]) => void;
}

export const JobRoundsTab: React.FC<JobRoundsTabProps> = ({ job, onUploadResult }) => {
    const [hiringStats, setHiringStats] = useState<any>(null);
    const [uploading, setUploading] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get rounds from job object
    const rounds: any[] = job.rounds || [];

    useEffect(() => {
        loadStats();
    }, [job.id]);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetching from: /jobs/{id}/hiring-stats
            const stats = await JobService.getJobHiringStats(job.id);
            setHiringStats(stats);
        } catch (err: any) {
            console.error('[JobRoundsTab] Stats load error:', err);
            setError('Could not load round statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = (roundIdx: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setUploading(roundIdx);
            try {
                const result = await JobService.processRoundResultUpload(job.id, roundIdx + 1, file);

                // Refresh stats from backend to get updated counts
                await loadStats();

                // Notify parent
                onUploadResult(roundIdx + 1, []);

                const messages = [
                    `✅ Round ${roundIdx + 1} results uploaded successfully!`,
                    `-----------------------------------`,
                    `Passed: ${result.passed ?? 0}`,
                    `Rejected: ${result.rejected ?? 0}`,
                ];

                if (result.newApplicationsCreated > 0) {
                    messages.push(`New applications created: ${result.newApplicationsCreated}`);
                }

                alert(messages.join('\n'));
            } catch (err: any) {
                const msg = err.response?.data?.error || err.message || 'Unknown error';
                alert(`❌ Upload failed:\n${msg}`);
            } finally {
                setUploading(null);
            }
        };

        input.click();
    };

    if (rounds.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                No selection rounds configured for this job.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Selection Process Rounds</h3>
                <button
                    onClick={loadStats}
                    disabled={loading}
                    className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600 disabled:opacity-50"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Refresh Stats
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                    <button onClick={loadStats} className="ml-auto text-xs underline">Retry</button>
                </div>
            )}

            {/* Rounds list */}
            <div className="space-y-4">
                {rounds.map((round: any, idx: number) => {
                    // FIX: Find round stats by matching roundNumber
                    const roundStat = hiringStats?.rounds?.find((r: any) => r.roundNumber === idx + 1);
                    
                    // FIX: Map the correct fields from your JSON response
                    const roundStatus = roundStat?.status || 'Upcoming';
                    const qualifiedCount = roundStat?.passedCount ?? 0;
                    const rejectedCount = roundStat?.rejectedCount ?? 0;
                    
                    const roundDate = round.date || null;
                    const hasDate = roundDate && roundDate.trim().length > 0;
                    const isUploading = uploading === idx;
                    
                    const statusColors = {
                        'Completed':   'bg-green-100 text-green-700 border-green-200',
                        'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
                        'Upcoming':    'bg-gray-100 text-gray-600 border-gray-200',
                    };
                    const statusColor = statusColors[roundStatus as keyof typeof statusColors] || statusColors['Upcoming'];

                    return (
                        <div
                            key={idx}
                            className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md transition-shadow"
                        >
                            {/* Round number badge */}
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl shrink-0 border border-indigo-100">
                                {idx + 1}
                            </div>

                            {/* Round info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg text-gray-900 truncate">
                                    {round.name || `Round ${idx + 1}`}
                                </h4>
                                <div className="flex items-center flex-wrap gap-3 mt-1.5 text-sm">
                                    <span className="flex items-center gap-1 text-gray-500">
                                        <CalendarIcon size={14} />
                                        {hasDate ? roundDate : <span className="italic opacity-60">Not Scheduled</span>}
                                    </span>

                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusColor}`}>
                                        {roundStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Stats & Actions */}
                            <div className="flex flex-col items-end gap-3 w-full md:w-auto shrink-0">
                                <div className="flex gap-2">
                                    {loading ? (
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <Loader2 size={12} className="animate-spin" /> Updating...
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-100 text-green-700">
                                                <CheckCircle size={13} />
                                                {qualifiedCount} Passed
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 px-3 py-1.5 rounded-full border border-red-100 text-red-700">
                                                <XCircle size={13} />
                                                {rejectedCount} Rejected
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleUpload(idx)}
                                    disabled={isUploading}
                                    className="w-full md:w-auto px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                                    {isUploading ? 'Uploading...' : 'Upload Results'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Instruction Footer */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                    <p className="font-bold mb-1 text-amber-900">Important Note:</p>
                    <p>Ensure your file has <strong>Roll Number</strong> and <strong>Result</strong> columns. Valid results are "Passed" or "Rejected". Stats shown above reflect the historical data recorded in the system for this job.</p>
                </div>
            </div>
        </div>
    );
};