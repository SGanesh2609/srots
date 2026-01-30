
import React from 'react';
import { Edit2, Trash2, Clock, UserCheck } from 'lucide-react';
import { CollegeAboutSection } from '../../../../types';

/**
 * Component Name: AboutSectionItem
 * Directory: components/colleges/shared/about-college/AboutSectionItem.tsx
 * 
 * Functionality:
 * - Displays a single content section (Title, Text, Image).
 * - Shows Edit and Delete actions if user is an editor.
 * - NEW: Shows granular audit metadata (who edited THIS specific section) ONLY to CPH.
 * 
 * Used In: AboutCollegeComponent
 */

interface AboutSectionItemProps {
    section: CollegeAboutSection;
    isEditor: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export const AboutSectionItem: React.FC<AboutSectionItemProps> = ({ section, isEditor, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-8 rounded-xl border shadow-sm group relative hover:shadow-md transition-shadow flex flex-col">
            {isEditor && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2 rounded shadow-sm border z-10">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors" title="Edit this section"><Edit2 size={16}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors" title="Delete this section"><Trash2 size={16}/></button>
                </div>
            )}
            
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 inline-block border-blue-100">{section.title}</h3>
            
            <div className="flex flex-col md:flex-row gap-8 flex-1">
                <div className="flex-1 prose text-gray-600 leading-relaxed whitespace-pre-line text-base">
                    {section.content}
                </div>
                {section.image && (
                    <div className="md:w-1/3 shrink-0">
                        <img src={section.image} alt={section.title} className="w-full rounded-xl shadow-sm object-cover h-64 hover:scale-[1.02] transition-transform duration-300" />
                    </div>
                )}
            </div>

            {/* Granular Section Audit Footer - Restricted to CPH only */}
            {isEditor && section.lastModifiedBy && (
                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <UserCheck size={12} className="text-blue-400"/>
                        Section Modified By: <span className="text-gray-700">{section.lastModifiedBy}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={12}/>
                        Last Updated: <span>{section.lastModifiedAt}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
