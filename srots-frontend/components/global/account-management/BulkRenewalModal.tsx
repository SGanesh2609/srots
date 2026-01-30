
import React from 'react';
import { Modal } from '../../common/Modal';
import { CheckCircle, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Student } from '../../../types';

/**
 * Component Name: BulkRenewalModal
 * Directory: components/global/account-management/BulkRenewalModal.tsx
 * 
 * Functionality:
 * - Displays a preview of students to be renewed from an uploaded Excel file.
 * - Shows valid matches and students not found in the database.
 * - Executes the bulk renewal process upon confirmation.
 * 
 * Used In: ManagingStudentAccounts
 */

interface RenewalItem {
    student: Student;
    months: number;
    oldEnd: string;
    newEnd: string;
    status: 'Expired' | 'Active';
}

interface BulkRenewalPreview {
    found: RenewalItem[];
    notFound: string[];
}

interface BulkRenewalModalProps {
    isOpen: boolean;
    onClose: () => void;
    preview: BulkRenewalPreview | null;
    isProcessing: boolean;
    onConfirm: () => void;
}

export const BulkRenewalModal: React.FC<BulkRenewalModalProps> = ({ 
    isOpen, onClose, preview, isProcessing, onConfirm 
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bulk Renewal Verification" maxWidth="max-w-4xl">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">
                {/* Section 1: Found Students */}
                <div>
                    <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                        <CheckCircle size={18}/> Ready to Renew ({preview?.found.length})
                    </h4>
                    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[600px]">
                                <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-2">Roll Number</th>
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2">Current Status</th>
                                        <th className="px-4 py-2">Extension</th>
                                        <th className="px-4 py-2">New Expiry Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {preview?.found.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2 font-mono text-gray-700">{item.student.id}</td>
                                            {/* Fix: Use item.student.fullName instead of item.student.name */}
                                            <td className="px-4 py-2 font-bold text-gray-900">{item.student.fullName}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {item.status}
                                                </span>
                                                <div className="text-[10px] text-gray-400">Ends: {item.oldEnd}</div>
                                            </td>
                                            <td className="px-4 py-2 font-bold text-blue-600">+{item.months} Months</td>
                                            <td className="px-4 py-2 flex items-center gap-2">
                                                <ArrowRight size={14} className="text-gray-400"/>
                                                <span className="font-bold text-gray-800">{item.newEnd}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {preview?.found.length === 0 && (
                                        <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-400 italic">No matching students found in database.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18}/>} 
                    {isProcessing ? 'Processing...' : 'Confirm Renewal'}
                </button>
            </div>
        </Modal>
    );
};
