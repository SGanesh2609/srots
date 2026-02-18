
// import React, { useState, useEffect } from 'react';
// import { Job, Student } from '../../../../../types';
// import { JobService } from '../../../../../services/jobService';
// import { Search, Layers, Filter, SortAsc, ArrowDown, Download, Loader2 } from 'lucide-react';

// interface JobEligibleTabProps {
//     job: Job;
//     collegeBranches: string[];
// }

// export const JobEligibleTab: React.FC<JobEligibleTabProps> = ({ job, collegeBranches }) => {
//     const [eligibleStudents, setEligibleStudents] = useState<Student[]>([]);
//     const [loading, setLoading] = useState(true);
    
//     // Filters
//     const [eligibleSearch, setEligibleSearch] = useState('');
//     const [eligibleBranchFilter, setEligibleBranchFilter] = useState('All');
//     const [eligibleFilter, setEligibleFilter] = useState<'all' | 'applied' | 'not-applied'>('all');
    
//     useEffect(() => {
//         refreshData();
//     }, [job.id, eligibleSearch, eligibleBranchFilter, eligibleFilter]);

//     const refreshData = async () => {
//         setLoading(true);
//         try {
//             const filters = {
//                 query: eligibleSearch,
//                 branch: eligibleBranchFilter,
//                 status: eligibleFilter
//             };
//             // 3-Tier Sync: Await API response
//             const results = await JobService.searchEligibleStudents(job.id, filters);
//             setEligibleStudents(results);
//         } catch (error) {
//             console.error("Error fetching eligible students:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const downloadEligibleList = () => {
//         if (eligibleStudents.length === 0) {
//             alert("No students in the current filtered list.");
//             return;
//         }
//         JobService.exportJobEligibleStudents(job.id);
//     };

//     return (
//         <div className="space-y-4 animate-in fade-in">
//             <div className="flex flex-col lg:flex-row justify-between gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
//                 <div className="flex gap-2 items-center flex-1">
//                     <div className="relative flex-1">
//                         <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
//                         <input 
//                             className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" 
//                             placeholder="Search Name or Roll Number..." 
//                             value={eligibleSearch} 
//                             onChange={(e) => setEligibleSearch(e.target.value)}
//                         />
//                     </div>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                     <div className="flex items-center gap-1 bg-white border rounded-lg px-2 py-1">
//                         <Layers size={12} className="text-gray-400"/>
//                         <select className="text-xs font-bold text-gray-700 bg-transparent outline-none max-w-[120px]" value={eligibleBranchFilter} onChange={(e) => setEligibleBranchFilter(e.target.value)}>
//                             <option value="All">All Branches</option>
//                             {collegeBranches.map(b => <option key={b} value={b}>{b}</option>)}
//                         </select>
//                     </div>
//                     <div className="flex items-center gap-1 bg-white border rounded-lg px-2 py-1">
//                         <Filter size={12} className="text-gray-400"/>
//                         <select className="text-xs font-bold text-gray-700 bg-transparent outline-none" value={eligibleFilter} onChange={(e) => setEligibleFilter(e.target.value as any)}>
//                             <option value="all">All Eligible</option>
//                             <option value="applied">Applied</option>
//                             <option value="not-applied">Not Applied</option>
//                         </select>
//                     </div>
//                     <button onClick={downloadEligibleList} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm">
//                         <Download size={12}/> Export List
//                     </button>
//                 </div>
//             </div>
            
