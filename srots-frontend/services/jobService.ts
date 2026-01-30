
import api from './api';
import { Job, User, StudentJobView, Student } from '../types';
import { downloadExcelFile } from '../utils/fileHelper';

/**
 * Tier 2: Job Service
 * Logic: Manages the placement lifecycle from posting to result processing.
 */

export const JobService = {
    getJobs: async (collegeId?: string): Promise<Job[]> => {
        const response = await api.get('/jobs', { params: { collegeId } });
        return response.data;
    },

    searchJobs: async (collegeId: string, filters: any): Promise<Job[]> => {
        const response = await api.get('/jobs', { 
            params: { 
                collegeId, 
                query: filters.query,
                type: filters.types?.length > 0 ? filters.types.join(',') : 'All', 
                workMode: filters.modes?.length > 0 ? filters.modes.join(',') : 'All',
                ownerId: filters.ownerId
            } 
        });
        return response.data;
    },

    createJob: async (jobData: Partial<Job>, user: User): Promise<Job> => {
        const response = await api.post('/jobs', {
            ...jobData,
            collegeId: user.collegeId,
            // Fix: Use user.fullName instead of user.name
            postedBy: user.fullName,
            postedById: user.id
        });
        return response.data;
    },

    updateJob: async (jobData: Partial<Job>): Promise<Job> => {
        const response = await api.put(`/jobs/${jobData.id}`, jobData);
        return response.data;
    },

    deleteJob: async (id: string): Promise<void> => {
        await api.delete(`/jobs/${id}`);
    },

    getJobsForStudent: async (studentId: string, filters: any): Promise<StudentJobView[]> => {
        const response = await api.get(`/jobs/student/${studentId}`, { params: filters });
        return response.data;
    },

    getJobDetailsForStudent: async (jobId: string, studentId: string): Promise<StudentJobView> => {
        const response = await api.get(`/jobs/${jobId}/student/${studentId}`);
        return response.data;
    },

    applyToJob: async (jobId: string, studentId: string): Promise<void> => {
        await api.post(`/jobs/${jobId}/apply`, { studentId });
    },

    processRoundResultUpload: async (jobId: string, roundIndex: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/jobs/${jobId}/rounds/${roundIndex}/results`, formData);
        return response.data;
    },

    getJobApplicants: async (jobId: string): Promise<Student[]> => {
        const response = await api.get(`/jobs/${jobId}/applicants`);
        return response.data;
    },

    downloadJobRelatedList: async (jobId: string, listType: 'applicants' | 'not-interested') => {
        const response = await api.get(`/jobs/${jobId}/export-list`, { params: { type: listType } });
        downloadExcelFile(response.data, `Job_${jobId}_${listType}.xlsx`);
    },

    searchEligibleStudents: async (jobId: string, filters: any): Promise<any[]> => {
        const response = await api.get(`/jobs/${jobId}/eligible`, { params: filters });
        return response.data;
    },

    exportJobEligibleStudents: async (jobId: string) => {
        const response = await api.get(`/jobs/${jobId}/eligible/export`);
        downloadExcelFile(response.data, `Job_${jobId}_Eligible.xlsx`);
    },

    canManageJob: (user: User, job: Job): boolean => {
        if (user.role === 'ADMIN') return true;
        if (user.role === 'CPH' && user.isCollegeHead && user.collegeId === job.collegeId) return true;
        return job.postedById === user.id;
    },

    // Added compareResultFiles to fix error in GlobalResultComparator.tsx
    compareResultFiles: async (masterFile: File, resultFile: File) => {
        const formData = new FormData();
        formData.append('master', masterFile);
        formData.append('result', resultFile);
        const response = await api.post('/tools/compare', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Added downloadComparisonReport to fix error in GlobalResultComparator.tsx
    downloadComparisonReport: (data: any[][], format: 'csv' | 'xlsx') => {
        downloadExcelFile(data, `Comparison_Report.${format}`);
    }
};
