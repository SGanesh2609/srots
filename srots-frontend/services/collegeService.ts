// import api from './api';
// import { College, User, AddressFormData, BranchDTO } from '../types';

// // ── URL validation helper ──────────────────────────────────────────────────────
// // Returns the URL if it looks like a real absolute URL, otherwise null.
// // This prevents browsers from even attempting broken relative/placeholder URLs
// // like "srots.com/logos/..." (missing https://) or empty strings.
// export function toSafeImageUrl(url: string | null | undefined): string | null {
//     if (!url || url.trim() === '') return null;
//     try {
//         const parsed = new URL(url);
//         // Only allow http/https — reject blob: is fine too but data: could be large
//         if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
//         return url;
//     } catch {
//         // URL() throws on relative or malformed URLs — treat as no image
//         return null;
//     }
// }

// export const CollegeService = {

//     // ─── Colleges ─────────────────────────────────────────────────────────────

//     getColleges: async (
//         query?: string,
//         page: number = 0,
//         size: number = 10,
//         includeInactive: boolean = false
//     ): Promise<{ colleges: College[]; total: number }> => {
//         const response = await api.get('/colleges', {
//             params: { query, page, size, includeInactive },
//         });
//         const colleges = response.data.content.map((c: any) => ({
//             ...c,
//             addressDetails: c.address_json,
//             // Sanitize logoUrl so broken URLs don't hit the network
//             logoUrl: toSafeImageUrl(c.logoUrl),
//         }));
//         return { colleges, total: response.data.totalElements };
//     },

//     searchColleges: async (query?: string): Promise<College[]> => {
//         const { colleges } = await CollegeService.getColleges(query);
//         return colleges;
//     },

//     getCollegeById: async (id: string): Promise<College> => {
//         const response = await api.get(`/colleges/${id}`);
//         const c = response.data;
//         return {
//             ...c,
//             addressDetails: c.address_json,
//             logoUrl: toSafeImageUrl(c.logoUrl),
//         };
//     },

//     /**
//      * GET /api/v1/colleges/{id}/stats
//      *
//      * Primary: calls the dedicated /stats endpoint (CollegeController.java — now added).
//      * Fallback: if the endpoint is unavailable (e.g. older backend), assembles stats
//      *           from individual account/jobs endpoints with safe array extraction.
//      */
//     getCollegeStats: async (collegeId: string): Promise<{
//         studentCount: number; cpCount: number; totalJobs: number; activeJobs: number;
//     }> => {
//         try {
//             const response = await api.get(`/colleges/${collegeId}/stats`);
//             const d = response.data;
//             // Normalise — backend returns longs, coerce to number
//             return {
//                 studentCount: Number(d.studentCount ?? 0),
//                 cpCount:      Number(d.cpCount      ?? 0),
//                 totalJobs:    Number(d.totalJobs     ?? 0),
//                 activeJobs:   Number(d.activeJobs    ?? 0),
//             };
//         } catch (primaryErr) {
//             console.warn('[CollegeService] /stats endpoint failed, using fallback:', primaryErr);

//             // ── Fallback ──────────────────────────────────────────────────────
//             // Safely extract an array regardless of whether the API returns:
//             //   • a plain array          [ {...}, {...} ]
//             //   • a paginated envelope   { content: [...], totalElements: N }
//             //   • null / undefined
//             const extractArray = (data: any): any[] => {
//                 if (Array.isArray(data)) return data;
//                 if (data && Array.isArray(data.content)) return data.content;
//                 return [];
//             };

//             const [students, cpUsers, jobs] = await Promise.allSettled([
//                 api.get(`/accounts/college/${collegeId}/role/STUDENT`),
//                 api.get(`/accounts/college/${collegeId}/role/CPH`),
//                 api.get('/jobs', { params: { collegeId } }),
//             ]);

//             const studentList = extractArray(students.status === 'fulfilled' ? students.value.data : []);
//             const cpList      = extractArray(cpUsers.status  === 'fulfilled' ? cpUsers.value.data  : []);
//             const jobList     = extractArray(jobs.status     === 'fulfilled' ? jobs.value.data      : []);

//             return {
//                 studentCount: studentList.length,
//                 cpCount:      cpList.length,
//                 totalJobs:    jobList.length,
//                 activeJobs:   jobList.filter((j: any) => j.status === 'Active').length,
//             };
//         }
//     },

//     createCollege: async (data: Partial<College>, logoFile?: File, address?: AddressFormData): Promise<College> => {
//         try {
//             let logoUrl = data.logoUrl;
//             if (logoFile) {
//                 if (!data.code) throw new Error('College code required for logo upload');
//                 logoUrl = await CollegeService.uploadFile(logoFile, data.code, 'logo');
//             }
//             const response = await api.post('/colleges', { ...data, logoUrl, address });
//             return response.data;
//         } catch (err: any) {
//             throw new Error(err.response?.data?.message || 'Failed to create college');
//         }
//     },

//     updateCollege: async (college: College, logoFile?: File, address?: AddressFormData): Promise<College> => {
//         try {
//             let logoUrl = college.logoUrl;
//             if (logoFile) logoUrl = await CollegeService.updateCollegeLogo(college.id, logoFile);
//             const response = await api.put(`/colleges/${college.id}`, { ...college, logoUrl, address });
//             return response.data;
//         } catch (err: any) {
//             throw new Error(err.response?.data?.message || 'Failed to update college');
//         }
//     },

//     deleteCollege:     async (id: string, permanent: boolean = false): Promise<void> => {
//         await api.delete(`/colleges/${id}`, { params: { permanent } });
//     },
//     activateCollege:   async (id: string): Promise<void> => { await api.put(`/colleges/${id}/activate`); },
//     deactivateCollege: async (id: string): Promise<void> => { await api.put(`/colleges/${id}/deactivate`); },

//     // ─── File uploads ──────────────────────────────────────────────────────────

//     uploadFile: async (file: File, collegeCode: string, category: string): Promise<string> => {
//         const fd = new FormData();
//         fd.append('file', file);
//         fd.append('collegeCode', collegeCode);
//         fd.append('category', category);
//         const response = await api.post('/colleges/upload', fd, {
//             headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         return response.data.url || response.data;
//     },

