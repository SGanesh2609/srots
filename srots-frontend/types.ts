// export enum Role {
//   ADMIN = 'ADMIN',
//   SROTS_DEV = 'SROTS_DEV',
//   CPH = 'CPH',
//   STAFF = 'STAFF',
//   STUDENT = 'STUDENT'
// }

// export interface AddressFormData {
//   addressLine1: string;
//   addressLine2: string;
//   village: string;
//   mandal: string;
//   city: string;
//   state: string;
//   zip: string;
//   country: string;
// }

// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   fullName: string;
//   role: Role;
//   collegeId?: string | null;
//   token?: string;
//   avatar?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   isRestricted?: boolean;
//   isCollegeHead?: boolean;
//   phone?: string;
//   alternativeEmail?: string;
//   alternativePhone?: string;
//   aadhaarNumber?: string;
//   bio?: string;
//   department?: string;
//   experience?: string;
//   education?: string;
//   address?: AddressFormData | null;
//   fullAddress?: string;
//   resetToken?: string | null;
//   tokenExpiry?: string | null;
//   lastDeviceInfo?: string | null;
//   educationRecords?: any[] | null;
//   experiences?: any[] | null;
//   projects?: any[] | null;
//   certifications?: any[] | null;
//   languages?: any[] | null;
//   socialLinks?: any[] | null;
//   resumes?: any[] | null;
//   skills?: any[] | null;
//   isProfileComplete?: boolean;
// }

// export interface WorkExperience { id: string; title: string; company: string; location: string; type: string; startDate: string; endDate: string; isCurrent: boolean; salaryRange?: string; }
// export interface Project { id: string; title: string; domain: string; techUsed: string; link: string; startDate: string; endDate: string; isCurrent: boolean; description: string; }
// export interface Certification { id: string; name: string; organizer: string; credentialUrl: string; issueDate: string; hasExpiry: boolean; expiryDate?: string; score?: string; licenseNumber?: string; hasScore?: boolean; }
// export interface Publication { id: string; title: string; publisher: string; url: string; publishDate: string; }
// export interface SocialLink { id: string; platform: string; url: string; }
// export interface Skill { id: string; name: string; proficiency: string; }
// export interface Language { id: string; name: string; proficiency: string; }
// export interface SemesterMark { sem: number; sgpa: string; }
// export interface EducationRecord { id: string; level: string; institution: string; board: string; yearOfPassing: string; score: string; scoreType: string; location: string; specialization?: string; branch?: string; semesters?: SemesterMark[]; currentArrears?: number; }
// export interface Resume { id: string; name: string; url: string; isDefault: boolean; uploadDate: string; }

// export interface StudentProfile {
//   userId: string;
//   rollNumber: string;
//   branch: string;
//   course: string;
//   batch: number;
//   placementCycle: string; 
//   careerPath: string;
//   gender: string;
//   dob: string;
//   nationality: string;
//   religion: string;
//   dayScholar: boolean;
//   aadhaarNumber: string;
//   drivingLicense: string;
//   passportNumber: string;
//   passportIssueDate: string;
//   passportExpiryDate: string;
//   personalEmail: string;
//   instituteEmail: string;
//   parentEmail: string;
//   whatsappNumber: string;
//   preferredContactMethod: string;
//   linkedInProfile: string;
//   fatherName: string;
//   fatherOccupation: string;
//   motherName: string;
//   motherOccupation: string;
//   parentPhone: string;
//   mentor: string;
//   advisor: string;
//   coordinator: string;
//   currentAddress: AddressFormData;
//   permanentAddress: AddressFormData;
//   gapInStudies: boolean;
//   gapDuration: string;
//   gapReason: string;
//   premiumStartDate: string;
//   premiumEndDate: string;
//   updatedAt: string;
//   educationHistory: EducationRecord[];
//   resumes?: Resume[];
//   experience: WorkExperience[];
//   skills: Skill[];
//   languages: Language[];
//   projects: Project[];
//   certifications: Certification[];
//   publications: Publication[];
//   socialLinks: SocialLink[];
//   communicationEmail: string;
//   fullName: string;
//   collegeName: string;
//   phone: string;
//   alternativeEmail: string;
//   alternativePhone: string;
//   bio: string;
// }

// export interface Student extends User {
//   profile: StudentProfile;
//   createdAt?: string;
// }

// export interface Branch {
//   name: string; 
//   code: string; 
// }

// export interface CollegeAboutSection {
//   id: string; 
//   title: string; 
//   content: string; 
//   image?: string;
//   lastModifiedBy?: string;
//   lastModifiedAt?: string;
// }

// export interface College {
//   id: string;
//   name: string;
//   code: string;
//   type?: string;
//   email: string;
//   phone: string;
//   logoUrl: string;
//   studentCount: number;
//   cphCount: number;
//   activeJobs: number;
//   address: string;
//   addressDetails?: AddressFormData;
//   socialMedia?: any;
//   aboutSections?: CollegeAboutSection[];
//   branches?: Branch[];
//   lastModifiedBy?: string;
//   lastModifiedAt?: string;
//   landline?: string;
//   active?: boolean;
// }

// export interface Page<T> {
//     content: T[];
//     totalPages: number;
//     totalElements: number;
//     number: number;
//     size: number;
// }

// export interface BranchDTO {
//   name: string; 
//   code: string; 
// }

// export type MarkFormat = 'Percentage' | 'CGPA' | 'Grade' | 'Marks';

// /**
//  * CRITICAL FIX: Job interface updated to match backend response exactly
//  * Backend sends JobResponseDTO with these exact fields
//  */
// export interface Job {
//   id: string;
//   collegeId?: string;
  
//   // Basic Info (matches backend exactly)
//   title: string;
//   companyName: string;          // Backend uses companyName, NOT company
//   hiringDepartment?: string;
  
//   // Enums (backend sends display values like "Full Time", "Remote")
//   jobType: string;              // "Full Time", "Internship", "Contract"
//   workMode: string;             // "On-Site", "Remote", "Hybrid"
//   status: 'Active' | 'Closed' | 'Draft';
  
//   location: string;
//   salaryRange?: string;
//   summary: string;
  
//   // JSON Arrays (backend sends as arrays, not JSON strings)
//   responsibilitiesJson?: string[];
//   qualificationsJson?: string[];
//   preferredQualificationsJson?: string[];
//   benefitsJson?: string[];
  
//   // Additional details
//   companyCulture?: string;
//   physicalDemands?: string;
//   eeoStatement?: string;
//   internalId?: string;
  
//   // Dates
//   applicationDeadline: string;
//   postedAt: string;
  
//   // Relations
//   postedBy?: string;            // Staff/CPH name
//   postedById?: string;
  
