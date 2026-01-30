
import React from 'react';
import { CalendarEvent, User } from '../../../../types';
import { Modal } from '../../../common/Modal';
import { Calendar as CalendarIcon, Clock, Edit2, Trash2 } from 'lucide-react';
import { getEventTypeColor } from '../../../../utils/calendarHelpers';
import { CalendarService } from '../../../../services/calendarService';

interface EventDetailModalProps {
    event: CalendarEvent | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (e: React.MouseEvent, event: CalendarEvent) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    user: User;
    canEditGlobal: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ 
    event, isOpen, onClose, onEdit, onDelete, user, canEditGlobal 
}) => {
    if (!event) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${event.type} Details`} maxWidth="max-w-md">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className={`h-1 ${getEventTypeColor(event.type).split(' ')[0]} w-full`}></div>
                <div className="p-6 space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                        <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-1">
                            <CalendarIcon size={14}/> 
                            {event.date} {event.endDate ? `to ${event.endDate}` : ''}
                        </p>
                        {event.startTime && <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-1"><Clock size={14}/> {event.startTime} - {event.endTime}</p>}
                    </div>
                    {event.description && <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border">{event.description}</div>}
                    <div className="pt-4 border-t flex justify-end gap-2">
                        {CalendarService.canManageEvent(event, user) && (
                            <>
                                <button type="button" onClick={(e) => onEdit(e, event)} className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50"><Edit2 size={16}/> Edit</button>
                                <button type="button" onClick={(e) => onDelete(e, event.id)} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50"><Trash2 size={16}/> Delete</button>
                            </>
                        )}
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200">Close</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
