// import React from 'react';
// import { Student } from '../../../types';
// import { Edit2, Trash2, ShieldOff, Shield, UserCheck, Eye, Send } from 'lucide-react';

// /**
//  * StudentTable
//  * Path: src/components/global/student-directory/StudentTable.tsx
//  *
//  * ADDED in this version:
//  *   - onResendCredentials prop
//  *   - Send icon button in the Actions column for every non-CPH row
//  *   - Button is ALWAYS VISIBLE (not hover-only) so users can discover it easily
//  *   - Hidden when isCphView=true (CPH should not resend student credentials)
//  *
//  * Button placement: Send (indigo) · Edit · Restrict · Delete
//  * Matches the same order used in TeamList (CPH/STAFF table).
//  */

// interface StudentTableProps {
//   students:            Student[];
//   isLoading?:          boolean;
//   canManage:           boolean;
//   isSrotsAdmin:        boolean;
//   isCphView?:          boolean;
//   onEdit:              (e: React.MouseEvent, student: Student) => void;
//   onViewDetails:       (e: React.MouseEvent, student: Student) => void;
//   onDelete:            (e: React.MouseEvent, id: string) => void;
//   onToggleRestriction: (e: React.MouseEvent, id: string) => void;
//   /** Opens the resend-credentials confirmation modal for this student */
//   onResendCredentials: (e: React.MouseEvent, student: Student) => void;
// }

// // ── Field helpers ─────────────────────────────────────────────────────────────

// const parseRollFromUsername = (username?: string): string => {
//   if (!username) return '';
//   const parts = username.split('_');
//   if (parts.length >= 2) {
//     const last = parts[parts.length - 1];
//     if (last && /[0-9]/.test(last)) return last;
//     if (parts.length === 2) return parts[1];
//   }
//   return '';
// };

// const getRollNumber = (s: Student): string => {
//   const a = s as any;
//   return (
//     a.profile?.rollNumber ||
//     a.rollNumber          ||
//     parseRollFromUsername(a.username || a.id)
//   ) || '—';
// };

// const getBranch = (s: Student): string => {
//   const a = s as any;
//   return a.profile?.branch || a.branch || a.department || '—';
// };

// const getBatch = (s: Student): string => {
//   const a = s as any;
//   const b = a.profile?.batch ?? a.batch;
//   return b ? String(b) : '—';
// };

// const getAvatarUrl = (s: Student): string | undefined => {
//   const a = s as any;
//   const url =
//     a.avatarUrl       ||
//     a.avatar          ||
//     a.user?.avatarUrl ||
//     a.user?.avatar    ||
//     undefined;
//   if (!url) {
//     console.debug('[StudentTable] No avatar found for student:', a.id, '| keys:', Object.keys(a));
//   }
//   return url;
// };

// // ── Avatar ────────────────────────────────────────────────────────────────────

// const StudentAvatar: React.FC<{ student: Student }> = ({ student }) => {
//   const [imgFailed, setImgFailed] = React.useState(false);
//   const avatarSrc = getAvatarUrl(student);
//   const initial   = student.fullName?.charAt(0)?.toUpperCase() ?? '?';

//   const colours = [
//     'bg-indigo-100 text-indigo-700',
//     'bg-violet-100 text-violet-700',
//     'bg-blue-100 text-blue-700',
//     'bg-emerald-100 text-emerald-700',
//     'bg-amber-100 text-amber-700',
//     'bg-rose-100 text-rose-700',
//     'bg-cyan-100 text-cyan-700',
//   ];
//   const colourClass = colours[(initial.charCodeAt(0) || 0) % colours.length];

//   if (avatarSrc && !imgFailed) {
//     return (
//       <img
//         src={avatarSrc}
//         alt={student.fullName ?? 'Student'}
//         className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
//         onError={() => setImgFailed(true)}
//       />
//     );
//   }

//   return (
//     <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm font-bold text-sm ${colourClass}`}>
//       {initial}
//     </div>
//   );
// };