//   // Eligibility (backend sends these at root level)
//   minUgScore?: number;
//   formatUg?: string;
//   min10thScore?: number;
//   format10th?: string;
//   min12thScore?: number;
//   format12th?: string;
//   maxBacklogs?: number;
//   allowGaps?: boolean;
//   maxGapYears?: number;
//   isDiplomaEligible?: boolean;
  
//   // JSON strings from backend
//   allowedBranches?: string;     // JSON string
//   eligibleBatches?: string;     // JSON string
//   roundsJson?: string;          // JSON string
//   requiredFieldsJson?: string;  // JSON string
//   attachmentsJson?: string;     // JSON string
  
//   // Parsed rounds for UI
//   rounds?: any[];
  
//   // Documents (parsed from attachmentsJson)
//   documents?: {name: string, url: string}[];
  
//   externalLink?: string;
  
//   // UI helpers
//   applicants?: string[];
//   notInterested?: string[];
//   studentStatus?: Record<string, string>;
//   requiredStudentFields?: string[];
//   negativeList?: string[];
  
//   // DEPRECATED: These are old field names, kept for backward compatibility
//   company?: string;             // Maps to companyName
//   type?: string;                // Maps to jobType
//   workArrangement?: string;     // Maps to workMode
//   eligibility?: any;            // Deprecated - fields now at root level
// }

// /**
//  * CRITICAL FIX: StudentJobView interface matching backend StudentJobViewDTO exactly
//  */
// export interface StudentJobView {
//     job: Job;
    
//     // Backend flags (exact names from StudentJobViewDTO)
//     isApplied: boolean;       // Backend: applied
//     isEligible: boolean;      // Backend: eligible
//     isExpired: boolean;       // Backend: expired
//     isNotInterested: boolean; // Backend: notInterested
    
//     // Reason string
//     eligibilityReason?: string;  // Backend: reason or notEligibilityReason
// }

// export interface Post {
//   id: string;
//   collegeId: string;
//   authorId: string;
//   authorName: string;
//   authorRole: Role;
//   content: string;
//   images: string[];
//   documents: {name: string, url: string}[];
//   likes: number;
//   commentsCount: number;
//   isLikedByMe: boolean;
//   likedBy: string[];
//   commentsDisabled: boolean;
//   createdAt: string;
//   comments: PostComment[];
// }

// export interface PostComment {
//   id: string;
//   userId: string;
//   user: string;
//   role: Role;
//   text: string;
//   date: string;
//   likes?: number;
//   likedBy?: string[];
//   parentId?: string | null;
//   replies?: PostComment[];
// }

// export interface CalendarEvent {
//   id: string;
//   collegeId?: string;
//   title: string;
//   date: string;
//   type: string;
//   startTime?: string;
//   endTime?: string;
//   targetBranches?: string[];
//   postedBy?: string;
//   createdById?: string;
//   endDate?: string;
//   description?: string;
//   schedule?: ScheduleItem[];
//   createdAt?: string; 
//   targetYears?: number[];
//   createdBy?: string;
// }

// export interface ScheduleItem {
//     id: string;
//     timeRange: string;
//     activity: string;
//     type: 'Class' | 'Break' | 'Exam' | 'Activity';
// }

// export interface Notice {
//   id: string;
//   collegeId?: string;
//   title: string;
//   description: string;
//   date: string;
//   createdBy?: string;
//   type: string;
//   fileName?: string;
//   fileUrl?: string;
//   createdById?: string;
// }

// export interface GlobalCompany { id: string; name: string; website: string; description: string; logo?: string; headquarters?: string; isSubscribed?: boolean; }
// export interface FreeCourse { id: string; name: string; technology: string; platform: CoursePlatform; description: string; link: string; postedBy: string; status: CourseStatus; lastVerifiedAt?: string; }

// export enum CoursePlatform {
//   YOUTUBE = 'YouTube',
//   COURSERA = 'Coursera',
//   UDEMY = 'Udemy',
//   LINKEDIN = 'LinkedIn',
//   OTHER = 'Other'
// }

// export enum CourseStatus {
//   ACTIVE = 'ACTIVE',
//   INACTIVE = 'INACTIVE'
// }

// export interface DashboardMetrics {
//     stats: {
//         placedCount: number;
//         totalStudents: number;
//         activeJobs: number;
//         participatingCompanies: number;
//     };
//     branchDistribution: { name: string; count: number }[];
//     placementProgress: { name: string; placed: number }[];
//     jobTypeDistribution: { name: string; value: number }[];
//     recentJobs: Job[];
// }

// export enum Role {
//   ADMIN = 'ADMIN',
//   SROTS_DEV = 'SROTS_DEV',
//   CPH = 'CPH',
//   STAFF = 'STAFF',
//   STUDENT = 'STUDENT'
// }

// export interface AddressFormData {
//   addressLine1: string; addressLine2: string; village: string; mandal: string;
//   city: string; state: string; zip: string; country: string;
// }

// export interface User {
//   id: string; username: string; email: string; fullName: string; role: Role;
//   collegeId?: string | null; token?: string; avatar?: string;
//   createdAt?: string; updatedAt?: string; isRestricted?: boolean;
//   isCollegeHead?: boolean; phone?: string; alternativeEmail?: string;
//   alternativePhone?: string; aadhaarNumber?: string; bio?: string;
//   department?: string; experience?: string; education?: string;
//   address?: AddressFormData | null; fullAddress?: string;
//   resetToken?: string | null; tokenExpiry?: string | null;
//   lastDeviceInfo?: string | null; educationRecords?: any[] | null;
//   experiences?: any[] | null; projects?: any[] | null;
//   certifications?: any[] | null; languages?: any[] | null;
//   socialLinks?: any[] | null; resumes?: any[] | null;
//   skills?: any[] | null; isProfileComplete?: boolean;
// }

// export interface WorkExperience { id: string; title: string; company: string; location: string; type: string; startDate: string; endDate: string; isCurrent: boolean; salaryRange?: string; }
// export interface Project { id: string; title: string; domain: string; techUsed: string; link: string; startDate: string; endDate: string; isCurrent: boolean; description: string; }
// export interface Certification { id: string; name: string; organizer: string; credentialUrl: string; issueDate: string; hasExpiry: boolean; expiryDate?: string; score?: string; licenseNumber?: string; hasScore?: boolean; }
// export interface Publication { id: string; title: string; publisher: string; url: string; publishDate: string; }
// export interface SocialLink { id: string; platform: string; url: string; }
// export interface Skill { id: string; name: string; proficiency: string; }
// export interface Language { id: string; name: string; proficiency: string; }
// export interface SemesterMark { sem: number; sgpa: string; }
// export interface EducationRecord { id: string; level: string; institution: string; board: string; yearOfPassing: string; score: string; scoreType: string; location: string; specialization?: string; branch?: string; semesters?: SemesterMark[]; currentArrears?: number; }
// export interface Resume { id: string; name: string; url: string; isDefault: boolean; uploadDate: string; }