//     updateCollegeLogo: async (collegeId: string, file: File): Promise<string> => {
//         const fd = new FormData();
//         fd.append('file', file);
//         const response = await api.post(`/colleges/${collegeId}/logo`, fd, {
//             headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         return response.data;
//     },

//     // ─── College content ───────────────────────────────────────────────────────

//     updateSocialMedia: async (collegeId: string, links: Record<string, string>): Promise<any> =>
//         (await api.put(`/colleges/${collegeId}/social`, links)).data,

//     addAboutSection: async (collegeId: string, data: { title: string; content: string; image?: string }): Promise<any> =>
//         (await api.post(`/colleges/${collegeId}/about`, data)).data,

//     updateAboutSection: async (collegeId: string, sectionId: string, data: { title: string; content: string; image?: string }): Promise<any> =>
//         (await api.put(`/colleges/${collegeId}/about/${sectionId}`, data)).data,

//     deleteAboutSection: async (collegeId: string, sectionId: string): Promise<void> => {
//         await api.delete(`/colleges/${collegeId}/about/${sectionId}`);
//     },

//     // ─── Branches ─────────────────────────────────────────────────────────────

//     getCollegeBranches:  async (collegeId: string): Promise<BranchDTO[]> =>
//         (await api.get(`/colleges/${collegeId}/branches`)).data,
//     addCollegeBranch:    async (collegeId: string, branch: BranchDTO): Promise<College> =>
//         (await api.post(`/colleges/${collegeId}/branches`, branch)).data,
//     updateCollegeBranch: async (collegeId: string, branchCode: string, branch: BranchDTO): Promise<College> =>
//         (await api.put(`/colleges/${collegeId}/branches/${branchCode}`, branch)).data,
//     removeCollegeBranch: async (collegeId: string, branchCode: string): Promise<College> =>
//         (await api.delete(`/colleges/${collegeId}/branches/${branchCode}`)).data,

//     // ─── CP Users ─────────────────────────────────────────────────────────────

//     searchCPUsers: async (
//         collegeId: string,
//         query?: string,
//         status: 'active' | 'soft_deleted' = 'active'
//     ): Promise<User[]> => {
//         const params: Record<string, string> = { status };
//         if (query) params.search = query;

//         const [cphRes, staffRes] = await Promise.all([
//             api.get(`/accounts/college/${collegeId}/role/CPH`,   { params }).catch(() => ({ data: [] })),
//             api.get(`/accounts/college/${collegeId}/role/STAFF`, { params }).catch(() => ({ data: [] })),
//         ]);
//         const extract = (d: any): User[] => Array.isArray(d) ? d : (d?.content ?? []);
//         return [...extract(cphRes.data), ...extract(staffRes.data)];
//     },

//     checkUsernameAvailable: async (username: string): Promise<{ available: boolean }> => {
//         const response = await api.get('/accounts/check-username', { params: { username } });
//         return response.data;
//     },

//     createCPAdmin: async (data: {
//         username?:     string;
//         name:          string;
//         email:         string;
//         phone:         string;
//         department:    string;
//         aadhaar:       string;
//         address:       AddressFormData;
//         collegeId:     string;
//         role:          string;
//         isCollegeHead: boolean;
//     }): Promise<User> => {
//         const { role, ...body } = data;

//         const payload = {
//             username:      body.username || undefined,
//             name:          body.name,
//             email:         body.email,
//             phone:         body.phone,
//             department:    body.department,
//             collegeId:     body.collegeId,
//             isCollegeHead: body.isCollegeHead,
//             aadhaar:       body.aadhaar,
//             aadhaarNumber: body.aadhaar,
//             address: {
//                 addressLine1: body.address.addressLine1 || '',
//                 addressLine2: body.address.addressLine2 || '',
//                 village:      body.address.village      || '',
//                 mandal:       body.address.mandal       || '',
//                 city:         body.address.city         || '',
//                 state:        body.address.state        || '',
//                 zip:          body.address.zip          || '',
//                 country:      body.address.country      || 'India',
//             },
//         };

//         const response = await api.post('/accounts/cph', payload, {
//             params: { role },
//         });
//         return response.data;
//     },

//     updateCPAdmin: async (user: User, address: AddressFormData): Promise<User> => {
//         const cleanAadhaar = (user.aadhaarNumber || '').replace(/\D/g, '');
//         const payload = {
//             name:          user.fullName,
//             email:         user.email,
//             phone:         user.phone        ?? '',
//             department:    user.department   ?? '',
//             aadhaar:       cleanAadhaar,
//             aadhaarNumber: cleanAadhaar,
//             collegeId:     user.collegeId    ?? (user as any).college?.id ?? '',
//             isCollegeHead: user.isCollegeHead ?? false,
//             address: {
//                 addressLine1: address.addressLine1 || '',
//                 addressLine2: address.addressLine2 || '',
//                 village:      address.village      || '',
//                 mandal:       address.mandal       || '',
//                 city:         address.city         || '',
//                 state:        address.state        || '',
//                 zip:          address.zip          || '',
//                 country:      address.country      || 'India',
//             },
//         };
//         const response = await api.put(`/accounts/${user.id}`, payload);
//         return response.data;
//     },

//     deleteCPAdmin: async (id: string, permanent: boolean = false): Promise<void> => {
//         await api.delete(`/accounts/${id}`, { params: { permanent } });
//     },

//     restoreCPAdmin: async (id: string): Promise<void> => {
//         await api.post(`/accounts/${id}/restore`);
//     },

//     // ─── CP Staff backward-compat aliases ─────────────────────────────────────

//     getCPStaff: async (collegeId: string): Promise<User[]> => {
//         const response = await api.get(`/accounts/college/${collegeId}/role/STAFF`);
//         return Array.isArray(response.data) ? response.data : (response.data?.content ?? []);
//     },

//     createCPStaff: async (data: any): Promise<User> => {
//         return CollegeService.createCPAdmin({
//             username:      data.username || data.usernameSuffix,
//             name:          data.name     || data.fullName,
//             email:         data.email,
//             phone:         data.phone,
//             department:    data.department,
//             aadhaar:       (data.aadhaar || data.aadhaarNumber || '').replace(/\D/g, ''),
//             address:       data.address  || { addressLine1:'',addressLine2:'',village:'',mandal:'',city:'',state:'',zip:'',country:'India' },
//             collegeId:     data.collegeId,
//             role:          'STAFF',
//             isCollegeHead: false,
//         });
//     },

