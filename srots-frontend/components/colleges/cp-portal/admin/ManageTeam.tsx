// import React, { useState, useEffect, useRef } from 'react';
// import { User, AddressFormData } from '../../../../types';
// import { CollegeService } from '../../../../services/collegeService';
// import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
// import { TeamHeader } from './team/TeamHeader';
// import { TeamTable } from './team/TeamTable';
// import { TeamMemberModal } from './team/TeamMemberModal';
// interface ManageTeamProps {
//   user: User;
// }
// export const ManageTeam: React.FC<ManageTeamProps> = ({ user }) => {
//   const [subTPOs, setSubTPOs] = useState<User[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingMember, setEditingMember] = useState<User | null>(null);
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   useEffect(() => { refreshList(); }, [user]);
//   const refreshList = async () => {
//       if (user?.collegeId) {
//           const list = await CollegeService.getCPStaff(user.collegeId);
//           setSubTPOs([...list]);
//       }
//   };
//   const handleSaveSubTPO = async (data: { id: string, name: string, email: string, phone: string, department: string, aadhaar: string, address: AddressFormData }) => {
//       if (isEditing && editingMember) {
//           const updatedUser: User = {
//               ...editingMember, fullName: data.name, email: data.email, phone: data.phone, department: data.department,
//               aadhaarNumber: data.aadhaar, id: data.id,
//           };
//           await CollegeService.updateCPStaff(updatedUser, data.address);
//       } else {
//           await CollegeService.createCPStaff({
//               ...data,
//               collegeId: user.collegeId || '',
//               parentId: user.id
//           });
//       }
//       refreshList(); setShowModal(false); setEditingMember(null); setIsEditing(false);
//   };
//   const handleOpenEdit = (staff: User) => { setEditingMember(staff); setIsEditing(true); setShowModal(true); };
//   const handleOpenCreate = () => { setEditingMember(null); setIsEditing(false); setShowModal(true); };
//   const handleToggleSubTPOAccess = async (id: string) => { await CollegeService.toggleCPStaffAccess(id); refreshList(); };
//   const requestDelete = (id: string) => { setDeleteId(id); };
//   const confirmDelete = async () => { if (deleteId) { await CollegeService.deleteCPStaff(deleteId); refreshList(); setDeleteId(null); } };

//   const handleDownloadSample = async () => {
//       try {
//           await CollegeService.downloadCPTeamTemplate();
//       } catch (err: any) {
//           console.error("Template download failed", err);
//           alert("Could not download template. Please check if you are logged in.");
//       }
//   };

//   const handleBulkUploadSubTPO = async (e: React.ChangeEvent<HTMLInputElement>) => {
//       if (!e.target.files || !e.target.files[0]) return;
//       try {
//           // Simplified call
//           await CollegeService.bulkUploadStaff(e.target.files[0], user.collegeId || '');
//           refreshList();
//           alert(`Bulk Upload finished. Please check the downloaded report for any errors.`);
//       } catch (err: any) {
//           console.error(err);
//           alert("Error processing file. Please ensure the file matches the template.");
//       }
//       e.target.value = '';
//   };
//   return (
//     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
//         <TeamHeader onDownloadTemplate={handleDownloadSample} onBulkUpload={handleBulkUploadSubTPO} onAddMember={handleOpenCreate} fileInputRef={fileInputRef}/>
//         <TeamTable staffList={subTPOs} onEdit={handleOpenEdit} onToggleStatus={handleToggleSubTPOAccess} onDelete={requestDelete}/>
//         <TeamMemberModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSaveSubTPO} isEditing={isEditing} initialData={editingMember}/>
//         <DeleteConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Delete Account?" message="Are you sure you want to delete this CP Staff account?"/>
//     </div>
//   );
// };


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, AddressFormData } from '../../../../types';
import { CollegeService } from '../../../../services/collegeService';
import { TeamHeader } from './team/TeamHeader';
import { TeamList, SoftHardDeleteModal } from './team/TeamList';
import { TeamMemberModal } from './team/TeamMemberModal';
import { BulkUploadResultModal } from '../../../common/BulkUploadResultModal';
import { Users, Archive } from 'lucide-react';

