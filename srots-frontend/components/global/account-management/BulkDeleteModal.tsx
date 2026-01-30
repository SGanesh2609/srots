
import React from 'react';
import { Modal } from '../../common/Modal';
import { CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { Student } from '../../../types';

/**
 * Component Name: BulkDeleteModal
 * Directory: components/global/account-management/BulkDeleteModal.tsx
 * 
 * Functionality:
 * - Displays a preview of students to be deleted from an uploaded Excel file.
 * - Shows valid matches and students not found.
 * - Confirms destructive action before deleting records.
 * 
 * Used In: ManagingStudentAccounts
 */

interface BulkDeletePreview {
    found: Student[];
    notFound: string[];
}

interface BulkDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    preview: BulkDeletePreview | null;
    isProcessing: boolean;
    onConfirm: () => void;
}

export const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({ 
    isOpen, onClose, preview, isProcessing, onConfirm 
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bulk Deletion Verification" maxWidth="max-w-3xl">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">
                {/* Section 1: Found Students */}
                <div>
                    <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle size={18}/> Ready to Delete ({preview?.found.length})
                    </h4>
                    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-2">Roll Number</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {preview?.found.map(s => (
                                    <tr key={s.id}>
                                        <td className="px-4 py-2 font-mono text-gray-700">{s.id}</td>
                                        {/* Fix: Use s.fullName instead of s.name */}
                                        <td className="px-4 py-2 font-bold text-gray-900">{s.fullName}</td>
                                        <td className="px-4 py-2 text-gray-500">{s.email}</td>
                                    </tr>
                                ))}
                                {preview?.found.length === 0 && (
                                    <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-400 italic">No matching students found in database.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 2: Not Found IDs */}
                {preview?.notFound && preview.notFound.length > 0 && (
                    <div>
                        <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                            <AlertCircle size={18}/> IDs Not Found ({preview.notFound.length})
                        </h4>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-xs text-orange-800 font-mono break-all">
                            {preview.notFound.join(', ')}
                            <p className="mt-2 text-orange-600 font-sans italic font-normal">* These Roll Numbers from your file were not found in the college database and will be ignored.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 flex-none">
                <button onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100">Cancel</button>
                <button 
                    onClick={onConfirm} 
                    disabled={preview?.found.length === 0 || isProcessing}
                    className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18}/>} 
                    {isProcessing ? 'Deleting...' : 'Confirm Deletion'}
                </button>
            </div>
        </Modal>
    );
};
