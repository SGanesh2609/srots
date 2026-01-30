
import api from './api';
import { User, AddressFormData, Role } from '../types';

/**
 * Sync Strategy: Align with provided Java Login JSON
 */
export const AuthService = {
    authenticateUser: async (username: string, password?: string): Promise<User> => {
        // Matches your JSON sample exactly
        const response = await api.post('/auth/login', { 
            username: username, 
            password: password 
        });
        
        const data = response.data;
        
        // Storage logic for Interceptor
        if (data.token) {
            localStorage.setItem('SROTS_AUTH_TOKEN', data.token);
        }
        
        // Create frontend User object from Java Response
        const user: User = {
            id: data.userId,
            userId: data.userId,
            fullName: data.fullName,
            email: data.email || `${data.userId}@srots.com`,
            role: data.role as Role,
            collegeId: data.collegeId,
            token: data.token,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=random`
        };
        
        return user;
    },

    forgotPassword: async (email: string): Promise<void> => {
        // Matches the standard flow
        await api.post('/auth/forgot-password', { email });
    },

    updateUser: async (user: User, address?: AddressFormData): Promise<User> => {
        // Aligned with Java UserAccountController @PutMapping("/{id}")
        // Note: Java expects 'name' not 'fullName' in the RequestBody DTO
        const payload = {
            ...user,
            name: user.fullName, 
            address: address
        };
        const response = await api.put(`/accounts/${user.id}`, payload);
        return response.data;
    }
};
