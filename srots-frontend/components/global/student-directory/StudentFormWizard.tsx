
// import React, { useState, useEffect } from 'react';
// import { Student, StudentProfile, SemesterMark, EducationRecord, MarkFormat, College, Role } from '../../../types';
// import { Modal } from '../../common/Modal';
// import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

// // Steps
// import { Step1Identity } from './wizard/Step1Identity';
// import { Step2Contact } from './wizard/Step2Contact';
// import { Step3Academics } from './wizard/Step3Academics';

// interface StudentFormWizardProps {
//     isOpen: boolean;
//     onClose: () => void;
//     isEditing: boolean;
//     initialData?: Student | null;
//     collegeDetails?: College;
//     collegeId: string;
//     onSave: (student: Student) => void;
// }

// export const StudentFormWizard: React.FC<StudentFormWizardProps> = ({ 
//     isOpen, onClose, isEditing, initialData, collegeDetails, collegeId, onSave 
// }) => {
//     const [wizardStep, setWizardStep] = useState(1);
//     const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

//     // --- FORM DATA STATES ---
//     const [newStudent, setNewStudent] = useState<Partial<StudentProfile>>({
//         gender: 'MALE', course: 'B.Tech', nationality: 'Indian', religion: 'Hindu', batch: 2025
//     });

//     const [edu12Type, setEdu12Type] = useState<'Class 12' | 'Diploma'>('Class 12');
//     const [class10, setClass10] = useState({ board: '', institution: '', year: '', score: '', location: '', scoreType: 'CGPA' as MarkFormat, secured: '', total: '' });
//     const [class12, setClass12] = useState({ board: '', institution: '', specialization: '', year: '', score: '', location: '', scoreType: 'Percentage' as MarkFormat, secured: '', total: '' });
//     const [diploma, setDiploma] = useState({ branch: '', institution: '', year: '', score: '', location: '', scoreType: 'Percentage' as MarkFormat, secured: '', total: '' });
//     const [degreeSemesters, setDegreeSemesters] = useState<SemesterMark[]>(Array.from({length: 8}, (_, i) => ({ sem: i+1, sgpa: '' })));
//     const [currentCGPA, setCurrentCGPA] = useState('');
//     const [currentArrears, setCurrentArrears] = useState('0');

//     // Helper to parse score strings like "950/1000" into state
//     const parseScore = (scoreStr: string, type: string) => {
//         if(type === 'Marks' && scoreStr.includes('/')) {
//             const [secured, total] = scoreStr.split('/');
//             return { score: scoreStr, secured, total };
//         }
//         return { score: scoreStr, secured: '', total: '' };
//     };

//     // Helper to build score string
//     const getScoreString = (d: { score: string, scoreType: string, secured: string, total: string }) => {
//         return d.scoreType === 'Marks' ? `${d.secured}/${d.total}` : d.score;
//     };

//     useEffect(() => {
//         if (isOpen) {
//             setWizardStep(1);
//             setFormErrors({});
            
//             if (isEditing && initialData) {
//                 const p = initialData.profile;
//                 setNewStudent({ ...p, collegeName: p.collegeName || collegeDetails?.name || '' });

//                 // Academics
//                 const edu10 = p.educationHistory.find(e => e.level === 'Class 10');
//                 if (edu10) {
//                     const s10 = parseScore(edu10.score, edu10.scoreType);
//                     setClass10({
//                         board: edu10.board, institution: edu10.institution, year: edu10.yearOfPassing,
//                         score: s10.score, location: edu10.location, scoreType: edu10.scoreType as MarkFormat,
//                         secured: s10.secured, total: s10.total
//                     });
//                 } else {
//                     setClass10({ board: '', institution: '', year: '', score: '', location: '', scoreType: 'CGPA', secured: '', total: '' });
//                 }

//                 const eduDip = p.educationHistory.find(e => e.level === 'Diploma');
//                 const edu12 = p.educationHistory.find(e => e.level === 'Class 12');

//                 if (eduDip) {
//                     setEdu12Type('Diploma');
//                     const sDip = parseScore(eduDip.score, eduDip.scoreType);
//                     setDiploma({
//                         branch: eduDip.branch || '', institution: eduDip.institution, year: eduDip.yearOfPassing,
//                         score: sDip.score, location: eduDip.location, scoreType: eduDip.scoreType as MarkFormat,
//                         secured: sDip.secured, total: sDip.total
//                     });
//                     setClass12({ board: '', institution: '', specialization: '', year: '', score: '', location: '', scoreType: 'Percentage', secured: '', total: '' });
//                 } else {
//                     setEdu12Type('Class 12');
//                     if (edu12) {
//                         const s12 = parseScore(edu12.score, edu12.scoreType);
//                         setClass12({
//                             board: edu12.board, institution: edu12.institution, specialization: edu12.specialization || '',
//                             year: edu12.yearOfPassing, score: s12.score, location: edu12.location, scoreType: edu12.scoreType as MarkFormat,
//                             secured: s12.secured, total: s12.total
//                         });
//                     } else {
//                         setClass12({ board: '', institution: '', specialization: '', year: '', score: '', location: '', scoreType: 'Percentage', secured: '', total: '' });
//                     }
//                     setDiploma({ branch: '', institution: '', year: '', score: '', location: '', scoreType: 'Percentage', secured: '', total: '' });
//                 }

//                 const eduUG = p.educationHistory.find(e => e.level === 'Undergraduate');
//                 if (eduUG) {
//                     setCurrentCGPA(eduUG.score);
//                     setCurrentArrears(eduUG.currentArrears?.toString() || '0');
//                     if (eduUG.semesters) {
//                         const sems = Array.from({length: 8}, (_, i) => {
//                             const existing = eduUG.semesters?.find(s => s.sem === i + 1);
//                             return { sem: i + 1, sgpa: existing ? existing.sgpa : '' };
//                         });
//                         setDegreeSemesters(sems);
//                     } else {
//                         setDegreeSemesters(Array.from({length: 8}, (_, i) => ({ sem: i+1, sgpa: '' })));
//                     }
//                 } else {
//                     setCurrentCGPA('');
//                     setCurrentArrears('0');
//                     setDegreeSemesters(Array.from({length: 8}, (_, i) => ({ sem: i+1, sgpa: '' })));
//                 }
//             } else {
//                 // Reset
//                 setNewStudent({ 
//                     gender: 'MALE', course: 'B.Tech', nationality: 'Indian', religion: 'Hindu', 
//                     collegeName: collegeDetails?.name || '',
//                     batch: 2025, placementCycle: '2025-2026',
//                     rollNumber: '', fullName: '', branch: '', dob: '', 
//                     instituteEmail: '', phone: '', alternativeEmail: '', whatsappNumber: '',
//                     aadhaarNumber: '', mentor: '', advisor: '', coordinator: '',
//                     fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
//                     parentPhone: '', parentEmail: ''
//                 });
//                 setEdu12Type('Class 12');
//                 setClass10({ board: '', institution: '', year: '', score: '', location: '', scoreType: 'CGPA', secured: '', total: '' });
//                 setClass12({ board: '', institution: '', specialization: '', year: '', score: '', location: '', scoreType: 'Percentage', secured: '', total: '' });
//                 setDiploma({ branch: '', institution: '', year: '', score: '', location: '', scoreType: 'Percentage', secured: '', total: '' });
//                 setDegreeSemesters(Array.from({length: 8}, (_, i) => ({ sem: i+1, sgpa: '' })));
//                 setCurrentCGPA('');
//                 setCurrentArrears('0');
//             }
//         }
//     }, [isOpen, isEditing, initialData, collegeDetails]);

