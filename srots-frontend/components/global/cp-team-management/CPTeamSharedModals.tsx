import React from 'react';
import { User } from '../../../types';
import { Trash2, AlertTriangle } from 'lucide-react';

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
                        <h3 className="font-bold text-gray-900">Delete CP Account</h3>
                        <p className="text-sm text-gray-500 truncate">{user.fullName}</p>
                    </div>
                </div>

                <div className="p-5 space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Choose deletion type:</p>

                    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                        mode === 'soft' ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                        <input type="radio" name="cpDelMode" value="soft"
                            checked={mode === 'soft'} onChange={() => setMode('soft')}
                            className="mt-0.5 accent-amber-500" />
                        <div>
                            <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
                                Soft Delete
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">Recommended</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Account is hidden but all data is preserved for 90 days and can be restored.
                            </p>
                        </div>
                    </label>

                    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                        mode === 'hard' ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                        <input type="radio" name="cpDelMode" value="hard"
                            checked={mode === 'hard'} onChange={() => setMode('hard')}
                            className="mt-0.5 accent-red-500" />
                        <div>
                            <p className="font-bold text-sm text-red-700 flex items-center gap-2">
                                Hard Delete
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">Irreversible</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Permanently destroys all account data. Cannot be undone.
                            </p>
                        </div>
                    </label>

                    {mode === 'hard' && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-red-700 font-medium">
                                All data for <strong>{user.fullName}</strong> will be permanently destroyed. There is no undo.
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
                        {isDeleting ? 'Deleting…' : mode === 'hard' ? 'Permanently Delete' : 'Soft Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Resend Confirm Modal ──────────────────────────────────────────────────────

interface ResendModalProps {
    user:      User | null;
    onClose:   () => void;
    onConfirm: () => void;
    sending:   boolean;
}

export const ResendConfirmModal: React.FC<ResendModalProps> = ({
    user, onClose, onConfirm, sending,
}) => {
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
                    <button onClick={onClose} disabled={sending}
                        className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg font-semibold text-sm hover:bg-gray-50 disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={sending}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50">
                        {sending ? 'Sending…' : 'Send Credentials'}
                    </button>
                </div>
            </div>
        </div>
    );
};
