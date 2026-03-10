
// import React, { useState, useEffect } from 'react';
// import { StudentService } from '../../services/studentService';
// import { CollegeService } from '../../services/collegeService';
// import { Student, College } from '../../types';
// import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
// import { StudentList } from './student-directory/StudentList';
// import { StudentFormWizard } from './student-directory/StudentFormWizard';

// interface GlobalStudentDirectoryProps {
//   collegeId: string;
//   isSrotsAdmin: boolean;
//   canManage?: boolean;
//   onRefresh?: () => void; // Parent callback to update stats
// }

// export const GlobalStudentDirectory: React.FC<GlobalStudentDirectoryProps> = ({ 
//     collegeId, isSrotsAdmin, canManage = true, onRefresh 
// }) => {
//   const [studentsList, setStudentsList] = useState<Student[]>([]);
//   const [studentSearch, setStudentSearch] = useState('');
//   const [yearFilter, setYearFilter] = useState('All');
//   const [branchFilter, setBranchFilter] = useState('All');
//   const [collegeDetails, setCollegeDetails] = useState<College | undefined>(undefined);

//   const [showAddStudent, setShowAddStudent] = useState(false);
//   const [isEditingStudent, setIsEditingStudent] = useState(false); 
//   const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
//   const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);

//   // Fetch Logic delegated to Services
//   useEffect(() => {
//       refreshData();
//   }, [collegeId, studentSearch, yearFilter, branchFilter]);

//   const refreshData = async () => {
//       if (collegeId) {
//           const filters = {
//               query: studentSearch,
//               year: yearFilter,
//               branch: branchFilter
//           };
//           setStudentsList(await StudentService.searchStudents(collegeId, filters));
//           setCollegeDetails(await CollegeService.getCollegeById(collegeId));
          
//           // 3-Tier Sync: Notify parent (CMS Dashboard / College Detail) to update counters immediately
//           if (onRefresh) {
//               onRefresh();
//           }
//       }
//   };

//   const getCollegeBranches = () => collegeDetails?.branches || [];

//   const handleOpenAddStudent = () => {
//       setIsEditingStudent(false);
//       setEditingStudent(null);
//       setShowAddStudent(true);
//   };

//   const handleOpenEditStudent = (e: React.MouseEvent, student: Student) => {
//       e.stopPropagation();
//       setIsEditingStudent(true);
//       setEditingStudent(student); 
//       setShowAddStudent(true);
//   };

//   const handleSaveStudent = async (student: Student) => {
//       if(isEditingStudent) await StudentService.updateStudent(student);
//       else await StudentService.createStudent(student);
//       refreshData();
//       setShowAddStudent(false);
//   };

//   const requestDeleteStudent = (e: React.MouseEvent, id: string) => {
//       e.stopPropagation(); e.preventDefault();
//       setDeleteStudentId(id);
//   };

//   const confirmDeleteStudent = async () => {
//       if (deleteStudentId) {
//           await StudentService.deleteStudent(deleteStudentId);
//           refreshData();
//           setDeleteStudentId(null);
//       }
//   };

//   const handleToggleStudentRestriction = async (e: React.MouseEvent, id: string) => {
//       e.stopPropagation(); e.preventDefault();
//       const student = studentsList.find(s => s.id === id);
//       if (student) {
//           await StudentService.updateStudent({ ...student, isRestricted: !student.isRestricted });
//           refreshData();
//       }
//   };

//   const handleDownloadSample = () => {
//       StudentService.downloadBulkUploadTemplate();
//   };

//   const handleDownloadFilteredReport = () => {
//       try {
//           const filters = {
//               query: studentSearch,
//               year: yearFilter,
//               branch: branchFilter
//           };
//           StudentService.exportStudentRegistry(collegeId, filters);
//       } catch (e: any) {
//           alert(e.message);
//       }
//   };

//   return (
//     <div className="space-y-6 animate-in fade-in">
//         <StudentList 
//             students={studentsList}
//             searchQuery={studentSearch}
//             setSearchQuery={setStudentSearch}
//             yearFilter={yearFilter}
//             setYearFilter={setYearFilter}
//             branchFilter={branchFilter}
//             setBranchFilter={setBranchFilter}
//             collegeBranches={getCollegeBranches()}
//             canManage={canManage}
//             isSrotsAdmin={isSrotsAdmin}
//             onEdit={handleOpenEditStudent}
//             onDelete={requestDeleteStudent}
//             onToggleRestriction={handleToggleStudentRestriction}
//             onDownloadReport={handleDownloadFilteredReport}
//             onAdd={handleOpenAddStudent}
//             onBulkUpload={() => {}} // Handled inside StudentFilters which calls refreshData
//             onDownloadSample={handleDownloadSample}
//             collegeId={collegeId}
//             onRefresh={refreshData}
//         />

//         <StudentFormWizard 
//             isOpen={showAddStudent}
//             onClose={() => setShowAddStudent(false)}
//             isEditing={isEditingStudent}
//             initialData={editingStudent}
//             collegeDetails={collegeDetails}
//             collegeId={collegeId}
//             onSave={handleSaveStudent}
//         />

//         <DeleteConfirmationModal 
//             isOpen={!!deleteStudentId}
//             onClose={() => setDeleteStudentId(null)}
//             onConfirm={confirmDeleteStudent}
//             title="Delete Student?"
//             message="This will permanently remove the student record and cannot be undone."
//         />
//     </div>
//   );
// };


// import React, { useState, useEffect } from 'react';
// import { StudentService } from '../../services/studentService';
// import { CollegeService } from '../../services/collegeService';
// import { Student, College } from '../../types';
// import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
// import { StudentList } from './student-directory/StudentList';
// import { StudentFormWizard } from './student-directory/StudentFormWizard';

// interface GlobalStudentDirectoryProps {
//   collegeId: string;
//   isSrotsAdmin: boolean;
//   canManage?: boolean;
//   onRefresh?: () => void; // Parent callback to update stats
// }

// export const GlobalStudentDirectory: React.FC<GlobalStudentDirectoryProps> = ({ 
//     collegeId, isSrotsAdmin, canManage = true, onRefresh 
// }) => {
//   const [studentsList, setStudentsList] = useState<Student[]>([]);
//   const [studentSearch, setStudentSearch] = useState('');
//   const [yearFilter, setYearFilter] = useState('All');
//   const [branchFilter, setBranchFilter] = useState('All');
//   const [collegeDetails, setCollegeDetails] = useState<College | undefined>(undefined);

