import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Role, AddressFormData } from '../../types';
import { CollegeService } from '../../services/collegeService';
import { BulkUploadResultModal } from '../common/BulkUploadResultModal';
import { Users, Archive } from 'lucide-react';
import { CPTeamHeader }       from './cp-team-management/CPTeamHeader';
import { CPTeamTable, isCPH } from './cp-team-management/CPTeamTable';
import { CPTeamFormModal, CPTeamFormData } from './cp-team-management/CPTeamFormModal';
import { SoftHardDeleteModal, ResendConfirmModal } from './cp-team-management/CPTeamSharedModals';

/**
 * Component: CPTeamManagement
 * Path: components/global/CPTeamManagement.tsx
 *
 * Shared orchestrator for CP team management (CPH + STAFF accounts).
 * Follows the same global component pattern as ManagingStudentAccounts.tsx
 * and StudentDirectory.tsx — top-level file, sub-components in ./cp-team-management/
 *
 * mode='admin'  → SROTS Admin / SROTS Dev portal
 *   - Props: collegeId, collegeCode, collegeName, currentUser, onRefresh?
 *   - Can create/edit both CPH and STAFF (role selector in form)
 *   - Toggle access (restrict/unrestrict) visible for all rows
 *
 * mode='cph'    → CPH Portal (College Placement Head)
 *   - Props: user (logged-in CPH)
 *   - Derives collegeId / collegeCode from user object
 *   - CPH rows are read-only ("Admin managed")
 *   - Form is STAFF-only (no role selector)
 */

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = 'active' | 'soft_deleted';

const PAGE_SIZE = 15;

type AdminModeProps = {
    mode:        'admin';
    collegeId:   string;
    collegeCode: string;
    collegeName: string;
    onRefresh?:  () => void;
    currentUser: User;
};

type CphModeProps = {
    mode: 'cph';
    user: User;
};

export type CPTeamManagementProps = AdminModeProps | CphModeProps;

// ── CSV download helper ───────────────────────────────────────────────────────

