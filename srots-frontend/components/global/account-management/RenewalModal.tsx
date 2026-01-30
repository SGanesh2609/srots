
import React from 'react';
import { Modal } from '../../common/Modal';

/**
 * Component Name: RenewalModal
 * Directory: components/global/account-management/RenewalModal.tsx
 * 
 * Functionality:
 * - Modal to extend a single student's premium account validity.
 * - Allows selecting extension duration (6, 12, 18 months).
 * 
 * Used In: ManagingStudentAccounts
 */

interface RenewalModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: { id: string, name: string } | null;
    extensionMonths: string;
    setExtensionMonths: (val: string) => void;
    onConfirm: () => void;
}

export const RenewalModal: React.FC<RenewalModalProps> = ({ 
    isOpen, onClose, student, extensionMonths, setExtensionMonths, onConfirm 
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Renew Account" maxWidth="max-w-sm">
            <div className="p-6 space-y-4">
                <div className="text-center">
                    <p className="text-sm text-gray-500">Extending validity for</p>
                    <p className="font-bold text-lg text-gray-800">{student?.name}</p>
                    <p className="text-xs font-mono text-gray-400">{student?.id}</p>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Extension Period</label>
                    <select 
                        className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                        value={extensionMonths}
                        onChange={(e) => setExtensionMonths(e.target.value)}
                    >
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                        <option value="18">18 Months</option>
                    </select>
                </div>

                <button onClick={onConfirm} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">
                    Confirm Renewal
                </button>
            </div>
        </Modal>
    );
};
