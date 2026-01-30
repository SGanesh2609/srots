
import React from 'react';
import { Job } from '../../../../../types';
import { Calendar as CalendarIcon, CheckCircle, UploadCloud } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

/**
 * Component Name: JobRoundsTab
 * Directory: components/colleges/cp-portal/jobs/details/JobRoundsTab.tsx
 * 
 * Functionality:
 * - Lists all selection rounds (e.g., Aptitude, Interview).
 * - Shows status of each round.
 * - Provides button to upload result Excel/CSV for each round.
 * - Passes file to Backend Service for processing.
 * 
 * Used In: JobDetailView
 */

interface JobRoundsTabProps {
    job: Job;
    onUploadResult: (roundIndex: number, passedIds: string[]) => void;
}

export const JobRoundsTab: React.FC<JobRoundsTabProps> = ({ job, onUploadResult }) => {

    const handleUploadRoundResult = (roundIdx: number) => {
        const input = document.createElement('input'); 
        input.type = 'file'; 
        input.accept = '.csv, .xlsx, .xls'; 
        
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                // Delegate logic to backend service
                const result = await JobService.processRoundResultUpload(job.id, roundIdx, file);
                onUploadResult(roundIdx, []); // Refresh UI handled by parent re-fetch
                alert(`Results Processed Successfully!\n${result.count} Students marked as Passed.`); 
            } catch (err: any) {
                console.error(err);
                alert("Error processing file: " + err.message);
            }
        };
        input.click();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-gray-800">Selection Process Rounds</h3></div>
            {job.rounds.map((round, idx) => {
                // 3-Tier Sync: Use backend provided count instead of calculating on client
                const qualifiedCount = round.qualifiedCount !== undefined ? round.qualifiedCount : 0;
                
                return (
                <div key={idx} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl shrink-0 border-2 border-white shadow-sm">{idx + 1}</div>
                    <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900">{round.name}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1"><CalendarIcon size={14} className="text-gray-400"/> {round.date}<span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${round.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>{round.status}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded border"><CheckCircle size={12} className="text-green-600"/>{qualifiedCount} Qualified</div>
                        <button onClick={() => handleUploadRoundResult(idx)} className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition-all"><UploadCloud size={14}/> Upload Results (Excel/CSV)</button>
                    </div>
                </div>
            )})}
            {job.rounds.length === 0 && <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">No specific rounds configured for this job.</div>}
        </div>
    );
};
