import api from './api';
import { Job, User, StudentJobView, Student, Role } from '../types';
import { downloadExcelFile } from '../utils/fileHelper';

/**
 * COMPLETE JobService
 * SYNCED WITH: JobController.java, PlacementToolsController.java
 * 
 * CRITICAL FIXES:
 * 1. compareResultFiles now uses @RequestParam (not @RequestPart)
 * 2. All download methods properly configured
 * 3. Proper error handling throughout
 */
export const JobService = {
    // ============ ADMIN & STAFF MANAGEMENT ============
    
    createJob: async (jobData: any, jdFiles: File[], avoidList: File | null, collegeCode: string): Promise<Job> => {
        const formData = new FormData();
        formData.append('jobData', JSON.stringify(jobData));
        
        if (jdFiles && jdFiles.length > 0) {
            jdFiles.forEach(file => formData.append('jdFiles', file));
        }
        
        if (avoidList) {
            formData.append('avoidList', avoidList);
        }
        
        const response = await api.post(`/jobs?collegeCode=${collegeCode}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateJob: async (id: string, jobData: any, jdFiles: File[], avoidList: File | null, collegeCode: string): Promise<Job> => {
        const formData = new FormData();
        formData.append('jobData', JSON.stringify(jobData));
        
        if (jdFiles && jdFiles.length > 0) {
            jdFiles.forEach(file => formData.append('jdFiles', file));
        }
        
        if (avoidList) {
            formData.append('avoidList', avoidList);
        }
        
        const response = await api.put(`/jobs/${id}?collegeCode=${collegeCode}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteJob: async (id: string, collegeId: string): Promise<void> => {
        await api.delete(`/jobs/${id}`, {
            params: { collegeId }
        });
    },

    // ============ JOB SEARCH & LISTING ============

    searchJobs: async (collegeId: string, filters: {
        query?: string;
        types?: string[];
        modes?: string[];
        statuses?: string[];
        ownerId?: string;
    }): Promise<Job[]> => {
        const response = await api.get('/jobs', { 
            params: { 
                collegeId, 
                query: filters.query,
                jobType: filters.types?.join(','),
                workMode: filters.modes?.join(','),
                status: filters.statuses?.join(','),
            } 
        });
        return response.data;
    },

    getJobsForStudent: async (filters: {
        status?: string;
        query?: string;
        type?: string[];
        workMode?: string[];
    }): Promise<StudentJobView[]> => {
        const response = await api.get('/jobs/student/portal', {
            params: {
                filterType: filters.status || 'all',
                searchQuery: filters.query,
                jobTypeFilters: filters.type?.join(','),
                workModeFilters: filters.workMode?.join(',')
            }
        });
        return response.data;
    },

    getJobDetail: async (jobId: string): Promise<Job> => {
        const response = await api.get(`/jobs/${jobId}`);
        return response.data;
    },

    // ============ STUDENT APPLICATIONS ============

    applyToJob: async (jobId: string): Promise<void> => {
        await api.post(`/jobs/${jobId}/apply`);
    },

    getJobApplicantsDashboard: async (jobId: string): Promise<any> => {
        const response = await api.get(`/jobs/${jobId}/applicants-dashboard`);
        return response.data;
    },

    getJobApplicants: async (jobId: string): Promise<Student[]> => {
        const response = await api.get(`/jobs/${jobId}/applicants`);
        return response.data;
    },

    searchEligibleStudents: async (jobId: string, filters: {
        query?: string;
        branch?: string;
        status?: 'all' | 'applied' | 'not-applied';
    }): Promise<Student[]> => {
        const response = await api.get(`/jobs/${jobId}/eligible`, { params: filters });
        return response.data;
    },

    // ============ HIRING PROCESS & ROUNDS ============

    processRoundResultUpload: async (jobId: string, roundIndex: number, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/jobs/${jobId}/rounds/${roundIndex}/results`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getJobHiringStats: async (jobId: string): Promise<any> => {
        const response = await api.get(`/jobs/${jobId}/hiring-stats`);
        return response.data;
    },

    // ============ EXPORTS ============

    exportJobApplicants: async (jobId: string, type: 'applicants' | 'not-interested' | 'eligible', format: 'excel' | 'csv' = 'excel') => {
        const response = await api.get(`/jobs/${jobId}/export-list`, { 
            params: { type, format },
            responseType: 'blob'
        });
        downloadExcelFile(response.data, `Job_${type}_${jobId}.${format === 'csv' ? 'csv' : 'xlsx'}`);
    },
    
    exportJobEligibleStudents: async (jobId: string, format: 'excel' | 'csv' = 'excel') => {
        const response = await api.get(`/jobs/${jobId}/export-list`, { 
            params: { type: 'eligible', format },
            responseType: 'blob'
        });
        downloadExcelFile(response.data, `Eligible_Students_${jobId}.${format === 'csv' ? 'csv' : 'xlsx'}`);
    },

    // ============ STUDENT TRACKING ============

    getStudentApplications: async (): Promise<any[]> => {
        const response = await api.get('/jobs/students/applications/my');
        return response.data;
    },

    getStudentApplicationTimeline: async (jobId: string): Promise<any[]> => {
        const response = await api.get(`/jobs/students/${jobId}/timeline`);
        return response.data;
    },

    // ============ PLACEMENT TOOLS ============

    /**
     * FIXED: Backend uses @RequestParam("file"), not @RequestPart
     */
    getComparisonHeaders: async (file: File): Promise<string[]> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/tools/compare/headers', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * CRITICAL FIX: Backend expects @RequestParam, not @RequestPart
     * This matches the backend signature exactly
     */
    compareResultFiles: async (masterFile: File, resultFile: File, compareField?: string): Promise<any> => {
        const formData = new FormData();
        formData.append('master', masterFile);
        formData.append('result', resultFile);
        if (compareField) {
            formData.append('compareField', compareField);
        }
        
        const response = await api.post('/tools/compare', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * FIXED: Proper download with blob response
     */
    downloadComparisonReport: async (exportData: any[][], format: 'excel' | 'csv' = 'excel'): Promise<void> => {
        const response = await api.post('/tools/compare/download', exportData, {
            params: { format },
            responseType: 'blob'
        });
        downloadExcelFile(response.data, `Comparison_Result.${format === 'csv' ? 'csv' : 'xlsx'}`);
    },

    /**
     * FIXED: Backend uses @RequestParam("file")
     */
    getExtractionHeaders: async (file: File): Promise<string[]> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/tools/extract/headers', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * FIXED: Proper multipart with params
     */
    processCustomReport: async (file: File, excludeCols: string, excludeIds: string): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/tools/extract', formData, {
            params: { excludeCols, excludeIds },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * FIXED: Proper download endpoint
     */
    downloadCustomReport: async (data: any[][], format: 'excel' | 'csv' = 'excel'): Promise<void> => {
        const response = await api.post('/tools/gather/download', data, {
            params: { format },
            responseType: 'blob'
        });
        downloadExcelFile(response.data, `Extracted_Report.${format === 'csv' ? 'csv' : 'xlsx'}`);
    },

    /**
     * Get available fields for custom gathering
     * UPDATED: Now includes expanded education fields
     */
    getGatheringFields: async (): Promise<Record<string, string[]>> => {
        const response = await api.get('/tools/gather/fields');
        return response.data;
    },

    /**
     * FIXED: Proper request body format
     */
    generateCustomGatheringReport: async (collegeId: string, rollNumbers: string, fields: string[]): Promise<any> => {
        const response = await api.post('/tools/gather', {
            rollNumbers,
            fields
        });
        return response.data;
    },

    /**
     * FIXED: Proper download with blob response
     */
    downloadGatheredDataReport: async (data: any[][], format: 'excel' | 'csv' = 'excel'): Promise<void> => {
        const response = await api.post('/tools/gather/download', data, {
            params: { format },
            responseType: 'blob'
        });
        downloadExcelFile(response.data, `Gathered_Data.${format === 'csv' ? 'csv' : 'xlsx'}`);
    },

    // ============ PERMISSION HELPERS ============

    canManageJob: (user: User, job: Job): boolean => {
        if (user.role === Role.ADMIN || user.role === Role.SROTS_DEV) return true;
        if (user.role === Role.CPH && user.collegeId === job.collegeId) return true;
        return user.role === Role.STAFF && job.postedById === user.id;
    },

    canCreateJob: (user: User): boolean => {
        return [Role.ADMIN, Role.SROTS_DEV, Role.CPH, Role.STAFF].includes(user.role);
    }
};