
// import api from './api';
// import { Student, AddressFormData } from '../types';
// import { downloadExcelFile } from '../utils/fileHelper';

// /**
//  * Tier 2: Student Service
//  * Logic: Manages student data, resumes, and academic history.
//  * Updated: Standardized to match Java /accounts and /api/admin/bulk endpoints.
//  */

// export const StudentService = {
//     // searchStudents: async (collegeId: string, filters: any): Promise<Student[]> => {
//     //     // Aligned with Java UserAccountController @GetMapping("/college/{collegeId}/all")
//     //     const response = await api.get(`/accounts/college/${collegeId}/all`, { params: filters });
//     //     return response.data;
//     // },

//     // In StudentService
//     searchStudents: async (collegeId: string, filters: any): Promise<Student[]> => {
//         const params = {
//             search: filters.query || undefined,
//             batch: filters.year !== 'All' ? filters.year : undefined,
//             branch: filters.branch !== 'All' ? filters.branch : undefined,
//         };
//         const response = await api.get(`/accounts/college/${collegeId}/role/STUDENT`, { params });
//         return response.data;
//     },

//     createStudent: async (student: Partial<Student>): Promise<Student> => {
//         // Aligned with Java UserAccountController @PostMapping("/student")
//         // Mapping UI 'fullName' to Backend 'name' if necessary
//         const payload = {
//             ...student,
//             name: student.fullName || (student as any).name
//         };
//         const response = await api.post('/accounts/student', payload);
//         return response.data;
//     },

//     updateStudent: async (student: Student): Promise<Student> => {
//         // Aligned with Java UserAccountController @PutMapping("/{id}")
//         const response = await api.put(`/accounts/${student.id}`, student);
//         return response.data;
//     },

//     updateStudentProfile: async (studentId: string, updates: any): Promise<Student> => {
//         // Aligned with Java UserAccountController @PutMapping("/{id}")
//         const response = await api.put(`/accounts/${studentId}`, { profile: updates });
//         return response.data;
//     },

//     bulkUploadStudents: async (file: File, collegeId: string) => {
//         // Aligned with Java BulkUploadController @PostMapping("/upload-students")
//         const formData = new FormData();
//         formData.append('file', file);
//         formData.append('collegeId', collegeId);
//         const response = await api.post('/admin/bulk/upload-students', formData, {
//             responseType: 'arraybuffer',
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });
//         return response.data;
//     },

//     bulkDeleteStudents: async (idsOrFile: string[] | File, collegeId?: string) => {
//         if (Array.isArray(idsOrFile)) {
//              await api.post('/accounts/bulk-delete', { ids: idsOrFile });
//              return;
//         }
//         const formData = new FormData();
//         formData.append('file', idsOrFile);
//         formData.append('collegeId', collegeId || '');
//         const response = await api.post('/admin/bulk/delete-students', formData, {
//             responseType: 'arraybuffer'
//         });
//         return response.data;
//     },

//     previewBulkDeletion: async (file: File, collegeId: string) => {
//         const formData = new FormData();
//         formData.append('file', file);
//         formData.append('collegeId', collegeId);
//         const response = await api.post('/admin/bulk/preview-delete', formData);
//         return response.data;
//     },

//     uploadResume: async (studentId: string, file: File) => {
//         const formData = new FormData();
//         formData.append('file', file);
//         const response = await api.post(`/students/${studentId}/resumes`, formData, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });
//         return response.data;
//     },

//     setResumeAsDefault: async (studentId: string, resumeId: string) => {
//         const response = await api.post(`/students/${studentId}/resumes/default`, { resumeId });
//         return response.data;
//     },

//     updateProfileSection: async (studentId: string, section: string, data: any, isDelete: boolean = false) => {
//         const response = await api.put(`/students/${studentId}/sections/${section}`, { data, isDelete });
//         return response.data;
//     },

//     manageSkill: async (studentId: string, data: any, isDelete: boolean = false) => {
//         return StudentService.updateProfileSection(studentId, 'skills', data, isDelete);
//     },

//     manageLanguage: async (studentId: string, data: any, isDelete: boolean = false) => {
//         return StudentService.updateProfileSection(studentId, 'languages', data, isDelete);
//     },

//     updateStudentAddress: async (studentId: string, type: 'current' | 'permanent', data: AddressFormData) => {
//         const response = await api.put(`/accounts/${studentId}/address/${type}`, data);
//         return response.data;
//     },

//     getExpiringStudents: async (collegeId: string) => {
//         const response = await api.get('/students/expiring', { params: { collegeId } });
//         return response.data;
//     },

//     downloadExpiringStudentsReport: async (collegeId: string, data?: any[]) => {
//         if (data) {
//             const excelData = [['Roll Number', 'Name', 'Email', 'Days to Expiry', 'Status']];
//             data.forEach(s => excelData.push([s.id, s.name, s.email, s.expiryIn, s.status]));
//             downloadExcelFile(excelData, `Expiring_Students_${collegeId}.xlsx`);
//             return;
//         }
//         const response = await api.get(`/accounts/export/college/${collegeId}/students`, { 
//             params: { format: 'excel' },
//             responseType: 'blob'
//         });
//         return response.data;
//     },

