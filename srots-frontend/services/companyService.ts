
// import api from './api';
// import { GlobalCompany, FreeCourse, User, Role } from '../types';

// /**
//  * Specialized Service: Company & Global Resources
//  * Handles Hiring Partners, Learning Resources, Analytics, and File Uploads.
//  */

// export const CompanyService = {
//     // --- Hiring Partners (Companies) ---
//     searchGlobalCompanies: async (query: string, collegeId?: string): Promise<GlobalCompany[]> => {
//         const response = await api.get('/companies', { params: { query, collegeId } });
//         return response.data;
//     },

//     searchCollegeCompanies: async (collegeId: string, query: string): Promise<GlobalCompany[]> => {
//         const response = await api.get('/companies', { params: { collegeId, query, linkedOnly: 'true' } });
//         return response.data;
//     },

//     createGlobalCompany: async (data: any) => {
//         const response = await api.post('/companies', data);
//         return response.data;
//     },

//     updateGlobalCompany: async (data: GlobalCompany) => {
//         const response = await api.put(`/companies/${data.id}`, data);
//         return response.data;
//     },

//     deleteGlobalCompany: async (id: string) => {
//         await api.delete(`/companies/${id}`);
//     },

//     addCompanyToCollege: async (collegeId: string, companyId: string) => {
//         await api.post('/companies/subscribe', { collegeId, companyId });
//     },

//     removeCompanyFromCollege: async (collegeId: string, companyId: string) => {
//         await api.delete(`/companies/subscribe/${collegeId}/${companyId}`);
//     },

//     // --- Learning Resources (Free Courses) ---
//     // searchFreeCourses: async (query: string, tech: string, platform: string, status: string): Promise<FreeCourse[]> => {
//     //     const response = await api.get('/free-courses', { params: { query, technology: tech, platform, status } });
//     //     return response.data;
//     // },
//     // companyService.ts (only the searchFreeCourses part)
//     searchFreeCourses: async (
//         query: string,
//         tech: string,
//         platform: string,
//         status: string,
//         page: number = 0,           // 0-based (Spring Pageable default)
//         size: number = 12           // adjust as needed (9, 12, 15...)
//         ): Promise<{ courses: FreeCourse[], totalPages: number, totalElements: number }> => {
//         const params: Record<string, any> = {
//             page,
//             size,
//             query: query.trim() || null,
//         };

//         if (tech !== 'All') params.technology = tech;
//         if (platform !== 'All') params.platform = platform;
//         if (status !== 'All') params.status = status;

//         const response = await api.get('/free-courses', { params });
//         return {
//             courses: response.data.content,          // Spring Page returns { content: [], totalPages, totalElements, ... }
//             totalPages: response.data.totalPages,
//             totalElements: response.data.totalElements,
//         };
//     },

//     deleteFreeCourse: async (id: string) => {
//         await api.delete(`/free-courses/${id}`);
//     },

//     getCourseCategories: async (): Promise<string[]> => {
//         const response = await api.get('/free-courses/categories');
//         return response.data;
//     },

//     getCoursePlatformsList: async (): Promise<string[]> => {
//         const response = await api.get('/free-courses/platforms');
//         return response.data;
//     },

//     toggleFreeCourseStatus: async (id: string) => {
//         const response = await api.put(`/free-courses/${id}/status-toggle`);
//         return response.data;
//     },

//     verifyFreeCourseLink: async (id: string) => {
//         const response = await api.put(`/free-courses/${id}/verify`);
//         return response.data;
//     },

//     // --- Global Platform Utils ---
//     getSystemAnalytics: async () => {
//         const response = await api.get('/analytics/system');
//         return response.data;
//     },

//     searchSrotsTeam: async (query: string): Promise<User[]> => {
//         const response = await api.get('/team/srots', { params: { query } });
//         return response.data;
//     },

//     createSrotsUser: async (data: any) => {
//         const response = await api.post('/team/srots', data);
//         return response.data;
//     },

//     toggleSrotsUserAccess: async (id: string) => {
//         const response = await api.put(`/team/srots/${id}/access`);
//         return response.data;
//     },

//     deleteSrotsUser: async (id: string) => {
//         await api.delete(`/team/srots/${id}`);
//     },

//     uploadFile: async (file: File): Promise<string> => {
//         const formData = new FormData();
//         formData.append('file', file);
//         const response = await api.post('/upload', formData);
//         return response.data.url;
//     }
// };


import api from './api';
import { GlobalCompany, FreeCourse, User, Role, CourseStatus, AddressFormData } from '../types';

