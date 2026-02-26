import api from './api';
import { Student, AddressFormData, AccountFilter } from '../types';
import { downloadExcelFile, downloadDataAsFile } from '../utils/fileHelper';


// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentSelfUpdatePayload {
  // Contact info
  communicationEmail?:     string;
  personalEmail?:          string;
  preferredContactMethod?: string;
  linkedInProfile?:        string;
  // Education gaps
  gapInStudies?:           boolean;
  gapDuration?:            string;
  gapReason?:              string;
  // More info
  drivingLicense?:         string;
  passportNumber?:         string;
  passportIssueDate?:      string;
  passportExpiryDate?:     string;
  dayScholar?:             boolean;
}


function mapStudent360ToStudent(data: any): Student {

    // ── Parse address from stored JSON string or already-parsed object ────────
    const parseAddress = (raw: any): AddressFormData | undefined => {
        if (!raw) return undefined;
        if (typeof raw === 'string') {
            try { return JSON.parse(raw); } catch { return undefined; }
        }
        return raw as AddressFormData;
    };

    // ── Normalise education records ───────────────────────────────────────────
    const education = (data.education ?? []).map((edu: any) => {
        let semesters = edu.semesters;
        if (!Array.isArray(semesters) || semesters.length === 0) {
            const raw = edu.semestersData ?? edu.semesters_data;
            if (raw) {
                try {
                    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    semesters = Array.isArray(parsed) ? parsed : [];
                } catch {
                    semesters = [];
                }
            } else {
                semesters = [];
            }
        }
        return {
            ...edu,
            score:     edu.score ?? edu.scoreDisplay ?? edu.score_display ?? '',
            scoreType: edu.scoreType ?? edu.score_type ?? '',
            semesters,
        };
    });

    // ── Build normalised profile ──────────────────────────────────────────────
    const rawProfile = data.profile ?? {};
    const rawUser    = data.user    ?? {};

    const enrichedProfile = {
        ...rawProfile,

        
        fullName:         rawUser.fullName         ?? rawProfile.fullName         ?? '',
        
        aadhaarNumber:    rawUser.aadhaarNumber    ?? rawProfile.aadhaarNumber    ?? (data as any).aadhaarNumber ?? '',
        phone:            rawUser.phone            ?? rawProfile.phone            ?? '',
        alternativeEmail: rawUser.alternativeEmail ?? rawProfile.alternativeEmail ?? '',
        alternativePhone: rawUser.alternativePhone ?? rawProfile.alternativePhone ?? '',
        bio:              rawUser.bio              ?? rawProfile.bio              ?? '',

        
        linkedInProfile: rawProfile.linkedInProfile ?? rawProfile.linkedinProfile ?? '',

        
        currentAddress:   parseAddress(rawProfile.currentAddress),
        permanentAddress: parseAddress(rawProfile.permanentAddress),

        // ── Inject section arrays so every tab's profileData prop is populated ─
        educationHistory: education,
        experience:       data.experience     ?? [],
        projects:         data.projects       ?? [],
        certifications:   data.certifications ?? [],
        languages:        data.languages      ?? [],
        publications:     data.publications   ?? [],
        socialLinks:      data.socialLinks    ?? [],
        resumes:          data.resumes        ?? [],
        skills:           data.skills         ?? [],
    };

    return {
        ...data.user,
        profile:          enrichedProfile,
        // Root-level arrays for any legacy code that reads them directly
        educationRecords: education,
        experiences:      data.experience     ?? [],
        projects:         data.projects       ?? [],
        certifications:   data.certifications ?? [],
        languages:        data.languages      ?? [],
        publications:     data.publications   ?? [],
        socialLinks:      data.socialLinks    ?? [],
        resumes:          data.resumes        ?? [],
        skills:           data.skills         ?? [],
    } as Student;
}

// ─── StudentService ───────────────────────────────────────────────────────────

