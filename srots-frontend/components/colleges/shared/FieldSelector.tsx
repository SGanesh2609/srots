
import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';

/**
 * Component Name: FieldSelector
 * Directory: components/colleges/shared/FieldSelector.tsx
 * 
 * Functionality:
 * - A reusable UI for selecting items from a list.
 * - Features:
 *   - "Common/Standard" section with checkboxes for quick access.
 *   - Searchable Dropdown for finding and adding specific items.
 *   - "Selected" section displaying active items as removable tags.
 * - Visuals: Configurable color themes (blue, yellow, red, etc.).
 * 
 * Used In: JobWizard, CustomGathering, GlobalReportExtractor
 */

export interface FieldOption {
    value: string;
    label: string;
    category?: string;
}

interface FieldSelectorProps {
    selectedFields: string[];
    onToggle: (value: string) => void;
    options: FieldOption[];
    commonIds?: string[]; // Values to show as quick checkboxes
    labels?: {
        title?: React.ReactNode;
        description?: string;
        commonSection?: string;
        searchSection?: string;
        selectedSection?: string;
        searchPlaceholder?: string;
    };
    colorTheme?: 'blue' | 'yellow' | 'red' | 'purple';
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({ 
    selectedFields, onToggle, options, commonIds = [], 
    labels, colorTheme = 'blue' 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Use shared hook to close dropdown when clicking outside
    useClickOutside(dropdownRef, () => {
        setIsDropdownOpen(false);
    });

    // Theme Config
    const themes = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800', ring: 'focus:ring-blue-100', tagBg: 'bg-blue-100', tagText: 'text-blue-800', checkbox: 'text-blue-600' },
        yellow: { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-800', ring: 'focus:ring-yellow-400', tagBg: 'bg-yellow-100', tagText: 'text-yellow-800', checkbox: 'text-yellow-600' },
        red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-800', ring: 'focus:ring-red-100', tagBg: 'bg-red-100', tagText: 'text-red-800', checkbox: 'text-red-600' },
        purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-800', ring: 'focus:ring-purple-100', tagBg: 'bg-purple-100', tagText: 'text-purple-800', checkbox: 'text-purple-600' }
    };
    const theme = themes[colorTheme];

    // Filter available options for search
    const filteredOptions = options.filter(opt => 
        !selectedFields.includes(opt.value) &&
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`${theme.bg} p-4 rounded-lg border ${theme.border} space-y-4`}>
            {labels?.title && (
                <div>
                    <h4 className={`font-bold ${theme.text} text-sm mb-1`}>{labels.title}</h4>
                    {labels.description && <p className={`text-xs ${theme.text} opacity-80`}>{labels.description}</p>}
                </div>
            )}

            {/* Common Fields Checkboxes */}
            {commonIds.length > 0 && (
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{labels?.commonSection || 'Standard Fields'}</label>
                    <div className="flex flex-wrap gap-2">
                        {commonIds.map(id => {
                            const opt = options.find(o => o.value === id);
                            if (!opt) return null;
                            return (
                                <label key={id} className={`flex items-center gap-2 bg-white px-3 py-1.5 rounded border text-sm cursor-pointer hover:bg-gray-50 transition-colors`}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedFields.includes(id)} 
                                        onChange={() => onToggle(id)} 
                                        className={`rounded focus:ring-0 ${theme.checkbox}`}
                                    />
                                    <span className="text-gray-900">{opt.label}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Search Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{labels?.searchSection || 'Add Specific Field'}</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        className={`w-full pl-9 p-2 border rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 ${theme.ring}`} 
                        placeholder={labels?.searchPlaceholder || "Search..."}
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
                        onFocus={() => setIsDropdownOpen(true)}
                    />
                    {isDropdownOpen && searchTerm && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl rounded-lg mt-1 z-20 max-h-48 overflow-y-auto custom-scrollbar">
                            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                                <div 
                                    key={opt.value} 
                                    className={`p-2 hover:${theme.bg} cursor-pointer text-sm flex justify-between items-center border-b border-gray-50 last:border-0 text-gray-800`}
                                    onClick={() => { onToggle(opt.value); setSearchTerm(''); }}
                                >
                                    <span className="font-medium">{opt.label}</span>
                                    {opt.category && <span className="text-[10px] text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded">{opt.category}</span>}
                                </div>
                            )) : <div className="p-3 text-xs text-gray-400 text-center">No matching fields found.</div>}
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Summary Tags */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                    {labels?.selectedSection || 'Selected'} ({selectedFields.length})
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[50px]">
                    {selectedFields.length > 0 ? selectedFields.map(field => {
                        const opt = options.find(o => o.value === field);
                        const label = opt ? opt.label : field;
                        return (
                            <span key={field} className={`${theme.tagBg} ${theme.tagText} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-transparent`}>
                                {label}
                                <button onClick={() => onToggle(field)} className="hover:text-red-600 rounded-full p-0.5"><X size={12}/></button>
                            </span>
                        );
                    }) : <span className="text-xs text-gray-400 italic">No fields selected.</span>}
                </div>
            </div>
        </div>
    );
};
