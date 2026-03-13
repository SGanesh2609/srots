import React, { useState, useEffect, useCallback } from 'react';

import { StudentService } from '../../services/studentService';
import { CollegeService } from '../../services/collegeService';
import { Student, College } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../common/Toast';
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
  const toast = useToast();
  const [studentsList,   setStudentsList]   = useState<Student[]>([]);
  const [studentSearch,  setStudentSearch]  = useState('');
  const debouncedSearch = useDebounce(studentSearch, 350);
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
        query:         debouncedSearch,
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
  }, [collegeId, debouncedSearch, yearFilter, branchFilter, accountFilter, pagination.page, pagination.size]);

  useEffect(() => {
    refreshData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeId, debouncedSearch, yearFilter, branchFilter, accountFilter, pagination.page, pagination.size]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 0 }));
  }, [debouncedSearch, yearFilter, branchFilter, accountFilter]);

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
      toast.error(`Failed to save student: ${msg}`);
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
      toast.error('Delete failed: ' + (err?.response?.data?.message || err.message));
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