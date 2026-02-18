import React, { useState, useEffect } from 'react';
import { StudentJobView, Student } from '../../../types';
import { JobService } from '../../../services/jobService';
import { JobDetailView } from './jobs/details/JobDetailView';
import { JobFilters } from './jobs/JobFilters';
import { JobListDesktop } from './jobs/JobListDesktop';
import { JobListMobile } from './jobs/JobListMobile';

/**
 * StudentJobs.tsx - Unchanged, already correct
 */

interface StudentJobsProps {
  student: Student;
}

export const StudentJobs: React.FC<StudentJobsProps> = ({ student }) => {
  const [jobs, setJobs] = useState<StudentJobView[]>([]);
  const [selectedJob, setSelectedJob] = useState<StudentJobView | null>(null);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [workModeFilters, setWorkModeFilters] = useState<string[]>([]);

  useEffect(() => {
      refreshJobs();
  }, [student.id, searchQuery, statusFilter, typeFilters, workModeFilters]);

  const refreshJobs = async () => {
      try {
          const results = await JobService.getJobsForStudent({
              status: statusFilter,
              query: searchQuery,
              type: typeFilters,
              workMode: workModeFilters
          });
          
          setJobs(Array.isArray(results) ? results : []);
      } catch (err: any) {
          console.error("❌ [StudentJobs] Error:", err);
          setJobs([]);
      }
  };

  const toggleTypeFilter = (type: string) => {
      setTypeFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleWorkModeFilter = (mode: string) => {
      setWorkModeFilters(prev => prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]);
  };

  const handleMobileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setTypeFilters(val === 'All' ? [] : [val]);
  };

  return (
      <>
          {selectedJob ? (
              <JobDetailView 
                  job={selectedJob.job} 
                  student={student}
                  viewData={selectedJob}
                  onBack={() => setSelectedJob(null)}
                  onApply={async (id) => {
                      await JobService.applyToJob(id);
                      refreshJobs();
                      setSelectedJob(null);
                  }}
                  onNotInterested={() => {}}
              />
          ) : (
              <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4 relative">
                  <JobFilters 
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      typeFilters={typeFilters} 
                      toggleTypeFilter={toggleTypeFilter}
                      workModeFilters={workModeFilters} 
                      toggleWorkModeFilter={toggleWorkModeFilter}
                      handleMobileTypeChange={handleMobileTypeChange}
                  />
                  <JobListDesktop jobs={jobs} onSelectJob={setSelectedJob} statusFilter={statusFilter} />
                  <JobListMobile jobs={jobs} onSelectJob={setSelectedJob} />
              </div>
          )}
      </>
  );
};