//     updateCPStaff: async (user: User, address: AddressFormData): Promise<User> =>
//         CollegeService.updateCPAdmin(user, address),

//     deleteCPStaff: async (id: string, permanent: boolean = false): Promise<void> =>
//         CollegeService.deleteCPAdmin(id, permanent),

//     // ─── Restriction ──────────────────────────────────────────────────────────

//     toggleRestriction: async (userId: string, status: boolean): Promise<void> => {
//         await api.patch(`/accounts/${userId}/restrict`, {}, { params: { status } });
//     },

//     // ─── Exports ──────────────────────────────────────────────────────────────

//     exportCPUsers: async (collegeId: string): Promise<void> => {
//         const response = await api.get(`/accounts/export/college/${collegeId}/cp`, {
//             params: { format: 'excel' }, responseType: 'blob',
//         });
//         triggerDownload(new Blob([response.data]), `CP_Users_${collegeId}.xlsx`);
//     },

//     exportMasterList: async (type: 'students' | 'cp_admin'): Promise<void> => {
//         const ep = type === 'students' ? '/accounts/export/all/students' : '/accounts/export/all/cp';
//         const response = await api.get(ep, { params: { format: 'excel' }, responseType: 'blob' });
//         triggerDownload(new Blob([response.data]),
//             `${type === 'students' ? 'Students' : 'CP_Admins'}_Master_List.xlsx`);
//     },

//     downloadCPTeamTemplate: async (): Promise<void> => {
//         const response = await api.get('/admin/bulk/template/staff', {
//             responseType: 'blob', params: { format: 'excel' },
//         });
//         triggerDownload(new Blob([response.data]), 'Staff_Bulk_Template.xlsx');
//     },

//     bulkUploadStaff: async (file: File, collegeId: string): Promise<void> => {
//         const fd = new FormData();
//         fd.append('file', file);
//         fd.append('collegeId', collegeId);
//         fd.append('reportFormat', 'excel');
//         const response = await api.post('/admin/bulk/upload-staff', fd, {
//             headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'blob',
//         });
//         triggerDownload(new Blob([response.data]), 'Staff_Upload_Report.xlsx');
//     },

//     // ─── Validation ───────────────────────────────────────────────────────────

//     validateCollegeData: (data: Partial<College>): string[] => {
//         const errors: string[] = [];
//         if (!data.name?.trim())                                  errors.push('College Name');
//         if (!data.code?.match(/^[A-Z0-9]+$/))                   errors.push('College Code (alphanumeric uppercase)');
//         if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))  errors.push('Official Email');
//         if (!data.phone?.match(/^\d{10}$/))                     errors.push('Mobile Number (10 digits)');
//         if (data.landline && !data.landline.match(/^\d{10}$/))  errors.push('Landline (10 digits)');
//         return errors;
//     },
// };

// function triggerDownload(blob: Blob, filename: string): void {
//     const url  = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href  = url;
//     link.setAttribute('download', filename);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);
// }

// import api from './api';
// import { College, User, AddressFormData } from '../types';

// // ─── helpers ──────────────────────────────────────────────────────────────────

// const extractArray = <T>(data: any): T[] => {
//   if (!data) return [];
//   if (Array.isArray(data)) return data as T[];
//   if (data.content && Array.isArray(data.content)) return data.content as T[];
//   return [];
// };

// const toSafeImageUrl = (url?: string | null): string | undefined => {
//   if (!url || url.trim() === '') return undefined;
//   try {
//     const parsed = new URL(url);
//     if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
//     return url;
//   } catch {
//     return undefined;
//   }
// };

// const sanitizeCollege = (c: any): College => ({
//   ...c,
//   logoUrl: toSafeImageUrl(c.logoUrl),
// });

// function triggerDownload(blob: Blob, filename: string): void {
//   const url  = window.URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href  = url;
//   link.setAttribute('download', filename);
//   document.body.appendChild(link);
//   link.click();
//   link.remove();
//   window.URL.revokeObjectURL(url);
// }

// // ─── Service ──────────────────────────────────────────────────────────────────

// export const CollegeService = {

//   // ── Colleges ────────────────────────────────────────────────────────────────

//   getColleges: async (
//     query?: string,
//     page = 0,
//     size = 10,
//     includeInactive = false,
//   ): Promise<{ colleges: College[]; total: number }> => {
//     const response = await api.get('/colleges', {
//       params: { search: query, page, size, includeInactive },
//     });
//     const data = response.data;
//     if (data?.content) {
//       return {
//         colleges: (data.content as any[]).map(sanitizeCollege),
//         total: data.totalElements ?? data.content.length,
//       };
//     }
//     const list = Array.isArray(data) ? data : [];
//     return { colleges: list.map(sanitizeCollege), total: list.length };
//   },

//   searchColleges: async (query?: string): Promise<College[]> => {
//     const response = await api.get('/colleges', { params: { search: query } });
//     return extractArray<any>(response.data).map(sanitizeCollege);
//   },

//   getCollegeById: async (id: string): Promise<College> => {
//     const response = await api.get(`/colleges/${id}`);
//     return sanitizeCollege(response.data);
//   },

//   createCollege: async (data: FormData | Partial<College>): Promise<College> => {
//     const response = await api.post('/colleges', data);
//     return sanitizeCollege(response.data);
//   },

//   updateCollege: async (data: Partial<College> & { id: string }): Promise<College> => {
//     const response = await api.put(`/colleges/${data.id}`, data);
//     return sanitizeCollege(response.data);
//   },

//   uploadCollegeLogo: async (collegeId: string, file: File): Promise<string> => {
//     const form = new FormData();
//     form.append('file', file);
//     const response = await api.post(`/colleges/${collegeId}/logo`, form, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return response.data?.logoUrl ?? response.data;
//   },

//   softDeleteCollege: async (id: string): Promise<void> => {
//     await api.delete(`/colleges/${id}`);
//   },

//   hardDeleteCollege: async (id: string): Promise<void> => {
//     await api.delete(`/colleges/${id}/permanent`);
//   },

//   toggleCollegeActive: async (id: string, active: boolean): Promise<void> => {
//     await api.patch(`/colleges/${id}/status`, {}, { params: { active } });
//   },

