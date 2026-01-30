
import React from 'react';
import { CalendarEvent } from '../../../../types';
import { getStartOfWeek, isDateInEventRange, isSameDay, getEventTypeColor, DAYS_OF_WEEK } from '../../../../utils/calendarHelpers';

/**
 * Component Name: WeekView
 * Directory: components/colleges/shared/calendar/WeekView.tsx
 * 
 * Functionality:
 * - Renders a 7-column layout representing the current week.
 * - Includes a time gutter (8 AM to 8 PM).
 * - Maps events to specific days and time slots.
 * 
 * Used In: CalendarView
 */

interface WeekViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onViewEvent: (event: CalendarEvent) => void;
}

const hoursOfDay = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

export const WeekView: React.FC<WeekViewProps> = ({ currentDate, events, onViewEvent }) => {

    const startOfWeek = getStartOfWeek(currentDate);
    const weekDates = Array.from({length: 7}, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        return d;
    });

    return (
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden animate-in fade-in">
            <div className="flex border-b divide-x divide-gray-100 bg-gray-50 flex-none">
                <div className="w-12 p-2 flex-none border-r bg-gray-100/50"></div>
                {weekDates.map(date => {
                    const isToday = isSameDay(date, new Date());
                    return (
                        <div key={date.toString()} className={`flex-1 py-2 text-center ${isToday ? 'bg-blue-50' : ''}`}>
                            <div className="text-[10px] font-bold text-gray-500 uppercase">{DAYS_OF_WEEK[date.getDay()]}</div>
                            <div className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>{date.getDate()}</div>
                        </div>
                    );
                })}
            </div>
            <div className="flex-1 overflow-y-auto relative">
                {hoursOfDay.map(hour => (
                    <div key={hour} className="flex border-b h-16">
                        <div className="w-12 flex-none border-r text-[10px] text-gray-400 p-1 text-right font-medium bg-gray-50/30">
                            {hour}:00
                        </div>
                        {weekDates.map(date => {
                            const dayEvents = events.filter(e => isDateInEventRange(date, e));
                            const hourEvents = dayEvents.filter(e => {
                                if(!e.startTime) return false;
                                const evtHour = parseInt(e.startTime.split(':')[0]);
                                return evtHour === hour;
                            });
                            
                            return (
                                <div key={date.toString()} className="flex-1 border-r relative p-0.5">
                                    {hourEvents.map(evt => (
                                        <div 
                                            key={evt.id} 
                                            onClick={() => onViewEvent(evt)}
                                            className={`absolute top-0.5 left-0.5 right-0.5 z-10 rounded p-1 text-[9px] font-bold border shadow-sm cursor-pointer hover:shadow-md transition-all ${getEventTypeColor(evt.type)}`}
                                            style={{ minHeight: '3.5rem' }}
                                        >
                                            <div className="truncate">{evt.title}</div>
                                            <div className="opacity-80 font-normal">{evt.startTime} - {evt.endTime}</div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
