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
//  * FIXED: JobsSection with proper filter parameter passing
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
      
//       console.log('🔍 [CPH/STAFF] Fetching jobs with filters:', {
//           query: searchQuery,
//           types: filterTypes,
//           modes: filterModes,
//           statuses: filterStatuses,
//           owner: jobOwnerFilter
//       });
      
//       // FIXED: Pass ownerId when jobOwnerFilter is 'my'
//       const filters = {
//           query: searchQuery,
//           types: filterTypes,
//           modes: filterModes,
//           statuses: filterStatuses,
//           ownerId: jobOwnerFilter === 'my' ? user.id : undefined  // CRITICAL FIX
//       };
      
//       try {
//           const result = await JobService.searchJobs(user.collegeId || '', filters);
//           console.log('✅ [CPH/STAFF] Jobs received:', result.length);
//           setJobs(Array.isArray(result) ? result : []);
//       } catch (err: any) {
//           console.error("❌ [CPH/STAFF] Fetch failed:", err);
//           console.error("   Error response:", err.response);
//           setJobs([]);
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
//               alert("Delete failed");
//           } finally {
//               setDeleteJobId(null);
//           }
//       }
//   };

//   const handleSaveJob = async (jobData: Partial<Job>, jdFiles: File[], avoidList?: File) => {
//       try {
//           const collegeCode = user.collegeId || '';
          
//           if (isEditingJob && editingJob) {
//               await JobService.updateJob(editingJob.id, jobData, jdFiles, avoidList || null, collegeCode);
//           } else {
//               const payload = { ...jobData, collegeId: user.collegeId, postedById: user.id };
//               await JobService.createJob(payload, jdFiles, avoidList || null, collegeCode);
//           }
//           refreshJobs();
//           setShowCreateJob(false);
//       } catch (err: any) {
//           console.error('Job save error:', err);
//           alert("Failed: " + (err.response?.data?.message || err.message));
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
//                             className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
//                                 jobsSectionTab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
//                             }`}
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
//               message="Are you sure?"
//           />
//       </div>
//   );
// };

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
//  * JobsSection – FIXED
//  *
//  * Fix 1: STAFF now sees ALL college jobs by default.
//  *         "My Jobs" sends ownerId = user.id → backend filters by postedById.
//  *         "All Jobs" sends ownerId = undefined → backend returns all college jobs.
//  *
//  * Fix 2: searchJobs now correctly passes ownerId only when jobOwnerFilter === 'my'.
//  */

// interface JobsSectionProps {
//     user: User;
// }

// export const JobsSection: React.FC<JobsSectionProps> = ({ user }) => {
//     const [jobs,          setJobs]          = useState<Job[]>([]);
//     const [selectedJob,   setSelectedJob]   = useState<Job | null>(null);
//     const [jobsSectionTab, setJobsSectionTab] = useState<'list' | 'comparator' | 'extractor' | 'gathering'>('list');

//     // Filter state
//     const [jobOwnerFilter,  setJobOwnerFilter]  = useState<'all' | 'my'>('all');
//     const [filterTypes,     setFilterTypes]     = useState<string[]>([]);
//     const [filterModes,     setFilterModes]     = useState<string[]>([]);
//     const [filterStatuses,  setFilterStatuses]  = useState<string[]>([]);
//     const [searchQuery,     setSearchQuery]     = useState('');

//     // Wizard state
//     const [showCreateJob, setShowCreateJob] = useState(false);
//     const [isEditingJob,  setIsEditingJob]  = useState(false);
//     const [editingJob,    setEditingJob]    = useState<Job | null>(null);
//     const [deleteJobId,   setDeleteJobId]   = useState<string | null>(null);

//     useEffect(() => {
//         refreshJobs();
//     }, [user.collegeId, searchQuery, filterTypes, filterModes, filterStatuses, jobOwnerFilter, jobsSectionTab]);

//     const refreshJobs = async () => {
//         if (jobsSectionTab !== 'list') return;

//         const filters = {
//             query:    searchQuery,
//             types:    filterTypes,
//             modes:    filterModes,
//             statuses: filterStatuses,
//             // FIXED: only send ownerId when "My Jobs" selected
//             // Backend then filters by postedById → STAFF sees only their jobs
//             // When "All" → ownerId undefined → backend returns all college jobs
//             ownerId: jobOwnerFilter === 'my' ? user.id : undefined,
//         };

