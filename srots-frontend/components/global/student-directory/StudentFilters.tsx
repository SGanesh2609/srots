
// import React from 'react';
// import { Search, FileSpreadsheet, UserPlus, UploadCloud, FileText } from 'lucide-react';
// import { Branch } from '../../../types';
// import { StudentService } from '../../../services/studentService';

// interface StudentFiltersProps {
//     searchQuery: string;
//     setSearchQuery: (query: string) => void;
//     yearFilter: string;
//     setYearFilter: (year: string) => void;
//     branchFilter: string;
//     setBranchFilter: (branch: string) => void;
//     collegeBranches: Branch[];
//     canManage: boolean;
//     onDownloadReport: () => void;
//     onAdd: () => void;
//     onDownloadSample: () => void;
//     collegeId: string; // Needed for upload
//     onRefresh: () => void;
// }

// export const StudentFilters: React.FC<StudentFiltersProps> = ({
//     searchQuery, setSearchQuery, yearFilter, setYearFilter, branchFilter, setBranchFilter,
//     collegeBranches, canManage, onDownloadReport, onAdd, onDownloadSample,
//     collegeId, onRefresh
// }) => {
//     const currentYear = new Date().getFullYear();
//     const filterYears = Array.from({ length: 9 }, (_, i) => currentYear - 4 + i);

//     const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             try {
//                 // UI only calls the service
//                 const result = await StudentService.bulkUploadStudents(e.target.files[0], collegeId);
//                 alert(`Upload Complete!\nCreated: ${result.created}\nUpdated: ${result.updated}`);
                
//                 // CRITICAL FIX: Trigger the refresh callback to update parent state (Dashboard Counters)
//                 if (onRefresh) onRefresh(); 
                
//             } catch (err: any) {
//                 console.error(err);
//                 alert("Error processing file: " + err.message);
//             }
//             e.target.value = ''; // Reset input
//         }
//     };

//     return (
//         <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white p-4 rounded-xl border shadow-sm">
//             <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-1">
//                 <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//                     <input 
//                         placeholder="Search Name/Roll..." 
//                         className="border rounded-lg pl-9 pr-4 py-2 w-full outline-none focus:ring-2 focus:ring-blue-100 bg-white text-gray-900" 
//                         value={searchQuery} 
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                 </div>
//                 <div className="flex gap-2 w-full md:w-auto">
//                     <select className="border rounded-lg px-3 py-2 text-sm flex-1 md:flex-none md:w-32 lg:w-auto bg-white text-gray-900" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
//                         <option value="All">All Years</option>
//                         {filterYears.map(year => (
//                             <option key={year} value={year.toString()}>{year}</option>
//                         ))}
//                     </select>
//                     <select className="border rounded-lg px-3 py-2 text-sm flex-1 md:flex-none md:w-40 lg:w-auto bg-white text-gray-900" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
//                         <option value="All">All Branches</option>{collegeBranches.map(b => <option key={b.code} value={b.code}>{b.code}</option>)}
//                     </select>
//                 </div>
//             </div>
            
//             <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
//                 <button onClick={onDownloadReport} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2 font-bold text-sm hover:bg-green-100 whitespace-nowrap">
//                     <FileSpreadsheet size={16}/> Report
//                 </button>
                
//                 {canManage && (
//                     <>
//                         <button onClick={onAdd} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md text-sm font-bold whitespace-nowrap">
//                             <UserPlus size={18} /> Add
//                         </button>
//                         <label className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-bold cursor-pointer shadow-sm whitespace-nowrap">
//                             <UploadCloud size={16} /> Upload CSV
//                             <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
//                         </label>
//                         <button onClick={onDownloadSample} className="px-3 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 text-gray-600 text-xs font-bold" title="Template">
//                             <FileText size={16}/>
//                         </button>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };


// import React, { useRef } from 'react';
// import { Search, FileSpreadsheet, UserPlus, UploadCloud, FileText, ChevronDown } from 'lucide-react';
// import { Branch } from '../../../types';
// import { StudentService } from '../../../services/studentService';

