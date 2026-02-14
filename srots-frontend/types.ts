

// export enum Role {
//   ADMIN = 'ADMIN',
//   SROTS_DEV = 'SROTS_DEV',
//   CPH = 'CPH',    // College Placement Head
//   STAFF = 'STAFF', // Placement Staff
//   STUDENT = 'STUDENT'
// }

// /**
//  * Maps to 'address_json' columns in DB
//  */
// // export interface AddressFormData {
// //     addressLine1: string;
// //     addressLine2: string;
// //     village: string;
// //     mandal: string;
// //     city: string;
// //     state: string;
// //     zip: string;
// //     country: string;
// // }

// // ... other exports ...

// /**
//  * Maps to 'address_json' columns in DB
//  */
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

// // /**
// //  * Interface: User
// //  * Maps to 'users' table in MySQL
// //  */
// // export interface User {
// //   id: string;        // DB: 'id'
// //   fullName: string;  // DB: 'name' (Mapping required in Backend)
// //   email: string;     // DB: 'email'
// //   role: Role;        // DB: 'role'
// //   collegeId?: string | null; // DB: 'college_id'
// //   token?: string;    // Auth token (not in DB)
// //   avatar?: string;   // DB: 'avatar'
// //   createdAt?: string; // DB: (Optional in users table)
  
// //   // States & Info
// //   isRestricted?: boolean; // Calculated or separate column
// //   phone?: string;         // DB: 'phone'
// //   fullAddress?: string;   // DB: 'full_address'
// //   address?: AddressFormData; // DB: 'address_json' (Structured data)
  
// //   // Optional metadata
// //   department?: string;
// //   aadhaarNumber?: string;
// //   bio?: string;
// //   experience?: string;
// //   education?: string;
// //   isProfileComplete?: boolean; // Frontend State Flag
// //   isCollegeHead?: boolean;     // Hierarchy logic

// //   // Added missing fields for simulator and profile edits
// //   password?: string;
// //   userId?: string; 
// //   alternativeEmail?: string;
// //   alternativePhone?: string;
// // }

// // /**
// //  * Interface: User
// //  * Maps to 'users' table in MySQL
// //  */
// // export interface User {
// //   id: string;                    // DB: 'id'
// //   username: string;              // ← ADD THIS (DB: 'username')
// //   fullName: string;              // DB: 'name'
// //   email: string;                 // DB: 'email'
// //   role: Role;                    // DB: 'role'
// //   collegeId?: string | null;     // DB: 'college_id'
// //   token?: string;                // Auth token (not in DB)
// //   avatar?: string;               // DB: 'avatar'
// //   createdAt?: string;            // DB: (Optional in users table)
  
// //   // States & Info
// //   isRestricted?: boolean;        // Calculated or separate column
// //   phone?: string;                // DB: 'phone'
// //   fullAddress?: string;          // DB: 'full_address'
// //   address?: AddressFormData;     // DB: 'address_json'
  
// //   // Optional metadata
// //   department?: string;
// //   aadhaarNumber?: string;
// //   bio?: string;
// //   experience?: string;
// //   education?: string;
// //   isProfileComplete?: boolean;   // Frontend State Flag
// //   isCollegeHead?: boolean;       // Hierarchy logic

// //   // Added missing fields for simulator and profile edits
// //   password?: string;
// //   userId?: string;               // ← you already have this, but probably redundant with id/username
// //   alternativeEmail?: string;
// //   alternativePhone?: string;
// // }


// // ... (existing imports) ...

// /**
//  * Full User interface – now matches backend response exactly
//  */
// export interface User {
//   id: string;                    // DB: id
//   username: string;              // DB: username ← required now
//   email: string;                 // DB: email
//   fullName: string;              // DB: name / fullName
//   role: Role;                    // DB: role
//   collegeId?: string | null;     // DB: college_id
//   token?: string;                // not in DB – auth only
//   avatar?: string;               // DB: avatar_url
//   createdAt?: string;            // DB: created_at
//   updatedAt?: string;            // DB: updated_at
  
//   // Security & Flags
//   isRestricted?: boolean;        // DB: is_restricted
//   isCollegeHead?: boolean;       // DB: is_college_head
  
//   // Contact
//   phone?: string;                // DB: phone
//   alternativeEmail?: string;     // DB: alternative_email
//   alternativePhone?: string;     // DB: alternative_phone
  
