import React, { useRef } from 'react';
import { FileText, UploadCloud, UserPlus, Search, Shield, Users, Download, Loader } from 'lucide-react';

/**
 * Component: CPTeamHeader
 * Path: components/global/cp-team-management/CPTeamHeader.tsx
 *
 * Unified toolbar for CP team management.
 * Provides: search, bulk upload (CPH/STAFF), template download,
 *           export to CSV (CPH list / STAFF list), and add member.
 */

interface CPTeamHeaderProps {
    title:              string;
    description:        string;
    searchQuery:        string;
    onSearchChange:     (q: string) => void;
    onAddUser:          () => void;
    onBulkUpload:       (file: File, role: 'CPH' | 'STAFF') => void;
    onDownloadTemplate: () => void;
    /** Triggers CSV export for the given role — parent fetches all records & generates file */
    onDownloadList:     (role: 'CPH' | 'STAFF') => void;
    /** Which download is in-progress (null = none) */
    downloading:        'CPH' | 'STAFF' | null;
}

export const CPTeamHeader: React.FC<CPTeamHeaderProps> = ({
    title, description,
    searchQuery, onSearchChange,
    onAddUser, onBulkUpload, onDownloadTemplate,
    onDownloadList, downloading,
}) => {
    const cphFileRef   = useRef<HTMLInputElement>(null);
    const staffFileRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>, role: 'CPH' | 'STAFF') => {
        const file = e.target.files?.[0];
        if (file) {
            onBulkUpload(file, role);
            e.currentTarget.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-gray-700 shrink-0">{title}</h2>

                <div className="flex flex-wrap gap-1.5 items-center flex-1 justify-end">

                    {/* ── Template download ───────────────────────────────── */}
                    <button
                        type="button"
                        onClick={onDownloadTemplate}
                        title="Download Excel upload template"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-50 font-semibold flex items-center gap-1.5 text-xs whitespace-nowrap"
                    >
                        <FileText size={14} /> Template
                    </button>

                    {/* ── Bulk CPH upload ─────────────────────────────────── */}
                    <label
                        title="Bulk upload CP Head accounts"
                        className="px-3 py-2 border border-violet-200 rounded-lg text-violet-700 bg-violet-50 hover:bg-violet-100 font-semibold flex items-center gap-1.5 cursor-pointer text-xs whitespace-nowrap transition-colors"
                    >
                        <Shield size={14} /> Bulk CPH <UploadCloud size={13} className="opacity-60" />
                        <input
                            type="file"
                            ref={cphFileRef}
                            className="hidden"
                            accept=".xlsx,.xls,.csv"
                            onChange={e => handleFile(e, 'CPH')}
                            onClick={e => (e.currentTarget.value = '')}
                        />
                    </label>

                    {/* ── Bulk Staff upload ───────────────────────────────── */}
                    <label
                        title="Bulk upload Placement Staff accounts"
                        className="px-3 py-2 border border-blue-200 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold flex items-center gap-1.5 cursor-pointer text-xs whitespace-nowrap transition-colors"
                    >
                        <Users size={14} /> Bulk Staff <UploadCloud size={13} className="opacity-60" />
                        <input
                            type="file"
                            ref={staffFileRef}
                            className="hidden"
                            accept=".xlsx,.xls,.csv"
                            onChange={e => handleFile(e, 'STAFF')}
                            onClick={e => (e.currentTarget.value = '')}
                        />
                    </label>

                    {/* ── Download CPH list ───────────────────────────────── */}
                    <button
                        type="button"
                        onClick={() => onDownloadList('CPH')}
                        disabled={downloading !== null}
                        title="Download CP Heads list as CSV"
                        className="px-3 py-2 border border-violet-300 rounded-lg text-violet-700 bg-white hover:bg-violet-50 font-semibold flex items-center gap-1.5 text-xs whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {downloading === 'CPH'
                            ? <Loader size={13} className="animate-spin" />
                            : <Download size={13} />
                        }
                        Export CPH
                    </button>

                    {/* ── Download Staff list ─────────────────────────────── */}
                    <button
                        type="button"
                        onClick={() => onDownloadList('STAFF')}
                        disabled={downloading !== null}
                        title="Download Placement Staff list as CSV"
                        className="px-3 py-2 border border-blue-300 rounded-lg text-blue-700 bg-white hover:bg-blue-50 font-semibold flex items-center gap-1.5 text-xs whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {downloading === 'STAFF'
                            ? <Loader size={13} className="animate-spin" />
                            : <Download size={13} />
                        }
                        Export Staff
                    </button>

                    {/* ── Add single user ─────────────────────────────────── */}
                    <button
                        type="button"
                        onClick={onAddUser}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-1.5 text-xs whitespace-nowrap"
                    >
                        <UserPlus size={14} /> Add Member
                    </button>
                </div>
            </div>

            {/* ── Search ──────────────────────────────────────────────────── */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                <input
                    type="text"
                    placeholder="Search by name, email or username..."
                    className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-100 outline-none bg-white text-gray-900 placeholder-gray-400 text-xs"
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                />
            </div>
        </div>
    );
};
