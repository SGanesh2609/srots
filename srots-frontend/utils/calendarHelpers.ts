
import { CalendarEvent } from '../types';

/**
 * Utility: Calendar Helpers
 * Directory: /utils/calendarHelpers.ts
 * 
 * Functionality:
 * - Centralized logic for date comparison, range checking, and UI styling for calendar events.
 * - Shared constants for Calendar UI.
 */

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const getEventTypeColor = (type: string) => {
    switch(type) {
        case 'Drive': return 'bg-red-100 text-red-800 border-red-200';
        case 'Time Table': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'Holiday': return 'bg-green-100 text-green-800 border-green-200';
        case 'Exam': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Training': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case 'Workshop': return 'bg-teal-100 text-teal-800 border-teal-200';
        default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
};

export const isDateInEventRange = (date: Date, event: CalendarEvent) => {
    const checkDate = new Date(date.toDateString());
    const startDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);
    return checkDate >= startDate && checkDate <= endDate;
};

export const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

export const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
};
