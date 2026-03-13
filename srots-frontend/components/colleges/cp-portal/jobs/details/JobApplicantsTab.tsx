import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Job } from '../../../../../types';
import { Briefcase, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Pagination } from '../../../../common/Pagination';
import { JobService } from '../../../../../services/jobService';

const PAGE_SIZE = 20;

// ── Proper types (replaces `any`) ─────────────────────────────────────────────

interface RoundSummaryItem {
  roundNumber: number;
  roundName:   string;
  studentCount: number;
}

interface ApplicantsDashboard {
  students:    Record<string, string | number>[];
  headers:     string[];
  globalStats: Record<string, number>;
  roundSummary: RoundSummaryItem[];
}

interface JobApplicantsTabProps {
  job:            Job;
  onDownloadList: (type: 'applicants') => void;
}

export const JobApplicantsTab: React.FC<JobApplicantsTabProps> = ({ job, onDownloadList }) => {
  const [dashboard, setDashboard] = useState<ApplicantsDashboard | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [page,      setPage]      = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const loadApplicants = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const data = await JobService.getJobApplicantsDashboard(job.id);
      setDashboard(data as ApplicantsDashboard);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error('[JobApplicantsTab] Load error:', err);
      setError('Failed to load applicants directory.');
    } finally {
      setLoading(false);
    }
  }, [job.id]);

  useEffect(() => {
    setPage(0); // reset page on job change
    loadApplicants();
    return () => { abortRef.current?.abort(); };
  }, [loadApplicants]);

  // ── Memoised derived values (no recalc on unrelated re-renders) ─────────────
  const students      = useMemo(() => dashboard?.students    ?? [], [dashboard]);
  const headers       = useMemo(() => dashboard?.headers     ?? [], [dashboard]);
  const globalStats   = useMemo(() => dashboard?.globalStats ?? {}, [dashboard]);
  const roundSummary  = useMemo(() => dashboard?.roundSummary ?? [], [dashboard]);
  const displayHeaders = useMemo(
    () => headers.length > 0 ? headers : ['Roll Number', 'Full Name', 'Current Status'],
    [headers],
  );
  const totalPages    = useMemo(() => Math.ceil(students.length / PAGE_SIZE), [students.length]);
  const pageStudents  = useMemo(
    () => students.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [students, page],
  );

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading directory…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
        <AlertCircle size={32} />
        <p className="text-sm">{error}</p>
        <button onClick={loadApplicants} className="text-xs text-blue-600 underline flex items-center gap-1">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Briefcase size={20} className="text-blue-600" />
            Applicant Directory
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {students.length}
            </span>
          </h3>
          <button onClick={loadApplicants} title="Refresh" className="text-gray-400 hover:text-blue-600 transition-colors">
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

      {/* ── Stats Badges ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex gap-3 flex-wrap">
          {Object.entries(globalStats).map(([label, count]) =>
            count > 0 && (
              <div key={label} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs shadow-sm">
                <span className="font-bold text-gray-700 uppercase">{label}:</span>
                <span className="ml-2 text-blue-600 font-bold">{count}</span>
              </div>
            )
          )}
        </div>
        {roundSummary.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {roundSummary.map((r) => (
              <div key={r.roundNumber} className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs">
                <span className="font-bold text-indigo-800">Round {r.roundNumber}: {r.roundName}</span>
                <span className="ml-2 text-indigo-600">{r.studentCount} student{r.studentCount !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop Table ──────────────────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm min-w-[1000px]">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                {displayHeaders.map((h) => (
                  <th key={h} className="px-4 py-4 whitespace-nowrap border-b">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageStudents.length === 0 ? (
                <tr>
                  <td colSpan={displayHeaders.length} className="px-6 py-12 text-center text-gray-400">
                    No applicants found for this job.
                  </td>
                </tr>
              ) : (
                pageStudents.map((student, idx) => (
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
                        <td key={h} className="px-4 py-3 text-gray-700 whitespace-nowrap">{String(val)}</td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Cards ───────────────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {pageStudents.map((student, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{String(student['Full Name'] ?? '—')}</h4>
                <p className="text-xs font-mono text-gray-500">{String(student['Roll Number'] ?? '—')}</p>
              </div>
              <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                {String(student['Current Status'] ?? 'Applied')}
              </span>
            </div>
            <div className="text-xs space-y-2 pt-3 border-t border-gray-100">
              {displayHeaders.slice(3).map(h => (
                <div key={h} className="flex justify-between">
                  <span className="text-gray-500">{h}:</span>
                  <span className="font-medium text-gray-800 text-right">{String(student[h] ?? '—')}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={students.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemLabel="applicants"
      />
    </div>
  );
};