//   const [showAddStudent, setShowAddStudent] = useState(false);
//   const [isEditingStudent, setIsEditingStudent] = useState(false); 
//   const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
//   const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);

//   // Fetch Logic delegated to Services
//   useEffect(() => {
//       refreshData();
//   }, [collegeId, studentSearch, yearFilter, branchFilter]);

//   const refreshData = async () => {
//       if (collegeId) {
//           const filters = {
//               query: studentSearch,
//               year: yearFilter,
//               branch: branchFilter
//           };
//           setStudentsList(await StudentService.searchStudents(collegeId, filters));
//           setCollegeDetails(await CollegeService.getCollegeById(collegeId));
          
//           // 3-Tier Sync: Notify parent (CMS Dashboard / College Detail) to update counters immediately
//           if (onRefresh) {
//               onRefresh();
//           }
//       }
//   };

//   const getCollegeBranches = () => collegeDetails?.branches || [];

//   const handleOpenAddStudent = () => {
//       setIsEditingStudent(false);
//       setEditingStudent(null);
//       setShowAddStudent(true);
//   };

//   const handleOpenEditStudent = (e: React.MouseEvent, student: Student) => {
//       e.stopPropagation();
//       setIsEditingStudent(true);
//       setEditingStudent(student); 
//       setShowAddStudent(true);
//   };

//   const handleSaveStudent = async (student: Student) => {
//       if(isEditingStudent) await StudentService.updateStudent(student);
//       else await StudentService.createStudent(student);
//       refreshData();
//       setShowAddStudent(false);
//   };

//   const requestDeleteStudent = (e: React.MouseEvent, id: string) => {
//       e.stopPropagation(); e.preventDefault();
//       setDeleteStudentId(id);
//   };

//   const confirmDeleteStudent = async () => {
//       if (deleteStudentId) {
//           await StudentService.deleteStudent(deleteStudentId);
//           refreshData();
//           setDeleteStudentId(null);
//       }
//   };

//   const handleToggleStudentRestriction = async (e: React.MouseEvent, id: string) => {
//       e.stopPropagation(); e.preventDefault();
//       const student = studentsList.find(s => s.id === id);
//       if (student) {
//           await StudentService.toggleRestriction(id, !student.isRestricted);
//           refreshData();
//       }
//   };

//   const handleDownloadSample = () => {
//       StudentService.downloadBulkUploadTemplate();
//   };

//   const handleDownloadFilteredReport = () => {
//       try {
//           const filters = {
//               query: studentSearch,
//               year: yearFilter,
//               branch: branchFilter
//           };
//           StudentService.exportStudentRegistry(collegeId, filters);
//       } catch (e: any) {
//           alert(e.message);
//       }
//   };

//   return (
//     <div className="space-y-6 animate-in fade-in">
//         <StudentList 
//             students={studentsList}
//             searchQuery={studentSearch}
//             setSearchQuery={setStudentSearch}
//             yearFilter={yearFilter}
//             setYearFilter={setYearFilter}
//             branchFilter={branchFilter}
//             setBranchFilter={setBranchFilter}
//             collegeBranches={getCollegeBranches()}
//             canManage={canManage}
//             isSrotsAdmin={isSrotsAdmin}
//             onEdit={handleOpenEditStudent}
//             onDelete={requestDeleteStudent}
//             onToggleRestriction={handleToggleStudentRestriction}
//             onDownloadReport={handleDownloadFilteredReport}
//             onAdd={handleOpenAddStudent}
//             onBulkUpload={() => {}} // Handled inside StudentFilters which calls refreshData
//             onDownloadSample={handleDownloadSample}
//             collegeId={collegeId}
//             onRefresh={refreshData}
//         />

//         <StudentFormWizard 
//             isOpen={showAddStudent}
//             onClose={() => setShowAddStudent(false)}
//             isEditing={isEditingStudent}
//             initialData={editingStudent}
//             collegeDetails={collegeDetails}
//             collegeId={collegeId}
//             onSave={handleSaveStudent}
//         />

//         <DeleteConfirmationModal 
//             isOpen={!!deleteStudentId}
//             onClose={() => setDeleteStudentId(null)}
//             onConfirm={confirmDeleteStudent}
//             title="Delete Student?"
//             message="This will permanently remove the student record and cannot be undone."
//         />
//     </div>
//   );
// };

// import React, { useState, useEffect, useCallback } from 'react';
// import { StudentService } from '../../services/studentService';
// import { CollegeService } from '../../services/collegeService';
// import { Student, College } from '../../types';
// import { StudentList } from './student-directory/StudentList';
// import { StudentFormWizard } from './student-directory/StudentFormWizard';

// /**
//  * GlobalStudentDirectory
//  * Path: src/components/global/GlobalStudentDirectory.tsx
//  *
//  * ─────────────────────────────────────────────────────────────────────────────
//  * CRITICAL CHANGES IN THIS VERSION
//  * ─────────────────────────────────────────────────────────────────────────────
//  *
//  * 1. handleOpenEditStudent is now async — it calls StudentService.getStudentProfile()
//  *    BEFORE opening the wizard. This ensures initialData always contains:
//  *      { ...user, profile: StudentProfile, educationHistory: EducationRecord[] }
//  *    Without this, the wizard receives only a flat User object with no profile data.
//  *
//  * 2. handleSaveStudent correctly routes the wizard payload to the right API:
//  *    - For new students: POST /accounts/student with { name, email, phone, aadhaarNumber, collegeId, studentProfile }
//  *    - For updates:      PUT  /accounts/:id with the same shape
//  *    The payload is built in StudentFormWizard and passed through onSave unchanged.
//  *
//  * 3. requestDeleteStudent now passes the student name as 3rd argument (was missing).
//  *
//  * 4. Soft/Hard delete modal is fully implemented inline — no external component needed.
//  *    Radio buttons toggle deleteMode state; confirmDeleteStudent dispatches the right
//  *    service call based on mode.
//  *
//  * 5. collegeDetails is fetched once and stored. Because StudentFormWizard now uses
//  *    useRef for collegeDetails, subsequent collegeDetails state updates will NOT
//  *    reset the wizard form.
//  * ─────────────────────────────────────────────────────────────────────────────
//  */