//     const handleSaveStudent = () => {
//         const errors: Record<string, boolean> = {};
//         if(!newStudent.rollNumber) errors.rollNumber = true;
//         if(!newStudent.fullName) errors.fullName = true;
//         if(!newStudent.branch) errors.branch = true;
//         if(!newStudent.batch) errors.batch = true;
        
//         if(Object.keys(errors).length > 0) {
//             setFormErrors(errors);
//             alert("Please fill mandatory fields (Roll No, Name, Branch, Batch).");
//             setWizardStep(1);
//             return;
//         }

//         const educationHistory: EducationRecord[] = [];

//         if(class10.year || class10.score || class10.secured) {
//             educationHistory.push({
//                 id: '10', level: 'Class 10', board: class10.board, institution: class10.institution,
//                 yearOfPassing: class10.year, score: getScoreString(class10), scoreType: class10.scoreType, location: class10.location
//             });
//         }

//         if(edu12Type === 'Class 12') {
//             if(class12.year || class12.score || class12.secured) {
//                 educationHistory.push({
//                     id: '12', level: 'Class 12', board: class12.board, institution: class12.institution,
//                     yearOfPassing: class12.year, score: getScoreString(class12), scoreType: class12.scoreType, 
//                     location: class12.location, specialization: class12.specialization
//                 });
//             }
//         } else {
//             if(diploma.year || diploma.score || diploma.secured) {
//                 educationHistory.push({
//                     id: 'dip', level: 'Diploma', board: 'SBTET', institution: diploma.institution,
//                     yearOfPassing: diploma.year, score: getScoreString(diploma), scoreType: diploma.scoreType, 
//                     location: diploma.location, branch: diploma.branch
//                 });
//             }
//         }

//         const finalSemesters = degreeSemesters.map(s => {
//             if (edu12Type === 'Diploma' && (s.sem === 1 || s.sem === 2)) {
//                 return { sem: s.sem, sgpa: '' }; 
//             }
//             return s;
//         }).filter(s => s.sgpa !== '');

//         educationHistory.push({
//             id: 'ug', level: 'Undergraduate', board: 'University', institution: newStudent.collegeName || '',
//             yearOfPassing: newStudent.batch?.toString() || '', score: currentCGPA || '0', scoreType: 'CGPA', location: 'Campus',
//             branch: newStudent.branch, currentArrears: parseInt(currentArrears) || 0,
//             semesters: finalSemesters
//         });

//         // Backend expects only the student info; roles/permissions/defaults handled in Service
//         // Removed premiumStart from here; Backend calculates it.
//         const studentPayload: any = {
//             id: isEditing && initialData ? initialData.id : '', 
//             name: newStudent.fullName || 'Student',
//             email: newStudent.instituteEmail || `${newStudent.rollNumber}@college.edu`,
//             collegeId: collegeId,
//             profile: {
//                 ...newStudent,
//                 educationHistory
//             }
//         };

//         onSave(studentPayload);
//     };

//     return (
//         <Modal isOpen={isOpen} onClose={onClose} title={`${isEditing ? 'Edit Profile' : 'Add Student'} (Step ${wizardStep}/3)`} maxWidth="max-w-4xl">
//              <div className="flex-1 overflow-y-auto p-8 max-h-[80vh]">
//                  {wizardStep === 1 && (
//                      <Step1Identity 
//                         newStudent={newStudent} 
//                         setNewStudent={setNewStudent} 
//                         isEditing={isEditing} 
//                         collegeDetails={collegeDetails} 
//                         formErrors={formErrors}
//                      />
//                  )}
//                  {wizardStep === 2 && (
//                      <Step2Contact 
//                         newStudent={newStudent} 
//                         setNewStudent={setNewStudent} 
//                      />
//                  )}
//                  {wizardStep === 3 && (
//                      <Step3Academics 
//                         class10={class10} setClass10={setClass10}
//                         class12={class12} setClass12={setClass12}
//                         diploma={diploma} setDiploma={setDiploma}
//                         degreeSemesters={degreeSemesters} setDegreeSemesters={setDegreeSemesters}
//                         currentCGPA={currentCGPA} setCurrentCGPA={setCurrentCGPA}
//                         currentArrears={currentArrears} setCurrentArrears={setCurrentArrears}
//                         edu12Type={edu12Type} setEdu12Type={setEdu12Type}
//                      />
//                  )}
//              </div>
//              <div className="p-6 border-t flex justify-between bg-gray-50">
//                  {wizardStep > 1 ? <button onClick={() => setWizardStep(s => s - 1)} className="px-6 py-2 border rounded-lg font-bold flex items-center gap-2 bg-white"><ChevronLeft size={18}/> Back</button> : <div/>}
//                  {wizardStep < 3 ? <button onClick={() => setWizardStep(s => s + 1)} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700">Next <ChevronRight size={18}/></button> : <button onClick={handleSaveStudent} className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-green-700"><CheckCircle size={18}/> Save</button>}
//              </div>
//         </Modal>
//     );
// };


// import React, { useState, useEffect, useRef } from 'react';
// import { Student, StudentProfile, SemesterMark, MarkFormat, College } from '../../../types';
// import { Modal } from '../../common/Modal';
// import { ChevronLeft, ChevronRight, CheckCircle, User, Phone, GraduationCap } from 'lucide-react';
// import { Step1Identity } from './wizard/Step1Identity';
// import { Step2Contact } from './wizard/Step2Contact';
// import { Step3Academics } from './wizard/Step3Academics';

