import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JobService, AdminJobFilters, JobsPageResult } from '../../../../services/jobService';
import { Job, User } from '../../../../types';
import { Plus, LayoutGrid, FileDiff, FileText, Database, Archive } from 'lucide-react';
import { useToast } from '../../../common/Toast';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useUrlParam, useUrlArrayParam } from '../../../../hooks/useUrlParam';
import { JobWizard } from './JobWizard';
import { GlobalResultComparator } from './tools/GlobalResultComparator';
import { GlobalReportExtractor } from './tools/GlobalReportExtractor';
import { CustomGathering } from './tools/CustomGathering';
import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';
import { Pagination } from '../../../../components/common/Pagination';
import { JobFilterBar } from './lists/JobFilterBar';
import { JobsTable } from './lists/JobsTable';
import { JobDetailView } from './details/JobDetailView';

interface JobsSectionProps { user: User; }

const PAGE_SIZE = 10;

export const JobsSection: React.FC<JobsSectionProps> = ({ user }) => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [pageResult,      setPageResult]      = useState<JobsPageResult>({ content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: PAGE_SIZE });
  const [selectedJob,     setSelectedJob]     = useState<Job | null>(null);
  const [sectionTab,      setSectionTab]      = useState<'list' | 'comparator' | 'extractor' | 'gathering'>(
    () => {
      const t = searchParams.get('section') as 'list' | 'comparator' | 'extractor' | 'gathering';
      return ['list', 'comparator', 'extractor', 'gathering'].includes(t) ? t : 'list';
    }
  );

  // Filters — synced to URL via hooks so state survives refresh
  const [jobOwnerFilter,  setJobOwnerFilter]  = useUrlParam('jown', 'all');
  const [filterTypes,     setFilterTypes]     = useUrlArrayParam('jtypes');
  const [filterModes,     setFilterModes]     = useUrlArrayParam('jmodes');
  const [filterStatuses,  setFilterStatuses]  = useUrlArrayParam('jstatuses');
  const [searchQuery,     setSearchQuery]     = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [currentPage,     setCurrentPage]     = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const handleOwnerFilter  = (own: 'all' | 'my') => setJobOwnerFilter(own);
  const handleToggleType   = (t: string) => setFilterTypes(filterTypes.includes(t) ? filterTypes.filter(x => x !== t) : [...filterTypes, t]);
  const handleToggleMode   = (m: string) => setFilterModes(filterModes.includes(m) ? filterModes.filter(x => x !== m) : [...filterModes, m]);
  const handleToggleStatus = (s: string) => setFilterStatuses(filterStatuses.includes(s) ? filterStatuses.filter(x => x !== s) : [...filterStatuses, s]);
  const [isLoading,       setIsLoading]       = useState(false);

  // Wizard
  const [showWizard,   setShowWizard]   = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editingJob,   setEditingJob]   = useState<Job | null>(null);

  // Delete modals
  const [softDeleteTarget, setSoftDeleteTarget] = useState<Job | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Job | null>(null);
  const [deleteReason,     setDeleteReason]     = useState('');

  const canSeeArchived = JobService.canSeeArchivedJobs(user);
  const canHardDelete  = JobService.canHardDelete(user);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchJobs = useCallback(async () => {
    if (sectionTab !== 'list') return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    try {
      const filters: AdminJobFilters = {
        query:           debouncedSearch || undefined,
        types:           filterTypes,
        modes:           filterModes,
        statuses:        filterStatuses,
        ownerId:         jobOwnerFilter === 'my' ? user.id : undefined,
        includeArchived: canSeeArchived ? includeArchived : false,
        page:            currentPage,
        size:            PAGE_SIZE,
      };
      const result = await JobService.searchJobs(user.collegeId || '', filters);
      setPageResult(result);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error('[JobsSection] Fetch failed:', err?.response?.data || err.message);
      setPageResult({ content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: PAGE_SIZE });
    } finally {
      setIsLoading(false);
    }
  }, [user.collegeId, user.id, debouncedSearch, filterTypes, filterModes, filterStatuses,
      jobOwnerFilter, includeArchived, currentPage, sectionTab, canSeeArchived]);

  useEffect(() => { fetchJobs(); return () => { abortRef.current?.abort(); }; }, [fetchJobs]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(0); }, [debouncedSearch, filterTypes, filterModes, filterStatuses, jobOwnerFilter, includeArchived]);

  // On mount: restore selected job from URL (deep link)
  useEffect(() => {
    const jobId = searchParams.get('job');
    if (!jobId) return;
    JobService.getJobDetail(jobId)
      .then(job => { if (job) setSelectedJob(job); })
      .catch(() => setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('job'); return p; }, { replace: true }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── URL-synced selection helpers ──────────────────────────────────────────

  const handleSelectJob = (job: Job | null) => {
    setSelectedJob(job);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (job) p.set('job', job.id); else p.delete('job');
      return p;
    }, { replace: true });
  };

  const handleSectionTab = (tab: 'list' | 'comparator' | 'extractor' | 'gathering') => {
    setSectionTab(tab);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (tab !== 'list') p.set('section', tab); else p.delete('section');
      p.delete('job'); // clear job selection when switching tabs
      return p;
    }, { replace: true });
  };

  // ── Wizard ────────────────────────────────────────────────────────────────

  const openCreate = () => { setIsEditingJob(false); setEditingJob(null); handleSelectJob(null); setShowWizard(true); };
  const openEdit   = (e: React.MouseEvent | undefined, job: Job) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setEditingJob(job); setIsEditingJob(true); setShowWizard(true);
  };

  const handleSaveJob = async (formData: Partial<import('../../../../types').JobFormState>, jdFiles: File[], avoidList?: File) => {
    try {
      const collegeCode = user.collegeId || '';
      if (isEditingJob && editingJob) {
        await JobService.updateJob(editingJob.id, formData, jdFiles, avoidList || null, collegeCode);
      } else {
        await JobService.createJob(
          { ...formData, collegeId: user.collegeId, postedById: user.id },
          jdFiles, avoidList || null, collegeCode
        );
      }
      toast.success(isEditingJob ? 'Job updated successfully.' : 'Job posted successfully.');
      fetchJobs();
      setShowWizard(false);
    } catch (err: any) {
      toast.error('Failed to save job: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  // ── Delete actions ────────────────────────────────────────────────────────

  const requestSoftDelete = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation(); e.preventDefault();
    if (!JobService.canManageJob(user, job)) { toast.warning('You do not have permission to archive this job.'); return; }
    setSoftDeleteTarget(job);
    setDeleteReason('');
  };

  const requestHardDelete = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation(); e.preventDefault();
    if (!canHardDelete) { toast.warning('Only CPH/Admin can permanently delete jobs.'); return; }
    setHardDeleteTarget(job);
  };

  const confirmSoftDelete = async () => {
    if (!softDeleteTarget) return;
    try {
      await JobService.softDeleteJob(softDeleteTarget.id, user.collegeId || '', deleteReason);
      toast.success('Job archived successfully.');
      fetchJobs();
      if (selectedJob?.id === softDeleteTarget.id) handleSelectJob(null);
    } catch { toast.error('Archive failed. Please try again.'); }
    finally { setSoftDeleteTarget(null); setDeleteReason(''); }
  };

  const confirmHardDelete = async () => {
    if (!hardDeleteTarget) return;
    try {
      await JobService.hardDeleteJob(hardDeleteTarget.id, user.collegeId || '');
      toast.success('Job permanently deleted.');
      fetchJobs();
      if (selectedJob?.id === hardDeleteTarget.id) handleSelectJob(null);
    } catch { toast.error('Permanent delete failed. Please try again.'); }
    finally { setHardDeleteTarget(null); }
  };

  const handleRestore = async (job: Job) => {
    try {
      await JobService.restoreJob(job.id);
      toast.success('Job restored successfully.');
      fetchJobs();
    } catch { toast.error('Restore failed. Please try again.'); }
  };

  const TABS = [
    { id: 'list',       label: 'Recruitments', icon: LayoutGrid },
    { id: 'comparator', label: 'Comparator',   icon: FileDiff   },
    { id: 'extractor',  label: 'Extractors',   icon: FileText   },
    { id: 'gathering',  label: 'Gathering',    icon: Database   },
  ] as const;

  return (
    <div className="flex flex-col h-full space-y-4">

      {!selectedJob && !showWizard && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
          <div role="tablist" aria-label="Jobs section tabs" className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar">
            {TABS.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={sectionTab === t.id}
                onClick={() => handleSectionTab(t.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${sectionTab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {/* Archive toggle — CPH/Admin only */}
            {canSeeArchived && sectionTab === 'list' && (
              <button onClick={() => setIncludeArchived(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${includeArchived ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                <Archive size={14} />
                {includeArchived ? 'Showing Archived' : 'Show Archived'}
              </button>
            )}
            {JobService.canCreateJob(user) && (
              <button onClick={openCreate}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
                <Plus size={18} /> Post New Drive
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {sectionTab === 'list' && (
          selectedJob ? (
            <JobDetailView
              job={selectedJob}
              user={user}
              onBack={() => handleSelectJob(null)}
              onEdit={openEdit}
              onDelete={(e, id) => { const j = pageResult.content.find(x => x.id === id); if (j) requestSoftDelete(e, j); }}
              onDownloadJobRelatedList={(type) => JobService.exportJobApplicants(selectedJob.id, type)}
              onUploadRoundResult={() => fetchJobs()}
            />
          ) : (
            <div className="space-y-4 flex flex-col">
              <JobFilterBar
                searchQuery={searchQuery}       setSearchQuery={setSearchQuery}
                jobOwnerFilter={jobOwnerFilter} setJobOwnerFilter={handleOwnerFilter}
                filterTypes={filterTypes}       toggleFilterType={handleToggleType}
                filterModes={filterModes}       toggleFilterMode={handleToggleMode}
                filterStatuses={filterStatuses} toggleFilterStatus={handleToggleStatus}
              />
              <JobsTable
                jobs={pageResult.content}
                user={user}
                isLoading={isLoading}
                onSelect={handleSelectJob}
                onEdit={openEdit}
                onSoftDelete={requestSoftDelete}
                onHardDelete={canHardDelete ? requestHardDelete : undefined}
                onRestore={canSeeArchived ? handleRestore : undefined}
              />
              <Pagination
                page={currentPage}
                totalPages={pageResult.totalPages}
                totalElements={pageResult.totalElements}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                itemLabel="jobs"
              />
            </div>
          )
        )}
        {sectionTab === 'comparator' && <GlobalResultComparator />}
        {sectionTab === 'extractor'  && <GlobalReportExtractor />}
        {sectionTab === 'gathering'  && <CustomGathering user={user} />}
      </div>

      <JobWizard
        isOpen={showWizard}
        isEditing={isEditingJob}
        initialData={editingJob}
        user={user}
        onClose={() => setShowWizard(false)}
        onSave={handleSaveJob}
      />

      {/* Soft-delete confirmation */}
      {softDeleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Archive Job Posting?</h3>
            <p className="text-sm text-gray-600">
              This will <strong>archive</strong> "{softDeleteTarget.title}". The job will be hidden from students but all data and files are preserved. {canHardDelete && 'You can permanently delete it later.'}
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Reason (optional)</label>
              <input className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-200 text-sm"
                value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
                placeholder="e.g. Drive postponed, position filled..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setSoftDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50">Cancel</button>
              <button onClick={confirmSoftDelete}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600">Archive</button>
            </div>
          </div>
        </div>
      )}

      {/* Hard-delete confirmation */}
      <DeleteConfirmationModal
        isOpen={!!hardDeleteTarget}
        onClose={() => setHardDeleteTarget(null)}
        onConfirm={confirmHardDelete}
        title="Permanently Delete Job?"
        message={`This will PERMANENTLY delete "${hardDeleteTarget?.title}" and ALL associated files (JD documents, avoid lists, etc.). This action CANNOT be undone.`}
      />
    </div>
  );
};