// interface GlobalStudentDirectoryProps {
//   collegeId: string;
//   isSrotsAdmin: boolean;
//   canManage?: boolean;
//   onRefresh?: () => void;
// }

// export interface PaginationState {
//   page: number;
//   size: number;
//   total: number;
//   totalPages: number;
// }

// export const GlobalStudentDirectory: React.FC<GlobalStudentDirectoryProps> = ({
//   collegeId, isSrotsAdmin, canManage = true, onRefresh,
// }) => {
//   const [studentsList,   setStudentsList]   = useState<Student[]>([]);
//   const [studentSearch,  setStudentSearch]  = useState('');
//   const [yearFilter,     setYearFilter]     = useState('All');
//   const [branchFilter,   setBranchFilter]   = useState('All');
//   const [collegeDetails, setCollegeDetails] = useState<College | undefined>(undefined);
//   const [isLoading,      setIsLoading]      = useState(false);

//   const [pagination, setPagination] = useState<PaginationState>({
//     page: 0, size: 20, total: 0, totalPages: 0,
//   });

//   // Wizard state
//   const [showAddStudent,   setShowAddStudent]   = useState(false);
//   const [isEditingStudent, setIsEditingStudent] = useState(false);
//   const [editingStudent,   setEditingStudent]   = useState<Student | null>(null);

//   // Delete modal state
//   const [deleteTarget,    setDeleteTarget]    = useState<{ id: string; name: string } | null>(null);
//   const [deleteMode,      setDeleteMode]      = useState<'soft' | 'hard'>('soft');
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [isDeleting,      setIsDeleting]      = useState(false);

//   // Report format
//   const [reportFormat, setReportFormat] = useState<'excel' | 'csv'>('excel');

//   // ─── Data fetch ─────────────────────────────────────────────────────────────

//   const refreshData = useCallback(async () => {
//     if (!collegeId) return;
//     setIsLoading(true);
//     try {
//       const result = await StudentService.searchStudentsPaginated(collegeId, {
//         query:  studentSearch,
//         year:   yearFilter,
//         branch: branchFilter,
//         page:   pagination.page,
//         size:   pagination.size,
//       });
//       setStudentsList(result.students);
//       setPagination(prev => ({
//         ...prev,
//         total:      result.total,
//         totalPages: result.totalPages,
//       }));

//       // Fetch college details once (subsequent calls are skipped)
//       if (!collegeDetails) {
//         const college = await CollegeService.getCollegeById(collegeId);
//         setCollegeDetails(college);
//       }

//       onRefresh?.();
//     } catch (err) {
//       console.error('[GlobalStudentDirectory] refreshData failed:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [collegeId, studentSearch, yearFilter, branchFilter, pagination.page, pagination.size]);

//   useEffect(() => {
//     refreshData();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [collegeId, studentSearch, yearFilter, branchFilter, pagination.page, pagination.size]);

//   useEffect(() => {
//     setPagination(prev => ({ ...prev, page: 0 }));
//   }, [studentSearch, yearFilter, branchFilter]);

//   // ─── Handlers ───────────────────────────────────────────────────────────────

//   const handleOpenAddStudent = () => {
//     setIsEditingStudent(false);
//     setEditingStudent(null);
//     setShowAddStudent(true);
//   };

//   /**
//    * CRITICAL FIX: fetch full profile BEFORE opening the wizard.
//    *
//    * The list endpoint (GET /college/:id/role/STUDENT) returns flat User objects
//    * with NO profile or educationHistory. We must call GET /accounts/profile/:id
//    * first so that initialData contains:
//    *   { ...user, profile: { rollNumber, branch, dob, ... }, educationHistory: [...] }
//    *
//    * Without this fetch, all form fields appear empty because profile is undefined.
//    */
//   const handleOpenEditStudent = async (e: React.MouseEvent, student: Student) => {
//     e.stopPropagation();
//     try {
//       setIsLoading(true);
//       const fullStudent = await StudentService.getStudentProfile(student.id);
//       console.log('[GlobalStudentDirectory] Full student profile fetched:', fullStudent);
//       setIsEditingStudent(true);
//       setEditingStudent(fullStudent);
//       setShowAddStudent(true);
//     } catch (err) {
//       console.error('[GlobalStudentDirectory] Failed to fetch full profile:', err);
//       // Graceful fallback — wizard opens but with limited data
//       setIsEditingStudent(true);
//       setEditingStudent(student);
//       setShowAddStudent(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * Receives the wizard payload and routes to the correct API.
//    *
//    * Wizard builds payload as UserCreateRequest shape:
//    * {
//    *   name, email, phone, aadhaarNumber, collegeId,
//    *   studentProfile: { rollNumber, branch, ..., educationHistory: [...] }
//    * }
//    *
//    * This matches what the backend @PostMapping("/student") and @PutMapping("/{id}")
//    * both accept as UserCreateRequest.
//    */
//   const handleSaveStudent = async (payload: any) => {
//     try {
//       if (isEditingStudent && editingStudent) {
//         await StudentService.updateStudent({ ...payload, id: editingStudent.id });
//       } else {
//         await StudentService.createStudent(payload);
//       }
//       setShowAddStudent(false);
//       refreshData();
//     } catch (err: any) {
//       const msg = err?.response?.data?.message || err?.message || 'Unknown error';
//       alert(`Failed to save student: ${msg}`);
//     }
//   };

//   /**
//    * Open delete modal for a specific student.
//    * requestDeleteStudent(e, id, name) — name is required for the modal UI.
//    */
//   const requestDeleteStudent = (e: React.MouseEvent, id: string, name: string) => {
//     e.stopPropagation();
//     e.preventDefault();
//     setDeleteTarget({ id, name });
//     setDeleteMode('soft');
//     setShowDeleteModal(true);
//   };

//   const confirmDeleteStudent = async () => {
//     if (!deleteTarget) return;
//     setIsDeleting(true);
//     try {
//       if (deleteMode === 'hard') {
//         await StudentService.hardDeleteStudent(deleteTarget.id);
//       } else {
//         await StudentService.softDeleteStudent(deleteTarget.id);
//       }
//       refreshData();
//     } catch (err: any) {
//       alert('Delete failed: ' + (err?.response?.data?.message || err.message));
//     } finally {
//       setIsDeleting(false);
//       setDeleteTarget(null);
//       setShowDeleteModal(false);
//     }
//   };