//   exportMasterList: (type: 'students' | 'cp_admin'): void => {
//     window.open(`/colleges/export/${type}`, '_blank');
//   },

//   // ── College Stats ────────────────────────────────────────────────────────────

//   getCollegeStats: async (
//     collegeId: string,
//   ): Promise<{ studentCount: number; cpCount: number; totalJobs: number; activeJobs: number }> => {
//     try {
//       const response = await api.get(`/colleges/${collegeId}/stats`);
//       return response.data;
//     } catch {
//       const [accountsRes, jobsRes] = await Promise.allSettled([
//         api.get(`/colleges/${collegeId}/accounts`),
//         api.get(`/colleges/${collegeId}/jobs`),
//       ]);
//       const accounts = accountsRes.status === 'fulfilled'
//         ? extractArray<User>(accountsRes.value.data) : [];
//       const jobs = jobsRes.status === 'fulfilled'
//         ? extractArray<any>(jobsRes.value.data) : [];
//       return {
//         studentCount: accounts.filter((u: any) => u.role === 'STUDENT').length,
//         cpCount:      accounts.filter((u: any) => ['CPH', 'STAFF'].includes(u.role)).length,
//         totalJobs:    jobs.length,
//         activeJobs:   jobs.filter((j: any) => j.status === 'ACTIVE').length,
//       };
//     }
//   },

//   // ── CP Users (CPH / STAFF) — SROTS Admin CMS ─────────────────────────────────
//   //
//   // Endpoint map (matches UserAccountController):
//   //   GET  /accounts/college/{id}/role/CPH    — list CPHs
//   //   GET  /accounts/college/{id}/role/STAFF  — list STAFF
//   //   POST /accounts/cph?role=CPH|STAFF       — create
//   //   PUT  /accounts/{userId}                 — update
//   //   DELETE /accounts/{userId}?permanent=false — soft-delete
//   //   DELETE /accounts/{userId}?permanent=true  — hard-delete (ADMIN/SROTS_DEV only)
//   //   POST   /accounts/{userId}/restore         — restore soft-deleted
//   //   PATCH  /accounts/{userId}/restrict        — toggle restriction
//   //   POST   /accounts/{userId}/resend-credentials

//   /**
//    * Fetch all CPH + STAFF for a college.
//    * `status` = 'active' | 'soft_deleted'
//    */
//   getCPUsers: async (
//     collegeId: string,
//     query?: string,
//     status: 'active' | 'soft_deleted' = 'active',
//   ): Promise<User[]> => {
//     const params: Record<string, string> = { status };
//     if (query && query.trim()) params.search = query.trim();

//     const [cphRes, staffRes] = await Promise.all([
//       api.get(`/accounts/college/${collegeId}/role/CPH`,   { params }).catch(() => ({ data: [] })),
//       api.get(`/accounts/college/${collegeId}/role/STAFF`, { params }).catch(() => ({ data: [] })),
//     ]);

//     return [
//       ...extractArray<User>(cphRes.data),
//       ...extractArray<User>(staffRes.data),
//     ];
//   },

//   /**
//    * Create a CPH or STAFF account.
//    * POST /accounts/cph?role=CPH|STAFF
//    */
//   createCPUser: async (collegeId: string, data: Partial<User> & Record<string, any>): Promise<User> => {
//     const role         = (data.role as string) ?? 'STAFF';
//     const cleanAadhaar = (data.aadhaarNumber ?? data.aadhaar ?? '').replace(/\D/g, '');

//     const payload = {
//       username:      data.username     || undefined,
//       name:          data.fullName     || data.name || '',
//       email:         data.email        || '',
//       phone:         data.phone        || '',
//       department:    data.department   || '',
//       collegeId,
//       isCollegeHead: data.isCollegeHead ?? (role === 'CPH'),
//       aadhaar:       cleanAadhaar,
//       aadhaarNumber: cleanAadhaar,
//       address:       data.address      || undefined,
//     };

//     const response = await api.post('/accounts/cph', payload, { params: { role } });
//     return response.data;
//   },

//   /**
//    * Update a CP user.
//    * PUT /accounts/{userId}
//    */
//   updateCPUser: async (
//     collegeId: string,
//     userId: string,
//     data: Partial<User> & Record<string, any>,
//   ): Promise<User> => {
//     const cleanAadhaar = (data.aadhaarNumber ?? data.aadhaar ?? '').replace(/\D/g, '');

//     const payload = {
//       name:          data.fullName     || data.name || '',
//       email:         data.email        || '',
//       phone:         data.phone        || '',
//       department:    data.department   || '',
//       collegeId,
//       isCollegeHead: data.isCollegeHead ?? false,
//       aadhaar:       cleanAadhaar,
//       aadhaarNumber: cleanAadhaar,
//       address:       data.address      || undefined,
//     };

//     const response = await api.put(`/accounts/${userId}`, payload);
//     return response.data;
//   },

//   /**
//    * Soft-delete a CP user — data preserved for 90 days, restorable.
//    * DELETE /accounts/{userId}?permanent=false
//    */
//   softDeleteCPUser: async (userId: string): Promise<void> => {
//     await api.delete(`/accounts/${userId}`, { params: { permanent: false } });
//   },

//   /**
//    * Hard-delete a CP user — permanently destroys all data.
//    * Requires ADMIN or SROTS_DEV role on the backend.
//    * DELETE /accounts/{userId}?permanent=true
//    */
//   hardDeleteCPUser: async (userId: string): Promise<void> => {
//     await api.delete(`/accounts/${userId}`, { params: { permanent: true } });
//   },

//   /**
//    * Restore a soft-deleted CP user.
//    * POST /accounts/{userId}/restore
//    */
//   restoreCPUser: async (userId: string): Promise<void> => {
//     await api.post(`/accounts/${userId}/restore`);
//   },

//   /**
//    * @deprecated use softDeleteCPUser / hardDeleteCPUser
//    * Kept so existing callers don't break while migrating.
//    */
//   deleteCPUser: async (collegeId: string, userId: string): Promise<void> => {
//     await api.delete(`/accounts/${userId}`, { params: { permanent: false } });
//   },

