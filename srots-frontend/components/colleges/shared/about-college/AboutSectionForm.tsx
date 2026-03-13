import React, { useState, useRef } from 'react';
import { Loader2, X } from 'lucide-react';
import { CollegeService } from '../../../../services/collegeService';
import { SERVER_BASE_URL } from '../../../../services/api';

interface AboutSectionFormProps {
  initialData?: { id?: string; title: string; content: string; imageUrl?: string };
  onSave: (data: { id?: string; title: string; content: string; imageUrl?: string }) => void;
  onCancel: () => void;
  saveLabel?: string;
  isAdding?: boolean;
  collegeCode?: string;
}

export const AboutSectionForm: React.FC<AboutSectionFormProps> = ({ 
  initialData, 
  onSave, 
  onCancel, 
  saveLabel = 'Save Changes', 
  isAdding = false,
  collegeCode 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    imageUrl: initialData?.imageUrl || ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (!collegeCode) {
        alert("College code is required to upload images.");
        return;
      }
      setIsUploading(true);
      setUploadError(null);
      try {
        const file = e.target.files[0];
        const rawUrl = await CollegeService.uploadFile(file, collegeCode, 'about');
        
        // Prepend correct base URL
        const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${SERVER_BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
        
        setFormData(prev => ({ ...prev, imageUrl: fullUrl }));
      } catch (err: any) {
        console.error('Upload error:', err);
        setUploadError(err.response?.data?.message || "Image upload failed.");
        alert(setUploadError);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Title and content are required.");
      return;
    }
    onSave({ ...initialData, ...formData });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 md:p-8 shadow-sm">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Section Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Our Placement Excellence"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Content *</label>
          <textarea
            value={formData.content}
            onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Describe the section content here..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Supporting Image</label>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/jpeg,image/png,image/gif,image/webp"
            hidden 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !collegeCode}
            className={`w-full md:w-auto px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
              ${isUploading || !collegeCode 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}
          >
            {isUploading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              'Upload Image (jpg, png, webp, gif)'
            )}
          </button>

          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}

          {formData.imageUrl && (
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
                  onError={(e) => {
                    console.error('Preview failed:', formData.imageUrl);
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
                <button
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                >
                  <X size={16} /> Remove Image
                </button>
              </div>
              <p className="text-xs text-gray-500 break-all">
                URL: {formData.imageUrl}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button 
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isUploading}
            className={`px-8 py-3 rounded-xl font-bold text-white transition-all
              ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
};