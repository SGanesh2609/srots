import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StudentJobView, Student } from '../../../types';
import { useUrlParam, useUrlArrayParam } from '../../../hooks/useUrlParam';
import { JobService } from '../../../services/jobService';
import { JobDetailView } from './jobs/details/JobDetailView';
import { JobFilters } from './jobs/JobFilters';
import { JobListDesktop } from './jobs/JobListDesktop';
import { JobListMobile } from './jobs/JobListMobile';
import { useDebounce } from '../../../hooks/useDebounce';
import { useToast } from '../../common/Toast';
import { Briefcase, Loader2, RefreshCw } from 'lucide-react';

interface StudentJobsProps {
  student: Student;
}

export const StudentJobs: React.FC<StudentJobsProps> = ({ student }) => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const abortRef = useRef<AbortController | null>(null);

  const [jobs,        setJobs]        = useState<StudentJobView[]>([]);
  const [selectedJob, setSelectedJob] = useState<StudentJobView | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [hasError,    setHasError]    = useState(false);

  // ── Filters — synced to URL so state survives refresh ─────────────────────
  const [statusFilter,    setStatusFilter]    = useUrlParam('status', 'all');
  const [typeFilters,     setTypeFilters]     = useUrlArrayParam('types');
  const [workModeFilters, setWorkModeFilters] = useUrlArrayParam('modes');
  const [searchQuery,     setSearchQuery]     = useState('');

  // Debounce the search input so we don't hit the API on every keystroke
  const debouncedSearch = useDebounce(searchQuery, 350);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const refreshJobs = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setHasError(false);
    try {
      const results = await JobService.getJobsForStudent({
        status:   statusFilter,
        query:    debouncedSearch,
        type:     typeFilters,
        workMode: workModeFilters,
      });
      setJobs(Array.isArray(results) ? results : []);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error('[StudentJobs] Error:', err);
      setHasError(true);
      toast.error('Failed to load jobs. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [student.id, debouncedSearch, statusFilter, typeFilters, workModeFilters]);

  useEffect(() => {
    refreshJobs();
    return () => { abortRef.current?.abort(); };
  }, [refreshJobs]);

  // After jobs load, restore deep-linked job from URL
  useEffect(() => {
    if (jobs.length === 0 || selectedJob) return;
    const jobId = searchParams.get('job');
    if (!jobId) return;
    const match = jobs.find(j => j.job.id === jobId);
    if (match) setSelectedJob(match);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectJob = useCallback((job: StudentJobView | null) => {
    setSelectedJob(job);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (job) p.set('job', job.job.id); else p.delete('job');
      return p;
    }, { replace: true });
  }, [setSearchParams]);

  const toggleTypeFilter = useCallback((type: string) => {
    const next = typeFilters.includes(type)
      ? typeFilters.filter(t => t !== type)
      : [...typeFilters, type];
    setTypeFilters(next);
  }, [typeFilters, setTypeFilters]);

  const toggleWorkModeFilter = useCallback((mode: string) => {
    const next = workModeFilters.includes(mode)
      ? workModeFilters.filter(m => m !== mode)
      : [...workModeFilters, mode];
    setWorkModeFilters(next);
  }, [workModeFilters, setWorkModeFilters]);

  const handleStatusChange = useCallback((status: string) => {
    setStatusFilter(status);
  }, [setStatusFilter]);

  const handleMobileTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val  = e.target.value;
    const next = val === 'All' ? [] : [val];
    setTypeFilters(next);
  }, [setTypeFilters]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (selectedJob) {
    return (
      <JobDetailView
        job={selectedJob.job}
        student={student}
        viewData={selectedJob}
        onBack={() => handleSelectJob(null)}
        onApply={async (id) => {
          await JobService.applyToJob(id);
          toast.success('Application submitted successfully!');
          refreshJobs();
          handleSelectJob(null);
        }}
        onNotInterested={async (id) => {
          await JobService.markNotInterested(id);
          toast.info('Marked as Not Interested.');
          refreshJobs();
          handleSelectJob(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4 relative">
      <JobFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusChange}
        typeFilters={typeFilters}
        toggleTypeFilter={toggleTypeFilter}
        workModeFilters={workModeFilters}
        toggleWorkModeFilter={toggleWorkModeFilter}
        handleMobileTypeChange={handleMobileTypeChange}
      />

      {/* ── Loading ────────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={22} />
          <span className="text-sm font-medium">Loading opportunities…</span>
        </div>
      )}

      {/* ── Error state ────────────────────────────────────────────────── */}
      {!isLoading && hasError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <p className="text-sm text-red-500 font-medium">Failed to load jobs.</p>
          <button
            onClick={refreshJobs}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {!isLoading && !hasError && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Briefcase size={32} className="text-blue-300" />
          </div>
          <div>
            <p className="font-bold text-gray-700 text-lg">No opportunities found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery || typeFilters.length || workModeFilters.length || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Check back soon — new drives are posted regularly.'}
            </p>
          </div>
          {(searchQuery || typeFilters.length > 0 || workModeFilters.length > 0 || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilters([]);
                setWorkModeFilters([]);
                setStatusFilter('all');
              }}
              className="text-sm text-blue-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Job lists ──────────────────────────────────────────────────── */}
      {!isLoading && !hasError && jobs.length > 0 && (
        <>
          <JobListDesktop jobs={jobs} onSelectJob={handleSelectJob} statusFilter={statusFilter} />
          <JobListMobile  jobs={jobs} onSelectJob={handleSelectJob} />
        </>
      )}
    </div>
  );
};