// export interface StudentProfile {
//   userId: string; rollNumber: string; branch: string; course: string; batch: number;
//   placementCycle: string; careerPath: string; gender: string; dob: string;
//   nationality: string; religion: string; dayScholar: boolean; aadhaarNumber: string;
//   drivingLicense: string; passportNumber: string; passportIssueDate: string;
//   passportExpiryDate: string; personalEmail: string; instituteEmail: string;
//   parentEmail: string; whatsappNumber: string; preferredContactMethod: string;
//   linkedInProfile: string; fatherName: string; fatherOccupation: string;
//   motherName: string; motherOccupation: string; parentPhone: string;
//   mentor: string; advisor: string; coordinator: string;
//   currentAddress: AddressFormData; permanentAddress: AddressFormData;
//   gapInStudies: boolean; gapDuration: string; gapReason: string;
//   premiumStartDate: string; premiumEndDate: string; updatedAt: string;
//   educationHistory: EducationRecord[]; resumes?: Resume[];
//   experience: WorkExperience[]; skills: Skill[]; languages: Language[];
//   projects: Project[]; certifications: Certification[]; publications: Publication[];
//   socialLinks: SocialLink[]; communicationEmail: string; fullName: string;
//   collegeName: string; phone: string; alternativeEmail: string;
//   alternativePhone: string; bio: string;
// }

// export interface Student extends User { profile: StudentProfile; createdAt?: string; }

// export interface Branch { name: string; code: string; }

// export interface BranchDTO { name: string; code: string; }

// export interface CollegeAboutSection {
//   id: string; title: string; content: string; image?: string;
//   lastModifiedBy?: string; lastModifiedAt?: string;
// }

// export interface College {
//   id: string; name: string; code: string; type?: string; email: string;
//   phone: string; logoUrl: string; studentCount: number; cphCount: number;
//   activeJobs: number; address: string; addressDetails?: AddressFormData;
//   socialMedia?: any; aboutSections?: CollegeAboutSection[];
//   branches?: Branch[]; lastModifiedBy?: string; lastModifiedAt?: string;
//   landline?: string; active?: boolean;
// }

// export interface Page<T> {
//   content: T[];
//   totalPages: number;
//   totalElements: number;
//   currentPage: number;
//   pageSize: number;
// }

// export type MarkFormat = 'Percentage' | 'CGPA' | 'Grade' | 'Marks';

// // ════════════════════════════════════════════════════════════════════════════
// // JOB — fully synced with JobResponseDTO
// // ════════════════════════════════════════════════════════════════════════════
// export interface Job {
//   id: string;
//   collegeId?: string;

//   // ── Basic info (backend field names, used directly from DTO) ─────────────
//   title: string;
//   companyName: string;          // Backend: companyName ✓
//   hiringDepartment?: string;

//   // ── Enums (backend sends display strings) ────────────────────────────────
//   jobType: string;              // "Full-Time" | "Internship" | "Contract" | "Part-Time"
//   workMode: string;             // "On-Site" | "Remote" | "Hybrid"
//   status: 'Active' | 'Closed' | 'Draft';

//   location: string;
//   salaryRange?: string;
//   summary: string;

//   // ── JSON Arrays (backend sends parsed arrays) ─────────────────────────────
//   responsibilitiesJson?: string[];
//   qualificationsJson?: string[];
//   preferredQualificationsJson?: string[];
//   benefitsJson?: string[];
//   skills?: string[];

//   // ── Convenience aliases (set by mapDtoToJob, used in legacy components) ──
//   responsibilities?: string[];
//   qualifications?: string[];
//   preferredQualifications?: string[];
//   benefits?: string[];

//   // ── Additional details ────────────────────────────────────────────────────
//   companyCulture?: string;
//   physicalDemands?: string;
//   eeoStatement?: string;
//   internalId?: string;
//   externalLink?: string;

//   // ── Dates ──────────────────────────────────────────────────────────────────
//   applicationDeadline: string;
//   postedAt: string;

//   // ── Ownership / audit ──────────────────────────────────────────────────────
//   postedBy?: string;            // Full name string from backend
//   postedById?: string;
//   canEdit?: boolean;
//   avoidListUrl?: string;

//   // ── Soft-delete metadata (visible to CPH/ADMIN) ───────────────────────────
//   isDeleted?: boolean;
//   deletedAt?: string;
//   deletedBy?: string;           // Full name of who deleted
//   deletionReason?: string;

//   // ── Eligibility (flat root-level fields matching backend DTO) ─────────────
//   minUgScore?: number;
//   formatUg?: string;
//   min10thScore?: number;
//   format10th?: string;
//   min12thScore?: number;
//   format12th?: string;
//   minDiplomaScore?: number;
//   formatDiploma?: string;
//   maxBacklogs?: number;
//   allowGaps?: boolean;
//   maxGapYears?: number;
//   isDiplomaEligible?: boolean;

//   // ── Branch / batch / required fields / documents ──────────────────────────
//   allowedBranches?: string[];   // List<String> branch codes from backend
//   eligibleBatches?: number[];   // List<Integer> years from backend
//   rounds?: any[];
//   requiredStudentFields?: string[];
//   documents?: { name: string; url: string }[];

//   // ── Applicant info ────────────────────────────────────────────────────────
//   applicantCount?: number;
//   applicants?: string[];
//   negativeList?: string[];
//   studentStatus?: Record<string, string>;

//   // ── DEPRECATED / backward-compat aliases ─────────────────────────────────
//   /** @deprecated Use companyName */  company?: string;
//   /** @deprecated Use jobType */      type?: string;
//   /** @deprecated Use workMode */     workArrangement?: string;
//   /** @deprecated Eligibility is flat now */ eligibility?: any;
// }

// // ════════════════════════════════════════════════════════════════════════════
// // WIZARD FORM STATE — internal to JobWizard (uses legacy / nested names)
// // ════════════════════════════════════════════════════════════════════════════
// export interface JobFormState {
//   title: string;
//   company: string;              // wizard internal → mapped to companyName on save
//   hiringDepartment: string;
//   type: string;                 // wizard internal → mapped to jobType on save
//   workArrangement: string;      // wizard internal → mapped to workMode on save
//   location: string;
//   salaryRange: string;
//   summary: string;
//   internalId: string;
//   externalLink: string;
//   companyCulture: string;
//   physicalDemands: string;
//   eeoStatement: string;
//   applicationDeadline: string;
//   status: string;

//   responsibilitiesJson: string[];
//   qualificationsJson: string[];
//   preferredQualificationsJson: string[];
//   benefitsJson: string[];

