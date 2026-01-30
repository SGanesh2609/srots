
import React from 'react';
import { Search, Filter, Briefcase } from 'lucide-react';

/**
 * Component Name: JobFilters
 * Directory: components/colleges/student-portal/jobs/JobFilters.tsx
 * 
 * Functionality:
 * - Provides UI controls for filtering the student job list.
 * - **Search**: Input for filtering by title/company.
 * - **Tabs**: Switch between 'Not Applied', 'For You', 'Applied', etc.
 * - **Type Filters**: Filter pills for 'Full-Time', 'Internship'.
 * - **Mode Filters**: Filter pills for 'Remote', 'Hybrid'.
 * 
 * Used In: StudentJobs
 */

interface JobFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: string;
    setStatusFilter: (status: any) => void;
    typeFilters: string[];
    toggleTypeFilter: (type: string) => void;
    workModeFilters: string[];
    toggleWorkModeFilter: (mode: string) => void;
    handleMobileTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({ 
    searchQuery, setSearchQuery, statusFilter, setStatusFilter, 
    typeFilters, toggleTypeFilter, 
    workModeFilters, toggleWorkModeFilter,
    handleMobileTypeChange 
}) => {
    return (
        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border shadow-sm">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Job Opportunities</h2>
                {/* Search - Full width on mobile */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
                        placeholder="Search jobs..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                </div>
            </div>

            {/* DESKTOP FILTERS (md:flex) */}
            <div className="hidden md:flex flex-col lg:flex-row justify-between gap-4">
                {/* Status Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg self-start overflow-x-auto no-scrollbar">
                    {[
                        { id: 'not-applied', label: 'Not Applied' },
                        { id: 'recommended', label: 'For You' },
                        { id: 'applied', label: 'Applied' },
                        { id: 'expired', label: 'Expired' },
                        { id: 'all', label: 'All Jobs' },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id as any)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${statusFilter === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 items-center">
                    {/* Type Filter Pills */}
                    <div className="flex gap-2 items-center overflow-x-auto no-scrollbar pb-1">
                        <span className="text-gray-400 text-xs font-bold uppercase mr-1 flex items-center gap-1"><Filter size={12}/> Type:</span>
                        {['Full-Time', 'Internship', 'Part-Time'].map(type => (
                            <button 
                                key={type} 
                                onClick={() => toggleTypeFilter(type)} 
                                className={`px-3 py-1 text-xs font-bold rounded-full border transition-all whitespace-nowrap ${typeFilters.includes(type) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-4 bg-gray-300"></div>

                    {/* Mode Filter Pills */}
                    <div className="flex gap-2 items-center overflow-x-auto no-scrollbar pb-1">
                        <span className="text-gray-400 text-xs font-bold uppercase mr-1 flex items-center gap-1"><Briefcase size={12}/> Mode:</span>
                        {['On-site', 'Remote', 'Hybrid'].map(mode => (
                            <button 
                                key={mode} 
                                onClick={() => toggleWorkModeFilter(mode)} 
                                className={`px-3 py-1 text-xs font-bold rounded-full border transition-all whitespace-nowrap ${workModeFilters.includes(mode) ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MOBILE FILTERS (flex md:hidden) */}
            <div className="flex flex-col gap-3 md:hidden">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">View Jobs By</label>
                        <select 
                            className="w-full p-2 border rounded-lg text-sm bg-white text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-100"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <optgroup label="Discover">
                                <option value="not-applied">Not Applied</option>
                                <option value="recommended">For You</option>
                                <option value="all">All Jobs</option>
                            </optgroup>
                            <optgroup label="History">
                                <option value="applied">Applied</option>
                                <option value="expired">Expired</option>
                            </optgroup>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Filter Type</label>
                        <select 
                            className="w-full p-2 border rounded-lg text-sm bg-white text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-100"
                            value={typeFilters.length === 1 ? typeFilters[0] : 'All'}
                            onChange={handleMobileTypeChange}
                        >
                            <option value="All">All Types</option>
                            <option value="Full-Time">Full-Time</option>
                            <option value="Internship">Internship</option>
                            <option value="Part-Time">Part-Time</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