//   /**
//    * Toggle restriction / access.
//    * PATCH /accounts/{userId}/restrict?status=true|false
//    */
//   toggleCPStaffAccess: async (
//     collegeId: string,
//     userId: string,
//     restrict: boolean,
//   ): Promise<void> => {
//     await api.patch(
//       `/accounts/${userId}/restrict`,
//       {},
//       { params: { status: restrict } },
//     );
//   },

//   /**
//    * Check username availability.
//    * GET /accounts/check-username?username=...
//    */
//   checkUsernameAvailable: async (username: string): Promise<{ available: boolean }> => {
//     const response = await api.get('/accounts/check-username', { params: { username } });
//     return response.data;
//   },

//   /**
//    * Resend login credentials to a user's email.
//    * POST /accounts/{userId}/resend-credentials
//    */
//   resendCredentials: async (userId: string): Promise<void> => {
//     await api.post(`/accounts/${userId}/resend-credentials`);
//   },

//   /**
//    * Bulk-create CP users (CPH or STAFF) from Excel/CSV.
//    * POST /admin/bulk/upload-staff?roleToAssign=STAFF&collegeId=...
//    *
//    * IMPORTANT: `roleToAssign` and `collegeId` are sent as URL query params,
//    * NOT as FormData fields.  Spring's @RequestParam only reads query params
//    * (or application/x-www-form-urlencoded) — it does NOT read multipart
//    * FormData text fields for @RequestParam bindings when the content type
//    * is multipart/form-data with a file part.
//    *
//    * The backend BulkUploadController.uploadStaff() now reads:
//    *   @RequestParam("roleToAssign") String requestedRole
//    * which maps to the query string, not the multipart body.
//    */
//   bulkCreateCPUsers: async (
//     collegeId: string,
//     file: File,
//     role: 'CPH' | 'STAFF' = 'STAFF',
//   ): Promise<{ success: number; failed: number; errors: string[] }> => {
//     const form = new FormData();
//     form.append('file', file);
//     // Only the file goes in FormData — everything else is a URL query param
//     // so Spring @RequestParam picks it up correctly.

//     try {
//       await api.post('/admin/bulk/upload-staff', form, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         params: {
//           collegeId,
//           roleToAssign: role,       // ← query param, NOT FormData field
//           reportFormat: 'excel',
//         },
//       });
//       return { success: 1, failed: 0, errors: [] };
//     } catch (err: any) {
//       const msg = err?.response?.data?.message ?? 'Bulk upload failed.';
//       return { success: 0, failed: 0, errors: [msg] };
//     }
//   },

//   /** Download the CP users bulk-upload Excel template */
//   downloadCPUsersTemplate: async (): Promise<void> => {
//     const response = await api.get('/admin/bulk/template/staff', {
//       responseType: 'blob',
//       params: { format: 'excel' },
//     });
//     triggerDownload(new Blob([response.data]), 'CP_Staff_Bulk_Template.xlsx');
//   },

//   // ── CP Staff — CP Portal (ManageTeam) ────────────────────────────────────────

//   getCPStaff: async (collegeId: string, query?: string): Promise<User[]> => {
//     const params: Record<string, string> = { status: 'active' };
//     if (query && query.trim()) params.search = query.trim();
//     const response = await api.get(`/accounts/college/${collegeId}/role/STAFF`, { params })
//       .catch(() => ({ data: [] }));
//     return extractArray<User>(response.data);
//   },

//   createCPStaff: async (
//     data: Partial<User> & {
//       collegeId: string;
//       parentId:  string;
//       name:      string;
//       email:     string;
//       aadhaar?:  string;
//     } & Record<string, any>,
//   ): Promise<User> => {
//     const { collegeId, ...rest } = data;
//     const cleanAadhaar = ((rest.aadhaar ?? rest.aadhaarNumber ?? '')).replace(/\D/g, '');

//     const payload = {
//       username:      rest.username   || undefined,
//       name:          rest.name       || rest.fullName || '',
//       email:         rest.email      || '',
//       phone:         rest.phone      || '',
//       department:    rest.department || '',
//       collegeId,
//       isCollegeHead: false,
//       aadhaar:       cleanAadhaar,
//       aadhaarNumber: cleanAadhaar,
//       address:       rest.address    || undefined,
//     };

//     const response = await api.post('/accounts/cph', payload, { params: { role: 'STAFF' } });
//     return response.data;
//   },

//   updateCPStaff: async (user: User, address?: AddressFormData): Promise<User> => {
//     const cid          = (user as any).collegeId ?? (user as any).college?.id ?? '';
//     const cleanAadhaar = (user.aadhaarNumber ?? '').replace(/\D/g, '');

//     const payload = {
//       name:          user.fullName   || '',
//       email:         user.email      || '',
//       phone:         user.phone      || '',
//       department:    user.department || '',
//       collegeId:     cid,
//       isCollegeHead: false,
//       aadhaar:       cleanAadhaar,
//       aadhaarNumber: cleanAadhaar,
//       address:       address ?? (user as any).address ?? undefined,
//     };

//     const response = await api.put(`/accounts/${user.id}`, payload);
//     return response.data;
//   },

//   deleteCPStaff: async (userId: string, collegeId: string): Promise<void> => {
//     await api.delete(`/accounts/${userId}`, { params: { permanent: false } });
//   },

//   downloadCPTeamTemplate: async (): Promise<void> => {
//     const response = await api.get('/admin/bulk/template/staff', {
//       responseType: 'blob',
//       params: { format: 'excel' },
//     });
//     triggerDownload(new Blob([response.data]), 'Staff_Bulk_Template.xlsx');
//   },

//   // ── Students ─────────────────────────────────────────────────────────────────
//   //
//   // Endpoint map (matches UserAccountController):
//   //   GET  /accounts/college/{id}/role/STUDENT?status=active|soft_deleted
//   //   POST /accounts/student
//   //   PUT  /accounts/{userId}
//   //   DELETE /accounts/{userId}?permanent=false  — soft-delete
//   //   DELETE /accounts/{userId}?permanent=true   — hard-delete
//   //   POST   /accounts/{userId}/restore          — restore
//   //   POST   /accounts/{userId}/resend-credentials

