import api from './api';
import { Post, User } from '../types';

export const PostService = {

    /**
     * Uploads multiple files (images or docs) to the post-specific upload endpoint
     * Backend: @PostMapping("/upload")
     */
    uploadFiles: async (files: File[], collegeCode: string, category: 'IMAGES' | 'DOCUMENTS'): Promise<string[]> => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        formData.append('collegeCode', collegeCode);
        formData.append('category', category);

        const response = await api.post('/posts/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Returns List<String> of URLs
    },


    // ============ POST FETCHING ============
    
    searchPosts: async (collegeId: string, currentUserId: string, query?: string, authorId?: string): Promise<Post[]> => {
        const response = await api.get('/posts', {
            params: { collegeId, currentUserId, query, authorId }
        });
        return response.data;
    },

    // ============ POST CREATION ============
    
    createPost: async (content: string, images: string[], docs: any[], user: User) => {
        const response = await api.post('/posts', {
            content, 
            images, 
            documents: docs,
            collegeId: user.collegeId, 
            authorId: user.id
        });
        return response.data;
    },

    // ============ POST DELETION ============
    
    deletePost: async (postId: string, userId: string, role: string) => {
        await api.delete(`/posts/${postId}`, {
            params: { userId, role }
        });
    },

    // ============ LIKE ACTIONS ============
    
    togglePostLike: async (postId: string, userId: string) => {
        await api.post(`/posts/${postId}/like`, { userId });
    },

    // NOTE: Comment likes are NOT supported - backend doesn't have this feature
    // toggleCommentLike method removed

    // ============ COMMENT MANAGEMENT ============
    
    toggleComments: async (postId: string, userId: string, role: string) => {
        await api.post(`/posts/${postId}/comments-toggle`, null, {
            params: { userId, role }
        });
    },

    addComment: async (postId: string, text: string, user: User) => {
        await api.post(`/posts/${postId}/comments`, { 
            text, 
            user: {
                id: user.id,
                name: user.fullName,
                role: user.role
            }
        });
    },

    deleteComment: async (commentId: string, userId: string, role: string) => {
        await api.delete(`/posts/comments/${commentId}`, {
            params: { userId, role }
        });
    },

    replyToComment: async (postId: string, commentId: string, text: string, user: User) => {
        await api.post(`/posts/${postId}/comments/${commentId}/reply`, { 
            text, 
            user: {
                id: user.id,
                name: user.fullName,
                role: user.role
            }
        });
    },

    // ============ COUNT ENDPOINTS ============

    getLikeCount: async (postId: string): Promise<number> => {
        const response = await api.get(`/posts/${postId}/likes/count`);
        return response.data;
    },

    getCommentCount: async (postId: string): Promise<number> => {
        const response = await api.get(`/posts/${postId}/comments/count`);
        return response.data;
    },

    // ============ COMMENT FETCHING ============

    getComments: async (postId: string): Promise<any[]> => {
        const response = await api.get(`/posts/${postId}/comments`);
        return response.data;
    },

    // ============ AUTHOR SEARCH ============

    getPostsByUsername: async (username: string, collegeId: string, currentUserId: string): Promise<Post[]> => {
        const response = await api.get(`/posts/user/${username}`, {
            params: { collegeId, currentUserId }
        });
        return response.data;
    },

    searchByAuthor: async (fullName: string, collegeId: string, currentUserId: string): Promise<Post[]> => {
        const response = await api.get('/posts/search/author', {
            params: { fullName, collegeId, currentUserId }
        });
        return response.data;
    },

    // ============ UTILITY METHODS ============

    canDeletePost: (user: User, post: Post): boolean => {
        // ADMIN and SROTS_DEV have full access
        if (user.role === 'ADMIN' || user.role === 'SROTS_DEV') return true;
        
        // CPH can delete any post in their college
        if (user.role === 'CPH' && user.collegeId === post.collegeId) return true;
        
        // STAFF can only delete their OWN posts
        if (user.role === 'STAFF' && post.authorId === user.id) return true;
        
        // Anyone can delete their own post
        return post.authorId === user.id;
    },

    canModeratePost: (user: User, post: Post): boolean => {
        // ADMIN and SROTS_DEV have full access
        if (user.role === 'ADMIN' || user.role === 'SROTS_DEV') return true;
        
        // CPH can moderate any post in their college
        if (user.role === 'CPH' && user.collegeId === post.collegeId) return true;
        
        // STAFF can only moderate their OWN posts
        if (user.role === 'STAFF' && post.authorId === user.id) return true;
        
        // Anyone can moderate their own post
        return post.authorId === user.id;
    },

    canCreatePost: (user: User): boolean => {
        // Only ADMIN, SROTS_DEV, CPH, and STAFF can create posts
        return ['ADMIN', 'SROTS_DEV', 'CPH', 'STAFF'].includes(user.role);
    },

    hasStudentCommented: (user: User, post: Post): boolean => {
        return post.comments.some(c => c.userId === user.id && c.parentId === null);
    },

    canDeleteComment: (user: User, comment: any, post: Post): boolean => {
        // ADMIN and SROTS_DEV have full access
        if (user.role === 'ADMIN' || user.role === 'SROTS_DEV') return true;
        
        // CPH can delete any comment in their college
        if (user.role === 'CPH' && user.collegeId === post.collegeId) return true;
        
        // STAFF can delete comments on their OWN posts
        if (user.role === 'STAFF' && post.authorId === user.id) return true;
        
        // Post author can delete comments on their post
        if (post.authorId === user.id) return true;
        
        // Anyone can delete their own comment
        return comment.userId === user.id;
    }
};