// interface StudentFiltersProps {
//   searchQuery: string;
//   setSearchQuery: (query: string) => void;
//   yearFilter: string;
//   setYearFilter: (year: string) => void;
//   branchFilter: string;
//   setBranchFilter: (branch: string) => void;
//   collegeBranches: Branch[];
//   canManage: boolean;
//   onDownloadReport: () => void;
//   onAdd: () => void;
//   onDownloadSample: () => void;
//   collegeId: string;
//   onRefresh: () => void;
//   reportFormat: 'excel' | 'csv';
//   setReportFormat: (f: 'excel' | 'csv') => void;
// }

// export const StudentFilters: React.FC<StudentFiltersProps> = ({
//   searchQuery, setSearchQuery, yearFilter, setYearFilter, branchFilter, setBranchFilter,
//   collegeBranches, canManage, onDownloadReport, onAdd, onDownloadSample,
//   collegeId, onRefresh, reportFormat, setReportFormat
// }) => {
//   const currentYear = new Date().getFullYear();
//   const filterYears = Array.from({ length: 9 }, (_, i) => currentYear - 4 + i);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [isUploading, setIsUploading] = React.useState(false);
//   const [uploadResult, setUploadResult] = React.useState<{ created?: number; updated?: number; failed?: number } | null>(null);

//   const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.[0]) return;
//     const file = e.target.files[0];
//     setIsUploading(true);
//     setUploadResult(null);

//     try {
//       const result = await StudentService.bulkUploadStudents(file, collegeId);

//       // The backend returns an Excel/CSV report file (arraybuffer), not JSON counts
//       // Download the report automatically
//       const blob = new Blob([result], {
//         type: reportFormat === 'csv'
//           ? 'text/csv'
//           : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//       });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `Bulk_Upload_Report_${Date.now()}.${reportFormat === 'csv' ? 'csv' : 'xlsx'}`;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       URL.revokeObjectURL(url);

//       onRefresh();
//     } catch (err: any) {
//       console.error('Bulk upload error:', err);
//       alert('Error processing file: ' + (err?.response?.data?.message || err.message));
//     } finally {
//       setIsUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   return (
//     <div className="flex flex-col gap-3">
//       {/* Search + Filter row */}
//       <div className="flex flex-col lg:flex-row gap-3 bg-white p-4 rounded-xl border shadow-sm">
//         <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto flex-1">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//             <input
//               placeholder="Search by name, roll number, email…"
//               className="border rounded-lg pl-9 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-indigo-100 bg-white text-gray-900 text-sm"
//               value={searchQuery}
//               onChange={e => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <div className="flex gap-2 w-full md:w-auto">
//             <select
//               className="border rounded-lg px-3 py-2 text-sm flex-1 md:flex-none md:w-36 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
//               value={yearFilter}
//               onChange={e => setYearFilter(e.target.value)}
//             >
//               <option value="All">All Batches</option>
//               {filterYears.map(year => (
//                 <option key={year} value={year.toString()}>{year}</option>
//               ))}
//             </select>
//             <select
//               className="border rounded-lg px-3 py-2 text-sm flex-1 md:flex-none md:w-40 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
//               value={branchFilter}
//               onChange={e => setBranchFilter(e.target.value)}
//             >
//               <option value="All">All Branches</option>
//               {collegeBranches.map(b => <option key={b.code} value={b.code}>{b.code}</option>)}
//             </select>
//           </div>
//         </div>

