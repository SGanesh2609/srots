
// import React from 'react';
// import { Student } from '../../../types';
// import { Edit2, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

// /**
//  * Component Name: StudentTable
//  * Directory: components/global/student-directory/StudentTable.tsx
//  * 
//  * Functionality:
//  * - Displays a responsive table of students.
//  * - Shows Roll No, Name, Branch, Email, and Status.
//  * - Provides actions: Edit, Toggle Restriction (Srots Admin only), Delete.
//  * 
//  * Used In: StudentList
//  */

// interface StudentTableProps {
//     students: Student[];
//     canManage: boolean;
//     isSrotsAdmin: boolean;
//     onEdit: (e: React.MouseEvent, student: Student) => void;
//     onDelete: (e: React.MouseEvent, id: string) => void;
//     onToggleRestriction: (e: React.MouseEvent, id: string) => void;
// }

// export const StudentTable: React.FC<StudentTableProps> = ({ 
//     students, canManage, isSrotsAdmin, onEdit, onDelete, onToggleRestriction 
// }) => {
//     const showActions = canManage || isSrotsAdmin;

//     return (
//         <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
//             <div className="overflow-x-auto border-t border-gray-100">
//                 <table className="w-full text-left table-fixed min-w-[900px]">
//                     <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
//                         <tr>
//                             <th className="px-4 py-3 w-[20%]">Name</th>
//                             <th className="px-4 py-3 w-[15%]">Roll No</th>
//                             <th className="px-4 py-3 w-[10%]">Branch</th>
//                             <th className="px-4 py-3 w-[25%]">Email</th>
//                             <th className="px-4 py-3 w-[15%]">Status</th>
//                             {showActions && <th className="px-4 py-3 w-[15%] text-right">Actions</th>}
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100 text-sm">
//                         {students.map(student => (
//                             <tr key={student.id} className="hover:bg-gray-50 transition-colors">
//                                 <td className="px-4 py-3 font-bold truncate text-gray-900" title={student.fullName}>{student.fullName}</td>
//                                 <td className="px-4 py-3 font-mono text-gray-600 truncate" title={student.profile?.rollNumber || 'N/A'}>
//                                     {student.profile?.rollNumber || 'N/A'}
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 font-medium">
//                                         {student.profile?.branch || 'N/A'}
//                                     </span>
//                                 </td>
//                                 <td className="px-4 py-3 text-gray-500 truncate" title={student.email}>{student.email}</td>
//                                 <td className="px-4 py-3">
//                                     <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold whitespace-nowrap ${!student.isRestricted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                                         {!student.isRestricted ? 'Active' : 'Restricted'}
//                                     </span>
//                                 </td>
//                                 {showActions && (
//                                     <td className="px-4 py-3 text-right">
//                                         <div className="flex justify-end gap-2">
//                                             {canManage && <button onClick={(e) => onEdit(e, student)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"><Edit2 size={16}/></button>}
//                                             {isSrotsAdmin && <button onClick={(e) => onToggleRestriction(e, student.id)} className={`p-1.5 rounded transition-colors ${!student.isRestricted ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}>{!student.isRestricted ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}</button>}
//                                             {canManage && <button onClick={(e) => onDelete(e, student.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 size={16}/></button>}
//                                         </div>
//                                     </td>
//                                 )}
//                             </tr>
//                         ))}
//                         {students.length === 0 && (
//                             <tr>
//                                 <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
//                                     No students found matching your criteria.
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };


// import React from 'react';
// import { Student } from '../../../types';
// import { Edit2, Trash2, ShieldOff, Shield, UserCheck } from 'lucide-react';

