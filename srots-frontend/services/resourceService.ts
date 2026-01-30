
import api from './api';
import { Post, FreeCourse, CalendarEvent, Notice, User, Role, GlobalCompany, PostComment } from '../types';

/**
 * Tier 2: Resource Service
 * Logic: Manages shared components like Feed, Events, and external learning.
 */

export const ResourceService = {
    getSystemAnalytics: async () => {
        const response = await api.get('/analytics/system');
        return response.data;
    },

    // --- Srots Team Management ---
    searchSrotsTeam: async (query: string): Promise<User[]> => {
        const response = await api.get('/team/srots', { params: { query } });
        return response.data;
    },

    createSrotsUser: async (data: any) => {
        const response = await api.post('/team/srots', data);
        return response.data;
    },

    updateSrotsUser: async (data: User) => {
        const response = await api.put(`/team/srots/${data.id}`, data);
        return response.data;
    },

    toggleSrotsUserAccess: async (id: string) => {
        const response = await api.put(`/team/srots/${id}/access`);
        return response.data;
    },

    deleteSrotsUser: async (id: string) => {
        await api.delete(`/team/srots/${id}`);
    },

    // --- Social Feed ---
    searchPosts: async (collegeId: string, query: string, authorId?: string): Promise<Post[]> => {
        const response = await api.get('/posts', { params: { collegeId, query, authorId } });
        return response.data;
    },

    createPost: async (content: string, images: string[], docs: any[], user: User) => {
        const response = await api.post('/posts', { 
            content, images, documents: docs,
            collegeId: user.collegeId, authorId: user.id, 
            // Fix: Use user.fullName instead of user.name
            authorName: user.fullName, authorRole: user.role 
        });
        return response.data;
    },

    deletePost: async (id: string) => {
        await api.delete(`/posts/${id}`);
    },

    togglePostLike: async (postId: string, userId: string) => {
        await api.post(`/posts/${postId}/like`, { userId });
    },

    toggleCommentLike: async (postId: string, commentId: string, userId: string) => {
        await api.post(`/posts/${postId}/comments/${commentId}/like`, { userId });
    },

    toggleComments: async (postId: string) => {
        await api.post(`/posts/${postId}/comments-toggle`);
    },

    addComment: async (postId: string, text: string, user: User) => {
        // Fix: Use user.fullName instead of user.name if needed by backend, though payload sends full user
        await api.post(`/posts/${postId}/comments`, { text, user });
    },

    deleteComment: async (postId: string, commentId: string) => {
        await api.delete(`/posts/${postId}/comments/${commentId}`);
    },

    replyToComment: async (postId: string, commentId: string, text: string, user: User) => {
        await api.post(`/posts/${postId}/comments/${commentId}/reply`, { text, user });
    },

    // --- Companies Management ---
    searchGlobalCompanies: async (query: string, collegeId?: string): Promise<GlobalCompany[]> => {
        const response = await api.get('/companies', { params: { query, collegeId } });
        return response.data;
    },

    searchCollegeCompanies: async (collegeId: string, query: string): Promise<GlobalCompany[]> => {
        const response = await api.get('/companies', { params: { collegeId, query, linkedOnly: 'true' } });
        return response.data;
    },

    addCompanyToCollege: async (collegeId: string, companyId: string) => {
        await api.post('/companies/subscribe', { collegeId, companyId });
    },

    updateGlobalCompany: async (data: GlobalCompany) => {
        const response = await api.put(`/companies/${data.id}`, data);
        return response.data;
    },

    createGlobalCompany: async (data: any) => {
        const response = await api.post('/companies', data);
        return response.data;
    },

    deleteGlobalCompany: async (id: string) => {
        await api.delete(`/companies/${id}`);
    },

    removeCompanyFromCollege: async (collegeId: string, companyId: string) => {
        await api.delete(`/companies/subscribe/${collegeId}/${companyId}`);
    },

    // --- Learning ---
    searchFreeCourses: async (query: string, tech: string, platform: string, status: string): Promise<FreeCourse[]> => {
        const response = await api.get('/free-courses', { params: { query, technology: tech, platform, status } });
        return response.data;
    },

    getCourseCategories: async (): Promise<string[]> => {
        const response = await api.get('/free-courses/categories');
        return response.data;
    },

    getCoursePlatformsList: async (): Promise<string[]> => {
        const response = await api.get('/free-courses/platforms');
        return response.data;
    },

    toggleFreeCourseStatus: async (id: string) => {
        const response = await api.put(`/free-courses/${id}/status-toggle`);
        return response.data;
    },

    verifyFreeCourseLink: async (id: string) => {
        const response = await api.put(`/free-courses/${id}/verify`);
        return response.data;
    },

    deleteFreeCourse: async (id: string) => {
        await api.delete(`/free-courses/${id}`);
    },

    updateFreeCourse: async (course: FreeCourse) => {
        const response = await api.put(`/free-courses/${course.id}`, course);
        return response.data;
    },

    createFreeCourse: async (courseData: Partial<FreeCourse>, postedBy: string) => {
        const response = await api.post('/free-courses', { ...courseData, postedBy });
        return response.data;
    },

    // --- Calendar & Notices ---
    getEvents: async (collegeId: string, upcoming?: boolean): Promise<CalendarEvent[]> => {
        const response = await api.get('/events', { params: { collegeId, upcoming } });
        return response.data;
    },

    getUpcomingEvents: async (collegeId: string): Promise<CalendarEvent[]> => {
        const response = await api.get('/events', { params: { collegeId, upcoming: 'true' } });
        return response.data;
    },

    updateEvent: async (event: CalendarEvent) => {
        const response = await api.put(`/events/${event.id}`, event);
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

    // --- File Handling ---
    uploadFile: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData);
        return response.data.url;
    },

    // UI Policy Helpers
    canModeratePost: (user: User, post: any): boolean => {
        if (user.role === Role.ADMIN) return true;
        if (user.role === Role.CPH && user.collegeId === post.collegeId) return true;
        return post.authorId === user.id;
    },

    canCreatePost: (user: User): boolean => {
        return user.role === Role.ADMIN || user.role === Role.CPH || user.role === Role.STAFF || user.role === Role.SROTS_DEV;
    },

    canDeletePost: (user: User, post: Post): boolean => {
        if (user.role === Role.ADMIN) return true;
        if (user.role === Role.CPH && user.collegeId === post.collegeId) return true;
        return post.authorId === user.id;
    },

    hasStudentCommented: (user: User, post: Post): boolean => {
        return post.comments.some(c => c.userId === user.id);
    },

    canManageEvent: (event: CalendarEvent, user: User): boolean => {
        if (user.role === Role.ADMIN) return true;
        if (user.role === Role.CPH && user.collegeId === event.collegeId) return true;
        return event.createdById === user.id;
    },

    canReplyToComment: (user: User, comment: PostComment, post: Post, reply?: PostComment): boolean => {
        if (user.role === Role.ADMIN) return true;
        if (user.role === Role.CPH || user.role === Role.STAFF) {
            return user.collegeId === post.collegeId;
        }
        if (user.role === Role.STUDENT && reply) {
            const isOfficialReply = reply.role === Role.CPH || reply.role === Role.STAFF;
            return isOfficialReply && comment.userId === user.id;
        }
        return false;
    },

    canDeleteComment: (user: User, comment: PostComment, post: Post): boolean => {
        if (user.role === Role.ADMIN) return true;
        if (user.role === Role.CPH && user.collegeId === post.collegeId) return true;
        return comment.userId === user.id;
    }
};
