
import React from 'react';
import { Search } from 'lucide-react';

/**
 * Component Name: JobFilterBar
 * Directory: components/colleges/cp-portal/jobs/lists/JobFilterBar.tsx
 * 
 * Functionality:
 * - Provides the search input for filtering jobs by title or company.
 * - Toggles between "All Jobs" and "My Jobs" (for specific CP Staff/Admin).
 * - Renders filter pills for "Job Type" and "Work Mode".
 * 
 * Used In: JobsSection (List View)
 */

interface JobFilterBarProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    jobOwnerFilter: 'all' | 'my';
    setJobOwnerFilter: (val: 'all' | 'my') => void;
    filterTypes: string[];
    toggleFilterType: (type: string) => void;
    filterModes: string[];
    toggleFilterMode: (mode: string) => void;
}

export const JobFilterBar: React.FC<JobFilterBarProps> = ({
    searchQuery, setSearchQuery,
    jobOwnerFilter, setJobOwnerFilter,
    filterTypes, toggleFilterType,
    filterModes, toggleFilterMode
}) => {
    return (
        <div className="bg-white p-3 rounded-lg border shadow-sm mb-2 flex flex-col gap-2">
            <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        className="w-full pl-9 pr-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
                        placeholder="Search by Job Title or Company..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                </div>
                <div className="flex bg-gray-100 rounded p-0.5 shrink-0">
                    <button 
                        onClick={() => setJobOwnerFilter('all')} 
                        className={`px-3 py-1 text-xs font-bold rounded transition-all ${jobOwnerFilter === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setJobOwnerFilter('my')} 
                        className={`px-3 py-1 text-xs font-bold rounded transition-all ${jobOwnerFilter === 'my' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        My Jobs
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Type:</span>
                {['Full-Time', 'Internship', 'Part-Time', 'Contract'].map(type => (
                    <button 
                        key={type} 
                        onClick={() => toggleFilterType(type)} 
                        className={`px-2.5 py-0.5 text-[10px] rounded-full border transition-all font-bold ${filterTypes.includes(type) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        {type}
                    </button>
                ))}
                <div className="w-px h-3 bg-gray-300 mx-1 shrink-0"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Mode:</span>
                {['On-site', 'Remote', 'Hybrid'].map(mode => (
                    <button 
                        key={mode} 
                        onClick={() => toggleFilterMode(mode)} 
                        className={`px-2.5 py-0.5 text-[10px] rounded-full border transition-all font-bold ${filterModes.includes(mode) ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>
    );
};
