
import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Component Name: DeleteConfirmationModal
 * Directory: components/common/DeleteConfirmationModal.tsx
 * 
 * Functionality:
 * - A generic, reusable modal to confirm destructive actions.
 * - Displays a warning icon, title, message, and Cancel/Delete buttons.
 * 
 * Used In: Multiple components (Jobs, Posts, Students, Teams, etc.)
 */

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500 mt-2">{message}</p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Cancel</button>
                        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
