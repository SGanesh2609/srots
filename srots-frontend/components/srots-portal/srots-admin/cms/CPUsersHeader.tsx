import React, { useRef } from 'react';
import { FileText, UploadCloud, UserPlus, Search, Users, UserCheck } from 'lucide-react';

/**
 * Component: CPUsersHeader
 * Path: components/colleges/cms/CPUsersHeader.tsx
 *
 * Changes:
 *  - Two separate bulk-upload buttons: one for CPH, one for STAFF
 *  - Each passes { file, role } back to parent so the correct endpoint is called
 */

interface CPUsersHeaderProps {
  searchQuery:        string;
  onSearchChange:     (q: string) => void;
  onAddUser:          () => void;
  /** Called with the chosen file AND the role it targets */
  onBulkUpload:       (file: File, role: 'CPH' | 'STAFF') => void;
  onDownloadTemplate: () => void;
}

export const CPUsersHeader: React.FC<CPUsersHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onAddUser,
  onBulkUpload,
  onDownloadTemplate,
}) => {
  const cphFileRef   = useRef<HTMLInputElement>(null);
  const staffFileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, role: 'CPH' | 'STAFF') => {
    const file = e.target.files?.[0];
    if (file) {
      onBulkUpload(file, role);
      e.currentTarget.value = ''; // allow re-upload of same file
    }
  };

  return (
    <div className="space-y-4">

      {/* Title + actions row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">CP Admins &amp; Staff</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage placement heads (CPH) and staff members for this college.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">

          {/* Template download */}
          <button
            onClick={onDownloadTemplate}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-50 font-semibold flex items-center gap-1.5 text-xs whitespace-nowrap"
            title="Download Staff Excel Template"
          >
            <FileText size={14} /> Template
          </button>

          {/* ── Bulk Upload CPH ────────────────────────────────────────────── */}
          <label
            className="px-3 py-2 border border-purple-200 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold flex items-center gap-1.5 cursor-pointer text-xs whitespace-nowrap"
            title="Bulk upload CP Heads (CPH) from Excel/CSV"
          >
            <UserCheck size={14} />
            Bulk CPH
            <input
              type="file"
              ref={cphFileRef}
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={e => handleFile(e, 'CPH')}
              onClick={e => (e.currentTarget.value = '')}
            />
          </label>

          {/* ── Bulk Upload Staff ──────────────────────────────────────────── */}
          <label
            className="px-3 py-2 border border-blue-200 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold flex items-center gap-1.5 cursor-pointer text-xs whitespace-nowrap"
            title="Bulk upload Placement Staff from Excel/CSV"
          >
            <UploadCloud size={14} />
            Bulk Staff
            <input
              type="file"
              ref={staffFileRef}
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={e => handleFile(e, 'STAFF')}
              onClick={e => (e.currentTarget.value = '')}
            />
          </label>

          {/* Add single user */}
          <button
            onClick={onAddUser}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-1.5 text-xs whitespace-nowrap"
          >
            <UserPlus size={14} /> Add CP User
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
        <input
          type="text"
          placeholder="Search by name, email or username..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900 placeholder-gray-400 text-sm shadow-sm"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};