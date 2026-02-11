import React from 'react';
import { CalendarEvent, User } from '../../../../types';
import { Calendar as CalendarIcon, Clock, User as UserIcon, Edit2, Trash2 } from 'lucide-react';
import { isDateInEventRange, getEventTypeColor } from '../../../../utils/calendarHelpers';
import { CalendarService } from '../../../../services/calendarService';

interface DayViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    user: User;
    onViewEvent: (event: CalendarEvent) => void;
    onEditEvent: (e: React.MouseEvent, event: CalendarEvent) => void;
    onDeleteEvent: (e: React.MouseEvent, id: string) => void;
}

export const DayView: React.FC<DayViewProps> = ({ 
    currentDate, events, user, 
    onViewEvent, onEditEvent, onDeleteEvent 
}) => {
    const dayEvents = events.filter(e => isDateInEventRange(currentDate, e));
    const sortedEvents = dayEvents.sort((a,b) => (a.startTime || '').localeCompare(b.startTime || ''));

    return (
        <div className="flex-1 bg-white p-6 overflow-y-auto animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                <CalendarIcon className="text-blue-600" size={20}/> 
                Schedule for {currentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>

            {sortedEvents.length === 0 ? (
                <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">
                    No events scheduled for this day.
                </div>
            ) : (
                <div className="space-y-6">
                    {sortedEvents.map(evt => (
                        <div key={evt.id} className="relative pl-6 border-l-2 border-gray-200 hover:border-blue-300 transition-colors group pb-4">
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${evt.type === 'Time Table' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                            
                            <div className="bg-white border rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getEventTypeColor(evt.type)}`}>{evt.type}</span>
                                            <h4 className="text-base font-bold text-gray-900">{evt.title}</h4>
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-3">
                                            {evt.startTime && <span className="flex items-center gap-1 font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded"><Clock size={12}/> {evt.startTime} - {evt.endTime || 'N/A'}</span>}
                                            <span className="flex items-center gap-1"><UserIcon size={12}/> {evt.postedBy}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        {CalendarService.canManageEvent(evt, user) && (
                                            <>
                                                <button type="button" onClick={(e) => onEditEvent(e, evt)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                                                <button type="button" onClick={(e) => onDeleteEvent(e, evt.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};