//   /**
//    * Fetch students for a college.
//    * `status` = 'active' | 'soft_deleted'
//    */
//   getStudents: async (
//     collegeId: string,
//     query?: string,
//     status: 'active' | 'soft_deleted' = 'active',
//   ): Promise<User[]> => {
//     const params: Record<string, string> = { status };
//     if (query && query.trim()) params.search = query.trim();
//     const response = await api.get(`/accounts/college/${collegeId}/role/STUDENT`, { params })
//       .catch(() => ({ data: [] }));
//     return extractArray<User>(response.data);
//   },

//   /**
//    * Soft-delete a student — data preserved for 90 days, restorable.
//    * DELETE /accounts/{userId}?permanent=false
//    */
//   softDeleteStudent: async (userId: string): Promise<void> => {
//     await api.delete(`/accounts/${userId}`, { params: { permanent: false } });
//   },

//   /**
//    * Hard-delete a student — permanently destroys all data.
//    * Requires ADMIN or SROTS_DEV role on the backend.
//    * DELETE /accounts/{userId}?permanent=true
//    */
//   hardDeleteStudent: async (userId: string): Promise<void> => {
//     await api.delete(`/accounts/${userId}`, { params: { permanent: true } });
//   },

//   /**
//    * Restore a soft-deleted student.
//    * POST /accounts/{userId}/restore
//    */
//   restoreStudent: async (userId: string): Promise<void> => {
//     await api.post(`/accounts/${userId}/restore`);
//   },

//   bulkCreateStudents: async (
//     collegeId: string,
//     file: File,
//   ): Promise<{ success: number; failed: number; errors: string[] }> => {
//     const form = new FormData();
//     form.append('file', file);
//     const response = await api.post('/admin/bulk/upload-students', form, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return response.data;
//   },

//   downloadStudentTemplate: async (): Promise<void> => {
//     const response = await api.get('/admin/bulk/template/students', {
//       responseType: 'blob',
//       params: { format: 'excel' },
//     });
//     triggerDownload(new Blob([response.data]), 'Student_Bulk_Template.xlsx');
//   },

//   // ── Jobs ────────────────────────────────────────────────────────────────────

//   getCollegeJobs: async (collegeId: string): Promise<any[]> => {
//     const response = await api.get(`/colleges/${collegeId}/jobs`);
//     return extractArray(response.data);
//   },

//   // ── Validation ──────────────────────────────────────────────────────────────

//   validateCollegeData: (data: Partial<College>): string[] => {
//     const errors: string[] = [];
//     if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
//       errors.push('Invalid email format');
//     }
//     if (data.phone && !/^\d{10}$/.test(data.phone)) {
//       errors.push('Phone must be 10 digits');
//     }
//     return errors;
//   },
// };

import api from './api';
import { College, User, AddressFormData } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────

const extractArray = <T>(data: any): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (data.content && Array.isArray(data.content)) return data.content as T[];
  return [];
};

const toSafeImageUrl = (url?: string | null): string | undefined => {
  if (!url || url.trim() === '') return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
    return url;
  } catch {
    return undefined;
  }
};

const sanitizeCollege = (c: any): College => ({
  ...c,
  logoUrl: toSafeImageUrl(c.logoUrl),
});

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

// ─── Service ──────────────────────────────────────────────────────────────────