//     renewStudent: async (studentId: string, months: number) => {
//         await api.post(`/accounts/${studentId}/renew`, { months });
//     },

//     previewBulkRenewal: async (file: File, collegeId: string) => {
//         const formData = new FormData();
//         formData.append('file', file);
//         formData.append('collegeId', collegeId);
//         const response = await api.post('/admin/bulk/preview-renew', formData);
//         return response.data;
//     },

//     bulkRenewStudents: async (updates: { id: string, months: number }[]) => {
//         await api.post('/accounts/bulk-renew', { updates });
//     },

//     getAccountStats: async (collegeId: string) => {
//         const response = await api.get('/students/stats', { params: { collegeId } });
//         return response.data;
//     },

//     deleteStudent: async (id: string) => {
//         await api.delete(`/accounts/${id}`);
//     },

//     downloadBulkUploadTemplate: async () => {
//         const response = await api.get('/admin/bulk/template/students', { responseType: 'blob' });
//         return response.data;
//     },

//     getStudentApplications: async (studentId: string) => {
//         const response = await api.get(`/students/${studentId}/applications`);
//         return response.data;
//     },

//     getStudentApplicationTimeline: async (jobId: string, studentId: string) => {
//         const response = await api.get(`/jobs/${jobId}/timeline/${studentId}`);
//         return response.data;
//     },

//     processCustomReport: async (file: File, excludeCols: string[], excludeIds: string) => {
//         const formData = new FormData();
//         formData.append('file', file);
//         formData.append('excludeCols', JSON.stringify(excludeCols));
//         formData.append('excludeIds', excludeIds);
//         const response = await api.post('/tools/extract', formData, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });
//         return response.data;
//     },

//     downloadCustomReport: (data: any[][], format: 'csv' | 'xlsx') => {
//         downloadExcelFile(data, `Custom_Report.${format}`);
//     },

//     generateCustomGatheringReport: async (collegeId: string, rollNumbers: string, fields: string[]) => {
//         const response = await api.post('/tools/gather', { collegeId, rollNumbers, fields });
//         return response.data;
//     },

//     downloadGatheredDataReport: (data: any[][], format: 'csv' | 'xlsx') => {
//         downloadExcelFile(data, `Gathered_Data.${format}`);
//     },

//     exportStudentRegistry: async (collegeId: string, filters: any) => {
//         const response = await api.get(`/accounts/college/${collegeId}/export`, { params: filters });
//         downloadExcelFile(response.data, `Student_Registry_${collegeId}.xlsx`);
//     }
// };


import api from './api';
import { Student, AddressFormData } from '../types';
import { downloadExcelFile } from '../utils/fileHelper';