//         try {
//             const result = await JobService.searchJobs(user.collegeId || '', filters);
//             setJobs(Array.isArray(result) ? result : []);
//         } catch (err: any) {
//             console.error('[JobsSection] Fetch failed:', err?.response?.data || err.message);
//             setJobs([]);
//         }
//     };

//     const handleOpenCreateJob = () => {
//         setIsEditingJob(false);
//         setEditingJob(null);
//         setSelectedJob(null);
//         setShowCreateJob(true);
//     };

//     const handleOpenEditJob = (e: React.MouseEvent | undefined, jobToEdit: Job) => {
//         if (e) { e.preventDefault(); e.stopPropagation(); }
//         setEditingJob(jobToEdit);
//         setIsEditingJob(true);
//         setShowCreateJob(true);
//     };

//     const requestDeleteJob = (e: React.MouseEvent, id: string) => {
//         e.stopPropagation();
//         e.preventDefault();
//         const job = jobs.find(j => j.id === id);
//         if (!job || !JobService.canManageJob(user, job)) {
//             alert('You do not have permission to delete this job.');
//             return;
//         }
//         setDeleteJobId(id);
//     };

//     const confirmDeleteJob = async () => {
//         if (!deleteJobId) return;
//         try {
//             await JobService.deleteJob(deleteJobId, user.collegeId || '');
//             refreshJobs();
//             if (selectedJob?.id === deleteJobId) setSelectedJob(null);
//         } catch {
//             alert('Delete failed. Please check backend connection.');
//         } finally {
//             setDeleteJobId(null);
//         }
//     };

//     const handleSaveJob = async (jobData: Partial<Job>, jdFiles: File[], avoidList?: File) => {
//         try {
//             const collegeCode = user.collegeId || '';
//             if (isEditingJob && editingJob) {
//                 await JobService.updateJob(editingJob.id, jobData, jdFiles, avoidList || null, collegeCode);
//             } else {
//                 await JobService.createJob(
//                     { ...jobData, collegeId: user.collegeId, postedById: user.id },
//                     jdFiles,
//                     avoidList || null,
//                     collegeCode
//                 );
//             }
//             refreshJobs();
//             setShowCreateJob(false);
//         } catch (err: any) {
//             alert('Failed to save job: ' + (err.response?.data?.message || err.message || 'Unknown error'));
//         }
//     };

//     const TABS = [
//         { id: 'list',       label: 'Recruitments', icon: LayoutGrid },
//         { id: 'comparator', label: 'Comparator',   icon: FileDiff   },
//         { id: 'extractor',  label: 'Extractors',   icon: FileText   },
//         { id: 'gathering',  label: 'Gathering',    icon: Database   },
//     ] as const;

//     return (
//         <div className="flex flex-col h-full space-y-4">

//             {/* Top bar – tabs + create button */}
//             {!selectedJob && !showCreateJob && (
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
//                     <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar max-w-full">
//                         {TABS.map(t => (
//                             <button
//                                 key={t.id}
//                                 onClick={() => setJobsSectionTab(t.id as any)}
//                                 className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
//                                     jobsSectionTab === t.id
//                                         ? 'bg-white text-blue-700 shadow-sm'
//                                         : 'text-gray-500 hover:text-gray-700'
//                                 }`}
//                             >
//                                 <t.icon size={14} /> {t.label}
//                             </button>
//                         ))}
//                     </div>

//                     {JobService.canCreateJob(user) && (
//                         <button
//                             onClick={handleOpenCreateJob}
//                             className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
//                         >
//                             <Plus size={18} /> Post New Drive
//                         </button>
//                     )}
//                 </div>
//             )}