//   // Personal / Professional
//   aadhaarNumber?: string;        // DB: aadhaar_number
//   bio?: string;                  // DB: bio
//   department?: string;           // DB: department
//   experience?: string;           // DB: experience
//   education?: string;            // DB: education
  
//   // Address (parsed from addressJson)
//   address?: AddressFormData | null;
//   fullAddress?: string;          // derived / summary

//   // Reset & Security
//   resetToken?: string | null;
//   tokenExpiry?: string | null;
//   lastDeviceInfo?: string | null;

//   // Extended profile fields (can be null)
//   educationRecords?: any[] | null;
//   experiences?: any[] | null;
//   projects?: any[] | null;
//   certifications?: any[] | null;
//   languages?: any[] | null;
//   socialLinks?: any[] | null;
//   resumes?: any[] | null;
//   skills?: any[] | null;

//   // Frontend-only helpers
//   isProfileComplete?: boolean;
// }

// export interface Address {
//   city: string;
//   district: string;
//   state: string;
//   pinCode: string;
//   country: string;
//   fullAddress: string;
// }

// // ... helper interfaces for StudentProfile ...
// // Added salaryRange for ExperienceTab
// export interface WorkExperience { id: string; title: string; company: string; location: string; type: string; startDate: string; endDate: string; isCurrent: boolean; salaryRange?: string; }
// export interface Project { id: string; title: string; domain: string; techUsed: string; link: string; startDate: string; endDate: string; isCurrent: boolean; description: string; }
// // Added hasScore for CertificationsTab
// export interface Certification { id: string; name: string; organizer: string; credentialUrl: string; issueDate: string; hasExpiry: boolean; expiryDate?: string; score?: string; licenseNumber?: string; hasScore?: boolean; }
// export interface Publication { id: string; title: string; publisher: string; url: string; publishDate: string; }
// export interface SocialLink { id: string; platform: string; url: string; }
// export interface Skill { id: string; name: string; proficiency: string; }
// export interface Language { id: string; name: string; proficiency: string; }
// export interface SemesterMark { sem: number; sgpa: string; }
// export interface EducationRecord { id: string; level: string; institution: string; board: string; yearOfPassing: string; score: string; scoreType: string; location: string; specialization?: string; branch?: string; semesters?: SemesterMark[]; currentArrears?: number; }
// export interface Resume { id: string; name: string; url: string; isDefault: boolean; uploadDate: string; }

// /**
//  * Interface: StudentProfile
//  * Maps to 'profile_json' column in 'students' table
//  */
// export interface StudentProfile {
//   rollNumber: string;
//   fullName: string;
//   branch: string;
//   course: string; 
//   collegeName: string;
//   batch: number; 
//   gender: 'MALE' | 'FEMALE' | 'OTHER';
//   placementCycle: string; 
//   dob: string;
//   mentor: string;
//   advisor: string;
//   coordinator: string;
//   gapInStudies: boolean;
//   gapDuration?: string;
//   gapReason?: string;
//   instituteEmail: string;
//   alternativeEmail: string;
//   phone: string;
//   parentPhone: string;
//   parentEmail: string;
//   whatsappNumber: string;
//   personalEmail: string;
//   linkedInProfile?: string;
//   dayScholar: boolean;
//   nationality: string;
//   religion?: string;
//   aadhaarNumber: string;
//   drivingLicense?: string;
//   passportNumber?: string;
//   fatherName: string;
//   motherName: string;
//   currentAddress: Address;
//   permanentAddress: Address;
//   educationHistory: EducationRecord[];
//   resumes?: Resume[];
//   experience: WorkExperience[];
//   skills: Skill[];
//   languages: Language[];
//   projects: Project[];
//   certifications: Certification[];
//   publications: Publication[];
//   socialLinks: SocialLink[];

//   // Added missing fields for ProfileTab and StudentPortal
//   communicationEmail: string;
//   preferredContactMethod: 'Email' | 'Phone' | 'WhatsApp';
//   passportIssueDate?: string;
//   passportExpiryDate?: string;
//   fatherOccupation?: string;
//   motherOccupation?: string;
// }

// /**
//  * Interface: Student
//  * Maps to 'students' table in MySQL
//  */
// export interface Student extends User {
//   profile: StudentProfile; // DB: 'profile_json'
//   createdAt?: string;      // DB: 'created_at'
// }

// export interface Branch {
//   name: string; 
//   code: string; 
// }

// // Added audit fields for AboutCollegeComponent
// export interface CollegeAboutSection {
//   id: string; 
//   title: string; 
//   content: string; 
//   image?: string;
//   lastModifiedBy?: string;
//   lastModifiedAt?: string;
// }

