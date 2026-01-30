
import React from 'react';
import { X } from 'lucide-react';

/**
 * Component Name: Modal
 * Directory: components/common/Modal.tsx
 * 
 * Functionality:
 * - A generic, reusable modal wrapper component.
 * - Handles the backdrop, centering, close button, and title bar.
 * - Supports dynamic width classes via `maxWidth` prop.
 * 
 * Used In: Multiple components (Forms, Wizards, Details)
 */

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    maxWidth?: string; // e.g., 'max-w-lg', 'max-w-2xl'
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200 backdrop-blur-sm">
            <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh]`}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 flex-none">
                    <div className="font-bold text-gray-800 text-lg flex items-center gap-2">{title}</div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"><X size={20}/></button>
                </div>
                {children}
            </div>
        </div>
    );
};