//             {/* Content */}
//             <div className="flex-1 overflow-y-auto">
//                 {jobsSectionTab === 'list' && (
//                     selectedJob ? (
//                         <JobDetailView
//                             job={selectedJob}
//                             user={user}
//                             onBack={() => setSelectedJob(null)}
//                             onEdit={handleOpenEditJob}
//                             onDelete={requestDeleteJob}
//                             onDownloadJobRelatedList={(type) =>
//                                 JobService.exportJobApplicants(selectedJob.id, type)}
//                             onUploadRoundResult={() => refreshJobs()}
//                         />
//                     ) : (
//                         <div className="space-y-4 h-full flex flex-col">
//                             <JobFilterBar
//                                 searchQuery={searchQuery}
//                                 setSearchQuery={setSearchQuery}
//                                 jobOwnerFilter={jobOwnerFilter}
//                                 setJobOwnerFilter={setJobOwnerFilter}
//                                 filterTypes={filterTypes}
//                                 toggleFilterType={(t) =>
//                                     setFilterTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
//                                 filterModes={filterModes}
//                                 toggleFilterMode={(m) =>
//                                     setFilterModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
//                                 filterStatuses={filterStatuses}
//                                 toggleFilterStatus={(s) =>
//                                     setFilterStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
//                             />
//                             <JobsTable
//                                 jobs={jobs}
//                                 user={user}
//                                 onSelect={setSelectedJob}
//                                 onEdit={handleOpenEditJob}
//                                 onDelete={requestDeleteJob}
//                             />
//                         </div>
//                     )
//                 )}

//                 {jobsSectionTab === 'comparator' && <GlobalResultComparator />}
//                 {jobsSectionTab === 'extractor'  && <GlobalReportExtractor />}
//                 {jobsSectionTab === 'gathering'  && <CustomGathering user={user} />}
//             </div>

//             {/* Job Wizard */}
//             <JobWizard
//                 isOpen={showCreateJob}
//                 isEditing={isEditingJob}
//                 initialData={editingJob}
//                 user={user}
//                 onClose={() => setShowCreateJob(false)}
//                 onSave={handleSaveJob}
//             />

//             {/* Delete confirmation */}
//             <DeleteConfirmationModal
//                 isOpen={!!deleteJobId}
//                 onClose={() => setDeleteJobId(null)}
//                 onConfirm={confirmDeleteJob}
//                 title="Delete Job Posting?"
//                 message="Are you sure? This will remove the job and all associated applications permanently."
//             />
//         </div>
//     );
// };

import React, { useState, useEffect, useCallback } from 'react';
import { JobService, AdminJobFilters, JobsPageResult } from '../../../../services/jobService';
import { Job, User } from '../../../../types';
import { Plus, LayoutGrid, FileDiff, FileText, Database, Archive } from 'lucide-react';
import { JobWizard } from './JobWizard';
import { GlobalResultComparator } from './tools/GlobalResultComparator';
import { GlobalReportExtractor } from './tools/GlobalReportExtractor';
import { CustomGathering } from './tools/CustomGathering';
import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';
import { JobFilterBar } from './lists/JobFilterBar';
import { JobsTable } from './lists/JobsTable';
import { JobDetailView } from './details/JobDetailView';

interface JobsSectionProps { user: User; }

const PAGE_SIZE = 10;