// /**
//  * Interface: College
//  * Maps to 'colleges' table in MySQL
//  */
// export interface College {
//   id: string;           // DB: 'id'
//   name: string;         // DB: 'name'
//   code: string;         // DB: 'code'
//   type?: string;        // DB: 'type'
//   email: string;        // DB: 'email'
//   phone: string;        // DB: 'phone'
//   logo: string;         // DB: 'logo'
//   studentCount: number; // DB: 'student_count'
//   cphCount: number;     // DB: 'cph_count'
//   activeJobs: number;   // DB: 'active_jobs'
//   address: string;      // Summary string for UI
//   addressDetails?: AddressFormData; // DB: 'address_json'
//   socialMedia?: any;    // DB: 'social_media_json'
//   aboutSections?: CollegeAboutSection[]; // DB: 'about_sections_json'
//   branches?: Branch[];
//   lastModifiedBy?: string;
//   lastModifiedAt?: string;
//   landline?: string; // Added landline for CollegeFormModal
// }

// export interface CollegeAboutSection {
//   id: string;
//   title: string;
//   content: string;
//   image?: string;
//   lastModifiedBy?: string;
//   lastModifiedAt?: string;
// }

// export type MarkFormat = 'Percentage' | 'CGPA' | 'Grade' | 'Marks';

// /**
//  * Interface: Job
//  * Maps to 'jobs' table in MySQL
//  */
// export interface Job {
//   id: string;              // DB: 'id'
//   collegeId?: string;      // DB: 'college_id'
//   title: string;           // DB: 'title'
//   company: string;         // DB: 'company'
//   type: string;            // DB: 'type'
//   workArrangement: string; // DB: 'work_arrangement'
//   status: 'Active' | 'Closed'; // DB: 'status'
//   location: string;        // DB: 'location'
//   summary: string;         // DB: 'summary'
//   postedBy: string;        // DB: 'posted_by'
//   postedById: string;      // DB: 'posted_by_id'
//   postedAt: string;        // DB: 'posted_at'
//   applicationDeadline: string; // DB: 'application_deadline'
  
//   eligibility: any;        // DB: 'eligibility_json'
//   rounds: any[];           // DB: 'rounds_json'
//   studentStatus: Record<string, string>; // DB: 'student_status_json'
//   documents: {name: string, url: string}[]; // DB: 'documents_json'
  
//   // UI helper fields
//   responsibilities: string[];
//   qualifications: string[];
//   preferredQualifications?: string[];
//   salaryRange?: string;
//   benefits?: string[];
//   requiredStudentFields: string[]; 
//   applicants: string[]; 
//   notInterested: string[];

//   // Added missing properties for JobOverviewTab and DetailView
//   internalId?: string;
//   hiringDepartment?: string;
//   companyCulture?: string;
//   physicalDemands?: string;
//   eeoStatement?: string;
//   externalLink?: string;
//   negativeList?: string[];
// }

// export interface StudentJobView {
//     job: Job;
//     isApplied: boolean;
//     isEligible: boolean;
//     eligibilityReason?: string;
//     isExpired: boolean;
//     isNotInterested: boolean;
// }

// /**
//  * Interface: Post
//  * Maps to 'posts' table in MySQL
//  */
// export interface Post {
//   id: string;          // DB: 'id'
//   collegeId?: string;  // DB: 'college_id'
//   authorId: string;    // DB: 'author_id'
//   authorName: string;  // DB: 'author_name'
//   authorRole?: Role;   // DB: 'author_role'
//   content: string;     // DB: 'content'
//   likes: number;       // DB: 'likes'
//   comments: PostComment[];     // Updated to use PostComment interface
//   createdAt: string;   // DB: 'created_at'
//   images?: string[];
//   likedBy: string[];
//   commentsDisabled: boolean;
//   documents?: {name: string, url: string}[];
// }

// /**
//  * Interface: PostComment
//  * Added for Social domain
//  */
// export interface PostComment {
//     id: string;
//     userId: string;
//     user: string;
//     role: Role;
//     text: string;
//     date: string;
//     likes: number;
//     likedBy: string[];
//     replies: PostComment[];
// }

