// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   X, Trash2, FileText, Search, 
//   ChevronLeft, ChevronRight, 
//   CheckCircle, UploadCloud, Loader2,
//   Building, MapPin, DollarSign, Briefcase, Plus,
//   Info, Star, Users, Heart, Shield, Ban, GraduationCap
// } from 'lucide-react';
// import { Job, User } from '../../../../types';
// import { JobService } from '../../../../services/jobService';
// import { CollegeService } from '../../../../services/collegeService';
// import { COMMON_PROFILE_FIELD_KEYS, ALL_PROFILE_FIELDS } from '../../../../constants';
// import { FieldSelector } from '../../shared/FieldSelector';

// /**
//  * COMPLETE JobWizard - ENTERPRISE VERSION
//  * 
//  * CRITICAL FIXES:
//  * 1. ✅ Data flattening before save (eligibility → flat fields)
//  * 2. ✅ Dynamic branch fetching from College API
//  * 3. ✅ 11-year batch selector (2021-2031 for current year 2026)
//  * 4. ✅ Proper field name mapping (company→companyName, type→jobType, etc.)
//  */

// interface JobWizardProps {
//   isOpen: boolean;
//   isEditing: boolean;
//   initialData?: Job | null; 
//   user?: User;
//   onClose: () => void;
//   onSave: (jobData: Partial<Job>, jdFiles: File[], avoidList?: File) => void;
// }

// const currentYear = 2026;

// // Generate 11 years: current + 5 past + 5 future
// const AVAILABLE_BATCHES = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

// export const JobWizard: React.FC<JobWizardProps> = ({ 
//   isOpen, 
//   isEditing, 
//   initialData, 
//   user,
//   onClose, 
//   onSave 
// }) => {
//   const [step, setStep] = useState(1);
//   const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
//   const [isUploading, setIsUploading] = useState(false);
//   const [branchSearch, setBranchSearch] = useState('');
//   const jobDocInputRef = useRef<HTMLInputElement>(null);
//   const avoidListInputRef = useRef<HTMLInputElement>(null);
  
//   // Dynamic branches from College API
//   const [collegeBranches, setCollegeBranches] = useState<{code: string, name: string}[]>([]);
//   const [loadingBranches, setLoadingBranches] = useState(false);
  
//   // File tracking
//   const [jdFiles, setJdFiles] = useState<File[]>([]);
//   const [avoidListFile, setAvoidListFile] = useState<File | null>(null);

//   const initialFormState: Partial<Job> = {
//     title: '', 
//     company: '', 
//     summary: '', 
//     type: 'Full-Time', 
//     location: '', 
//     workArrangement: 'On-site', 
//     salaryRange: '',
//     internalId: '', 
//     companyCulture: '', 
//     physicalDemands: '', 
//     eeoStatement: '', 
//     hiringDepartment: '',
//     responsibilitiesJson: [''], 
//     qualificationsJson: [''], 
//     preferredQualificationsJson: [''], 
//     benefitsJson: [''],
//     eligibility: { 
//         minCGPA: 0, 
//         maxBacklogs: 0, 
//         allowedBranches: [], 
//         min10th: 60, 
//         format10th: 'Percentage',
//         min12th: 60, 
//         format12th: 'Percentage', 
//         batch: currentYear, 
//         eligibleBatches: [currentYear], 
//         isDiplomaEligible: false, 
//         minDiploma: 60, 
//         formatDiploma: 'Percentage', 
//         educationalGapsAllowed: false, 
//         maxGapYears: 0,
//         formatUG: 'Percentage'
//     },
//     rounds: [{ name: 'Online Assessment', date: '', status: 'Pending' }], 
//     requiredStudentFields: COMMON_PROFILE_FIELD_KEYS, 
//     documents: [], 
//     applicationDeadline: '', 
//     negativeList: []
//   };

//   const [newJob, setNewJob] = useState<Partial<Job>>(initialFormState);
//   const [excludedInput, setExcludedInput] = useState('');

//   // ═══════════════════════════════════════════════════════════════════════════
//   // FETCH BRANCHES FROM COLLEGE API
//   // ═══════════════════════════════════════════════════════════════════════════
//   useEffect(() => {
//     const fetchBranches = async () => {
//       if (!user?.collegeId) return;
      
//       setLoadingBranches(true);
//       try {
//         const branches = await CollegeService.getBranches(user.collegeId);
//         setCollegeBranches(branches);
//       } catch (err) {
//         console.error('[JobWizard] Failed to fetch branches:', err);
//         // Fallback to common branches
//         setCollegeBranches([
//           { code: 'CSE', name: 'Computer Science and Engineering' },
//           { code: 'ECE', name: 'Electronics and Communication Engineering' },
//           { code: 'EEE', name: 'Electrical and Electronics Engineering' },
//           { code: 'MECH', name: 'Mechanical Engineering' },
//           { code: 'CIVIL', name: 'Civil Engineering' },
//           { code: 'IT', name: 'Information Technology' }
//         ]);
//       } finally {
//         setLoadingBranches(false);
//       }
//     };

//     if (isOpen) {
//       fetchBranches();
//     }
//   }, [isOpen, user?.collegeId]);

//   useEffect(() => {
//     if (isOpen) {
//       if (isEditing && initialData) {
//         // When editing, reconstruct eligibility object from flat fields
//         const reconstructedJob = {
//           ...initialData,
//           eligibility: {
//             minCGPA: initialData.minUgScore || 0,
//             formatUG: initialData.formatUg || 'Percentage',
//             min10th: initialData.min10thScore || 60,
//             format10th: initialData.format10th || 'Percentage',
//             min12th: initialData.min12thScore || 60,
//             format12th: initialData.format12th || 'Percentage',
//             minDiploma: initialData.minDiplomaScore || 60,
//             formatDiploma: initialData.formatDiploma || 'Percentage',
//             maxBacklogs: initialData.maxBacklogs || 0,
//             allowedBranches: typeof initialData.allowedBranches === 'string' 
//               ? JSON.parse(initialData.allowedBranches) 
//               : (initialData.allowedBranches || []),
//             eligibleBatches: typeof initialData.eligibleBatches === 'string'
//               ? JSON.parse(initialData.eligibleBatches)
//               : (initialData.eligibleBatches || [currentYear]),
//             batch: currentYear,
//             isDiplomaEligible: initialData.isDiplomaEligible || false,
//             educationalGapsAllowed: initialData.allowGaps || false,
//             maxGapYears: initialData.maxGapYears || 0
//           }
//         };
//         setNewJob(reconstructedJob);
//         setExcludedInput(initialData.negativeList?.join('\n') || '');
//         setJdFiles([]);
//         setAvoidListFile(null);
//       } else {
//         setNewJob(JSON.parse(JSON.stringify(initialFormState)));
//         setExcludedInput('');
//         setJdFiles([]);
//         setAvoidListFile(null);
//       }
//       setStep(1);
//       setFormErrors({});
//     }
//   }, [isOpen, isEditing, initialData]);

//   if (!isOpen) return null;

//   const handleArrayChange = (field: 'responsibilities' | 'qualifications' | 'benefits' | 'preferredQualifications', index: number, value: string) => {
//     const list = [...(newJob[field] || [])];
//     list[index] = value;
//     setNewJob({ ...newJob, [field]: list });
//   };

//   const addArrayItem = (field: 'responsibilities' | 'qualifications' | 'benefits' | 'preferredQualifications') => {
//     setNewJob({ ...newJob, [field]: [...(newJob[field] || []), ''] });
//   };

//   const removeArrayItem = (field: 'responsibilities' | 'qualifications' | 'benefits' | 'preferredQualifications', index: number) => {
//     const list = [...(newJob[field] || [])];
//     if (list.length > 1) {
//         list.splice(index, 1);
//         setNewJob({ ...newJob, [field]: list });
//     }
//   };

//   const validateStep = () => {
//       const errors: Record<string, boolean> = {};
//       if (step === 1) {
//         if (!newJob.title) errors.title = true;
//         if (!newJob.company) errors.company = true;
//         if (!newJob.location) errors.location = true;
//         if (!newJob.summary) errors.summary = true;
//       }
//       if (step === 4 && !newJob.applicationDeadline) errors.applicationDeadline = true;
//       setFormErrors(errors);
//       return Object.keys(errors).length === 0;
//   };