export const CompanyService = {
  // --- Hiring Partners (Companies) ---
  searchGlobalCompanies: async (query: string, collegeId?: string): Promise<GlobalCompany[]> => {
    const response = await api.get('/companies', { params: { query, collegeId } });
    return response.data;
  },

  searchCollegeCompanies: async (collegeId: string, query: string): Promise<GlobalCompany[]> => {
    const response = await api.get('/companies', { params: { collegeId, query, linkedOnly: 'true' } });
    return response.data;
  },

  createGlobalCompany: async (data: any) => {
    const response = await api.post('/companies', data);
    return response.data;
  },

  updateGlobalCompany: async (data: GlobalCompany) => {
    const response = await api.put(`/companies/${data.id}`, data);
    return response.data;
  },

  deleteGlobalCompany: async (id: string) => {
    await api.delete(`/companies/${id}`);
  },

  addCompanyToCollege: async (collegeId: string, companyId: string) => {
    await api.post('/companies/subscribe', { collegeId, companyId });
  },

  removeCompanyFromCollege: async (collegeId: string, companyId: string) => {
    await api.delete(`/companies/subscribe/${collegeId}/${companyId}`);
  },

  // --- Learning Resources (Free Courses) ---
  searchFreeCourses: async (
    query: string,
    tech: string,
    platform: string,
    status: string,
    page: number = 0,
    size: number = 12,
    isAdmin: boolean = false
  ): Promise<{ courses: FreeCourse[]; totalPages: number; totalElements: number }> => {
    const params: Record<string, any> = {
      page,
      size,
      query: query.trim() || undefined,
    };

    if (tech !== 'All') params.technology = tech;
    if (platform !== 'All') params.platform = platform;

    let url = '/free-courses';
    if (isAdmin) {
      url = '/free-courses/admin/all';
      if (status !== 'All') params.status = status;
    }

    const response = await api.get(url, { params });
    return {
      courses: response.data.content || [],
      totalPages: response.data.totalPages || 1,
      totalElements: response.data.totalElements || 0,
    };
  },

//   createFreeCourse: async (courseData: Partial<FreeCourse>, postedBy: string) => {
//     const payload = { ...courseData, postedBy };
//     const response = await api.post('/free-courses', payload);
//     return response.data;
//   },
  createFreeCourse: async (courseData: Partial<FreeCourse>) => {
    // Ensure platform is uppercase string (matches enum)
    const payload = {
      name: courseData.name?.trim(),
      technology: courseData.technology?.trim(),
      description: courseData.description?.trim() || '',
      link: courseData.link?.trim(),
      platform: courseData.platform, // should already be string like "YOUTUBE"
      // IMPORTANT: do NOT include status here — backend defaults to ACTIVE
    };

    try {
      const response = await api.post('/free-courses', payload);
      return response.data;
    } catch (error: any) {
      // Improve error logging for 400 cases
      if (error.response?.status === 400) {
        console.error('Create course failed - Bad Request details:', error.response.data);
      }
      throw error;
    }
  },

  updateFreeCourse: async (course: FreeCourse) => {
    const response = await api.put(`/free-courses/${course.id}`, course);
    return response.data;
  },

  softDeleteFreeCourse: async (id: string) => {
    await api.delete(`/free-courses/${id}/soft`);
  },

  hardDeleteFreeCourse: async (id: string) => {
    await api.delete(`/free-courses/${id}/permanent`);
  },

  getCourseCategories: async (): Promise<string[]> => {
    const response = await api.get('/free-courses/categories');
    return response.data;
  },

  getCoursePlatformsList: async (): Promise<string[]> => {
    const response = await api.get('/free-courses/platforms');
    return response.data;
  },

  updateFreeCourseStatus: async (id: string, status: CourseStatus) => {
    const params = { status };
    const response = await api.patch(`/free-courses/${id}/status`, null, { params });
    return response.data;
  },

  verifyFreeCourseLink: async (id: string) => {
    const response = await api.patch(`/free-courses/${id}/verify`);
    return response.data;
  },

  // --- Srots Team (Users) ---
  searchSrotsTeam: async (query: string): Promise<User[]> => {
    const params = query.trim() ? { search: query.trim() } : {};
    const [adminRes, devRes] = await Promise.all([
      api.get('/accounts/role/ADMIN', { params }).catch(() => ({ data: [] })),
      api.get('/accounts/role/SROTS_DEV', { params }).catch(() => ({ data: [] })),
    ]);
    return [...(adminRes.data || []), ...(devRes.data || [])];
  },

  createSrotsUser: async (data: {
    username: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    address: AddressFormData;
    aadhaarNumber: string;
  }) => {
    const payload = {
      username: data.username,
      name: data.name,
      email: data.email,
      phone: data.phone,
      department: data.department,
      address: data.address,
      aadhaarNumber: data.aadhaarNumber, // Fixed: matches backend @JsonProperty
    };
    const response = await api.post('/accounts/srots', payload, { params: { role: 'SROTS_DEV' } });
    return response.data;
  },

  updateSrotsUser: async (id: string, data: {
    username?: string;
    name?: string;
    email?: string;
    phone?: string;
    department?: string;
    address?: AddressFormData;
    aadhaarNumber?: string;
  }) => {
    const payload = { ...data }; // Partial update; backend handles what’s sent
    const response = await api.put(`/accounts/${id}`, payload);
    return response.data;
  },

  toggleSrotsUserAccess: async (id: string, isRestricted: boolean) => {
    // Use existing update endpoint with partial body
    await api.put(`/accounts/${id}`, { isRestricted });
  },

  deleteSrotsUser: async (id: string) => {
    await api.delete(`/accounts/${id}`);
  },

  // --- Global Platform Utils ---
  getSystemAnalytics: async () => {
    const response = await api.get('/analytics/system');
    return response.data;
  },

  

  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData);
    return response.data.url;
  },
};