// /**
//  * Interface: CalendarEvent
//  * Maps to 'events' table in MySQL
//  */
// export interface CalendarEvent {
//   id: string;            // DB: 'id'
//   collegeId?: string;    // DB: 'college_id'
//   title: string;         // DB: 'title'
//   date: string;          // DB: 'date'
//   type: string;          // DB: 'type'
//   startTime?: string;    // DB: 'start_time'
//   endTime?: string;      // DB: 'end_time'
//   targetBranches?: string[]; // DB: 'target_branches_json'
//   postedBy?: string;     // DB: 'posted_by'
//   createdById?: string;  // DB: 'created_by_id'
  
//   endDate?: string;
//   description?: string;
//   schedule?: ScheduleItem[]; // Updated to use ScheduleItem interface
//   createdAt?: string; 
//   targetYears?: number[]; // Added missing targetYears
// }

// /**
//  * Interface: ScheduleItem
//  * Added for Timetable builder
//  */
// export interface ScheduleItem {
//     id: string;
//     timeRange: string;
//     activity: string;
//     type: 'Class' | 'Break' | 'Exam' | 'Activity';
// }

// /**
//  * Interface: Notice
//  * Maps to 'notices' table in MySQL
//  */
// export interface Notice {
//   id: string;          // DB: 'id'
//   collegeId?: string;  // DB: 'college_id'
//   title: string;       // DB: 'title'
//   description: string; // DB: 'description'
//   date: string;        // DB: 'date'
//   postedBy: string;    // DB: 'posted_by'
//   type: string;        // DB: 'type'
//   fileName?: string;   // DB: 'file_name'
//   fileUrl?: string;    // DB: 'file_url'
// }

// export interface GlobalCompany { id: string; name: string; website: string; description: string; logo?: string; headquarters?: string; isSubscribed?: boolean; }
// export interface FreeCourse { id: string; name: string; technology: string; platform: CoursePlatform; description: string; link: string; postedBy: string; status: CourseStatus; lastVerifiedAt?: string; }

// // Added missing enums for FreeCourses
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


export enum Role {
  ADMIN = 'ADMIN',
  SROTS_DEV = 'SROTS_DEV',
  CPH = 'CPH',    // College Placement Head
  STAFF = 'STAFF', // Placement Staff
  STUDENT = 'STUDENT'
}

/**
 * Maps to 'address_json' columns in DB
 */
export interface AddressFormData {
  addressLine1: string;
  addressLine2: string;
  village: string;
  mandal: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/**
 * Full User interface – now matches backend response exactly
 */
export interface User {
  id: string;                    // DB: id
  username: string;              // DB: username ← required now
  email: string;                 // DB: email
  fullName: string;              // DB: name / fullName
  role: Role;                    // DB: role
  collegeId?: string | null;     // DB: college_id
  token?: string;                // not in DB – auth only
  avatar?: string;               // DB: avatar_url
  createdAt?: string;            // DB: created_at
  updatedAt?: string;            // DB: updated_at
  
  // Security & Flags
  isRestricted?: boolean;        // DB: is_restricted
  isCollegeHead?: boolean;       // DB: is_college_head
  
  // Contact
  phone?: string;                // DB: phone
  alternativeEmail?: string;     // DB: alternative_email
  alternativePhone?: string;     // DB: alternative_phone
  
  // Personal / Professional
  aadhaarNumber?: string;        // DB: aadhaar_number
  bio?: string;                  // DB: bio
  department?: string;           // DB: department
  experience?: string;           // DB: experience
  education?: string;            // DB: education
  
  // Address (parsed from addressJson)
  address?: AddressFormData | null;
  fullAddress?: string;          // derived / summary

  // Reset & Security
  resetToken?: string | null;
  tokenExpiry?: string | null;
  lastDeviceInfo?: string | null;

  // Extended profile fields (can be null)
  educationRecords?: any[] | null;
  experiences?: any[] | null;
  projects?: any[] | null;
  certifications?: any[] | null;
  languages?: any[] | null;
  socialLinks?: any[] | null;
  resumes?: any[] | null;
  skills?: any[] | null;

