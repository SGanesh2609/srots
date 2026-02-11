import api from './api';
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
            createdBy: user.fullName, 
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

    createNotice: async (notice: Partial<Notice>, user: User) => {
        const response = await api.post('/notices', { 
            ...notice, 
            collegeId: user.collegeId, 
            createdBy: user.fullName
        });
        return response.data;
    },

    updateNotice: async (notice: Notice) => {
        const payload = {
            ...notice,
            // Ensure date is a simple string YYYY-MM-DD
            date: typeof notice.date === 'string' ? notice.date.split('T')[0] : notice.date,
            // Make sure collegeId is present for the @PreAuthorize check
            collegeId: notice.collegeId 
        };
        
        const response = await api.put(`/notices/${notice.id}`, payload);
        return response.data;
    },

    deleteNotice: async (id: string) => {
        await api.delete(`/notices/${id}`);
    },

    uploadFile: async (file: File, category: string = 'Calendar') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        // Assuming backend derives collegeCode from auth, no need to send
        
        const response = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.url;  // Assuming returns {url, name}, but we need url
    },

    canManageEvent: (event: CalendarEvent, user: User): boolean => {
        if (user.role === Role.ADMIN || user.role === Role.SROTS_DEV) return true;
        if (user.role === Role.CPH && user.collegeId === event.collegeId) return true;
        if (user.role === Role.STAFF && event.createdById === user.id && user.collegeId === event.collegeId) return true;
        return false;
    },

    canManageNotice: (notice: Notice, user: User): boolean => {
        if (user.role === Role.ADMIN || user.role === Role.SROTS_DEV) return true;
        if (user.role === Role.CPH && user.collegeId === notice.collegeId) return true;
        if (user.role === Role.STAFF && notice.createdById === user.id && user.collegeId === notice.collegeId) return true;
        return false;
    }
};