//   const handleToggleRestriction = async (e: React.MouseEvent, id: string) => {
//     e.stopPropagation();
//     const student = studentsList.find(s => s.id === id);
//     if (student) {
//       await StudentService.toggleRestriction(id, !student.isRestricted);
//       refreshData();
//     }
//   };

//   const handleDownloadReport = () => {
//     StudentService.exportStudentRegistry(
//       collegeId,
//       { query: studentSearch, year: yearFilter, branch: branchFilter },
//       reportFormat,
//     );
//   };

//   // ─── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <div className="space-y-6 animate-in fade-in">
//       <StudentList
//         students={studentsList}
//         isLoading={isLoading}
//         searchQuery={studentSearch}
//         setSearchQuery={setStudentSearch}
//         yearFilter={yearFilter}
//         setYearFilter={setYearFilter}
//         branchFilter={branchFilter}
//         setBranchFilter={setBranchFilter}
//         collegeBranches={collegeDetails?.branches ?? []}
//         canManage={canManage}
//         isSrotsAdmin={isSrotsAdmin}
//         onEdit={handleOpenEditStudent}
//         onDelete={(e, id) => {
//           // FIX: pass student name as 3rd argument — was missing before
//           const student = studentsList.find(s => s.id === id);
//           requestDeleteStudent(e, id, student?.fullName ?? 'this student');
//         }}
//         onToggleRestriction={handleToggleRestriction}
//         onDownloadReport={handleDownloadReport}
//         onAdd={handleOpenAddStudent}
//         onBulkUpload={() => {}}
//         onDownloadSample={() => StudentService.downloadBulkUploadTemplate()}
//         collegeId={collegeId}
//         onRefresh={refreshData}
//         reportFormat={reportFormat}
//         setReportFormat={setReportFormat}
//         pagination={pagination}
//         onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
//         onPageSizeChange={(size) => setPagination(prev => ({ ...prev, page: 0, size }))}
//       />

//       {/* Student form wizard */}
//       <StudentFormWizard
//         isOpen={showAddStudent}
//         onClose={() => setShowAddStudent(false)}
//         isEditing={isEditingStudent}
//         initialData={editingStudent}
//         collegeDetails={collegeDetails}
//         collegeId={collegeId}
//         onSave={handleSaveStudent}
//       />

//       {/* ── Soft / Hard Delete Modal ──────────────────────────────────────────── */}
//       {showDeleteModal && deleteTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">

//             {/* Header */}
//             <div className="p-6 border-b flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
//                 <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                     d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="font-bold text-gray-900 text-lg">Delete Student</h3>
//                 <p className="text-sm text-gray-500 mt-0.5">{deleteTarget.name}</p>
//               </div>
//             </div>

//             {/* Options */}
//             <div className="p-6 space-y-3">
//               <p className="text-sm font-semibold text-gray-700 mb-2">Choose deletion type:</p>

//               {/* Soft delete option */}
//               <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none
//                 ${deleteMode === 'soft'
//                   ? 'border-amber-400 bg-amber-50'
//                   : 'border-gray-200 hover:border-gray-300 bg-white'}`}
//               >
//                 <input
//                   type="radio" name="deleteMode" value="soft"
//                   checked={deleteMode === 'soft'}
//                   onChange={() => setDeleteMode('soft')}
//                   className="mt-0.5 accent-amber-500"
//                 />
//                 <div>
//                   <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
//                     Soft Delete
//                     <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
//                       Recommended
//                     </span>
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1 leading-relaxed">
//                     Marks the student as deleted. All data is preserved for 90 days and can be restored.
//                     Audit trail is maintained.
//                   </p>
//                 </div>
//               </label>

//               {/* Hard delete option */}
//               <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none
//                 ${deleteMode === 'hard'
//                   ? 'border-red-400 bg-red-50'
//                   : 'border-gray-200 hover:border-gray-300 bg-white'}`}
//               >
//                 <input
//                   type="radio" name="deleteMode" value="hard"
//                   checked={deleteMode === 'hard'}
//                   onChange={() => setDeleteMode('hard')}
//                   className="mt-0.5 accent-red-500"
//                 />
//                 <div>
//                   <p className="font-bold text-sm text-red-700 flex items-center gap-2">
//                     Hard Delete
//                     <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
//                       Irreversible
//                     </span>
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1 leading-relaxed">
//                     Permanently removes all student data — education history, documents, and
//                     application records. This cannot be undone.
//                   </p>
//                 </div>
//               </label>

//               {/* Hard delete warning */}
//               {deleteMode === 'hard' && (
//                 <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                   <p className="text-xs text-red-700 font-medium">
//                     ⚠️ This action is permanent. All associated records will be destroyed immediately.
//                     Only ADMIN and SROTS_DEV roles can perform hard deletes.
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className="px-6 pb-6 flex gap-3 justify-end">
//               <button
//                 onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
//                 disabled={isDeleting}
//                 className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDeleteStudent}
//                 disabled={isDeleting}
//                 className={`px-5 py-2 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2
//                   ${deleteMode === 'hard'
//                     ? 'bg-red-600 hover:bg-red-700'
//                     : 'bg-amber-500 hover:bg-amber-600'}`}
//               >
//                 {isDeleting && (
//                   <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                     <path className="opacity-75" fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                   </svg>
//                 )}
//                 {isDeleting
//                   ? 'Deleting…'
//                   : deleteMode === 'hard'
//                     ? 'Permanently Delete'
//                     : 'Soft Delete'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// import React, { useState, useEffect, useCallback } from 'react';

// import { StudentService } from '../../services/studentService';
// import { CollegeService } from '../../services/collegeService';
// import { Student, College } from '../../types';
// import { StudentList } from './student-directory/StudentList';
// import { StudentFormWizard } from './student-directory/StudentFormWizard';