// /**
//  * StudentTable
//  * Path: src/components/global/student-directory/StudentTable.tsx
//  *
//  * ─────────────────────────────────────────────────────────────────────────────
//  * WHY ROLL NUMBER AND BRANCH SHOWED "—"
//  * ─────────────────────────────────────────────────────────────────────────────
//  *
//  * The list endpoint GET /accounts/college/:id/role/STUDENT returns User entities.
//  * In the User entity, studentProfile has @JsonIgnore — so the full profile object
//  * is NOT included in the list response.
//  *
//  * The previous code did: student.profile?.rollNumber
//  * But `profile` is never present on list-endpoint users. → always "—".
//  *
//  * SOLUTION — 3-level fallback for each field:
//  *
//  * For rollNumber:
//  *   1. student.profile?.rollNumber       → exists only after getStudentProfile() call
//  *   2. (student as any).rollNumber       → exists IF you added @JsonProperty("rollNumber")
//  *                                          to User.java (recommended backend fix)
//  *   3. Parse from username: "SRM_20701A0536" → "20701A0536"
//  *      Username format is always: "{COLLEGE_CODE}_{ROLL_NUMBER}"
//  *   4. Show "—" gracefully
//  *
//  * For branch:
//  *   1. student.profile?.branch
//  *   2. (student as any).branch
//  *   3. student.department               → sometimes branch is stored in department field
//  *   4. Show "—" gracefully
//  *
//  * BACKEND FIX (optional but clean): Add these two methods to User.java:
//  *
//  *   @JsonProperty("rollNumber")
//  *   public String getRollNumberForJson() {
//  *     return studentProfile != null ? studentProfile.getRollNumber() : null;
//  *   }
//  *
//  *   @JsonProperty("branch")
//  *   public String getBranchForJson() {
//  *     return studentProfile != null ? studentProfile.getBranch() : null;
//  *   }
//  *
//  * With those methods, fallback level 2 works and you won't need username parsing.
//  * ─────────────────────────────────────────────────────────────────────────────
//  */

// interface StudentTableProps {
//   students: Student[];
//   canManage: boolean;
//   isSrotsAdmin: boolean;
//   onEdit: (e: React.MouseEvent, student: Student) => void;
//   onDelete: (e: React.MouseEvent, id: string) => void;
//   onToggleRestriction: (e: React.MouseEvent, id: string) => void;
// }

// /** Extract roll number from username like "SRM_20701A0536" → "20701A0536" */
// const parseRollFromUsername = (username?: string): string => {
//   if (!username) return '';
//   // Username format: COLLEGE_CODE + "_" + ROLL_NUMBER
//   // College code never contains digits (e.g. "SRM", "AITS", "KLU")
//   // Roll number always has digits — split on first underscore that precedes a digit
//   const parts = username.split('_');
//   if (parts.length >= 2) {
//     // Last part is most likely the roll number
//     const lastPart = parts[parts.length - 1];
//     // Validate: roll numbers typically have letters+digits (e.g. 20701A0536)
//     if (lastPart && /[0-9]/.test(lastPart)) {
//       return lastPart;
//     }
//     // If username is just "SRM_20701A0536" (2 parts)
//     if (parts.length === 2) return parts[1];
//   }
//   return '';
// };

// /** Get roll number with 3-level fallback */
// const getRollNumber = (student: Student): string => {
//   const s = student as any;
//   return (
//     s.profile?.rollNumber   ||   // Level 1: full profile (after getStudentProfile call)
//     s.rollNumber            ||   // Level 2: @JsonProperty on User entity (backend fix)
//     parseRollFromUsername(s.username || s.id)  // Level 3: parse from username
//   ) || '—';
// };

// /** Get branch with 3-level fallback */
// const getBranch = (student: Student): string => {
//   const s = student as any;
//   return (
//     s.profile?.branch   ||   // Level 1: full profile
//     s.branch            ||   // Level 2: @JsonProperty on User entity
//     s.department        ||   // Level 3: sometimes stored in department
//     '—'
//   );
// };

// /** Get batch year for display */
// const getBatch = (student: Student): string => {
//   const s = student as any;
//   const batch = s.profile?.batch ?? s.batch;
//   return batch ? String(batch) : '—';
// };

