import api from './api';
import { Job, JobFormState, StudentJobView, User, Role, PaginatedResponse } from '../types';
import { downloadExcelFile } from '../utils/fileHelper';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface AdminJobFilters {
  query?: string;
  types?: string[];
  modes?: string[];
  statuses?: string[];
  ownerId?: string;
  includeArchived?: boolean;
  page?: number;
  size?: number;
}

export interface JobsPageResult {
  content: Job[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ════════════════════════════════════════════════════════════════════════════
// MAP DTO → types.ts Job (single source of truth)
// ════════════════════════════════════════════════════════════════════════════

export function mapDtoToJob(dto: any): Job {
  if (!dto) return dto;
  return {
    ...dto,

    // ── Eligibility number coercion ────────────────────────────────────────
    minUgScore:     dto.minUgScore     != null ? Number(dto.minUgScore)     : undefined,
    min10thScore:   dto.min10thScore   != null ? Number(dto.min10thScore)   : undefined,
    min12thScore:   dto.min12thScore   != null ? Number(dto.min12thScore)   : undefined,
    minDiplomaScore:dto.minDiplomaScore!= null ? Number(dto.minDiplomaScore): undefined,

    // ✅ CRITICAL FIX: Preserve score formats from backend
    formatUg:      dto.formatUg      || 'Percentage',
    format10th:    dto.format10th    || 'Percentage',
    format12th:    dto.format12th    || 'Percentage',
    formatDiploma: dto.formatDiploma || 'Percentage',

    // ── Backward-compat aliases ────────────────────────────────────────────
    company:         dto.companyName         || dto.company         || '',
    type:            dto.jobType             || dto.type            || '',
    workArrangement: dto.workMode            || dto.workArrangement || '',

    // ── Arrays — backend sends parsed arrays, guarantee they're arrays ──────
    responsibilitiesJson:        Array.isArray(dto.responsibilitiesJson)        ? dto.responsibilitiesJson        : [],
    qualificationsJson:          Array.isArray(dto.qualificationsJson)          ? dto.qualificationsJson          : [],
    preferredQualificationsJson: Array.isArray(dto.preferredQualificationsJson) ? dto.preferredQualificationsJson : [],
    benefitsJson:                Array.isArray(dto.benefitsJson)                ? dto.benefitsJson                : [],

    // Convenience aliases used by older components
    responsibilities:        Array.isArray(dto.responsibilitiesJson)        ? dto.responsibilitiesJson        : [],
    qualifications:          Array.isArray(dto.qualificationsJson)          ? dto.qualificationsJson          : [],
    preferredQualifications: Array.isArray(dto.preferredQualificationsJson) ? dto.preferredQualificationsJson : [],
    benefits:                Array.isArray(dto.benefitsJson)                ? dto.benefitsJson                : [],

    // ── Branch / batch  ────────────────────────────────────────────────────
    allowedBranches:      Array.isArray(dto.allowedBranches) ? dto.allowedBranches : [],
    eligibleBatches:      Array.isArray(dto.eligibleBatches) ? dto.eligibleBatches.filter(Boolean).map(Number).filter(n => !isNaN(n)) : [],

    // ── Rounds / docs / required fields ───────────────────────────────────
    rounds:               Array.isArray(dto.rounds) ? dto.rounds : [],
    documents:            Array.isArray(dto.documents) ? dto.documents : (dto.attachments || []),
    requiredStudentFields:Array.isArray(dto.requiredStudentFields)
                            ? dto.requiredStudentFields
                            : (dto.requiredFields || []),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ✅ CRITICAL FIX: Flatten wizard JobFormState → backend request payload
// PRESERVES SCORE FORMATS CORRECTLY
// ════════════════════════════════════════════════════════════════════════════

export function flattenJobFormState(
  form: Partial<JobFormState>,
  overrides: Record<string, any> = {}
): Record<string, any> {
  return {
    title:            form.title,
    companyName:      form.company,
    company:          form.company,
    hiringDepartment: form.hiringDepartment,
    jobType:          form.type,
    workMode:         form.workArrangement,
    location:         form.location,
    salaryRange:      form.salaryRange,
    summary:          form.summary,
    internalId:       form.internalId,
    externalLink:     form.externalLink,
    companyCulture:   form.companyCulture,
    physicalDemands:  form.physicalDemands,
    eeoStatement:     form.eeoStatement,
    applicationDeadline: form.applicationDeadline,
    status:           form.status || 'Active',

    // ✅ CRITICAL FIX: Use the EXACT format selected in the wizard
    // DO NOT override with hardcoded "Percentage"
    minUgScore:      form.eligibility?.minCGPA,
    formatUg:        form.eligibility?.formatUG,  // ✅ No fallback to 'Percentage'
    
    min10thScore:    form.eligibility?.min10th,
    format10th:      form.eligibility?.format10th,  // ✅ No fallback
    
    min12thScore:    form.eligibility?.min12th,
    format12th:      form.eligibility?.format12th,  // ✅ No fallback
    
    minDiplomaScore: form.eligibility?.minDiploma,
    formatDiploma:   form.eligibility?.formatDiploma,  // ✅ No fallback
    
    maxBacklogs:     form.eligibility?.maxBacklogs ?? 0,
    isDiplomaEligible: form.eligibility?.isDiplomaEligible ?? false,
    allowGaps:       form.eligibility?.educationalGapsAllowed ?? false,
    maxGapYears:     form.eligibility?.maxGapYears ?? 0,
    allowedBranches: form.eligibility?.allowedBranches ?? [],
    eligibleBatches: form.eligibility?.eligibleBatches ?? [],

    companyLogo:      form.companyLogo,
    serviceBond:      form.serviceBond,
    joiningDate:      form.joiningDate,
    vacancies:        form.vacancies,

    // JSON arrays
    responsibilitiesJson:        form.responsibilitiesJson        ?? [],
    qualificationsJson:          form.qualificationsJson          ?? [],
    preferredQualificationsJson: form.preferredQualificationsJson ?? [],
    benefitsJson:                form.benefitsJson                ?? [],

    rounds:               form.rounds ?? [],
    requiredStudentFields:form.requiredStudentFields ?? [],
    negativeList:         form.negativeList ?? [],

    ...overrides,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// JOB SERVICE
// ════════════════════════════════════════════════════════════════════════════

export const JobService = {

  // ── Placement Tools ─────────────────────────────────────────────────────

  getComparisonHeaders: async (file: File): Promise<string[]> => {
    const fd = new FormData(); fd.append('file', file);
    const res = await api.post('/tools/compare/headers', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },

  compareResultFiles: async (master: File, result: File, compareField?: string): Promise<any> => {
    const fd = new FormData(); fd.append('master', master); fd.append('result', result);
    if (compareField) fd.append('compareField', compareField);
    const res = await api.post('/tools/compare', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },

  downloadComparisonReport: async (data: any[][], format: 'excel' | 'csv' = 'excel'): Promise<void> => {
    const res = await api.post('/tools/compare/download', data, { params: { format }, responseType: 'blob' });
    downloadExcelFile(res.data, `Comparison_Result.${format === 'csv' ? 'csv' : 'xlsx'}`);
  },

  getExtractionHeaders: async (file: File): Promise<string[]> => {
    const fd = new FormData(); fd.append('file', file);
    const res = await api.post('/tools/extract/headers', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },

  processCustomReport: async (file: File, excludeCols: string, excludeIds: string): Promise<any> => {
    const fd = new FormData(); fd.append('file', file);
    const res = await api.post('/tools/extract', fd, { params: { excludeCols, excludeIds }, headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },

  downloadCustomReport: async (data: any[][], format: 'excel' | 'csv' = 'excel'): Promise<void> => {
    const res = await api.post('/tools/compare/download', data, { params: { format }, responseType: 'blob' });
    downloadExcelFile(res.data, `Extracted_Report.${format === 'csv' ? 'csv' : 'xlsx'}`);
  },

  getGatheringFields: async (): Promise<Record<string, string[]>> => {
    const res = await api.get('/tools/gather/fields'); return res.data;
  },

  generateCustomGatheringReport: async (_collegeId: string, rollNumbers: string, fields: string[]): Promise<any> => {
    const res = await api.post('/tools/gather', { rollNumbers, fields }); return res.data;
  },

  downloadGatheredDataReport: async (data: any[][], format: 'excel' | 'csv' = 'excel'): Promise<void> => {
    const res = await api.post('/tools/gather/download', data, { params: { format }, responseType: 'blob' });
    downloadExcelFile(res.data, `Gathered_Data.${format === 'csv' ? 'csv' : 'xlsx'}`);
  },

  // ── Job CRUD ─────────────────────────────────────────────────────────────

  createJob: async (
    jobData: Partial<JobFormState> & Record<string, any>,
    jdFiles: File[],
    avoidList: File | null,
    collegeCode: string
  ): Promise<Job> => {
    const payload = flattenJobFormState(jobData as any, {
      collegeId: jobData.collegeId,
      postedById: jobData.postedById,
    });
    
    const fd = new FormData();
    fd.append('jobData', JSON.stringify(payload));
    if (jdFiles?.length) jdFiles.forEach(f => fd.append('jdFiles', f));
    if (avoidList) fd.append('avoidList', avoidList);
    const res = await api.post(`/jobs?collegeCode=${collegeCode}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapDtoToJob(res.data);
  },

  updateJob: async (
    id: string,
    jobData: Partial<JobFormState> & Record<string, any>,
    jdFiles: File[],
    avoidList: File | null,
    collegeCode: string
  ): Promise<Job> => {
    const payload = flattenJobFormState(jobData as any, {
      collegeId: jobData.collegeId,
      postedById: jobData.postedById,
    });
    
    const fd = new FormData();
    fd.append('jobData', JSON.stringify(payload));
    if (jdFiles?.length) jdFiles.forEach(f => fd.append('jdFiles', f));
    if (avoidList) fd.append('avoidList', avoidList);
    const res = await api.put(`/jobs/${id}?collegeCode=${collegeCode}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapDtoToJob(res.data);
  },

  softDeleteJob: async (id: string, collegeId: string, reason = ''): Promise<void> => {
    await api.put(`/jobs/${id}/archive`, null, { params: { collegeId, reason } });
  },

  hardDeleteJob: async (id: string, collegeId: string): Promise<void> => {
    await api.delete(`/jobs/${id}/permanent`, { params: { collegeId } });
  },

  restoreJob: async (id: string): Promise<Job> => {
    const res = await api.put(`/jobs/${id}/restore`);
    return mapDtoToJob(res.data);
  },

  deleteJob: async (id: string, collegeId: string): Promise<void> => {
    await api.delete(`/jobs/${id}`, { params: { collegeId } });
  },

  // ── Paginated admin job list ───────────────────────────────────────────

  searchJobs: async (collegeId: string, filters: AdminJobFilters): Promise<JobsPageResult> => {
    const params: any = {
      collegeId,
      query:           filters.query   || undefined,
      includeArchived: filters.includeArchived ?? false,
      page:            filters.page    ?? 0,
      size:            filters.size    ?? 10,
    };

    if (filters.types?.length) {
      params.jobType = filters.types.map(t => t.replace(/-/g, '_').replace(/ /g, '_')).join(',');
    }
    if (filters.modes?.length) {
      params.workMode = filters.modes.map(m => m.replace(/-/g, '_').replace(/ /g, '_')).join(',');
    }
    if (filters.statuses?.length) {
      params.status = filters.statuses.join(',');
    }
    if (filters.ownerId) {
      params.postedById = filters.ownerId;
    }

    const res = await api.get('/jobs', { params });
    const data = res.data;

    return {
      content:       (data.content as any[]).map(mapDtoToJob),
      totalElements: data.totalElements,
      totalPages:    data.totalPages,
      currentPage:   data.currentPage,
      pageSize:      data.pageSize,
    };
  },

  // ── Student Portal ────────────────────────────────────────────────────

  getJobsForStudent: async (filters: any): Promise<StudentJobView[]> => {
    const params: any = { filterType: filters.status || 'all', searchQuery: filters.query || undefined };
    if (filters.type?.length) params.jobTypeFilters = filters.type.map((t: string) => t.replace(/-/g, '_').replace(/ /g, '_')).join(',');
    if (filters.workMode?.length) params.workModeFilters = filters.workMode.map((m: string) => m.replace(/-/g, '_').replace(/ /g, '_')).join(',');
    const res = await api.get('/jobs/student/portal', { params });
    return (res.data as any[]).map((dto: any): StudentJobView => ({
      job:             mapDtoToJob(dto.job),
      isApplied:       dto.applied       || false,
      isEligible:      dto.eligible      || false,
      isExpired:       dto.expired       || false,
      isNotInterested: dto.notInterested || false,
      eligibilityReason: dto.notEligibilityReason || dto.reason || '',
    }));
  },

  getJobDetail: async (jobId: string): Promise<Job> => {
    const res = await api.get(`/jobs/${jobId}`);
    return mapDtoToJob(res.data);
  },

  applyToJob: async (jobId: string): Promise<void> => {
    await api.post(`/jobs/${jobId}/apply`);
  },

  markNotInterested: async (jobId: string): Promise<void> => {
    await api.post(`/jobs/${jobId}/not-interested`);
  },

  // ── Branches API ──────────────────────────────────────────────────────

  getBranchesForCollege: async (collegeId: string): Promise<{ code: string; name: string }[]> => {
    const res = await api.get(`/colleges/${collegeId}/branches`);
    return Array.isArray(res.data) ? res.data : [];
  },

  // ── Applicants Dashboard ──────────────────────────────────────────────

  // getJobApplicantsDashboard: async (jobId: string): Promise<any> => {
  //   const res = await api.get(`/jobs/${jobId}/applicants-dashboard`);
  //   return res.data;
  // },

  getJobApplicantsDashboard: async (jobId: string): Promise<any> => {
    const res = await api.get(`/jobs/${jobId}/applicants-dashboard`);
    const data = res.data;

    if (data && data.headers) {
      // Logic: Ensure "Roll Number" and "Full Name" are treated as primary keys
      // and not duplicated if they already exist in the dynamic fields.
      const rawHeaders = data.headers as string[];
      
      // We create a Set to remove case-insensitive duplicates
      const uniqueHeaders = rawHeaders.reduce((acc: string[], current: string) => {
        const exists = acc.find(h => h.toLowerCase() === current.toLowerCase());
        if (!exists) acc.push(current);
        return acc;
      }, []);

      data.headers = uniqueHeaders;
    }

    return data;
  },

  getJobApplicants: async (jobId: string): Promise<any[]> => {
    const res = await api.get(`/jobs/${jobId}/applicants-dashboard`);
    return res.data?.students || [];
  },

  // ── Export / Download ─────────────────────────────────────────────────

  exportJobList: async (jobId: string, type: 'applicants' | 'eligible' | 'not-interested', format: 'excel' | 'csv' = 'excel'): Promise<void> => {
    const res = await api.get(`/jobs/${jobId}/export-list`, { params: { type, format }, responseType: 'blob' });
    downloadExcelFile(res.data, `Job_${type}_${jobId}.${format === 'csv' ? 'csv' : 'xlsx'}`);
  },

  exportJobApplicants: async (jobId: string, type: string, format = 'excel') => {
    const res = await api.get(`/jobs/${jobId}/export-list`, { params: { type, format }, responseType: 'blob' });
    downloadExcelFile(res.data, `Job_${type}_${jobId}.${format === 'csv' ? 'csv' : 'xlsx'}`);
  },

  exportJobEligibleStudents: async (jobId: string, format = 'excel') => {
    const res = await api.get(`/jobs/${jobId}/export-list`, { params: { type: 'eligible', format }, responseType: 'blob' });
    downloadExcelFile(res.data, `Eligible_Students_${jobId}.${format === 'csv' ? 'csv' : 'xlsx'}`);
  },

  getEligibleStudentsForDisplay: async (jobId: string): Promise<any> => {
    const res = await api.get(`/jobs/${jobId}/eligible-students`);
    return res.data;
  },

  // ── Round result upload ───────────────────────────────────────────────

  processRoundResultUpload: async (jobId: string, roundIndex: number, file: File): Promise<any> => {
    const fd = new FormData(); fd.append('file', file);
    const res = await api.post(`/jobs/${jobId}/rounds/${roundIndex}/results`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getJobHiringStats: async (jobId: string): Promise<any> => {
    const res = await api.get(`/jobs/${jobId}/hiring-stats`); return res.data;
  },

  // ── Student application tracking ──────────────────────────────────────

  getStudentApplications: async (): Promise<any[]> => {
    const res = await api.get('/jobs/students/applications/my'); return res.data;
  },

  getStudentApplicationTimeline: async (jobId: string): Promise<any[]> => {
    const res = await api.get(`/jobs/students/${jobId}/timeline`); return res.data;
  },

  // ── Permission helpers ────────────────────────────────────────────────

  canManageJob: (user: User, job: Job): boolean => {
    if (user.role === Role.ADMIN || user.role === Role.SROTS_DEV) return true;
    if (user.role === Role.CPH && user.collegeId === job.collegeId) return true;
    return user.role === Role.STAFF && job.postedById === user.id;
  },

  canHardDelete: (user: User): boolean =>
    [Role.ADMIN, Role.SROTS_DEV, Role.CPH].includes(user.role),

  canSeeArchivedJobs: (user: User): boolean =>
    [Role.ADMIN, Role.SROTS_DEV, Role.CPH].includes(user.role),

  canCreateJob: (user: User): boolean =>
    [Role.ADMIN, Role.SROTS_DEV, Role.CPH, Role.STAFF].includes(user.role),
};