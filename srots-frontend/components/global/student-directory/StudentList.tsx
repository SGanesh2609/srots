
// import React from 'react';
// import { Student, Branch } from '../../../types';
// import { StudentFilters } from './StudentFilters';
// import { StudentTable } from './StudentTable';

// interface StudentListProps {
//     students: Student[];
//     searchQuery: string;
//     setSearchQuery: (query: string) => void;
//     yearFilter: string;
//     setYearFilter: (year: string) => void;
//     branchFilter: string;
//     setBranchFilter: (branch: string) => void;
//     collegeBranches: Branch[];
//     canManage: boolean;
//     isSrotsAdmin: boolean;
//     onEdit: (e: React.MouseEvent, student: Student) => void;
//     onDelete: (e: React.MouseEvent, id: string) => void;
//     onToggleRestriction: (e: React.MouseEvent, id: string) => void;
//     onDownloadReport: () => void;
//     onAdd: () => void;
//     onBulkUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; // Maintained for signature compatibility, though logic moved
//     onDownloadSample: () => void;
//     collegeId?: string; // Added prop
//     onRefresh?: () => void; // Added prop
// }

// export const StudentList: React.FC<StudentListProps> = ({
//     students, searchQuery, setSearchQuery, yearFilter, setYearFilter, branchFilter, setBranchFilter,
//     collegeBranches, canManage, isSrotsAdmin, onEdit, onDelete, onToggleRestriction,
//     onDownloadReport, onAdd, onDownloadSample, collegeId, onRefresh
// }) => {
//     return (
//         <>
//             <StudentFilters 
//                 searchQuery={searchQuery}
//                 setSearchQuery={setSearchQuery}
//                 yearFilter={yearFilter}
//                 setYearFilter={setYearFilter}
//                 branchFilter={branchFilter}
//                 setBranchFilter={setBranchFilter}
//                 collegeBranches={collegeBranches}
//                 canManage={canManage}
//                 onDownloadReport={onDownloadReport}
//                 onAdd={onAdd}
//                 onDownloadSample={onDownloadSample}
//                 collegeId={collegeId || ''}
//                 onRefresh={onRefresh || (() => {})}
//             />

//             <StudentTable 
//                 students={students}
//                 canManage={canManage}
//                 isSrotsAdmin={isSrotsAdmin}
//                 onEdit={onEdit}
//                 onDelete={onDelete}
//                 onToggleRestriction={onToggleRestriction}
//             />
//         </>
//     );
// };


// import React from 'react';
// import { Student, Branch } from '../../../types';
// import { StudentFilters } from './StudentFilters';
// import { StudentTable } from './StudentTable';
// import { PaginationState } from '../StudentDirectory';
// import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

// interface StudentListProps {
//   students: Student[];
//   isLoading?: boolean;
//   searchQuery: string;
//   setSearchQuery: (query: string) => void;
//   yearFilter: string;
//   setYearFilter: (year: string) => void;
//   branchFilter: string;
//   setBranchFilter: (branch: string) => void;
//   collegeBranches: Branch[];
//   canManage: boolean;
//   isSrotsAdmin: boolean;
//   onEdit: (e: React.MouseEvent, student: Student) => void;
//   onDelete: (e: React.MouseEvent, id: string) => void;
//   onToggleRestriction: (e: React.MouseEvent, id: string) => void;
//   onDownloadReport: () => void;
//   onAdd: () => void;
//   onBulkUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onDownloadSample: () => void;
//   collegeId?: string;
//   onRefresh?: () => void;
//   reportFormat: 'excel' | 'csv';
//   setReportFormat: (f: 'excel' | 'csv') => void;
//   pagination: PaginationState;
//   onPageChange: (page: number) => void;
//   onPageSizeChange: (size: number) => void;
// }

// export const StudentList: React.FC<StudentListProps> = ({
//   students, isLoading, searchQuery, setSearchQuery, yearFilter, setYearFilter, branchFilter, setBranchFilter,
//   collegeBranches, canManage, isSrotsAdmin, onEdit, onDelete, onToggleRestriction,
//   onDownloadReport, onAdd, onDownloadSample, collegeId, onRefresh,
//   reportFormat, setReportFormat, pagination, onPageChange, onPageSizeChange
// }) => {
//   const { page, size, total, totalPages } = pagination;
//   const startRecord = total === 0 ? 0 : page * size + 1;
//   const endRecord = Math.min((page + 1) * size, total);