//   eligibility: {
//     minCGPA: number;
//     formatUG: string;
//     min10th: number;
//     format10th: string;
//     min12th: number;
//     format12th: string;
//     minDiploma: number;
//     formatDiploma: string;
//     maxBacklogs: number;
//     allowedBranches: string[];
//     eligibleBatches: number[];
//     isDiplomaEligible: boolean;
//     educationalGapsAllowed: boolean;
//     maxGapYears: number;
//   };

//   rounds: { name: string; date: string; status: string }[];
//   requiredStudentFields: string[];
//   documents: { name: string; url: string }[];
//   negativeList: string[];
//   avoidListUrl?: string;
//   collegeId?: string;
//   postedById?: string;
// }

// export interface StudentJobView {
//   job: Job;
//   isApplied: boolean;
//   isEligible: boolean;
//   isExpired: boolean;
//   isNotInterested: boolean;
//   eligibilityReason?: string;
// }

// export interface Post {
//   id: string; collegeId: string; authorId: string; authorName: string;
//   authorRole: Role; content: string; images: string[];
//   documents: { name: string; url: string }[];
//   likes: number; commentsCount: number; isLikedByMe: boolean;
//   likedBy: string[]; commentsDisabled: boolean; createdAt: string;
//   comments: PostComment[];
// }

// export interface PostComment {
//   id: string; userId: string; user: string; role: Role; text: string;
//   date: string; likes?: number; likedBy?: string[];
//   parentId?: string | null; replies?: PostComment[];
// }

// export interface CalendarEvent {
//   id: string; collegeId?: string; title: string; date: string; type: string;
//   startTime?: string; endTime?: string; targetBranches?: string[];
//   postedBy?: string; createdById?: string; endDate?: string;
//   description?: string; schedule?: ScheduleItem[]; createdAt?: string;
//   targetYears?: number[]; createdBy?: string;
// }

// export interface ScheduleItem {
//   id: string; timeRange: string; activity: string;
//   type: 'Class' | 'Break' | 'Exam' | 'Activity';
// }

// export interface Notice {
//   id: string; collegeId?: string; title: string; description: string;
//   date: string; createdBy?: string; type: string; fileName?: string;
//   fileUrl?: string; createdById?: string;
// }

// export interface GlobalCompany { id: string; name: string; website: string; description: string; logo?: string; headquarters?: string; isSubscribed?: boolean; }
// export interface FreeCourse { id: string; name: string; technology: string; platform: CoursePlatform; description: string; link: string; postedBy: string; status: CourseStatus; lastVerifiedAt?: string; }

// export enum CoursePlatform { YOUTUBE = 'YouTube', COURSERA = 'Coursera', UDEMY = 'Udemy', LINKEDIN = 'LinkedIn', OTHER = 'Other' }
// export enum CourseStatus { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE' }

// export interface DashboardMetrics {
//   stats: { placedCount: number; totalStudents: number; activeJobs: number; participatingCompanies: number };
//   branchDistribution: { name: string; count: number }[];
//   placementProgress: { name: string; placed: number }[];
//   jobTypeDistribution: { name: string; value: number }[];
//   recentJobs: Job[];
// }

// // Pagination wrapper matching backend Page<T>
// export interface PaginatedResponse<T> {
//   content: T[];
//   totalElements: number;
//   totalPages: number;
//   currentPage: number;
//   pageSize: number;
// }

// export enum Role {
//   ADMIN = 'ADMIN',
//   SROTS_DEV = 'SROTS_DEV',
//   CPH = 'CPH',
//   STAFF = 'STAFF',
//   STUDENT = 'STUDENT'
// }

// export interface AddressFormData {
//   addressLine1: string; addressLine2: string; village: string; mandal: string;
//   city: string; state: string; zip: string; country: string;
// }

// // export interface User {
// //   id: string; username: string; email: string; fullName: string; role: Role;
// //   collegeId?: string | null; token?: string; avatar?: string;
// //   createdAt?: string; updatedAt?: string; isRestricted?: boolean;
// //   isCollegeHead?: boolean; phone?: string; alternativeEmail?: string;
// //   alternativePhone?: string; aadhaarNumber?: string; bio?: string;
// //   department?: string; experience?: string; education?: string;
// //   address?: AddressFormData | null; fullAddress?: string;
// //   resetToken?: string | null; tokenExpiry?: string | null;
// //   lastDeviceInfo?: string | null; educationRecords?: any[] | null;
// //   experiences?: any[] | null; projects?: any[] | null;
// //   certifications?: any[] | null; languages?: any[] | null;
// //   socialLinks?: any[] | null; resumes?: any[] | null;
// //   skills?: any[] | null; isProfileComplete?: boolean;
// //   // Exposed via @JsonProperty getters added to User.java entity
// //   rollNumber?: string;
// //   branch?: string;
// //   batch?: number;
// // }

// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   fullName: string;
//   role: Role;
//   collegeId?: string | null;
//   token?: string;
//   avatar?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   isRestricted?: boolean;
//   isCollegeHead?: boolean;
//   phone?: string;
//   alternativeEmail?: string;
//   alternativePhone?: string;
//   aadhaarNumber?: string;
//   bio?: string;
//   department?: string;
//   experience?: string;
//   education?: string;
//   address?: AddressFormData | null;
//   fullAddress?: string;
//   resetToken?: string | null;
//   tokenExpiry?: string | null;
//   lastDeviceInfo?: string | null;
//   educationRecords?: any[] | null;
//   experiences?: any[] | null;
//   projects?: any[] | null;
//   certifications?: any[] | null;
//   languages?: any[] | null;
//   socialLinks?: any[] | null;
//   resumes?: any[] | null;
//   skills?: any[] | null;
//   isProfileComplete?: boolean;
// }

// export interface WorkExperience {
//   id: string; title: string; company: string; location: string; type: string;
//   startDate: string; endDate: string; isCurrent: boolean; salaryRange?: string;
// }
// export interface Project {
//   id: string; title: string; domain: string; techUsed: string; link: string;
//   startDate: string; endDate: string; isCurrent: boolean; description: string;
// }
// export interface Certification {
//   id: string; name: string; organizer: string; credentialUrl: string; issueDate: string;
//   hasExpiry: boolean; expiryDate?: string; score?: string; licenseNumber?: string;
//   hasScore?: boolean;
// }
// export interface Publication { id: string; title: string; publisher: string; url: string; publishDate: string; }
// export interface SocialLink { id: string; platform: string; url: string; }
// export interface Skill { id: string; name: string; proficiency: string; }
// export interface Language { id: string; name: string; proficiency: string; }
// export interface SemesterMark { sem: number; sgpa: string; }

