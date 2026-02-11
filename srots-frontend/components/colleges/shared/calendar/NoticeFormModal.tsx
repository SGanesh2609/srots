import React, { useRef, useState, useEffect } from 'react'; // 1. Added useEffect
import { Notice } from '../../../../types';
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from '../../../common/Modal';
import { CalendarService } from '../../../../services/calendarService';

interface NoticeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (notice: Partial<Notice>) => void;
    isEditing: boolean;
    initialData: Partial<Notice>;
}

export const NoticeFormModal: React.FC<NoticeFormModalProps> = ({ isOpen, onClose, onSave, isEditing, initialData }) => {
    // This state now gets synced by the useEffect below
    const [newNotice, setNewNotice] = useState<Partial<Notice>>(initialData);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const noticeFileRef = useRef<HTMLInputElement>(null);

    // 2. CRITICAL FIX: Sync form state with incoming data
    useEffect(() => {
        if (isOpen) {
            setNewNotice(initialData);
            setErrorMsg(null);
            setSelectedFile(undefined); // Reset file selection for new edit session
        }
    }, [initialData, isOpen]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setIsUploading(true);
            try {
                const url = await CalendarService.uploadFile(file, 'Calendar');
                setNewNotice({ ...newNotice, fileName: file.name, fileUrl: url });
                setErrorMsg(null);
            } catch (err) {
                setErrorMsg("Failed to upload file.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSave = () => {
        if (!newNotice.title?.trim() || !newNotice.description?.trim()) {
            setErrorMsg("Title and Description are mandatory.");
            return;
        }
        onSave(newNotice);
        // Don't reset here; let the useEffect handle it on next open
        onClose(); 
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Notice' : 'Upload Time Table / Notice'} maxWidth="max-w-md">
            <div className="p-6 space-y-4">
                {/* 3. Dropdown for Notice Type (Important for editing) */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notice Type</label>
                    <select 
                        className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                        value={newNotice.type || 'Notice'}
                        onChange={e => setNewNotice({...newNotice, type: e.target.value as any})}
                    >
                        <option value="Notice">General Notice</option>
                        <option value="Time Table">Time Table</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title <span className="text-red-500">*</span></label>
                    <input className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. 4-1 Class Schedule" value={newNotice.title || ''} onChange={e => { setNewNotice({...newNotice, title: e.target.value}); setErrorMsg(null); }} />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" rows={3} placeholder="Details about the schedule..." value={newNotice.description || ''} onChange={e => { setNewNotice({...newNotice, description: e.target.value}); setErrorMsg(null); }} />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Attachment (PDF)</label>
                    <div className="border border-dashed p-4 rounded-lg bg-gray-50 text-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => !isUploading && noticeFileRef.current?.click()}>
                        {isUploading ? <Loader2 size={24} className="mx-auto text-blue-600 animate-spin mb-2"/> : <UploadCloud size={24} className="mx-auto text-gray-400 mb-2"/>}
                        
                        {/* 4. Show existing filename if editing and no new file selected */}
                        <p className="text-sm font-bold text-gray-600 truncate px-2">
                            {selectedFile ? selectedFile.name : (newNotice.fileName || 'Click to Upload File')}
                        </p>
                        <input type="file" className="hidden" accept=".pdf" ref={noticeFileRef} onChange={handleFileUpload}/>
                    </div>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm font-bold flex items-center gap-2">
                        <AlertCircle size={16}/> {errorMsg}
                    </div>
                )}

                <button onClick={handleSave} disabled={isUploading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm mt-2 disabled:opacity-50 transition-all">
                    {isEditing ? 'Update Changes' : 'Post Notice'}
                </button>
            </div>
        </Modal>
    );
};