// /**
//  * GlobalStudentDirectory
//  * Path: src/components/global/GlobalStudentDirectory.tsx
//  *
//  * ─────────────────────────────────────────────────────────────────────────────
//  * CHANGES IN THIS VERSION
//  * ─────────────────────────────────────────────────────────────────────────────
//  *
//  * 1. NEW: `accountFilter` state — 'active' | 'soft_deleted' | 'hard_deleted'
//  *    Passed to StudentService.searchStudentsPaginated and shown in StudentFilters
//  *    as tab pills. Admin/SrotsDev/CPH all get this filter, but CPH only sees
//  *    'active' tab (no soft/hard delete tabs in CPH portal).
//  *
//  * 2. NEW: `isCphView` prop — when true:
//  *    - No Add Student button
//  *    - No Bulk Upload button
//  *    - No Template download button
//  *    - No soft/hard delete filter tabs
//  *    - No Edit or Delete action buttons
//  *    - "View Details" button added at end of each row (read-only wizard)
//  *
//  * 3. NEW: `showViewDetails` state + `handleOpenViewStudent` handler — opens
//  *    StudentFormWizard in read-only mode (isEditing=false, readOnly=true).
//  *
//  * 4. `accountFilter` is reset to 'active' whenever search/year/branch changes
//  *    to avoid confusing empty state when switching tabs.
//  * ─────────────────────────────────────────────────────────────────────────────
//  */

// export type AccountFilter = 'active' | 'soft_deleted' | 'hard_deleted';

// interface GlobalStudentDirectoryProps {
//   collegeId: string;
//   isSrotsAdmin: boolean;
//   canManage?: boolean;
//   isCphView?: boolean;   // NEW — true when rendered inside CPH Staff Portal
//   onRefresh?: () => void;
// }

// export interface PaginationState {
//   page: number;
//   size: number;
//   total: number;
//   totalPages: number;
// }

// export const GlobalStudentDirectory: React.FC<GlobalStudentDirectoryProps> = ({
//   collegeId,
//   isSrotsAdmin,
//   canManage = true,
//   isCphView = false,
//   onRefresh,
// }) => {
//   const [studentsList,   setStudentsList]   = useState<Student[]>([]);
//   const [studentSearch,  setStudentSearch]  = useState('');
//   const [yearFilter,     setYearFilter]     = useState('All');
//   const [branchFilter,   setBranchFilter]   = useState('All');
//   const [collegeDetails, setCollegeDetails] = useState<College | undefined>(undefined);
//   const [isLoading,      setIsLoading]      = useState(false);

//   // NEW: account status filter
//   const [accountFilter, setAccountFilter] = useState<AccountFilter>('active');

//   const [pagination, setPagination] = useState<PaginationState>({
//     page: 0, size: 20, total: 0, totalPages: 0,
//   });

//   // Wizard state — add/edit
//   const [showAddStudent,   setShowAddStudent]   = useState(false);
//   const [isEditingStudent, setIsEditingStudent] = useState(false);
//   const [editingStudent,   setEditingStudent]   = useState<Student | null>(null);

//   // NEW: view-only details (CPH)
//   const [showViewDetails,  setShowViewDetails]  = useState(false);
//   const [viewingStudent,   setViewingStudent]   = useState<Student | null>(null);

//   // Delete modal state
//   const [deleteTarget,    setDeleteTarget]    = useState<{ id: string; name: string } | null>(null);
//   const [deleteMode,      setDeleteMode]      = useState<'soft' | 'hard'>('soft');
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [isDeleting,      setIsDeleting]      = useState(false);

//   // Report format
//   const [reportFormat, setReportFormat] = useState<'excel' | 'csv'>('excel');

//   // ─── Data fetch ─────────────────────────────────────────────────────────────

//   const refreshData = useCallback(async () => {
//     if (!collegeId) return;
//     setIsLoading(true);
//     try {
//       const result = await StudentService.searchStudentsPaginated(collegeId, {
//         query:         studentSearch,
//         year:          yearFilter,
//         branch:        branchFilter,
//         accountFilter, // NEW
//         page:          pagination.page,
//         size:          pagination.size,
//       });
//       setStudentsList(result.students);
//       setPagination(prev => ({
//         ...prev,
//         total:      result.total,
//         totalPages: result.totalPages,
//       }));

//       if (!collegeDetails) {
//         const college = await CollegeService.getCollegeById(collegeId);
//         setCollegeDetails(college);
//       }

//       onRefresh?.();
//     } catch (err) {
//       console.error('[GlobalStudentDirectory] refreshData failed:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [collegeId, studentSearch, yearFilter, branchFilter, accountFilter, pagination.page, pagination.size]);

//   useEffect(() => {
//     refreshData();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [collegeId, studentSearch, yearFilter, branchFilter, accountFilter, pagination.page, pagination.size]);

//   // Reset to page 0 when filters change
//   useEffect(() => {
//     setPagination(prev => ({ ...prev, page: 0 }));
//   }, [studentSearch, yearFilter, branchFilter, accountFilter]);

//   // ─── Handlers ───────────────────────────────────────────────────────────────

//   const handleOpenAddStudent = () => {
//     setIsEditingStudent(false);
//     setEditingStudent(null);
//     setShowAddStudent(true);
//   };

//   const handleOpenEditStudent = async (e: React.MouseEvent, student: Student) => {
//     e.stopPropagation();
//     try {
//       setIsLoading(true);
//       const fullStudent = await StudentService.getStudentProfile(student.id);
//       setIsEditingStudent(true);
//       setEditingStudent(fullStudent);
//       setShowAddStudent(true);
//     } catch (err) {
//       console.error('[GlobalStudentDirectory] Failed to fetch full profile:', err);
//       setIsEditingStudent(true);
//       setEditingStudent(student);
//       setShowAddStudent(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * NEW: Open the wizard in read-only / view mode (CPH portal).
//    * We reuse the same StudentFormWizard but pass readOnly=true so no
//    * edit controls are shown — just the populated form fields.
//    */
//   const handleOpenViewStudent = async (e: React.MouseEvent, student: Student) => {
//     e.stopPropagation();
//     try {
//       setIsLoading(true);
//       const fullStudent = await StudentService.getStudentProfile(student.id);
//       setViewingStudent(fullStudent);
//       setShowViewDetails(true);
//     } catch (err) {
//       console.error('[GlobalStudentDirectory] Failed to fetch student for view:', err);
//       setViewingStudent(student);
//       setShowViewDetails(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSaveStudent = async (payload: any) => {
//     try {
//       if (isEditingStudent && editingStudent) {
//         await StudentService.updateStudent({ ...payload, id: editingStudent.id });
//       } else {
//         await StudentService.createStudent(payload);
//       }
//       setShowAddStudent(false);
//       refreshData();
//     } catch (err: any) {
//       const msg = err?.response?.data?.message || err?.message || 'Unknown error';
//       alert(`Failed to save student: ${msg}`);
//     }
//   };