export const JobsSection: React.FC<JobsSectionProps> = ({ user }) => {
  const [pageResult,      setPageResult]      = useState<JobsPageResult>({ content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: PAGE_SIZE });
  const [selectedJob,     setSelectedJob]     = useState<Job | null>(null);
  const [sectionTab,      setSectionTab]      = useState<'list' | 'comparator' | 'extractor' | 'gathering'>('list');

  // Filters
  const [jobOwnerFilter,  setJobOwnerFilter]  = useState<'all' | 'my'>('all');
  const [filterTypes,     setFilterTypes]     = useState<string[]>([]);
  const [filterModes,     setFilterModes]     = useState<string[]>([]);
  const [filterStatuses,  setFilterStatuses]  = useState<string[]>([]);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [currentPage,     setCurrentPage]     = useState(0);
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
    setIsLoading(true);
    try {
      const filters: AdminJobFilters = {
        query:           searchQuery || undefined,
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
      console.error('[JobsSection] Fetch failed:', err?.response?.data || err.message);
      setPageResult({ content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: PAGE_SIZE });
    } finally {
      setIsLoading(false);
    }
  }, [user.collegeId, user.id, searchQuery, filterTypes, filterModes, filterStatuses,
      jobOwnerFilter, includeArchived, currentPage, sectionTab, canSeeArchived]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(0); }, [searchQuery, filterTypes, filterModes, filterStatuses, jobOwnerFilter, includeArchived]);

  // ── Wizard ────────────────────────────────────────────────────────────────

  const openCreate = () => { setIsEditingJob(false); setEditingJob(null); setSelectedJob(null); setShowWizard(true); };
  const openEdit   = (e: React.MouseEvent | undefined, job: Job) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setEditingJob(job); setIsEditingJob(true); setShowWizard(true);
  };

  const handleSaveJob = async (formData: any, jdFiles: File[], avoidList?: File) => {
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
      fetchJobs();
      setShowWizard(false);
    } catch (err: any) {
      alert('Failed to save job: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  // ── Delete actions ────────────────────────────────────────────────────────

  const requestSoftDelete = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation(); e.preventDefault();
    if (!JobService.canManageJob(user, job)) { alert('You do not have permission to archive this job.'); return; }
    setSoftDeleteTarget(job);
    setDeleteReason('');
  };

  const requestHardDelete = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation(); e.preventDefault();
    if (!canHardDelete) { alert('Only CPH/Admin can permanently delete jobs.'); return; }
    setHardDeleteTarget(job);
  };

  const confirmSoftDelete = async () => {
    if (!softDeleteTarget) return;
    try {
      await JobService.softDeleteJob(softDeleteTarget.id, user.collegeId || '', deleteReason);
      fetchJobs();
      if (selectedJob?.id === softDeleteTarget.id) setSelectedJob(null);
    } catch { alert('Archive failed.'); }
    finally { setSoftDeleteTarget(null); setDeleteReason(''); }
  };

  const confirmHardDelete = async () => {
    if (!hardDeleteTarget) return;
    try {
      await JobService.hardDeleteJob(hardDeleteTarget.id, user.collegeId || '');
      fetchJobs();
      if (selectedJob?.id === hardDeleteTarget.id) setSelectedJob(null);
    } catch { alert('Permanent delete failed.'); }
    finally { setHardDeleteTarget(null); }
  };

  const handleRestore = async (job: Job) => {
    try {
      await JobService.restoreJob(job.id);
      fetchJobs();
    } catch { alert('Restore failed.'); }
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
          <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setSectionTab(t.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${sectionTab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
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
              onBack={() => setSelectedJob(null)}
              onEdit={openEdit}
              onDelete={(e, id) => { const j = pageResult.content.find(x => x.id === id); if (j) requestSoftDelete(e, j); }}
              onDownloadJobRelatedList={(type) => JobService.exportJobApplicants(selectedJob.id, type)}
              onUploadRoundResult={() => fetchJobs()}
            />
          ) : (
            <div className="space-y-4 flex flex-col">
              <JobFilterBar
                searchQuery={searchQuery}    setSearchQuery={setSearchQuery}
                jobOwnerFilter={jobOwnerFilter} setJobOwnerFilter={setJobOwnerFilter}
                filterTypes={filterTypes}
                toggleFilterType={t => setFilterTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])}
                filterModes={filterModes}
                toggleFilterMode={m => setFilterModes(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])}
                filterStatuses={filterStatuses}
                toggleFilterStatus={s => setFilterStatuses(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
              />
              <JobsTable
                jobs={pageResult.content}
                user={user}
                isLoading={isLoading}
                onSelect={setSelectedJob}
                onEdit={openEdit}
                onSoftDelete={requestSoftDelete}
                onHardDelete={canHardDelete ? requestHardDelete : undefined}
                onRestore={canSeeArchived ? handleRestore : undefined}
              />
              {/* Pagination */}
              {pageResult.totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-6 py-3 rounded-xl border shadow-sm">
                  <p className="text-xs text-gray-500 font-medium">
                    Showing {pageResult.currentPage * PAGE_SIZE + 1}–{Math.min((pageResult.currentPage + 1) * PAGE_SIZE, pageResult.totalElements)} of <span className="font-bold text-gray-700">{pageResult.totalElements}</span> jobs
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(pageResult.totalPages, 7) }, (_, i) => {
                      const pageNum = pageResult.totalPages <= 7
                        ? i
                        : currentPage < 4
                          ? i
                          : currentPage > pageResult.totalPages - 4
                            ? pageResult.totalPages - 7 + i
                            : currentPage - 3 + i;
                      return (
                        <button key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${pageNum === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    <button
                      disabled={currentPage >= pageResult.totalPages - 1}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                      Next →
                    </button>
                  </div>
                </div>
              )}
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