// // ── Skeleton ──────────────────────────────────────────────────────────────────

// const TableSkeleton: React.FC = () => (
//   <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
//     <table className="w-full text-sm">
//       <tbody>
//         {Array.from({ length: 6 }).map((_, i) => (
//           <tr key={i} className="border-b border-gray-100">
//             <td className="py-3 px-4 w-14">
//               <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
//             </td>
//             {Array.from({ length: 7 }).map((_, j) => (
//               <td key={j} className="py-3 px-4">
//                 <div className="h-4 bg-gray-100 rounded animate-pulse" />
//               </td>
//             ))}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

// // ── Action button helper ──────────────────────────────────────────────────────

// const ActionBtn: React.FC<{
//   onClick:   (e: React.MouseEvent) => void;
//   title:     string;
//   className: string;
//   children:  React.ReactNode;
// }> = ({ onClick, title, className, children }) => (
//   <button
//     type="button"
//     aria-label={title}
//     title={title}
//     onClick={onClick}
//     className={`p-1.5 rounded-lg border transition-colors ${className}`}
//   >
//     {children}
//   </button>
// );

// // ── Main component ────────────────────────────────────────────────────────────

// export const StudentTable: React.FC<StudentTableProps> = ({
//   students, isLoading, canManage, isSrotsAdmin, isCphView = false,
//   onEdit, onViewDetails, onDelete, onToggleRestriction, onResendCredentials,
// }) => {
//   if (isLoading) return <TableSkeleton />;

//   if (students.length === 0) {
//     return (
//       <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
//         <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
//           <UserCheck size={28} className="text-gray-300" />
//         </div>
//         <p className="text-lg font-semibold text-gray-500">No students found</p>
//         <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
//       </div>
//     );
//   }

//   const showActionColumn = canManage || isCphView;

//   return (
//     <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="bg-gray-50 border-b border-gray-200">
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Student</th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Roll No</th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Branch</th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Batch</th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Phone</th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
//             {showActionColumn && (
//               <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
//                 {isCphView ? 'Details' : 'Actions'}
//               </th>
//             )}
//           </tr>
//         </thead>

//         <tbody className="divide-y divide-gray-100">
//           {students.map(student => {
//             const rollNumber    = getRollNumber(student);
//             const branch        = getBranch(student);
//             const batch         = getBatch(student);
//             const isSoftDeleted = (student as any).isDeleted === true;

//             return (
//               <tr
//                 key={student.id}
//                 className={`group hover:bg-gray-50/80 transition-colors ${
//                   isSoftDeleted ? 'opacity-60 bg-amber-50/40' : ''
//                 }`}
//               >
//                 {/* Student — Avatar + Name */}
//                 <td className="py-2.5 px-4">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <StudentAvatar student={student} />
//                     <div className="min-w-0">
//                       <p className="font-semibold text-gray-800 truncate leading-tight">
//                         {student.fullName ?? '—'}
//                       </p>
//                       {isSoftDeleted && (
//                         <span className="inline-block mt-0.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold leading-none">
//                           Soft Deleted
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </td>

//                 {/* Roll No */}
//                 <td className="py-2.5 px-4">
//                   <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded whitespace-nowrap">
//                     {rollNumber}
//                   </span>
//                 </td>

//                 {/* Branch */}
//                 <td className="py-2.5 px-4">
//                   <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
//                     branch !== '—' ? 'bg-blue-50 text-blue-700' : 'text-gray-400'
//                   }`}>
//                     {branch}
//                   </span>
//                 </td>

//                 {/* Batch */}
//                 <td className="py-2.5 px-4">
//                   <span className="text-xs text-gray-600 font-medium">{batch}</span>
//                 </td>

//                 {/* Email */}
//                 <td className="py-2.5 px-4">
//                   <span className="text-xs text-gray-600 truncate block max-w-[180px]">
//                     {student.email ?? '—'}
//                   </span>
//                 </td>