// /**
//  * StudentFormWizard
//  * Path: src/components/global/student-directory/StudentFormWizard.tsx
//  *
//  * ─────────────────────────────────────────────────────────────────────────────
//  * WHY SEMESTER DATA WAS NOT POPULATING — definitive analysis
//  * ─────────────────────────────────────────────────────────────────────────────
//  *
//  * The backend EducationRecord entity:
//  *   @JdbcTypeCode(SqlTypes.JSON)
//  *   @Column(name = "semesters_data", columnDefinition = "JSON")
//  *   private String semestersData;       ← Java field is a String
//  *
//  * Jackson serialises it as a raw JSON string in the GET response:
//  *   "semestersData": "[{\"sem\": 1, \"sgpa\": \"8.0\"}, {\"sem\": 2, \"sgpa\": \"8.4\"}]"
//  *                     ↑ outer quotes = it's a STRING, not a JSON array
//  *
//  * Previous normaliseEduRecord handled this with JSON.parse() which was correct.
//  * The issue was that the TypeScript EducationRecord interface had NO `semestersData`
//  * field — only `semesters?: SemesterMark[]`. This caused TypeScript tooling to
//  * consider `rec.semestersData` as `any` which is fine at runtime BUT it also
//  * means editors/linters might warn about it and obscure the real problem.
//  *
//  * The ACTUAL bug causing zero semester values in the form was in the lateral
//  * entry path: adjustSemestersForLateralEntry() in UserAccountServiceImpl stores
//  *   {"sem": "Sem 3", "sgpa": "8.8"}   ← sem is "Sem 3" not 3
//  * but even for normal students sem is stored as a number (1, 2, 3...).
//  *
//  * The NEW parseSemNumber() function handles BOTH formats robustly.
//  *
//  * ADDITIONALLY: the `semestersData` field is now declared in types.ts so
//  * TypeScript is aware of it and won't strip it.
//  *
//  * FIXES IN THIS VERSION:
//  * 1. parseSemNumber() — handles "1", "Sem 1", 1, "sem1" all correctly
//  * 2. parseSemestersData() — standalone robust function with full logging
//  * 3. normaliseEduRecord() — reads scoreDisplay correctly (not score)
//  * 4. useEffect deps — collegeDetails removed (in ref), form never resets
//  * 5. Save payload — uses `studentProfile` key (not `profile`)
//  * 6. fullName/phone pulled from root (user), not from profile
//  */

// interface StudentFormWizardProps {
//   isOpen: boolean;
//   onClose: () => void;
//   isEditing: boolean;
//   initialData?: Student | null;
//   collegeDetails?: College;
//   collegeId: string;
//   onSave: (payload: any) => void;
// }

// // ─── Default state ──────────────────────────────────────────────────────────────

// const DEFAULT_PROFILE: Partial<StudentProfile> = {
//   rollNumber: '',
//   fullName: '',
//   branch: '',
//   course: 'B.Tech',
//   batch: new Date().getFullYear(),
//   gender: 'MALE',
//   placementCycle: '',
//   dob: '',
//   nationality: 'Indian',
//   religion: 'Hindu',
//   aadhaarNumber: '',
//   instituteEmail: '',
//   phone: '',
//   alternativeEmail: '',
//   whatsappNumber: '',
//   parentPhone: '',
//   parentEmail: '',
//   mentor: '',
//   advisor: '',
//   coordinator: '',
//   fatherName: '',
//   fatherOccupation: '',
//   motherName: '',
//   motherOccupation: '',
//   collegeName: '',
// };

// const makeDefaultEdu = () => ({
//   class10: {
//     board: '', institution: '', year: '', score: '',
//     scoreType: 'CGPA' as MarkFormat, secured: '', total: '',
//   },
//   class12: {
//     board: '', institution: '', specialization: '', year: '', score: '',
//     scoreType: 'Percentage' as MarkFormat, secured: '', total: '',
//   },
//   diploma: {
//     branch: '', institution: '', year: '', score: '',
//     scoreType: 'Percentage' as MarkFormat, secured: '', total: '',
//   },
// });

// // ─── Semester parsing helpers ───────────────────────────────────────────────────

// /**
//  * Parse a semester NUMBER from whatever format the backend sends.
//  *
//  * Regular students (UserAccountServiceImpl.saveEducationHistory):
//  *   {"sem": 1, "sgpa": "8.0"}   → sem is a NUMBER
//  *
//  * Lateral entry students (adjustSemestersForLateralEntry):
//  *   {"sem": "Sem 3", "sgpa": "8.8"}  → sem is a STRING like "Sem 3"
//  *
//  * Both are handled here.
//  */
// const parseSemNumber = (sem: any): number => {
//   if (sem === null || sem === undefined) return NaN;
//   if (typeof sem === 'number') return sem;
//   if (typeof sem === 'string') {
//     // "Sem 3" → 3, "sem3" → 3, "3" → 3, "Semester 3" → 3
//     const match = sem.match(/(\d+)/);
//     return match ? parseInt(match[1], 10) : NaN;
//   }
//   return NaN;
// };

// /**
//  * Parse the semestersData field from a backend EducationRecord.
//  *
//  * The Java entity field is:
//  *   private String semestersData;  (annotated @JdbcTypeCode(SqlTypes.JSON))
//  *
//  * The DB stores it as a JSON column but Java reads/writes it as a String.
//  * Jackson serialises this String field as a plain JSON string in the API response.
//  *
//  * So the GET response looks like:
//  *   "semestersData": "[{\"sem\": 1, \"sgpa\": \"8.0\"}, {\"sem\": 2, \"sgpa\": \"8.4\"}]"
//  *
//  * This function handles:
//  *   - A JSON string (the normal case from backend)
//  *   - Already-parsed array (if called on a previously normalised record)
//  *   - Empty string, "[]", null, undefined → returns []
//  */
// const parseSemestersData = (rec: any): SemesterMark[] => {
//   // Backend sends `semestersData`, frontend-normalised records use `semesters`
//   const raw = rec.semestersData ?? rec.semesters ?? null;

//   if (raw === null || raw === undefined) {
//     console.log('[parseSemestersData] No semestersData or semesters field found on record:', rec.level);
//     return [];
//   }

//   let parsed: any[] = [];

//   if (Array.isArray(raw)) {
//     // Already an array (normalised record or frontend-side data)
//     parsed = raw;
//   } else if (typeof raw === 'string') {
//     const trimmed = raw.trim();
//     if (!trimmed || trimmed === '[]' || trimmed === 'null') {
//       return [];
//     }
//     try {
//       const result = JSON.parse(trimmed);
//       if (!Array.isArray(result)) {
//         console.warn('[parseSemestersData] Parsed JSON is not an array:', result);
//         return [];
//       }
//       parsed = result;
//     } catch (e) {
//       console.error('[parseSemestersData] JSON.parse failed. Raw value:', trimmed, 'Error:', e);
//       return [];
//     }
//   } else {
//     console.warn('[parseSemestersData] Unexpected type for semestersData:', typeof raw, raw);
//     return [];
//   }

//   const result: SemesterMark[] = [];
//   for (const item of parsed) {
//     if (!item || typeof item !== 'object') continue;
//     const semNum = parseSemNumber(item.sem);
//     if (isNaN(semNum) || semNum < 1 || semNum > 8) {
//       console.warn('[parseSemestersData] Skipping invalid sem:', item.sem, '→', semNum);
//       continue;
//     }
//     // sgpa might be "8.0" or 8.0 or null — convert to string
//     const sgpa = (item.sgpa ?? item.SGPA ?? '').toString().trim();
//     result.push({ sem: semNum, sgpa });
//   }

//   console.log(`[parseSemestersData] level=${rec.level} → parsed ${result.length} semesters:`, result);
//   return result;
// };

// // ─── Education record normalisation ────────────────────────────────────────────