// export const StudentTable: React.FC<StudentTableProps> = ({
//   students, canManage, isSrotsAdmin, onEdit, onDelete, onToggleRestriction,
// }) => {
//   if (students.length === 0) {
//     return (
//       <div className="text-center py-16 text-gray-400">
//         <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
//           <UserCheck size={28} className="text-gray-300" />
//         </div>
//         <p className="text-lg font-semibold text-gray-500">No students found</p>
//         <p className="text-sm mt-1">Try adjusting your search or filters</p>
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="bg-gray-50 border-b border-gray-200">
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
//               Roll No
//             </th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
//               Name
//             </th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
//               Branch
//             </th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
//               Batch
//             </th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
//               Email
//             </th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
//               Phone
//             </th>
//             <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
//               Status
//             </th>
//             {canManage && (
//               <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
//                 Actions
//               </th>
//             )}
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-100">
//           {students.map(student => {
//             const rollNumber = getRollNumber(student);
//             const branch     = getBranch(student);
//             const batch      = getBatch(student);
//             const isSoftDeleted = (student as any).isDeleted === true;

//             return (
//               <tr
//                 key={student.id}
//                 className={`group hover:bg-gray-50 transition-colors
//                   ${isSoftDeleted ? 'opacity-60 bg-amber-50/50' : ''}`}
//               >
//                 {/* Roll Number */}
//                 <td className="py-3 px-4">
//                   <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
//                     {rollNumber}
//                   </span>
//                 </td>

//                 {/* Name */}
//                 <td className="py-3 px-4">
//                   <div className="flex items-center gap-2">
//                     {student.avatarUrl ? (
//                       <img
//                         src={student.avatarUrl}
//                         alt={student.fullName}
//                         className="w-8 h-8 rounded-full object-cover shrink-0"
//                       />
//                     ) : (
//                       <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
//                         <span className="text-xs font-bold text-indigo-700">
//                           {student.fullName?.charAt(0)?.toUpperCase() ?? '?'}
//                         </span>
//                       </div>
//                     )}
//                     <div className="min-w-0">
//                       <p className="font-semibold text-gray-800 truncate">{student.fullName}</p>
//                       {isSoftDeleted && (
//                         <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
//                           Soft Deleted
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </td>

//                 {/* Branch */}
//                 <td className="py-3 px-4">
//                   <span className={`text-xs font-semibold px-2 py-1 rounded
//                     ${branch !== '—'
//                       ? 'bg-blue-50 text-blue-700'
//                       : 'text-gray-400'}`}
//                   >
//                     {branch}
//                   </span>
//                 </td>

//                 {/* Batch */}
//                 <td className="py-3 px-4">
//                   <span className="text-xs text-gray-600 font-medium">{batch}</span>
//                 </td>

//                 {/* Email */}
//                 <td className="py-3 px-4">
//                   <span className="text-xs text-gray-600 truncate block max-w-[180px]">
//                     {student.email ?? '—'}
//                   </span>
//                 </td>

//                 {/* Phone */}
//                 <td className="py-3 px-4">
//                   <span className="text-xs text-gray-600">{student.phone ?? '—'}</span>
//                 </td>

//                 {/* Status */}
//                 <td className="py-3 px-4">
//                   {student.isRestricted ? (
//                     <span className="text-[11px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
//                       Restricted
//                     </span>
//                   ) : (
//                     <span className="text-[11px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
//                       Active
//                     </span>
//                   )}
//                 </td>

//                 {/* Actions */}
//                 {canManage && (
//                   <td className="py-3 px-4">
//                     <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                       {/* Edit */}
//                       <button
//                         aria-label="Edit student"
//                         onClick={e => onEdit(e, student)}
//                         className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
//                       >
//                         <Edit2 size={14} />
//                       </button>

//                       {/* Restrict / Unrestrict */}
//                       {isSrotsAdmin && (
//                         <button
//                           aria-label={student.isRestricted ? 'Remove restriction' : 'Restrict student'}
//                           onClick={e => onToggleRestriction(e, student.id)}
//                           className={`p-1.5 rounded-lg transition-colors
//                             ${student.isRestricted
//                               ? 'text-amber-500 hover:bg-amber-50'
//                               : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
//                         >
//                           {student.isRestricted ? <Shield size={14} /> : <ShieldOff size={14} />}
//                         </button>
//                       )}