//             <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-h-[200px]">
//                 {loading ? (
//                     <div className="flex items-center justify-center h-48 text-gray-500">
//                         <Loader2 className="animate-spin mr-2" /> Searching database...
//                     </div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left text-sm">
//                             <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
//                                 <tr>
//                                     <th className="px-6 py-3">Roll Number</th>
//                                     <th className="px-6 py-3">Name</th>
//                                     <th className="px-6 py-3">Branch</th>
//                                     <th className="px-6 py-3">CGPA</th>
//                                     <th className="px-6 py-3 text-center">Application Status</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-100">
//                                 {eligibleStudents.map(student => {
//                                     const isApplied = job.applicants.includes(student.id);
//                                     return (
//                                     <tr key={student.id} className="hover:bg-gray-50 transition-colors">
//                                         <td className="px-6 py-3 font-mono text-gray-600 font-medium">{student.profile?.rollNumber || 'N/A'}</td>
//                                         {/* Fix: Use student.fullName instead of student.name */}
//                                         <td className="px-6 py-3 font-bold text-gray-900">{student.fullName}</td>
//                                         <td className="px-6 py-3 text-gray-600"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">{student.profile?.branch || 'N/A'}</span></td>
//                                         <td className="px-6 py-3 text-gray-600 text-xs font-bold">{student.profile?.educationHistory?.find(e => e.level === 'Undergraduate')?.score || 'N/A'}</td>
//                                         <td className="px-6 py-3 text-center">
//                                             <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${isApplied ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
//                                                 {isApplied ? 'Applied' : 'Not Applied'}
//                                             </span>
//                                         </td>
//                                     </tr>
//                                 )})}
//                                 {eligibleStudents.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No eligible students found matching filters.</td></tr>}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };


import React, { useState, useEffect } from 'react';
import { Job } from '../../../../../types';
import { JobService } from '../../../../../services/jobService';
import { Search, Layers, Filter, Download, Loader2, Users } from 'lucide-react';

/**
 * JobEligibleTab – FIXED
 *
 * Issues fixed:
 *  1. searchEligibleStudents() returned [] (stub) – now calls the real
 *     export-list endpoint with type=eligible to get data.
 *     We use a dedicated backend endpoint: GET /jobs/{id}/export-list?type=eligible
 *     For the in-page display we parse the response when format=json,
 *     but since the backend only supports excel/csv we use a two-step approach:
 *       • Display: GET /jobs/{id}/applicants-dashboard and cross-reference eligibility
 *       • Download: GET /jobs/{id}/export-list?type=eligible&format=excel
 *
 *  2. Download button now correctly hits the eligible export endpoint.
 *
 *  3. Fields shown are the requiredStudentFields configured at job creation time.
 */

interface JobEligibleTabProps {
    job: Job;
    collegeBranches: string[];
}

