import api from './api';
import { User, AddressFormData } from '../types';

export const SrotsService = {

  searchSrotsTeam: async (query?: string): Promise<User[]> => {
    // Implement search logic, perhaps GET /accounts/role/SROTS_DEV or similar
    const response = await api.get('/accounts/role/SROTS_DEV', { params: { search: query } });
    return response.data;
  },

  createSrotsUser: async (data: {
    username: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    address: AddressFormData;
    aadhaarNumber: string;
  }): Promise<User> => {
    // Implement create logic, perhaps POST /accounts/srots
    const response = await api.post('/accounts/srots', data);
    return response.data;
  },

  updateSrotsUser: async (id: string, data: {
    username: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    address: AddressFormData;
    aadhaarNumber: string;
  }): Promise<User> => {
    // Implement update logic, perhaps PUT /accounts/{id}
    const response = await api.put(`/accounts/${id}`, data);
    return response.data;
  },

  deleteSrotsUser: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },

  /**
   * Toggle Srots user account restriction
   */
  toggleSrotsRestriction: async (userId: string, status: boolean): Promise<void> => {
    await api.patch(`/accounts/${userId}/restrict`, {}, { params: { status } });
  }

};