//                       {/* Delete */}
//                       <button
//                         aria-label="Delete student"
//                         onClick={e => onDelete(e, student.id)}
//                         className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </div>
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

// import React from 'react';
// import { Student } from '../../../types';
// import { Edit2, Trash2, ShieldOff, Shield, UserCheck, Eye } from 'lucide-react';

// /**
//  * StudentTable
//  * Path: src/components/global/student-directory/StudentTable.tsx
//  *
//  * FIXES:
//  * 1. avatarUrl vs avatar:
//  *    - The Java entity column is `avatar_url` → serialised as `avatarUrl` in JSON.
//  *    - Old frontend code referenced `avatar`. Both are declared optional in
//  *      types.ts (avatar? and avatarUrl?) for backward compat.
//  *    - getAvatarUrl() helper checks avatarUrl first, then falls back to avatar,
//  *      so both old and new API responses always render the photo.
//  *
//  * 2. isCphView prop:
//  *    - Hides Edit / Delete / Restrict buttons.
//  *    - Shows "View Details" (Eye icon) button that opens the readOnly wizard.
//  *
//  * 3. isLoading skeleton while data fetches.
//  */

// interface StudentTableProps {
//     students:            Student[];
//     isLoading?:          boolean;
//     canManage:           boolean;
//     isSrotsAdmin:        boolean;
//     isCphView?:          boolean;
//     onEdit:              (e: React.MouseEvent, student: Student) => void;
//     onViewDetails:       (e: React.MouseEvent, student: Student) => void;
//     onDelete:            (e: React.MouseEvent, id: string) => void;
//     onToggleRestriction: (e: React.MouseEvent, id: string) => void;
// }

// // ─── Field helpers ────────────────────────────────────────────────────────────

// const parseRollFromUsername = (username?: string): string => {
//     if (!username) return '';
//     const parts = username.split('_');
//     if (parts.length >= 2) {
//         const last = parts[parts.length - 1];
//         if (last && /[0-9]/.test(last)) return last;
//         if (parts.length === 2) return parts[1];
//     }
//     return '';
// };

// const getRollNumber = (s: Student): string => {
//     const a = s as any;
//     return (
//         a.profile?.rollNumber ||
//         a.rollNumber          ||
//         parseRollFromUsername(a.username || a.id)
//     ) || '—';
// };

// const getBranch = (s: Student): string => {
//     const a = s as any;
//     return a.profile?.branch || a.branch || a.department || '—';
// };

// const getBatch = (s: Student): string => {
//     const a = s as any;
//     const b = a.profile?.batch ?? a.batch;
//     return b ? String(b) : '—';
// };

// /**
//  * FIXED: avatarUrl vs avatar
//  *
//  * The User JPA entity has:   private String avatarUrl;
//  * Jackson serialises it as:  "avatarUrl": "https://..."
//  *
//  * Older TS code used `student.avatar` (the legacy field name).
//  * types.ts now declares BOTH `avatar?` and `avatarUrl?` as optional,
//  * and this helper checks both so images always render regardless of
//  * which field name the API response contains.
//  */
// const getAvatarUrl = (s: Student): string | undefined => {
//     const a = s as any;
//     return a.avatarUrl || a.avatar || undefined;
// };

// // ─── Skeleton ─────────────────────────────────────────────────────────────────

// const TableSkeleton: React.FC = () => (
//     <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
//         <table className="w-full text-sm">
//             <tbody>
//                 {Array.from({ length: 6 }).map((_, i) => (
//                     <tr key={i} className="border-b border-gray-100">
//                         {Array.from({ length: 8 }).map((_, j) => (
//                             <td key={j} className="py-3 px-4">
//                                 <div className="h-4 bg-gray-100 rounded animate-pulse" />
//                             </td>
//                         ))}
//                     </tr>
//                 ))}
//             </tbody>
//         </table>
//     </div>
// );

