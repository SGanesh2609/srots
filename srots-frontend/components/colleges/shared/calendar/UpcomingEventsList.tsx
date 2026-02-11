import React from 'react';
import { CalendarEvent, User } from '../../../../types';
import { Calendar as CalendarIcon, Clock, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { getEventTypeColor } from '../../../../utils/calendarHelpers';
import { CalendarService } from '../../../../services/calendarService';

interface UpcomingEventsListProps {
    events: CalendarEvent[];
    user: User;
    onViewEvent: (event: CalendarEvent) => void;
    onEditEvent: (e: React.MouseEvent, event: CalendarEvent) => void;
    onDeleteEvent: (e: React.MouseEvent, id: string) => void;
}

export const UpcomingEventsList: React.FC<UpcomingEventsListProps> = ({ 
    events, user, 
    onViewEvent, onEditEvent, onDeleteEvent 
}) => {

    return (
        <div className="mt-6 bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CalendarIcon className="text-blue-600"/> Upcoming Schedule
            </h3>
            
            {events.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
                    No upcoming events scheduled.
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map(evt => (
                        <div 
                            key={evt.id} 
                            onClick={() => onViewEvent(evt)}
                            className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50 group relative cursor-pointer"
                        >
                            {CalendarService.canManageEvent(evt, user) && (
                                <div className="absolute top-2 right-2 flex gap-1 z-50 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex bg-white shadow-sm border border-gray-200 rounded p-0.5">
                                        <button type="button" onClick={(e) => onEditEvent(e, evt)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} className="pointer-events-none"/></button>
                                        <button type="button" onClick={(e) => onDeleteEvent(e, evt.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} className="pointer-events-none"/></button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex gap-4 items-start mb-2">
                                <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold shrink-0 ${evt.type === 'Holiday' ? 'bg-green-500' : 'bg-blue-600'}`}>
                                    <span className="text-[10px] uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-lg leading-none">{new Date(evt.date).getDate()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate" title={evt.title}>{evt.title}</h4>
                                    <div className="flex items-center gap-2 mt-1 mb-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getEventTypeColor(evt.type)}`}>{evt.type}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                        <Clock size={12}/> 
                                        {evt.startTime ? `${evt.startTime} - ${evt.endTime || 'End'}` : 'All Day'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">Created by: {evt.createdBy}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-700 line-clamp-3">
                                {evt.description}
                            </div>
                            {evt.description && evt.description.length > 100 && (
                                <div className="text-blue-600 text-xs font-bold mt-2 flex items-center gap-1">
                                    See more <ChevronRight size={12}/>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};