// export interface EducationRecord {
//   id: string;
//   level: string;
//   institution: string;
//   board: string;
//   yearOfPassing: string;
//   /**
//    * For frontend use after normalisation (score is the unified field name).
//    * normaliseEduRecord maps scoreDisplay → score when reading GET responses.
//    */
//   score: string;
//   /**
//    * What the backend GET endpoint actually sends (entity column: score_display).
//    * Added here so TypeScript doesn't strip it during type assertion.
//    */
//   scoreDisplay?: string;
//   scoreType: string;
//   location: string;
//   specialization?: string;
//   branch?: string;
//   currentArrears?: number;
//   /**
//    * Frontend-normalised array of semesters.
//    * Populated by parseSemestersData() inside StudentFormWizard.
//    */
//   semesters?: SemesterMark[];
//   /**
//    * Raw JSON string from backend (entity column: semesters_data).
//    * The EducationRecord Java entity stores this as a String field with @JdbcTypeCode(SqlTypes.JSON),
//    * so Jackson serialises it as a plain JSON string: "[{\"sem\":1,\"sgpa\":\"8.0\"}]".
//    * MUST be declared here so TypeScript doesn't ignore it on raw API objects.
//    */
//   semestersData?: string;
// }

// export interface Resume { id: string; name: string; url: string; isDefault: boolean; uploadDate: string; }

// export interface StudentProfile {
//   userId: string; rollNumber: string; branch: string; course: string; batch: number;
//   placementCycle: string; careerPath: string; gender: string; dob: string;
//   nationality: string; religion: string; dayScholar: boolean; aadhaarNumber: string;
//   drivingLicense: string; passportNumber: string; passportIssueDate: string;
//   passportExpiryDate: string; personalEmail: string; instituteEmail: string;
//   parentEmail: string; whatsappNumber: string; preferredContactMethod: string;
//   linkedInProfile: string; fatherName: string; fatherOccupation: string;
//   motherName: string; motherOccupation: string; parentPhone: string;
//   mentor: string; advisor: string; coordinator: string;
//   currentAddress: AddressFormData; permanentAddress: AddressFormData;
//   gapInStudies: boolean; gapDuration: string; gapReason: string;
//   premiumStartDate: string; premiumEndDate: string; updatedAt: string;
//   educationHistory: EducationRecord[]; resumes?: Resume[];
//   experience: WorkExperience[]; skills: Skill[]; languages: Language[];
//   projects: Project[]; certifications: Certification[]; publications: Publication[];
//   socialLinks: SocialLink[]; communicationEmail: string; fullName: string;
//   collegeName: string; phone: string; alternativeEmail: string;
//   alternativePhone: string; bio: string;
// }

// /**
//  * Student returned by StudentService.getStudentProfile().
//  *
//  * StudentService merges the UserFullProfileResponse:
//  *   { user, profile, educationHistory }
//  * into:
//  *   { ...user, profile, educationHistory }
//  *
//  * So educationHistory is at ROOT level of the Student object (not inside profile).
//  * StudentFormWizard reads it as: (initialData as any).educationHistory
//  */
// export interface Student extends User {
//   profile: StudentProfile;
//   /**
//    * Root-level educationHistory — placed here by studentService.getStudentProfile().
//    * Each record has `semestersData` (raw JSON string) and `scoreDisplay` from the backend.
//    */
//   educationHistory?: EducationRecord[];
//   createdAt?: string;
// }

// export interface Branch { name: string; code: string; }
// export interface BranchDTO { name: string; code: string; }

// export interface CollegeAboutSection {
//   id: string; title: string; content: string; image?: string;
//   lastModifiedBy?: string; lastModifiedAt?: string;
// }

// export interface College {
//   id: string; name: string; code: string; type?: string; email: string;
//   phone: string; logoUrl: string; studentCount: number; cphCount: number;
//   activeJobs: number; address: string; addressDetails?: AddressFormData;
//   socialMedia?: any; aboutSections?: CollegeAboutSection[];
//   branches?: Branch[]; lastModifiedBy?: string; lastModifiedAt?: string;
//   landline?: string; active?: boolean;
// }

// export interface Page<T> {
//   content: T[];
//   totalPages: number;
//   totalElements: number;
//   currentPage: number;
//   pageSize: number;
// }

// export type MarkFormat = 'Percentage' | 'CGPA' | 'Grade' | 'Marks';

// export interface Job {
//   id: string; collegeId?: string; title: string; companyName: string;
//   hiringDepartment?: string; jobType: string; workMode: string;
//   status: 'Active' | 'Closed' | 'Draft'; location: string; salaryRange?: string;
//   summary: string; responsibilitiesJson?: string[]; qualificationsJson?: string[];
//   preferredQualificationsJson?: string[]; benefitsJson?: string[]; skills?: string[];
//   responsibilities?: string[]; qualifications?: string[]; preferredQualifications?: string[];
//   benefits?: string[]; companyCulture?: string; physicalDemands?: string;
//   eeoStatement?: string; internalId?: string; externalLink?: string;
//   applicationDeadline: string; postedAt: string; postedBy?: string; postedById?: string;
//   canEdit?: boolean; avoidListUrl?: string; isDeleted?: boolean; deletedAt?: string;
//   deletedBy?: string; deletionReason?: string; minUgScore?: number; formatUg?: string;
//   min10thScore?: number; format10th?: string; min12thScore?: number; format12th?: string;
//   minDiplomaScore?: number; formatDiploma?: string; maxBacklogs?: number;
//   allowGaps?: boolean; maxGapYears?: number; isDiplomaEligible?: boolean;
//   allowedBranches?: string[]; eligibleBatches?: number[]; rounds?: any[];
//   requiredStudentFields?: string[]; documents?: { name: string; url: string }[];
//   applicantCount?: number; applicants?: string[]; negativeList?: string[];
//   studentStatus?: Record<string, string>;
//   /** @deprecated */ company?: string;
//   /** @deprecated */ type?: string;
//   /** @deprecated */ workArrangement?: string;
//   /** @deprecated */ eligibility?: any;
// }

// export interface JobFormState {
//   title: string; company: string; hiringDepartment: string; type: string;
//   workArrangement: string; location: string; salaryRange: string; summary: string;
//   internalId: string; externalLink: string; companyCulture: string;
//   physicalDemands: string; eeoStatement: string; applicationDeadline: string; status: string;
//   responsibilitiesJson: string[]; qualificationsJson: string[];
//   preferredQualificationsJson: string[]; benefitsJson: string[];
//   eligibility: {
//     minCGPA: number; formatUG: string; min10th: number; format10th: string;
//     min12th: number; format12th: string; minDiploma: number; formatDiploma: string;
//     maxBacklogs: number; allowedBranches: string[]; eligibleBatches: number[];
//     isDiplomaEligible: boolean; educationalGapsAllowed: boolean; maxGapYears: number;
//   };
//   rounds: { name: string; date: string; status: string }[];
//   requiredStudentFields: string[];
//   documents: { name: string; url: string }[];
//   negativeList: string[];
//   avoidListUrl?: string; collegeId?: string; postedById?: string;
// }

