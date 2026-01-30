
import React from 'react';
import { Job } from '../../../../../types';
import { Shield, CheckCircle, GraduationCap, DollarSign, Briefcase, Download, AlertTriangle, Info, Heart, Star, Users } from 'lucide-react';

/**
 * Component Name: JobOverviewTab
 * Directory: components/colleges/cp-portal/jobs/details/JobOverviewTab.tsx
 * 
 * Functionality:
 * - Displays the Job Summary, Eligibility Criteria (Academic, Batch, Gaps).
 * - Shows Key Responsibilities, Qualifications, and Compensation.
 * - Displays Company Culture, EEO, and Physical Demands if available.
 * - Provides high-level stats (Total Applicants, Not Interested count).
 * 
 * Used In: JobDetailView (Admin & Student)
 */

interface JobOverviewTabProps {
    job: Job;
    validApplicantsCount: number;
    onDownloadList: (type: 'applicants' | 'not-interested') => void;
    showStatsAndExports?: boolean;
}

export const JobOverviewTab: React.FC<JobOverviewTabProps> = ({ 
    job, 
    validApplicantsCount, 
    onDownloadList, 
    showStatsAndExports = true 
}) => {
    if (!job) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Job Summary */}
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
                <div className="flex justify-between items-start mb-4 border-b pb-3">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">About the Role</h3>
                        {job.hiringDepartment && (
                            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                <Users size={12} /> Dept: {job.hiringDepartment}
                            </span>
                        )}
                    </div>
                    {job.internalId && <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-500 font-medium">ID: {job.internalId}</span>}
                </div>
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-sm">{job.summary}</div>
                
                {/* Company Culture / Additional Info */}
                {(job.companyCulture || job.physicalDemands || job.eeoStatement) && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                        {job.companyCulture && (
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1"><Heart size={14} className="text-pink-500"/> Company Culture</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{job.companyCulture}</p>
                            </div>
                        )}
                        {job.physicalDemands && (
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1"><Info size={14} className="text-blue-500"/> Physical Demands</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{job.physicalDemands}</p>
                            </div>
                        )}
                        {job.eeoStatement && (
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1"><Shield size={14} className="text-green-500"/> EEO Statement</h4>
                                <p className="text-xs text-gray-500 italic leading-relaxed">{job.eeoStatement}</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Eligibility Cards */}
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-indigo-600"/> Eligibility Criteria
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Academic Performance</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">B.Tech CGPA</span><span className="font-bold">{job.eligibility?.minCGPA}+</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Active Backlogs</span><span className="font-bold text-red-600">{job.eligibility?.maxBacklogs} Max</span></div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Prerequisites</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Class 10th</span><span className="font-bold">{job.eligibility?.min10th}%</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Class 12th / Diploma</span><span className="font-bold">{job.eligibility?.min12th}%</span></div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Other Criteria</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Batch</span>
                                <span className="font-bold">
                                    {job.eligibility?.eligibleBatches && job.eligibility.eligibleBatches.length > 0 
                                        ? job.eligibility.eligibleBatches.join(', ') 
                                        : job.eligibility?.batch}
                                </span>
                            </div>
                            <div className="flex justify-between"><span className="text-gray-600">Education Gaps</span><span className={`font-bold ${job.eligibility?.educationalGapsAllowed ? 'text-green-600' : 'text-red-600'}`}>{job.eligibility?.educationalGapsAllowed ? 'Allowed' : 'Not Allowed'}</span></div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Eligible Branches</p>
                    <div className="flex flex-wrap gap-2">
                        {job.eligibility?.allowedBranches?.map(b => (
                            <span key={b} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">{b}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Responsibilities & Qualifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white p-6 rounded-2xl border shadow-sm h-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-blue-600"/> Key Responsibilities</h3>
                    <ul className="space-y-3">
                        {job.responsibilities?.map((r, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-700">
                                <span className="text-blue-400 mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0"></span><span className="leading-relaxed">{r}</span>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="bg-white p-6 rounded-2xl border shadow-sm h-full flex flex-col gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><GraduationCap size={18} className="text-blue-600"/> Qualifications & Skills</h3>
                        <ul className="space-y-3">
                            {job.qualifications?.map((q, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-700">
                                    <span className="text-blue-400 mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0"></span><span className="leading-relaxed">{q}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {job.preferredQualifications && job.preferredQualifications.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Star size={14} className="text-amber-500"/> Preferred Qualifications</h4>
                            <ul className="space-y-2">
                                {job.preferredQualifications.map((pq, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                                        <span className="text-amber-400 mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></span>
                                        <span className="leading-relaxed italic">{pq}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            </div>

            {/* Compensation */}
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><DollarSign size={18} className="text-green-600"/> Compensation & Benefits</h3>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 min-w-[200px] text-center">
                        <p className="text-xs text-green-800 uppercase font-bold mb-1">Salary Range</p>
                        <p className="text-xl font-bold text-green-700">{job.salaryRange || 'Not Disclosed'}</p>
                    </div>
                    {job.benefits && job.benefits.length > 0 && (
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-700 mb-2">Perks:</p>
                            <div className="flex flex-wrap gap-2">
                                {job.benefits.map((b, i) => <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">{b}</span>)}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Application Stats & Exports (Admin Only) */}
            {showStatsAndExports && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-dashed border-gray-200">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex justify-between items-start"><h4 className="text-blue-900 font-bold text-lg mb-1">Total Applicants</h4><div className="p-2 bg-blue-200/50 rounded-lg text-blue-700"><Briefcase size={20}/></div></div>
                            <p className="text-blue-700 text-sm opacity-80">Students who have applied for this position.</p>
                            <p className="text-4xl font-extrabold text-blue-600 mt-4">{validApplicantsCount}</p>
                        </div>
                        <button onClick={() => onDownloadList('applicants')} className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"><Download size={18}/> Download Applicant List</button>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex justify-between items-start"><h4 className="text-gray-900 font-bold text-lg mb-1">Not Interested</h4><div className="p-2 bg-gray-200/50 rounded-lg text-gray-600"><AlertTriangle size={20}/></div></div>
                            <p className="text-gray-600 text-sm opacity-80">Eligible students who opted out.</p>
                            <p className="text-4xl font-extrabold text-gray-700 mt-4">{job.notInterested?.length || 0}</p>
                        </div>
                        <button onClick={() => onDownloadList('not-interested')} className="mt-6 w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"><Download size={18}/> Download List</button>
                    </div>
                </div>
            )}
        </div>
    );
};
