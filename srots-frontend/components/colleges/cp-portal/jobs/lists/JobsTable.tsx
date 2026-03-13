import React, { useState, useEffect } from 'react';
import { Job, User, Role } from '../../../../../types';
import { Briefcase, Edit2, Trash2, Calendar, Users, MapPin, Eye, Archive, RotateCcw, AlertTriangle } from 'lucide-react';
import { Pagination } from '../../../../common/Pagination';
import { JobService } from '../../../../../services/jobService';

const PAGE_SIZE = 15;

interface JobsTableProps {
  jobs: Job[];
  user: User;
  isLoading?: boolean;
  onSelect:     (job: Job) => void;
  onEdit:       (e: React.MouseEvent, job: Job) => void;
  onSoftDelete: (e: React.MouseEvent, job: Job) => void;
  onHardDelete?: (e: React.MouseEvent, job: Job) => void;
  onRestore?:   (job: Job) => void;
}

export const JobsTable: React.FC<JobsTableProps> = ({
  jobs, user, isLoading = false,
  onSelect, onEdit, onSoftDelete, onHardDelete, onRestore
}) => {

  const canSeeArchived = JobService.canSeeArchivedJobs(user);
  const [page, setPage] = useState(0);

  useEffect(() => { setPage(0); }, [jobs.length]);

  const totalPages = Math.ceil(jobs.length / PAGE_SIZE);
  const pageJobs = jobs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {isLoading && (
        <div className="h-1.5 bg-blue-100 overflow-hidden rounded-t-xl">
          <div className="h-full bg-blue-500 animate-pulse w-full" />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1100px]">
          <thead className="bg-gray-50 text-gray-500 font-bold text-[10px] uppercase tracking-wider border-b">
            <tr>
              <th className="px-6 py-4 w-[26%]">Company &amp; Position</th>
              <th className="px-6 py-4 w-[14%]">Type / Mode</th>
              <th className="px-6 py-4 w-[14%]">Key Dates</th>
              <th className="px-6 py-4 w-[9%] text-center">Applicants</th>
              <th className="px-6 py-4 w-[12%]">Status</th>
              <th className="px-6 py-4 w-[25%] text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm">
            {pageJobs.map(job => {
              const canManage = JobService.canManageJob(user, job);
              const isArchived = !!job.isDeleted;

              // ── Safe field access — DTO now sends correct names ───────────
              // jobType comes as "Full-Time", "Internship" etc. from backend display enum
              const companyDisplay  = job.companyName || job.company || '—';
              const jobTypeDisplay  = job.jobType     || job.type    || '—';
              const workModeDisplay = job.workMode    || job.workArrangement || '—';
              const postedByName    = typeof job.postedBy === 'string'
                ? job.postedBy
                : (job.postedBy as any)?.fullName || 'Unknown';
              const applicantCount  = job.applicantCount ?? (job.applicants?.length ?? 0);

              return (
                <tr
                  key={job.id}
                  onClick={() => !isArchived && onSelect(job)}
                  className={`transition-colors group ${
                    isArchived
                      ? 'bg-amber-50/40 opacity-75'
                      : 'hover:bg-blue-50/50 cursor-pointer'
                  }`}
                >
                  {/* Company & title */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-blue-600 border shadow-inner shrink-0 uppercase">
                        {companyDisplay[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 truncate max-w-[160px] leading-none group-hover:text-blue-600 transition-colors"
                            title={job.title}>
                            {job.title}
                          </span>
                          {isArchived && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold border border-amber-200 shrink-0">
                              <Archive size={9} /> Archived
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Briefcase size={10} /> {companyDisplay}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Type & mode */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase border border-indigo-100">
                        {jobTypeDisplay}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                        <MapPin size={10} /> {workModeDisplay}
                      </span>
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Calendar size={12} />
                        <span className="font-medium">Ends:</span>
                        <span className="text-red-600 font-bold">{job.applicationDeadline || '—'}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        Posted: {job.postedAt ? String(job.postedAt).split('T')[0] : '—'}
                      </div>
                      {isArchived && job.deletedAt && (
                        <div className="text-[10px] text-amber-600 font-bold">
                          Archived: {String(job.deletedAt).split('T')[0]}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Applicant count */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-100">
                        {applicantCount}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 font-bold uppercase">Total</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {isArchived ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-amber-50 text-amber-700 border-amber-200">
                          Archived
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border tracking-wider ${
                          job.status === 'Active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : job.status === 'Draft'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>{job.status}</span>
                      )}
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Users size={10} /> {postedByName}
                      </div>
                      {isArchived && job.deletedBy && (
                        <div className="text-[10px] text-amber-600 font-medium">
                          By: {job.deletedBy}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end items-center gap-1.5">

                      {/* Archived job actions */}
                      {isArchived && canSeeArchived && (
                        <>
                          {onRestore && (
                            <button onClick={() => onRestore(job)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all"
                              title="Restore job">
                              <RotateCcw size={13} /> Restore
                            </button>
                          )}
                          {onHardDelete && (
                            <button onClick={e => onHardDelete(e, job)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all"
                              title="Permanently delete">
                              <AlertTriangle size={13} /> Delete Forever
                            </button>
                          )}
                        </>
                      )}

                      {/* Active job actions */}
                      {!isArchived && (
                        <>
                          {canManage && (
                            <div className="flex gap-1 border-r border-gray-200 pr-2 mr-1">
                              <button onClick={e => onEdit(e, job)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent transition-all"
                                title="Edit">
                                <Edit2 size={15} />
                              </button>
                              <button onClick={e => onSoftDelete(e, job)}
                                className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg border border-transparent transition-all"
                                title="Archive job">
                                <Archive size={15} />
                              </button>
                              {onHardDelete && (
                                <button onClick={e => onHardDelete(e, job)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-transparent transition-all"
                                  title="Delete permanently">
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          )}
                          <button onClick={() => onSelect(job)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95">
                            <Eye size={13} /> Details
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {!isLoading && jobs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center bg-gray-50/50">
                  <div className="flex flex-col items-center gap-3">
                    <Briefcase size={40} className="opacity-20 text-gray-400" />
                    <p className="font-bold text-gray-500">No jobs found.</p>
                    <p className="text-xs text-gray-400">Try adjusting your filters or search query.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t bg-gray-50">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={jobs.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="jobs"
        />
      </div>
    </div>
  );
};