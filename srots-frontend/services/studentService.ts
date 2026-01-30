
import api from './api';
import { Student, AddressFormData } from '../types';
import { downloadExcelFile } from '../utils/fileHelper';

/**
 * Tier 2: Student Service
 * Logic: Manages student data, resumes, and academic history.
 * Updated: Standardized to match Java /accounts and /api/admin/bulk endpoints.
 */

export const StudentService = {
    // searchStudents: async (collegeId: string, filters: any): Promise<Student[]> => {
    //     // Aligned with Java UserAccountController @GetMapping("/college/{collegeId}/all")
    //     const response = await api.get(`/accounts/college/${collegeId}/all`, { params: filters });
    //     return response.data;
    // },

    // In StudentService
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
        // Aligned with Java UserAccountController @PostMapping("/student")
        // Mapping UI 'fullName' to Backend 'name' if necessary
        const payload = {
            ...student,
            name: student.fullName || (student as any).name
        };
        const response = await api.post('/accounts/student', payload);
        return response.data;
    },

    updateStudent: async (student: Student): Promise<Student> => {
        // Aligned with Java UserAccountController @PutMapping("/{id}")
        const response = await api.put(`/accounts/${student.id}`, student);
        return response.data;
    },

    updateStudentProfile: async (studentId: string, updates: any): Promise<Student> => {
        // Aligned with Java UserAccountController @PutMapping("/{id}")
        const response = await api.put(`/accounts/${studentId}`, { profile: updates });
        return response.data;
    },

    bulkUploadStudents: async (file: File, collegeId: string) => {
        // Aligned with Java BulkUploadController @PostMapping("/upload-students")
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

    uploadResume: async (studentId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/students/${studentId}/resumes`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    setResumeAsDefault: async (studentId: string, resumeId: string) => {
        const response = await api.post(`/students/${studentId}/resumes/default`, { resumeId });
        return response.data;
    },

    updateProfileSection: async (studentId: string, section: string, data: any, isDelete: boolean = false) => {
        const response = await api.put(`/students/${studentId}/sections/${section}`, { data, isDelete });
        return response.data;
    },

    manageSkill: async (studentId: string, data: any, isDelete: boolean = false) => {
        return StudentService.updateProfileSection(studentId, 'skills', data, isDelete);
    },

    manageLanguage: async (studentId: string, data: any, isDelete: boolean = false) => {
        return StudentService.updateProfileSection(studentId, 'languages', data, isDelete);
    },

    updateStudentAddress: async (studentId: string, type: 'current' | 'permanent', data: AddressFormData) => {
        const response = await api.put(`/accounts/${studentId}/address/${type}`, data);
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