//                 {/* Phone */}
//                 <td className="py-2.5 px-4">
//                   <span className="text-xs text-gray-600 whitespace-nowrap">
//                     {student.phone ?? '—'}
//                   </span>
//                 </td>

//                 {/* Status */}
//                 <td className="py-2.5 px-4">
//                   {student.isRestricted ? (
//                     <span className="text-[11px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
//                       Restricted
//                     </span>
//                   ) : (
//                     <span className="text-[11px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
//                       Active
//                     </span>
//                   )}
//                 </td>

//                 {/* Actions */}
//                 {showActionColumn && (
//                   <td className="py-2.5 px-4">
//                     {isCphView ? (
//                       /* CPH view — only "View Details", no resend */
//                       <div className="flex items-center justify-end">
//                         <button
//                           aria-label="View student details"
//                           onClick={e => onViewDetails(e, student)}
//                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold transition-colors border border-indigo-100 whitespace-nowrap"
//                         >
//                           <Eye size={13} /> View Details
//                         </button>
//                       </div>
//                     ) : (
//                       /*
//                        * Admin / manage view — always-visible action buttons.
//                        * Order: Resend · Edit · Restrict (admin only) · Delete
//                        *
//                        * Resend (Send icon, indigo) is ALWAYS VISIBLE — not hover-only.
//                        * Edit, Restrict, Delete fade in on hover (group-hover:opacity-100)
//                        * so the table stays clean while Resend remains discoverable.
//                        */
//                       <div className="flex items-center justify-end gap-1">
//                         {/* ── Resend credentials — always visible ──────────── */}
//                         <ActionBtn
//                           onClick={e => onResendCredentials(e, student)}
//                           title="Resend login credentials"
//                           className="text-indigo-500 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
//                         >
//                           <Send size={14} />
//                         </ActionBtn>

//                         {/* ── Edit — appears on row hover ───────────────────── */}
//                         <button
//                           aria-label="Edit student"
//                           onClick={e => onEdit(e, student)}
//                           className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100"
//                         >
//                           <Edit2 size={14} />
//                         </button>

//                         {/* ── Restrict (SROTS admin only) ────────────────────── */}
//                         {isSrotsAdmin && (
//                           <button
//                             aria-label={student.isRestricted ? 'Remove restriction' : 'Restrict student'}
//                             onClick={e => onToggleRestriction(e, student.id)}
//                             className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
//                               student.isRestricted
//                                 ? 'text-amber-500 hover:bg-amber-50'
//                                 : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
//                             }`}
//                           >
//                             {student.isRestricted ? <Shield size={14} /> : <ShieldOff size={14} />}
//                           </button>
//                         )}

//                         {/* ── Delete ────────────────────────────────────────── */}
//                         <button
//                           aria-label="Delete student"
//                           onClick={e => onDelete(e, student.id)}
//                           className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
//                         >
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     )}
//                   </td>
//                 )}
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

import React from 'react';
import { Student } from '../../../types';
import { Edit2, Trash2, ShieldOff, Shield, UserCheck, Eye, Send } from 'lucide-react';

/**
 * StudentTable
 * Path: src/components/global/student-directory/StudentTable.tsx
 *
 * UPDATED in this version:
 *   - All action icons in the Actions column are now STATIC (always visible)
 *   - Edit, Restrict, Delete are no longer hover-only — they stay visible exactly like Resend credentials
 *   - All buttons now use consistent ActionBtn styling (light bg + border) for better discoverability
 *   - Resend button remains highlighted in indigo
 *   - Resend is still hidden when isCphView=true (CPH view only shows "View Details")
 *
 * Button placement: Send (indigo) · Edit · Restrict · Delete
 * Matches the same order used in TeamList (CPH/STAFF table).
 */

