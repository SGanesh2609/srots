import React from 'react';
import { FileText, UploadCloud, UserPlus, Search, Shield, Users } from 'lucide-react';

/**
 * Component: TeamHeader
 * Path: components/colleges/cp-portal/admin/team/TeamHeader.tsx
 *
 * Toolbar for ManageTeam.
 * Bulk upload split into two separate buttons:
 *   Bulk CPH   (violet) uses bulkCphRef
 *   Bulk Staff (blue)   uses bulkStaffRef
 */

interface TeamHeaderProps {
    searchQuery:        string;
    onSearchChange:     (q: string) => void;
    onDownloadTemplate: () => void;
    onBulkUploadCph:    (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBulkUploadStaff:  (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddMember:        () => void;
    bulkCphRef:         React.RefObject<HTMLInputElement>;
    bulkStaffRef:       React.RefObject<HTMLInputElement>;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({
    searchQuery, onSearchChange,
    onDownloadTemplate,
    onBulkUploadCph, onBulkUploadStaff,
    onAddMember,
    bulkCphRef, bulkStaffRef,
}) => {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">Placement Team</h2>
                <p className="text-gray-500 text-sm mt-1">Manage CP Heads and placement staff for your college.</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end items-center">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type="text" value={searchQuery} onChange={e => onSearchChange(e.target.value)}
                        placeholder="Search members..."
                        className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none w-48" />
                </div>
                <button type="button" onClick={onDownloadTemplate}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 bg-white hover:bg-gray-50 font-semibold flex items-center gap-1.5 text-xs whitespace-nowrap">
                    <FileText size={14} /> Template
                </button>
                <label title="Bulk upload CP Head accounts"
                    className="px-3 py-2 border border-violet-200 rounded-lg text-violet-700 bg-violet-50 hover:bg-violet-100 font-semibold flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer transition-colors">
                    <Shield size={14} /> Bulk CPH <UploadCloud size={13} className="opacity-60" />
                    <input type="file" ref={bulkCphRef} className="hidden" accept=".xlsx,.xls,.csv"
                        onChange={onBulkUploadCph} onClick={e => (e.currentTarget.value = "")} />
                </label>
                <label title="Bulk upload Placement Staff accounts"
                    className="px-3 py-2 border border-blue-200 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer transition-colors">
                    <Users size={14} /> Bulk Staff <UploadCloud size={13} className="opacity-60" />
                    <input type="file" ref={bulkStaffRef} className="hidden" accept=".xlsx,.xls,.csv"
                        onChange={onBulkUploadStaff} onClick={e => (e.currentTarget.value = "")} />
                </label>
                <button type="button" onClick={onAddMember}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-1.5 text-sm whitespace-nowrap">
                    <UserPlus size={15} /> Add Member
                </button>
            </div>
        </div>
    );
};