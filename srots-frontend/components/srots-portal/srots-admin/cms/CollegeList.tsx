
import React from 'react';
import { College } from '../../../../types';
import { Building, Download, Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { CollegeService } from '../../../../services/collegeService';

/**
 * Component Name: CollegeList
 * Directory: components/srots-portal/srots-admin/cms/CollegeList.tsx
 * 
 * Functionality:
 * - Displays a grid of registered colleges for Srots Admins.
 * - **Features**: Search input (calls parent), Add/Edit/Delete actions.
 * - **Updates**: Removed local filtering. Search input now triggers parent callback to query Backend.
 * 
 * Used In: CMSManagement
 */

interface CollegeListProps {
    colleges: College[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSelect: (id: string) => void;
    onEdit: (college: College) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

export const CollegeList: React.FC<CollegeListProps> = ({ 
    colleges, searchQuery, onSearchChange, onSelect, onEdit, onDelete, onAdd 
}) => {

    const handleDownloadList = (type: 'students' | 'cp_admin') => {
        try {
            CollegeService.exportMasterList(type);
        } catch (e: any) {
            alert(e.message);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div><h2 className="text-2xl font-bold text-gray-800">CMS - Colleges</h2><p className="text-gray-500">Manage registered colleges and their accounts.</p></div>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"><Plus size={16} /> Onboard College</button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by college name or code..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900" 
                        value={searchQuery} 
                        onChange={(e) => onSearchChange(e.target.value)} 
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => handleDownloadList('students')} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm font-bold text-sm">
                        <Download size={16} /> Master Students
                    </button>
                    <button onClick={() => handleDownloadList('cp_admin')} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm font-bold text-sm">
                        <Download size={16} /> Master CP Admins
                    </button>
                </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {colleges.map((college) => (
                    <div key={college.id} onClick={() => onSelect(college.id)} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 group relative">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 z-10 transition-opacity">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onEdit(college); }}
                                className="p-2 text-blue-600 hover:bg-blue-50 bg-white rounded-full shadow-sm border border-gray-100 transition-all hover:scale-105"
                                title="Edit College"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(college.id); }}
                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 bg-white rounded-full shadow-sm border border-gray-100 transition-all hover:scale-105"
                                title="Delete College"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <img src={college.logo} alt={college.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50 border" />
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors" title={college.name}>{college.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">{college.code}</span>
                                    {college.type && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border">{college.type}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2 line-clamp-1"><Building size={16} className="shrink-0 text-gray-400" /> {college.address}</p>
                            <div className="flex justify-between mt-4 pt-4 border-t">
                                <div className="text-center"><span className="block font-bold text-gray-900">{college.studentCount}</span><span className="text-xs text-gray-500">Students</span></div>
                                <div className="text-center"><span className="block font-bold text-gray-900">{college.cphCount}</span><span className="text-xs text-gray-500">CP Admins</span></div>
                                <div className="text-center"><span className="block font-bold text-green-600">{college.activeJobs}</span><span className="text-xs text-gray-500">Active Jobs</span></div>
                            </div>
                        </div>
                    </div>
                ))}
                {colleges.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                        <Building size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No colleges found matching "{searchQuery}".</p>
                    </div>
                )}
            </div>
        </div>
    );
};