//   const handleNext = () => { 
//     if (validateStep()) setStep(s => s + 1); 
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CRITICAL FIX: FLATTEN DATA BEFORE SAVING
//   // ═══════════════════════════════════════════════════════════════════════════
//   const handleFinalSave = () => {
//       const negativeList = excludedInput.split(/[\n,]+/).map(s => s.trim()).filter(s => s);
      
//       // ✅ FLATTEN eligibility object to match backend expectations
//       const flattenedData = {
//           ...newJob,
          
//           // Remove nested eligibility
//           eligibility: undefined,
          
//           // Map to backend field names
//           companyName: newJob.company,
//           jobType: newJob.type,
//           workMode: newJob.workArrangement,
          
//           // Flatten eligibility fields to root level
//           minUgScore: newJob.eligibility?.minCGPA,
//           formatUg: newJob.eligibility?.formatUG || 'Percentage',
          
//           min10thScore: newJob.eligibility?.min10th,
//           format10th: newJob.eligibility?.format10th || 'Percentage',
          
//           min12thScore: newJob.eligibility?.min12th,
//           format12th: newJob.eligibility?.format12th || 'Percentage',
          
//           minDiplomaScore: newJob.eligibility?.minDiploma,
//           formatDiploma: newJob.eligibility?.formatDiploma || 'Percentage',
          
//           maxBacklogs: newJob.eligibility?.maxBacklogs || 0,
//           allowGaps: newJob.eligibility?.educationalGapsAllowed || false,
//           maxGapYears: newJob.eligibility?.maxGapYears || 0,
//           isDiplomaEligible: newJob.eligibility?.isDiplomaEligible || false,
          
//           allowedBranches: newJob.eligibility?.allowedBranches || [],
//           eligibleBatches: newJob.eligibility?.eligibleBatches || [currentYear],
          
//           negativeList
//       };
      
//       console.log('[JobWizard] Flattened data being sent:', flattenedData);
//       onSave(flattenedData, jdFiles, avoidListFile || undefined);
//   };

//   const handleJDFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//         const file = e.target.files[0];
//         setJdFiles(prev => [...prev, file]);
//         const placeholder = { name: file.name, url: '' };
//         setNewJob({ ...newJob, documents: [...(newJob.documents || []), placeholder] });
//     }
//   };

//   const handleAvoidListUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//         setAvoidListFile(e.target.files[0]);
//         alert(`Avoid list file "${e.target.files[0].name}" attached.`);
//     }
//   };

//   const removeJDFile = (index: number) => {
//       setJdFiles(prev => prev.filter((_, i) => i !== index));
//       setNewJob({ ...newJob, documents: newJob.documents?.filter((_, i) => i !== index) });
//   };

//   const filteredBranches = collegeBranches.filter(b => 
//     b.code.toLowerCase().includes(branchSearch.toLowerCase()) ||
//     b.name.toLowerCase().includes(branchSearch.toLowerCase())
//   );

//   const toggleBranch = (code: string) => {
//       const current = newJob.eligibility?.allowedBranches || [];
//       const updated = current.includes(code) 
//         ? current.filter(c => c !== code) 
//         : [...current, code];
//       setNewJob({
//         ...newJob, 
//         eligibility: {
//           ...newJob.eligibility!, 
//           allowedBranches: updated
//         }
//       });
//   };

//   const toggleBatch = (year: number) => {
//       const current = newJob.eligibility?.eligibleBatches || [];
//       const updated = current.includes(year)
//         ? current.filter(y => y !== year)
//         : [...current, year];
//       setNewJob({
//         ...newJob,
//         eligibility: {
//           ...newJob.eligibility!,
//           eligibleBatches: updated
//         }
//       });
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
//         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">
//             {/* Header */}
//             <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
//                 <div>
//                     <h2 className="text-2xl font-bold text-gray-800">
//                         {isEditing ? 'Edit Job Posting' : 'Create New Job Opportunity'}
//                     </h2>
//                     <div className="flex items-center gap-2 mt-2">
//                         {[1, 2, 3, 4, 5].map(s => (
//                             <div key={s} className="flex flex-col items-center gap-1">
//                                 <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
//                                   step >= s ? 'bg-blue-600' : 'bg-gray-200'
//                                 }`}></div>
//                             </div>
//                         ))}
//                         <span className="text-xs font-bold text-blue-600 ml-2 uppercase tracking-wider">
//                           Step {step} of 5
//                         </span>
//                     </div>
//                 </div>
//                 <button 
//                   onClick={onClose} 
//                   className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
//                 >
//                   <X size={24} />
//                 </button>
//             </div>
            
