
import React, { useState, useEffect } from 'react';
import { Modal } from '../../../common/Modal';

/**
 * Component Name: SocialLinksEditor
 * Directory: components/colleges/shared/about-college/SocialLinksEditor.tsx
 * 
 * Functionality:
 * - Provides input fields for various social media platforms.
 * - Now rendered inside a standard Modal for reliable UI.
 */

interface SocialLinksEditorProps {
    isOpen: boolean;
    initialLinks: any;
    onSave: (links: any) => void;
    onCancel: () => void;
}

const SOCIAL_FIELDS = [
    { key: 'website', label: 'Official Website', placeholder: 'https://...' },
    { key: 'linkedin', label: 'LinkedIn Page', placeholder: 'https://linkedin.com/...' },
    { key: 'instagram', label: 'Instagram Profile', placeholder: 'https://instagram.com/...' },
    { key: 'twitter', label: 'Twitter / X Profile', placeholder: 'https://twitter.com/...' },
    { key: 'youtube', label: 'YouTube Channel', placeholder: 'https://youtube.com/...' },
    { key: 'facebook', label: 'Facebook Page', placeholder: 'https://facebook.com/...' }
];

export const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({ isOpen, initialLinks, onSave, onCancel }) => {
    const [socialForm, setSocialForm] = useState(initialLinks || {});

    useEffect(() => {
        if (isOpen) {
            setSocialForm(initialLinks || {});
        }
    }, [isOpen, initialLinks]);

    const handleChange = (key: string, value: string) => {
        setSocialForm((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onCancel} title="Update Social Connectivity" maxWidth="max-w-md">
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    Provide direct links to your institution's official handles. These will be visible to all students and hiring partners.
                </p>
                {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                    <div key={key}>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
                        <input 
                            className="w-full text-sm p-2.5 border rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none border-gray-200" 
                            placeholder={placeholder} 
                            value={socialForm[key] || ''} 
                            onChange={e => handleChange(key, e.target.value)} 
                        />
                    </div>
                ))}
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                <button onClick={onCancel} className="px-6 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={() => onSave(socialForm)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">Save Changes</button>
            </div>
        </Modal>
    );
};