interface StudentTableProps {
  students:            Student[];
  isLoading?:          boolean;
  canManage:           boolean;
  isSrotsAdmin:        boolean;
  isCphView?:          boolean;
  onEdit:              (e: React.MouseEvent, student: Student) => void;
  onViewDetails:       (e: React.MouseEvent, student: Student) => void;
  onDelete:            (e: React.MouseEvent, id: string) => void;
  onToggleRestriction: (e: React.MouseEvent, id: string) => void;
  /** Opens the resend-credentials confirmation modal for this student */
  onResendCredentials: (e: React.MouseEvent, student: Student) => void;
}

// ── Field helpers ─────────────────────────────────────────────────────────────

const parseRollFromUsername = (username?: string): string => {
  if (!username) return '';
  const parts = username.split('_');
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    if (last && /[0-9]/.test(last)) return last;
    if (parts.length === 2) return parts[1];
  }
  return '';
};

const getRollNumber = (s: Student): string => {
  const a = s as any;
  return (
    a.profile?.rollNumber ||
    a.rollNumber          ||
    parseRollFromUsername(a.username || a.id)
  ) || '—';
};

const getBranch = (s: Student): string => {
  const a = s as any;
  return a.profile?.branch || a.branch || a.department || '—';
};

const getBatch = (s: Student): string => {
  const a = s as any;
  const b = a.profile?.batch ?? a.batch;
  return b ? String(b) : '—';
};

const getAvatarUrl = (s: Student): string | undefined => {
  const a = s as any;
  const url =
    a.avatarUrl       ||
    a.avatar          ||
    a.user?.avatarUrl ||
    a.user?.avatar    ||
    undefined;
  if (!url) {
    console.debug('[StudentTable] No avatar found for student:', a.id, '| keys:', Object.keys(a));
  }
  return url;
};

// ── Avatar ────────────────────────────────────────────────────────────────────