export const StudentService = {
  searchStudents: async (collegeId: string, filters: any): Promise<Student[]> => {
    const params = {
      search: filters.query || undefined,
      batch: filters.year !== 'All' ? filters.year : undefined,
      branch: filters.branch !== 'All' ? filters.branch : undefined,
    };
    const response = await api.get(`/accounts/college/${collegeId}/role/STUDENT`, { params });
    return response.data;
  },

  createStudent: async (student: Partial<Student>): Promise<Student> => {
    const payload = {
      ...student,
      name: student.fullName || (student as any).name
    };
    const response = await api.post('/accounts/student', payload);
    return response.data;
  },

  // Updated to use /students/profile
  updateStudentProfile: async (studentId: string, updates: any): Promise<Student> => {
    const response = await api.put(`/students/profile`, updates);  // backend expects direct StudentProfileRequest
    return response.data;
  },

  // General section update (e.g., gaps, contact)
  updateProfileSection: async (studentId: string, section: string, data: any): Promise<Student> => {
    const response = await api.put(`/students/profile/sections/${section}`, { data });
    return response.data;
  },

  // Delete section item
  deleteProfileSectionItem: async (studentId: string, section: string, id: string): Promise<Student> => {
    const response = await api.delete(`/students/profile/sections/${section}/${id}`);
    return response.data;
  },

  // Specific for skills
  manageSkill: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'skills', data);
  },

  deleteSkill: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'skills', id);
  },

  // Specific for languages
  manageLanguage: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'languages', data);
  },

  deleteLanguage: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'languages', id);
  },

  // For experience
  manageExperience: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'experience', data);
  },

  deleteExperience: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'experience', id);
  },

  // For projects
  manageProject: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'projects', data);
  },

  deleteProject: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'projects', id);
  },

  // For certifications
  manageCertification: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'certifications', data);
  },

  deleteCertification: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'certifications', id);
  },

  // For publications
  managePublication: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'publications', data);
  },

  deletePublication: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'publications', id);
  },

  // For social links
  manageSocialLink: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'social-links', data);
  },

  deleteSocialLink: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'social-links', id);
  },

  // For address
  updateStudentAddress: async (studentId: string, type: 'current' | 'permanent', data: AddressFormData): Promise<Student> => {
    const response = await api.put(`/students/profile/address/${type}`, data);
    return response.data;
  },

  // For resumes
  uploadResume: async (studentId: string, file: File): Promise<Student> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/students/profile/resumes`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  setResumeAsDefault: async (studentId: string, resumeId: string): Promise<Student> => {
    const response = await api.put(`/students/profile/resumes/${resumeId}/set-default`);
    return response.data;
  },

  deleteResume: async (studentId: string, resumeId: string): Promise<Student> => {
    const response = await api.delete(`/students/profile/resumes/${resumeId}`);
    return response.data;
  },

  // Get full student 360
  getStudent360: async (studentId: string): Promise<Student> => {
    const response = await api.get(`/accounts/student-360/${studentId}`);
    const data = response.data;
    // Map the response to Student type
    return {
      ...data.user,
      profile: data.profile,
      educationRecords: data.education,
      experiences: data.experience,
      projects: data.projects,
      certifications: data.certifications,
      languages: data.languages,
      publications: data.publications,
      socialLinks: data.socialLinks,
      resumes: data.resumes,
      skills: data.skills,
    } as Student;
  },

  bulkUploadStudents: async (file: File, collegeId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collegeId', collegeId);
    const response = await api.post('/admin/bulk/upload-students', formData, {
      responseType: 'arraybuffer',
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  bulkDeleteStudents: async (idsOrFile: string[] | File, collegeId?: string) => {
    if (Array.isArray(idsOrFile)) {
      await api.post('/accounts/bulk-delete', { ids: idsOrFile });
      return;
    }
    const formData = new FormData();
    formData.append('file', idsOrFile);
    formData.append('collegeId', collegeId || '');
    const response = await api.post('/admin/bulk/delete-students', formData, {
      responseType: 'arraybuffer'
    });
    return response.data;
  },

  previewBulkDeletion: async (file: File, collegeId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collegeId', collegeId);
    const response = await api.post('/admin/bulk/preview-delete', formData);
    return response.data;
  },

  getExpiringStudents: async (collegeId: string) => {
    const response = await api.get('/students/expiring', { params: { collegeId } });
    return response.data;
  },

  downloadExpiringStudentsReport: async (collegeId: string, data?: any[]) => {
    if (data) {
      const excelData = [['Roll Number', 'Name', 'Email', 'Days to Expiry', 'Status']];
      data.forEach(s => excelData.push([s.id, s.name, s.email, s.expiryIn, s.status]));
      downloadExcelFile(excelData, `Expiring_Students_${collegeId}.xlsx`);
      return;
    }
    const response = await api.get(`/accounts/export/college/${collegeId}/students`, { 
      params: { format: 'excel' },
      responseType: 'blob'
    });
    return response.data;
  },

  renewStudent: async (studentId: string, months: number) => {
    await api.post(`/accounts/${studentId}/renew`, { months });
  },

  previewBulkRenewal: async (file: File, collegeId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collegeId', collegeId);
    const response = await api.post('/admin/bulk/preview-renew', formData);
    return response.data;
  },

  bulkRenewStudents: async (updates: { id: string, months: number }[]) => {
    await api.post('/accounts/bulk-renew', { updates });
  },

  getAccountStats: async (collegeId: string) => {
    const response = await api.get('/students/stats', { params: { collegeId } });
    return response.data;
  },

  deleteStudent: async (id: string) => {
    await api.delete(`/accounts/${id}`);
  },

  downloadBulkUploadTemplate: async () => {
    const response = await api.get('/admin/bulk/template/students', { responseType: 'blob' });
    return response.data;
  },

  getStudentApplications: async (studentId: string) => {
    const response = await api.get(`/students/${studentId}/applications`);
    return response.data;
  },

  getStudentApplicationTimeline: async (jobId: string, studentId: string) => {
    const response = await api.get(`/jobs/${jobId}/timeline/${studentId}`);
    return response.data;
  },

  processCustomReport: async (file: File, excludeCols: string[], excludeIds: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('excludeCols', JSON.stringify(excludeCols));
    formData.append('excludeIds', excludeIds);
    const response = await api.post('/tools/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  downloadCustomReport: (data: any[][], format: 'csv' | 'xlsx') => {
    downloadExcelFile(data, `Custom_Report.${format}`);
  },

  generateCustomGatheringReport: async (collegeId: string, rollNumbers: string, fields: string[]) => {
    const response = await api.post('/tools/gather', { collegeId, rollNumbers, fields });
    return response.data;
  },

  downloadGatheredDataReport: (data: any[][], format: 'csv' | 'xlsx') => {
    downloadExcelFile(data, `Gathered_Data.${format}`);
  },

  exportStudentRegistry: async (collegeId: string, filters: any) => {
    const response = await api.get(`/accounts/college/${collegeId}/export`, { params: filters });
    downloadExcelFile(response.data, `Student_Registry_${collegeId}.xlsx`);
  }
};