  // Frontend-only helpers
  isProfileComplete?: boolean;
}

// export interface Address {
//   city: string;
//   district: string;
//   state: string;
//   pinCode: string;
//   country: string;
//   fullAddress: string;
// }

// ... helper interfaces for StudentProfile ...
// Added salaryRange for ExperienceTab
export interface WorkExperience { id: string; title: string; company: string; location: string; type: string; startDate: string; endDate: string; isCurrent: boolean; salaryRange?: string; }
export interface Project { id: string; title: string; domain: string; techUsed: string; link: string; startDate: string; endDate: string; isCurrent: boolean; description: string; }
// Added hasScore for CertificationsTab
export interface Certification { id: string; name: string; organizer: string; credentialUrl: string; issueDate: string; hasExpiry: boolean; expiryDate?: string; score?: string; licenseNumber?: string; hasScore?: boolean; }
export interface Publication { id: string; title: string; publisher: string; url: string; publishDate: string; }
export interface SocialLink { id: string; platform: string; url: string; }
export interface Skill { id: string; name: string; proficiency: string; }
export interface Language { id: string; name: string; proficiency: string; }
export interface SemesterMark { sem: number; sgpa: string; }
export interface EducationRecord { id: string; level: string; institution: string; board: string; yearOfPassing: string; score: string; scoreType: string; location: string; specialization?: string; branch?: string; semesters?: SemesterMark[]; currentArrears?: number; }
export interface Resume { id: string; name: string; url: string; isDefault: boolean; uploadDate: string; }

/**
 * Interface: StudentProfile
 * Maps to 'profile_json' column in 'students' table
 */
export interface StudentProfile {
  userId: string;
  rollNumber: string;
  branch: string;
  course: string;
  batch: number;
  placementCycle: string; 
  careerPath: string;
  gender: string;
  dob: string;
  nationality: string;
  religion: string;
  dayScholar: boolean;
  aadhaarNumber: string;
  drivingLicense: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  personalEmail: string;
  instituteEmail: string;
  parentEmail: string;
  whatsappNumber: string;
  preferredContactMethod: string;
  linkedInProfile: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  parentPhone: string;
  mentor: string;
  advisor: string;
  coordinator: string;
  currentAddress: AddressFormData;
  permanentAddress: AddressFormData;
  gapInStudies: boolean;
  gapDuration: string;
  gapReason: string;
  premiumStartDate: string;
  premiumEndDate: string;
  updatedAt: string;
  educationHistory: EducationRecord[];
  resumes?: Resume[];
  experience: WorkExperience[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  certifications: Certification[];
  publications: Publication[];
  socialLinks: SocialLink[];

  // Added missing fields for ProfileTab and StudentPortal
  communicationEmail: string;
  fullName: string;
  collegeName: string;
  phone: string;
  alternativeEmail: string;
  alternativePhone: string;
  bio: string;
}

/**
 * Interface: Student
 * Maps to 'students' table in MySQL
 */
export interface Student extends User {
  profile: StudentProfile; // DB: 'profile_json'
  createdAt?: string;      // DB: 'created_at'
}

export interface Branch {
  name: string; 
  code: string; 
}

// Added audit fields for AboutCollegeComponent
export interface CollegeAboutSection {
  id: string; 
  title: string; 
  content: string; 
  image?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

/**
 * Interface: College
 * Maps to 'colleges' table in MySQL
 */
export interface College {
  id: string;           // DB: 'id'
  name: string;         // DB: 'name'
  code: string;         // DB: 'code'
  type?: string;        // DB: 'type'
  email: string;        // DB: 'email'
  phone: string;        // DB: 'phone'
  logo: string;         // DB: 'logo'
  studentCount: number; // DB: 'student_count'
  cphCount: number;     // DB: 'cph_count'
  activeJobs: number;   // DB: 'active_jobs'
  address: string;      // Summary string for UI
  addressDetails?: AddressFormData; // DB: 'address_json'
  socialMedia?: any;    // DB: 'social_media_json'
  aboutSections?: CollegeAboutSection[]; // DB: 'about_sections_json'
  branches?: Branch[];
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  landline?: string; // Added landline for CollegeFormModal
}

export interface CollegeAboutSection {
  id: string;
  title: string;
  content: string;
  image?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export type MarkFormat = 'Percentage' | 'CGPA' | 'Grade' | 'Marks';

/**
 * Interface: Job
 * Maps to 'jobs' table in MySQL
 */
export interface Job {
  id: string;              // DB: 'id'
  collegeId?: string;      // DB: 'college_id'
  title: string;           // DB: 'title'
  company: string;         // DB: 'company'
  type: string;            // DB: 'type'
  workArrangement: string; // DB: 'work_arrangement'
  status: 'Active' | 'Closed'; // DB: 'status'
  location: string;        // DB: 'location'
  summary: string;         // DB: 'summary'
  postedBy: string;        // DB: 'posted_by'
  postedById: string;      // DB: 'posted_by_id'
  postedAt: string;        // DB: 'posted_at'
  applicationDeadline: string; // DB: 'application_deadline'
  
