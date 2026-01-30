
import React from 'react';
import { CalendarEvent } from '../../../../types';
import { isDateInEventRange, isSameDay, getEventTypeColor, DAYS_OF_WEEK } from '../../../../utils/calendarHelpers';

/**
 * Component Name: MonthView
 * Directory: components/colleges/shared/calendar/MonthView.tsx
 * 
 * Functionality:
 * - Renders a standard 7-column calendar grid for the selected month.
 * - Displays events as small pills within each day cell.
 * - Handles day clicks or event clicks to view details.
 * - Highlights the current day.
 * 
 * Used In: CalendarView
 */

interface MonthViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onViewEvent: (event: CalendarEvent) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, onViewEvent }) => {
    
    // Helpers
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    
    const days = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden animate-in fade-in">
            <div className="grid grid-cols-7 border-b divide-x divide-gray-100 bg-gray-50/50 flex-none">
                {DAYS_OF_WEEK.map(d => <div key={d} className="py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-gray-100 overflow-y-auto">
                {blanksArray.map(b => <div key={`b-${b}`} className="bg-gray-50/10 min-h-[80px]"></div>)}
                {daysArray.map(day => {
                    const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayEvents = events.filter(e => isDateInEventRange(currentDayDate, e));
                    const isToday = isSameDay(new Date(), currentDayDate);

                    return (
                        <div key={day} className={`p-1 min-h-[80px] hover:bg-gray-50 transition-colors relative group flex flex-col gap-1 ${isToday ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex justify-between items-start">
                                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                                    {day}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                                {dayEvents.slice(0, 3).map(evt => (
                                    <div 
                                        key={evt.id} 
                                        onClick={() => onViewEvent(evt)} 
                                        className={`text-[9px] px-1.5 py-0.5 rounded truncate font-medium cursor-pointer transition-all hover:opacity-80 ${getEventTypeColor(evt.type)}`} 
                                        title={evt.title}
                                    >
                                        {evt.startTime ? `${evt.startTime} ` : ''}{evt.title}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && <div className="text-[9px] text-gray-400 font-bold text-center">+{dayEvents.length - 3} more</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