// /**
//  * Normalise one EducationRecord from the GET /accounts/profile/:id response.
//  *
//  * Key backend field name differences (GET response vs POST/PUT request):
//  *   GET returns:  scoreDisplay (entity column `score_display`)
//  *   POST/PUT expects: score (DTO field in EducationHistoryDTO)
//  *
//  *   GET returns:  semestersData (JSON string, entity column `semesters_data`)
//  *   POST/PUT expects: semesters (List<Map> in EducationHistoryDTO)
//  */
// const normaliseEduRecord = (rec: any) => {
//   const rawScore: string = rec.scoreDisplay ?? rec.score ?? '';
//   const semesters = parseSemestersData(rec);
//   return {
//     level:          rec.level          ?? '',
//     institution:    rec.institution    ?? '',
//     board:          rec.board          ?? '',
//     yearOfPassing:  rec.yearOfPassing  ?? '',
//     score:          rawScore,
//     scoreType:      rec.scoreType      ?? 'CGPA',
//     specialization: rec.specialization ?? '',
//     branch:         rec.branch         ?? '',
//     currentArrears: rec.currentArrears ?? 0,
//     semesters,
//   };
// };

// // ─── Score string helpers ───────────────────────────────────────────────────────

// /** "940/1000" → { secured:"940", total:"1000" } */
// const parseScore = (scoreStr = '', scoreType: string) => {
//   if (scoreType === 'Marks' && scoreStr.includes('/')) {
//     const [secured = '', total = ''] = scoreStr.split('/');
//     return { score: scoreStr, secured, total };
//   }
//   return { score: scoreStr, secured: '', total: '' };
// };

// const buildScoreString = (d: {
//   score: string; scoreType: string; secured: string; total: string;
// }) => d.scoreType === 'Marks' ? `${d.secured}/${d.total}` : d.score;

// // ─── Component ──────────────────────────────────────────────────────────────────

// export const StudentFormWizard: React.FC<StudentFormWizardProps> = ({
//   isOpen, onClose, isEditing, initialData, collegeDetails, collegeId, onSave,
// }) => {
//   const [wizardStep,      setWizardStep]      = useState(1);
//   const [formErrors,      setFormErrors]      = useState<Record<string, boolean>>({});
//   const [isSaving,        setIsSaving]        = useState(false);
//   const [newStudent,      setNewStudent]      = useState<Partial<StudentProfile>>(DEFAULT_PROFILE);
//   const [edu12Type,       setEdu12Type]       = useState<'Class 12' | 'Diploma'>('Class 12');
//   const [class10,         setClass10]         = useState(makeDefaultEdu().class10);
//   const [class12,         setClass12]         = useState(makeDefaultEdu().class12);
//   const [diploma,         setDiploma]         = useState(makeDefaultEdu().diploma);
//   const [degreeSemesters, setDegreeSemesters] = useState<SemesterMark[]>(
//     Array.from({ length: 8 }, (_, i) => ({ sem: i + 1, sgpa: '' }))
//   );
//   const [currentCGPA,    setCurrentCGPA]    = useState('');
//   const [currentArrears, setCurrentArrears] = useState('0');

//   // KEY FIX: collegeDetails in a ref → changes never re-run useEffect
//   const cdRef = useRef<College | undefined>(collegeDetails);
//   useEffect(() => { cdRef.current = collegeDetails; }, [collegeDetails]);

//   // ─── Main form population ──────────────────────────────────────────────────────
//   // DEPS: [isOpen, isEditing, initialData] — NOT collegeDetails
//   useEffect(() => {
//     if (!isOpen) return;
//     setWizardStep(1);
//     setFormErrors({});

//     const cd = cdRef.current;

//     if (isEditing && initialData) {
//       const root = initialData as any;
//       const p: any = root.profile ?? {};

//       console.log('════════════════════════════════════════');
//       console.log('[StudentFormWizard] EDIT MODE — initialData:', root);
//       console.log('[StudentFormWizard] profile (p):', p);
//       console.log('[StudentFormWizard] educationHistory (root):', root.educationHistory);
//       console.log('════════════════════════════════════════');

//       // ── Identity + Contact ──────────────────────────────────────────────────
//       setNewStudent({
//         ...DEFAULT_PROFILE,
//         ...p,
//         collegeName:      p.collegeName      || cd?.name             || '',
//         rollNumber:       p.rollNumber       ?? '',
//         // fullName is on the USER (root), not in StudentProfile
//         fullName:         p.fullName         ?? root.fullName         ?? '',
//         branch:           p.branch           ?? '',
//         batch:            p.batch            ?? new Date().getFullYear(),
//         course:           p.course           ?? 'B.Tech',
//         gender:           p.gender           ?? 'MALE',
//         nationality:      p.nationality      ?? 'Indian',
//         religion:         p.religion         ?? 'Hindu',
//         // dob from profile: "2003-05-15" — correct format for <input type="date">
//         dob:              p.dob              ?? '',
//         placementCycle:   p.placementCycle   ?? '',
//         instituteEmail:   p.instituteEmail   ?? root.email            ?? '',
//         // phone is on the USER (root), not in StudentProfile
//         phone:            p.phone            ?? root.phone            ?? '',
//         alternativeEmail: p.alternativeEmail ?? '',
//         whatsappNumber:   p.whatsappNumber   ?? '',
//         parentPhone:      p.parentPhone      ?? '',
//         parentEmail:      p.parentEmail      ?? '',
//         aadhaarNumber:    p.aadhaarNumber    ?? root.aadhaarNumber    ?? '',
//         mentor:           p.mentor           ?? '',
//         advisor:          p.advisor          ?? '',
//         coordinator:      p.coordinator      ?? '',
//         fatherName:       p.fatherName       ?? '',
//         fatherOccupation: p.fatherOccupation ?? '',
//         motherName:       p.motherName       ?? '',
//         motherOccupation: p.motherOccupation ?? '',
//       });

//       // ── Education history ────────────────────────────────────────────────────
//       // After studentService.getStudentProfile() merge:
//       //   { ...data.user, profile: data.profile, educationHistory: data.educationHistory }
//       // → educationHistory is at ROOT of initialData, NOT inside profile
//       const rawHistory: any[] =
//         root.educationHistory       ??
//         (p as any).educationHistory ??
//         [];

//       console.log('[StudentFormWizard] rawHistory count:', rawHistory.length);

//       const history = rawHistory.map(normaliseEduRecord);
//       console.log('[StudentFormWizard] normalised history:', history);

//       // Class 10
//       const edu10 = history.find(e => e.level === 'Class 10');
//       if (edu10) {
//         const s = parseScore(edu10.score, edu10.scoreType);
//         setClass10({
//           board: edu10.board, institution: edu10.institution,
//           year: edu10.yearOfPassing, score: s.score,
//           scoreType: edu10.scoreType as MarkFormat,
//           secured: s.secured, total: s.total,
//         });
//       } else {
//         setClass10(makeDefaultEdu().class10);
//       }

//       // Class 12 vs Diploma
//       const eduDip = history.find(e => e.level === 'Diploma');
//       const edu12  = history.find(e => e.level === 'Class 12');