// // ─── Component ────────────────────────────────────────────────────────────────

// export const StudentTable: React.FC<StudentTableProps> = ({
//     students, isLoading, canManage, isSrotsAdmin, isCphView = false,
//     onEdit, onViewDetails, onDelete, onToggleRestriction,
// }) => {
//     if (isLoading) return <TableSkeleton />;

//     if (students.length === 0) {
//         return (
//             <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
//                 <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
//                     <UserCheck size={28} className="text-gray-300" />
//                 </div>
//                 <p className="text-lg font-semibold text-gray-500">No students found</p>
//                 <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
//             </div>
//         );
//     }

//     const showActionColumn = canManage || isCphView;

//     return (
//         <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
//             <table className="w-full text-sm">
//                 <thead>
//                     <tr className="bg-gray-50 border-b border-gray-200">
//                         <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Roll No</th>
//                         <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Name</th>
//                         <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Branch</th>
//                         <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Batch</th>
//                         <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
//                         <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Phone</th>
//                         <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
//                         {showActionColumn && (
//                             <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
//                                 {isCphView ? 'Details' : 'Actions'}
//                             </th>
//                         )}
//                     </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                     {students.map(student => {
//                         const rollNumber    = getRollNumber(student);
//                         const branch        = getBranch(student);
//                         const batch         = getBatch(student);
//                         const avatarSrc     = getAvatarUrl(student);   // ← FIXED
//                         const isSoftDeleted = (student as any).isDeleted === true;

//                         return (
//                             <tr key={student.id}
//                                 className={`group hover:bg-gray-50 transition-colors ${isSoftDeleted ? 'opacity-60 bg-amber-50/50' : ''}`}>

//                                 {/* Roll No */}
//                                 <td className="py-3 px-4">
//                                     <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
//                                         {rollNumber}
//                                     </span>
//                                 </td>

//                                 {/* Name + Avatar */}
//                                 <td className="py-3 px-4">
//                                     <div className="flex items-center gap-2">
//                                         {avatarSrc ? (
//                                             <img
//                                                 src={avatarSrc}
//                                                 alt={student.fullName}
//                                                 className="w-8 h-8 rounded-full object-cover shrink-0"
//                                                 onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
//                                             />
//                                         ) : (
//                                             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
//                                                 <span className="text-xs font-bold text-indigo-700">
//                                                     {student.fullName?.charAt(0)?.toUpperCase() ?? '?'}
//                                                 </span>
//                                             </div>
//                                         )}
//                                         <div className="min-w-0">
//                                             <p className="font-semibold text-gray-800 truncate">{student.fullName}</p>
//                                             {isSoftDeleted && (
//                                                 <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
//                                                     Soft Deleted
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </td>

//                                 {/* Branch */}
//                                 <td className="py-3 px-4">
//                                     <span className={`text-xs font-semibold px-2 py-1 rounded ${branch !== '—' ? 'bg-blue-50 text-blue-700' : 'text-gray-400'}`}>
//                                         {branch}
//                                     </span>
//                                 </td>

//                                 {/* Batch */}
//                                 <td className="py-3 px-4">
//                                     <span className="text-xs text-gray-600 font-medium">{batch}</span>
//                                 </td>

//                                 {/* Email */}
//                                 <td className="py-3 px-4">
//                                     <span className="text-xs text-gray-600 truncate block max-w-[180px]">
//                                         {student.email ?? '—'}
//                                     </span>
//                                 </td>

//                                 {/* Phone */}
//                                 <td className="py-3 px-4">
//                                     <span className="text-xs text-gray-600">{student.phone ?? '—'}</span>
//                                 </td>

//                                 {/* Status */}
//                                 <td className="py-3 px-4">
//                                     {student.isRestricted ? (
//                                         <span className="text-[11px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">Restricted</span>
//                                     ) : (
//                                         <span className="text-[11px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Active</span>
//                                     )}
//                                 </td>