//         {/* Action buttons */}
//         <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end items-center">
//           {/* Report button with format selector */}
//           <div className="flex items-stretch border border-green-200 rounded-lg overflow-hidden shadow-sm">
//             <button
//               onClick={onDownloadReport}
//               className="px-4 py-2 bg-green-50 text-green-700 flex items-center gap-2 font-bold text-sm hover:bg-green-100 transition-colors whitespace-nowrap"
//             >
//               <FileSpreadsheet size={16} />
//               Report
//             </button>
//             <div className="w-px bg-green-200" />
//             <div className="relative flex items-center">
//               <select
//                 value={reportFormat}
//                 onChange={e => setReportFormat(e.target.value as 'excel' | 'csv')}
//                 className="appearance-none bg-green-50 text-green-700 font-bold text-sm px-2 py-2 pr-6 focus:outline-none cursor-pointer hover:bg-green-100 transition-colors"
//               >
//                 <option value="excel">Excel</option>
//                 <option value="csv">CSV</option>
//               </select>
//               <ChevronDown size={12} className="absolute right-1 text-green-600 pointer-events-none" />
//             </div>
//           </div>

//           {canManage && (
//             <>
//               <button
//                 onClick={onAdd}
//                 className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md text-sm font-bold whitespace-nowrap transition-colors"
//               >
//                 <UserPlus size={16} /> Add Student
//               </button>

//               <label className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold cursor-pointer shadow-sm whitespace-nowrap transition-colors ${isUploading ? 'opacity-60 cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-50'}`}>
//                 {isUploading ? (
//                   <>
//                     <svg className="animate-spin w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                     </svg>
//                     Uploading…
//                   </>
//                 ) : (
//                   <>
//                     <UploadCloud size={16} /> Bulk Upload
//                   </>
//                 )}
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   className="hidden"
//                   accept=".xlsx,.xls,.csv"
//                   disabled={isUploading}
//                   onChange={handleBulkUpload}
//                 />
//               </label>

//               <button
//                 onClick={onDownloadSample}
//                 className="px-3 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 text-gray-600 text-xs font-bold transition-colors flex items-center gap-1.5"
//                 title="Download template"
//               >
//                 <FileText size={15} />
//                 <span className="hidden sm:inline">Template</span>
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useRef } from 'react';
import { Search, FileSpreadsheet, UserPlus, UploadCloud, FileText, ChevronDown } from 'lucide-react';
import { Branch } from '../../../types';
import { StudentService } from '../../../services/studentService';
import { AccountFilter } from '../StudentDirectory';

