
import React, { useRef, useState } from 'react';
import { Resume, Student } from '../../../../types';
import { FileText, Calendar, Eye, Trash2, CheckCircle, Star, UploadCloud, Loader2 } from 'lucide-react';
import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
import { StudentService } from '../../../../services/studentService';

interface ResumesTabProps {
    studentId: string;
    resumes: Resume[];
    onUpdate: (student: Student | null) => void;
}

export const ResumesTab: React.FC<ResumesTabProps> = ({ studentId, resumes, onUpdate }) => {
    const resumeInputRef = useRef<HTMLInputElement>(null);
    const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // UI can still disable the button, but backend provides the real check
    const canUpload = resumes.length < 3; 

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const file = e.target.files[0];
                const updatedStudent = await StudentService.uploadResume(studentId, file);
                onUpdate(updatedStudent);
                if (resumeInputRef.current) resumeInputRef.current.value = '';
            } catch (err: any) {
                alert(err.message || "Upload failed.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSetDefault = async (resumeId: string) => {
        // Backend now handles the logic of unsetting others and setting this one
        const updatedStudent = await StudentService.setResumeAsDefault(studentId, resumeId);
        if (updatedStudent) onUpdate(updatedStudent);
    };

    const confirmDelete = async () => {
        if (deleteResumeId) {
            const updatedStudent = await StudentService.updateProfileSection(studentId, 'resumes', { id: deleteResumeId }, true); // True for delete
            onUpdate(updatedStudent);
            setDeleteResumeId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-2">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><FileText size={20} className="text-blue-600"/> My Resumes</h3>
                        <p className="text-sm text-gray-500 mt-1">Manage your resumes. Set one as default for quick applications.</p>
                    </div>
                    <div className={`bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-bold ${resumes.length >= 3 ? 'text-red-600 border-red-200 bg-red-50' : 'text-blue-700'}`}>
                        {resumes.length}/3 Uploaded
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Upload Box */}
                    <div 
                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all min-h-[160px] ${!canUpload ? 'opacity-50 cursor-not-allowed border-gray-200' : 'cursor-pointer hover:bg-gray-50 hover:border-blue-300 border-gray-300 group'}`}
                        onClick={() => canUpload && !isUploading && resumeInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                        ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform ${canUpload ? 'bg-blue-50 text-blue-600 group-hover:scale-110' : 'bg-gray-100 text-gray-400'}`}>
                                <UploadCloud size={24}/>
                            </div>
                        )}
                        <h4 className="font-bold text-gray-700 text-sm">{isUploading ? 'Uploading...' : canUpload ? 'Upload Resume' : 'Limit Reached'}</h4>
                        <p className="text-xs text-gray-400 mt-1">PDF format only (Max 5MB)</p>
                        <input type="file" ref={resumeInputRef} className="hidden" accept=".pdf" onChange={handleUpload} disabled={!canUpload} />
                    </div>

                    {/* Resume Cards */}
                    {resumes.map((resume) => (
                        <div key={resume.id} className={`border rounded-xl p-4 flex flex-col justify-between relative transition-all ${resume.isDefault ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-200 hover:shadow-md'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg border flex items-center justify-center text-red-500 shadow-sm shrink-0">
                                        <FileText size={20}/>
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-gray-800 text-sm truncate w-40" title={resume.name}>{resume.name}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Calendar size={10}/> {resume.uploadDate}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <a href={resume.url} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded transition-colors" title="View"><Eye size={16}/></a>
                                    <button onClick={() => setDeleteResumeId(resume.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded transition-colors" title="Delete"><Trash2 size={16}/></button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-200/50">
                                {resume.isDefault ? (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                                        <CheckCircle size={12}/> Default Resume
                                    </span>
                                ) : (
                                    <button 
                                        onClick={() => handleSetDefault(resume.id)} 
                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-700 bg-gray-50 hover:bg-blue-50 px-2.5 py-1 rounded-full border border-gray-200 hover:border-blue-200 transition-all"
                                    >
                                        <Star size={12}/> Set as Default
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteResumeId}
                onClose={() => setDeleteResumeId(null)}
                onConfirm={confirmDelete}
                title="Delete Resume?"
                message="Are you sure you want to remove this resume?"
            />
        </div>
    );
};
