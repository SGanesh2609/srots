
import React, { useState } from 'react';
import { Notice } from '../../../../types';
import { UploadCloud, Trash2, FileText, Download, Eye, Calendar, X } from 'lucide-react';
import { Modal } from '../../../common/Modal';

/**
 * Component Name: NoticesTab
 * Directory: components/colleges/shared/calendar/NoticesTab.tsx
 * 
 * Functionality:
 * - Lists Notices and Timetables fetched from DataService.
 * - Allows authorized users to Delete notices.
 * - Provides view/preview functionality for attached PDFs.
 * - Provides download button for attached PDFs.
 */

interface NoticesTabProps {
    notices: Notice[];
    canEdit: boolean;
    onAddNotice: () => void;
    onDeleteNotice: (e: React.MouseEvent, id: string) => void;
}

export const NoticesTab: React.FC<NoticesTabProps> = ({ notices, canEdit, onAddNotice, onDeleteNotice }) => {
    const [previewNotice, setPreviewNotice] = useState<Notice | null>(null);

    const handleViewFile = (notice: Notice) => {
        setPreviewNotice(notice);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border shadow-sm gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Official Notices & Timetables</h2>
                    <p className="text-sm text-gray-500 font-medium">Access academic schedules and important institutional announcements.</p>
                </div>
                {canEdit && (
                    <button onClick={onAddNotice} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 text-sm">
                        <UploadCloud size={18}/> Publish Notice
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notices.map(notice => (
                    <div key={notice.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col h-full">
                        {canEdit && (
                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button 
                                    type="button" 
                                    onClick={(e) => onDeleteNotice(e, notice.id)} 
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl bg-white shadow-sm border border-red-100"
                                    title="Delete Notice"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        )}
                        
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 ${notice.type === 'Time Table' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'} rounded-2xl flex items-center justify-center shrink-0 border shadow-inner`}>
                                {notice.type === 'Time Table' ? <Calendar size={24}/> : <FileText size={24}/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${notice.type === 'Time Table' ? 'text-indigo-600' : 'text-amber-600'} block mb-1`}>
                                    {notice.type}
                                </span>
                                <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2" title={notice.title}>{notice.title}</h3>
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-6 flex-1 line-clamp-4 leading-relaxed">{notice.description}</p>
                        
                        <div className="mt-auto pt-6 border-t border-gray-50 space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <span>Published: {notice.date}</span>
                                <span>By: {notice.postedBy}</span>
                            </div>

                            {notice.fileUrl ? (
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => handleViewFile(notice)}
                                        className="w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors border border-blue-100"
                                    >
                                        <Eye size={16}/> Preview Document
                                    </button>
                                    <a 
                                        href={notice.fileUrl} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 shadow-md transition-all active:scale-[0.98]"
                                    >
                                        <Download size={16}/> Download PDF
                                    </a>
                                </div>
                            ) : (
                                <div className="p-3 rounded-xl border border-dashed border-gray-200 text-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">No Attachment</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Document Preview Modal */}
            {previewNotice && (
                <Modal 
                    isOpen={!!previewNotice} 
                    onClose={() => setPreviewNotice(null)} 
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><FileText size={20}/></div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">{previewNotice.title}</h4>
                                <p className="text-[10px] text-gray-500 font-medium">Document Preview</p>
                            </div>
                        </div>
                    } 
                    maxWidth="max-w-5xl"
                >
                    <div className="flex flex-col h-[75vh]">
                        <div className="flex-1 bg-gray-100 relative overflow-hidden">
                            {/* In a real app, this would be the PDF viewer (e.g., pdf.js or native iframe) */}
                            <iframe 
                                src={`${previewNotice.fileUrl}#toolbar=0`} 
                                className="w-full h-full border-0"
                                title="Notice Viewer"
                            />
                            {/* Fallback overlay for environments where external PDFs are blocked */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 pointer-events-none opacity-10">
                                <FileText size={128} className="text-gray-300" />
                                <p className="font-bold text-gray-400 mt-4">Document Content Loading...</p>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                            <div className="text-xs text-gray-500 font-medium italic">
                                Note: This is a secure preview of {previewNotice.fileName || 'Notice.pdf'}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setPreviewNotice(null)} className="px-5 py-2 border rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors">Close</button>
                                <a 
                                    href={previewNotice.fileUrl} 
                                    download={previewNotice.fileName || 'notice.pdf'}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-md"
                                >
                                    <Download size={18}/> Download to Device
                                </a>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