//   return (
//     <div className="space-y-4">
//       <StudentFilters
//         searchQuery={searchQuery}
//         setSearchQuery={setSearchQuery}
//         yearFilter={yearFilter}
//         setYearFilter={setYearFilter}
//         branchFilter={branchFilter}
//         setBranchFilter={setBranchFilter}
//         collegeBranches={collegeBranches}
//         canManage={canManage}
//         onDownloadReport={onDownloadReport}
//         onAdd={onAdd}
//         onDownloadSample={onDownloadSample}
//         collegeId={collegeId || ''}
//         onRefresh={onRefresh || (() => {})}
//         reportFormat={reportFormat}
//         setReportFormat={setReportFormat}
//       />

//       <StudentTable
//         students={students}
//         isLoading={isLoading}
//         canManage={canManage}
//         isSrotsAdmin={isSrotsAdmin}
//         onEdit={onEdit}
//         onDelete={onDelete}
//         onToggleRestriction={onToggleRestriction}
//       />

//       {/* Pagination Controls */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-2">
//         <div className="flex items-center gap-3 text-sm text-gray-500">
//           <span>
//             {total === 0 ? 'No records' : `Showing ${startRecord}–${endRecord} of ${total} students`}
//           </span>
//           <div className="flex items-center gap-2">
//             <label className="text-xs font-medium text-gray-500">Per page:</label>
//             <select
//               value={size}
//               onChange={e => onPageSizeChange(Number(e.target.value))}
//               className="border rounded-lg px-2 py-1 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
//             >
//               {[10, 20, 50, 100].map(n => (
//                 <option key={n} value={n}>{n}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="flex items-center gap-1">
//           <PaginationButton
//             onClick={() => onPageChange(0)}
//             disabled={page === 0}
//             title="First page"
//           >
//             <ChevronsLeft size={16} />
//           </PaginationButton>
//           <PaginationButton
//             onClick={() => onPageChange(page - 1)}
//             disabled={page === 0}
//             title="Previous page"
//           >
//             <ChevronLeft size={16} />
//           </PaginationButton>

//           {/* Page number pills */}
//           {getPageNumbers(page, totalPages).map((p, i) =>
//             p === '...' ? (
//               <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
//             ) : (
//               <button
//                 key={p}
//                 onClick={() => onPageChange(Number(p))}
//                 className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
//                   Number(p) === page
//                     ? 'bg-indigo-600 text-white shadow-md'
//                     : 'text-gray-600 hover:bg-gray-100'
//                 }`}
//               >
//                 {Number(p) + 1}
//               </button>
//             )
//           )}

//           <PaginationButton
//             onClick={() => onPageChange(page + 1)}
//             disabled={page >= totalPages - 1}
//             title="Next page"
//           >
//             <ChevronRight size={16} />
//           </PaginationButton>
//           <PaginationButton
//             onClick={() => onPageChange(totalPages - 1)}
//             disabled={page >= totalPages - 1}
//             title="Last page"
//           >
//             <ChevronsRight size={16} />
//           </PaginationButton>
//         </div>
//       </div>
//     </div>
//   );
// };

// const PaginationButton: React.FC<{
//   onClick: () => void;
//   disabled: boolean;
//   title: string;
//   children: React.ReactNode;
// }> = ({ onClick, disabled, title, children }) => (
//   <button
//     onClick={onClick}
//     disabled={disabled}
//     title={title}
//     className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
//   >
//     {children}
//   </button>
// );

// function getPageNumbers(current: number, total: number): (number | '...')[] {
//   if (total <= 7) return Array.from({ length: total }, (_, i) => i);
//   const pages: (number | '...')[] = [];
//   pages.push(0);
//   if (current > 3) pages.push('...');
//   for (let i = Math.max(1, current - 2); i <= Math.min(total - 2, current + 2); i++) {
//     pages.push(i);
//   }
//   if (current < total - 4) pages.push('...');
//   pages.push(total - 1);
//   return pages;
// }