function downloadCSV(users: User[], filename: string): void {
    const headers = ['Full Name', 'Username', 'Email', 'Phone', 'Department', 'Role', 'Status'];
    const rows = users.map(u => [
        u.fullName     || '',
        (u as any).username || '',
        u.email        || '',
        u.phone        || '',
        u.department   || '',
        isCPH(u) ? 'CP Head' : 'Staff',
        u.isRestricted ? 'Restricted' : 'Active',
    ]);
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

export const CPTeamManagement: React.FC<CPTeamManagementProps> = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const isAdminMode = props.mode === 'admin';

    const collegeId   = isAdminMode
        ? props.collegeId
        : (props.user as any).collegeId ?? (props.user as any).college?.id ?? '';
    const collegeCode = isAdminMode
        ? props.collegeCode
        : (props.user as any).college?.code ?? (props.user as any).collegeCode ?? '';
    const collegeName = isAdminMode ? props.collegeName : undefined;

    // ── List state ────────────────────────────────────────────────────────────
    const [users,         setUsers]         = useState<User[]>([]);
    const [statusFilter,  setStatusFilter]  = useState<StatusFilter>(() =>
        searchParams.get('ttab') === 'soft_deleted' ? 'soft_deleted' : 'active'
    );

    const handleStatusFilter = (f: StatusFilter) => {
        setStatusFilter(f);
        setSearchQuery('');
        setSearchParams(prev => { const p = new URLSearchParams(prev); if (f !== 'active') p.set('ttab', f); else p.delete('ttab'); return p; }, { replace: true });
    };
    const [searchQuery,   setSearchQuery]   = useState('');
    const [debouncedQ,    setDebouncedQ]    = useState('');
    const [loading,       setLoading]       = useState(false);
    const [error,         setError]         = useState<string | null>(null);
    const [activeCount,   setActiveCount]   = useState(0);
    const [softDelCount,  setSoftDelCount]  = useState(0);

    // Pagination
    const [page, setPage] = useState(1);

    // Form modal
    const [showModal,  setShowModal]  = useState(false);
    const [editUser,   setEditUser]   = useState<User | null>(null);

    // Delete
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [isDeleting,   setIsDeleting]   = useState(false);

    // Restore
    const [isRestoring, setIsRestoring] = useState<string | null>(null);

    // Resend credentials
    const [resendTarget, setResendTarget] = useState<User | null>(null);
    const [isSending,    setIsSending]    = useState(false);

    // Bulk upload
    const [bulkUploading, setBulkUploading] = useState(false);
    const [bulkRole,      setBulkRole]      = useState<'CPH' | 'STAFF'>('STAFF');
    const [bulkResult,    setBulkResult]    = useState<{
        success: number; failed: number; errors: string[];
    } | null>(null);

    // Download
    const [downloading, setDownloading] = useState<'CPH' | 'STAFF' | null>(null);

    // ── Debounce search ───────────────────────────────────────────────────────
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedQ(searchQuery);
            setPage(1);
        }, 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchQuery]);

    // Reset to page 1 when tab changes
    useEffect(() => { setPage(1); }, [statusFilter]);

    // ── Fetch current tab ─────────────────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        if (!collegeId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await CollegeService.getCPUsers(collegeId, debouncedQ, statusFilter);
            setUsers(data);
        } catch (err: any) {
            console.error('[CPTeamManagement] fetch failed', err);
            setError('Failed to load CP users. Please retry.');
        } finally {
            setLoading(false);
        }
    }, [collegeId, debouncedQ, statusFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // ── Fetch tab counts ──────────────────────────────────────────────────────
    const fetchCounts = useCallback(async () => {
        if (!collegeId) return;
        try {
            const [active, deleted] = await Promise.all([
                CollegeService.getCPUsers(collegeId, '', 'active'),
                CollegeService.getCPUsers(collegeId, '', 'soft_deleted'),
            ]);
            setActiveCount(active.length);
            setSoftDelCount(deleted.length);
        } catch { /* counts are decorative */ }
    }, [collegeId]);

    useEffect(() => { fetchCounts(); }, [fetchCounts]);

    // ── Client-side search + pagination ───────────────────────────────────────
    const filtered = debouncedQ.trim()
        ? users.filter(u => {
            const q = debouncedQ.toLowerCase();
            return (
                u.fullName?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                (u as any).username?.toLowerCase().includes(q)
            );
        })
        : users;

    const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage    = Math.min(page, totalPages);
    const startIdx    = (safePage - 1) * PAGE_SIZE;
    const paginated   = filtered.slice(startIdx, startIdx + PAGE_SIZE);

    // ── Download CPH / STAFF as CSV ───────────────────────────────────────────
    const handleDownload = async (role: 'CPH' | 'STAFF') => {
        setDownloading(role);
        try {
            // Fetch all active users for export (ignore search / pagination)
            const all = await CollegeService.getCPUsers(collegeId, '', 'active');
            const filtered = all.filter(u => role === 'CPH' ? isCPH(u) : !isCPH(u));
            const label    = role === 'CPH' ? 'CP_Heads' : 'Placement_Staff';
            const college  = collegeCode || 'College';
            downloadCSV(filtered, `${college}_${label}_${new Date().toISOString().slice(0, 10)}.csv`);
        } catch (err: any) {
            alert('Download failed. Please try again.');
        } finally {
            setDownloading(null);
        }
    };

    // ── Save (create / edit) ──────────────────────────────────────────────────
    const handleSave = async (data: CPTeamFormData, userId?: string) => {
        try {
            if (isAdminMode) {
                const payload: Partial<User> & Record<string, any> = {
                    fullName:      data.fullName,
                    email:         data.email,
                    phone:         data.phone,
                    department:    data.department,
                    aadhaarNumber: data.aadhaarNumber,
                    role:          data.role,
                    isCollegeHead: data.role === Role.CPH,
                    address:       data.address,
                    username:      data.usernameSuffix || undefined,
                };
                if (userId) {
                    await CollegeService.updateCPUser(collegeId, userId, payload);
                } else {
                    await CollegeService.createCPUser(collegeId, payload);
                }
                (props as AdminModeProps).onRefresh?.();
            } else {
                if (userId && editUser) {
                    const updatedUser: User = {
                        ...editUser,
                        fullName:      data.fullName,
                        email:         data.email,
                        phone:         data.phone,
                        department:    data.department,
                        aadhaarNumber: data.aadhaarNumber,
                        ...({ collegeId } as any),
                    };
                    await CollegeService.updateCPStaff(updatedUser, data.address as AddressFormData);
                } else {
                    await CollegeService.createCPStaff({
                        username:   data.usernameSuffix
                            ? `${collegeCode}_CPSTAFF_${data.usernameSuffix}`
                            : undefined,
                        name:       data.fullName,
                        email:      data.email,
                        phone:      data.phone,
                        department: data.department,
                        aadhaar:    data.aadhaarNumber,
                        address:    data.address,
                        collegeId,
                        parentId:   (props as CphModeProps).user.id,
                    } as any);
                }
            }
            setShowModal(false);
            setEditUser(null);
            fetchUsers();
            fetchCounts();
        } catch (err: any) {
            alert(err?.response?.data?.message || `Failed to ${userId ? 'update' : 'create'} user.`);
        }
    };

    // ── Toggle access (admin mode only) ───────────────────────────────────────
    const handleToggleAccess = async (user: User) => {
        try {
            await CollegeService.toggleCPStaffAccess(collegeId, user.id, !user.isRestricted);
            setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, isRestricted: !u.isRestricted } : u
            ));
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Failed to toggle access.');
            fetchUsers();
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
            setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
            fetchCounts();
            if (isAdminMode) (props as AdminModeProps).onRefresh?.();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Delete failed. Please try again.');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    // ── Restore ───────────────────────────────────────────────────────────────
    const handleRestore = async (user: User) => {
        setIsRestoring(user.id);
        try {
            await CollegeService.restoreCPUser(user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
            fetchCounts();
            if (isAdminMode) (props as AdminModeProps).onRefresh?.();
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
    const handleBulkUpload = async (file: File, role: 'CPH' | 'STAFF') => {
        setBulkRole(role);
        setBulkUploading(true);
        try {
            const result = await CollegeService.bulkCreateCPUsers(collegeId, file, role);
            setBulkResult(result);
            fetchUsers();
            fetchCounts();
            if (isAdminMode) (props as AdminModeProps).onRefresh?.();
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Bulk upload failed.';
            setBulkResult({ success: 0, failed: 0, errors: [msg] });
        } finally {
            setBulkUploading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    const headerTitle = isAdminMode ? 'CP Admins & Staff' : 'Placement Team';
    const headerDesc  = isAdminMode
        ? 'Manage placement heads (CPH) and staff members for this college.'
        : 'Manage CP Heads and placement staff for your college.';

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">

            {/* Toolbar */}
            <CPTeamHeader
                title={headerTitle}
                description={headerDesc}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddUser={() => { setEditUser(null); setShowModal(true); }}
                onBulkUpload={handleBulkUpload}
                onDownloadTemplate={() => CollegeService.downloadCPTeamTemplate()}
                onDownloadList={handleDownload}
                downloading={downloading}
            />

            {/* Active / Soft Deleted tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {([
                    { value: 'active'       as StatusFilter, label: 'Active',       Icon: Users,   count: activeCount,  accent: 'text-green-600' },
                    { value: 'soft_deleted' as StatusFilter, label: 'Soft Deleted', Icon: Archive, count: softDelCount, accent: 'text-amber-600' },
                ] as const).map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => handleStatusFilter(tab.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                    Uploading {bulkRole === 'CPH' ? 'CP Heads' : 'Placement Staff'}… please wait.
                </div>
            )}

            {/* Error banner */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-medium flex items-center justify-between">
                    {error}
                    <button onClick={fetchUsers} className="ml-4 text-xs font-bold underline hover:no-underline">
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
                    <table className="w-full min-w-[960px]">
                        <tbody>
                            {[...Array(PAGE_SIZE)].map((_, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
                                            <div className="space-y-1.5">
                                                <div className="h-3 w-36 bg-gray-200 rounded animate-pulse" />
                                                <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4"><div className="h-3 w-44 bg-gray-200 rounded animate-pulse" /></td>
                                    <td className="px-5 py-4"><div className="h-3 w-28 bg-gray-200 rounded animate-pulse" /></td>
                                    <td className="px-5 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" /></td>
                                    <td className="px-5 py-4"><div className="h-5 w-14 bg-gray-200 rounded-full animate-pulse" /></td>
                                    <td className="px-5 py-4"><div className="h-7 w-24 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <CPTeamTable
                    users={paginated}
                    statusFilter={statusFilter}
                    showToggleAccess={isAdminMode}
                    onToggleAccess={isAdminMode ? handleToggleAccess : undefined}
                    onEdit={user => { setEditUser(user); setShowModal(true); }}
                    onDelete={user => setDeleteTarget(user)}
                    onRestore={handleRestore}
                    onResendCredentials={user => setResendTarget(user)}
                />
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-gray-500">
                        Showing{' '}
                        <span className="font-semibold text-gray-700">
                            {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filtered.length)}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-gray-700">{filtered.length}</span>{' '}
                        users
                    </p>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Prev
                        </button>

                        {/* Page number pills — show at most 5 */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p =>
                                p === 1 ||
                                p === totalPages ||
                                Math.abs(p - safePage) <= 1
                            )
                            .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === '…' ? (
                                    <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-xs select-none">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p as number)}
                                        className={`w-8 h-7 text-xs font-semibold rounded-lg border transition-colors ${
                                            safePage === p
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )
                        }

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Create / Edit modal */}
            <CPTeamFormModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditUser(null); }}
                onSave={handleSave}
                initialData={editUser}
                collegeCode={collegeCode}
                collegeName={collegeName}
                showRoleSelector={isAdminMode}
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
                    entityLabel={bulkRole === 'CPH' ? 'CP Heads' : 'Placement Staff'}
                />
            )}
        </div>
    );
};