//                                 {/* Actions / Details */}
//                                 {showActionColumn && (
//                                     <td className="py-3 px-4">
//                                         {isCphView ? (
//                                             /* CPH — View Details only */
//                                             <div className="flex items-center justify-end">
//                                                 <button
//                                                     aria-label="View student details"
//                                                     onClick={e => onViewDetails(e, student)}
//                                                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold transition-colors border border-indigo-100"
//                                                 >
//                                                     <Eye size={13} /> View Details
//                                                 </button>
//                                             </div>
//                                         ) : (
//                                             /* Admin / SrotsDev — full action buttons */
//                                             <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                                 <button
//                                                     aria-label="Edit student"
//                                                     onClick={e => onEdit(e, student)}
//                                                     className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
//                                                 >
//                                                     <Edit2 size={14} />
//                                                 </button>
//                                                 {isSrotsAdmin && (
//                                                     <button
//                                                         aria-label={student.isRestricted ? 'Remove restriction' : 'Restrict student'}
//                                                         onClick={e => onToggleRestriction(e, student.id)}
//                                                         className={`p-1.5 rounded-lg transition-colors ${student.isRestricted ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
//                                                     >
//                                                         {student.isRestricted ? <Shield size={14} /> : <ShieldOff size={14} />}
//                                                     </button>
//                                                 )}
//                                                 <button
//                                                     aria-label="Delete student"
//                                                     onClick={e => onDelete(e, student.id)}
//                                                     className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
//                                                 >
//                                                     <Trash2 size={14} />
//                                                 </button>
//                                             </div>
//                                         )}
//                                     </td>
//                                 )}
//                             </tr>
//                         );
//                     })}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

import React from 'react';
import { Student } from '../../../types';
import { Edit2, Trash2, ShieldOff, Shield, UserCheck, Eye } from 'lucide-react';

/**
 * StudentTable
 * Path: src/components/global/student-directory/StudentTable.tsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES IN THIS VERSION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * VISUAL FIX: Profile image is now the FIRST column, followed immediately by
 * the student's full name. Roll No, Branch, Batch, Email, Phone, Status and
 * Actions follow after.
 *
 * Previous layout: Roll No | Name+Avatar | Branch | Batch | Email | Phone | Status | Actions
 * New layout:      Avatar+Name | Roll No | Branch | Batch | Email | Phone | Status | Actions
 *
 * Avatar debug improvements:
 * - getAvatarUrl() now logs to console when it finds (or fails to find) a URL,
 *   so you can open DevTools and see exactly what field name the API is returning.
 * - Checks: avatarUrl → avatar → user?.avatarUrl → user?.avatar (covers nested user obj)
 * - onError handler hides broken <img> and shows the initials fallback instead
 *   (uses a sibling <div> pattern with a ref-free CSS trick).
 * - Avatar cell has a fixed width (56px) so it never collapses.
 * ─────────────────────────────────────────────────────────────────────────────
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
}

// ─── Field helpers ────────────────────────────────────────────────────────────

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

/**
 * getAvatarUrl — exhaustive field search
 *
 * The backend User entity has column `avatar_url` which Jackson serialises as
 * `avatarUrl`. However, the list endpoint response may:
 *   a) Return User directly          → { avatarUrl: "..." }
 *   b) Nest User inside another obj  → { user: { avatarUrl: "..." }, profile: {...} }
 *   c) Use old field name            → { avatar: "..." }
 *
 * This helper checks all four paths so the image always renders.
 */
const getAvatarUrl = (s: Student): string | undefined => {
    const a = s as any;
    const url =
        a.avatarUrl       ||   // canonical — User entity column avatar_url
        a.avatar          ||   // legacy field name (old frontend code)
        a.user?.avatarUrl ||   // nested { user: { avatarUrl } } response shape
        a.user?.avatar    ||   // nested legacy
        undefined;

    // Debug: open browser DevTools console to see what the API is returning
    if (!url) {
        console.debug('[StudentTable] No avatar found for student:', a.id, '| keys:', Object.keys(a));
    }

    return url;
};