import React from 'react';
import { Student, Branch } from '../../../types';
import { StudentFilters } from './StudentFilters';
import { StudentTable } from './StudentTable';
import { PaginationState } from '../StudentDirectory';
import { AccountFilter } from '../StudentDirectory';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * StudentList
 * Path: src/components/global/student-directory/StudentList.tsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES IN THIS VERSION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. Added `isCphView` prop — forwarded to StudentFilters (hides tabs + buttons)
 *    and StudentTable (hides Edit/Delete, shows View Details).
 *
 * 2. Added `accountFilter` + `setAccountFilter` props — forwarded to StudentFilters
 *    to render the All/Soft Deleted/Hard Deleted tab pills.
 *
 * 3. Added `onViewDetails` prop — forwarded to StudentTable for CPH "View Details"
 *    button handler.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface StudentListProps {
  students: Student[];
  isLoading?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  branchFilter: string;
  setBranchFilter: (branch: string) => void;
  collegeBranches: Branch[];
  canManage: boolean;
  isSrotsAdmin: boolean;
  isCphView?: boolean;
  accountFilter: AccountFilter;
  setAccountFilter: (f: AccountFilter) => void;
  onEdit: (e: React.MouseEvent, student: Student) => void;
  onViewDetails: (e: React.MouseEvent, student: Student) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onToggleRestriction: (e: React.MouseEvent, id: string) => void;
  onDownloadReport: () => void;
  onAdd: () => void;
  onBulkUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadSample: () => void;
  collegeId?: string;
  onRefresh?: () => void;
  reportFormat: 'excel' | 'csv';
  setReportFormat: (f: 'excel' | 'csv') => void;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students, isLoading, searchQuery, setSearchQuery, yearFilter, setYearFilter, branchFilter, setBranchFilter,
  collegeBranches, canManage, isSrotsAdmin, isCphView = false,
  accountFilter, setAccountFilter,
  onEdit, onViewDetails, onDelete, onToggleRestriction,
  onDownloadReport, onAdd, onDownloadSample, collegeId, onRefresh,
  reportFormat, setReportFormat, pagination, onPageChange, onPageSizeChange,
}) => {
  const { page, size, total, totalPages } = pagination;
  const startRecord = total === 0 ? 0 : page * size + 1;
  const endRecord = Math.min((page + 1) * size, total);

  return (
    <div className="space-y-4">
      <StudentFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
        collegeBranches={collegeBranches}
        canManage={canManage}
        isCphView={isCphView}
        accountFilter={accountFilter}
        setAccountFilter={setAccountFilter}
        onDownloadReport={onDownloadReport}
        onAdd={onAdd}
        onDownloadSample={onDownloadSample}
        collegeId={collegeId || ''}
        onRefresh={onRefresh || (() => {})}
        reportFormat={reportFormat}
        setReportFormat={setReportFormat}
      />

      <StudentTable
        students={students}
        isLoading={isLoading}
        canManage={canManage}
        isSrotsAdmin={isSrotsAdmin}
        isCphView={isCphView}
        onEdit={onEdit}
        onViewDetails={onViewDetails}
        onDelete={onDelete}
        onToggleRestriction={onToggleRestriction}
      />

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-2">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>
            {total === 0 ? 'No records' : `Showing ${startRecord}–${endRecord} of ${total} students`}
          </span>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Per page:</label>
            <select
              value={size}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className="border rounded-lg px-2 py-1 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {[10, 20, 50, 100].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <PaginationButton onClick={() => onPageChange(0)} disabled={page === 0} title="First page">
            <ChevronsLeft size={16} />
          </PaginationButton>
          <PaginationButton onClick={() => onPageChange(page - 1)} disabled={page === 0} title="Previous page">
            <ChevronLeft size={16} />
          </PaginationButton>

          {getPageNumbers(page, totalPages).map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(Number(p))}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                  Number(p) === page
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {Number(p) + 1}
              </button>
            )
          )}

          <PaginationButton onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} title="Next page">
            <ChevronRight size={16} />
          </PaginationButton>
          <PaginationButton onClick={() => onPageChange(totalPages - 1)} disabled={page >= totalPages - 1} title="Last page">
            <ChevronsRight size={16} />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
};

const PaginationButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, disabled, title, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
  >
    {children}
  </button>
);

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | '...')[] = [];
  pages.push(0);
  if (current > 3) pages.push('...');
  for (let i = Math.max(1, current - 2); i <= Math.min(total - 2, current + 2); i++) {
    pages.push(i);
  }
  if (current < total - 4) pages.push('...');
  pages.push(total - 1);
  return pages;
}