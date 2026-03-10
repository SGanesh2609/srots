import React from 'react';
import { User } from '../../../../../types';
import { Trash2, Pencil, Send, RefreshCw, AlertTriangle, Shield, Users } from 'lucide-react';

/**
 * Component: TeamList
 * Path: components/colleges/cp-portal/admin/team/TeamList.tsx
 *
 * Table showing BOTH CPH and STAFF members.
 *
 * Columns:  Name | Contact | Department | Role | Status | Actions
 *
 * Role column:
 *   CPH   → violet "CP Head" badge
 *   STAFF → blue   "Staff"   badge
 *
 * Actions column:
 *   CPH rows   → NO action buttons (CPH accounts managed by admin, shown read-only)
 *   STAFF rows (active tab)       → Resend · Edit · Delete
 *   STAFF rows (soft-deleted tab) → Restore · Hard Delete
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Detect CPH role from whatever shape the backend returns. */
function isCPH(user: User): boolean {
    const r = (user as any).role ?? (user as any).accountRole ?? '';
    return (
        r === 'CPH' ||
        r === 'CP_HEAD' ||
        r === 'CPADMIN' ||
        String(r).toUpperCase().includes('CPH') ||
        String(r).toUpperCase().includes('CP_HEAD') ||
        (user as any).isCollegeHead === true
    );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

const TeamMemberAvatar: React.FC<{ user: User }> = ({ user }) => {
    const [failed, setFailed] = React.useState(false);
    const src     = (user as any).avatarUrl || (user as any).avatar || undefined;
    const initial = (user.fullName?.trim()?.charAt(0) ?? '?').toUpperCase();
    const COLOURS = [
        'bg-violet-100 text-violet-700',
        'bg-indigo-100 text-indigo-700',
        'bg-blue-100   text-blue-700',
        'bg-emerald-100 text-emerald-700',
        'bg-amber-100  text-amber-700',
        'bg-rose-100   text-rose-700',
        'bg-teal-100   text-teal-700',
        'bg-orange-100 text-orange-700',
    ];
    const colour = COLOURS[(initial.charCodeAt(0) || 0) % COLOURS.length];
    React.useEffect(() => { setFailed(false); }, [src]);

    if (src && !failed) {
        return (
            <img
                src={src}
                alt={user.fullName}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100"
                onError={() => setFailed(true)}
            />
        );
    }
    return (
        <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm select-none ${colour}`}
            title={user.fullName}
        >
            {initial}
        </div>
    );
};

// ── Action button helper ──────────────────────────────────────────────────────

const Btn: React.FC<{
    onClick: (e: React.MouseEvent) => void;
    title:     string;
    className: string;
    children:  React.ReactNode;
}> = ({ onClick, title, className, children }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={`p-1.5 rounded-lg border transition-colors ${className}`}
    >
        {children}
    </button>
);

// ── Role badge ────────────────────────────────────────────────────────────────

const RoleBadge: React.FC<{ user: User }> = ({ user }) => {
    if (isCPH(user)) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-violet-50 text-violet-700 border-violet-200 whitespace-nowrap">
                <Shield size={10} />
                CP Head
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
            <Users size={10} />
            Staff
        </span>
    );
};

// ── Soft / Hard Delete Modal ──────────────────────────────────────────────────

interface DeleteModalProps {
    user:       User | null;
    onClose:    () => void;
    onConfirm:  (mode: 'soft' | 'hard') => void;
    isDeleting: boolean;
}

export const SoftHardDeleteModal: React.FC<DeleteModalProps> = ({
    user, onClose, onConfirm, isDeleting,
}) => {
    const [mode, setMode] = React.useState<'soft' | 'hard'>('soft');
    React.useEffect(() => { if (user) setMode('soft'); }, [user]);
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">

                <div className="p-5 border-b flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <Trash2 className="text-red-600" size={18} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-900">Delete Team Member</h3>
                        <p className="text-sm text-gray-500 truncate">{user.fullName}</p>
                    </div>
                </div>

                <div className="p-5 space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Choose deletion type:</p>

                    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                        mode === 'soft' ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                        <input type="radio" name="teamDelMode" value="soft"
                            checked={mode === 'soft'} onChange={() => setMode('soft')}
                            className="mt-0.5 accent-amber-500" />
                        <div>
                            <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
                                Soft Delete
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">Recommended</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">Account hidden but data preserved for 90 days — can be restored.</p>
                        </div>
                    </label>

                    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                        mode === 'hard' ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                        <input type="radio" name="teamDelMode" value="hard"
                            checked={mode === 'hard'} onChange={() => setMode('hard')}
                            className="mt-0.5 accent-red-500" />
                        <div>
                            <p className="font-bold text-sm text-red-700 flex items-center gap-2">
                                Hard Delete
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">Irreversible</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">Permanently destroys all account data. Cannot be undone.</p>
                        </div>
                    </label>

                    {mode === 'hard' && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-red-700 font-medium">
                                All data for <strong>{user.fullName}</strong> will be permanently destroyed. No undo.
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-5 pb-5 flex gap-3 justify-end">
                    <button onClick={onClose} disabled={isDeleting}
                        className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={() => onConfirm(mode)} disabled={isDeleting}
                        className={`px-5 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2 disabled:opacity-60 transition-colors ${
                            mode === 'hard' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
                        }`}>
                        {isDeleting && (
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                        )}
                        {isDeleting ? 'Deleting...' : mode === 'hard' ? 'Permanently Delete' : 'Soft Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── TeamList Props ────────────────────────────────────────────────────────────

export interface TeamListProps {
    staffList:           User[];
    statusFilter:        'active' | 'soft_deleted';
    onEdit:              (member: User) => void;
    onDelete:            (member: User) => void;
    onRestore:           (member: User) => void;
    onResendCredentials: (member: User) => void;
}

// ── Table ─────────────────────────────────────────────────────────────────────

export const TeamList: React.FC<TeamListProps> = ({
    staffList, statusFilter,
    onEdit, onDelete, onRestore, onResendCredentials,
}) => {
    const isSoftDeleted = statusFilter === 'soft_deleted';

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[960px]">

                    {/* ── Head ─────────────────────────────────────────────── */}
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b">
                        <tr>
                            <th className="px-6 py-3.5 w-[27%]">Name</th>
                            <th className="px-6 py-3.5 w-[23%]">Contact</th>
                            <th className="px-6 py-3.5 w-[17%]">Department</th>
                            <th className="px-6 py-3.5 w-[10%]">Role</th>
                            <th className="px-6 py-3.5 w-[10%]">Status</th>
                            <th className="px-6 py-3.5 w-[13%] text-right">Actions</th>
                        </tr>
                    </thead>

                    {/* ── Body ─────────────────────────────────────────────── */}
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {staffList.map(member => {
                            const memberIsCPH = isCPH(member);

                            return (
                                <tr
                                    key={member.id}
                                    className={`transition-colors ${
                                        isSoftDeleted
                                            ? 'bg-amber-50/40 opacity-80'
                                            : memberIsCPH
                                                ? 'bg-violet-50/30 hover:bg-violet-50/60'
                                                : 'hover:bg-gray-50/50'
                                    }`}
                                >
                                    {/* Name + Avatar */}
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <TeamMemberAvatar user={member} />
                                            <div className="min-w-0">
                                                <span
                                                    className="font-semibold text-gray-900 block truncate max-w-[170px]"
                                                    title={member.fullName}
                                                >
                                                    {member.fullName}
                                                </span>
                                                <span className="text-xs text-gray-400 font-mono block truncate max-w-[170px]">
                                                    {(member as any).username || member.id}
                                                </span>
                                                {isSoftDeleted && (
                                                    <span className="inline-block text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold mt-0.5">
                                                        Soft Deleted
                                                        {(member as any).deletedAt
                                                            ? ` \u00b7 ${new Date((member as any).deletedAt).toLocaleDateString()}`
                                                            : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-6 py-3.5 text-gray-600">
                                        <div className="flex flex-col gap-0.5">
                                            <span
                                                className="truncate block text-sm max-w-[200px]"
                                                title={member.email}
                                            >
                                                {member.email}
                                            </span>
                                            <span className="text-xs text-gray-400">{member.phone || '\u2014'}</span>
                                        </div>
                                    </td>

                                    {/* Department */}
                                    <td
                                        className="px-6 py-3.5 text-gray-700 truncate max-w-[150px]"
                                        title={member.department}
                                    >
                                        {member.department || '\u2014'}
                                    </td>

                                    {/* Role */}
                                    <td className="px-6 py-3.5">
                                        <RoleBadge user={member} />
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-3.5">
                                        {isSoftDeleted ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200">
                                                Deleted
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                !member.isRestricted
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {member.isRestricted ? 'Restricted' : 'Active'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-3.5">
                                        {memberIsCPH ? (
                                            /* CPH rows: no action buttons — managed by admin */
                                            <div className="flex justify-end">
                                                <span className="text-xs text-gray-300 italic select-none">Admin managed</span>
                                            </div>
                                        ) : isSoftDeleted ? (
                                            /* STAFF soft-deleted: Restore + Hard Delete */
                                            <div className="flex justify-end items-center gap-1.5">
                                                <Btn
                                                    onClick={e => { e.stopPropagation(); onRestore(member); }}
                                                    title="Restore account"
                                                    className="text-green-600 bg-green-50 border-green-200 hover:bg-green-100"
                                                >
                                                    <RefreshCw size={14} />
                                                </Btn>
                                                <Btn
                                                    onClick={e => { e.stopPropagation(); onDelete(member); }}
                                                    title="Permanently delete"
                                                    className="text-red-500 bg-red-50 border-red-200 hover:bg-red-100"
                                                >
                                                    <Trash2 size={14} />
                                                </Btn>
                                            </div>
                                        ) : (
                                            /* STAFF active: Resend + Edit + Delete */
                                            <div className="flex justify-end items-center gap-1.5">
                                                <Btn
                                                    onClick={e => { e.stopPropagation(); onResendCredentials(member); }}
                                                    title="Resend login credentials"
                                                    className="text-indigo-500 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                                                >
                                                    <Send size={14} />
                                                </Btn>
                                                <Btn
                                                    onClick={e => { e.stopPropagation(); onEdit(member); }}
                                                    title="Edit member"
                                                    className="text-gray-500 bg-gray-50 border-gray-200 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                                                >
                                                    <Pencil size={14} />
                                                </Btn>
                                                <Btn
                                                    onClick={e => { e.stopPropagation(); onDelete(member); }}
                                                    title="Delete member"
                                                    className="text-gray-500 bg-gray-50 border-gray-200 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                                                >
                                                    <Trash2 size={14} />
                                                </Btn>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}

                        {staffList.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-14 text-center text-gray-400 italic bg-gray-50/40">
                                    {isSoftDeleted
                                        ? 'No soft-deleted team members found.'
                                        : 'No active team members found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};