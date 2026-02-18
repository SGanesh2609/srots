
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

import React, { useState, useEffect } from 'react';
import { Job } from '../../../../../types';
import { Calendar as CalendarIcon, CheckCircle, UploadCloud, Loader2, RefreshCw } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

/**
 * JobRoundsTab – FIXED
 *
 * Issues fixed:
 *  1. job.rounds may not be populated if the job came from a stale prop –
 *     the component now also reads from roundsJson (parsed by mapDtoToJob).
 *  2. After upload, fetches updated hiring stats from backend to show live counts.
 *  3. Alert shows passed/rejected/errors from backend response.
 *  4. roundIndex passed as 1-based to match backend: roundIndex + 1.
 */

interface JobRoundsTabProps {
    job: Job;
    onUploadResult: (roundIndex: number, passedIds: string[]) => void;
}

export const JobRoundsTab: React.FC<JobRoundsTabProps> = ({ job, onUploadResult }) => {
    const [hiringStats, setHiringStats] = useState<any>(null);
    const [uploading,   setUploading]   = useState<number | null>(null); // roundIndex being uploaded
    const [statsLoading, setStatsLoading] = useState(false);

    // Rounds come from the parsed `rounds` array (populated by mapDtoToJob)
    // Fall back to empty array if not loaded yet.
    const rounds: any[] = job.rounds || [];

    // Load hiring stats on mount so we can show qualified counts per round
    useEffect(() => {
        loadStats();
    }, [job.id]);

    const loadStats = async () => {
        try {
            setStatsLoading(true);
            const stats = await JobService.getJobHiringStats(job.id);
            setHiringStats(stats);
        } catch (err) {
            console.warn('[JobRoundsTab] Could not load hiring stats:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    /**
     * handleUpload – triggers file picker, uploads to backend, refreshes stats.
     * roundIdx is 0-based (array index); backend expects 1-based roundIndex.
     */
    const handleUpload = (roundIdx: number) => {
        const input = document.createElement('input');
        input.type   = 'file';
        input.accept = '.csv,.xlsx,.xls';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setUploading(roundIdx);
            try {
                // Backend: POST /jobs/{id}/rounds/{roundIndex}/results
                // roundIndex is 1-based → pass roundIdx + 1
                const result = await JobService.processRoundResultUpload(job.id, roundIdx + 1, file);

                // Refresh stats from backend
                await loadStats();

                // Notify parent to re-fetch job if needed
                onUploadResult(roundIdx + 1, []);

                // Show detailed result from backend
                const lines = [
                    `✅ Round ${roundIdx + 1} results processed!`,
                    `Passed:  ${result.passed   ?? 0}`,
                    `Rejected: ${result.rejected ?? 0}`,
                ];
                if (result.newApplicationsCreated > 0)
                    lines.push(`New applications created: ${result.newApplicationsCreated}`);
                if (result.errors?.length > 0)
                    lines.push(`\nWarnings:\n${result.errors.slice(0, 5).join('\n')}`);

                alert(lines.join('\n'));
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
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Selection Process Rounds</h3>
                <button
                    onClick={loadStats}
                    disabled={statsLoading}
                    className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600"
                >
                    <RefreshCw size={12} className={statsLoading ? 'animate-spin' : ''} />
                    Refresh Stats
                </button>
            </div>

            {rounds.map((round: any, idx: number) => {
                // Get qualified count from hiring stats (backend provides per-round counts)
                const roundStat   = hiringStats?.rounds?.find((r: any) => r.roundNumber === idx + 1);
                const qualifiedCount = roundStat?.passed   ?? round.qualifiedCount ?? 0;
                const rejectedCount  = roundStat?.rejected ?? 0;
                const roundStatus    = roundStat?.roundStatus ?? round.status ?? 'Upcoming';

                const isUploading = uploading === idx;

                return (
                    <div
                        key={idx}
                        className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6"
                    >
                        {/* Round number badge */}
                        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl shrink-0 border-2 border-white shadow-sm">
                            {idx + 1}
                        </div>

                        {/* Round info */}
                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900">{round.name || `Round ${idx + 1}`}</h4>
                            <p className="text-sm text-gray-500 flex items-center flex-wrap gap-2 mt-1">
                                {round.date && (
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon size={14} className="text-gray-400" />
                                        {round.date}
                                    </span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                    roundStatus === 'Completed'
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : roundStatus === 'In Progress'
                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                        : 'bg-orange-100 text-orange-700 border-orange-200'
                                }`}>
                                    {roundStatus}
                                </span>
                            </p>
                        </div>

                        {/* Stats + action */}
                        <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0">
                            <div className="flex gap-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-green-50 px-2 py-1 rounded border border-green-100">
                                    <CheckCircle size={12} className="text-green-600" />
                                    {statsLoading ? '—' : qualifiedCount} Passed
                                </div>
                                {rejectedCount > 0 && (
                                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded border border-red-100">
                                        {rejectedCount} Rejected
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleUpload(idx)}
                                disabled={isUploading}
                                className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isUploading
                                    ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                                    : <><UploadCloud size={14} /> Upload Results (Excel/CSV)</>
                                }
                            </button>

                            <p className="text-[10px] text-gray-400 text-right">
                                Excel must have columns: Roll Number, Result/Status
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};