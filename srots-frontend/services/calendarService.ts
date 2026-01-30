
import api from './api';
// Fix: Import Role to support permission logic in canManageEvent
import { CalendarEvent, Notice, User, Role } from '../types';

export const CalendarService = {
    getEvents: async (collegeId: string, upcoming?: boolean): Promise<CalendarEvent[]> => {
        const response = await api.get('/events', { params: { collegeId, upcoming } });
        return response.data;
    },

    getUpcomingEvents: async (collegeId: string): Promise<CalendarEvent[]> => {
        const response = await api.get('/events', { params: { collegeId, upcoming: 'true' } });
        return response.data;
    },

    createEvent: async (event: Partial<CalendarEvent>, user: User) => {
        const response = await api.post('/events', { 
            ...event, 
            collegeId: user.collegeId, 
            // Fix: Use user.fullName instead of user.name
            postedBy: user.fullName, 
            createdById: user.id 
        });
        return response.data;
    },

    updateEvent: async (event: CalendarEvent) => {
        const response = await api.put(`/events/${event.id}`, event);
        return response.data;
    },

    deleteEvent: async (id: string) => {
        await api.delete(`/events/${id}`);
    },

    getNotices: async (collegeId: string): Promise<Notice[]> => {
        const response = await api.get('/notices', { params: { collegeId } });
        return response.data;
    },

    createNotice: async (notice: Partial<Notice>, user: User, file?: File) => {
        const formData = new FormData();
        Object.keys(notice).forEach(key => formData.append(key, (notice as any)[key]));
        formData.append('collegeId', user.collegeId || '');
        // Fix: Use user.fullName instead of user.name
        formData.append('postedBy', user.fullName);
        if (file) formData.append('file', file);
        
        const response = await api.post('/notices', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteNotice: async (id: string) => {
        await api.delete(`/notices/${id}`);
    },

    // Fix: Added missing canManageEvent method used by DayView, UpcomingEventsList, and EventDetailModal
    canManageEvent: (event: CalendarEvent, user: User): boolean => {
        if (user.role === Role.ADMIN) return true;
        if (user.role === Role.CPH && user.collegeId === event.collegeId) return true;
        return event.createdById === user.id;
    }
};