export const CollegeService = {

  // ── Colleges ────────────────────────────────────────────────────────────────

  getColleges: async (
    query?: string,
    page = 0,
    size = 10,
    includeInactive = false,
  ): Promise<{ colleges: College[]; total: number }> => {
    const response = await api.get('/colleges', {
      params: { search: query, page, size, includeInactive },
    });
    const data = response.data;
    if (data?.content) {
      return {
        colleges: (data.content as any[]).map(sanitizeCollege),
        total: data.totalElements ?? data.content.length,
      };
    }
    const list = Array.isArray(data) ? data : [];
    return { colleges: list.map(sanitizeCollege), total: list.length };
  },

  searchColleges: async (query?: string): Promise<College[]> => {
    const response = await api.get('/colleges', { params: { search: query } });
    return extractArray<any>(response.data).map(sanitizeCollege);
  },

  getCollegeById: async (id: string): Promise<College> => {
    const response = await api.get(`/colleges/${id}`);
    return sanitizeCollege(response.data);
  },

  createCollege: async (data: FormData | Partial<College>): Promise<College> => {
    const response = await api.post('/colleges', data);
    return sanitizeCollege(response.data);
  },

  updateCollege: async (data: Partial<College> & { id: string }): Promise<College> => {
    const response = await api.put(`/colleges/${data.id}`, data);
    return sanitizeCollege(response.data);
  },

  uploadCollegeLogo: async (collegeId: string, file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post(`/colleges/${collegeId}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.logoUrl ?? response.data;
  },

  softDeleteCollege: async (id: string): Promise<void> => {
    await api.delete(`/colleges/${id}`);
  },

  hardDeleteCollege: async (id: string): Promise<void> => {
    await api.delete(`/colleges/${id}/permanent`);
  },

  toggleCollegeActive: async (id: string, active: boolean): Promise<void> => {
    await api.patch(`/colleges/${id}/status`, {}, { params: { active } });
  },

  exportMasterList: (type: 'students' | 'cp_admin'): void => {
    window.open(`/colleges/export/${type}`, '_blank');
  },

  // ── College Stats ────────────────────────────────────────────────────────────

  getCollegeStats: async (
    collegeId: string,
  ): Promise<{ studentCount: number; cpCount: number; totalJobs: number; activeJobs: number }> => {
    try {
      const response = await api.get(`/colleges/${collegeId}/stats`);
      return response.data;
    } catch {
      const [accountsRes, jobsRes] = await Promise.allSettled([
        api.get(`/colleges/${collegeId}/accounts`),
        api.get(`/colleges/${collegeId}/jobs`),
      ]);
      const accounts = accountsRes.status === 'fulfilled'
        ? extractArray<User>(accountsRes.value.data) : [];
      const jobs = jobsRes.status === 'fulfilled'
        ? extractArray<any>(jobsRes.value.data) : [];
      return {
        studentCount: accounts.filter((u: any) => u.role === 'STUDENT').length,
        cpCount:      accounts.filter((u: any) => ['CPH', 'STAFF'].includes(u.role)).length,
        totalJobs:    jobs.length,
        activeJobs:   jobs.filter((j: any) => j.status === 'ACTIVE').length,
      };
    }
  },

  // ── CP Users (CPH / STAFF) — SROTS Admin CMS ─────────────────────────────────
  //
  // Endpoint map (matches UserAccountController):
  //   GET  /accounts/college/{id}/role/CPH    — list CPHs
  //   GET  /accounts/college/{id}/role/STAFF  — list STAFF
  //   POST /accounts/cph?role=CPH|STAFF       — create
  //   PUT  /accounts/{userId}                 — update
  //   DELETE /accounts/{userId}?permanent=false — soft-delete
  //   DELETE /accounts/{userId}?permanent=true  — hard-delete (ADMIN/SROTS_DEV only)
  //   POST   /accounts/{userId}/restore         — restore soft-deleted
  //   PATCH  /accounts/{userId}/restrict        — toggle restriction
  //   POST   /accounts/{userId}/resend-credentials

  /**
   * Fetch all CPH + STAFF for a college.
   * `status` = 'active' | 'soft_deleted'
   */
  getCPUsers: async (
    collegeId: string,
    query?: string,
    status: 'active' | 'soft_deleted' = 'active',
  ): Promise<User[]> => {
    const params: Record<string, string> = { status };
    if (query && query.trim()) params.search = query.trim();

    const [cphRes, staffRes] = await Promise.all([
      api.get(`/accounts/college/${collegeId}/role/CPH`,   { params }).catch(() => ({ data: [] })),
      api.get(`/accounts/college/${collegeId}/role/STAFF`, { params }).catch(() => ({ data: [] })),
    ]);

    return [
      ...extractArray<User>(cphRes.data),
      ...extractArray<User>(staffRes.data),
    ];
  },

  /**
   * Create a CPH or STAFF account.
   * POST /accounts/cph?role=CPH|STAFF
   */
  createCPUser: async (collegeId: string, data: Partial<User> & Record<string, any>): Promise<User> => {
    const role         = (data.role as string) ?? 'STAFF';
    const cleanAadhaar = (data.aadhaarNumber ?? data.aadhaar ?? '').replace(/\D/g, '');

    const payload = {
      username:      data.username     || undefined,
      name:          data.fullName     || data.name || '',
      email:         data.email        || '',
      phone:         data.phone        || '',
      department:    data.department   || '',
      collegeId,
      isCollegeHead: data.isCollegeHead ?? (role === 'CPH'),
      aadhaar:       cleanAadhaar,
      aadhaarNumber: cleanAadhaar,
      address:       data.address      || undefined,
    };

    const response = await api.post('/accounts/cph', payload, { params: { role } });
    return response.data;
  },

  /**
   * Update a CP user.
   * PUT /accounts/{userId}
   */
  updateCPUser: async (
    collegeId: string,
    userId: string,
    data: Partial<User> & Record<string, any>,
  ): Promise<User> => {
    const cleanAadhaar = (data.aadhaarNumber ?? data.aadhaar ?? '').replace(/\D/g, '');

    const payload = {
      name:          data.fullName     || data.name || '',
      email:         data.email        || '',
      phone:         data.phone        || '',
      department:    data.department   || '',
      collegeId,
      isCollegeHead: data.isCollegeHead ?? false,
      aadhaar:       cleanAadhaar,
      aadhaarNumber: cleanAadhaar,
      address:       data.address      || undefined,
    };

    const response = await api.put(`/accounts/${userId}`, payload);
    return response.data;
  },

  /**
   * Soft-delete a CP user — data preserved for 90 days, restorable.
   * DELETE /accounts/{userId}?permanent=false
   */
  softDeleteCPUser: async (userId: string): Promise<void> => {
    await api.delete(`/accounts/${userId}`, { params: { permanent: false } });
  },

  /**
   * Hard-delete a CP user — permanently destroys all data.
   * Requires ADMIN or SROTS_DEV role on the backend.
   * DELETE /accounts/{userId}?permanent=true
   */
  hardDeleteCPUser: async (userId: string): Promise<void> => {
    await api.delete(`/accounts/${userId}`, { params: { permanent: true } });
  },

  /**
   * Restore a soft-deleted CP user.
   * POST /accounts/{userId}/restore
   */
  restoreCPUser: async (userId: string): Promise<void> => {
    await api.post(`/accounts/${userId}/restore`);
  },

  /**
   * @deprecated use softDeleteCPUser / hardDeleteCPUser
   * Kept so existing callers don't break while migrating.
   */
  deleteCPUser: async (collegeId: string, userId: string): Promise<void> => {
    await api.delete(`/accounts/${userId}`, { params: { permanent: false } });
  },

  /**
   * Toggle restriction / access.
   * PATCH /accounts/{userId}/restrict?status=true|false
   */
  toggleCPStaffAccess: async (
    collegeId: string,
    userId: string,
    restrict: boolean,
  ): Promise<void> => {
    await api.patch(
      `/accounts/${userId}/restrict`,
      {},
      { params: { status: restrict } },
    );
  },

  /**
   * Check username availability.
   * GET /accounts/check-username?username=...
   */
  checkUsernameAvailable: async (username: string): Promise<{ available: boolean }> => {
    const response = await api.get('/accounts/check-username', { params: { username } });
    return response.data;
  },

  /**
   * Resend login credentials to a user's email.
   * POST /accounts/{userId}/resend-credentials
   */
  resendCredentials: async (userId: string): Promise<void> => {
    await api.post(`/accounts/${userId}/resend-credentials`);
  },

  /**
   * Bulk-create CP users (CPH or STAFF) from Excel/CSV.
   * POST /admin/bulk/upload-staff?roleToAssign=STAFF&collegeId=...
   *
   * IMPORTANT: `roleToAssign` and `collegeId` are sent as URL query params,
   * NOT as FormData fields.  Spring's @RequestParam only reads query params
   * (or application/x-www-form-urlencoded) — it does NOT read multipart
   * FormData text fields for @RequestParam bindings when the content type
   * is multipart/form-data with a file part.
   *
   * The backend BulkUploadController.uploadStaff() now reads:
   *   @RequestParam("roleToAssign") String requestedRole
   * which maps to the query string, not the multipart body.
   */
  bulkCreateCPUsers: async (
    collegeId: string,
    file: File,
    role: 'CPH' | 'STAFF' = 'STAFF',
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    const form = new FormData();
    form.append('file', file);
    // Only the file goes in FormData — everything else is a URL query param
    // so Spring @RequestParam picks it up correctly.

    try {
      await api.post('/admin/bulk/upload-staff', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: {
          collegeId,
          roleToAssign: role,       // ← query param, NOT FormData field
          reportFormat: 'excel',
        },
      });
      return { success: 1, failed: 0, errors: [] };
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Bulk upload failed.';
      return { success: 0, failed: 0, errors: [msg] };
    }
  },

  /** Download the CP users bulk-upload Excel template */
  downloadCPUsersTemplate: async (): Promise<void> => {
    const response = await api.get('/admin/bulk/template/staff', {
      responseType: 'blob',
      params: { format: 'excel' },
    });
    triggerDownload(new Blob([response.data]), 'CP_Staff_Bulk_Template.xlsx');
  },

  // ── CP Staff — CP Portal (ManageTeam) ────────────────────────────────────────

  getCPStaff: async (
    collegeId: string,
    query?: string,
    status: 'active' | 'soft_deleted' = 'active',
  ): Promise<User[]> => {
    const params: Record<string, string> = { status };
    if (query && query.trim()) params.search = query.trim();
    const response = await api.get(`/accounts/college/${collegeId}/role/STAFF`, { params })
      .catch(() => ({ data: [] }));
    return extractArray<User>(response.data);
  },

  createCPStaff: async (
    data: Partial<User> & {
      collegeId: string;
      parentId:  string;
      name:      string;
      email:     string;
      aadhaar?:  string;
    } & Record<string, any>,
  ): Promise<User> => {
    const { collegeId, ...rest } = data;
    const cleanAadhaar = ((rest.aadhaar ?? rest.aadhaarNumber ?? '')).replace(/\D/g, '');

    const payload = {
      username:      rest.username   || undefined,
      name:          rest.name       || rest.fullName || '',
      email:         rest.email      || '',
      phone:         rest.phone      || '',
      department:    rest.department || '',
      collegeId,
      isCollegeHead: false,
      aadhaar:       cleanAadhaar,
      aadhaarNumber: cleanAadhaar,
      address:       rest.address    || undefined,
    };

    const response = await api.post('/accounts/cph', payload, { params: { role: 'STAFF' } });
    return response.data;
  },

  updateCPStaff: async (user: User, address?: AddressFormData): Promise<User> => {
    const cid          = (user as any).collegeId ?? (user as any).college?.id ?? '';
    const cleanAadhaar = (user.aadhaarNumber ?? '').replace(/\D/g, '');

    const payload = {
      name:          user.fullName   || '',
      email:         user.email      || '',
      phone:         user.phone      || '',
      department:    user.department || '',
      collegeId:     cid,
      isCollegeHead: false,
      aadhaar:       cleanAadhaar,
      aadhaarNumber: cleanAadhaar,
      address:       address ?? (user as any).address ?? undefined,
    };

    const response = await api.put(`/accounts/${user.id}`, payload);
    return response.data;
  },

  deleteCPStaff: async (userId: string, collegeId: string): Promise<void> => {
    await api.delete(`/accounts/${userId}`, { params: { permanent: false } });
  },

  downloadCPTeamTemplate: async (): Promise<void> => {
    const response = await api.get('/admin/bulk/template/staff', {
      responseType: 'blob',
      params: { format: 'excel' },
    });
    triggerDownload(new Blob([response.data]), 'Staff_Bulk_Template.xlsx');
  },

  // ── Students ─────────────────────────────────────────────────────────────────
  //
  // Endpoint map (matches UserAccountController):
  //   GET  /accounts/college/{id}/role/STUDENT?status=active|soft_deleted
  //   POST /accounts/student
  //   PUT  /accounts/{userId}
  //   DELETE /accounts/{userId}?permanent=false  — soft-delete
  //   DELETE /accounts/{userId}?permanent=true   — hard-delete
  //   POST   /accounts/{userId}/restore          — restore
  //   POST   /accounts/{userId}/resend-credentials

  /**
   * Fetch students for a college.
   * `status` = 'active' | 'soft_deleted'
   */
  getStudents: async (
    collegeId: string,
    query?: string,
    status: 'active' | 'soft_deleted' = 'active',
  ): Promise<User[]> => {
    const params: Record<string, string> = { status };
    if (query && query.trim()) params.search = query.trim();
    const response = await api.get(`/accounts/college/${collegeId}/role/STUDENT`, { params })
      .catch(() => ({ data: [] }));
    return extractArray<User>(response.data);
  },

  /**
   * Soft-delete a student — data preserved for 90 days, restorable.
   * DELETE /accounts/{userId}?permanent=false
   */
  softDeleteStudent: async (userId: string): Promise<void> => {
    await api.delete(`/accounts/${userId}`, { params: { permanent: false } });
  },

  /**
   * Hard-delete a student — permanently destroys all data.
   * Requires ADMIN or SROTS_DEV role on the backend.
   * DELETE /accounts/{userId}?permanent=true
   */
  hardDeleteStudent: async (userId: string): Promise<void> => {
    await api.delete(`/accounts/${userId}`, { params: { permanent: true } });
  },

  /**
   * Restore a soft-deleted student.
   * POST /accounts/{userId}/restore
   */
  restoreStudent: async (userId: string): Promise<void> => {
    await api.post(`/accounts/${userId}/restore`);
  },

  bulkCreateStudents: async (
    collegeId: string,
    file: File,
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post('/admin/bulk/upload-students', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  downloadStudentTemplate: async (): Promise<void> => {
    const response = await api.get('/admin/bulk/template/students', {
      responseType: 'blob',
      params: { format: 'excel' },
    });
    triggerDownload(new Blob([response.data]), 'Student_Bulk_Template.xlsx');
  },

  // ── Jobs ────────────────────────────────────────────────────────────────────

  getCollegeJobs: async (collegeId: string): Promise<any[]> => {
    const response = await api.get(`/colleges/${collegeId}/jobs`);
    return extractArray(response.data);
  },

  // ── Validation ──────────────────────────────────────────────────────────────

  validateCollegeData: (data: Partial<College>): string[] => {
    const errors: string[] = [];
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }
    if (data.phone && !/^\d{10}$/.test(data.phone)) {
      errors.push('Phone must be 10 digits');
    }
    return errors;
  },
};