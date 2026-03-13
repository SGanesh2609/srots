import React from 'react';
import { User } from '../../../types';
import {
    ToggleLeft, ToggleRight, Trash2, Pencil,
    Send, RefreshCw, Shield, Users,
} from 'lucide-react';

/**
 * Component: CPTeamTable
 * Path: components/global/cp-team-management/CPTeamTable.tsx
 *
 * Unified table for CP team members (CPH + STAFF).
 *
 * showToggleAccess=true  → Admin/Dev mode: toggle restrict button visible for all rows
 * showToggleAccess=false → CPH mode: no toggle button; CPH rows show "Admin managed"
 *
 * Columns: Name | Contact | Department | Role | Status | Actions
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

export function isCPH(user: User): boolean {
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

export const CPTeamAvatar: React.FC<{ user: User }> = ({ user }) => {
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
            <img src={src} alt={user.fullName}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100"
                onError={() => setFailed(true)} />
        );
    }
    return (
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm select-none ${colour}`}
            title={user.fullName}>
            {initial}
        </div>
    );
};

// ── Role badge ────────────────────────────────────────────────────────────────

const RoleBadge: React.FC<{ user: User }> = ({ user }) => {
    if (isCPH(user)) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-violet-50 text-violet-700 border-violet-200 whitespace-nowrap">
                <Shield size={10} /> CP Head
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
            <Users size={10} /> Staff
        </span>
    );
};

// ── Action button helper ──────────────────────────────────────────────────────

const Btn: React.FC<{
    onClick:   (e: React.MouseEvent) => void;
    title:     string;
    className: string;
    children:  React.ReactNode;
}> = ({ onClick, title, className, children }) => (
    <button type="button" onClick={onClick} title={title}
        className={`p-1.5 rounded-lg border transition-colors ${className}`}>
        {children}
    </button>
);

// ── Props ─────────────────────────────────────────────────────────────────────

export interface CPTeamTableProps {
    users:               User[];
    statusFilter:        'active' | 'soft_deleted';
    /** true = Admin/Dev portal — toggle access button shown for all rows */
    showToggleAccess:    boolean;
    onToggleAccess?:     (user: User) => void;
    onEdit:              (user: User) => void;
    onDelete:            (user: User) => void;
    onRestore:           (user: User) => void;
    onResendCredentials: (user: User) => void;
}

// ── Table ─────────────────────────────────────────────────────────────────────

export const CPTeamTable: React.FC<CPTeamTableProps> = ({
    users, statusFilter, showToggleAccess,
    onToggleAccess, onEdit, onDelete, onRestore, onResendCredentials,
}) => {
    const isSoftDeleted = statusFilter === 'soft_deleted';

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[960px]">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b">
                        <tr>
                            <th className="px-5 py-3.5 w-[25%]">Name</th>
                            <th className="px-5 py-3.5 w-[20%]">Contact</th>
                            <th className="px-5 py-3.5 w-[16%]">Department</th>
                            <th className="px-5 py-3.5 w-[10%]">Role</th>
                            <th className="px-5 py-3.5 w-[10%]">Status</th>
                            <th className="px-5 py-3.5 w-[19%] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {users.map(user => {
                            const memberIsCPH = isCPH(user);

                            return (
                                <tr key={user.id} className={`transition-colors ${
                                    isSoftDeleted
                                        ? 'bg-amber-50/40 opacity-80'
                                        : memberIsCPH
                                            ? 'bg-violet-50/30 hover:bg-violet-50/60'
                                            : 'hover:bg-gray-50/50'
                                }`}>

                                    {/* Name */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <CPTeamAvatar user={user} />
                                            <div className="min-w-0">
                                                <span className="font-semibold text-gray-900 block truncate max-w-[160px]" title={user.fullName}>
                                                    {user.fullName}
                                                </span>
                                                <span className="text-xs text-gray-400 font-mono block truncate max-w-[160px]">
                                                    {(user as any).username || user.id}
                                                </span>
                                                {isSoftDeleted && (
                                                    <span className="inline-block text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold mt-0.5">
                                                        Soft Deleted
                                                        {(user as any).deletedAt
                                                            ? ` · ${new Date((user as any).deletedAt).toLocaleDateString()}`
                                                            : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-5 py-3.5 text-gray-600">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="truncate block text-sm max-w-[190px]" title={user.email}>{user.email}</span>
                                            <span className="text-xs text-gray-400">{user.phone || '—'}</span>
                                        </div>
                                    </td>

                                    {/* Department */}
                                    <td className="px-5 py-3.5 text-gray-700 truncate max-w-[140px]" title={user.department}>
                                        {user.department || '—'}
                                    </td>

                                    {/* Role */}
                                    <td className="px-5 py-3.5">
                                        <RoleBadge user={user} />
                                    </td>

                                    {/* Status */}
                                    <td className="px-5 py-3.5">
                                        {isSoftDeleted ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200">
                                                Deleted
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                !user.isRestricted
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {user.isRestricted ? 'Restricted' : 'Active'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-3.5">
                                        {/* CPH mode: CPH rows are read-only */}
                                        {!showToggleAccess && memberIsCPH ? (
                                            <div className="flex justify-end">
                                                <span className="text-xs text-gray-300 italic select-none">Admin managed</span>
                                            </div>
                                        ) : isSoftDeleted ? (
                                            /* Soft-deleted: Restore + Hard Delete */
                                            <div className="flex justify-end items-center gap-1.5">
                                                <Btn
                                                    onClick={e => { e.stopPropagation(); onRestore(user); }}
                                                    title="Restore account"
                                                    className="text-green-600 bg-green-50 border-green-200 hover:bg-green-100"
                                                >
                                                    <RefreshCw size={14} />
                                                </Btn>
                                                <Btn
                                                    onClick={e => { e.stopPropagation(); onDelete(user); }}
                                                    title="Permanently delete"
                                                    className="text-red-500 bg-red-50 border-red-200 hover:bg-red-100"
                                                >
                                                    <Trash2 size={14} />
                                                </Btn>
                                            </div>
                                        ) : (
                                            /* Active: full action set */
                                            <div className="flex justify-end items-center gap-1.5">
                                                {showToggleAccess && onToggleAccess && (
                                                    <Btn
                                                        onClick={e => { e.stopPropagation(); onToggleAccess(user); }}
                                                        title={user.isRestricted ? 'Enable Access' : 'Restrict Access'}
                                                        className={user.isRestricted
                                                            ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                                                            : 'text-amber-500 bg-amber-50 border-amber-200 hover:bg-amber-100'}
                                                    >
                                                        {user.isRestricted ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
                                                    </Btn>
                                                )}
                                                <Btn
                                                    onClick={e => { e.stopPropagation(); onResendCredentials(user); }}
                                                    title="Resend login credentials"
                                                    className="text-indigo-500 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                                                >
                                                    <Send size={14} />
                                                </Btn>
                                                <Btn
                                                    onClick={e => { e.stopPropagation(); onEdit(user); }}
                                                    title="Edit user"
                                                    className="text-gray-500 bg-gray-50 border-gray-200 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                                                >
                                                    <Pencil size={14} />
                                                </Btn>
                                                <Btn
                                                    onClick={e => { e.stopPropagation(); onDelete(user); }}
                                                    title="Delete user"
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

                        {users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-14 text-center text-gray-400 italic bg-gray-50/40">
                                    {isSoftDeleted
                                        ? 'No soft-deleted CP users found.'
                                        : 'No active CP users found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
