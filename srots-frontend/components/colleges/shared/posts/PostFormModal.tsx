
import React, { useState, useRef } from 'react';
import { Modal } from '../../../../components/common/Modal';
import { X, ImageIcon, FileText, Loader2, AlertCircle } from 'lucide-react';
import { CompanyService } from '../../../../services/companyService';

interface PostFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (content: string, images: string[], docs: {name: string, url: string}[]) => void;
}

const MAX_IMAGES = 5;

export const PostFormModal: React.FC<PostFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [newContent, setNewContent] = useState('');
    const [newImages, setNewImages] = useState<string[]>([]);
    const [newDocs, setNewDocs] = useState<{name: string, url: string}[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files: File[] = Array.from(e.target.files);
            const remainingSlots = MAX_IMAGES - newImages.length;

            if (remainingSlots <= 0) return alert(`Maximum ${MAX_IMAGES} images allowed.`);

            setIsUploading(true);
            let filesToProcess = files.slice(0, remainingSlots);

            try {
                const uploadPromises = filesToProcess.map(file => CompanyService.uploadFile(file));
                const newUrls = await Promise.all(uploadPromises);
                setNewImages(prev => [...prev, ...newUrls]);
            } catch (err) {
                alert("Failed to upload images.");
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const file = e.target.files[0];
                const url = await CompanyService.uploadFile(file);
                setNewDocs([...newDocs, { name: file.name, url }]);
            } catch (err) {
                alert("Failed to upload document.");
            } finally {
                setIsUploading(false);
                if (docInputRef.current) docInputRef.current.value = '';
            }
        }
    };

    const handleSave = () => {
        onSave(newContent, newImages, newDocs);
        setNewContent('');
        setNewImages([]);
        setNewDocs([]);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Campus Announcement" maxWidth="max-w-lg">
            <div className="p-6 overflow-y-auto">
                <textarea 
                    className="w-full h-32 p-4 text-sm border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none resize-none mb-4 bg-gray-50 text-gray-900 border-gray-200"
                    placeholder="Share updates with the college community..."
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                />
                <div className="space-y-3 mb-4">
                    {newImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {newImages.map((img, idx) => (
                                <div key={idx} className="relative rounded-lg overflow-hidden border aspect-square group">
                                    <img src={img} className="w-full h-full object-cover" alt="Preview"/>
                                    <button onClick={() => setNewImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"><X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                    {newDocs.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border">
                            <span className="flex items-center gap-2 truncate pr-4"><FileText size={14}/> {doc.name}</span>
                            <button onClick={() => setNewDocs(prev => prev.filter((_, idx) => idx !== i))} className="text-blue-400"><X size={14}/></button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload}/>
                    <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleDocUpload}/>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border hover:bg-blue-100 transition-all">
                        {isUploading ? <Loader2 size={16} className="animate-spin"/> : <ImageIcon size={16}/>} Photos
                    </button>
                    <button onClick={() => docInputRef.current?.click()} disabled={isUploading} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border rounded-xl text-xs font-bold transition-all">
                        <FileText size={16}/> Doc
                    </button>
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl">Discard</button>
                <button onClick={handleSave} disabled={(!newContent && newImages.length === 0) || isUploading} className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg transition-all active:scale-95">Publish</button>
            </div>
        </Modal>
    );
};
