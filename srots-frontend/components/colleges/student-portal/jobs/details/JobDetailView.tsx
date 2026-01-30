
import React, { useState, useEffect } from 'react';
import { Job, Student, StudentJobView } from '../../../../../types';
import { 
    ArrowLeft, Building, 
    CheckCircle, MapPin, Briefcase, Ban, Lock, AlertTriangle, ExternalLink, Calendar as CalendarIcon, FileText, List, Loader2 
} from 'lucide-react';
import { JobService } from '../../../../../services/jobService';
import { JobOverviewTab } from '../../../cp-portal/jobs/details/JobOverviewTab';

interface JobDetailViewProps {
    job: Job;
    student: Student;
    onBack: () => void;
    onApply: (id: string) => void;
    onNotInterested: (id: string) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ 
    job, student, onBack, onApply, onNotInterested
}) => {
    const [viewData, setViewData] = useState<StudentJobView | null>(null);

    useEffect(() => {
        const loadDetails = async () => {
            if (job?.id && student?.id) {
                const data = await JobService.getJobDetailsForStudent(job.id, student.id);
                setViewData(data);
            }
        };
        loadDetails();
    }, [job?.id, student?.id]);

    if (!job) {
        return (
            <div className="p-12 text-center text-gray-500 animate-in fade-in">
                <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                <p>Job information is currently unavailable.</p>
                <button onClick={onBack} className="mt-4 text-blue-600 font-bold hover:underline">Back to Jobs</button>
            </div>
        );
    }

    if (!viewData) return <div className="p-12 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Loading details...</div>;

    const { isApplied, isEligible, eligibilityReason, isExpired, isNotInterested } = viewData;

    return (
        <div className="bg-white rounded-xl border shadow-sm h-full md:h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-right-4 overflow-hidden absolute inset-0 z-20 md:static">
            <div className="p-4 border-b flex items-center gap-3 bg-white z-10 rounded-t-xl shadow-sm">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-bold text-gray-700">Back to Job List</span>
            </div>

            <div className="flex-1 overflow-y-auto w-full bg-gray-50/30">
                <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-full flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-500 border shrink-0">
                                {job.company ? job.company[0] : '?'}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.title || 'Job Title'}</h1>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                                    <span className="font-bold flex items-center gap-1"><Building size={14} className="md:w-4 md:h-4"/> {job.company || 'Unknown Company'}</span>
                                    <span className="hidden md:inline text-gray-300">|</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} className="md:w-4 md:h-4"/> {job.location || 'Location TBA'}</span>
                                    <span className="hidden md:inline text-gray-300">|</span>
                                    <span className="flex items-center gap-1"><Briefcase size={14} className="md:w-4 md:h-4"/> {job.type || 'Full-Time'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto justify-between md:justify-start mt-2 md:mt-0">
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${isApplied ? 'bg-green-100 text-green-700 border-green-200' : !isEligible ? 'bg-red-50 text-red-700 border-red-200' : isExpired ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {isApplied ? (
                                    <span className="flex items-center gap-1"><CheckCircle size={16}/> Applied</span>
                                ) : !isEligible ? (
                                    <span className="flex items-center gap-1"><Ban size={16}/> Not Eligible</span>
                                ) : isExpired ? (
                                    <span className="flex items-center gap-1"><Lock size={16}/> Closed</span>
                                ) : (
                                    <span className="flex items-center gap-1"><CheckCircle size={16}/> Open</span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Posted: {job.postedAt || 'N/A'}</span>
                        </div>
                    </div>

                    <JobOverviewTab 
                        job={job} 
                        validApplicantsCount={0} 
                        onDownloadList={() => {}} 
                        showStatsAndExports={false} 
                    /> 

                    {job.rounds && job.rounds.length > 0 && (
                        <div className="mb-8 pb-8 border-b bg-white p-6 rounded-2xl border shadow-sm mt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><List size={18} className="text-blue-600"/> Selection Process</h3>
                            <div className="space-y-3">
                                {job.rounds.map((round, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{round.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1"><CalendarIcon size={10}/> {round.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {job.documents && job.documents.length > 0 && (
                        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider">Attachments</h3>
                            <div className="flex flex-wrap gap-3">
                                {job.documents.map((doc, i) => (
                                    <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-700 font-bold text-xs transition-colors shadow-sm w-full md:w-auto justify-center md:justify-start">
                                        <FileText size={16}/> {doc.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-8 border-t bg-gray-50/50 p-6 rounded-xl border border-gray-200 pb-20 md:pb-6">
                        {isApplied ? (
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in">
                                <div className="text-green-800">
                                    <div className="flex items-center gap-2 font-bold text-xl">
                                        <CheckCircle size={24}/> Application Submitted
                                    </div>
                                    <p className="text-sm opacity-80 mt-1">You have successfully applied for this position. Track your status in the App Status tab.</p>
                                </div>
                                <button disabled className="w-full md:w-auto px-8 py-3 bg-green-100 text-green-800 font-bold rounded-lg border border-green-200">
                                    Applied
                                </button>
                            </div>
                        ) : !isEligible ? (
                            <div className="flex flex-col gap-4 animate-in fade-in">
                                    <div className="flex items-center gap-3 text-red-800 font-bold text-xl">
                                        <div className="p-2 bg-red-100 rounded-full"><AlertTriangle size={24}/></div>
                                        Not Eligible to Apply
                                    </div>
                                    <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg shadow-sm">
                                        <h5 className="text-red-900 font-bold mb-2">Reason:</h5>
                                        <p className="text-red-700 font-medium text-sm md:text-lg leading-relaxed">
                                            {eligibilityReason || "You do not meet the academic or batch requirements for this position."}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Lock size={14}/> Application Locked
                                        </div>
                                        <div>
                                            Deadline: <span className="font-bold">{job.applicationDeadline}</span>
                                        </div>
                                    </div>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="text-sm text-gray-600 w-full md:w-auto flex justify-between md:block">
                                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Last Date to Apply</span>
                                    <span className={`font-bold text-lg ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>{job.applicationDeadline}</span>
                                </div>
                                
                                <div className="w-full md:w-auto">
                                    {isExpired ? (
                                        <div className="px-8 py-3 bg-gray-200 text-gray-500 font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed w-full md:w-auto">
                                            <Lock size={20}/> Applications Closed
                                        </div>
                                    ) : isNotInterested ? (
                                        <div className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-lg border border-gray-200 flex items-center justify-center gap-2 w-full md:w-auto">
                                            <Ban size={20}/> Marked as Not Interested
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                            <button onClick={() => onNotInterested(job.id)} className="w-full md:w-auto flex-1 px-5 py-3 bg-white border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                                                Not Interested
                                            </button>
                                            
                                            {job.externalLink ? (
                                                <a 
                                                    href={job.externalLink} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="w-full md:w-auto flex-1 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md"
                                                >
                                                    Apply Externally <ExternalLink size={18}/>
                                                </a>
                                            ) : (
                                                <button 
                                                    onClick={() => onApply(job.id)} 
                                                    className="w-full md:w-auto flex-[2] px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                                                >
                                                    Apply Now <Briefcase size={20}/>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
