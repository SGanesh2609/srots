
import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { ResourceService } from '../../../../services/resourceService';

interface AboutSectionFormProps {
    initialData?: { title: string; content: string; image?: string };
    onSave: (data: { title: string; content: string; image: string }) => void;
    onCancel: () => void;
    saveLabel?: string;
    isAdding?: boolean;
}

export const AboutSectionForm: React.FC<AboutSectionFormProps> = ({ 
    initialData, onSave, onCancel, saveLabel = 'Save Changes', isAdding = false 
}) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        content: initialData?.content || '',
        image: initialData?.image || ''
    });
    const [isUploading, setIsUploading] = useState(false);
    
    const sectionImageRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const file = e.target.files[0];
                const imageUrl = await ResourceService.uploadFile(file);
                setFormData(prev => ({ ...prev, image: imageUrl }));
            } catch (err) {
                alert("Image upload failed");
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className={`bg-white rounded-xl border p-6 ${isAdding ? 'bg-blue-50 border-blue-200 animate-in zoom-in-95' : 'space-y-4'}`}>
            {isAdding && <h3 className="font-bold text-blue-900 mb-4">Add New Section</h3>}
            
            <div className="space-y-4">
                <input 
                    className="w-full p-2 border rounded font-bold text-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none" 
                    placeholder="Section Title (e.g. Our Vision)" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                />
                
                <textarea 
                    className="w-full p-2 border rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none" 
                    rows={6} 
                    placeholder="Content..." 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                />
                
                <div className="flex items-center gap-2">
                    <input type="file" ref={sectionImageRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <button onClick={() => sectionImageRef.current?.click()} disabled={isUploading} className="px-4 py-2 bg-white border rounded text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors disabled:opacity-50">
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16}/>} 
                        {formData.image ? 'Change Image' : 'Upload Image'}
                    </button>
                    {formData.image && !isUploading ? (
                        <>
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle size={12}/> Image Selected</span>
                            <img src={formData.image} className="w-10 h-10 object-cover rounded border" alt="Preview"/>
                        </>
                    ) : null}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button onClick={onCancel} className="px-4 py-2 border rounded text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={() => onSave(formData)} disabled={isUploading} className={`px-4 py-2 text-white rounded text-sm font-bold shadow-sm transition-colors ${isAdding ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        {saveLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