//       if (eduDip) {
//         setEdu12Type('Diploma');
//         const s = parseScore(eduDip.score, eduDip.scoreType);
//         setDiploma({
//           branch: eduDip.branch ?? '', institution: eduDip.institution,
//           year: eduDip.yearOfPassing, score: s.score,
//           scoreType: eduDip.scoreType as MarkFormat,
//           secured: s.secured, total: s.total,
//         });
//         setClass12(makeDefaultEdu().class12);
//       } else if (edu12) {
//         setEdu12Type('Class 12');
//         const s = parseScore(edu12.score, edu12.scoreType);
//         setClass12({
//           board: edu12.board, institution: edu12.institution,
//           specialization: edu12.specialization ?? '',
//           year: edu12.yearOfPassing, score: s.score,
//           scoreType: edu12.scoreType as MarkFormat,
//           secured: s.secured, total: s.total,
//         });
//         setDiploma(makeDefaultEdu().diploma);
//       } else {
//         setEdu12Type('Class 12');
//         setClass12(makeDefaultEdu().class12);
//         setDiploma(makeDefaultEdu().diploma);
//       }

//       // Undergraduate + semester marks
//       const eduUG = history.find(e => e.level === 'Undergraduate');
//       console.log('[StudentFormWizard] eduUG:', eduUG);

//       if (eduUG) {
//         setCurrentCGPA(eduUG.score ?? '');
//         setCurrentArrears(String(eduUG.currentArrears ?? 0));

//         console.log('[StudentFormWizard] eduUG.semesters:', eduUG.semesters);

//         // Build the 8-semester grid — fill from parsed semesters, leave '' if missing
//         const filled = Array.from({ length: 8 }, (_, i) => {
//           const semNum = i + 1;
//           const found  = eduUG.semesters.find((s: SemesterMark) => s.sem === semNum);
//           const sgpa   = found ? String(found.sgpa).trim() : '';
//           if (found) console.log(`[StudentFormWizard]   Sem ${semNum} SGPA = ${sgpa}`);
//           return { sem: semNum, sgpa };
//         });

//         console.log('[StudentFormWizard] filled degreeSemesters:', filled);
//         setDegreeSemesters(filled);
//       } else {
//         console.log('[StudentFormWizard] No Undergraduate record found');
//         setCurrentCGPA('');
//         setCurrentArrears('0');
//         setDegreeSemesters(Array.from({ length: 8 }, (_, i) => ({ sem: i + 1, sgpa: '' })));
//       }

//     } else {
//       // New student — reset all fields
//       const def = makeDefaultEdu();
//       setNewStudent({
//         ...DEFAULT_PROFILE,
//         collegeName:    cd?.name ?? '',
//         placementCycle: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
//       });
//       setEdu12Type('Class 12');
//       setClass10(def.class10);
//       setClass12(def.class12);
//       setDiploma(def.diploma);
//       setDegreeSemesters(Array.from({ length: 8 }, (_, i) => ({ sem: i + 1, sgpa: '' })));
//       setCurrentCGPA('');
//       setCurrentArrears('0');
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, isEditing, initialData]);
//   // ↑ collegeDetails intentionally NOT here — read via cdRef.current instead

//   // ─── Save ──────────────────────────────────────────────────────────────────────

//   const handleSaveStudent = async () => {
//     const errors: Record<string, boolean> = {};
//     if (!newStudent.rollNumber?.trim()) errors.rollNumber = true;
//     if (!newStudent.fullName?.trim())   errors.fullName   = true;
//     if (!newStudent.branch?.trim())     errors.branch     = true;
//     if (!newStudent.batch)              errors.batch      = true;

//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       alert('Please fill mandatory fields: Roll No, Name, Branch, Batch.');
//       setWizardStep(1);
//       return;
//     }

//     setIsSaving(true);
//     try {
//       const educationHistory: any[] = [];

//       if (class10.year || class10.score || class10.secured) {
//         educationHistory.push({
//           level: 'Class 10', board: class10.board,
//           institution: class10.institution, yearOfPassing: class10.year,
//           score: buildScoreString(class10), scoreType: class10.scoreType,
//         });
//       }

//       if (edu12Type === 'Class 12') {
//         if (class12.year || class12.score || class12.secured) {
//           educationHistory.push({
//             level: 'Class 12', board: class12.board,
//             institution: class12.institution, yearOfPassing: class12.year,
//             score: buildScoreString(class12), scoreType: class12.scoreType,
//             specialization: class12.specialization,
//           });
//         }
//       } else {
//         if (diploma.year || diploma.score || diploma.secured) {
//           educationHistory.push({
//             level: 'Diploma', board: 'SBTET',
//             institution: diploma.institution, yearOfPassing: diploma.year,
//             score: buildScoreString(diploma), scoreType: diploma.scoreType,
//             branch: diploma.branch,
//           });
//         }
//       }

//       const finalSemesters = degreeSemesters
//         .map(s => edu12Type === 'Diploma' && (s.sem === 1 || s.sem === 2)
//           ? { ...s, sgpa: '' } : s)
//         .filter(s => s.sgpa !== '');

//       educationHistory.push({
//         level: 'Undergraduate', board: 'University',
//         institution: newStudent.collegeName ?? '',
//         yearOfPassing: String(newStudent.batch ?? ''),
//         score: currentCGPA || '0', scoreType: 'CGPA',
//         branch: newStudent.branch,
//         currentArrears: parseInt(currentArrears) || 0,
//         semesters: finalSemesters,
//       });

//       // Payload matches UserCreateRequest shape:
//       // { name, email, phone, aadhaarNumber, collegeId, studentProfile: StudentProfileRequest }
//       const root = initialData as any;
//       const payload = {
//         name:          newStudent.fullName       ?? '',
//         email:         newStudent.instituteEmail ?? root?.email         ?? '',
//         phone:         newStudent.phone          ?? root?.phone         ?? '',
//         aadhaarNumber: newStudent.aadhaarNumber  ?? root?.aadhaarNumber ?? '',
//         collegeId,
//         studentProfile: {
//           rollNumber:       newStudent.rollNumber       ?? '',
//           branch:           newStudent.branch           ?? '',
//           batch:            newStudent.batch,
//           course:           newStudent.course           ?? 'B.Tech',
//           gender:           newStudent.gender           ?? 'MALE',
//           placementCycle:   newStudent.placementCycle   ?? '',
//           dob:              newStudent.dob              ?? '',
//           nationality:      newStudent.nationality      ?? '',
//           religion:         newStudent.religion         ?? '',
//           mentor:           newStudent.mentor           ?? '',
//           advisor:          newStudent.advisor          ?? '',
//           coordinator:      newStudent.coordinator      ?? '',
//           instituteEmail:   newStudent.instituteEmail   ?? '',
//           personalEmail:    newStudent.alternativeEmail ?? '',
//           whatsappNumber:   newStudent.whatsappNumber   ?? '',
//           fatherName:       newStudent.fatherName       ?? '',
//           motherName:       newStudent.motherName       ?? '',
//           fatherOccupation: newStudent.fatherOccupation ?? '',
//           motherOccupation: newStudent.motherOccupation ?? '',
//           parentPhone:      newStudent.parentPhone      ?? '',
//           parentEmail:      newStudent.parentEmail      ?? '',
//           educationHistory,
//         },
//       };

//       onSave(payload);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // ─── Render ────────────────────────────────────────────────────────────────────

