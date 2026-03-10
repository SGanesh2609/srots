import React from 'react';
import { User } from '../../../../types';
import {
  ToggleLeft, ToggleRight, Trash2, Pencil,
  Send, RefreshCw, AlertTriangle,
} from 'lucide-react';

/**
 * Component: CPUsersTable
 * Path: components/colleges/cms/CPUsersTable.tsx
 *
 * Features:
 *  - Always-visible action buttons
 *  - Soft-deleted tab: shows amber-tinted rows with Restore button only
 *  - Active tab: shows Toggle, Resend, Edit, Delete (soft/hard modal)
 *  - Inline SoftHardDeleteModal — no separate file needed
 */

// ── Avatar ─────────────────────────────────────────────────────────────────────
export const CPUserAvatar: React.FC<{ user: User; size?: 'sm' | 'md' }> = ({
  user, size = 'md',
}) => {
  const [failed, setFailed] = React.useState(false);
  const src     = (user as any).avatarUrl || (user as any).avatar || undefined;
  const initial = (user.fullName?.trim()?.charAt(0) ?? '?').toUpperCase();
  const COLOURS = [
    'bg-violet-100 text-violet-700', 'bg-indigo-100 text-indigo-700',
    'bg-blue-100 text-blue-700',     'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',   'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',     'bg-orange-100 text-orange-700',
  ];
  const colour = COLOURS[(initial.charCodeAt(0) || 0) % COLOURS.length];
  const dim    = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
  React.useEffect(() => { setFailed(false); }, [src]);
  if (src && !failed) {
    return (
      <img src={src} alt={user.fullName}
        className={`${dim} rounded-full object-cover shrink-0 border border-gray-100`}
        onError={() => setFailed(true)} />
    );
  }
  return (
    <div className={`${dim} rounded-full flex items-center justify-center shrink-0 font-bold select-none ${colour}`}
      title={user.fullName}>
      {initial}
    </div>
  );
};

// ── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const s: Record<string, string> = {
    CPH:   'bg-purple-50 text-purple-700 border-purple-200',
    STAFF: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${s[role] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {role === 'CPH' ? 'CP Head' : 'Staff'}
    </span>
  );
};

// ── ActionBtn ─────────────────────────────────────────────────────────────────
const Btn: React.FC<{
  onClick: (e: React.MouseEvent) => void;
  title: string; className: string; children: React.ReactNode;
}> = ({ onClick, title, className, children }) => (
  <button type="button" onClick={onClick} title={title}
    className={`p-1.5 rounded-lg border transition-colors ${className}`}>
    {children}
  </button>
);

// ── Soft / Hard Delete Modal ───────────────────────────────────────────────────
interface DeleteModalProps {
  user:      User | null;
  onClose:   () => void;
  onConfirm: (mode: 'soft' | 'hard') => void;
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

        {/* Header */}
        <div className="p-5 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 className="text-red-600" size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900">Delete CP Account</h3>
            <p className="text-sm text-gray-500 truncate">{user.fullName}</p>
          </div>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Choose deletion type:</p>

          {/* Soft delete */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
            mode === 'soft' ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input type="radio" name="cpDelMode" value="soft"
              checked={mode === 'soft'} onChange={() => setMode('soft')}
              className="mt-0.5 accent-amber-500" />
            <div>
              <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
                Soft Delete
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">
                  Recommended
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Account is hidden but all data is preserved for 90 days and can be restored.
              </p>
            </div>
          </label>

          {/* Hard delete */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
            mode === 'hard' ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input type="radio" name="cpDelMode" value="hard"
              checked={mode === 'hard'} onChange={() => setMode('hard')}
              className="mt-0.5 accent-red-500" />
            <div>
              <p className="font-bold text-sm text-red-700 flex items-center gap-2">
                Hard Delete
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">
                  Irreversible
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Permanently destroys all account data. Requires ADMIN role. Cannot be undone.
              </p>
            </div>
          </label>

          {mode === 'hard' && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 font-medium">
                ⚠ This will permanently destroy all data for <strong>{user.fullName}</strong>. There is no undo.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3 justify-end">
          <button onClick={onClose} disabled={isDeleting}
            className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(mode)} disabled={isDeleting}
            className={`px-5 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2 disabled:opacity-60 transition-colors ${
              mode === 'hard'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}>
            {isDeleting && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            )}
            {isDeleting ? 'Deleting…' : mode === 'hard' ? 'Permanently Delete' : 'Soft Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Props ─────────────────────────────────────────────────────────────────────
export interface CPUsersTableProps {
  users:               User[];
  statusFilter:        'active' | 'soft_deleted';
  onToggleAccess:      (user: User)     => void;
  onEdit:              (user: User)     => void;
  onDelete:            (user: User)     => void;   // opens soft/hard modal
  onRestore:           (user: User)     => void;
  onResendCredentials: (user: User)     => void;
}

// ── Table ─────────────────────────────────────────────────────────────────────
export const CPUsersTable: React.FC<CPUsersTableProps> = ({
  users, statusFilter,
  onToggleAccess, onEdit, onDelete, onRestore, onResendCredentials,
}) => {
  const isSoftDeleted = statusFilter === 'soft_deleted';

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[860px]">
          <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b">
            <tr>
              <th className="px-5 py-3.5 w-[28%]">Name</th>
              <th className="px-5 py-3.5 w-[24%]">Contact</th>
              <th className="px-5 py-3.5 w-[11%]">Role</th>
              <th className="px-5 py-3.5 w-[11%]">Status</th>
              <th className="px-5 py-3.5 w-[26%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {users.map(user => (
              <tr key={user.id}
                className={`transition-colors ${isSoftDeleted ? 'bg-amber-50/40 opacity-80' : 'hover:bg-gray-50/50'}`}>

                {/* Name */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <CPUserAvatar user={user} />
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
                    <span className="truncate block text-sm max-w-[200px]" title={user.email}>{user.email}</span>
                    <span className="text-xs text-gray-400">{user.phone || '—'}</span>
                  </div>
                </td>

                {/* Role */}
                <td className="px-5 py-3.5"><RoleBadge role={user.role} /></td>

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
                  <div className="flex justify-end items-center gap-1.5">
                    {isSoftDeleted ? (
                      /* Soft-deleted tab — only Restore and Hard-Delete */
                      <>
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
                      </>
                    ) : (
                      /* Active tab — full action set */
                      <>
                        <Btn
                          onClick={e => { e.stopPropagation(); onToggleAccess(user); }}
                          title={user.isRestricted ? 'Enable Access' : 'Restrict Access'}
                          className={user.isRestricted
                            ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                            : 'text-amber-500 bg-amber-50 border-amber-200 hover:bg-amber-100'}
                        >
                          {user.isRestricted ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
                        </Btn>
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
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center text-gray-400 italic bg-gray-50/40">
                  {statusFilter === 'soft_deleted'
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