//             <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
//                 {step === 1 && (
//                     <div className="space-y-8 animate-in slide-in-from-right-4">
//                         <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2">
//                           <Briefcase size={20} className="text-blue-600"/> 
//                           1. Position & Role Basics
//                         </h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div className="col-span-2">
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
//                                   Job Title *
//                                 </label>
//                                 <input 
//                                   className={`w-full p-3 border rounded-xl bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${
//                                     formErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-200'
//                                   }`} 
//                                   value={newJob.title} 
//                                   onChange={e => setNewJob({...newJob, title: e.target.value})} 
//                                   placeholder="e.g. Senior Software Engineer" 
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
//                                   Company Name *
//                                 </label>
//                                 <input 
//                                   className={`w-full p-3 border rounded-xl bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${
//                                     formErrors.company ? 'border-red-500 bg-red-50' : 'border-gray-200'
//                                   }`} 
//                                   value={newJob.company} 
//                                   onChange={e => setNewJob({...newJob, company: e.target.value})} 
//                                   placeholder="e.g. Google" 
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
//                                   Hiring Department
//                                 </label>
//                                 <input 
//                                   className="w-full p-3 border rounded-xl border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" 
//                                   value={newJob.hiringDepartment || ''} 
//                                   onChange={e => setNewJob({...newJob, hiringDepartment: e.target.value})} 
//                                   placeholder="e.g. Cloud Infrastructure" 
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
//                                   Job Type *
//                                 </label>
//                                 <select 
//                                   className="w-full p-3 border rounded-xl border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 font-medium" 
//                                   value={newJob.type} 
//                                   onChange={e => setNewJob({...newJob, type: e.target.value as any})}
//                                 >
//                                     <option>Full-Time</option>
//                                     <option>Internship</option>
//                                     <option>Contract</option>
//                                     <option>Part-Time</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
//                                   Work Arrangement
//                                 </label>
//                                 <select 
//                                   className="w-full p-3 border rounded-xl border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 font-medium" 
//                                   value={newJob.workArrangement} 
//                                   onChange={e => setNewJob({...newJob, workArrangement: e.target.value as any})}
//                                 >
//                                     <option>On-site</option>
//                                     <option>Remote</option>
//                                     <option>Hybrid</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
//                                   Location *
//                                 </label>
//                                 <input 
//                                   className={`w-full p-3 border rounded-xl bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${
//                                     formErrors.location ? 'border-red-500 bg-red-50' : 'border-gray-200'
//                                   }`} 
//                                   value={newJob.location} 
//                                   onChange={e => setNewJob({...newJob, location: e.target.value})} 
//                                   placeholder="e.g. Hyderabad, TS" 
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
//                                   Salary Package (LPA)
//                                 </label>
//                                 <input 
//                                   className="w-full p-3 border rounded-xl border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" 
//                                   value={newJob.salaryRange || ''} 
//                                   onChange={e => setNewJob({...newJob, salaryRange: e.target.value})} 
//                                   placeholder="e.g. 6.5 - 12.0 LPA" 
//                                 />
//                             </div>
//                             <div className="col-span-2">
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
//                                   Job Summary *
//                                 </label>
//                                 <textarea 
//                                   className={`w-full p-3 border rounded-xl bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 min-h-[120px] ${
//                                     formErrors.summary ? 'border-red-500 bg-red-50' : 'border-gray-200'
//                                   }`} 
//                                   value={newJob.summary} 
//                                   onChange={e => setNewJob({...newJob, summary: e.target.value})} 
//                                   placeholder="Provide a brief overview of the role..." 
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {step === 2 && (
//                     <div className="space-y-8 animate-in slide-in-from-right-4">
//                         <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2">
//                           <Star size={20} className="text-blue-600"/> 
//                           2. Responsibilities & Description
//                         </h3>
                        
//                         <div className="space-y-4">
//                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
//                               Key Responsibilities
//                             </label>
//                             {newJob.responsibilities?.map((res, i) => (
//                                 <div key={i} className="flex gap-2 group">
//                                     <input 
//                                       className="flex-1 p-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" 
//                                       value={res} 
//                                       onChange={e => handleArrayChange('responsibilities', i, e.target.value)} 
//                                       placeholder="Enter a responsibility point..." 
//                                     />
//                                     <button 
//                                       onClick={() => removeArrayItem('responsibilities', i)} 
//                                       className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
//                                     >
//                                       <Trash2 size={18}/>
//                                     </button>
//                                 </div>
//                             ))}
//                             <button 
//                               onClick={() => addArrayItem('responsibilities')} 
//                               className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors border border-dashed border-blue-200"
//                             >
//                               <Plus size={16}/> Add Point
//                             </button>
//                         </div>

//                         <div className="space-y-4">
//                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
//                               Required Qualifications
//                             </label>
//                             {newJob.qualifications?.map((q, i) => (
//                                 <div key={i} className="flex gap-2 group">
//                                     <input 
//                                       className="flex-1 p-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" 
//                                       value={q} 
//                                       onChange={e => handleArrayChange('qualifications', i, e.target.value)} 
//                                       placeholder="e.g. B.Tech in CSE/IT" 
//                                     />
//                                     <button 
//                                       onClick={() => removeArrayItem('qualifications', i)} 
//                                       className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
//                                     >
//                                       <Trash2 size={18}/>
//                                     </button>
//                                 </div>
//                             ))}
//                             <button 
//                               onClick={() => addArrayItem('qualifications')} 
//                               className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors border border-dashed border-blue-200"
//                             >
//                               <Plus size={16}/> Add Qualification
//                             </button>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
//                             <div className="col-span-2">
//                               <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
//                                 Extended Details
//                               </h4>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
//                                   <Heart size={14} className="text-pink-500"/> Company Culture
//                                 </label>
//                                 <textarea 
//                                   className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 text-sm min-h-[100px]" 
//                                   value={newJob.companyCulture || ''} 
//                                   onChange={e => setNewJob({...newJob, companyCulture: e.target.value})} 
//                                   placeholder="Describe the working environment..." 
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
//                                   <Info size={14} className="text-blue-500"/> Physical Demands
//                                 </label>
//                                 <textarea 
//                                   className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 text-sm min-h-[100px]" 
//                                   value={newJob.physicalDemands || ''} 
//                                   onChange={e => setNewJob({...newJob, physicalDemands: e.target.value})} 
//                                   placeholder="Any specific physical requirements?" 
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {step === 3 && (
//                     <div className="space-y-8 animate-in slide-in-from-right-4">
//                         <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2">
//                           <Shield size={20} className="text-indigo-600"/> 
//                           3. Eligibility & Branch Criteria
//                         </h3>
                        
//                         {/* Searchable Branches */}
//                         <div className="space-y-4">
//                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
//                               Allowed Branches {loadingBranches && '(Loading...)'}
//                             </label>
//                             <div className="relative group">
//                                 <Search 
//                                   className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" 
//                                   size={18} 
//                                 />
//                                 <input 
//                                     className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
//                                     placeholder="Search branches by code or name..." 
//                                     value={branchSearch}
//                                     onChange={e => setBranchSearch(e.target.value)}
//                                 />
//                                 {branchSearch && (
//                                     <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto animate-in slide-in-from-top-2">
//                                         {filteredBranches.length > 0 ? filteredBranches.map(b => (
//                                             <button 
//                                                 key={b.code} 
//                                                 type="button"
//                                                 onClick={() => { toggleBranch(b.code); setBranchSearch(''); }}
//                                                 className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex justify-between items-center border-b border-gray-100 last:border-0"
//                                             >
//                                                 <div>
//                                                   <span className="font-bold text-gray-900">{b.code}</span>
//                                                   <span className="text-xs text-gray-500 ml-2">{b.name}</span>
//                                                 </div>
//                                                 {newJob.eligibility?.allowedBranches.includes(b.code) && (
//                                                   <CheckCircle size={16} className="text-blue-600"/>
//                                                 )}
//                                             </button>
//                                         )) : (
//                                           <div className="p-4 text-center text-gray-400 text-sm">
//                                             No branches matching your search
//                                           </div>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                             <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-200 min-h-[60px]">
//                                 {newJob.eligibility?.allowedBranches.length === 0 ? (
//                                     <span className="text-xs text-gray-400 italic font-medium">
//                                       No branches selected. All students will be ineligible by default.
//                                     </span>
//                                 ) : (
//                                     newJob.eligibility?.allowedBranches.map(code => {
//                                       const branch = collegeBranches.find(b => b.code === code);
//                                       return (
//                                         <span 
//                                           key={code} 
//                                           className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
//                                         >
//                                             {branch?.code || code}
//                                             <button onClick={() => toggleBranch(code)}>
//                                               <X size={14}/>
//                                             </button>
//                                         </span>
//                                       );
//                                     })
//                                 )}
//                             </div>
//                         </div>

//                         {/* 11-Year Batch Selector */}
//                         <div className="space-y-4">
//                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
//                               Eligible Batches (Select Multiple)
//                             </label>
//                             <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
//                                 {AVAILABLE_BATCHES.map(year => {
//                                   const isSelected = newJob.eligibility?.eligibleBatches?.includes(year);
//                                   const isCurrent = year === currentYear;
//                                   return (
//                                     <button
//                                       key={year}
//                                       type="button"
//                                       onClick={() => toggleBatch(year)}
//                                       className={`p-3 rounded-xl font-bold text-sm transition-all border-2 ${
//                                         isSelected
//                                           ? 'bg-blue-600 text-white border-blue-600 shadow-md'
//                                           : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
//                                       } ${isCurrent ? 'ring-2 ring-green-400' : ''}`}
//                                     >
//                                       {year}
//                                       {isCurrent && <span className="block text-[10px]">Current</span>}
//                                     </button>
//                                   );
//                                 })}
//                             </div>
//                             <p className="text-xs text-gray-500">
//                               Selected: {newJob.eligibility?.eligibleBatches?.length || 0} batch(es)
//                             </p>
//                         </div>

//                         {/* Academic Cutoffs */}
//                         <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-6">
//                             <h4 className="font-bold text-blue-900 text-sm uppercase tracking-widest flex items-center gap-2">
//                               <GraduationCap size={18}/> Academic Performance Cutoffs
//                             </h4>
                            
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                                 {/* UG Cutoff */}
//                                 <div className="space-y-2">
//                                     <label className="block text-[10px] font-bold text-blue-800 uppercase">
//                                       Undergraduate (B.Tech) *
//                                     </label>
//                                     <div className="flex gap-2">
//                                         <select 
//                                             className="w-32 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
//                                             value={newJob.eligibility?.formatUG || 'Percentage'}
//                                             onChange={e => setNewJob({
//                                               ...newJob, 
//                                               eligibility: {
//                                                 ...newJob.eligibility!, 
//                                                 formatUG: e.target.value as any
//                                               }
//                                             })}
//                                         >
//                                             <option value="CGPA">CGPA</option>
//                                             <option value="Percentage">Percentage</option>
//                                             <option value="Marks">Total Marks</option>
//                                         </select>
//                                         <input 
//                                           type="number" 
//                                           step="0.01" 
//                                           className="flex-1 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-400" 
//                                           value={newJob.eligibility?.minCGPA} 
//                                           onChange={e => setNewJob({
//                                             ...newJob, 
//                                             eligibility: {
//                                               ...newJob.eligibility!, 
//                                               minCGPA: parseFloat(e.target.value)
//                                             }
//                                           })} 
//                                           placeholder="Value" 
//                                         />
//                                     </div>
//                                 </div>

//                                 {/* 10th Cutoff */}
//                                 <div className="space-y-2">
//                                     <label className="block text-[10px] font-bold text-blue-800 uppercase">
//                                       Class 10th (SSC) *
//                                     </label>
//                                     <div className="flex gap-2">
//                                         <select 
//                                             className="w-32 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
//                                             value={newJob.eligibility?.format10th}
//                                             onChange={e => setNewJob({
//                                               ...newJob, 
//                                               eligibility: {
//                                                 ...newJob.eligibility!, 
//                                                 format10th: e.target.value as any
//                                               }
//                                             })}
//                                         >
//                                             <option value="Percentage">Percentage</option>
//                                             <option value="CGPA">CGPA</option>
//                                             <option value="Marks">Total Marks</option>
//                                         </select>
//                                         <input 
//                                           type="number" 
//                                           step="0.01" 
//                                           className="flex-1 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-400" 
//                                           value={newJob.eligibility?.min10th} 
//                                           onChange={e => setNewJob({
//                                             ...newJob, 
//                                             eligibility: {
//                                               ...newJob.eligibility!, 
//                                               min10th: parseFloat(e.target.value)
//                                             }
//                                           })} 
//                                           placeholder="Value" 
//                                         />
//                                     </div>
//                                 </div>

//                                 {/* 12th Cutoff */}
//                                 <div className="space-y-2">
//                                     <label className="block text-[10px] font-bold text-blue-800 uppercase">
//                                       Class 12th (Inter) *
//                                     </label>
//                                     <div className="flex gap-2">
//                                         <select 
//                                             className="w-32 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
//                                             value={newJob.eligibility?.format12th}
//                                             onChange={e => setNewJob({
//                                               ...newJob, 
//                                               eligibility: {
//                                                 ...newJob.eligibility!, 
//                                                 format12th: e.target.value as any
//                                               }
//                                             })}
//                                         >
//                                             <option value="Percentage">Percentage</option>
//                                             <option value="CGPA">CGPA</option>
//                                             <option value="Marks">Total Marks</option>
//                                         </select>
//                                         <input 
//                                           type="number" 
//                                           step="0.01" 
//                                           className="flex-1 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-400" 
//                                           value={newJob.eligibility?.min12th} 
//                                           onChange={e => setNewJob({
//                                             ...newJob, 
//                                             eligibility: {
//                                               ...newJob.eligibility!, 
//                                               min12th: parseFloat(e.target.value)
//                                             }
//                                           })} 
//                                           placeholder="Value" 
//                                         />
//                                     </div>
//                                 </div>

//                                 {/* Diploma Cutoff */}
//                                 <div className="space-y-2">
//                                     <label className="block text-[10px] font-bold text-blue-800 uppercase">
//                                       Diploma (Lateral)
//                                     </label>
//                                     <div className="flex gap-2">
//                                         <select 
//                                             className="w-32 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
//                                             value={newJob.eligibility?.formatDiploma}
//                                             onChange={e => setNewJob({
//                                               ...newJob, 
//                                               eligibility: {
//                                                 ...newJob.eligibility!, 
//                                                 formatDiploma: e.target.value as any
//                                               }
//                                             })}
//                                         >
//                                             <option value="Percentage">Percentage</option>
//                                             <option value="CGPA">CGPA</option>
//                                             <option value="Marks">Total Marks</option>
//                                         </select>
//                                         <input 
//                                           type="number" 
//                                           step="0.01" 
//                                           className="flex-1 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-400" 
//                                           value={newJob.eligibility?.minDiploma} 
//                                           onChange={e => setNewJob({
//                                             ...newJob, 
//                                             eligibility: {
//                                               ...newJob.eligibility!, 
//                                               minDiploma: parseFloat(e.target.value)
//                                             }
//                                           })} 
//                                           placeholder="Value" 
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                             <div className="space-y-1.5">
//                                 <label className="block text-xs font-bold text-gray-500 uppercase">
//                                   Maximum Allowed Backlogs
//                                 </label>
//                                 <input 
//                                   type="number" 
//                                   className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-100" 
//                                   value={newJob.eligibility?.maxBacklogs} 
//                                   onChange={e => setNewJob({
//                                     ...newJob, 
//                                     eligibility: {
//                                       ...newJob.eligibility!, 
//                                       maxBacklogs: parseInt(e.target.value)
//                                     }
//                                   })} 
//                                 />
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="block text-xs font-bold text-gray-500 uppercase">
//                                   Educational Gaps Allowed?
//                                 </label>
//                                 <select
//                                   className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-100"
//                                   value={newJob.eligibility?.educationalGapsAllowed ? 'yes' : 'no'}
//                                   onChange={e => setNewJob({
//                                     ...newJob,
//                                     eligibility: {
//                                       ...newJob.eligibility!,
//                                       educationalGapsAllowed: e.target.value === 'yes'
//                                     }
//                                   })}
//                                 >
//                                   <option value="no">No</option>
//                                   <option value="yes">Yes</option>
//                                 </select>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {step === 4 && (
//                     <div className="space-y-8 animate-in slide-in-from-right-4">
//                         <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2">
//                           <CheckCircle size={20} className="text-green-600"/> 
//                           4. Timeline & Selection
//                         </h3>
                        
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                             <div className="space-y-1.5">
//                                 <label className="block text-xs font-bold text-gray-500 uppercase">
//                                   Application Deadline *
//                                 </label>
//                                 <input 
//                                   type="date" 
//                                   className={`w-full p-3 border rounded-xl bg-white font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${
//                                     formErrors.applicationDeadline ? 'border-red-500 bg-red-50' : 'border-gray-200'
//                                   }`} 
//                                   value={newJob.applicationDeadline} 
//                                   onChange={e => setNewJob({...newJob, applicationDeadline: e.target.value})} 
//                                 />
//                                 <p className="text-[10px] text-gray-400">
//                                   Applications will auto-close after this date.
//                                 </p>
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="block text-xs font-bold text-gray-500 uppercase">
//                                   External Link (Optional)
//                                 </label>
//                                 <input 
//                                   className="w-full p-3 border rounded-xl border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" 
//                                   value={newJob.externalLink || ''} 
//                                   onChange={e => setNewJob({...newJob, externalLink: e.target.value})} 
//                                   placeholder="https://..." 
//                                 />
//                                 <p className="text-[10px] text-gray-400">
//                                   Direct students to company career portal.
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
//                             <div className="flex justify-between items-center mb-6">
//                                 <div>
//                                     <h4 className="font-bold text-gray-800">Selection Rounds</h4>
//                                     <p className="text-xs text-gray-500">
//                                       Add dates for the upcoming drive stages.
//                                     </p>
//                                 </div>
//                                 <button 
//                                   onClick={() => setNewJob({
//                                     ...newJob, 
//                                     rounds: [
//                                       ...(newJob.rounds || []), 
//                                       {name:'', date:'', status:'Pending'}
//                                     ]
//                                   })} 
//                                   className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
//                                 >
//                                   <Plus size={14}/> Add Round
//                                 </button>
//                             </div>
//                             <div className="space-y-3">
//                                 {newJob.rounds?.map((r, i) => (
//                                     <div key={i} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-top-2">
//                                         <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
//                                           {i+1}
//                                         </span>
//                                         <input 
//                                           className="flex-1 p-2.5 border-b border-transparent hover:border-gray-200 focus:border-blue-500 outline-none bg-transparent font-bold text-gray-800" 
//                                           placeholder="e.g. Technical Interview" 
//                                           value={r.name} 
//                                           onChange={(e) => {
//                                             const rs = [...(newJob.rounds || [])];
//                                             rs[i].name = e.target.value;
//                                             setNewJob({...newJob, rounds: rs});
//                                           }}
//                                         />
//                                         <input 
//                                           type="date" 
//                                           className="w-40 p-2 border rounded-lg bg-gray-50 text-sm font-medium" 
//                                           value={r.date} 
//                                           onChange={(e) => {
//                                             const rs = [...(newJob.rounds || [])];
//                                             rs[i].date = e.target.value;
//                                             setNewJob({...newJob, rounds: rs});
//                                           }}
//                                         />
//                                         <button 
//                                           onClick={() => setNewJob({
//                                             ...newJob, 
//                                             rounds: newJob.rounds?.filter((_, idx) => idx !== i)
//                                           })} 
//                                           className="text-gray-300 hover:text-red-500 p-2 transition-colors"
//                                         >
//                                           <Trash2 size={18}/>
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
//                             <label className="block text-xs font-bold text-indigo-900 uppercase mb-3">
//                               JD & Policy Attachments
//                             </label>
//                             <div className="flex flex-wrap gap-4">
//                                 {jdFiles.map((file, i) => (
//                                     <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border shadow-sm text-xs font-bold text-blue-700">
//                                         <FileText size={14}/> 
//                                         <span className="max-w-[120px] truncate">{file.name}</span>
//                                         <button onClick={() => removeJDFile(i)} className="text-red-400 hover:text-red-600">
//                                           <X size={14}/>
//                                         </button>
//                                     </div>
//                                 ))}
//                                 <button 
//                                   onClick={() => jobDocInputRef.current?.click()} 
//                                   className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-indigo-200 rounded-2xl bg-white hover:bg-indigo-50 transition-all text-indigo-400 hover:text-indigo-600 group"
//                                 >
//                                     {isUploading ? (
//                                       <Loader2 size={24} className="animate-spin" />
//                                     ) : (
//                                       <UploadCloud size={24} className="group-hover:scale-110 transition-transform"/>
//                                     )}
//                                     <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
//                                       {isUploading ? '...' : 'Upload'}
//                                     </span>
//                                     <input 
//                                       type="file" 
//                                       multiple 
//                                       className="hidden" 
//                                       ref={jobDocInputRef} 
//                                       onChange={handleJDFileAdd} 
//                                     />
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {step === 5 && (
//                     <div className="space-y-8 animate-in slide-in-from-right-4">
//                         <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2">
//                           <Users size={20} className="text-blue-600"/> 
//                           5. Data Extraction & Negative List
//                         </h3>
                        
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                             <FieldSelector 
//                                 selectedFields={newJob.requiredStudentFields || []} 
//                                 onToggle={(v) => setNewJob({
//                                   ...newJob, 
//                                   requiredStudentFields: newJob.requiredStudentFields?.includes(v) 
//                                     ? newJob.requiredStudentFields.filter(x => x !== v) 
//                                     : [...(newJob.requiredStudentFields || []), v]
//                                 })} 
//                                 options={ALL_PROFILE_FIELDS} 
//                                 commonIds={COMMON_PROFILE_FIELD_KEYS} 
//                                 colorTheme="blue"
//                                 labels={{ 
//                                     title: 'Required Profile Data', 
//                                     description: 'Select which student profile fields should be exported to the applicant sheet.',
//                                     searchPlaceholder: 'Search fields...'
//                                 }} 
//                             />

//                             <div className="space-y-6">
//                                 <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col">
//                                     <div className="flex items-center gap-2 mb-3">
//                                         <Ban size={20} className="text-red-600"/>
//                                         <h4 className="font-bold text-red-900 text-sm uppercase">
//                                           Negative List (Excluded Students)
//                                         </h4>
//                                     </div>
//                                     <p className="text-xs text-red-700 leading-relaxed mb-4">
//                                       Paste Roll Numbers of students who are strictly prohibited from applying. 
//                                       Use comma or new lines.
//                                     </p>
//                                     <textarea 
//                                         className="flex-1 w-full p-4 border border-red-200 rounded-xl bg-white text-gray-900 font-mono text-xs focus:ring-2 focus:ring-red-300 outline-none min-h-[150px]"
//                                         placeholder={`20701A0501\n20701A0588\n...`}
//                                         value={excludedInput}
//                                         onChange={e => setExcludedInput(e.target.value)}
//                                     />
//                                     <p className="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-wider">
//                                       Identified {excludedInput.split(/[\n,]+/).filter(x => x.trim()).length} students for exclusion.
//                                     </p>
//                                 </div>

//                                 <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
//                                     <label className="block text-xs font-bold text-yellow-900 uppercase mb-3">
//                                       Or Upload Avoid List (Excel/CSV)
//                                     </label>
//                                     <p className="text-xs text-yellow-700 mb-3">
//                                       Upload an Excel/CSV with roll numbers to exclude.
//                                     </p>
//                                     <button 
//                                         onClick={() => avoidListInputRef.current?.click()} 
//                                         className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 text-yellow-900 rounded-xl font-bold text-sm transition-all"
//                                     >
//                                         <UploadCloud size={18}/> 
//                                         {avoidListFile ? avoidListFile.name : 'Upload File'}
//                                     </button>
//                                     <input 
//                                       type="file" 
//                                       className="hidden" 
//                                       ref={avoidListInputRef} 
//                                       accept=".csv,.xlsx,.xls" 
//                                       onChange={handleAvoidListUpload} 
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl flex gap-4">
//                             <Info size={24} className="text-yellow-600 shrink-0"/>
//                             <div>
//                                 <h4 className="font-bold text-yellow-900 text-sm">Review & Finalize</h4>
//                                 <p className="text-xs text-yellow-700 leading-relaxed mt-1">
//                                   Once you post this job, all eligible students in the target branches will receive a notification.
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Footer Actions */}
//             <div className="p-6 border-t bg-gray-50 flex justify-between items-center shrink-0">
//                 {step > 1 ? (
//                     <button 
//                       onClick={() => setStep(s => s - 1)} 
//                       className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 flex items-center gap-2 transition-all shadow-sm"
//                     >
//                         <ChevronLeft size={18} /> Previous
//                     </button>
//                 ) : <div/>}
                
//                 <div className="flex gap-4">
//                     {step < 5 ? (
//                         <button 
//                           onClick={handleNext} 
//                           className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
//                         >
//                             Next <ChevronRight size={18} />
//                         </button>
//                     ) : (
//                         <button 
//                           onClick={handleFinalSave} 
//                           className="px-10 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2 transition-all active:scale-95"
//                         >
//                             <CheckCircle size={20} /> 
//                             {isEditing ? 'Update Opportunity' : 'Launch Opportunity'}
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     </div>
//   );
// };

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Trash2, FileText, Search,
  ChevronLeft, ChevronRight,
  CheckCircle, UploadCloud, Loader2,
  Briefcase, Plus,
  Info, Star, Users, Heart, Shield, Ban, GraduationCap
} from 'lucide-react';
import { Job, User, JobFormState } from '../../../../types';
import { JobService } from '../../../../services/jobService';
import { COMMON_PROFILE_FIELD_KEYS, ALL_PROFILE_FIELDS } from '../../../../constants';
import { FieldSelector } from '../../shared/FieldSelector';

interface JobWizardProps {
  isOpen:      boolean;
  isEditing:   boolean;
  initialData?: Job | null;
  user?:        User;
  onClose:     () => void;
  onSave:      (formData: Partial<JobFormState>, jdFiles: File[], avoidList?: File) => void;
}

// ── Batch years: current year ±5 (11 total) ─────────────────────────────────
const CURRENT_YEAR   = new Date().getFullYear();
const AVAILABLE_BATCHES: number[] = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - 5 + i);

// ── Default empty eligibility ────────────────────────────────────────────────
const defaultEligibility = (): JobFormState['eligibility'] => ({
  minCGPA:                0,
  formatUG:               'Percentage',
  min10th:                60,
  format10th:             'Percentage',
  min12th:                60,
  format12th:             'Percentage',
  minDiploma:             60,
  formatDiploma:          'Percentage',
  maxBacklogs:            0,
  allowedBranches:        [],
  eligibleBatches:        [CURRENT_YEAR],
  isDiplomaEligible:      false,
  educationalGapsAllowed: false,
  maxGapYears:            0,
});

const defaultForm = (): Partial<JobFormState> => ({
  title:               '',
  company:             '',
  hiringDepartment:    '',
  type:                'Full-Time',
  workArrangement:     'On-Site',
  location:            '',
  salaryRange:         '',
  summary:             '',
  internalId:          '',
  externalLink:        '',
  companyCulture:      '',
  physicalDemands:     '',
  eeoStatement:        '',
  applicationDeadline: '',
  status:              'Active',

  responsibilitiesJson:        [''],
  qualificationsJson:          [''],
  preferredQualificationsJson: [''],
  benefitsJson:                [''],

  eligibility:          defaultEligibility(),
  rounds:               [{ name: 'Online Assessment', date: '', status: 'Pending' }],
  requiredStudentFields:COMMON_PROFILE_FIELD_KEYS,
  documents:            [],
  negativeList:         [],
});

export const JobWizard: React.FC<JobWizardProps> = ({
  isOpen, isEditing, initialData, user, onClose, onSave
}) => {
  const [step,         setStep]         = useState(1);
  const [formErrors,   setFormErrors]   = useState<Record<string, boolean>>({});
  const [isUploading,  setIsUploading]  = useState(false);
  const [branchSearch, setBranchSearch] = useState('');
  const [isSaving,     setIsSaving]     = useState(false);

  const jobDocInputRef   = useRef<HTMLInputElement>(null);
  const avoidListInputRef = useRef<HTMLInputElement>(null);

  // Branch data from API
  const [collegeBranches, setCollegeBranches] = useState<{ code: string; name: string }[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Files
  const [jdFiles,       setJdFiles]       = useState<File[]>([]);
  const [avoidListFile, setAvoidListFile] = useState<File | null>(null);

  // Form
  const [form,          setForm]          = useState<Partial<JobFormState>>(defaultForm());
  const [excludedInput, setExcludedInput] = useState('');

  // ── Fetch college branches ───────────────────────────────────────────────

  const fetchBranches = useCallback(async () => {
    if (!user?.collegeId) return;
    setLoadingBranches(true);
    try {
      const branches = await JobService.getBranchesForCollege(user.collegeId);
      setCollegeBranches(branches);
    } catch {
      // Fallback
      setCollegeBranches([
        { code: 'CSE',   name: 'Computer Science and Engineering' },
        { code: 'ECE',   name: 'Electronics and Communication Engineering' },
        { code: 'EEE',   name: 'Electrical and Electronics Engineering' },
        { code: 'MECH',  name: 'Mechanical Engineering' },
        { code: 'CIVIL', name: 'Civil Engineering' },
        { code: 'IT',    name: 'Information Technology' },
      ]);
    } finally {
      setLoadingBranches(false);
    }
  }, [user?.collegeId]);

  useEffect(() => {
    if (isOpen) fetchBranches();
  }, [isOpen, fetchBranches]);

  // ── Populate form when editing ────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && initialData) {
      // Parse arrays from initialData (backend already sends parsed arrays)
      const safeArr = (v: any): string[] =>
        Array.isArray(v) ? v.filter(Boolean) : [];
      const safeNumArr = (v: any): number[] =>
        Array.isArray(v) ? v.map(Number).filter(n => !isNaN(n)) : [CURRENT_YEAR];

      setForm({
        title:               initialData.title || '',
        company:             initialData.companyName || initialData.company || '',
        hiringDepartment:    initialData.hiringDepartment || '',
        // jobType display value → wizard "type"
        type:                initialData.jobType || initialData.type || 'Full-Time',
        // workMode display value → wizard "workArrangement"
        workArrangement:     initialData.workMode || initialData.workArrangement || 'On-Site',
        location:            initialData.location || '',
        salaryRange:         initialData.salaryRange || '',
        summary:             initialData.summary || '',
        internalId:          initialData.internalId || '',
        externalLink:        initialData.externalLink || '',
        companyCulture:      initialData.companyCulture || '',
        physicalDemands:     initialData.physicalDemands || '',
        eeoStatement:        initialData.eeoStatement || '',
        applicationDeadline: initialData.applicationDeadline
          ? String(initialData.applicationDeadline).split('T')[0]
          : '',
        status:              (initialData.status as any) || 'Active',

        // JSON arrays — backend sends these as string[]
        responsibilitiesJson:        safeArr(initialData.responsibilitiesJson).length
          ? safeArr(initialData.responsibilitiesJson) : [''],
        qualificationsJson:          safeArr(initialData.qualificationsJson).length
          ? safeArr(initialData.qualificationsJson) : [''],
        preferredQualificationsJson: safeArr(initialData.preferredQualificationsJson).length
          ? safeArr(initialData.preferredQualificationsJson) : [''],
        benefitsJson:                safeArr(initialData.benefitsJson).length
          ? safeArr(initialData.benefitsJson) : [''],

        // Rebuild eligibility from flat fields (backend stores flat, wizard needs nested)
        eligibility: {
          minCGPA:                Number(initialData.minUgScore  ?? 0),
          formatUG:               initialData.formatUg           || 'Percentage',
          min10th:                Number(initialData.min10thScore ?? 60),
          format10th:             initialData.format10th          || 'Percentage',
          min12th:                Number(initialData.min12thScore ?? 60),
          format12th:             initialData.format12th          || 'Percentage',
          minDiploma:             Number(initialData.minDiplomaScore ?? 60),
          formatDiploma:          initialData.formatDiploma       || 'Percentage',
          maxBacklogs:            Number(initialData.maxBacklogs  ?? 0),
          isDiplomaEligible:      !!initialData.isDiplomaEligible,
          educationalGapsAllowed: !!initialData.allowGaps,
          maxGapYears:            Number(initialData.maxGapYears  ?? 0),
          // allowedBranches: backend sends string[], just use directly
          allowedBranches:        safeArr(initialData.allowedBranches),
          // eligibleBatches: backend sends number[]
          eligibleBatches:        safeNumArr(initialData.eligibleBatches).length
            ? safeNumArr(initialData.eligibleBatches) : [CURRENT_YEAR],
        },

        rounds:               Array.isArray(initialData.rounds) ? initialData.rounds : [],
        requiredStudentFields:safeArr(initialData.requiredStudentFields),
        documents:            Array.isArray(initialData.documents) ? initialData.documents : [],
        negativeList:         safeArr(initialData.negativeList),
        collegeId:            initialData.collegeId,
        postedById:           initialData.postedById,
        avoidListUrl:         initialData.avoidListUrl,
      });
      setExcludedInput(safeArr(initialData.negativeList).join('\n'));
    } else {
      setForm(defaultForm());
      setExcludedInput('');
    }

    setStep(1);
    setFormErrors({});
    setJdFiles([]);
    setAvoidListFile(null);
  }, [isOpen, isEditing, initialData]);

  if (!isOpen) return null;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const updateEligibility = (patch: Partial<JobFormState['eligibility']>) =>
    setForm(f => ({ ...f, eligibility: { ...f.eligibility!, ...patch } }));

  const handleArrayChange = (
    field: keyof Pick<JobFormState, 'responsibilitiesJson' | 'qualificationsJson' | 'benefitsJson' | 'preferredQualificationsJson'>,
    index: number, value: string
  ) => {
    const list = [...((form[field] as string[]) || [])];
    list[index] = value;
    setForm(f => ({ ...f, [field]: list }));
  };

  const addArrayItem = (field: keyof Pick<JobFormState, 'responsibilitiesJson' | 'qualificationsJson' | 'benefitsJson' | 'preferredQualificationsJson'>) =>
    setForm(f => ({ ...f, [field]: [...((f[field] as string[]) || []), ''] }));

  const removeArrayItem = (
    field: keyof Pick<JobFormState, 'responsibilitiesJson' | 'qualificationsJson' | 'benefitsJson' | 'preferredQualificationsJson'>,
    index: number
  ) => {
    const list = [...((form[field] as string[]) || [])];
    if (list.length > 1) { list.splice(index, 1); setForm(f => ({ ...f, [field]: list })); }
  };

  const toggleBranch = (code: string) => {
    const cur = form.eligibility?.allowedBranches || [];
    updateEligibility({
      allowedBranches: cur.includes(code) ? cur.filter(c => c !== code) : [...cur, code]
    });
  };

  const toggleBatch = (year: number) => {
    const cur = form.eligibility?.eligibleBatches || [];
    updateEligibility({
      eligibleBatches: cur.includes(year) ? cur.filter(y => y !== year) : [...cur, year]
    });
  };

  const filteredBranches = collegeBranches.filter(b =>
    b.code.toLowerCase().includes(branchSearch.toLowerCase()) ||
    b.name.toLowerCase().includes(branchSearch.toLowerCase())
  );

  // ── Validation ────────────────────────────────────────────────────────────

  const validateStep = () => {
    const errors: Record<string, boolean> = {};
    if (step === 1) {
      if (!form.title?.trim())    errors.title    = true;
      if (!form.company?.trim())  errors.company  = true;
      if (!form.location?.trim()) errors.location = true;
      if (!form.summary?.trim())  errors.summary  = true;
    }
    if (step === 4 && !form.applicationDeadline) errors.applicationDeadline = true;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleFinalSave = async () => {
    const negativeList = excludedInput
      .split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    setIsSaving(true);
    try {
      await onSave({ ...form, negativeList }, jdFiles, avoidListFile || undefined);
    } finally {
      setIsSaving(false);
    }
  };

  // ── File handlers ─────────────────────────────────────────────────────────

  const handleJDFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setJdFiles(prev => [...prev, file]);
    setForm(f => ({
      ...f,
      documents: [...(f.documents || []), { name: file.name, url: '' }]
    }));
    e.target.value = '';
  };

  const handleAvoidListUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setAvoidListFile(e.target.files[0]); }
  };

  const removeJDFile = (index: number) => {
    setJdFiles(prev => prev.filter((_, i) => i !== index));
    setForm(f => ({ ...f, documents: f.documents?.filter((_, i) => i !== index) }));
  };

  // ── Shared input classes ──────────────────────────────────────────────────

  const inputCls = (err?: boolean) =>
    `w-full p-3 border rounded-xl bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${err ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  const selectCls = 'w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 font-medium';

  const labelCls = 'block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider';

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Edit Job Posting' : 'Create New Job Opportunity'}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {[1,2,3,4,5].map(s => (
                <div key={s} className={`h-1.5 w-14 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />
              ))}
              <span className="text-xs font-bold text-blue-600 ml-2 uppercase tracking-wider">Step {step} of 5</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

          {/* ── STEP 1: Basics ── */}
          {step === 1 && (
            <div className="space-y-8">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" /> 1. Position & Role Basics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className={labelCls}>Job Title *</label>
                  <input className={inputCls(formErrors.title)} value={form.title || ''}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Senior Software Engineer" />
                </div>
                <div>
                  <label className={labelCls}>Company Name *</label>
                  <input className={inputCls(formErrors.company)} value={form.company || ''}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="e.g. Google" />
                </div>
                <div>
                  <label className={labelCls}>Hiring Department</label>
                  <input className={inputCls()} value={form.hiringDepartment || ''}
                    onChange={e => setForm(f => ({ ...f, hiringDepartment: e.target.value }))}
                    placeholder="e.g. Cloud Infrastructure" />
                </div>
                <div>
                  <label className={labelCls}>Job Type *</label>
                  <select className={selectCls} value={form.type || 'Full-Time'}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option>Full-Time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                    <option>Part-Time</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Work Arrangement</label>
                  <select className={selectCls} value={form.workArrangement || 'On-Site'}
                    onChange={e => setForm(f => ({ ...f, workArrangement: e.target.value }))}>
                    <option>On-Site</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Location *</label>
                  <input className={inputCls(formErrors.location)} value={form.location || ''}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Hyderabad, TS" />
                </div>
                <div>
                  <label className={labelCls}>Salary Package (LPA)</label>
                  <input className={inputCls()} value={form.salaryRange || ''}
                    onChange={e => setForm(f => ({ ...f, salaryRange: e.target.value }))}
                    placeholder="e.g. 6.5 – 12 LPA" />
                </div>
                <div>
                  <label className={labelCls}>Internal Job ID</label>
                  <input className={inputCls()} value={form.internalId || ''}
                    onChange={e => setForm(f => ({ ...f, internalId: e.target.value }))}
                    placeholder="Optional internal reference" />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={selectCls} value={form.status || 'Active'}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Job Summary *</label>
                  <textarea className={`${inputCls(formErrors.summary)} min-h-[120px]`}
                    value={form.summary || ''}
                    onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                    placeholder="Provide a brief overview of the role..." />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Responsibilities & Details ── */}
          {step === 2 && (
            <div className="space-y-8">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2">
                <Star size={20} className="text-blue-600" /> 2. Responsibilities & Description
              </h3>

              {([ ['responsibilitiesJson', 'Key Responsibilities', 'Add a responsibility...'],
                   ['qualificationsJson', 'Required Qualifications', 'e.g. B.Tech in CSE/IT'],
                   ['preferredQualificationsJson', 'Preferred Qualifications (Optional)', 'e.g. Experience with cloud platforms'],
                   ['benefitsJson', 'Benefits & Perks (Optional)', 'e.g. Health insurance, ESOPs'],
              ] as const).map(([field, title, placeholder]) => (
                <div key={field} className="space-y-3">
                  <label className={labelCls}>{title}</label>
                  {((form[field] as string[]) || ['']).map((val, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={`${inputCls()} flex-1`} value={val}
                        onChange={e => handleArrayChange(field, i, e.target.value)}
                        placeholder={placeholder} />
                      <button onClick={() => removeArrayItem(field, i)}
                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addArrayItem(field)}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors border border-dashed border-blue-200">
                    <Plus size={16} /> Add
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <label className={`${labelCls} flex items-center gap-1.5`}><Heart size={14} className="text-pink-500" /> Company Culture</label>
                  <textarea className={`${inputCls()} min-h-[100px] text-sm`} value={form.companyCulture || ''}
                    onChange={e => setForm(f => ({ ...f, companyCulture: e.target.value }))}
                    placeholder="Describe the working environment..." />
                </div>
                <div>
                  <label className={`${labelCls} flex items-center gap-1.5`}><Info size={14} className="text-blue-500" /> Physical Demands</label>
                  <textarea className={`${inputCls()} min-h-[100px] text-sm`} value={form.physicalDemands || ''}
                    onChange={e => setForm(f => ({ ...f, physicalDemands: e.target.value }))}
                    placeholder="Any physical requirements?" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>EEO Statement</label>
                  <textarea className={`${inputCls()} min-h-[80px] text-sm`} value={form.eeoStatement || ''}
                    onChange={e => setForm(f => ({ ...f, eeoStatement: e.target.value }))}
                    placeholder="Equal Opportunity Employer statement..." />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Eligibility ── */}
          {step === 3 && (
            <div className="space-y-8">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2">
                <Shield size={20} className="text-indigo-600" /> 3. Eligibility & Branch Criteria
              </h3>

              {/* Branch Search */}
              <div className="space-y-3">
                <label className={labelCls}>
                  Allowed Branches {loadingBranches && <span className="text-blue-400">(Loading...)</span>}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Search branches by code or name..."
                    value={branchSearch}
                    onChange={e => setBranchSearch(e.target.value)} />
                  {branchSearch && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                      {filteredBranches.length > 0 ? filteredBranches.map(b => (
                        <button key={b.code} type="button"
                          onClick={() => { toggleBranch(b.code); setBranchSearch(''); }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 flex justify-between items-center border-b border-gray-50 last:border-0">
                          <div>
                            <span className="font-bold text-gray-900">{b.code}</span>
                            <span className="text-xs text-gray-500 ml-2">{b.name}</span>
                          </div>
                          {form.eligibility?.allowedBranches?.includes(b.code) && (
                            <CheckCircle size={16} className="text-blue-600" />
                          )}
                        </button>
                      )) : (
                        <div className="p-4 text-center text-gray-400 text-sm">No branches found</div>
                      )}
                    </div>
                  )}
                </div>
                {/* Selected branches chips */}
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-200 min-h-[56px]">
                  {!form.eligibility?.allowedBranches?.length ? (
                    <span className="text-xs text-gray-400 italic">No branches selected — all students will be ineligible.</span>
                  ) : form.eligibility.allowedBranches.map(code => {
                    const branch = collegeBranches.find(b => b.code === code);
                    return (
                      <span key={code} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                        <span title={branch?.name || code}>{code}</span>
                        <button onClick={() => toggleBranch(code)}><X size={13} /></button>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Batch selector */}
              <div className="space-y-3">
                <label className={labelCls}>
                  Eligible Batches
                  <span className="ml-2 text-blue-600 normal-case font-normal">({form.eligibility?.eligibleBatches?.length || 0} selected)</span>
                </label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {AVAILABLE_BATCHES.map(year => {
                    const isSelected = form.eligibility?.eligibleBatches?.includes(year);
                    const isCurrent  = year === CURRENT_YEAR;
                    return (
                      <button key={year} type="button" onClick={() => toggleBatch(year)}
                        className={`p-3 rounded-xl font-bold text-sm transition-all border-2 ${
                          isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                        } ${isCurrent ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}>
                        {year}
                        {isCurrent && <span className="block text-[9px] font-normal opacity-80">Current</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Academic cutoffs */}
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-5">
                <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap size={18} /> Academic Performance Cutoffs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {([
                    ['B.Tech / UG *',        'minCGPA',    'formatUG',      'CGPA'],
                    ['Class 10th (SSC) *',    'min10th',    'format10th',    'Percentage'],
                    ['Class 12th (Inter) *',  'min12th',    'format12th',    'Percentage'],
                    ['Diploma (Lateral)',      'minDiploma', 'formatDiploma', 'Percentage'],
                  ] as const).map(([labelText, scoreKey, formatKey, defaultFmt]) => (
                    <div key={scoreKey} className="space-y-2">
                      <label className="block text-[10px] font-bold text-blue-800 uppercase">{labelText}</label>
                      <div className="flex gap-2">
                        <select className="w-36 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-300"
                          value={(form.eligibility as any)?.[formatKey] || defaultFmt}
                          onChange={e => updateEligibility({ [formatKey]: e.target.value } as any)}>
                          <option value="CGPA">CGPA (10)</option>
                          <option value="Percentage">Percentage</option>
                          <option value="Marks">Total Marks</option>
                        </select>
                        <input type="number" step="0.01" min="0"
                          className="flex-1 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-300"
                          value={(form.eligibility as any)?.[scoreKey] ?? ''}
                          onChange={e => updateEligibility({ [scoreKey]: parseFloat(e.target.value) || 0 } as any)}
                          placeholder="Min value" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelCls}>Max Allowed Backlogs</label>
                  <input type="number" min="0" className={inputCls()}
                    value={form.eligibility?.maxBacklogs ?? 0}
                    onChange={e => updateEligibility({ maxBacklogs: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={labelCls}>Diploma Students Eligible?</label>
                  <select className={selectCls}
                    value={form.eligibility?.isDiplomaEligible ? 'yes' : 'no'}
                    onChange={e => updateEligibility({ isDiplomaEligible: e.target.value === 'yes' })}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Educational Gaps Allowed?</label>
                  <select className={selectCls}
                    value={form.eligibility?.educationalGapsAllowed ? 'yes' : 'no'}
                    onChange={e => updateEligibility({ educationalGapsAllowed: e.target.value === 'yes' })}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                {form.eligibility?.educationalGapsAllowed && (
                  <div>
                    <label className={labelCls}>Max Gap Years</label>
                    <input type="number" min="0" className={inputCls()}
                      value={form.eligibility?.maxGapYears ?? 0}
                      onChange={e => updateEligibility({ maxGapYears: parseInt(e.target.value) || 0 })} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 4: Timeline & Rounds ── */}
          {step === 4 && (
            <div className="space-y-8">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" /> 4. Timeline & Selection Rounds
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Application Deadline *</label>
                  <input type="date" className={inputCls(formErrors.applicationDeadline)}
                    value={form.applicationDeadline || ''}
                    onChange={e => setForm(f => ({ ...f, applicationDeadline: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>External Link (Optional)</label>
                  <input className={inputCls()} value={form.externalLink || ''}
                    onChange={e => setForm(f => ({ ...f, externalLink: e.target.value }))}
                    placeholder="https://company.com/careers/..." />
                </div>
              </div>

              {/* Rounds */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h4 className="font-bold text-gray-800">Selection Rounds</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Configure each stage of the hiring process.</p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, rounds: [...(f.rounds || []), { name: '', date: '', status: 'Pending' }] }))}
                    className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-2">
                    <Plus size={14} /> Add Round
                  </button>
                </div>
                <div className="space-y-3">
                  {(form.rounds || []).map((r, i) => (
                    <div key={i} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</span>
                      <input className="flex-1 p-2 border-b border-transparent hover:border-gray-200 focus:border-blue-500 outline-none bg-transparent font-bold text-gray-800"
                        placeholder="e.g. Technical Interview" value={r.name}
                        onChange={e => { const rs = [...(form.rounds || [])]; rs[i] = { ...rs[i], name: e.target.value }; setForm(f => ({ ...f, rounds: rs })); }} />
                      <input type="date" className="w-40 p-2 border rounded-lg bg-gray-50 text-sm" value={r.date}
                        onChange={e => { const rs = [...(form.rounds || [])]; rs[i] = { ...rs[i], date: e.target.value }; setForm(f => ({ ...f, rounds: rs })); }} />
                      <select className="p-2 border rounded-lg bg-gray-50 text-xs font-bold text-gray-600" value={r.status}
                        onChange={e => { const rs = [...(form.rounds || [])]; rs[i] = { ...rs[i], status: e.target.value }; setForm(f => ({ ...f, rounds: rs })); }}>
                        <option>Pending</option>
                        <option>Ongoing</option>
                        <option>Completed</option>
                      </select>
                      <button onClick={() => setForm(f => ({ ...f, rounds: f.rounds?.filter((_, idx) => idx !== i) }))}
                        className="text-gray-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* JD Attachments */}
              <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                <label className={labelCls}>JD & Policy Attachments</label>
                {isEditing && form.avoidListUrl && (
                  <p className="text-xs text-gray-500">
                    Existing avoid list: <a href={form.avoidListUrl} className="text-blue-600 underline" target="_blank" rel="noreferrer">View</a>
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  {(form.documents || []).map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border shadow-sm text-xs font-bold text-blue-700">
                      <FileText size={14} />
                      <span className="max-w-[120px] truncate" title={doc.name}>{doc.name}</span>
                      {!doc.url && (
                        <button onClick={() => removeJDFile(i)} className="text-red-400 hover:text-red-600"><X size={13} /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => jobDocInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-indigo-200 rounded-2xl bg-white hover:bg-indigo-50 transition-all text-indigo-400 hover:text-indigo-600 group">
                    {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} className="group-hover:scale-110 transition-transform" />}
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Upload</span>
                    <input type="file" multiple className="hidden" ref={jobDocInputRef} onChange={handleJDFileAdd} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Data & Negative List ── */}
          {step === 5 && (
            <div className="space-y-8">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2">
                <Users size={20} className="text-blue-600" /> 5. Data Extraction & Negative List
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FieldSelector
                  selectedFields={form.requiredStudentFields || []}
                  onToggle={v => setForm(f => ({
                    ...f,
                    requiredStudentFields: f.requiredStudentFields?.includes(v)
                      ? f.requiredStudentFields.filter(x => x !== v)
                      : [...(f.requiredStudentFields || []), v]
                  }))}
                  options={ALL_PROFILE_FIELDS}
                  commonIds={COMMON_PROFILE_FIELD_KEYS}
                  colorTheme="blue"
                  labels={{ title: 'Required Profile Data', description: 'Select which student fields to export to the applicant sheet.', searchPlaceholder: 'Search fields...' }}
                />

                <div className="space-y-6">
                  <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Ban size={20} className="text-red-600" />
                      <h4 className="font-bold text-red-900 text-sm uppercase">Negative List (Excluded Students)</h4>
                    </div>
                    <p className="text-xs text-red-700 mb-3">Roll numbers of students strictly excluded from applying. Separate by comma or new line.</p>
                    <textarea
                      className="w-full p-4 border border-red-200 rounded-xl bg-white text-gray-900 font-mono text-xs focus:ring-2 focus:ring-red-300 outline-none min-h-[150px]"
                      placeholder={`20701A0501\n20701A0588\n...`}
                      value={excludedInput}
                      onChange={e => setExcludedInput(e.target.value)} />
                    <p className="text-[10px] text-red-500 mt-2 font-bold uppercase">
                      {excludedInput.split(/[\n,]+/).filter(x => x.trim()).length} students excluded
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                    <label className={labelCls}>Or Upload Avoid List (Excel/CSV)</label>
                    <button onClick={() => avoidListInputRef.current?.click()}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 text-yellow-900 rounded-xl font-bold text-sm transition-all">
                      <UploadCloud size={18} />
                      {avoidListFile ? avoidListFile.name : 'Upload File'}
                    </button>
                    <input type="file" className="hidden" ref={avoidListInputRef} accept=".csv,.xlsx,.xls" onChange={handleAvoidListUpload} />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl flex gap-4">
                <Info size={22} className="text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-yellow-900 text-sm">Review Before Posting</h4>
                  <p className="text-xs text-yellow-700 mt-1">Once posted, all eligible students in the target branches will be notified.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center shrink-0">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 flex items-center gap-2 transition-all shadow-sm">
              <ChevronLeft size={18} /> Previous
            </button>
          ) : <div />}

          <div className="flex gap-4">
            {step < 5 ? (
              <button onClick={handleNext}
                className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95">
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleFinalSave} disabled={isSaving}
                className="px-10 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                {isSaving ? 'Saving...' : isEditing ? 'Update Opportunity' : 'Launch Opportunity'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};