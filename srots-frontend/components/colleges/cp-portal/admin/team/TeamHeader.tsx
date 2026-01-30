
import React from 'react';
import { FileText, UploadCloud, UserPlus } from 'lucide-react';

/**
 * Component Name: TeamHeader
 * Directory: components/colleges/cp-portal/admin/team/TeamHeader.tsx
 * 
 * Functionality:
 * - Displays the section title and description.
 * - Provides buttons for downloading the CSV template.
 * - Provides the Bulk Upload file input trigger.
 * - Provides the "Add Member" button.
 * 
 * Used In: ManageTeam
 */

interface TeamHeaderProps {
    onDownloadTemplate: () => void;
    onBulkUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddMember: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({ 
    onDownloadTemplate, onBulkUpload, onAddMember, fileInputRef 
}) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Placement Team (Sub-TPOs)</h2>
                <p className="text-gray-500 text-sm mt-1">Manage staff members who can post jobs and view students.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button onClick={onDownloadTemplate} className="px-4 py-2 border rounded-lg text-gray-600 bg-white hover:bg-gray-50 font-bold flex items-center justify-center gap-2 w-full sm:w-auto text-xs" title="Download Template">
                    <FileText size={16}/> Template
                </button>
                <label className="px-4 py-2 border rounded-lg text-gray-700 font-bold hover:bg-gray-50 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer bg-white">
                    <UploadCloud size={16}/> Bulk Upload
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={onBulkUpload} 
                        onClick={(e) => (e.currentTarget.value = '')} 
                    />
                </label>
                <button onClick={onAddMember} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto">
                    <UserPlus size={16}/> Add Member
                </button>
            </div>
        </div>
    );
};