//   const steps = [
//     { label: 'Identity',  icon: User },
//     { label: 'Contact',   icon: Phone },
//     { label: 'Academics', icon: GraduationCap },
//   ];

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}
//       title={isEditing ? 'Edit Student Profile' : 'Add New Student'} maxWidth="max-w-4xl">

//       <div className="px-8 pt-6 pb-4 border-b bg-gray-50">
//         <div className="flex items-center">
//           {steps.map((step, idx) => {
//             const stepNum  = idx + 1;
//             const Icon     = step.icon;
//             const isActive = wizardStep === stepNum;
//             const isDone   = wizardStep  > stepNum;
//             return (
//               <React.Fragment key={step.label}>
//                 <button onClick={() => setWizardStep(stepNum)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
//                     ${isActive ? 'bg-indigo-600 text-white shadow-md'
//                     : isDone   ? 'text-indigo-600 hover:bg-indigo-50'
//                                : 'text-gray-400 hover:bg-gray-100'}`}>
//                   <Icon size={15} />
//                   {step.label}
//                   {isDone && <CheckCircle size={14} className="ml-1" />}
//                 </button>
//                 {idx < steps.length - 1 && (
//                   <div className={`h-0.5 flex-1 mx-2 rounded-full ${isDone ? 'bg-indigo-300' : 'bg-gray-200'}`} />
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto p-8 max-h-[65vh]">
//         {wizardStep === 1 && (
//           <Step1Identity newStudent={newStudent} setNewStudent={setNewStudent}
//             isEditing={isEditing} collegeDetails={collegeDetails} formErrors={formErrors} />
//         )}
//         {wizardStep === 2 && (
//           <Step2Contact newStudent={newStudent} setNewStudent={setNewStudent} />
//         )}
//         {wizardStep === 3 && (
//           <Step3Academics
//             class10={class10}               setClass10={setClass10}
//             class12={class12}               setClass12={setClass12}
//             diploma={diploma}               setDiploma={setDiploma}
//             degreeSemesters={degreeSemesters} setDegreeSemesters={setDegreeSemesters}
//             currentCGPA={currentCGPA}       setCurrentCGPA={setCurrentCGPA}
//             currentArrears={currentArrears} setCurrentArrears={setCurrentArrears}
//             edu12Type={edu12Type}           setEdu12Type={setEdu12Type}
//           />
//         )}
//       </div>

//       <div className="p-6 border-t flex justify-between bg-gray-50">
//         {wizardStep > 1 ? (
//           <button onClick={() => setWizardStep(s => s - 1)}
//             className="px-6 py-2 border rounded-lg font-bold flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors">
//             <ChevronLeft size={18} /> Back
//           </button>
//         ) : <div />}

//         {wizardStep < 3 ? (
//           <button onClick={() => setWizardStep(s => s + 1)}
//             className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors">
//             Next <ChevronRight size={18} />
//           </button>
//         ) : (
//           <button onClick={handleSaveStudent} disabled={isSaving}
//             className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
//             {isSaving ? (
//               <>
//                 <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                 </svg>
//                 Saving…
//               </>
//             ) : <><CheckCircle size={18} /> Save Student</>}
//           </button>
//         )}
//       </div>
//     </Modal>
//   );
// };

import React, { useState, useEffect, useRef } from 'react';
import { Student, StudentProfile, SemesterMark, MarkFormat, College } from '../../../types';
import { Modal } from '../../common/Modal';
import { ChevronLeft, ChevronRight, CheckCircle, User, Phone, GraduationCap, Eye } from 'lucide-react';
import { Step1Identity } from './wizard/Step1Identity';
import { Step2Contact } from './wizard/Step2Contact';
import { Step3Academics } from './wizard/Step3Academics';

