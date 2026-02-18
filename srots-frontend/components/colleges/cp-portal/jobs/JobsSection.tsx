// import React, { useState, useEffect } from 'react';
// import { JobService } from '../../../../services/jobService';
// import { Job, User } from '../../../../types';
// import { Plus, LayoutGrid, FileDiff, FileText, Database } from 'lucide-react';
// import { JobWizard } from './JobWizard';
// import { GlobalResultComparator } from './tools/GlobalResultComparator';
// import { GlobalReportExtractor } from './tools/GlobalReportExtractor';
// import { CustomGathering } from './tools/CustomGathering';
// import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';
// import { JobFilterBar } from './lists/JobFilterBar';
// import { JobsTable } from './lists/JobsTable';
// import { JobDetailView } from './details/JobDetailView';

// /**
//  * Component: JobsSection
//  * SYNCED WITH: JobController.java
//  */

// interface JobsSectionProps {
//   user: User;
// }

// export const JobsSection: React.FC<JobsSectionProps> = ({ user }) => {
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [selectedJob, setSelectedJob] = useState<Job | null>(null);
//   const [jobsSectionTab, setJobsSectionTab] = useState<'list' | 'comparator' | 'extractor' | 'gathering'>('list');

//   const [jobOwnerFilter, setJobOwnerFilter] = useState<'all' | 'my'>('all');
//   const [filterTypes, setFilterTypes] = useState<string[]>([]);
//   const [filterModes, setFilterModes] = useState<string[]>([]);
//   const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');

//   const [showCreateJob, setShowCreateJob] = useState(false);
//   const [isEditingJob, setIsEditingJob] = useState(false);
//   const [editingJob, setEditingJob] = useState<Job | null>(null); 
//   const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

//   useEffect(() => {
//       refreshJobs();
//   }, [user.collegeId, searchQuery, filterTypes, filterModes, filterStatuses, jobOwnerFilter, jobsSectionTab]);

//   const refreshJobs = async () => {
//       if (jobsSectionTab !== 'list') return;
//       const filters = {
//           query: searchQuery,
//           types: filterTypes,
//           modes: filterModes,
//           statuses: filterStatuses,
//           ownerId: jobOwnerFilter === 'my' ? user.id : undefined
//       };
//       try {
//           const result = await JobService.searchJobs(user.collegeId || '', filters);
//           setJobs(Array.isArray(result) ? result : []);
//       } catch (err) {
//           console.error("Recruitment fetch failed", err);
//       }
//   };

//   const handleOpenCreateJob = () => {
//       setIsEditingJob(false);
//       setEditingJob(null);
//       setSelectedJob(null);
//       setShowCreateJob(true);
//   };

//   const handleOpenEditJob = (e: React.MouseEvent | undefined, jobToEdit: Job) => {
//       if(e) { e.preventDefault(); e.stopPropagation(); }
//       setEditingJob(jobToEdit);
//       setIsEditingJob(true);
//       setShowCreateJob(true);
//   };

//   const requestDeleteJob = (e: React.MouseEvent, id: string) => {
//       e.stopPropagation();
//       e.preventDefault();
//       const job = jobs.find(j => j.id === id);
//       if (!job || !JobService.canManageJob(user, job)) { 
//           alert("You do not have permission to delete this job."); 
//           return; 
//       }
//       setDeleteJobId(id);
//   };

//   const confirmDeleteJob = async () => {
//       if (deleteJobId) {
//           try {
//               await JobService.deleteJob(deleteJobId, user.collegeId || '');
//               refreshJobs();
//               if (selectedJob?.id === deleteJobId) setSelectedJob(null);
//           } catch (err) {
//               alert("Delete failed. Please check backend connection.");
//           } finally {
//               setDeleteJobId(null);
//           }
//       }
//   };

//   /**
//    * FIXED TYPE SIGNATURE: Matches JobWizard exactly
//    */
//   const handleSaveJob = async (
//       jobData: Partial<Job>, 
//       jdFiles: File[], 
//       avoidList?: File
//   ) => {
//       try {
//           const collegeCode = user.collegeId || '';
          
//           if (isEditingJob && editingJob) {
//               await JobService.updateJob(
//                   editingJob.id, 
//                   jobData, 
//                   jdFiles, 
//                   avoidList || null,
//                   collegeCode
//               );
//           } else {
//               const payload = { 
//                   ...jobData, 
//                   collegeId: user.collegeId,
//                   postedById: user.id
//               };
//               await JobService.createJob(
//                   payload, 
//                   jdFiles, 
//                   avoidList || null,
//                   collegeCode
//               );
//           }
//           refreshJobs();
//           setShowCreateJob(false);
//       } catch (err: any) {
//           console.error('Job save error:', err);
//           alert("Failed to save job: " + (err.response?.data?.message || err.message || "Unknown error"));
//       }
//   };

