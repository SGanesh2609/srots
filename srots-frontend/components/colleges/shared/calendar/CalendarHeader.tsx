
import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Grid, Layout, List } from 'lucide-react';
import { getStartOfWeek, MONTH_NAMES } from '../../../../utils/calendarHelpers';

/**
 * Component Name: CalendarHeader
 * Directory: components/colleges/shared/calendar/CalendarHeader.tsx
 * 
 * Functionality:
 * - Displays the current date range based on the view mode (Month name, Week range, or Specific Date).
 * - Provides navigation buttons (Previous/Next) to change the date.
 * - Allows switching between 'Month', 'Week', and 'Day' views.
 * - Renders the "New Event" button for authorized users.
 * 
 * Used In: CalendarView
 */

interface CalendarHeaderProps {
    currentDate: Date;
    viewMode: 'Month' | 'Week' | 'Day';
    onNext: () => void;
    onPrev: () => void;
    onViewChange: (mode: 'Month' | 'Week' | 'Day') => void;
    onAddEvent: () => void;
    canEdit: boolean;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
    currentDate, viewMode, onNext, onPrev, onViewChange, onAddEvent, canEdit 
}) => {
    
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-4 bg-white border-b sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button onClick={onPrev} className="p-1.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 text-gray-700 transition-all"><ChevronLeft size={18}/></button>
                    <button onClick={onNext} className="p-1.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 text-gray-700 transition-all"><ChevronRight size={18}/></button>
                </div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 min-w-[200px]">
                    {viewMode === 'Month' && `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                    {viewMode === 'Week' && `Week of ${getStartOfWeek(currentDate).toLocaleDateString()}`}
                    {viewMode === 'Day' && currentDate.toDateString()}
                </h2>
            </div>
            
            <div className="flex gap-2">
                <div className="flex bg-gray-100 rounded-lg p-1 border">
                    {['Month', 'Week', 'Day'].map(mode => (
                        <button 
                            key={mode} 
                            onClick={() => onViewChange(mode as any)} 
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${viewMode === mode ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {mode === 'Month' && <Grid size={14}/>}
                            {mode === 'Week' && <Layout size={14}/>}
                            {mode === 'Day' && <List size={14}/>}
                            {mode}
                        </button>
                    ))}
                </div>
                {canEdit && (
                    <button 
                        onClick={onAddEvent} 
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm text-xs"
                    >
                        <Plus size={16}/> New Event
                    </button>
                )}
            </div>
        </div>
    );
};