/**
 * StudentFilters
 * Path: src/components/global/student-directory/StudentFilters.tsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES IN THIS VERSION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. NEW: `accountFilter` + `setAccountFilter` props — renders three tab pills:
 *      [All Active]  [Soft Deleted]  [Hard Deleted]
 *    These tabs appear for Admin / SrotsDev. They are HIDDEN for CPH (`isCphView`).
 *
 * 2. NEW: `isCphView` prop — when true:
 *    - Hides account status filter tabs
 *    - Hides Add Student, Bulk Upload, Template buttons
 *    - Still shows search bar, batch filter, branch filter, and report download
 *
 * 3. "Hard Deleted" tab is informational only (shows accounts that have been
 *    permanently deleted but whose records are still in a grace-period audit log,
 *    if the backend supports it). If your backend doesn't support listing
 *    hard-deleted records, you can hide this tab with a feature flag.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface StudentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  branchFilter: string;
  setBranchFilter: (branch: string) => void;
  collegeBranches: Branch[];
  canManage: boolean;
  isCphView?: boolean;
  accountFilter: AccountFilter;
  setAccountFilter: (f: AccountFilter) => void;
  onDownloadReport: () => void;
  onAdd: () => void;
  onDownloadSample: () => void;
  collegeId: string;
  onRefresh: () => void;
  reportFormat: 'excel' | 'csv';
  setReportFormat: (f: 'excel' | 'csv') => void;
}

const ACCOUNT_FILTER_TABS: { value: AccountFilter; label: string; color: string; activeColor: string }[] = [
  {
    value: 'active',
    label: 'All Active',
    color: 'text-gray-600 hover:bg-gray-100 border-transparent',
    activeColor: 'bg-indigo-600 text-white border-indigo-600 shadow-sm',
  },
  {
    value: 'soft_deleted',
    label: 'Soft Deleted',
    color: 'text-amber-600 hover:bg-amber-50 border-transparent',
    activeColor: 'bg-amber-500 text-white border-amber-500 shadow-sm',
  },
  {
    value: 'hard_deleted',
    label: 'Hard Deleted',
    color: 'text-red-500 hover:bg-red-50 border-transparent',
    activeColor: 'bg-red-600 text-white border-red-600 shadow-sm',
  },
];

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchQuery, setSearchQuery, yearFilter, setYearFilter, branchFilter, setBranchFilter,
  collegeBranches, canManage, isCphView = false,
  accountFilter, setAccountFilter,
  onDownloadReport, onAdd, onDownloadSample,
  collegeId, onRefresh, reportFormat, setReportFormat,
}) => {
  const currentYear = new Date().getFullYear();
  const filterYears = Array.from({ length: 9 }, (_, i) => currentYear - 4 + i);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const result = await StudentService.bulkUploadStudents(file, collegeId);

      const blob = new Blob([result], {
        type: reportFormat === 'csv'
          ? 'text/csv'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bulk_Upload_Report_${Date.now()}.${reportFormat === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      onRefresh();
    } catch (err: any) {
      console.error('Bulk upload error:', err);
      alert('Error processing file: ' + (err?.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">

      {/* ── Account Status Filter Tabs — hidden for CPH ──────────────────────── */}
      {!isCphView && (
        <div className="flex items-center gap-1.5 bg-white px-4 py-3 rounded-xl border shadow-sm">
          <span className="text-xs font-semibold text-gray-500 mr-1 shrink-0">Show:</span>
          {ACCOUNT_FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setAccountFilter(tab.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all
                ${accountFilter === tab.value ? tab.activeColor : tab.color}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Search + Branch/Batch Filters + Actions ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              placeholder="Search by name, roll number, email..."
              className="border rounded-lg pl-9 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-indigo-100 bg-white text-gray-900 text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="border rounded-lg px-3 py-2 text-sm flex-1 md:flex-none md:w-36 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
            >
              <option value="All">All Batches</option>
              {filterYears.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
            <select
              className="border rounded-lg px-3 py-2 text-sm flex-1 md:flex-none md:w-40 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
            >
              <option value="All">All Branches</option>
              {collegeBranches.map(b => <option key={b.code} value={b.code}>{b.code}</option>)}
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end items-center">

          {/* Report button with format selector — shown for everyone */}
          <div className="flex items-stretch border border-green-200 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={onDownloadReport}
              className="px-4 py-2 bg-green-50 text-green-700 flex items-center gap-2 font-bold text-sm hover:bg-green-100 transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet size={16} />
              Report
            </button>
            <div className="w-px bg-green-200" />
            <div className="relative flex items-center">
              <select
                value={reportFormat}
                onChange={e => setReportFormat(e.target.value as 'excel' | 'csv')}
                className="appearance-none bg-green-50 text-green-700 font-bold text-sm px-2 py-2 pr-6 focus:outline-none cursor-pointer hover:bg-green-100 transition-colors"
              >
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
              <ChevronDown size={12} className="absolute right-1 text-green-600 pointer-events-none" />
            </div>
          </div>

          {/* Manage buttons — hidden for CPH */}
          {canManage && !isCphView && (
            <>
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md text-sm font-bold whitespace-nowrap transition-colors"
              >
                <UserPlus size={16} /> Add Student
              </button>

              <label className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold cursor-pointer shadow-sm whitespace-nowrap transition-colors ${isUploading ? 'opacity-60 cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-50'}`}>
                {isUploading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} /> Bulk Upload
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  disabled={isUploading}
                  onChange={handleBulkUpload}
                />
              </label>

              <button
                onClick={onDownloadSample}
                className="px-3 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 text-gray-600 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Download template"
              >
                <FileText size={15} />
                <span className="hidden sm:inline">Template</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};