
import api from './api';
import { College, User, AddressFormData, BranchDTO } from '../types';

export const CollegeService = {

    // ─── Colleges ─────────────────────────────────────────────────────────────

    getColleges: async (
        query?: string,
        page: number = 0,
        size: number = 10,
        includeInactive: boolean = false
    ): Promise<{ colleges: College[]; total: number }> => {
        const response = await api.get('/colleges', {
            params: { query, page, size, includeInactive },
        });
        const colleges = response.data.content.map((c: any) => ({
            ...c,
            addressDetails: c.address_json,
        }));
        return { colleges, total: response.data.totalElements };
    },

    searchColleges: async (query?: string): Promise<College[]> => {
        const { colleges } = await CollegeService.getColleges(query);
        return colleges;
    },

    getCollegeById: async (id: string): Promise<College> => {
        const response = await api.get(`/colleges/${id}`);
        const c = response.data;
        return { ...c, addressDetails: c.address_json };
    },

    getCollegeStats: async (collegeId: string): Promise<{
        studentCount: number; cpCount: number; totalJobs: number; activeJobs: number;
    }> => {
        try {
            const response = await api.get(`/colleges/${collegeId}/stats`);
            return response.data;
        } catch {
            const [students, cpUsers, jobs] = await Promise.all([
                api.get(`/accounts/college/${collegeId}/role/STUDENT`).catch(() => ({ data: [] })),
                api.get(`/accounts/college/${collegeId}/role/CPH`).catch(() => ({ data: [] })),
                api.get(`/jobs?collegeId=${collegeId}`).catch(() => ({ data: [] })),
            ]);
            return {
                studentCount: students.data?.length ?? 0,
                cpCount:      cpUsers.data?.length  ?? 0,
                totalJobs:    jobs.data?.length      ?? 0,
                activeJobs:   jobs.data?.filter((j: any) => j.status === 'Active')?.length ?? 0,
            };
        }
    },

    createCollege: async (data: Partial<College>, logoFile?: File, address?: AddressFormData): Promise<College> => {
        try {
            let logoUrl = data.logoUrl;
            if (logoFile) {
                if (!data.code) throw new Error('College code required for logo upload');
                logoUrl = await CollegeService.uploadFile(logoFile, data.code, 'logo');
            }
            const response = await api.post('/colleges', { ...data, logoUrl, address });
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Failed to create college');
        }
    },

    updateCollege: async (college: College, logoFile?: File, address?: AddressFormData): Promise<College> => {
        try {
            let logoUrl = college.logoUrl;
            if (logoFile) logoUrl = await CollegeService.updateCollegeLogo(college.id, logoFile);
            const response = await api.put(`/colleges/${college.id}`, { ...college, logoUrl, address });
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Failed to update college');
        }
    },

    deleteCollege:    async (id: string, permanent: boolean = false): Promise<void> => {
        await api.delete(`/colleges/${id}`, { params: { permanent } });
    },
    activateCollege:  async (id: string): Promise<void> => { await api.put(`/colleges/${id}/activate`); },
    deactivateCollege:async (id: string): Promise<void> => { await api.put(`/colleges/${id}/deactivate`); },

    // ─── File uploads ──────────────────────────────────────────────────────────

    uploadFile: async (file: File, collegeCode: string, category: string): Promise<string> => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('collegeCode', collegeCode);
        fd.append('category', category);
        const response = await api.post('/colleges/upload', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.url || response.data;
    },

    updateCollegeLogo: async (collegeId: string, file: File): Promise<string> => {
        const fd = new FormData();
        fd.append('file', file);
        const response = await api.post(`/colleges/${collegeId}/logo`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // ─── College content ───────────────────────────────────────────────────────

    updateSocialMedia: async (collegeId: string, links: Record<string, string>): Promise<any> =>
        (await api.put(`/colleges/${collegeId}/social`, links)).data,

    addAboutSection: async (collegeId: string, data: { title: string; content: string; image?: string }): Promise<any> =>
        (await api.post(`/colleges/${collegeId}/about`, data)).data,

    updateAboutSection: async (collegeId: string, sectionId: string, data: { title: string; content: string; image?: string }): Promise<any> =>
        (await api.put(`/colleges/${collegeId}/about/${sectionId}`, data)).data,

    deleteAboutSection: async (collegeId: string, sectionId: string): Promise<void> => {
        await api.delete(`/colleges/${collegeId}/about/${sectionId}`);
    },

    // ─── Branches ─────────────────────────────────────────────────────────────

    getCollegeBranches:  async (collegeId: string): Promise<BranchDTO[]> =>
        (await api.get(`/colleges/${collegeId}/branches`)).data,
    addCollegeBranch:    async (collegeId: string, branch: BranchDTO): Promise<College> =>
        (await api.post(`/colleges/${collegeId}/branches`, branch)).data,
    updateCollegeBranch: async (collegeId: string, branchCode: string, branch: BranchDTO): Promise<College> =>
        (await api.put(`/colleges/${collegeId}/branches/${branchCode}`, branch)).data,
    removeCollegeBranch: async (collegeId: string, branchCode: string): Promise<College> =>
        (await api.delete(`/colleges/${collegeId}/branches/${branchCode}`)).data,

    // ─── CP Users ─────────────────────────────────────────────────────────────

    /**
     * Fetch CPH + STAFF users, filtered by status.
     * status 'active'       → ?status=active       (isDeleted=false)
     * status 'soft_deleted' → ?status=soft_deleted  (isDeleted=true)
     */
    searchCPUsers: async (
        collegeId: string,
        query?: string,
        status: 'active' | 'soft_deleted' = 'active'
    ): Promise<User[]> => {
        const params: Record<string, string> = { status };
        if (query) params.search = query;

        const [cphRes, staffRes] = await Promise.all([
            api.get(`/accounts/college/${collegeId}/role/CPH`,   { params }).catch(() => ({ data: [] })),
            api.get(`/accounts/college/${collegeId}/role/STAFF`, { params }).catch(() => ({ data: [] })),
        ]);
        const extract = (d: any): User[] => Array.isArray(d) ? d : (d?.content ?? []);
        return [...extract(cphRes.data), ...extract(staffRes.data)];
    },

    /**
     * Check if a username is available.
     * Backend endpoint: GET /api/v1/accounts/check-username?username=xxx
     * See UserAccountController.java for the new endpoint to add.
     */
    checkUsernameAvailable: async (username: string): Promise<{ available: boolean }> => {
        const response = await api.get('/accounts/check-username', { params: { username } });
        return response.data;
    },

    /**
     * Create a CPH or STAFF account.
     *
     * ── PAYLOAD DESIGN ────────────────────────────────────────────────────────
     * role       → URL query param ?role=CPH    (@RequestParam)
     * everything → JSON body                    (@RequestBody UserCreateRequest)
     *
     * We send aadhaar as BOTH "aadhaar" AND "aadhaarNumber" keys because:
     *   - UserCreateRequest.java might have field named "aadhaar" → getAadhaar()
     *   - OR it might have field named "aadhaarNumber" → getAadhaarNumber()
     * Sending both keys means Jackson will bind whichever field exists.
     *
     * address is sent as a flat object matching AddressFormData exactly.
     * If UserCreateRequest.address is a typed class, Jackson can map the flat
     * object to it as long as field names match and @JsonIgnoreProperties(ignoreUnknown=true)
     * is present on UserCreateRequest (see UserCreateRequest.java fix).
     * ─────────────────────────────────────────────────────────────────────────
     */
    createCPAdmin: async (data: {
        username?:     string;
        name:          string;
        email:         string;
        phone:         string;
        department:    string;
        aadhaar:       string;   // must be exactly 12 digits, stripped of non-digits
        address:       AddressFormData;
        collegeId:     string;
        role:          string;
        isCollegeHead: boolean;
    }): Promise<User> => {
        const { role, ...body } = data;

        const payload = {
            // Username suffix — backend uses dto.getUsername() to build full username
            username:      body.username || undefined,

            // User fields — match UserCreateRequest getters
            name:          body.name,
            email:         body.email,
            phone:         body.phone,
            department:    body.department,
            collegeId:     body.collegeId,
            isCollegeHead: body.isCollegeHead,

            // Send aadhaar under BOTH possible field names to handle either DTO definition
            aadhaar:       body.aadhaar,       // if DTO field is: private String aadhaar
            aadhaarNumber: body.aadhaar,       // if DTO field is: private String aadhaarNumber

            // Send address as flat object — Jackson can map this to any POJO
            // as long as field names match (addressLine1, city, state, zip, etc.)
            address: {
                addressLine1: body.address.addressLine1 || '',
                addressLine2: body.address.addressLine2 || '',
                village:      body.address.village      || '',
                mandal:       body.address.mandal       || '',
                city:         body.address.city         || '',
                state:        body.address.state        || '',
                zip:          body.address.zip          || '',
                country:      body.address.country      || 'India',
            },
        };

        const response = await api.post('/accounts/cph', payload, {
            params: { role },  // → ?role=CPH or ?role=STAFF
        });
        return response.data;
    },

    /**
     * Update a CPH / STAFF account.
     * PUT /api/v1/accounts/{id}
     * Sends both aadhaar field names for same reason as createCPAdmin.
     */
    updateCPAdmin: async (user: User, address: AddressFormData): Promise<User> => {
        const cleanAadhaar = (user.aadhaarNumber || '').replace(/\D/g, '');
        const payload = {
            name:          user.fullName,
            email:         user.email,
            phone:         user.phone        ?? '',
            department:    user.department   ?? '',
            aadhaar:       cleanAadhaar,
            aadhaarNumber: cleanAadhaar,
            collegeId:     user.collegeId    ?? (user as any).college?.id ?? '',
            isCollegeHead: user.isCollegeHead ?? false,
            address: {
                addressLine1: address.addressLine1 || '',
                addressLine2: address.addressLine2 || '',
                village:      address.village      || '',
                mandal:       address.mandal       || '',
                city:         address.city         || '',
                state:        address.state        || '',
                zip:          address.zip          || '',
                country:      address.country      || 'India',
            },
        };
        const response = await api.put(`/accounts/${user.id}`, payload);
        return response.data;
    },

    /**
     * Delete a CP user.
     * permanent=false → soft delete (isDeleted=true, data kept 90 days)
     * permanent=true  → hard delete (permanent, ADMIN/SROTS_DEV only)
     */
    deleteCPAdmin: async (id: string, permanent: boolean = false): Promise<void> => {
        await api.delete(`/accounts/${id}`, { params: { permanent } });
    },

    /**
     * Restore a soft-deleted CP user.
     * POST /api/v1/accounts/{id}/restore
     */
    restoreCPAdmin: async (id: string): Promise<void> => {
        await api.post(`/accounts/${id}/restore`);
    },

    // ─── CP Staff backward-compat aliases ─────────────────────────────────────

    getCPStaff: async (collegeId: string): Promise<User[]> => {
        const response = await api.get(`/accounts/college/${collegeId}/role/STAFF`);
        return Array.isArray(response.data) ? response.data : (response.data?.content ?? []);
    },

    createCPStaff: async (data: any): Promise<User> => {
        return CollegeService.createCPAdmin({
            username:      data.username || data.usernameSuffix,
            name:          data.name     || data.fullName,
            email:         data.email,
            phone:         data.phone,
            department:    data.department,
            aadhaar:       (data.aadhaar || data.aadhaarNumber || '').replace(/\D/g, ''),
            address:       data.address  || { addressLine1:'',addressLine2:'',village:'',mandal:'',city:'',state:'',zip:'',country:'India' },
            collegeId:     data.collegeId,
            role:          'STAFF',
            isCollegeHead: false,
        });
    },

    updateCPStaff: async (user: User, address: AddressFormData): Promise<User> =>
        CollegeService.updateCPAdmin(user, address),

    deleteCPStaff: async (id: string, permanent: boolean = false): Promise<void> =>
        CollegeService.deleteCPAdmin(id, permanent),

    // ─── Restriction ──────────────────────────────────────────────────────────

    toggleRestriction: async (userId: string, status: boolean): Promise<void> => {
        await api.patch(`/accounts/${userId}/restrict`, {}, { params: { status } });
    },

    // ─── Exports ──────────────────────────────────────────────────────────────

    exportCPUsers: async (collegeId: string): Promise<void> => {
        const response = await api.get(`/accounts/export/college/${collegeId}/cp`, {
            params: { format: 'excel' }, responseType: 'blob',
        });
        triggerDownload(new Blob([response.data]), `CP_Users_${collegeId}.xlsx`);
    },

    exportMasterList: async (type: 'students' | 'cp_admin'): Promise<void> => {
        const ep = type === 'students' ? '/accounts/export/all/students' : '/accounts/export/all/cp';
        const response = await api.get(ep, { params: { format: 'excel' }, responseType: 'blob' });
        triggerDownload(new Blob([response.data]),
            `${type === 'students' ? 'Students' : 'CP_Admins'}_Master_List.xlsx`);
    },

    downloadCPTeamTemplate: async (): Promise<void> => {
        const response = await api.get('/admin/bulk/template/staff', {
            responseType: 'blob', params: { format: 'excel' },
        });
        triggerDownload(new Blob([response.data]), 'Staff_Bulk_Template.xlsx');
    },

    bulkUploadStaff: async (file: File, collegeId: string): Promise<void> => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('collegeId', collegeId);
        fd.append('reportFormat', 'excel');
        const response = await api.post('/admin/bulk/upload-staff', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'blob',
        });
        triggerDownload(new Blob([response.data]), 'Staff_Upload_Report.xlsx');
    },

    // ─── Validation ───────────────────────────────────────────────────────────

    validateCollegeData: (data: Partial<College>): string[] => {
        const errors: string[] = [];
        if (!data.name?.trim())                                  errors.push('College Name');
        if (!data.code?.match(/^[A-Z0-9]+$/))                   errors.push('College Code (alphanumeric uppercase)');
        if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))  errors.push('Official Email');
        if (!data.phone?.match(/^\d{10}$/))                     errors.push('Mobile Number (10 digits)');
        if (data.landline && !data.landline.match(/^\d{10}$/))  errors.push('Landline (10 digits)');
        return errors;
    },
};

function triggerDownload(blob: Blob, filename: string): void {
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}