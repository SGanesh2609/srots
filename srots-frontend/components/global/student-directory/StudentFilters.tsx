
import React from 'react';
import { Search, FileSpreadsheet, UserPlus, UploadCloud, FileText } from 'lucide-react';
import { Branch } from '../../../types';
import { StudentService } from '../../../services/studentService';

interface StudentFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    yearFilter: string;
    setYearFilter: (year: string) => void;
    branchFilter: string;
    setBranchFilter: (branch: string) => void;
    collegeBranches: Branch[];
    canManage: boolean;
    onDownloadReport: () => void;
    onAdd: () => void;
    onDownloadSample: () => void;
    collegeId: string; // Needed for upload
    onRefresh: () => void;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
    searchQuery, setSearchQuery, yearFilter, setYearFilter, branchFilter, setBranchFilter,
    collegeBranches, canManage, onDownloadReport, onAdd, onDownloadSample,
    collegeId, onRefresh
}) => {
    const currentYear = new Date().getFullYear();
    const filterYears = Array.from({ length: 9 }, (_, i) => currentYear - 4 + i);

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                // UI only calls the service
                const result = await StudentService.bulkUploadStudents(e.target.files[0], collegeId);
                alert(`Upload Complete!\nCreated: ${result.created}\nUpdated: ${result.updated}`);
                
                // CRITICAL FIX: Trigger the refresh callback to update parent state (Dashboard Counters)
                if (onRefresh) onRefresh(); 
                
            } catch (err: any) {
                console.error(err);
                alert("Error processing file: " + err.message);
            }
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-1">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        placeholder="Search Name/Roll..." 
                        className="border rounded-lg pl-9 pr-4 py-2 w-full outline-none focus:ring-2 focus:ring-blue-100 bg-white text-gray-900" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select className="border rounded-lg px-3 py-2 text-sm flex-1 md:flex-none md:w-32 lg:w-auto bg-white text-gray-900" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                        <option value="All">All Years</option>
                        {filterYears.map(year => (
                            <option key={year} value={year.toString()}>{year}</option>
                        ))}
                    </select>
                    <select className="border rounded-lg px-3 py-2 text-sm flex-1 md:flex-none md:w-40 lg:w-auto bg-white text-gray-900" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
                        <option value="All">All Branches</option>{collegeBranches.map(b => <option key={b.code} value={b.code}>{b.code}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
                <button onClick={onDownloadReport} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2 font-bold text-sm hover:bg-green-100 whitespace-nowrap">
                    <FileSpreadsheet size={16}/> Report
                </button>
                
                {canManage && (
                    <>
                        <button onClick={onAdd} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md text-sm font-bold whitespace-nowrap">
                            <UserPlus size={18} /> Add
                        </button>
                        <label className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-bold cursor-pointer shadow-sm whitespace-nowrap">
                            <UploadCloud size={16} /> Upload CSV
                            <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
                        </label>
                        <button onClick={onDownloadSample} className="px-3 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 text-gray-600 text-xs font-bold" title="Template">
                            <FileText size={16}/>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
