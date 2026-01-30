
import React, { useState, useEffect } from 'react';
import { JobService } from '../../../../services/jobService'; // Import JobService directly
import { Job, User } from '../../../../types';
import { Plus } from 'lucide-react';
import { JobWizard } from './JobWizard';
import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';
import { JobFilterBar } from './lists/JobFilterBar';
import { JobsTable } from './lists/JobsTable';
import { JobDetailView } from './details/JobDetailView';

interface JobsSectionProps {
  user: User;
}

export const JobsSection: React.FC<JobsSectionProps> = ({ user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Filtering State
  const [jobOwnerFilter, setJobOwnerFilter] = useState<'all' | 'my'>('all');
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterModes, setFilterModes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateJob, setShowCreateJob] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null); 
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  // Fetch Jobs via Async API
  useEffect(() => {
      refreshJobs();
  }, [user.collegeId, searchQuery, filterTypes, filterModes, jobOwnerFilter]);

  const refreshJobs = async () => {
      const filters = {
          query: searchQuery,
          types: filterTypes,
          modes: filterModes,
          ownerId: jobOwnerFilter === 'my' ? user.id : undefined
      };
      
      // Async Call
      try {
          const result = await JobService.searchJobs(user.collegeId || '', filters);
          setJobs(result);
          // If a job is selected, update it with fresh data from the list
          if (selectedJob) {
              const fresh = result.find(j => j.id === selectedJob.id);
              if (fresh) setSelectedJob(fresh);
          }
      } catch (err) {
          console.error("Failed to load jobs", err);
      }
  };

  const liveJob = selectedJob ? jobs.find(j => j.id === selectedJob.id) || selectedJob : null;

  const handleOpenCreateJob = () => {
      setIsEditingJob(false);
      setEditingJob(null);
      setSelectedJob(null);
      setShowCreateJob(true);
  };

  const handleOpenEditJob = (e: React.MouseEvent | undefined, jobToEdit: Job) => {
      if(e) { e.preventDefault(); e.stopPropagation(); }
      if (!jobToEdit) return;
      setEditingJob(jobToEdit);
      setIsEditingJob(true);
      setShowCreateJob(true);
  };

  const requestDeleteJob = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      setDeleteJobId(id);
  };

  const confirmDeleteJob = async () => {
      if (deleteJobId) {
          await JobService.deleteJob(deleteJobId);
          setDeleteJobId(null);
          // If deleted job was selected, deselect it
          if (selectedJob?.id === deleteJobId) {
              setSelectedJob(null);
          }
          refreshJobs();
      }
  };

  const handleSaveJob = async (jobData: Partial<Job>) => {
      try {
          if (isEditingJob && editingJob) {
              // 3-Tier Sync: Use Update endpoint for edits
              // Ensure we pass the ID. JobWizard should populate form state with initialData including ID.
              // If partial jobData doesn't have ID, we attach it from editingJob.
              const payload = { ...jobData, id: editingJob.id };
              await JobService.updateJob(payload);
              alert("Job updated successfully!");
          } else {
              // Create new
              await JobService.createJob(jobData, user);
              alert("Job posted successfully!");
          }
          refreshJobs();
          setShowCreateJob(false);
          setEditingJob(null);
      } catch(e: any) {
          console.error(e);
          alert("Failed to save job: " + e.message);
      }
  };

  // NEW: Handler for downloading lists
  const handleDownloadJobRelatedList = async (listType: 'applicants' | 'not-interested') => {
      if (!selectedJob) return;
      try {
          await JobService.downloadJobRelatedList(selectedJob.id, listType);
      } catch (e: any) {
          alert("Failed to download list: " + e.message);
      }
  };

  // Triggered when Rounds Tab uploads a result file
  const handleRoundResultsUpdated = () => {
      refreshJobs(); // Reload data to show updated Qualified counts
  };

  return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
          {!selectedJob && !showCreateJob && (
              <div className="space-y-6 h-full flex flex-col">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-none px-2">
                       <h2 className="text-2xl font-bold text-gray-800">Manage Jobs</h2>
                       <button onClick={handleOpenCreateJob} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"><Plus size={16} /> Post Job</button>
                   </div>
                   
                   <JobFilterBar 
                       searchQuery={searchQuery}
                       setSearchQuery={setSearchQuery}
                       jobOwnerFilter={jobOwnerFilter}
                       setJobOwnerFilter={setJobOwnerFilter}
                       filterTypes={filterTypes}
                       toggleFilterType={(t) => setFilterTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                       filterModes={filterModes}
                       toggleFilterMode={(m) => setFilterModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
                   />

                   <JobsTable 
                       jobs={jobs} 
                       user={user} 
                       onSelect={setSelectedJob}
                       onEdit={handleOpenEditJob}
                       onDelete={requestDeleteJob}
                   />
              </div>
          )}

          {selectedJob && (
              <JobDetailView 
                  job={liveJob!} 
                  user={user} 
                  onBack={() => setSelectedJob(null)}
                  onEdit={handleOpenEditJob}
                  onDelete={requestDeleteJob}
                  onDownloadJobRelatedList={handleDownloadJobRelatedList}
                  onUploadRoundResult={handleRoundResultsUpdated}
              />
          )}

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
              message="This action cannot be undone."
          />
      </div>
  );
};
