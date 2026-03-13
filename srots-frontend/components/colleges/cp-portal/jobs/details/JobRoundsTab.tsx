import React, { useState, useCallback } from 'react';
import { Job } from '../../../../../types';
import {
    Calendar as CalendarIcon, CheckCircle, UploadCloud, Loader2,
    RefreshCw, AlertCircle, XCircle, AlertTriangle, X,
} from 'lucide-react';
import { JobService } from '../../../../../services/jobService';
import { useToast } from '../../../../common/Toast';

interface RoundStat {
    roundNumber:   number;
    roundName:     string;
    status:        'Upcoming' | 'In Progress' | 'Completed';
    passedCount:   number;
    rejectedCount: number;
}

interface HiringStats {
    rounds: RoundStat[];
}

interface Round {
    name?: string;
    date?: string;
}

interface UploadResult {
    passed:                 number;
    rejected:               number;
    newApplicationsCreated: number;
}

interface JobRoundsTabProps {
    job: Job;
    onUploadResult: (roundIndex: number, passedIds: string[]) => void;
}

export const JobRoundsTab: React.FC<JobRoundsTabProps> = ({ job, onUploadResult }) => {
    const toast = useToast();
    const [hiringStats,      setHiringStats]      = useState<HiringStats | null>(null);
    const [uploading,        setUploading]         = useState<number | null>(null);
    const [loading,          setLoading]           = useState(false);
    const [error,            setError]             = useState<string | null>(null);
    const [confirmRoundIdx,  setConfirmRoundIdx]   = useState<number | null>(null);

    const rounds: Round[] = (job.rounds as Round[]) || [];

    const loadStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const stats = await JobService.getJobHiringStats(job.id);
            setHiringStats(stats);
        } catch (err) {
            console.error('[JobRoundsTab] Stats load error:', err);
            setError('Could not load round statistics');
        } finally {
            setLoading(false);
        }
    }, [job.id]);

    // Run on mount and when job changes
    React.useEffect(() => { loadStats(); }, [loadStats]);

    /** Open file picker after user confirms */
    const doUpload = (roundIdx: number) => {
        setConfirmRoundIdx(null);
        const input = document.createElement('input');
        input.type   = 'file';
        input.accept = '.csv,.xlsx,.xls';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setUploading(roundIdx);
            try {
                const result: UploadResult = await JobService.processRoundResultUpload(
                    job.id, roundIdx + 1, file,
                );

                await loadStats();
                onUploadResult(roundIdx + 1, []);

                const extra = result.newApplicationsCreated > 0
                    ? ` · ${result.newApplicationsCreated} new applications created`
                    : '';
                toast.success(
                    `Round ${roundIdx + 1} uploaded — ${result.passed ?? 0} passed, ${result.rejected ?? 0} rejected${extra}`
                );
            } catch (err: any) {
                const msg = err.response?.data?.error || err.message || 'Unknown error';
                toast.error(`Upload failed: ${msg}`);
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

    const statusColors: Record<string, string> = {
        'Completed':   'bg-green-100 text-green-700 border-green-200',
        'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
        'Upcoming':    'bg-gray-100 text-gray-600 border-gray-200',
    };

    return (
        <>
            {/* ── Confirmation modal ──────────────────────────────────────────── */}
            {confirmRoundIdx !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="text-amber-600" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Upload Round {confirmRoundIdx + 1} Results?</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    This will update pass/fail status for all students in this round.
                                    <strong className="text-gray-700"> This action cannot be undone.</strong>
                                </p>
                            </div>
                            <button onClick={() => setConfirmRoundIdx(null)}
                                className="ml-auto text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => setConfirmRoundIdx(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => doUpload(confirmRoundIdx)}
                                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <UploadCloud size={14} /> Yes, Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    {rounds.map((round: Round, idx: number) => {
                        const roundStat = hiringStats?.rounds?.find(
                            (r: RoundStat) => r.roundNumber === idx + 1,
                        );
                        const roundStatus  = roundStat?.status    ?? 'Upcoming';
                        const qualifiedCount = roundStat?.passedCount   ?? 0;
                        const rejectedCount  = roundStat?.rejectedCount ?? 0;
                        const roundDate    = round.date ?? null;
                        const hasDate      = !!roundDate && roundDate.trim().length > 0;
                        const isUploading  = uploading === idx;
                        const statusColor  = statusColors[roundStatus] ?? statusColors['Upcoming'];

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
                                        onClick={() => setConfirmRoundIdx(idx)}
                                        disabled={isUploading}
                                        className="w-full md:w-auto px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {isUploading
                                            ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                                            : <><UploadCloud size={14} /> Upload Results</>
                                        }
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
                        <p>
                            Ensure your file has <strong>Roll Number</strong> and <strong>Result</strong> columns.
                            Valid results are "Passed" or "Rejected". Stats shown above reflect the historical
                            data recorded in the system for this job.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