/**
 * StudentFormWizard
 * Path: src/components/global/student-directory/StudentFormWizard.tsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES IN THIS VERSION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. NEW: `readOnly` prop — when true:
 *    - Title shows "Student Profile Details" with an Eye icon instead of edit icon
 *    - The Save button in the footer is replaced with a "Close" button
 *    - Step navigation still works (user can browse Identity / Contact / Academics)
 *    - All form fields receive a `disabled` / `readOnly` attribute so no editing
 *      is possible. This is enforced at the wizard level AND passed into each
 *      step component via a `readOnly` prop.
 *    - The step indicator pills are still shown for clear navigation.
 *
 * 2. Step components (Step1Identity, Step2Contact, Step3Academics) already
 *    receive all state setters — when readOnly=true, we pass no-op setters
 *    so that even if a field fires onChange, nothing updates.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface StudentFormWizardProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  readOnly?: boolean;          // NEW — true = CPH view-only mode
  initialData?: Student | null;
  collegeDetails?: College;
  collegeId: string;
  onSave: (payload: any) => void;
}

// ─── Default state ──────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: Partial<StudentProfile> = {
  rollNumber: '', fullName: '', branch: '', course: 'B.Tech',
  batch: new Date().getFullYear(), gender: 'MALE', placementCycle: '',
  dob: '', nationality: 'Indian', religion: 'Hindu', aadhaarNumber: '',
  instituteEmail: '', phone: '', alternativeEmail: '', whatsappNumber: '',
  parentPhone: '', parentEmail: '', mentor: '', advisor: '', coordinator: '',
  fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
  collegeName: '',
};

const makeDefaultEdu = () => ({
  class10: { board: '', institution: '', year: '', score: '', scoreType: 'CGPA' as MarkFormat, secured: '', total: '' },
  class12: { board: '', institution: '', specialization: '', year: '', score: '', scoreType: 'Percentage' as MarkFormat, secured: '', total: '' },
  diploma: { branch: '', institution: '', year: '', score: '', scoreType: 'Percentage' as MarkFormat, secured: '', total: '' },
});

// ─── Semester parsing helpers ───────────────────────────────────────────────────

const parseSemNumber = (sem: any): number => {
  if (sem === null || sem === undefined) return NaN;
  if (typeof sem === 'number') return sem;
  if (typeof sem === 'string') {
    const match = sem.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : NaN;
  }
  return NaN;
};

const parseSemestersData = (rec: any): SemesterMark[] => {
  const raw = rec.semestersData ?? rec.semesters ?? null;
  if (raw === null || raw === undefined) return [];

  let parsed: any[] = [];
  if (Array.isArray(raw)) {
    parsed = raw;
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === '[]' || trimmed === 'null') return [];
    try {
      const result = JSON.parse(trimmed);
      if (!Array.isArray(result)) return [];
      parsed = result;
    } catch (e) {
      return [];
    }
  } else {
    return [];
  }

  const result: SemesterMark[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    const semNum = parseSemNumber(item.sem);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) continue;
    const sgpa = (item.sgpa ?? item.SGPA ?? '').toString().trim();
    result.push({ sem: semNum, sgpa });
  }
  return result;
};

// ─── Education record normalisation ────────────────────────────────────────────

const normaliseEduRecord = (rec: any) => {
  const rawScore: string = rec.scoreDisplay ?? rec.score ?? '';
  const semesters = parseSemestersData(rec);
  return {
    level:          rec.level          ?? '',
    institution:    rec.institution    ?? '',
    board:          rec.board          ?? '',
    yearOfPassing:  rec.yearOfPassing  ?? '',
    score:          rawScore,
    scoreType:      rec.scoreType      ?? 'CGPA',
    specialization: rec.specialization ?? '',
    branch:         rec.branch         ?? '',
    currentArrears: rec.currentArrears ?? 0,
    semesters,
  };
};

const parseScore = (scoreStr = '', scoreType: string) => {
  if (scoreType === 'Marks' && scoreStr.includes('/')) {
    const [secured = '', total = ''] = scoreStr.split('/');
    return { score: scoreStr, secured, total };
  }
  return { score: scoreStr, secured: '', total: '' };
};

const buildScoreString = (d: { score: string; scoreType: string; secured: string; total: string }) =>
  d.scoreType === 'Marks' ? `${d.secured}/${d.total}` : d.score;

// ─── No-op setter for read-only mode ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

// ─── Component ──────────────────────────────────────────────────────────────────

export const StudentFormWizard: React.FC<StudentFormWizardProps> = ({
  isOpen, onClose, isEditing, readOnly = false, initialData, collegeDetails, collegeId, onSave,
}) => {
  const [wizardStep,      setWizardStep]      = useState(1);
  const [formErrors,      setFormErrors]      = useState<Record<string, boolean>>({});
  const [isSaving,        setIsSaving]        = useState(false);
  const [newStudent,      setNewStudent]      = useState<Partial<StudentProfile>>(DEFAULT_PROFILE);
  const [edu12Type,       setEdu12Type]       = useState<'Class 12' | 'Diploma'>('Class 12');
  const [class10,         setClass10]         = useState(makeDefaultEdu().class10);
  const [class12,         setClass12]         = useState(makeDefaultEdu().class12);
  const [diploma,         setDiploma]         = useState(makeDefaultEdu().diploma);
  const [degreeSemesters, setDegreeSemesters] = useState<SemesterMark[]>(
    Array.from({ length: 8 }, (_, i) => ({ sem: i + 1, sgpa: '' }))
  );
  const [currentCGPA,    setCurrentCGPA]    = useState('');
  const [currentArrears, setCurrentArrears] = useState('0');

  const cdRef = useRef<College | undefined>(collegeDetails);
  useEffect(() => { cdRef.current = collegeDetails; }, [collegeDetails]);

  // ─── Main form population ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    setWizardStep(1);
    setFormErrors({});

    const cd = cdRef.current;

    if ((isEditing || readOnly) && initialData) {
      const root = initialData as any;
      const p: any = root.profile ?? {};

      setNewStudent({
        ...DEFAULT_PROFILE,
        ...p,
        collegeName:      p.collegeName      || cd?.name             || '',
        rollNumber:       p.rollNumber       ?? '',
        fullName:         p.fullName         ?? root.fullName         ?? '',
        branch:           p.branch           ?? '',
        batch:            p.batch            ?? new Date().getFullYear(),
        course:           p.course           ?? 'B.Tech',
        gender:           p.gender           ?? 'MALE',
        nationality:      p.nationality      ?? 'Indian',
        religion:         p.religion         ?? 'Hindu',
        dob:              p.dob              ?? '',
        placementCycle:   p.placementCycle   ?? '',
        instituteEmail:   p.instituteEmail   ?? root.email            ?? '',
        phone:            p.phone            ?? root.phone            ?? '',
        alternativeEmail: p.alternativeEmail ?? '',
        whatsappNumber:   p.whatsappNumber   ?? '',
        parentPhone:      p.parentPhone      ?? '',
        parentEmail:      p.parentEmail      ?? '',
        aadhaarNumber:    p.aadhaarNumber    ?? root.aadhaarNumber    ?? '',
        mentor:           p.mentor           ?? '',
        advisor:          p.advisor          ?? '',
        coordinator:      p.coordinator      ?? '',
        fatherName:       p.fatherName       ?? '',
        fatherOccupation: p.fatherOccupation ?? '',
        motherName:       p.motherName       ?? '',
        motherOccupation: p.motherOccupation ?? '',
      });

      const rawHistory: any[] = root.educationHistory ?? (p as any).educationHistory ?? [];
      const history = rawHistory.map(normaliseEduRecord);

      const edu10 = history.find(e => e.level === 'Class 10');
      if (edu10) {
        const s = parseScore(edu10.score, edu10.scoreType);
        setClass10({ board: edu10.board, institution: edu10.institution, year: edu10.yearOfPassing, score: s.score, scoreType: edu10.scoreType as MarkFormat, secured: s.secured, total: s.total });
      } else {
        setClass10(makeDefaultEdu().class10);
      }

      const eduDip = history.find(e => e.level === 'Diploma');
      const edu12  = history.find(e => e.level === 'Class 12');

      if (eduDip) {
        setEdu12Type('Diploma');
        const s = parseScore(eduDip.score, eduDip.scoreType);
        setDiploma({ branch: eduDip.branch ?? '', institution: eduDip.institution, year: eduDip.yearOfPassing, score: s.score, scoreType: eduDip.scoreType as MarkFormat, secured: s.secured, total: s.total });
        setClass12(makeDefaultEdu().class12);
      } else if (edu12) {
        setEdu12Type('Class 12');
        const s = parseScore(edu12.score, edu12.scoreType);
        setClass12({ board: edu12.board, institution: edu12.institution, specialization: edu12.specialization ?? '', year: edu12.yearOfPassing, score: s.score, scoreType: edu12.scoreType as MarkFormat, secured: s.secured, total: s.total });
        setDiploma(makeDefaultEdu().diploma);
      } else {
        setEdu12Type('Class 12');
        setClass12(makeDefaultEdu().class12);
        setDiploma(makeDefaultEdu().diploma);
      }

      const eduUG = history.find(e => e.level === 'Undergraduate');
      if (eduUG) {
        setCurrentCGPA(eduUG.score ?? '');
        setCurrentArrears(String(eduUG.currentArrears ?? 0));
        const filled = Array.from({ length: 8 }, (_, i) => {
          const semNum = i + 1;
          const found  = eduUG.semesters.find((s: SemesterMark) => s.sem === semNum);
          return { sem: semNum, sgpa: found ? String(found.sgpa).trim() : '' };
        });
        setDegreeSemesters(filled);
      } else {
        setCurrentCGPA('');
        setCurrentArrears('0');
        setDegreeSemesters(Array.from({ length: 8 }, (_, i) => ({ sem: i + 1, sgpa: '' })));
      }

    } else {
      const def = makeDefaultEdu();
      setNewStudent({
        ...DEFAULT_PROFILE,
        collegeName:    cd?.name ?? '',
        placementCycle: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      });
      setEdu12Type('Class 12');
      setClass10(def.class10);
      setClass12(def.class12);
      setDiploma(def.diploma);
      setDegreeSemesters(Array.from({ length: 8 }, (_, i) => ({ sem: i + 1, sgpa: '' })));
      setCurrentCGPA('');
      setCurrentArrears('0');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditing, readOnly, initialData]);

  // ─── Save ──────────────────────────────────────────────────────────────────────

  const handleSaveStudent = async () => {
    if (readOnly) return; // Guard: should never be called in read-only mode

    const errors: Record<string, boolean> = {};
    if (!newStudent.rollNumber?.trim()) errors.rollNumber = true;
    if (!newStudent.fullName?.trim())   errors.fullName   = true;
    if (!newStudent.branch?.trim())     errors.branch     = true;
    if (!newStudent.batch)              errors.batch      = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      alert('Please fill mandatory fields: Roll No, Name, Branch, Batch.');
      setWizardStep(1);
      return;
    }

    setIsSaving(true);
    try {
      const educationHistory: any[] = [];

      if (class10.year || class10.score || class10.secured) {
        educationHistory.push({
          level: 'Class 10', board: class10.board, institution: class10.institution,
          yearOfPassing: class10.year, score: buildScoreString(class10), scoreType: class10.scoreType,
        });
      }

      if (edu12Type === 'Class 12') {
        if (class12.year || class12.score || class12.secured) {
          educationHistory.push({
            level: 'Class 12', board: class12.board, institution: class12.institution,
            yearOfPassing: class12.year, score: buildScoreString(class12), scoreType: class12.scoreType,
            specialization: class12.specialization,
          });
        }
      } else {
        if (diploma.year || diploma.score || diploma.secured) {
          educationHistory.push({
            level: 'Diploma', board: 'SBTET', institution: diploma.institution,
            yearOfPassing: diploma.year, score: buildScoreString(diploma), scoreType: diploma.scoreType,
            branch: diploma.branch,
          });
        }
      }

      const finalSemesters = degreeSemesters
        .map(s => edu12Type === 'Diploma' && (s.sem === 1 || s.sem === 2) ? { ...s, sgpa: '' } : s)
        .filter(s => s.sgpa !== '');

      educationHistory.push({
        level: 'Undergraduate', board: 'University',
        institution: newStudent.collegeName ?? '',
        yearOfPassing: String(newStudent.batch ?? ''),
        score: currentCGPA || '0', scoreType: 'CGPA',
        branch: newStudent.branch,
        currentArrears: parseInt(currentArrears) || 0,
        semesters: finalSemesters,
      });

      const root = initialData as any;
      const payload = {
        name:          newStudent.fullName       ?? '',
        email:         newStudent.instituteEmail ?? root?.email         ?? '',
        phone:         newStudent.phone          ?? root?.phone         ?? '',
        aadhaarNumber: newStudent.aadhaarNumber  ?? root?.aadhaarNumber ?? '',
        collegeId,
        studentProfile: {
          rollNumber:       newStudent.rollNumber       ?? '',
          branch:           newStudent.branch           ?? '',
          batch:            newStudent.batch,
          course:           newStudent.course           ?? 'B.Tech',
          gender:           newStudent.gender           ?? 'MALE',
          placementCycle:   newStudent.placementCycle   ?? '',
          dob:              newStudent.dob              ?? '',
          nationality:      newStudent.nationality      ?? '',
          religion:         newStudent.religion         ?? '',
          mentor:           newStudent.mentor           ?? '',
          advisor:          newStudent.advisor          ?? '',
          coordinator:      newStudent.coordinator      ?? '',
          instituteEmail:   newStudent.instituteEmail   ?? '',
          personalEmail:    newStudent.alternativeEmail ?? '',
          whatsappNumber:   newStudent.whatsappNumber   ?? '',
          fatherName:       newStudent.fatherName       ?? '',
          motherName:       newStudent.motherName       ?? '',
          fatherOccupation: newStudent.fatherOccupation ?? '',
          motherOccupation: newStudent.motherOccupation ?? '',
          parentPhone:      newStudent.parentPhone      ?? '',
          parentEmail:      newStudent.parentEmail      ?? '',
          educationHistory,
        },
      };

      onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────────

  const steps = [
    { label: 'Identity',  icon: User },
    { label: 'Contact',   icon: Phone },
    { label: 'Academics', icon: GraduationCap },
  ];

  const modalTitle = readOnly
    ? 'Student Profile Details'
    : isEditing
      ? 'Edit Student Profile'
      : 'Add New Student';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="max-w-4xl">

      {/* Read-only banner */}
      {readOnly && (
        <div className="mx-8 mt-4 flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
          <Eye size={14} className="text-indigo-500 shrink-0" />
          <p className="text-xs text-indigo-700 font-medium">
            You are viewing this profile in read-only mode. No changes can be made.
          </p>
        </div>
      )}

      {/* Step tabs */}
      <div className="px-8 pt-6 pb-4 border-b bg-gray-50">
        <div className="flex items-center">
          {steps.map((step, idx) => {
            const stepNum  = idx + 1;
            const Icon     = step.icon;
            const isActive = wizardStep === stepNum;
            const isDone   = wizardStep  > stepNum;
            return (
              <React.Fragment key={step.label}>
                <button
                  onClick={() => setWizardStep(stepNum)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                    ${isActive ? 'bg-indigo-600 text-white shadow-md'
                    : isDone   ? 'text-indigo-600 hover:bg-indigo-50'
                               : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <Icon size={15} />
                  {step.label}
                  {isDone && <CheckCircle size={14} className="ml-1" />}
                </button>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded-full ${isDone ? 'bg-indigo-300' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-8 max-h-[65vh]">
        {wizardStep === 1 && (
          <Step1Identity
            newStudent={newStudent}
            setNewStudent={readOnly ? noop : setNewStudent}
            isEditing={isEditing}
            collegeDetails={collegeDetails}
            formErrors={formErrors}
            readOnly={readOnly}
          />
        )}
        {wizardStep === 2 && (
          <Step2Contact
            newStudent={newStudent}
            setNewStudent={readOnly ? noop : setNewStudent}
            readOnly={readOnly}
          />
        )}
        {wizardStep === 3 && (
          <Step3Academics
            class10={class10}               setClass10={readOnly ? noop : setClass10}
            class12={class12}               setClass12={readOnly ? noop : setClass12}
            diploma={diploma}               setDiploma={readOnly ? noop : setDiploma}
            degreeSemesters={degreeSemesters} setDegreeSemesters={readOnly ? noop : setDegreeSemesters}
            currentCGPA={currentCGPA}       setCurrentCGPA={readOnly ? noop : setCurrentCGPA}
            currentArrears={currentArrears} setCurrentArrears={readOnly ? noop : setCurrentArrears}
            edu12Type={edu12Type}           setEdu12Type={readOnly ? noop : setEdu12Type}
            readOnly={readOnly}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t flex justify-between bg-gray-50">
        {wizardStep > 1 ? (
          <button
            onClick={() => setWizardStep(s => s - 1)}
            className="px-6 py-2 border rounded-lg font-bold flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} /> Back
          </button>
        ) : <div />}

        <div className="flex gap-3">
          {/* In read-only mode show Close instead of Save */}
          {readOnly ? (
            <button
              onClick={onClose}
              className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          ) : wizardStep < 3 ? (
            <button
              onClick={() => setWizardStep(s => s + 1)}
              className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSaveStudent}
              disabled={isSaving}
              className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : <><CheckCircle size={18} /> Save Student</>}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};