//   const requestDeleteStudent = (e: React.MouseEvent, id: string, name: string) => {
//     e.stopPropagation();
//     e.preventDefault();
//     setDeleteTarget({ id, name });
//     setDeleteMode('soft');
//     setShowDeleteModal(true);
//   };

//   const confirmDeleteStudent = async () => {
//     if (!deleteTarget) return;
//     setIsDeleting(true);
//     try {
//       if (deleteMode === 'hard') {
//         await StudentService.hardDeleteStudent(deleteTarget.id);
//       } else {
//         await StudentService.softDeleteStudent(deleteTarget.id);
//       }
//       refreshData();
//     } catch (err: any) {
//       alert('Delete failed: ' + (err?.response?.data?.message || err.message));
//     } finally {
//       setIsDeleting(false);
//       setDeleteTarget(null);
//       setShowDeleteModal(false);
//     }
//   };

//   const handleToggleRestriction = async (e: React.MouseEvent, id: string) => {
//     e.stopPropagation();
//     const student = studentsList.find(s => s.id === id);
//     if (student) {
//       await StudentService.toggleRestriction(id, !student.isRestricted);
//       refreshData();
//     }
//   };

//   const handleDownloadReport = () => {
//     StudentService.exportStudentRegistry(
//       collegeId,
//       { query: studentSearch, year: yearFilter, branch: branchFilter },
//       reportFormat,
//     );
//   };

//   // ─── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <div className="space-y-6 animate-in fade-in">
//       <StudentList
//         students={studentsList}
//         isLoading={isLoading}
//         searchQuery={studentSearch}
//         setSearchQuery={setStudentSearch}
//         yearFilter={yearFilter}
//         setYearFilter={setYearFilter}
//         branchFilter={branchFilter}
//         setBranchFilter={setBranchFilter}
//         collegeBranches={collegeDetails?.branches ?? []}
//         canManage={canManage && !isCphView}
//         isSrotsAdmin={isSrotsAdmin}
//         isCphView={isCphView}
//         accountFilter={accountFilter}
//         setAccountFilter={setAccountFilter}
//         onEdit={handleOpenEditStudent}
//         onViewDetails={handleOpenViewStudent}
//         onDelete={(e, id) => {
//           const student = studentsList.find(s => s.id === id);
//           requestDeleteStudent(e, id, student?.fullName ?? 'this student');
//         }}
//         onToggleRestriction={handleToggleRestriction}
//         onDownloadReport={handleDownloadReport}
//         onAdd={handleOpenAddStudent}
//         onBulkUpload={() => {}}
//         onDownloadSample={() => StudentService.downloadBulkUploadTemplate()}
//         collegeId={collegeId}
//         onRefresh={refreshData}
//         reportFormat={reportFormat}
//         setReportFormat={setReportFormat}
//         pagination={pagination}
//         onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
//         onPageSizeChange={(size) => setPagination(prev => ({ ...prev, page: 0, size }))}
//       />

//       {/* Student form wizard — add/edit (Admin / SrotsDev / CPH-manage) */}
//       <StudentFormWizard
//         isOpen={showAddStudent}
//         onClose={() => setShowAddStudent(false)}
//         isEditing={isEditingStudent}
//         readOnly={false}
//         initialData={editingStudent}
//         collegeDetails={collegeDetails}
//         collegeId={collegeId}
//         onSave={handleSaveStudent}
//       />

//       {/* Student form wizard — view-only (CPH portal) */}
//       <StudentFormWizard
//         isOpen={showViewDetails}
//         onClose={() => { setShowViewDetails(false); setViewingStudent(null); }}
//         isEditing={false}
//         readOnly={true}
//         initialData={viewingStudent}
//         collegeDetails={collegeDetails}
//         collegeId={collegeId}
//         onSave={() => {}}
//       />

//       {/* ── Soft / Hard Delete Modal ──────────────────────────────────────────── */}
//       {showDeleteModal && deleteTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">

//             {/* Header */}
//             <div className="p-6 border-b flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
//                 <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                     d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="font-bold text-gray-900 text-lg">Delete Student</h3>
//                 <p className="text-sm text-gray-500 mt-0.5">{deleteTarget.name}</p>
//               </div>
//             </div>

//             {/* Options */}
//             <div className="p-6 space-y-3">
//               <p className="text-sm font-semibold text-gray-700 mb-2">Choose deletion type:</p>

//               {/* Soft delete option */}
//               <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none
//                 ${deleteMode === 'soft'
//                   ? 'border-amber-400 bg-amber-50'
//                   : 'border-gray-200 hover:border-gray-300 bg-white'}`}
//               >
//                 <input
//                   type="radio" name="deleteMode" value="soft"
//                   checked={deleteMode === 'soft'}
//                   onChange={() => setDeleteMode('soft')}
//                   className="mt-0.5 accent-amber-500"
//                 />
//                 <div>
//                   <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
//                     Soft Delete
//                     <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
//                       Recommended
//                     </span>
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1 leading-relaxed">
//                     Marks the student as deleted. All data is preserved for 90 days and can be restored.
//                     Audit trail is maintained.
//                   </p>
//                 </div>
//               </label>

//               {/* Hard delete option */}
//               <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none
//                 ${deleteMode === 'hard'
//                   ? 'border-red-400 bg-red-50'
//                   : 'border-gray-200 hover:border-gray-300 bg-white'}`}
//               >
//                 <input
//                   type="radio" name="deleteMode" value="hard"
//                   checked={deleteMode === 'hard'}
//                   onChange={() => setDeleteMode('hard')}
//                   className="mt-0.5 accent-red-500"
//                 />
//                 <div>
//                   <p className="font-bold text-sm text-red-700 flex items-center gap-2">
//                     Hard Delete
//                     <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
//                       Irreversible
//                     </span>
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1 leading-relaxed">
//                     Permanently removes all student data — education history, documents, and
//                     application records. This cannot be undone.
//                   </p>
//                 </div>
//               </label>