export const StudentService = {

    // ─── Core Search (paginated) ───────────────────────────────────────────────

    searchStudentsPaginated: async (
        collegeId: string,
        filters: {
            query?:         string;
            year?:          string;
            branch?:        string;
            accountFilter?: AccountFilter;
            page?:          number;
            size?:          number;
        }
    ): Promise<{ students: Student[]; total: number; totalPages: number }> => {
        const params: Record<string, any> = {
            search:   filters.query   || undefined,
            batch:    filters.year    && filters.year   !== 'All' ? filters.year   : undefined,
            branch:   filters.branch  && filters.branch !== 'All' ? filters.branch : undefined,
            status:   filters.accountFilter ?? 'active',
            page:     filters.page    ?? 0,
            size:     filters.size    ?? 20,
            paginate: true,
        };
        const response = await api.get(`/accounts/college/${collegeId}/role/STUDENT`, { params });
        const data = response.data;
        if (data && typeof data === 'object' && 'content' in data) {
            return {
                students:   data.content as Student[],
                total:      data.totalElements ?? data.content.length,
                totalPages: data.totalPages    ?? 1,
            };
        }
        const list: Student[] = Array.isArray(data) ? data : [];
        return { students: list, total: list.length, totalPages: 1 };
    },

    searchStudents: async (collegeId: string, filters: any): Promise<Student[]> => {
        const result = await StudentService.searchStudentsPaginated(collegeId, filters);
        return result.students;
    },

    getStudentProfile: async (studentId: string): Promise<Student> => {
        const response = await api.get(`/accounts/profile/${studentId}`);
        const data = response.data;
        return {
            ...data.user,
            profile:          data.profile          ?? {},
            educationHistory: data.educationHistory ?? [],
        } as Student;
    },

    createStudent: async (student: Partial<Student>): Promise<Student> => {
        const payload = { ...student, name: (student as any).fullName || (student as any).name };
        const response = await api.post('/accounts/student', payload);
        return response.data;
    },

    updateStudent: async (student: Partial<Student>): Promise<Student> => {
        const id = (student as any).id;
        if (!id) throw new Error('Student ID required for update');
        const response = await api.put(`/accounts/${id}`, student);
        return response.data;
    },

    // ─── Soft / Hard Delete ───────────────────────────────────────────────────

    softDeleteStudent: async (id: string): Promise<void> => {
        await api.delete(`/accounts/${id}`, { params: { permanent: false } });
    },

    hardDeleteStudent: async (id: string): Promise<void> => {
        await api.delete(`/accounts/${id}`, { params: { permanent: true } });
    },

    deleteStudent: async (id: string): Promise<void> => {
        await api.delete(`/accounts/${id}`, { params: { permanent: true } });
    },

    // ─── Profile Updates ──────────────────────────────────────────────────────

    updateStudentProfile: async (studentId: string, updates: any): Promise<Student> => {
        const response = await api.put(`/students/profile`, updates);
        return response.data;
    },

    /**
     * Mutate a section, then re-fetch the full 360 view.
     */
    updateProfileSection: async (studentId: string, section: string, data: any): Promise<Student> => {
        await api.put(`/students/profile/sections/${section}`, { data });
        return StudentService.getStudent360(studentId);
    },

    /**
     * Delete a section item, then re-fetch the full 360 view.
     */
    deleteProfileSectionItem: async (studentId: string, section: string, id: string): Promise<Student> => {
        await api.delete(`/students/profile/sections/${section}/${id}`);
        return StudentService.getStudent360(studentId);
    },

    manageSkill:         async (studentId: string, data: any) => StudentService.updateProfileSection(studentId, 'skills', data),
    deleteSkill:         async (studentId: string, id: string) => StudentService.deleteProfileSectionItem(studentId, 'skills', id),
    manageLanguage:      async (studentId: string, data: any) => StudentService.updateProfileSection(studentId, 'languages', data),
    deleteLanguage:      async (studentId: string, id: string) => StudentService.deleteProfileSectionItem(studentId, 'languages', id),
    manageExperience:    async (studentId: string, data: any) => StudentService.updateProfileSection(studentId, 'experience', data),
    deleteExperience:    async (studentId: string, id: string) => StudentService.deleteProfileSectionItem(studentId, 'experience', id),
    manageProject:       async (studentId: string, data: any) => StudentService.updateProfileSection(studentId, 'projects', data),
    deleteProject:       async (studentId: string, id: string) => StudentService.deleteProfileSectionItem(studentId, 'projects', id),
    manageCertification: async (studentId: string, data: any) => StudentService.updateProfileSection(studentId, 'certifications', data),
    deleteCertification: async (studentId: string, id: string) => StudentService.deleteProfileSectionItem(studentId, 'certifications', id),
    managePublication:   async (studentId: string, data: any) => StudentService.updateProfileSection(studentId, 'publications', data),
    deletePublication:   async (studentId: string, id: string) => StudentService.deleteProfileSectionItem(studentId, 'publications', id),
    manageSocialLink:    async (studentId: string, data: any) => StudentService.updateProfileSection(studentId, 'social-links', data),
    deleteSocialLink:    async (studentId: string, id: string) => StudentService.deleteProfileSectionItem(studentId, 'social-links', id),

    // ─── Student Self-Profile Update ──────────────────────────────────────────

    
    updateSelfProfile: async (studentId: string, payload: StudentSelfUpdatePayload): Promise<Student> => {
        const response = await api.patch(`/students/profile/self`, payload);
        return mapStudent360ToStudent(response.data);
    },

    // ─── Address Update ───────────────────────────────────────────────────────

    
    updateStudentAddress: async (
        studentId: string,
        type: 'current' | 'permanent',
        data: AddressFormData
    ): Promise<Student> => {
        const response = await api.put(`/students/profile/address/${type}`, data);
        return mapStudent360ToStudent(response.data);
    },

    // ─── Resume Management ────────────────────────────────────────────────────

    uploadResume: async (studentId: string, file: File): Promise<Student> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/students/profile/resumes`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return mapStudent360ToStudent(response.data);
    },

    setResumeAsDefault: async (studentId: string, resumeId: string): Promise<Student> => {
        const response = await api.put(`/students/profile/resumes/${resumeId}/set-default`);
        return mapStudent360ToStudent(response.data);
    },

    deleteResume: async (studentId: string, resumeId: string): Promise<Student> => {
        const response = await api.delete(`/students/profile/resumes/${resumeId}`);
        return mapStudent360ToStudent(response.data);
    },

    // ─── Core: Get Full Student 360 ───────────────────────────────────────────

    getStudent360: async (studentId: string): Promise<Student> => {
        const response = await api.get(`/accounts/student-360/${studentId}`);
        return mapStudent360ToStudent(response.data);
    },

    // ─── Bulk Operations ──────────────────────────────────────────────────────

    bulkUploadStudents: async (file: File, collegeId: string): Promise<ArrayBuffer> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('collegeId', collegeId);
        const response = await api.post('/admin/bulk/upload-students', formData, {
            responseType: 'arraybuffer',
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data as ArrayBuffer;
    },

    bulkDeleteStudents: async (idsOrFile: string[] | File, collegeId?: string) => {
        if (Array.isArray(idsOrFile)) {
            await api.post('/accounts/bulk-delete', { ids: idsOrFile });
            return;
        }
        const formData = new FormData();
        formData.append('file', idsOrFile);
        formData.append('collegeId', collegeId || '');
        const response = await api.post('/admin/bulk/delete-students', formData, { responseType: 'arraybuffer' });
        return response.data;
    },

    previewBulkDeletion: async (file: File, collegeId: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('collegeId', collegeId);
        const response = await api.post('/admin/bulk/preview-delete', formData);
        return response.data;
    },
    //Manage Accounts
    getExpiringStudents: async (collegeId: string) => {
        const response = await api.get('/students/profile/expiring', { params: { collegeId } });
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

    bulkRenewStudents: async (updates: { id: string; months: number }[]) => {
        await api.post('/accounts/bulk-renew', { updates });
    },
    //Manage Accounts
    getAccountStats: async (collegeId: string) => {
        const response = await api.get('/students/profile/stats', { params: { collegeId } });
        return response.data;
    },

    downloadBulkUploadTemplate: async () => {
        const response = await api.get('/admin/bulk/template/students', { responseType: 'blob' });
        downloadExcelFile(new Blob([response.data]), 'Student_Bulk_Template.xlsx');
    },

    downloadExpiringStudentsReport: async (collegeId: string, data?: any[]) => {
    if (data) {
      const excelData: string[][] = [['Roll Number', 'Name', 'Email', 'Days to Expiry', 'Status']];
      data.forEach(s => excelData.push([s.id, s.name, s.email, s.expiryIn, s.status]));
      const csv = excelData.map(row => row.join(',')).join('\n');
      downloadExcelFile(new Blob([csv], { type: 'text/csv' }), `Expiring_Students_${collegeId}.xlsx`);
      return;
    }
    const response = await api.get(`/accounts/export/college/${collegeId}/students`, {
      params: { format: 'excel' },
      responseType: 'blob'
    });
    return response.data;
  },

    // ─── Reports ──────────────────────────────────────────────────────────────

    exportStudentRegistry: async (
        collegeId: string,
        filters: any,
        format: 'excel' | 'csv' = 'excel'
    ) => {
        const params = {
            search: filters.query  || undefined,
            batch:  filters.year   !== 'All' ? filters.year   : undefined,
            branch: filters.branch !== 'All' ? filters.branch : undefined,
            format,
        };
        const response = await api.get(`/accounts/export/college/${collegeId}/students`, {
            params,
            responseType: 'blob',
        });
        const ext  = format === 'csv' ? 'csv' : 'xlsx';
        const mime = format === 'csv'
            ? 'text/csv'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        downloadExcelFile(
            new Blob([response.data], { type: mime }),
            `Student_Registry_${collegeId}_${Date.now()}.${ext}`
        );
    },

    processCustomReport: async (file: File, excludeCols: string[], excludeIds: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('excludeCols', JSON.stringify(excludeCols));
        formData.append('excludeIds', excludeIds);
        const response = await api.post('/tools/extract', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    downloadCustomReport: (data: any[][], format: 'csv' | 'xlsx') => {
        downloadDataAsFile(data, `Custom_Report.${format}`);
    },

    generateCustomGatheringReport: async (collegeId: string, rollNumbers: string, fields: string[]) => {
        const response = await api.post('/tools/gather', { collegeId, rollNumbers, fields });
        return response.data;
    },

    downloadGatheredDataReport: (data: any[][], format: 'csv' | 'xlsx') => {
        downloadDataAsFile(data, `Gathered_Data.${format}`);
    },

    getStudentApplications: async (studentId: string): Promise<any[]> => {
        const response = await api.get('/jobs/students/applications/my');
        return response.data;
    },

    getStudentApplicationTimeline: async (jobId: string, studentId: string): Promise<any[]> => {
        const response = await api.get(`/jobs/students/${jobId}/timeline`);
        return response.data;
    },

    toggleRestriction: async (userId: string, status: boolean): Promise<void> => {
        await api.patch(`/accounts/${userId}/restrict`, {}, { params: { status } });
    },
};