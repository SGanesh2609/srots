import React, { useState, useEffect } from 'react';
import { Job } from '../../../../../types';
import { JobService } from '../../../../../services/jobService';
import { useToast } from '../../../../common/Toast';
import { Search, Layers, Filter, Download, Loader2, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { Pagination } from '../../../../common/Pagination';

interface EligibleStudent {
    studentId?: string;
    [key: string]: string | number | undefined;
}

interface EligibleStudentsResponse {
    headers: string[];
    students: EligibleStudent[];
    totalEligible: number;
}

const PAGE_SIZE = 20;

/**
 * JobEligibleTab – COMPLETE VERSION
 * 
 * Shows all eligible students with dynamic columns from backend:
 * - Roll Number
 * - Full Name
 * - Applied Status (Applied / Not Applied)
 * - All fields from job.requiredStudentFields (Branch, CGPA, Phone, etc.)
 * 
 * Features:
 * - Two download buttons (Excel + CSV)
 * - Client-side filtering (search, branch, applied status)
 * - Synced with backend getEligibleStudentsForDisplay()
 * 
 * Backend endpoint: GET /jobs/{id}/eligible-students
 * Returns: { headers, students, totalEligible }
 */

interface JobEligibleTabProps {
    job: Job;
    collegeBranches: string[];
}

export const JobEligibleTab: React.FC<JobEligibleTabProps> = ({ job, collegeBranches }) => {
    const toast = useToast();
    // Data from backend
    const [eligibleData, setEligibleData] = useState<EligibleStudentsResponse | null>(null);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState<string | null>(null);
    const [downloading,  setDownloading]  = useState<'excel' | 'csv' | null>(null);

    // Client-side filters
    const [search,       setSearch]       = useState('');
    const [branchFilter, setBranchFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState<'all' | 'applied' | 'not-applied'>('all');
    const [page,         setPage]         = useState(0);

    useEffect(() => {
        loadEligibleStudents();
    }, [job.id]);

    useEffect(() => { setPage(0); }, [search, branchFilter, statusFilter]);

    const loadEligibleStudents = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Backend endpoint: GET /jobs/{id}/eligible-students
            // Returns: { headers, students, totalEligible }
            const data = await JobService.getEligibleStudentsForDisplay(job.id);
            setEligibleData(data);
        } catch (err: any) {
            console.error('[JobEligibleTab] Load error:', err);
            setError('Failed to load eligible students. ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (format: 'excel' | 'csv') => {
        try {
            setDownloading(format);
            // Backend endpoint: GET /jobs/{id}/export-list?type=eligible&format=excel/csv
            await JobService.exportJobList(job.id, 'eligible', format);
        } catch (err: any) {
            toast.error('Download failed: ' + (err.message || 'Unknown error'));
        } finally {
            setDownloading(null);
        }
    };

    // ── Client-side filtering ──────────────────────────────────────────────────
    const students: EligibleStudent[] = eligibleData?.students || [];
    const headers:  string[]           = eligibleData?.headers  || [];

    const filtered = students.filter(s => {
        const name   = String(s['Full Name']   ?? '').toLowerCase();
        const roll   = String(s['Roll Number'] ?? '').toLowerCase();
        const branch = String(s['Branch']      ?? '').toLowerCase();
        const q      = search.toLowerCase();

        const matchSearch = !q || name.includes(q) || roll.includes(q);
        const matchBranch = branchFilter === 'All' || branch === branchFilter.toLowerCase();

        let matchStatus = true;
        const appliedStatus = String(s['Applied Status'] ?? '').toLowerCase();
        if (statusFilter === 'applied')     matchStatus = appliedStatus === 'applied';
        if (statusFilter === 'not-applied') matchStatus = appliedStatus === 'not applied';

        return matchSearch && matchBranch && matchStatus;
    });

    const totalPages   = Math.ceil(filtered.length / PAGE_SIZE);
    const pageFiltered = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    // ── Required fields info ──────────────────────────────────────────────────
    const requiredFields: string[] = job.requiredStudentFields || [];

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
                    <button
                        onClick={loadEligibleStudents}
                        className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600 px-2 py-1.5"
                        title="Refresh data"
                    >
                        <RefreshCw size={12} />
                    </button>
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

                    {/* Status filter */}
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

                    {/* Excel download button */}
                    <button
                        onClick={() => handleDownload('excel')}
                        disabled={downloading !== null}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm disabled:opacity-60 transition-all"
                    >
                        {downloading === 'excel' ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            <Download size={12} />
                        )}
                        Excel
                    </button>

                    {/* CSV download button */}
                    <button
                        onClick={() => handleDownload('csv')}
                        disabled={downloading !== null}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-bold hover:bg-gray-700 shadow-sm disabled:opacity-60 transition-all"
                    >
                        {downloading === 'csv' ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            <Download size={12} />
                        )}
                        CSV
                    </button>
                </div>
            </div>

            {/* ── Info banner about required fields ─────────────────────────── */}
            {requiredFields.length > 0 && (
                <div className="flex items-start gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                    <Users size={14} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold mb-1">Required Student Fields (configured at job creation):</p>
                        <p className="text-indigo-600">
                            {requiredFields.join(', ')}
                        </p>
                        <p className="text-indigo-500 mt-1">
                            The download report includes Roll Number, Full Name, Applied Status, and all these required fields.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Loading / Error / Data Table ──────────────────────────────── */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-h-[300px]">
                {loading ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                <tr>
                                    {['Roll Number', 'Full Name', 'Branch', 'CGPA', 'Applied Status'].map(h => (
                                        <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 5 }).map((__, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-3 bg-gray-200 rounded w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-64 text-red-500 flex-col gap-3">
                        <AlertCircle size={32} />
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={loadEligibleStudents}
                            className="text-xs text-blue-600 underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                    <tr>
                                        {headers.map(h => (
                                            <th key={h} className="px-4 py-3 whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pageFiltered.length === 0 ? (
                                        <tr>
                                            <td colSpan={headers.length} className="px-6 py-12 text-center text-gray-400">
                                                No eligible students found matching filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        pageFiltered.map((s: EligibleStudent, idx: number) => {
                                            const appliedStatus = String(s['Applied Status'] ?? 'Not Applied');
                                            const isApplied = appliedStatus.toLowerCase() === 'applied';

                                            return (
                                                <tr key={s.studentId || idx} className="hover:bg-gray-50 transition-colors">
                                                    {headers.map(col => {
                                                        if (col === 'Applied Status') {
                                                            return (
                                                                <td key={col} className="px-4 py-3 text-center">
                                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                                                        isApplied
                                                                            ? 'bg-green-100 text-green-700 border-green-200'
                                                                            : 'bg-gray-100 text-gray-500 border-gray-200'
                                                                    }`}>
                                                                        {appliedStatus}
                                                                    </span>
                                                                </td>
                                                            );
                                                        }
                                                        return (
                                                            <td key={col} className="px-4 py-3 text-gray-700">
                                                                {String(s[col] ?? '—')}
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

                        {/* Mobile cards */}
                        <div className="md:hidden p-4 space-y-3">
                            {pageFiltered.length === 0 ? (
                                <div className="py-12 text-center text-gray-400">
                                    No eligible students found matching filters.
                                </div>
                            ) : (
                                pageFiltered.map((s: EligibleStudent, idx: number) => {
                                    const appliedStatus = String(s['Applied Status'] ?? 'Not Applied');
                                    const isApplied = appliedStatus.toLowerCase() === 'applied';

                                    return (
                                        <div key={String(s.studentId ?? idx)} className="bg-gray-50 p-4 rounded-xl border">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900">
                                                        {String(s['Full Name'] ?? '—')}
                                                    </h4>
                                                    <p className="text-xs font-mono text-gray-500 mt-0.5">
                                                        {String(s['Roll Number'] ?? '—')}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                    isApplied
                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                        : 'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}>
                                                    {appliedStatus}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-2 space-y-1">
                                                {headers
                                                    .filter(h => !['Full Name', 'Roll Number', 'Applied Status'].includes(h))
                                                    .map(h => (
                                                        <div key={h} className="flex justify-between">
                                                            <span className="font-medium text-gray-500">{h}:</span>
                                                            <span>{String(s[h] ?? '—')}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                itemLabel="eligible students"
            />
        </div>
    );
};