// export interface StudentJobView {
//   job: Job; isApplied: boolean; isEligible: boolean;
//   isExpired: boolean; isNotInterested: boolean; eligibilityReason?: string;
// }

// export interface Post {
//   id: string; collegeId: string; authorId: string; authorName: string; authorRole: Role;
//   content: string; images: string[]; documents: { name: string; url: string }[];
//   likes: number; commentsCount: number; isLikedByMe: boolean; likedBy: string[];
//   commentsDisabled: boolean; createdAt: string; comments: PostComment[];
// }

// export interface PostComment {
//   id: string; userId: string; user: string; role: Role; text: string;
//   date: string; likes?: number; likedBy?: string[];
//   parentId?: string | null; replies?: PostComment[];
// }

// export interface CalendarEvent {
//   id: string; collegeId?: string; title: string; date: string; type: string;
//   startTime?: string; endTime?: string; targetBranches?: string[];
//   postedBy?: string; createdById?: string; endDate?: string;
//   description?: string; schedule?: ScheduleItem[]; createdAt?: string;
//   targetYears?: number[]; createdBy?: string;
// }

// export interface ScheduleItem {
//   id: string; timeRange: string; activity: string;
//   type: 'Class' | 'Break' | 'Exam' | 'Activity';
// }

// export interface Notice {
//   id: string; collegeId?: string; title: string; description: string;
//   date: string; createdBy?: string; type: string; fileName?: string;
//   fileUrl?: string; createdById?: string;
// }

// export interface GlobalCompany {
//   id: string; name: string; website: string; description: string;
//   logo?: string; headquarters?: string; isSubscribed?: boolean;
// }
// export interface FreeCourse {
//   id: string; name: string; technology: string; platform: CoursePlatform;
//   description: string; link: string; postedBy: string; status: CourseStatus;
//   lastVerifiedAt?: string;
// }

// export enum CoursePlatform {
//   YOUTUBE = 'YouTube', COURSERA = 'Coursera', UDEMY = 'Udemy',
//   LINKEDIN = 'LinkedIn', OTHER = 'Other'
// }
// export enum CourseStatus { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE' }

// export interface DashboardMetrics {
//   stats: { placedCount: number; totalStudents: number; activeJobs: number; participatingCompanies: number };
//   branchDistribution: { name: string; count: number }[];
//   placementProgress: { name: string; placed: number }[];
//   jobTypeDistribution: { name: string; value: number }[];
//   recentJobs: Job[];
// }

// export interface PaginatedResponse<T> {
//   content: T[]; totalElements: number; totalPages: number;
//   currentPage: number; pageSize: number;
// }

/**
 * types.ts
 * Path: src/types/index.ts
 *
 * COMPLETE type definitions — every field from the original file preserved,
 * plus new fields added in the latest version. Nothing is omitted.
 *
 * Sections:
 *  1. Enums
 *  2. Address
 *  3. User  ← avatarUrl AND avatar declared (backward compat)
 *  4. Student
 *  5. StudentProfile
 *  6. EducationRecord / SemesterMark
 *  7. Resume
 *  8. Profile section items (Experience, Project, Certification, etc.)
 *  9. College / Branch
 * 10. Pagination
 * 11. Job / JobFormState / StudentJobView
 * 12. Social / Post
 * 13. Calendar / Notices
 * 14. Companies / Courses
 * 15. Dashboard
 * 16. AuditLog  (new — enterprise logging)
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export enum Role {
    ADMIN     = 'ADMIN',
    SROTS_DEV = 'SROTS_DEV',
    CPH       = 'CPH',
    STAFF     = 'STAFF',
    STUDENT   = 'STUDENT',
}

export enum CoursePlatform {
    YOUTUBE  = 'YouTube',
    COURSERA = 'Coursera',
    UDEMY    = 'Udemy',
    LINKEDIN = 'LinkedIn',
    OTHER    = 'Other',
}

export enum CourseStatus {
    ACTIVE   = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export type MarkFormat = 'Percentage' | 'CGPA' | 'Grade' | 'Marks';

// ─────────────────────────────────────────────────────────────────────────────
// 2. ADDRESS
// ─────────────────────────────────────────────────────────────────────────────

export interface AddressFormData {
    addressLine1: string;
    addressLine2: string;
    village:      string;
    mandal:       string;
    city:         string;
    state:        string;
    zip:          string;
    country:      string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. USER  (maps to the users table / User.java entity)
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
    id:               string;
    username:         string;
    email:            string;
    fullName:         string;
    role:             Role;

    /** Flat college ID exposed via @JsonProperty("collegeId") getter on entity */
    collegeId?:       string | null;

    /** JWT — present only in login response, not stored on entity */
    token?:           string;

    // ── Profile image ─────────────────────────────────────────────────────────
    /**
     * Canonical field name matching the Java entity column `avatar_url`.
     * Jackson serialises it as "avatarUrl" in API responses.
     * Set to DEFAULT_AVATAR_URL at account creation; user replaces via
     * POST /accounts/{id}/upload-photo after login.
     */
    avatarUrl?:       string;

    /**
     * @deprecated Use avatarUrl — kept for backward compatibility with
     * code that referenced `student.avatar` before the rename.
     * Both fields are checked by StudentTable.getAvatarUrl().
     */
    avatar?:          string;

    // ── Timestamps ────────────────────────────────────────────────────────────
    createdAt?:       string;
    updatedAt?:       string;

    // ── Access control ────────────────────────────────────────────────────────
    isRestricted?:    boolean;
    isCollegeHead?:   boolean;

    // ── Soft-delete ───────────────────────────────────────────────────────────
    isDeleted?:       boolean;
    deletedAt?:       string;
    deletedBy?:       string;

    // ── Contact & personal ────────────────────────────────────────────────────
    phone?:            string;
    alternativeEmail?: string;
    alternativePhone?: string;
    aadhaarNumber?:    string;
    bio?:              string;
    department?:       string;
    experience?:       string;
    education?:        string;

    // ── Address ───────────────────────────────────────────────────────────────
    address?:          AddressFormData | null;
    /** Raw addressJson string from backend */
    addressJson?:      string;
    /** Human-readable full address string (legacy) */
    fullAddress?:      string;

    // ── Password reset ────────────────────────────────────────────────────────
    resetToken?:       string | null;
    tokenExpiry?:      string | null;

    // ── Device tracking ───────────────────────────────────────────────────────
    lastDeviceInfo?:   string | null;

    // ── Collections (present on full-profile or 360° responses) ──────────────
    educationRecords?:  EducationRecord[] | null;
    experiences?:       WorkExperience[]  | null;
    projects?:          Project[]         | null;
    certifications?:    Certification[]   | null;
    languages?:         Language[]        | null;
    socialLinks?:       SocialLink[]      | null;
    resumes?:           Resume[]          | null;
    skills?:            Skill[]           | null;

    isProfileComplete?: boolean;

    /**
     * Exposed via @JsonProperty getters on User.java — available on list
     * responses (GET /college/:id/role/STUDENT) without a full profile fetch.
     */
    rollNumber?:  string;
    branch?:      string;
    batch?:       number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STUDENT  (extends User — returned by StudentService.getStudentProfile)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * StudentService merges { user, profile, educationHistory } into a flat object:
 *   { ...user, profile, educationHistory }
 * So educationHistory is at ROOT level, NOT nested inside profile.
 */