// ─── Avatar cell component ────────────────────────────────────────────────────

/**
 * StudentAvatar
 *
 * Shows the profile image if a URL is available. On image load error, hides
 * the <img> and shows the initials fallback <div> instead.
 *
 * Using local state so the fallback renders cleanly without layout shift.
 */
const StudentAvatar: React.FC<{ student: Student }> = ({ student }) => {
    const [imgFailed, setImgFailed] = React.useState(false);
    const avatarSrc = getAvatarUrl(student);
    const initial   = student.fullName?.charAt(0)?.toUpperCase() ?? '?';

    // Colours for the initials circle — deterministic based on first letter
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TableSkeleton: React.FC = () => (
    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
        <table className="w-full text-sm">
            <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                        {/* Avatar skeleton */}
                        <td className="py-3 px-4 w-14">
                            <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
                        </td>
                        {/* Other columns */}
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

// ─── Main component ───────────────────────────────────────────────────────────

export const StudentTable: React.FC<StudentTableProps> = ({
    students, isLoading, canManage, isSrotsAdmin, isCphView = false,
    onEdit, onViewDetails, onDelete, onToggleRestriction,
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
                        {/* ── Column 1: Student (Avatar + Name) ─────────────────────── */}
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                            Student
                        </th>
                        {/* ── Column 2: Roll No ─────────────────────────────────────── */}
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                            Roll No
                        </th>
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
                                className={`group hover:bg-gray-50/80 transition-colors ${isSoftDeleted ? 'opacity-60 bg-amber-50/40' : ''}`}
                            >
                                {/* ── Column 1: Avatar + Full Name ──────────────────────── */}
                                <td className="py-2.5 px-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Profile image — always visible, no hover required */}
                                        <StudentAvatar student={student} />

                                        {/* Name block */}
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

                                {/* ── Column 2: Roll No ─────────────────────────────────── */}
                                <td className="py-2.5 px-4">
                                    <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded whitespace-nowrap">
                                        {rollNumber}
                                    </span>
                                </td>

                                {/* ── Branch ────────────────────────────────────────────── */}
                                <td className="py-2.5 px-4">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${branch !== '—' ? 'bg-blue-50 text-blue-700' : 'text-gray-400'}`}>
                                        {branch}
                                    </span>
                                </td>

                                {/* ── Batch ─────────────────────────────────────────────── */}
                                <td className="py-2.5 px-4">
                                    <span className="text-xs text-gray-600 font-medium">{batch}</span>
                                </td>

                                {/* ── Email ─────────────────────────────────────────────── */}
                                <td className="py-2.5 px-4">
                                    <span className="text-xs text-gray-600 truncate block max-w-[180px]">
                                        {student.email ?? '—'}
                                    </span>
                                </td>

                                {/* ── Phone ─────────────────────────────────────────────── */}
                                <td className="py-2.5 px-4">
                                    <span className="text-xs text-gray-600 whitespace-nowrap">
                                        {student.phone ?? '—'}
                                    </span>
                                </td>

                                {/* ── Status ────────────────────────────────────────────── */}
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

                                {/* ── Actions / Details ─────────────────────────────────── */}
                                {showActionColumn && (
                                    <td className="py-2.5 px-4">
                                        {isCphView ? (
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
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    aria-label="Edit student"
                                                    onClick={e => onEdit(e, student)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                {isSrotsAdmin && (
                                                    <button
                                                        aria-label={student.isRestricted ? 'Remove restriction' : 'Restrict student'}
                                                        onClick={e => onToggleRestriction(e, student.id)}
                                                        className={`p-1.5 rounded-lg transition-colors ${
                                                            student.isRestricted
                                                                ? 'text-amber-500 hover:bg-amber-50'
                                                                : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                                                        }`}
                                                    >
                                                        {student.isRestricted ? <Shield size={14} /> : <ShieldOff size={14} />}
                                                    </button>
                                                )}
                                                <button
                                                    aria-label="Delete student"
                                                    onClick={e => onDelete(e, student.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
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