/**
 * Component: ManageTeam
 * Path: components/colleges/cp-portal/admin/ManageTeam.tsx
 *
 * CP Portal — lets a college placement head manage the full team:
 *   - CPH (College Placement Head) accounts  — displayed read-only, no action buttons
 *   - STAFF (Sub-TPO / placement staff)      — full CRUD + resend + soft/hard delete
 *
 * Architecture:
 *   ManageTeam              ← orchestrates state + API calls
 *   ├── TeamHeader          ← search · template · Bulk CPH · Bulk Staff · Add Member
 *   ├── TeamList            ← table with Role column; actions only for STAFF rows
 *   │   └── SoftHardDeleteModal
 *   ├── TeamMemberModal     ← create / edit form with username availability check
 *   └── BulkUploadResultModal
 *
 * Endpoints:
 *   GET  /accounts/college/{id}/role/CPH   + /role/STAFF  (via getCPUsers)
 *   POST /accounts/cph?role=CPH|STAFF
 *   PUT  /accounts/{userId}
 *   DELETE /accounts/{userId}?permanent=false|true
 *   POST   /accounts/{userId}/restore
 *   POST   /accounts/{userId}/resend-credentials
 *   POST   /admin/bulk/upload-staff?roleToAssign=CPH|STAFF&collegeId=...
 */

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = 'active' | 'soft_deleted';

interface ManageTeamProps {
    user: User;
}

// ── Resend confirmation mini-modal ────────────────────────────────────────────

