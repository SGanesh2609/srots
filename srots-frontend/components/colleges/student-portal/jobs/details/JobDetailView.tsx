import React from 'react';
import { Job, Student, StudentJobView } from '../../../../../types';
import { 
    ArrowLeft, Building, CheckCircle, MapPin, Briefcase, Ban, 
    Lock, AlertTriangle, ExternalLink, Calendar as CalendarIcon, 
    FileText, List, DollarSign, Clock, ShieldCheck, Tag, Info, 
    Award, Layers, Target, Users
} from 'lucide-react';

interface JobDetailViewProps {
    job: Job;
    student: Student;
    viewData: StudentJobView;
    onBack: () => void;
    onApply: (id: string) => void;
    onNotInterested: (id: string) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ 
    job, student, viewData, onBack, onApply, onNotInterested
}) => {
    const { isApplied, isEligible, eligibilityReason, isExpired, isNotInterested } = viewData;
    
    if (!job) {
        return (
            <div className="p-12 text-center text-gray-500">
                <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                <p>Job information is currently unavailable.</p>
                <button onClick={onBack} className="mt-4 text-blue-600 font-bold hover:underline">Back to Jobs</button>
            </div>
        );
    }

    // Safely parse JSON or return defaults
    const parseField = (field: any) => {
        try {
            if (Array.isArray(field)) return field;
            if (typeof field === 'string' && field.trim()) return JSON.parse(field);
            return [];
        } catch (e) { return []; }
    };

    const responsibilities = parseField(job.responsibilitiesJson);
    const qualifications = parseField(job.qualificationsJson);
    const skills = parseField(job.requiredStudentFields || job.skills);
    const benefits = parseField(job.benefitsJson);
    const rounds = parseField(job.rounds);
    const documents = parseField(job.documents);

    return (
        <div className="bg-white rounded-xl border shadow-sm h-full md:h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-right-4 overflow-hidden absolute inset-0 z-20 md:static">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="block font-bold text-gray-800 leading-none">Job Details</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Ref: {job.id.substring(0,8)}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full bg-gray-50/30">
                <div className="p-4 md:p-8 max-w-6xl mx-auto">
                    
                    {/* Top Branding & Status Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                        <div className="flex items-start gap-5">
                            <div className="w-20 h-20 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-blue-600 shadow-sm shrink-0 overflow-hidden">
                                {job.companyLogo ? (
                                    <img src={job.companyLogo} alt="logo" className="w-full h-full object-contain" />
                                ) : (
                                    <span>{job.companyName?.[0] || job.company?.[0] || 'J'}</span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 leading-tight tracking-tight">
                                    {job.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm">
                                    <span className="font-bold text-blue-700 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded">
                                        <Building size={16}/> {job.companyName || job.company}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                                        <MapPin size={16}/> {job.location || 'Remote'}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                                        <Clock size={16}/> {job.jobType || 'Full-time'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0 w-full md:w-auto">
                            <div className={`px-4 py-2 rounded-full text-xs font-black tracking-widest border shadow-sm flex items-center gap-2 ${
                                isApplied ? 'bg-green-100 text-green-700 border-green-200' : 
                                !isEligible ? 'bg-red-50 text-red-700 border-red-200' : 
                                isExpired ? 'bg-gray-100 text-gray-500 border-gray-200' : 
                                'bg-indigo-600 text-white border-indigo-700'
                            }`}>
                                {isApplied ? <CheckCircle size={14}/> : !isEligible ? <Ban size={14}/> : <Target size={14}/>}
                                {isApplied ? 'APPLICATION SUBMITTED' : !isEligible ? 'NOT ELIGIBLE' : isExpired ? 'APPLICATIONS CLOSED' : 'OPEN FOR APPLICATIONS'}
                            </div>
                        </div>
                    </div>

                    {/* Quick Highlights Bar (Compensation, Bond, etc) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-blue-600 mb-1"><DollarSign size={20}/></div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Compensation (CTC)</p>
                            <p className="font-extrabold text-gray-900">{job.salaryRange || 'Best in Industry'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-orange-600 mb-1"><ShieldCheck size={20}/></div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Service Bond</p>
                            <p className="font-extrabold text-gray-900">{job.serviceBond || 'No Bond'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-purple-600 mb-1"><CalendarIcon size={20}/></div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Joining Date</p>
                            <p className="font-extrabold text-gray-900">{job.joiningDate || 'Immediate'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-emerald-600 mb-1"><Layers size={20}/></div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Openings</p>
                            <p className="font-extrabold text-gray-900">{job.vacancies || 'Multiple'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* About the Job */}
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Info size={22} className="text-blue-600"/> Role Description
                                </h3>
                                <div className="bg-white p-6 rounded-2xl border shadow-sm leading-relaxed text-gray-600 whitespace-pre-line">
                                    {job.summary || 'No description provided.'}
                                </div>
                            </section>

                            {/* Required Skills (Tags) */}
                            {skills.length > 0 && (
                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Award size={22} className="text-orange-500"/> Required Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill: string, idx: number) => (
                                            <span key={idx} className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-100 rounded-xl font-bold text-sm flex items-center gap-2">
                                                <Tag size={14}/> {skill}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Key Responsibilities */}
                            {responsibilities.length > 0 && (
                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <List size={22} className="text-emerald-500"/> Key Responsibilities
                                    </h3>
                                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                                        {responsibilities.map((item: string, idx: number) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-gray-600 leading-snug">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Eligibility Snapshot */}
                            <div className={`p-6 rounded-2xl border-2 ${isEligible ? 'bg-indigo-50/50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
                                <h3 className="font-black text-gray-900 mb-4 flex items-center justify-between">
                                    Academic Criteria
                                    {isEligible ? <CheckCircle className="text-green-500" size={20}/> : <AlertTriangle className="text-red-500" size={20}/>}
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Minimum UG', val: job.minUgScore, unit: job.formatUg || '%' },
                                        { label: '10th & 12th', val: job.min10thScore, unit: job.format10th || '%' },
                                        { label: 'History of Arrears', val: job.maxBacklogs, unit: 'Max' },
                                    ].map((crit, i) => crit.val !== undefined && (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200/50 last:border-0">
                                            <span className="text-sm text-gray-500 font-medium">{crit.label}</span>
                                            <span className="font-bold text-gray-900">{crit.val} {crit.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Selection Rounds Timeline */}
                            {rounds.length > 0 && (
                                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users size={18} className="text-blue-500"/> Hiring Process
                                    </h3>
                                    <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                        {rounds.map((round: any, idx: number) => (
                                            <div key={idx} className="relative pl-8">
                                                <div className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-blue-500 rounded-full z-10 flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                </div>
                                                <p className="text-sm font-black text-gray-800">{round.name}</p>
                                                <p className="text-xs text-gray-400 font-medium mt-1">{round.date || 'To be announced'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            {documents.length > 0 && (
                                <div className="bg-indigo-900 p-6 rounded-2xl shadow-lg">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <FileText size={18}/> Resources
                                    </h3>
                                    <div className="space-y-2">
                                        {documents.map((doc: any, i: number) => (
                                            <a key={i} href={doc.url} target="_blank" rel="noreferrer" 
                                               className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10">
                                                <div className="p-2 bg-white/20 rounded-lg"><FileText size={14}/></div>
                                                <span className="text-xs font-bold truncate uppercase tracking-tighter">{doc.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fixed Action Footer for Student Portal */}
                    <div className="mt-12 mb-20 md:mb-6 pt-8 border-t">
                        {isApplied ? (
                            <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32}/>
                                </div>
                                <h2 className="text-2xl font-black text-green-900">Application Submitted!</h2>
                                <p className="text-green-700 mt-2">You have successfully expressed interest. You can track this application in your dashboard.</p>
                            </div>
                        ) : !isEligible ? (
                            <div className="bg-red-50 border border-red-100 p-6 rounded-3xl">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><AlertTriangle size={24}/></div>
                                    <div>
                                        <h4 className="text-lg font-bold text-red-900">Ineligible to Apply</h4>
                                        <p className="text-red-700 mt-1">{eligibilityReason || "Your current profile doesn't meet the recruiter's specific requirements."}</p>
                                    </div>
                                </div>
                            </div>
                        ) : isExpired ? (
                            <div className="bg-gray-100 p-8 rounded-3xl text-center border-2 border-dashed border-gray-200">
                                <Lock className="mx-auto mb-3 text-gray-400" size={30}/>
                                <h3 className="text-xl font-bold text-gray-600">This Opportunity is Closed</h3>
                                <p className="text-gray-500">The application deadline has passed.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl border-2 border-blue-50 shadow-xl">
                                <div>
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Deadine to Apply</span>
                                    <p className="text-2xl font-black text-gray-900">{job.applicationDeadline || 'As soon as possible'}</p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    {!isNotInterested ? (
                                        <>
                                            <button
                                                onClick={() => onNotInterested(job.id)}
                                                className="px-8 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all border border-gray-200"
                                            >
                                                Not Interested
                                            </button>
                                            {job.externalLink ? (
                                                <a
                                                    href={job.externalLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                                                >
                                                    Apply on Company Website <ExternalLink size={20}/>
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={() => onApply(job.id)}
                                                    className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                                                >
                                                    Apply Now <ExternalLink size={20}/>
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-3 px-8 py-4 bg-gray-50 text-gray-400 font-bold rounded-2xl border-2 border-dashed italic">
                                            <Ban size={20}/> You marked this as Not Interested
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