//               {/* Hard delete warning */}
//               {deleteMode === 'hard' && (
//                 <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                   <p className="text-xs text-red-700 font-medium">
//                     ⚠️ This action is permanent. All associated records will be destroyed immediately.
//                     Only ADMIN and SROTS_DEV roles can perform hard deletes.
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className="px-6 pb-6 flex gap-3 justify-end">
//               <button
//                 onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
//                 disabled={isDeleting}
//                 className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDeleteStudent}
//                 disabled={isDeleting}
//                 className={`px-5 py-2 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2
//                   ${deleteMode === 'hard'
//                     ? 'bg-red-600 hover:bg-red-700'
//                     : 'bg-amber-500 hover:bg-amber-600'}`}
//               >
//                 {isDeleting && (
//                   <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                     <path className="opacity-75" fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                   </svg>
//                 )}
//                 {isDeleting
//                   ? 'Deleting...'
//                   : deleteMode === 'hard'
//                     ? 'Permanently Delete'
//                     : 'Soft Delete'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

import React, { useState, useEffect, useCallback } from 'react';

import { StudentService } from '../../services/studentService';
import { CollegeService } from '../../services/collegeService';
import { Student, College } from '../../types';
import { StudentList } from './student-directory/StudentList';
import { StudentFormWizard } from './student-directory/StudentFormWizard';

/**
 * GlobalStudentDirectory
 * Path: src/components/global/GlobalStudentDirectory.tsx
 *
 * ADDED in this version:
 *   - resendTarget / isSending state
 *   - ResendConfirmModal (identical pattern to ManageTeam)
 *   - handleOpenResend  — opens the modal for a given student
 *   - handleResendCredentials — calls CollegeService.resendCredentials(userId)
 *     (same endpoint used for CPH / STAFF: POST /accounts/{userId}/resend-credentials)
 *   - onResendCredentials prop passed down to StudentList → StudentTable
 *
 * Resend is shown for ALL admin/manage views but NOT in isCphView
 * (CPH portal should not resend student credentials).
 */

export type AccountFilter = 'active' | 'soft_deleted' | 'hard_deleted';

interface GlobalStudentDirectoryProps {
  collegeId: string;
  isSrotsAdmin: boolean;
  canManage?: boolean;
  isCphView?: boolean;
  onRefresh?: () => void;
}

