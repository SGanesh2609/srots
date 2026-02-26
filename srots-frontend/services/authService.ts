import api from './api';
import { User, AddressFormData, Role } from '../types';
import { PremiumAccessError } from './premiumService';

export const AuthService = {
  authenticateUser: async (username: string, password?: string): Promise<User> => {
    let response;
    try {
      response = await api.post('/auth/login', { username, password });
    } catch (err: any) {
      // ── Handle HTTP 402 (Premium Required) ──────────────────────────────────
      // Backend returns { accessState, message, rejectionReason } with 402
      if (err.response?.status === 402) {
        const premiumStatus = err.response.data;
        throw new PremiumAccessError(premiumStatus);
      }
      // Re-throw all other errors (401 bad credentials, 403 locked, etc.)
      throw err;
    }

    const data = response.data;

    if (data.token) {
      localStorage.setItem('SROTS_AUTH_TOKEN', data.token);
    }

    // Direct mapping for login response (no 'user' wrapper)
    const user: User = {
      id: data.userId,
      username: data.username || username,
      email: data.email,
      fullName: data.fullName,
      role: data.role as Role,
      collegeId: data.collegeId || null,
      token: data.token,
      avatar:
        data.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=0D8ABC&color=fff`,

      isRestricted: data.isRestricted || false,
      isCollegeHead: data.isCollegeHead || false,

      phone: data.phone,
      alternativeEmail: data.alternativeEmail,
      alternativePhone: data.alternativePhone,
      aadhaarNumber: data.aadhaarNumber,
      bio: data.bio,
      department: data.department,
      experience: data.experience,
      education: data.education,

      address: data.addressJson ? JSON.parse(data.addressJson) : null,
      fullAddress: data.addressJson ? JSON.parse(data.addressJson).fullAddress : undefined,

      resetToken: data.resetToken,
      tokenExpiry: data.tokenExpiry,
      lastDeviceInfo: data.lastDeviceInfo,

      createdAt: data.createdAt,
      updatedAt: data.updatedAt,

      educationRecords:  data.educationRecords  || null,
      experiences:       data.experiences       || null,
      projects:          data.projects          || null,
      certifications:    data.certifications    || null,
      languages:         data.languages         || null,
      socialLinks:       data.socialLinks       || null,
      resumes:           data.resumes           || null,
      skills:            data.skills            || null,
    };

    return user;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  getFullProfile: async (userId: string): Promise<User> => {
    const response = await api.get(`/accounts/profile/${userId}`);
    const data = response.data.user;

    const user: User = {
      id: data.id,
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      role: data.role as Role,
      collegeId: data.collegeId || null,
      avatar: data.avatarUrl || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,

      isRestricted: data.isRestricted || false,
      isCollegeHead: data.isCollegeHead || false,

      phone: data.phone,
      alternativeEmail: data.alternativeEmail,
      alternativePhone: data.alternativePhone,
      aadhaarNumber: data.aadhaarNumber,
      bio: data.bio,
      department: data.department,
      experience: data.experience,
      education: data.education,

      address: data.addressJson ? JSON.parse(data.addressJson) : null,
      fullAddress: data.addressJson ? JSON.parse(data.addressJson).fullAddress : undefined,

      resetToken: data.resetToken,
      tokenExpiry: data.tokenExpiry,
      lastDeviceInfo: data.lastDeviceInfo,

      educationRecords:  data.educationRecords  || null,
      experiences:       data.experiences       || null,
      projects:          data.projects          || null,
      certifications:    data.certifications    || null,
      languages:         data.languages         || null,
      socialLinks:       data.socialLinks       || null,
      resumes:           data.resumes           || null,
      skills:            data.skills            || null,
    };

    return user;
  },

  updateUser: async (user: Partial<User>, address?: AddressFormData): Promise<User> => {
    const payload: any = {
      username: user.username,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      alternativeEmail: user.alternativeEmail,
      alternativePhone: user.alternativePhone,
      aadhaar: user.aadhaarNumber,
      bio: user.bio,
      department: user.department,
      experience: user.experience,
      education: user.education,
      collegeId: user.collegeId,
      isCollegeHead: user.isCollegeHead,
    };

    if (address) {
      payload.address = address;
    }

    const response = await api.put(`/accounts/${user.id}`, payload);
    return response.data;
  },

  uploadAvatar: async (userId: string, file: File, category: string = 'profiles'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/accounts/${userId}/upload-photo?category=${category}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return response.data.url;
  },
};