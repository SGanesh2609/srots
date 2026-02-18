import React, { useState, useEffect } from 'react';
import { Job, Student } from '../../../types';
import { JobService } from '../../../services/jobService';
import { 
  Calendar as CalendarIcon, CheckCircle, Clock, Lock, 
  XCircle, ChevronRight, Briefcase, Building, ChevronLeft, Loader2
} from 'lucide-react';

/**
 * FIXED: AppTracking with correct JobService method calls
 * 
 * KEY FIXES:
 * 1. Changed getStudentApplications(student.id) to getStudentApplications() (no params)
 * 2. Changed getStudentApplicationTimeline(jobId, student.id) to getStudentApplicationTimeline(jobId)
 * 3. Backend uses JWT token to get student ID automatically
 */

interface AppTrackingProps {
  student: Student;
}

interface ApplicationData {
    job: {
        id: string;
        title: string;
        company: string;
        type: string;
        location: string;
    };
    status: string;
    appliedDate: string;
}

export const AppTracking: React.FC<AppTrackingProps> = ({ student }) => {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [trackerJobId, setTrackerJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // FIXED: Backend call without student ID - uses JWT token
  useEffect(() => {
      const fetchApps = async () => {
          try {
              console.log('🔍 [AppTracking] Fetching student applications (no ID needed - from token)');
              const results = await JobService.getStudentApplications(); // FIXED: No parameters
              console.log('✅ [AppTracking] Applications received:', results.length);
              
              if (Array.isArray(results)) {
                setApplications(results.filter((a: any) => !!a.job));
              } else {
                setApplications([]);
              }
          } catch (error) {
              console.error("❌ [AppTracking] Failed to load applications:", error);
              setApplications([]);
          } finally {
              setLoading(false);
          }
      };
      fetchApps();
  }, [student.id]); // Keep dependency for re-fetch on student change

  // FIXED: Fetch timeline without student ID - backend uses JWT
  useEffect(() => {
      if (trackerJobId) {
          setTimelineLoading(true);
          const fetchTimeline = async () => {
              try {
                  console.log('🔍 [AppTracking] Fetching timeline for job:', trackerJobId);
                  const data = await JobService.getStudentApplicationTimeline(trackerJobId); // FIXED: Only jobId
                  console.log('✅ [AppTracking] Timeline received:', data);
                  setTimeline(Array.isArray(data) ? data : []);
              } catch (error) {
                  console.error("❌ [AppTracking] Failed to load timeline:", error);
                  setTimeline([]);
              } finally {
                  setTimelineLoading(false);
              }
          };
          fetchTimeline();
      } else {
          setTimeline([]);
      }
  }, [trackerJobId, student.id]);
  
  if (trackerJobId) {
      const app = applications.find(a => a.job?.id === trackerJobId);
      if (!app) return <div className="p-4">Job not found. <button onClick={() => setTrackerJobId(null)}>Back</button></div>;
      
      const { job, status, appliedDate } = app;

      // Format date for display
      const formattedAppliedDate = new Date(appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
              <button onClick={() => setTrackerJobId(null)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold mb-4">
                  <ChevronLeft size={20} /> Back to Applications
              </button>
              
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-gray-50 flex justify-between items-start">
                      <div>
                          <h3 className="font-bold text-xl text-gray-900">{job?.title}</h3>
                          <p className="text-sm text-gray-600 font-medium flex items-center gap-2 mt-1">
                              <Building size={16}/> {job?.company}
                          </p>
                      </div>
                      <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${status.includes('Passed') || status.includes('🎉') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {status}
                          </span>
                          <p className="text-xs text-gray-500 mt-2 font-medium">
                              Applied on: <span className="text-gray-700">{formattedAppliedDate}</span>
                          </p>
                      </div>
                  </div>
                  <div className="p-8">
                      <h4 className="font-bold text-gray-800 mb-6 border-b pb-2">Hiring Process Timeline</h4>
                      {timelineLoading ? (
                          <div className="text-center py-8 text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Loading Timeline...</div>
                      ) : timeline.length > 0 ? (
                          <div className="relative pl-2">
                              <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-200"></div>
                              <div className="space-y-8 relative">
                                  {timeline.map((step, idx) => {
                                      // Mapping Status to UI Styles
                                      let statusInfo = { status: 'Pending', color: 'text-gray-400', bg: 'bg-gray-50', icon: <Lock size={16}/> };
                                      if (step.status === 'Completed') statusInfo = { status: 'Completed', color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle size={16}/> };
                                      else if (step.status === 'Rejected') statusInfo = { status: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle size={16}/> };
                                      else if (step.status === 'In Progress') statusInfo = { status: 'In Progress', color: 'text-orange-600', bg: 'bg-orange-50', icon: <Clock size={16}/> };
                                      else if (step.status === 'Process Terminated') statusInfo = { status: 'Terminated', color: 'text-gray-400', bg: 'bg-gray-50', icon: <XCircle size={16}/> };
                                      else if (step.status === 'Locked') statusInfo = { status: 'Locked', color: 'text-gray-400', bg: 'bg-gray-50', icon: <Lock size={16}/> };

                                      return (
                                          <div key={idx} className="relative flex items-center gap-6">
                                              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 ${statusInfo.bg} ${statusInfo.color} ring-2 ring-gray-50`}>
                                                  {statusInfo.icon}
                                              </div>
                                              <div className="flex-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:border-blue-300 transition-all hover:shadow-md">
                                                  <div>
                                                      <p className="font-bold text-gray-900 text-base flex items-center gap-2">
                                                          <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                                                          {step.roundName}
                                                      </p>
                                                      <p className="text-xs text-gray-500 ml-8 mt-1 font-medium flex items-center gap-1">
                                                          <CalendarIcon size={12}/> {step.date}
                                                      </p>
                                                  </div>
                                                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusInfo.bg} ${statusInfo.color} border-transparent`}>
                                                      {statusInfo.status}
                                                  </span>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      ) : (
                          <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed">
                              No timeline data available for this application.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Loading applications...</div>;

  return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Briefcase size={24} className="text-blue-600"/> Application Status Tracker
          </h2>
          <div className="grid gap-4">
              {applications.map(({ job, status }) => {
                  if (!job) return null;
                  return (
                    <div 
                        key={job.id} 
                        onClick={() => setTrackerJobId(job.id)}
                        className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-300 relative overflow-hidden"
                    >
                        <div className="absolute right-0 top-0 h-full w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700 font-bold text-lg">
                                    {job.company?.[0] || '?'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">{job.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium">{job.company || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 ${status.includes('Passed') || status.includes('🎉') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {status}
                                </span>
                                <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                                    View Details <ChevronRight size={14}/>
                                </p>
                            </div>
                        </div>
                    </div>
                  );
              })}
              {applications.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
                      <Briefcase size={48} className="mx-auto mb-4 opacity-20"/>
                      <p>You haven't applied to any jobs yet.</p>
                  </div>
              )}
          </div>
      </div>
  );
};