export interface PaginationState {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// ── Resend Credentials Confirmation Modal ─────────────────────────────────────

const ResendConfirmModal: React.FC<{
  student: Student | null;
  onClose: () => void;
  onConfirm: () => void;
  sending: boolean;
}> = ({ student, onClose, onConfirm, sending }) => {
  if (!student) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 p-6 space-y-4">
        <div>
          <h3 className="font-bold text-gray-900">Resend Credentials?</h3>
          <p className="text-sm text-gray-500 mt-1">
            New login credentials will be emailed to{' '}
            <span className="font-semibold text-gray-800">{student.fullName}</span> at{' '}
            <span className="font-mono text-xs text-indigo-600">{student.email}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg font-semibold text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={sending}
            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Credentials'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const GlobalStudentDirectory: React.FC<GlobalStudentDirectoryProps> = ({
  collegeId,
  isSrotsAdmin,
  canManage = true,
  isCphView = false,
  onRefresh,
}) => {
  const [studentsList,   setStudentsList]   = useState<Student[]>([]);
  const [studentSearch,  setStudentSearch]  = useState('');
  const [yearFilter,     setYearFilter]     = useState('All');
  const [branchFilter,   setBranchFilter]   = useState('All');
  const [collegeDetails, setCollegeDetails] = useState<College | undefined>(undefined);
  const [isLoading,      setIsLoading]      = useState(false);

  const [accountFilter, setAccountFilter] = useState<AccountFilter>('active');

  const [pagination, setPagination] = useState<PaginationState>({
    page: 0, size: 20, total: 0, totalPages: 0,
  });

  // Wizard — add / edit
  const [showAddStudent,   setShowAddStudent]   = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editingStudent,   setEditingStudent]   = useState<Student | null>(null);

  // Wizard — view-only (CPH portal)
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [viewingStudent,  setViewingStudent]  = useState<Student | null>(null);

  // Delete modal
  const [deleteTarget,    setDeleteTarget]    = useState<{ id: string; name: string } | null>(null);
  const [deleteMode,      setDeleteMode]      = useState<'soft' | 'hard'>('soft');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting,      setIsDeleting]      = useState(false);

  // ── Resend credentials ──────────────────────────────────────────────────────
  const [resendTarget, setResendTarget] = useState<Student | null>(null);
  const [isSending,    setIsSending]    = useState(false);

  // Report format
  const [reportFormat, setReportFormat] = useState<'excel' | 'csv'>('excel');

  // ─── Data fetch ─────────────────────────────────────────────────────────────

  const refreshData = useCallback(async () => {
    if (!collegeId) return;
    setIsLoading(true);
    try {
      const result = await StudentService.searchStudentsPaginated(collegeId, {
        query:         studentSearch,
        year:          yearFilter,
        branch:        branchFilter,
        accountFilter,
        page:          pagination.page,
        size:          pagination.size,
      });
      setStudentsList(result.students);
      setPagination(prev => ({
        ...prev,
        total:      result.total,
        totalPages: result.totalPages,
      }));

      if (!collegeDetails) {
        const college = await CollegeService.getCollegeById(collegeId);
        setCollegeDetails(college);
      }

      onRefresh?.();
    } catch (err) {
      console.error('[GlobalStudentDirectory] refreshData failed:', err);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeId, studentSearch, yearFilter, branchFilter, accountFilter, pagination.page, pagination.size]);

  useEffect(() => {
    refreshData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeId, studentSearch, yearFilter, branchFilter, accountFilter, pagination.page, pagination.size]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 0 }));
  }, [studentSearch, yearFilter, branchFilter, accountFilter]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleOpenAddStudent = () => {
    setIsEditingStudent(false);
    setEditingStudent(null);
    setShowAddStudent(true);
  };

  const handleOpenEditStudent = async (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      const fullStudent = await StudentService.getStudentProfile(student.id);
      setIsEditingStudent(true);
      setEditingStudent(fullStudent);
      setShowAddStudent(true);
    } catch (err) {
      console.error('[GlobalStudentDirectory] Failed to fetch full profile:', err);
      setIsEditingStudent(true);
      setEditingStudent(student);
      setShowAddStudent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenViewStudent = async (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      const fullStudent = await StudentService.getStudentProfile(student.id);
      setViewingStudent(fullStudent);
      setShowViewDetails(true);
    } catch (err) {
      console.error('[GlobalStudentDirectory] Failed to fetch student for view:', err);
      setViewingStudent(student);
      setShowViewDetails(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStudent = async (payload: any) => {
    try {
      if (isEditingStudent && editingStudent) {
        await StudentService.updateStudent({ ...payload, id: editingStudent.id });
      } else {
        await StudentService.createStudent(payload);
      }
      setShowAddStudent(false);
      refreshData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      alert(`Failed to save student: ${msg}`);
    }
  };

  const requestDeleteStudent = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteTarget({ id, name });
    setDeleteMode('soft');
    setShowDeleteModal(true);
  };

  const confirmDeleteStudent = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteMode === 'hard') {
        await StudentService.hardDeleteStudent(deleteTarget.id);
      } else {
        await StudentService.softDeleteStudent(deleteTarget.id);
      }
      refreshData();
    } catch (err: any) {
      alert('Delete failed: ' + (err?.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
      setShowDeleteModal(false);
    }
  };

  const handleToggleRestriction = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const student = studentsList.find(s => s.id === id);
    if (student) {
      await StudentService.toggleRestriction(id, !student.isRestricted);
      refreshData();
    }
  };

  // ── Resend credentials ──────────────────────────────────────────────────────

  /**
   * Opens the ResendConfirmModal for a student row.
   * Wired to the Send icon button in StudentTable via onResendCredentials prop.
   * Not exposed in isCphView — CPH should not resend student credentials.
   */
  const handleOpenResend = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    setResendTarget(student);
  };

  /**
   * Confirmed — calls the same endpoint used for CPH / STAFF resend:
   *   POST /accounts/{userId}/resend-credentials
   */
  const handleResendCredentials = async () => {
    if (!resendTarget) return;
    setIsSending(true);
    try {
      await CollegeService.resendCredentials(resendTarget.id);
      alert(`Credentials sent to ${resendTarget.email}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to resend credentials.');
    } finally {
      setIsSending(false);
      setResendTarget(null);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────

  const handleDownloadReport = () => {
    StudentService.exportStudentRegistry(
      collegeId,
      { query: studentSearch, year: yearFilter, branch: branchFilter },
      reportFormat,
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in">
      <StudentList
        students={studentsList}
        isLoading={isLoading}
        searchQuery={studentSearch}
        setSearchQuery={setStudentSearch}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
        collegeBranches={collegeDetails?.branches ?? []}
        canManage={canManage && !isCphView}
        isSrotsAdmin={isSrotsAdmin}
        isCphView={isCphView}
        accountFilter={accountFilter}
        setAccountFilter={setAccountFilter}
        onEdit={handleOpenEditStudent}
        onViewDetails={handleOpenViewStudent}
        onDelete={(e, id) => {
          const student = studentsList.find(s => s.id === id);
          requestDeleteStudent(e, id, student?.fullName ?? 'this student');
        }}
        onToggleRestriction={handleToggleRestriction}
        onResendCredentials={handleOpenResend}
        onDownloadReport={handleDownloadReport}
        onAdd={handleOpenAddStudent}
        onBulkUpload={() => {}}
        onDownloadSample={() => StudentService.downloadBulkUploadTemplate()}
        collegeId={collegeId}
        onRefresh={refreshData}
        reportFormat={reportFormat}
        setReportFormat={setReportFormat}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, page: 0, size }))}
      />

      {/* Student form wizard — add / edit */}
      <StudentFormWizard
        isOpen={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        isEditing={isEditingStudent}
        readOnly={false}
        initialData={editingStudent}
        collegeDetails={collegeDetails}
        collegeId={collegeId}
        onSave={handleSaveStudent}
      />

      {/* Student form wizard — view-only (CPH portal) */}
      <StudentFormWizard
        isOpen={showViewDetails}
        onClose={() => { setShowViewDetails(false); setViewingStudent(null); }}
        isEditing={false}
        readOnly={true}
        initialData={viewingStudent}
        collegeDetails={collegeDetails}
        collegeId={collegeId}
        onSave={() => {}}
      />

      {/* ── Resend Credentials Modal ──────────────────────────────────────────── */}
      <ResendConfirmModal
        student={resendTarget}
        onClose={() => setResendTarget(null)}
        onConfirm={handleResendCredentials}
        sending={isSending}
      />

      {/* ── Soft / Hard Delete Modal ──────────────────────────────────────────── */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">

            <div className="p-6 border-b flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Delete Student</h3>
                <p className="text-sm text-gray-500 mt-0.5">{deleteTarget.name}</p>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Choose deletion type:</p>

              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none
                ${deleteMode === 'soft' ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                <input type="radio" name="deleteMode" value="soft"
                  checked={deleteMode === 'soft'} onChange={() => setDeleteMode('soft')}
                  className="mt-0.5 accent-amber-500" />
                <div>
                  <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    Soft Delete
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Recommended</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Marks the student as deleted. All data is preserved for 90 days and can be restored. Audit trail is maintained.
                  </p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none
                ${deleteMode === 'hard' ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                <input type="radio" name="deleteMode" value="hard"
                  checked={deleteMode === 'hard'} onChange={() => setDeleteMode('hard')}
                  className="mt-0.5 accent-red-500" />
                <div>
                  <p className="font-bold text-sm text-red-700 flex items-center gap-2">
                    Hard Delete
                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Irreversible</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Permanently removes all student data — education history, documents, and application records. This cannot be undone.
                  </p>
                </div>
              </label>

              {deleteMode === 'hard' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700 font-medium">
                    This action is permanent. All associated records will be destroyed immediately.
                    Only ADMIN and SROTS_DEV roles can perform hard deletes.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                disabled={isDeleting}
                className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStudent}
                disabled={isDeleting}
                className={`px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-60 flex items-center gap-2
                  ${deleteMode === 'hard' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}
              >
                {isDeleting && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {isDeleting ? 'Deleting...' : deleteMode === 'hard' ? 'Permanently Delete' : 'Soft Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};