  eligibility: any;        // DB: 'eligibility_json'
  rounds: any[];           // DB: 'rounds_json'
  studentStatus: Record<string, string>; // DB: 'student_status_json'
  documents: {name: string, url: string}[]; // DB: 'documents_json'
  
  // UI helper fields
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications?: string[];
  salaryRange?: string;
  benefits?: string[];
  requiredStudentFields: string[]; 
  applicants: string[]; 
  notInterested: string[];

  // Added missing properties for JobOverviewTab and DetailView
  internalId?: string;
  hiringDepartment?: string;
  companyCulture?: string;
  physicalDemands?: string;
  eeoStatement?: string;
  externalLink?: string;
  negativeList?: string[];
}

export interface StudentJobView {
    job: Job;
    isApplied: boolean;
    isEligible: boolean;
    eligibilityReason?: string;
    isExpired: boolean;
    isNotInterested: boolean;
}


/**
 * Interface: Post
 * Maps to PostResponse from backend
 */
export interface Post {
  id: string;
  collegeId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  images: string[];
  documents: {name: string, url: string}[];
  likes: number;
  commentsCount: number; // NEW: Added to match backend
  isLikedByMe: boolean;
  likedBy: string[];
  commentsDisabled: boolean;
  createdAt: string;
  comments: PostComment[];
}

/**
 * Interface: PostComment
 * Maps to CommentResponse from backend
 */
export interface PostComment {
  id: string;
  userId: string;
  user: string;
  role: Role;
  text: string;
  date: string;
  likes?: number; // NEW: Added for comment likes
  likedBy?: string[]; // NEW: Added for tracking who liked
  parentId?: string | null; // NEW: Added for nested replies
  replies?: PostComment[]; // NEW: Added for nested structure
}



/**
 * Interface: CalendarEvent
 * Maps to 'events' table in MySQL
 */
export interface CalendarEvent {
  id: string;            // DB: 'id'
  collegeId?: string;    // DB: 'college_id'
  title: string;         // DB: 'title'
  date: string;          // DB: 'date'
  type: string;          // DB: 'type'
  startTime?: string;    // DB: 'start_time'
  endTime?: string;      // DB: 'end_time'
  targetBranches?: string[]; // DB: 'target_branches_json'
  postedBy?: string;     // DB: 'posted_by'
  createdById?: string;  // DB: 'created_by_id'
  
  endDate?: string;
  description?: string;
  schedule?: ScheduleItem[]; // Updated to use ScheduleItem interface
  createdAt?: string; 
  targetYears?: number[]; // Added missing targetYears

  createdBy?: string; // Added createdBy for audit trail
}

/**
 * Interface: ScheduleItem
 * Added for Timetable builder
 */
export interface ScheduleItem {
    id: string;
    timeRange: string;
    activity: string;
    type: 'Class' | 'Break' | 'Exam' | 'Activity';
}

/**
 * Interface: Notice
 * Maps to 'notices' table in MySQL
 */
export interface Notice {
  id: string;          // DB: 'id'
  collegeId?: string;  // DB: 'college_id'
  title: string;       // DB: 'title'
  description: string; // DB: 'description'
  date: string;        // DB: 'date'
  createdBy?: string;  // Changed from postedBy for consistency with backend
  type: string;        // DB: 'type'
  fileName?: string;   // DB: 'file_name'
  fileUrl?: string;    // DB: 'file_url'
  createdById?: string; // DB: 'created_by'
}

export interface GlobalCompany { id: string; name: string; website: string; description: string; logo?: string; headquarters?: string; isSubscribed?: boolean; }
export interface FreeCourse { id: string; name: string; technology: string; platform: CoursePlatform; description: string; link: string; postedBy: string; status: CourseStatus; lastVerifiedAt?: string; }

// Added missing enums for FreeCourses
export enum CoursePlatform {
  YOUTUBE = 'YouTube',
  COURSERA = 'Coursera',
  UDEMY = 'Udemy',
  LINKEDIN = 'LinkedIn',
  OTHER = 'Other'
}

export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}


export interface DashboardMetrics {
    stats: {
        placedCount: number;
        totalStudents: number;
        activeJobs: number;
        participatingCompanies: number;
    };
    branchDistribution: { name: string; count: number }[];
    placementProgress: { name: string; placed: number }[];
    jobTypeDistribution: { name: string; value: number }[];
    recentJobs: Job[];
}