const StudentAvatar: React.FC<{ student: Student }> = ({ student }) => {
  const [imgFailed, setImgFailed] = React.useState(false);
  const avatarSrc = getAvatarUrl(student);
  const initial   = student.fullName?.charAt(0)?.toUpperCase() ?? '?';

  const colours = [
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ];
  const colourClass = colours[(initial.charCodeAt(0) || 0) % colours.length];

  if (avatarSrc && !imgFailed) {
    return (
      <img
        src={avatarSrc}
        alt={student.fullName ?? 'Student'}
        className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm font-bold text-sm ${colourClass}`}>
      {initial}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const TableSkeleton: React.FC = () => (
  <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
    <table className="w-full text-sm">
      <tbody>
        {Array.from({ length: 6 }).map((_, i) => (
          <tr key={i} className="border-b border-gray-100">
            <td className="py-3 px-4 w-14">
              <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
            </td>
            {Array.from({ length: 7 }).map((_, j) => (
              <td key={j} className="py-3 px-4">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Action button helper ──────────────────────────────────────────────────────

const ActionBtn: React.FC<{
  onClick:   (e: React.MouseEvent) => void;
  title:     string;
  className: string;
  children:  React.ReactNode;
}> = ({ onClick, title, className, children }) => (
  <button
    type="button"
    aria-label={title}
    title={title}
    onClick={onClick}
    className={`p-1.5 rounded-lg border transition-colors ${className}`}
  >
    {children}
  </button>
);

// ── Main component ────────────────────────────────────────────────────────────

export const StudentTable: React.FC<StudentTableProps> = ({
  students, isLoading, canManage, isSrotsAdmin, isCphView = false,
  onEdit, onViewDetails, onDelete, onToggleRestriction, onResendCredentials,
}) => {
  if (isLoading) return <TableSkeleton />;

  if (students.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <UserCheck size={28} className="text-gray-300" />
        </div>
        <p className="text-lg font-semibold text-gray-500">No students found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  const showActionColumn = canManage || isCphView;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Student</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Roll No</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Branch</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Batch</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Phone</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
            {showActionColumn && (
              <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                {isCphView ? 'Details' : 'Actions'}
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {students.map(student => {
            const rollNumber    = getRollNumber(student);
            const branch        = getBranch(student);
            const batch         = getBatch(student);
            const isSoftDeleted = (student as any).isDeleted === true;

            return (
              <tr
                key={student.id}
                className={`hover:bg-gray-50/80 transition-colors ${
                  isSoftDeleted ? 'opacity-60 bg-amber-50/40' : ''
                }`}
              >
                {/* Student — Avatar + Name */}
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <StudentAvatar student={student} />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate leading-tight">
                        {student.fullName ?? '—'}
                      </p>
                      {isSoftDeleted && (
                        <span className="inline-block mt-0.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold leading-none">
                          Soft Deleted
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Roll No */}
                <td className="py-2.5 px-4">
                  <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded whitespace-nowrap">
                    {rollNumber}
                  </span>
                </td>

                {/* Branch */}
                <td className="py-2.5 px-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                    branch !== '—' ? 'bg-blue-50 text-blue-700' : 'text-gray-400'
                  }`}>
                    {branch}
                  </span>
                </td>

                {/* Batch */}
                <td className="py-2.5 px-4">
                  <span className="text-xs text-gray-600 font-medium">{batch}</span>
                </td>

                {/* Email */}
                <td className="py-2.5 px-4">
                  <span className="text-xs text-gray-600 truncate block max-w-[180px]">
                    {student.email ?? '—'}
                  </span>
                </td>

                {/* Phone */}
                <td className="py-2.5 px-4">
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {student.phone ?? '—'}
                  </span>
                </td>

                {/* Status */}
                <td className="py-2.5 px-4">
                  {student.isRestricted ? (
                    <span className="text-[11px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                      Restricted
                    </span>
                  ) : (
                    <span className="text-[11px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                      Active
                    </span>
                  )}
                </td>

                {/* Actions */}
                {showActionColumn && (
                  <td className="py-2.5 px-4">
                    {isCphView ? (
                      /* CPH view — only "View Details", no resend */
                      <div className="flex items-center justify-end">
                        <button
                          aria-label="View student details"
                          onClick={e => onViewDetails(e, student)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold transition-colors border border-indigo-100 whitespace-nowrap"
                        >
                          <Eye size={13} /> View Details
                        </button>
                      </div>
                    ) : (
                      /*
                       * Admin / manage view — all action buttons are STATIC / always visible.
                       * No more hover fade-in. All icons stay visible at all times (like the Resend button).
                       * Order: Resend (indigo highlight) · Edit · Restrict (SROTS admin only) · Delete
                       */
                      <div className="flex items-center justify-end gap-1">
                        {/* ── Resend credentials — always visible ──────────── */}
                        <ActionBtn
                          onClick={e => onResendCredentials(e, student)}
                          title="Resend login credentials"
                          className="text-indigo-500 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                        >
                          <Send size={14} />
                        </ActionBtn>

                        {/* ── Edit — always visible ─────────────────────────── */}
                        <ActionBtn
                          onClick={e => onEdit(e, student)}
                          title="Edit student"
                          className="text-gray-400 bg-gray-50 border-gray-200 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit2 size={14} />
                        </ActionBtn>

                        {/* ── Restrict (SROTS admin only) ────────────────────── */}
                        {isSrotsAdmin && (
                          <ActionBtn
                            onClick={e => onToggleRestriction(e, student.id)}
                            title={student.isRestricted ? 'Remove restriction' : 'Restrict student'}
                            className={`bg-gray-50 border-gray-200 ${
                              student.isRestricted
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                            }`}
                          >
                            {student.isRestricted ? <Shield size={14} /> : <ShieldOff size={14} />}
                          </ActionBtn>
                        )}

                        {/* ── Delete — always visible ────────────────────────── */}
                        <ActionBtn
                          onClick={e => onDelete(e, student.id)}
                          title="Delete student"
                          className="text-gray-400 bg-gray-50 border-gray-200 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </ActionBtn>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};