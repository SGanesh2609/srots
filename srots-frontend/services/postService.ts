
import api from './api';
import { Post, User } from '../types';

export const PostService = {
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
        await api.post(`/posts/${postId}/comments`, { text, user });
    },

    deleteComment: async (postId: string, commentId: string) => {
        await api.delete(`/posts/${postId}/comments/${commentId}`);
    },

    replyToComment: async (postId: string, commentId: string, text: string, user: User) => {
        await api.post(`/posts/${postId}/comments/${commentId}/reply`, { text, user });
    },

    canDeletePost: (user: User, post: Post): boolean => {
        if (user.role === 'ADMIN') return true;
        if (user.role === 'CPH' && user.collegeId === post.collegeId) return true;
        return post.authorId === user.id;
    },

    canModeratePost: (user: User, post: any): boolean => {
        if (user.role === 'ADMIN') return true;
        if (user.role === 'CPH' && user.collegeId === post.collegeId) return true;
        return post.authorId === user.id;
    },

    hasStudentCommented: (user: User, post: Post): boolean => {
        return post.comments.some(c => c.userId === user.id);
    }
};
