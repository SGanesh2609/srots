import React, { useState, useRef, useEffect } from 'react';
import { College } from '../../../../types';
import { Plus, Search, Download, Edit2, Trash2, Building, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react';
import { CollegeService } from '../../../../services/collegeService';
import { CollegeLogo } from '../../../common/CollegeLogo';
import TablePagination from '@mui/material/TablePagination';

interface CollegeListProps {
    colleges: College[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSelect: (id: string) => void;
    onEdit: (college: College) => void;
    onDelete: (id: string, permanent: boolean) => void;
    onAdd: () => void;
    onToggleActive: (id: string, active: boolean) => void;
    includeInactive: boolean;
    onToggleInactive: (val: boolean) => void;
    page: number;
    rowsPerPage: number;
    total: number;
    onChangePage: (event: unknown, newPage: number) => void;
    onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// ── Delete Dropdown ────────────────────────────────────────────────────────────
const DeleteDropdown: React.FC<{
    onSoftDelete: () => void;
    onHardDelete: () => void;
}> = ({ onSoftDelete, onHardDelete }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 bg-white rounded-full shadow-sm border border-gray-100 transition-all hover:scale-105 flex items-center gap-0.5"
                title="Delete College"
            >
                <Trash2 size={16} />
                <ChevronDown size={10} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <button
                        onClick={e => { e.stopPropagation(); setOpen(false); onSoftDelete(); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2 font-medium"
                    >
                        <Trash2 size={14} className="text-amber-500" />
                        Soft Delete
                    </button>
                    <div className="h-px bg-gray-100 mx-2" />
                    <button
                        onClick={e => { e.stopPropagation(); setOpen(false); onHardDelete(); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                        <Trash2 size={14} className="text-red-500" />
                        Hard Delete
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const CollegeList: React.FC<CollegeListProps> = ({
    colleges, searchQuery, onSearchChange, onSelect, onEdit, onDelete, onAdd, onToggleActive,
    includeInactive, onToggleInactive,
    page, rowsPerPage, total, onChangePage, onChangeRowsPerPage,
}) => {
    const handleDownloadList = (type: 'students' | 'cp_admin') => {
        try { CollegeService.exportMasterList(type); }
        catch (e: any) { alert(e.message); }
    };

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* Compact header row */}
            <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-gray-700 shrink-0">CMS — Colleges</h2>
                <div className="relative flex-1 min-w-[160px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                    <input
                        type="text"
                        placeholder="Search by name or code…"
                        className="w-full pl-7 pr-3 py-1.5 border rounded-lg text-xs focus:ring-1 focus:ring-blue-200 outline-none bg-gray-50 text-gray-900 border-gray-200 placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                    />
                </div>
                <label className="flex items-center gap-1 text-xs text-gray-600 font-medium shrink-0 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={includeInactive}
                        onChange={e => onToggleInactive(e.target.checked)}
                        className="h-3 w-3 text-blue-600 border-gray-300 rounded"
                    />
                    Inactive
                </label>
                <button onClick={() => handleDownloadList('students')} className="flex items-center gap-1 px-2.5 py-1.5 bg-white border rounded-lg hover:bg-gray-50 text-gray-600 text-xs font-bold shrink-0 transition-colors">
                    <Download size={11} /> Students
                </button>
                <button onClick={() => handleDownloadList('cp_admin')} className="flex items-center gap-1 px-2.5 py-1.5 bg-white border rounded-lg hover:bg-gray-50 text-gray-600 text-xs font-bold shrink-0 transition-colors">
                    <Download size={11} /> CP Admins
                </button>
                <button onClick={onAdd} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-bold shrink-0 transition-colors">
                    <Plus size={12} /> Onboard
                </button>
            </div>

            {/* College Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {colleges.map(college => (
                    <div
                        key={college.id}
                        onClick={() => onSelect(college.id)}
                        className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 group relative"
                    >
                        {/* Hover action buttons */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 z-10 transition-opacity">
                            <button
                                onClick={e => { e.stopPropagation(); onEdit(college); }}
                                className="p-2 text-blue-600 hover:bg-blue-50 bg-white rounded-full shadow-sm border border-gray-100 transition-all hover:scale-105"
                                title="Edit College"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); onToggleActive(college.id, !college.active); }}
                                className={`p-2 ${college.active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'} bg-white rounded-full shadow-sm border border-gray-100 transition-all hover:scale-105`}
                                title={college.active ? 'Deactivate' : 'Activate'}
                            >
                                {college.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            </button>
                            <DeleteDropdown
                                onSoftDelete={() => onDelete(college.id, false)}
                                onHardDelete={() => onDelete(college.id, true)}
                            />
                        </div>

                        {/* Logo + Name */}
                        <div className="flex items-center gap-3 mb-3">
                            <CollegeLogo src={college.logoUrl} name={college.name} size="md" />
                            <div className="min-w-0">
                                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors pr-16" title={college.name}>
                                    {college.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">{college.code}</span>
                                    {college.type && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border">{college.type}</span>}
                                    {!college.active && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Inactive</span>}
                                </div>
                            </div>
                        </div>

                        {/* Address + Stats */}
                        <div className="space-y-1.5 text-xs text-gray-600">
                            <p className="flex items-center gap-1.5 line-clamp-1">
                                <Building size={13} className="shrink-0 text-gray-400" />
                                {college.address || 'No address on file'}
                            </p>
                            <div className="flex justify-between mt-3 pt-3 border-t">
                                <div className="text-center">
                                    <span className="block font-bold text-sm text-gray-900">{college.studentCount ?? 0}</span>
                                    <span className="text-[10px] text-gray-500">Students</span>
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-sm text-gray-900">{college.cphCount ?? 0}</span>
                                    <span className="text-[10px] text-gray-500">CP Admins</span>
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-sm text-green-600">{college.activeJobs ?? 0}</span>
                                    <span className="text-[10px] text-gray-500">Active Jobs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {colleges.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                        <Building size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No colleges found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {total > 0 && (
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={onChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={onChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50]}
                />
            )}
        </div>
    );
};