export interface Student extends User {
    profile:           StudentProfile;
    educationHistory?: EducationRecord[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. STUDENT PROFILE  (maps to student_profiles table)
// ─────────────────────────────────────────────────────────────────────────────

export interface StudentProfile {
    userId:         string;
    rollNumber:     string;
    branch:         string;
    course:         string;
    batch:          number;
    placementCycle: string;
    careerPath:     string;
    gender:         string;
    dob:            string;
    nationality:    string;
    religion:       string;
    dayScholar:     boolean;

    aadhaarNumber:       string;
    drivingLicense:      string;
    passportNumber:      string;
    passportIssueDate:   string;
    passportExpiryDate:  string;

    personalEmail:           string;
    instituteEmail:          string;
    parentEmail:             string;
    whatsappNumber:          string;
    preferredContactMethod:  string;

    linkedInProfile:  string;

    fatherName:       string;
    fatherOccupation: string;
    motherName:       string;
    motherOccupation: string;
    parentPhone:      string;

    mentor:      string;
    advisor:     string;
    coordinator: string;

    currentAddress:   AddressFormData;
    permanentAddress: AddressFormData;

    gapInStudies: boolean;
    gapDuration:  string;
    gapReason:    string;

    premiumStartDate: string;
    premiumEndDate:   string;
    updatedAt:        string;

    educationHistory: EducationRecord[];
    resumes?:         Resume[];

    experience?:     WorkExperience[];
    skills?:         Skill[];
    languages?:      Language[];
    projects?:       Project[];
    certifications?: Certification[];
    publications?:   Publication[];
    socialLinks?:    SocialLink[];

    communicationEmail: string;

    /** Duplicated at top-level for wizard convenience */
    fullName:         string;
    collegeName:      string;
    phone:            string;
    alternativeEmail: string;
    alternativePhone: string;
    bio:              string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. EDUCATION RECORD  (maps to education_records table)
// ─────────────────────────────────────────────────────────────────────────────

export interface EducationRecord {
    id:            string;
    level:         string;
    institution:   string;
    board:         string;
    yearOfPassing: string;

    /**
     * Frontend-normalised score — populated by normaliseEduRecord() in wizard.
     * Mapped from scoreDisplay (GET) or score (POST).
     */
    score:     string;

    /**
     * Raw field from backend GET response (entity column: score_display).
     * Declared so TypeScript doesn't strip it during type assertions.
     */
    scoreDisplay?: string;

    scoreType:       string;
    location?:       string;
    specialization?: string;
    branch?:         string;
    currentArrears?: number;

    /** Frontend-normalised semesters array — populated by parseSemestersData() */
    semesters?: SemesterMark[];

    /**
     * Raw JSON string from backend (entity column: semesters_data).
     * Jackson serialises the @JdbcTypeCode(SqlTypes.JSON) field as a string:
     *   "[{\"sem\":1,\"sgpa\":\"8.0\"}]"
     * Declared here so TypeScript doesn't ignore it on raw API objects.
     */
    semestersData?: string;
}

export interface SemesterMark {
    sem:  number;
    sgpa: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. RESUME
// ─────────────────────────────────────────────────────────────────────────────

export interface Resume {
    id:         string;
    name:       string;
    url:        string;
    isDefault:  boolean;
    uploadDate: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. PROFILE SECTION ITEMS
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkExperience {
    id:           string;
    title:        string;
    company:      string;
    location:     string;
    type:         string;
    startDate:    string;
    endDate:      string;
    isCurrent:    boolean;
    salaryRange?: string;
    description?: string;
}

export interface Project {
    id:          string;
    title:       string;
    domain:      string;
    techUsed:    string;
    link:        string;
    startDate:   string;
    endDate:     string;
    isCurrent:   boolean;
    description: string;
}

export interface Certification {
    id:              string;
    name:            string;
    organizer:       string;
    credentialUrl:   string;
    issueDate:       string;
    hasExpiry:       boolean;
    expiryDate?:     string;
    score?:          string;
    licenseNumber?:  string;
    hasScore?:       boolean;
}

export interface Publication {
    id:          string;
    title:       string;
    publisher:   string;
    url:         string;
    publishDate: string;
}

export interface SocialLink {
    id:       string;
    platform: string;
    url:      string;
}

export interface Skill {
    id:          string;
    name:        string;
    proficiency: string;
}

export interface Language {
    id:          string;
    name:        string;
    proficiency: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. COLLEGE / BRANCH
// ─────────────────────────────────────────────────────────────────────────────

export interface Branch {
    name: string;
    code: string;
}

export interface BranchDTO {
    name: string;
    code: string;
}

export interface CollegeAboutSection {
    id:              string;
    title:           string;
    content:         string;
    image?:          string;
    lastModifiedBy?: string;
    lastModifiedAt?: string;
}

export interface College {
    id:            string;
    name:          string;
    code:          string;
    type?:         string;
    email:         string;
    phone:         string;
    logoUrl:       string;
    studentCount:  number;
    cphCount:      number;
    activeJobs:    number;
    address:       string;
    addressDetails?:  AddressFormData;
    socialMedia?:     Record<string, string>;
    aboutSections?:   CollegeAboutSection[];
    branches?:        Branch[];
    lastModifiedBy?:  string;
    lastModifiedAt?:  string;
    landline?:        string;
    active?:          boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

export interface Page<T> {
    content:       T[];
    totalPages:    number;
    totalElements: number;
    currentPage:   number;
    pageSize:      number;
}

export interface PaginatedResponse<T> {
    content:       T[];
    totalElements: number;
    totalPages:    number;
    currentPage:   number;
    pageSize:      number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. JOB
// ─────────────────────────────────────────────────────────────────────────────

export interface Job {
    id:               string;
    collegeId?:       string;
    title:            string;
    companyName:      string;
    hiringDepartment?: string;
    jobType:          string;
    workMode:         string;
    status:           'Active' | 'Closed' | 'Draft';
    location:         string;
    salaryRange?:     string;
    summary:          string;

    responsibilitiesJson?:         string[];
    qualificationsJson?:           string[];
    preferredQualificationsJson?:  string[];
    benefitsJson?:                 string[];
    skills?:                       string[];

    /** Normalised aliases populated by jobService */
    responsibilities?:        string[];
    qualifications?:          string[];
    preferredQualifications?: string[];
    benefits?:                string[];

    companyCulture?:  string;
    physicalDemands?: string;
    eeoStatement?:    string;
    internalId?:      string;
    externalLink?:    string;
    applicationDeadline: string;
    postedAt:         string;
    postedBy?:        string;
    postedById?:      string;
    canEdit?:         boolean;
    avoidListUrl?:    string;

    isDeleted?:      boolean;
    deletedAt?:      string;
    deletedBy?:      string;
    deletionReason?: string;

    // Eligibility
    minUgScore?:       number;
    formatUg?:         string;
    min10thScore?:     number;
    format10th?:       string;
    min12thScore?:     number;
    format12th?:       string;
    minDiplomaScore?:  number;
    formatDiploma?:    string;
    maxBacklogs?:      number;
    allowGaps?:        boolean;
    maxGapYears?:      number;
    isDiplomaEligible?: boolean;
    allowedBranches?:  string[];
    eligibleBatches?:  number[];

    rounds?:                 any[];
    requiredStudentFields?:  string[];
    documents?:              { name: string; url: string }[];
    applicantCount?:         number;
    applicants?:             string[];
    negativeList?:           string[];
    studentStatus?:          Record<string, string>;

    /** @deprecated → use companyName */
    company?:         string;
    /** @deprecated → use jobType */
    type?:            string;
    /** @deprecated → use workMode */
    workArrangement?: string;
    /** @deprecated */
    eligibility?:     any;
}

export interface JobFormState {
    title:           string;
    company:         string;
    hiringDepartment: string;
    type:            string;
    workArrangement: string;
    location:        string;
    salaryRange:     string;
    summary:         string;
    internalId:      string;
    externalLink:    string;
    companyCulture:  string;
    physicalDemands: string;
    eeoStatement:    string;
    applicationDeadline: string;
    status:          string;

    responsibilitiesJson:         string[];
    qualificationsJson:           string[];
    preferredQualificationsJson:  string[];
    benefitsJson:                 string[];

    eligibility: {
        minCGPA:                number;
        formatUG:               string;
        min10th:                number;
        format10th:             string;
        min12th:                number;
        format12th:             string;
        minDiploma:             number;
        formatDiploma:          string;
        maxBacklogs:            number;
        allowedBranches:        string[];
        eligibleBatches:        number[];
        isDiplomaEligible:      boolean;
        educationalGapsAllowed: boolean;
        maxGapYears:            number;
    };

    rounds:                { name: string; date: string; status: string }[];
    requiredStudentFields: string[];
    documents:             { name: string; url: string }[];
    negativeList:          string[];
    avoidListUrl?:         string;
    collegeId?:            string;
    postedById?:           string;
}

export interface StudentJobView {
    job:                Job;
    isApplied:          boolean;
    isEligible:         boolean;
    isExpired:          boolean;
    isNotInterested:    boolean;
    eligibilityReason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. SOCIAL / POST
// ─────────────────────────────────────────────────────────────────────────────

export interface Post {
    id:               string;
    collegeId:        string;
    authorId:         string;
    authorName:       string;
    authorRole:       Role;
    content:          string;
    images:           string[];
    documents:        { name: string; url: string }[];
    likes:            number;
    commentsCount:    number;
    isLikedByMe:      boolean;
    likedBy:          string[];
    commentsDisabled: boolean;
    createdAt:        string;
    comments:         PostComment[];
}

export interface PostComment {
    id:       string;
    userId:   string;
    user:     string;
    role:     Role;
    text:     string;
    date:     string;
    likes?:   number;
    likedBy?: string[];
    parentId?: string | null;
    replies?:  PostComment[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. CALENDAR / NOTICES
// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
    id:              string;
    collegeId?:      string;
    title:           string;
    date:            string;
    type:            string;
    startTime?:      string;
    endTime?:        string;
    targetBranches?: string[];
    postedBy?:       string;
    createdById?:    string;
    endDate?:        string;
    description?:    string;
    schedule?:       ScheduleItem[];
    createdAt?:      string;
    targetYears?:    number[];
    createdBy?:      string;
}

export interface ScheduleItem {
    id:        string;
    timeRange: string;
    activity:  string;
    type:      'Class' | 'Break' | 'Exam' | 'Activity';
}

export interface Notice {
    id:           string;
    collegeId?:   string;
    title:        string;
    description:  string;
    date:         string;
    createdBy?:   string;
    type:         string;
    fileName?:    string;
    fileUrl?:     string;
    createdById?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. COMPANIES / COURSES
// ─────────────────────────────────────────────────────────────────────────────

export interface GlobalCompany {
    id:            string;
    name:          string;
    website:       string;
    description:   string;
    logo?:         string;
    headquarters?: string;
    isSubscribed?: boolean;
}

export interface FreeCourse {
    id:              string;
    name:            string;
    technology:      string;
    platform:        CoursePlatform;
    description:     string;
    link:            string;
    postedBy:        string;
    status:          CourseStatus;
    lastVerifiedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
    stats: {
        placedCount:            number;
        totalStudents:          number;
        activeJobs:             number;
        participatingCompanies: number;
    };
    branchDistribution:  { name: string; count: number }[];
    placementProgress:   { name: string; placed: number }[];
    jobTypeDistribution: { name: string; value: number }[];
    recentJobs:          Job[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. AUDIT LOG  (enterprise logging — mirrors audit_logs table if created)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AuditLog — frontend type for any future admin UI that lists audit events.
 *
 * The backend AuditLogger currently writes to SLF4J (application log).
 * If you later add an audit_logs DB table, the Java entity would map directly
 * to this shape.
 */
export interface AuditLog {
    id:          string;
    action:      string;      // e.g. "CREATE_STUDENT", "SOFT_DELETE_ACCOUNT"
    performedBy: string;      // username of the actor
    targetId?:   string;      // affected user/resource ID
    detail?:     string;      // free-text context
    ipAddress?:  string;
    userAgent?:  string;
    timestamp:   string;      // ISO-8601
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. ACCOUNT FILTER  (student-directory filter tabs)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AccountFilter — used by GlobalStudentDirectory / StudentFilters for the
 * All Active / Soft Deleted / Hard Deleted tab state.
 * Maps to `?status=` query param on the backend:
 *   active       → isDeleted = false
 *   soft_deleted → isDeleted = true
 *   hard_deleted → physically removed (returns empty unless audit log extended)
 */
export type AccountFilter = 'active' | 'soft_deleted' | 'hard_deleted';