//   return (
//       <div className="flex flex-col h-full space-y-4">
//           {!selectedJob && !showCreateJob && (
//               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
//                   <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar max-w-full">
//                       {[
//                         { id: 'list', label: 'Recruitments', icon: LayoutGrid },
//                         { id: 'comparator', label: 'Comparator', icon: FileDiff },
//                         { id: 'extractor', label: 'Extractors', icon: FileText },
//                         { id: 'gathering', label: 'Gathering', icon: Database }
//                       ].map(t => (
//                         <button 
//                             key={t.id} 
//                             onClick={() => setJobsSectionTab(t.id as any)} 
//                             className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${jobsSectionTab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
//                         >
//                             <t.icon size={14}/> {t.label}
//                         </button>
//                       ))}
//                   </div>
//                   {JobService.canCreateJob(user) && (
//                       <button 
//                           onClick={handleOpenCreateJob} 
//                           className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
//                       >
//                           <Plus size={18} /> Post New Drive
//                       </button>
//                   )}
//               </div>
//           )}

//           <div className="flex-1 overflow-y-auto">
//               {jobsSectionTab === 'list' && (
//                   selectedJob ? (
//                       <JobDetailView 
//                           job={selectedJob} 
//                           user={user} 
//                           onBack={() => setSelectedJob(null)}
//                           onEdit={handleOpenEditJob}
//                           onDelete={requestDeleteJob}
//                           onDownloadJobRelatedList={(type) => JobService.exportJobApplicants(selectedJob.id, type)}
//                           onUploadRoundResult={() => refreshJobs()}
//                       />
//                   ) : (
//                       <div className="space-y-4 h-full flex flex-col">
//                            <JobFilterBar 
//                                searchQuery={searchQuery} 
//                                setSearchQuery={setSearchQuery}
//                                jobOwnerFilter={jobOwnerFilter} 
//                                setJobOwnerFilter={setJobOwnerFilter}
//                                filterTypes={filterTypes} 
//                                toggleFilterType={(t) => setFilterTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
//                                filterModes={filterModes} 
//                                toggleFilterMode={(m) => setFilterModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
//                                filterStatuses={filterStatuses} 
//                                toggleFilterStatus={(s) => setFilterStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
//                            />
//                            <JobsTable 
//                                jobs={jobs} 
//                                user={user} 
//                                onSelect={setSelectedJob}
//                                onEdit={handleOpenEditJob}
//                                onDelete={requestDeleteJob}
//                            />
//                       </div>
//                   )
//               )}
//               {jobsSectionTab === 'comparator' && <GlobalResultComparator />}
//               {jobsSectionTab === 'extractor' && <GlobalReportExtractor />}
//               {jobsSectionTab === 'gathering' && <CustomGathering user={user} />}
//           </div>

//           <JobWizard 
//               isOpen={showCreateJob}
//               isEditing={isEditingJob}
//               initialData={editingJob} 
//               user={user}
//               onClose={() => setShowCreateJob(false)}
//               onSave={handleSaveJob}
//           />

//           <DeleteConfirmationModal
//               isOpen={!!deleteJobId}
//               onClose={() => setDeleteJobId(null)}
//               onConfirm={confirmDeleteJob}
//               title="Delete Job Posting?"
//               message="Are you sure? This will remove the job and all associated applications permanently."
//           />
//       </div>
//   );
// };


import React, { useState, useEffect } from 'react';
import { JobService } from '../../../../services/jobService';
import { Job, User } from '../../../../types';
import { Plus, LayoutGrid, FileDiff, FileText, Database } from 'lucide-react';
import { JobWizard } from './JobWizard';
import { GlobalResultComparator } from './tools/GlobalResultComparator';
import { GlobalReportExtractor } from './tools/GlobalReportExtractor';
import { CustomGathering } from './tools/CustomGathering';
import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';
import { JobFilterBar } from './lists/JobFilterBar';
import { JobsTable } from './lists/JobsTable';
import { JobDetailView } from './details/JobDetailView';

/**
 * FIXED: JobsSection with proper filter parameter passing
 */

interface JobsSectionProps {
  user: User;
}