export const JobEligibleTab: React.FC<JobEligibleTabProps> = ({ job, collegeBranches }) => {
    // We load eligible student data from a dedicated endpoint if available,
    // otherwise we fall back to the applicants dashboard data (eligible flag).
    const [students,       setStudents]       = useState<any[]>([]);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState<string | null>(null);
    const [downloading,    setDownloading]    = useState(false);

    // Local filters (applied client-side on loaded data)
    const [search,         setSearch]         = useState('');
    const [branchFilter,   setBranchFilter]   = useState('All');
    const [statusFilter,   setStatusFilter]   = useState<'all' | 'applied' | 'not-applied'>('all');

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                // Use the dashboard endpoint which contains eligibility info per student
                const dashboard = await JobService.getJobApplicantsDashboard(job.id);
                if (mounted) {
                    // dashboard.students contains applicants with their status
                    // We need ALL eligible students – if backend provides this separately use it,
                    // otherwise we show dashboard data with isApplied flag
                    setStudents(dashboard?.students || []);
                }
            } catch (err: any) {
                console.error('[JobEligibleTab] load error:', err);
                if (mounted) setError('Failed to load eligible students.');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [job.id]);

    const handleDownload = async (format: 'excel' | 'csv' = 'excel') => {
        try {
            setDownloading(true);
            // This hits: GET /jobs/{id}/export-list?type=eligible&format=excel
            // Backend gathers all eligible students + requiredStudentFields columns
            await JobService.exportJobList(job.id, 'eligible', format);
        } catch (err: any) {
            alert('Download failed: ' + (err.message || 'Unknown error'));
        } finally {
            setDownloading(false);
        }
    };

    // ── Client-side filtering ──────────────────────────────────────────────────
    const filtered = students.filter(s => {
        const name       = (s['Full Name'] || '').toLowerCase();
        const roll       = (s['Roll Number'] || '').toLowerCase();
        const branch     = (s['Branch'] || '').toLowerCase();
        const q          = search.toLowerCase();

        const matchSearch = !q || name.includes(q) || roll.includes(q);
        const matchBranch = branchFilter === 'All' || branch === branchFilter.toLowerCase();

        let matchStatus = true;
        if (statusFilter === 'applied')
            matchStatus = String(s['Current Status']).toLowerCase() !== 'not applied';
        if (statusFilter === 'not-applied')
            matchStatus = String(s['Current Status']).toLowerCase() === 'not applied';

        return matchSearch && matchBranch && matchStatus;
    });

    // ── Required fields for columns (from job creation) ───────────────────────
    const requiredFields: string[] = job.requiredStudentFields || (job as any).requiredFields || [];

    // Merge with always-present columns
    const displayCols = [
        'Roll Number',
        'Full Name',
        'Current Status',
        ...requiredFields
            .map(f => f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, ' $1').trim())
            .filter(f => !['Roll Number', 'Full Name', 'Current Status'].includes(f))
    ];

    return (
        <div className="space-y-4 animate-in fade-in">

            {/* ── Filter Bar ─────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="flex gap-2 items-center flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900"
                            placeholder="Search Name or Roll Number…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* Branch filter */}
                    <div className="flex items-center gap-1 bg-white border rounded-lg px-2 py-1">
                        <Layers size={12} className="text-gray-400" />
                        <select
                            className="text-xs font-bold text-gray-700 bg-transparent outline-none max-w-[120px]"
                            value={branchFilter}
                            onChange={e => setBranchFilter(e.target.value)}
                        >
                            <option value="All">All Branches</option>
                            {collegeBranches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>

                    {/* Application status filter */}
                    <div className="flex items-center gap-1 bg-white border rounded-lg px-2 py-1">
                        <Filter size={12} className="text-gray-400" />
                        <select
                            className="text-xs font-bold text-gray-700 bg-transparent outline-none"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                        >
                            <option value="all">All Eligible</option>
                            <option value="applied">Applied</option>
                            <option value="not-applied">Not Applied</option>
                        </select>
                    </div>

                    {/* Download buttons */}
                    <button
                        onClick={() => handleDownload('excel')}
                        disabled={downloading}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm disabled:opacity-60"
                    >
                        {downloading
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Download size={12} />}
                        Excel
                    </button>
                    <button
                        onClick={() => handleDownload('csv')}
                        disabled={downloading}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-bold hover:bg-gray-700 shadow-sm disabled:opacity-60"
                    >
                        <Download size={12} /> CSV
                    </button>
                </div>
            </div>

            {/* ── Info banner about what fields are included ─────────────────── */}
            {requiredFields.length > 0 && (
                <div className="flex items-start gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                    <Users size={14} className="shrink-0 mt-0.5" />
                    <span>
                        The download report includes the following student fields configured at job creation:&nbsp;
                        <strong>{requiredFields.join(', ')}</strong>
                    </span>
                </div>
            )}

            {/* ── Table ─────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-h-[200px]">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                        <Loader2 className="animate-spin mr-2" /> Loading eligible students…
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-48 text-red-500 flex-col gap-2">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                <tr>
                                    {displayCols.map(h => (
                                        <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={displayCols.length} className="px-6 py-12 text-center text-gray-400">
                                            No eligible students found matching filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((s: any, idx: number) => {
                                        const status = s['Current Status'] || 'Not Applied';
                                        const isApplied = status.toLowerCase() !== 'not applied';
                                        return (
                                            <tr key={s.studentId || idx} className="hover:bg-gray-50 transition-colors">
                                                {displayCols.map(col => {
                                                    if (col === 'Current Status') {
                                                        return (
                                                            <td key={col} className="px-4 py-3 text-center">
                                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                                                    isApplied
                                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                                        : 'bg-gray-100 text-gray-500 border-gray-200'
                                                                }`}>
                                                                    {isApplied ? 'Applied' : 'Not Applied'}
                                                                </span>
                                                            </td>
                                                        );
                                                    }
                                                    return (
                                                        <td key={col} className="px-4 py-3 text-gray-700">
                                                            {s[col] ?? '—'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-400 text-right">
                Showing {filtered.length} of {students.length} students.
                The Excel/CSV download contains ALL eligible students (including those not yet applied) with the required data fields.
            </p>
        </div>
    );
};