const ResendConfirmModal: React.FC<{
    user: User | null;
    onClose: () => void;
    onConfirm: () => void;
    sending: boolean;
}> = ({ user, onClose, onConfirm, sending }) => {
    if (!user) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 p-6 space-y-4">
                <div>
                    <h3 className="font-bold text-gray-900">Resend Credentials?</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        New login credentials will be emailed to{' '}
                        <span className="font-semibold text-gray-800">{user.fullName}</span> at{' '}
                        <span className="font-mono text-xs text-indigo-600">{user.email}</span>.
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
                        {sending ? 'Sending…' : 'Send Credentials'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────

export const ManageTeam: React.FC<ManageTeamProps> = ({ user }) => {
    const collegeId   = (user as any).collegeId ?? (user as any).college?.id ?? '';
    const collegeCode = (user as any).college?.code ?? (user as any).collegeCode ?? '';

    // ── List state ────────────────────────────────────────────────────────────
    const [teamList,      setTeamList]      = useState<User[]>([]);
    const [statusFilter,  setStatusFilter]  = useState<StatusFilter>('active');
    const [searchQuery,   setSearchQuery]   = useState('');
    const [debouncedQ,    setDebouncedQ]    = useState('');
    const [loading,       setLoading]       = useState(false);
    const [error,         setError]         = useState<string | null>(null);

    // Tab counts (active / soft-deleted across both roles)
    const [activeCount,       setActiveCount]       = useState(0);
    const [softDeletedCount,  setSoftDeletedCount]  = useState(0);

    // Form modal
    const [showModal,     setShowModal]     = useState(false);
    const [isEditing,     setIsEditing]     = useState(false);
    const [editingMember, setEditingMember] = useState<User | null>(null);

    // Delete
    const [deleteTarget,  setDeleteTarget]  = useState<User | null>(null);
    const [isDeleting,    setIsDeleting]    = useState(false);

    // Restore
    const [isRestoring,   setIsRestoring]   = useState<string | null>(null);

    // Resend credentials
    const [resendTarget,  setResendTarget]  = useState<User | null>(null);
    const [isSending,     setIsSending]     = useState(false);

    // Bulk upload — two separate refs and loading states for CPH vs STAFF
    const bulkCphRef   = useRef<HTMLInputElement>(null);
    const bulkStaffRef = useRef<HTMLInputElement>(null);
    const [bulkUploading, setBulkUploading] = useState(false);
    const [bulkResult,    setBulkResult]    = useState<{
        success: number; failed: number; errors: string[]; label: string;
    } | null>(null);

    // ── Debounce search ───────────────────────────────────────────────────────

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedQ(searchQuery), 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchQuery]);

    // ── Fetch current tab (CPH + STAFF combined via getCPUsers) ──────────────

    const refreshList = useCallback(async () => {
        if (!collegeId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await CollegeService.getCPUsers(collegeId, debouncedQ, statusFilter);
            setTeamList(data);
        } catch (err: any) {
            console.error('[ManageTeam] refreshList failed:', err);
            setError('Failed to load team members. Please retry.');
        } finally {
            setLoading(false);
        }
    }, [collegeId, debouncedQ, statusFilter]);

    useEffect(() => { refreshList(); }, [refreshList]);

    // ── Fetch tab counts ──────────────────────────────────────────────────────

    const refreshCounts = useCallback(async () => {
        if (!collegeId) return;
        try {
            const [active, deleted] = await Promise.all([
                CollegeService.getCPUsers(collegeId, '', 'active'),
                CollegeService.getCPUsers(collegeId, '', 'soft_deleted'),
            ]);
            setActiveCount(active.length);
            setSoftDeletedCount(deleted.length);
        } catch { /* silent */ }
    }, [collegeId]);

    useEffect(() => { refreshCounts(); }, [refreshCounts]);

    // ── Client-side search fallback ───────────────────────────────────────────

    const displayed = debouncedQ.trim()
        ? teamList.filter(u => {
            const q = debouncedQ.toLowerCase();
            return (
                u.fullName?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                (u as any).username?.toLowerCase().includes(q)
            );
        })
        : teamList;

    // ── Create / Edit ─────────────────────────────────────────────────────────

    const handleSave = async (data: {
        usernameSuffix: string;
        name:           string;
        email:          string;
        phone:          string;
        department:     string;
        aadhaar:        string;
        address:        AddressFormData;
    }) => {
        try {
            if (isEditing && editingMember) {
                const updatedUser: User = {
                    ...editingMember,
                    fullName:      data.name,
                    email:         data.email,
                    phone:         data.phone,
                    department:    data.department,
                    aadhaarNumber: data.aadhaar,
                    ...({ collegeId } as any),
                };
                await CollegeService.updateCPStaff(updatedUser, data.address);
            } else {
                await CollegeService.createCPStaff({
                    username:   data.usernameSuffix
                        ? `${collegeCode}_CPSTAFF_${data.usernameSuffix}`
                        : undefined,
                    name:       data.name,
                    email:      data.email,
                    phone:      data.phone,
                    department: data.department,
                    aadhaar:    data.aadhaar,
                    address:    data.address,
                    collegeId,
                    parentId:   user.id,
                } as any);
            }
            setShowModal(false);
            setEditingMember(null);
            setIsEditing(false);
            refreshList();
            refreshCounts();
        } catch (err: any) {
            alert(err?.response?.data?.message || err?.message || 'Failed to save team member.');
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────

    const handleDelete = async (mode: 'soft' | 'hard') => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            if (mode === 'hard') {
                await CollegeService.hardDeleteCPUser(deleteTarget.id);
            } else {
                await CollegeService.softDeleteCPUser(deleteTarget.id);
            }
            setTeamList(prev => prev.filter(u => u.id !== deleteTarget.id));
            refreshCounts();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Delete failed. Please try again.');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    // ── Restore ───────────────────────────────────────────────────────────────

    const handleRestore = async (member: User) => {
        setIsRestoring(member.id);
        try {
            await CollegeService.restoreCPUser(member.id);
            setTeamList(prev => prev.filter(u => u.id !== member.id));
            refreshCounts();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Restore failed. Please try again.');
        } finally {
            setIsRestoring(null);
        }
    };

    // ── Resend credentials ────────────────────────────────────────────────────

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

    // ── Bulk upload ───────────────────────────────────────────────────────────

    const handleBulkUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        role: 'CPH' | 'STAFF',
    ) => {
        const file = e.target.files?.[0];
        if (!file || !collegeId) return;

        setBulkUploading(true);
        try {
            const result = await CollegeService.bulkCreateCPUsers(collegeId, file, role);
            setBulkResult({ ...result, label: role === 'CPH' ? 'CP Heads' : 'Placement Staff' });
            refreshList();
            refreshCounts();
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Bulk upload failed.';
            setBulkResult({ success: 0, failed: 0, errors: [msg], label: role === 'CPH' ? 'CP Heads' : 'Placement Staff' });
        } finally {
            setBulkUploading(false);
            // Reset both inputs
            if (bulkCphRef.current)   bulkCphRef.current.value   = '';
            if (bulkStaffRef.current) bulkStaffRef.current.value = '';
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">

            {/* Toolbar */}
            <TeamHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onDownloadTemplate={() => CollegeService.downloadCPTeamTemplate()}
                onBulkUploadCph={e => handleBulkUpload(e, 'CPH')}
                onBulkUploadStaff={e => handleBulkUpload(e, 'STAFF')}
                onAddMember={() => { setEditingMember(null); setIsEditing(false); setShowModal(true); }}
                bulkCphRef={bulkCphRef}
                bulkStaffRef={bulkStaffRef}
            />

            {/* Active / Soft Deleted tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {([
                    { value: 'active'       as StatusFilter, label: 'Active',       Icon: Users,   count: activeCount,      accent: 'text-green-600' },
                    { value: 'soft_deleted' as StatusFilter, label: 'Soft Deleted', Icon: Archive, count: softDeletedCount, accent: 'text-amber-600' },
                ] as const).map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => { setStatusFilter(tab.value); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            statusFilter === tab.value
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <tab.Icon size={14} className={statusFilter === tab.value ? tab.accent : ''} />
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            statusFilter === tab.value ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-500'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Bulk uploading indicator */}
            {bulkUploading && (
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-medium">
                    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Uploading accounts… please wait.
                </div>
            )}

            {/* Error banner */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-medium flex items-center justify-between">
                    {error}
                    <button onClick={refreshList} className="ml-4 text-xs font-bold underline hover:no-underline">
                        Retry
                    </button>
                </div>
            )}

            {/* Soft-deleted info banner */}
            {statusFilter === 'soft_deleted' && !loading && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700 font-medium">
                    Soft-deleted accounts are retained for 90 days and can be restored. Hard-delete permanently removes all data.
                </div>
            )}

            {/* Table / loading skeleton */}
            {loading && !bulkUploading ? (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <table className="w-full min-w-[900px]">
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
                                            <div className="space-y-1.5">
                                                <div className="h-3 w-36 bg-gray-200 rounded animate-pulse" />
                                                <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><div className="h-3 w-44 bg-gray-200 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-3 w-28 bg-gray-200 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-5 w-14 bg-gray-200 rounded-full animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-7 w-24 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <TeamList
                    staffList={displayed}
                    statusFilter={statusFilter}
                    onEdit={member => { setEditingMember(member); setIsEditing(true); setShowModal(true); }}
                    onDelete={member => setDeleteTarget(member)}
                    onRestore={handleRestore}
                    onResendCredentials={member => setResendTarget(member)}
                />
            )}

            {/* Add / Edit modal (STAFF only — CPH accounts are read-only here) */}
            <TeamMemberModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingMember(null); setIsEditing(false); }}
                onSave={handleSave}
                isEditing={isEditing}
                initialData={editingMember}
                collegeCode={collegeCode}
            />

            {/* Soft / Hard Delete modal */}
            <SoftHardDeleteModal
                user={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />

            {/* Resend credentials modal */}
            <ResendConfirmModal
                user={resendTarget}
                onClose={() => setResendTarget(null)}
                onConfirm={handleResendCredentials}
                sending={isSending}
            />

            {/* Bulk upload result */}
            {bulkResult && (
                <BulkUploadResultModal
                    isOpen={true}
                    onClose={() => setBulkResult(null)}
                    success={bulkResult.success}
                    failed={bulkResult.failed}
                    errors={bulkResult.errors}
                    entityLabel={bulkResult.label}
                />
            )}
        </div>
    );
};