export const JobsSection: React.FC<JobsSectionProps> = ({ user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobsSectionTab, setJobsSectionTab] = useState<'list' | 'comparator' | 'extractor' | 'gathering'>('list');

  const [jobOwnerFilter, setJobOwnerFilter] = useState<'all' | 'my'>('all');
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterModes, setFilterModes] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateJob, setShowCreateJob] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null); 
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  useEffect(() => {
      refreshJobs();
  }, [user.collegeId, searchQuery, filterTypes, filterModes, filterStatuses, jobOwnerFilter, jobsSectionTab]);

  const refreshJobs = async () => {
      if (jobsSectionTab !== 'list') return;
      
      console.log('🔍 [CPH/STAFF] Fetching jobs with filters:', {
          query: searchQuery,
          types: filterTypes,
          modes: filterModes,
          statuses: filterStatuses,
          owner: jobOwnerFilter
      });
      
      // FIXED: Pass ownerId when jobOwnerFilter is 'my'
      const filters = {
          query: searchQuery,
          types: filterTypes,
          modes: filterModes,
          statuses: filterStatuses,
          ownerId: jobOwnerFilter === 'my' ? user.id : undefined  // CRITICAL FIX
      };
      
      try {
          const result = await JobService.searchJobs(user.collegeId || '', filters);
          console.log('✅ [CPH/STAFF] Jobs received:', result.length);
          setJobs(Array.isArray(result) ? result : []);
      } catch (err: any) {
          console.error("❌ [CPH/STAFF] Fetch failed:", err);
          console.error("   Error response:", err.response);
          setJobs([]);
      }
  };

  const handleOpenCreateJob = () => {
      setIsEditingJob(false);
      setEditingJob(null);
      setSelectedJob(null);
      setShowCreateJob(true);
  };

  const handleOpenEditJob = (e: React.MouseEvent | undefined, jobToEdit: Job) => {
      if(e) { e.preventDefault(); e.stopPropagation(); }
      setEditingJob(jobToEdit);
      setIsEditingJob(true);
      setShowCreateJob(true);
  };

  const requestDeleteJob = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      const job = jobs.find(j => j.id === id);
      if (!job || !JobService.canManageJob(user, job)) { 
          alert("You do not have permission to delete this job."); 
          return; 
      }
      setDeleteJobId(id);
  };

  const confirmDeleteJob = async () => {
      if (deleteJobId) {
          try {
              await JobService.deleteJob(deleteJobId, user.collegeId || '');
              refreshJobs();
              if (selectedJob?.id === deleteJobId) setSelectedJob(null);
          } catch (err) {
              alert("Delete failed");
          } finally {
              setDeleteJobId(null);
          }
      }
  };

  const handleSaveJob = async (jobData: Partial<Job>, jdFiles: File[], avoidList?: File) => {
      try {
          const collegeCode = user.collegeId || '';
          
          if (isEditingJob && editingJob) {
              await JobService.updateJob(editingJob.id, jobData, jdFiles, avoidList || null, collegeCode);
          } else {
              const payload = { ...jobData, collegeId: user.collegeId, postedById: user.id };
              await JobService.createJob(payload, jdFiles, avoidList || null, collegeCode);
          }
          refreshJobs();
          setShowCreateJob(false);
      } catch (err: any) {
          console.error('Job save error:', err);
          alert("Failed: " + (err.response?.data?.message || err.message));
      }
  };

  return (
      <div className="flex flex-col h-full space-y-4">
          {!selectedJob && !showCreateJob && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
                  <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar max-w-full">
                      {[
                        { id: 'list', label: 'Recruitments', icon: LayoutGrid },
                        { id: 'comparator', label: 'Comparator', icon: FileDiff },
                        { id: 'extractor', label: 'Extractors', icon: FileText },
                        { id: 'gathering', label: 'Gathering', icon: Database }
                      ].map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => setJobsSectionTab(t.id as any)} 
                            className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
                                jobsSectionTab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <t.icon size={14}/> {t.label}
                        </button>
                      ))}
                  </div>
                  {JobService.canCreateJob(user) && (
                      <button 
                          onClick={handleOpenCreateJob} 
                          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
                      >
                          <Plus size={18} /> Post New Drive
                      </button>
                  )}
              </div>
          )}

          <div className="flex-1 overflow-y-auto">
              {jobsSectionTab === 'list' && (
                  selectedJob ? (
                      <JobDetailView 
                          job={selectedJob} 
                          user={user} 
                          onBack={() => setSelectedJob(null)}
                          onEdit={handleOpenEditJob}
                          onDelete={requestDeleteJob}
                          onDownloadJobRelatedList={(type) => JobService.exportJobApplicants(selectedJob.id, type)}
                          onUploadRoundResult={() => refreshJobs()}
                      />
                  ) : (
                      <div className="space-y-4 h-full flex flex-col">
                           <JobFilterBar 
                               searchQuery={searchQuery} 
                               setSearchQuery={setSearchQuery}
                               jobOwnerFilter={jobOwnerFilter} 
                               setJobOwnerFilter={setJobOwnerFilter}
                               filterTypes={filterTypes} 
                               toggleFilterType={(t) => setFilterTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                               filterModes={filterModes} 
                               toggleFilterMode={(m) => setFilterModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
                               filterStatuses={filterStatuses} 
                               toggleFilterStatus={(s) => setFilterStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                           />
                           <JobsTable 
                               jobs={jobs} 
                               user={user} 
                               onSelect={setSelectedJob}
                               onEdit={handleOpenEditJob}
                               onDelete={requestDeleteJob}
                           />
                      </div>
                  )
              )}
              {jobsSectionTab === 'comparator' && <GlobalResultComparator />}
              {jobsSectionTab === 'extractor' && <GlobalReportExtractor />}
              {jobsSectionTab === 'gathering' && <CustomGathering user={user} />}
          </div>

          <JobWizard 
              isOpen={showCreateJob}
              isEditing={isEditingJob}
              initialData={editingJob} 
              user={user}
              onClose={() => setShowCreateJob(false)}
              onSave={handleSaveJob}
          />

          <DeleteConfirmationModal
              isOpen={!!deleteJobId}
              onClose={() => setDeleteJobId(null)}
              onConfirm={confirmDeleteJob}
              title="Delete Job Posting?"
              message="Are you sure?"
          />
      </div>
  );
};