
// import React from 'react';
// import { Info, Shield } from 'lucide-react';
// import { StudentProfile, College } from '../../../../types';

// /**
//  * Component Name: Step1Identity
//  * Directory: components/global/student-directory/wizard/Step1Identity.tsx
//  * 
//  * Functionality:
//  * - Form fields for basic student info: Roll No, Name, Branch, Batch, DOB, Gender.
//  * - Identity fields: Aadhaar, Nationality, Religion.
//  * - Point of Contact: Mentor, Advisor, Coordinator.
//  * 
//  * Used In: StudentFormWizard
//  */

// interface Step1IdentityProps {
//     newStudent: Partial<StudentProfile>;
//     setNewStudent: React.Dispatch<React.SetStateAction<Partial<StudentProfile>>>;
//     isEditing: boolean;
//     collegeDetails?: College;
//     formErrors: Record<string, boolean>;
// }

// export const Step1Identity: React.FC<Step1IdentityProps> = ({ 
//     newStudent, setNewStudent, isEditing, collegeDetails, formErrors 
// }) => {
//     const getInputClass = (fieldName: string) => `w-full border p-2 rounded text-sm bg-white text-gray-900 ${formErrors[fieldName] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`;

//     return (
//         <div className="space-y-6 animate-in slide-in-from-right-4">
//             <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
//                 <Info size={20} className="text-blue-600 mt-0.5 shrink-0"/>
//                 <div>
//                     <h4 className="font-bold text-blue-900 text-sm">Institutional Identity</h4>
//                     <p className="text-xs text-blue-700 mt-1">These fields define the student's official record and cannot be edited by the student later.</p>
//                 </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Roll Number *</label><input className={getInputClass('rollNumber')} value={newStudent.rollNumber} onChange={e => setNewStudent({...newStudent, rollNumber: e.target.value})} disabled={isEditing} placeholder="e.g. 20701A0501" /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Full Name *</label><input className={getInputClass('fullName')} value={newStudent.fullName} onChange={e => setNewStudent({...newStudent, fullName: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Branch *</label>
//                     <select className="w-full p-2 rounded bg-white text-gray-900 border text-sm" value={newStudent.branch} onChange={e => setNewStudent({...newStudent, branch: e.target.value})}>
//                         <option value="">Select Branch</option>
//                         {collegeDetails?.branches?.map(b => <option key={b.code} value={b.code}>{b.code}</option>)}
//                     </select>
//                 </div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Course *</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.course} onChange={e => setNewStudent({...newStudent, course: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Passed Out Year *</label><input type="number" className={getInputClass('batch')} value={newStudent.batch} onChange={e => setNewStudent({...newStudent, batch: parseInt(e.target.value)})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Gender *</label><select className="w-full p-2 rounded bg-white text-gray-900 border text-sm" value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value as any})}><option>MALE</option><option>FEMALE</option></select></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Placement Cycle</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.placementCycle} onChange={e => setNewStudent({...newStudent, placementCycle: e.target.value})} placeholder="e.g. 2025-2026"/></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Birthday *</label><input type="date" className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.dob} onChange={e => setNewStudent({...newStudent, dob: e.target.value})} /></div>
//             </div>
//             <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 mt-6 text-sm uppercase flex items-center gap-2"><Shield size={16}/> Identity & Background (Official)</h4>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Aadhaar Number</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.aadhaarNumber} onChange={e => setNewStudent({...newStudent, aadhaarNumber: e.target.value})} placeholder="12 Digit UID"/></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Nationality</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.nationality} onChange={e => setNewStudent({...newStudent, nationality: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Religion</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.religion} onChange={e => setNewStudent({...newStudent, religion: e.target.value})} /></div>
//             </div>
//             <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 mt-6 text-sm uppercase flex items-center gap-2">Student Point of Contacts (POC)</h4>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Mentor</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.mentor} onChange={e => setNewStudent({...newStudent, mentor: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Advisor</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.advisor} onChange={e => setNewStudent({...newStudent, advisor: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Coordinator</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.coordinator} onChange={e => setNewStudent({...newStudent, coordinator: e.target.value})} /></div>
//             </div>
//         </div>
//     );
// };


import React from 'react';
import { Info, Shield } from 'lucide-react';
import { StudentProfile, College } from '../../../../types';

/**
 * Step1Identity
 * Path: src/components/global/student-directory/wizard/Step1Identity.tsx
 *
 * CHANGES:
 * - Added `readOnly?: boolean` to Step1IdentityProps interface
 * - All inputs get `disabled={isEditing || readOnly}` or `disabled={readOnly}`
 * - Info banner hidden in readOnly mode (CPH already sees top-level banner)
 * - Input styling dims in readOnly mode (bg-gray-50, no focus ring)
 */

interface Step1IdentityProps {
    newStudent: Partial<StudentProfile>;
    setNewStudent: React.Dispatch<React.SetStateAction<Partial<StudentProfile>>>;
    isEditing: boolean;
    collegeDetails?: College;
    formErrors: Record<string, boolean>;
    readOnly?: boolean;  // ← ADDED
}

export const Step1Identity: React.FC<Step1IdentityProps> = ({
    newStudent, setNewStudent, isEditing, collegeDetails, formErrors, readOnly = false
}) => {

    const getInputClass = (fieldName: string) =>
        `w-full border p-2 rounded text-sm text-gray-900 transition-colors
        ${formErrors[fieldName] ? 'border-red-500 bg-red-50' : 'border-gray-200'}
        ${readOnly ? 'bg-gray-50 cursor-default' : 'bg-white focus:ring-2 focus:ring-indigo-100 outline-none'}`;

    const getSelectClass = () =>
        `w-full p-2 rounded border text-sm text-gray-900 transition-colors border-gray-200
        ${readOnly ? 'bg-gray-50 cursor-default' : 'bg-white focus:ring-2 focus:ring-indigo-100 outline-none'}`;

    const set = (key: keyof StudentProfile) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            if (readOnly) return;
            setNewStudent({ ...newStudent, [key]: e.target.value });
        };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">

            {/* Info banner — hidden in readOnly (CPH sees top-level banner instead) */}
            {!readOnly && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm">Institutional Identity</h4>
                        <p className="text-xs text-blue-700 mt-1">
                            These fields define the student's official record and cannot be edited by the student later.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Roll Number *</label>
                    <input
                        className={getInputClass('rollNumber')}
                        value={newStudent.rollNumber ?? ''}
                        onChange={set('rollNumber')}
                        disabled={isEditing || readOnly}
                        placeholder="e.g. 20701A0501"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name *</label>
                    <input
                        className={getInputClass('fullName')}
                        value={newStudent.fullName ?? ''}
                        onChange={set('fullName')}
                        disabled={readOnly}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Branch *</label>
                    <select
                        className={getSelectClass()}
                        value={newStudent.branch ?? ''}
                        onChange={set('branch')}
                        disabled={readOnly}
                    >
                        <option value="">Select Branch</option>
                        {collegeDetails?.branches?.map(b => (
                            <option key={b.code} value={b.code}>{b.code}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Course *</label>
                    <input
                        className={getInputClass('course')}
                        value={newStudent.course ?? ''}
                        onChange={set('course')}
                        disabled={readOnly}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Passed Out Year *</label>
                    <input
                        type="number"
                        className={getInputClass('batch')}
                        value={newStudent.batch ?? ''}
                        onChange={e => { if (!readOnly) setNewStudent({ ...newStudent, batch: parseInt(e.target.value) }); }}
                        disabled={readOnly}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Gender *</label>
                    <select
                        className={getSelectClass()}
                        value={newStudent.gender ?? 'MALE'}
                        onChange={set('gender')}
                        disabled={readOnly}
                    >
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="OTHER">OTHER</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Placement Cycle</label>
                    <input
                        className={getInputClass('placementCycle')}
                        value={newStudent.placementCycle ?? ''}
                        onChange={set('placementCycle')}
                        disabled={readOnly}
                        placeholder="e.g. 2025-2026"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Date of Birth</label>
                    <input
                        type="date"
                        className={getInputClass('dob')}
                        value={newStudent.dob ?? ''}
                        onChange={set('dob')}
                        disabled={readOnly}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">College Name</label>
                    <input
                        className={getInputClass('collegeName')}
                        value={newStudent.collegeName ?? ''}
                        onChange={set('collegeName')}
                        disabled={readOnly}
                    />
                </div>
            </div>

            {/* Identity & Background */}
            <h4 className="font-bold text-gray-800 border-b pb-2 mt-6 text-sm uppercase flex items-center gap-2">
                <Shield size={16} /> Identity &amp; Background (Official)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Aadhaar Number</label>
                    <input
                        className={getInputClass('aadhaarNumber')}
                        value={newStudent.aadhaarNumber ?? ''}
                        onChange={set('aadhaarNumber')}
                        disabled={readOnly}
                        placeholder="12 Digit UID"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Nationality</label>
                    <input
                        className={getInputClass('nationality')}
                        value={newStudent.nationality ?? ''}
                        onChange={set('nationality')}
                        disabled={readOnly}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Religion</label>
                    <input
                        className={getInputClass('religion')}
                        value={newStudent.religion ?? ''}
                        onChange={set('religion')}
                        disabled={readOnly}
                    />
                </div>
            </div>

            {/* POC */}
            <h4 className="font-bold text-gray-800 border-b pb-2 mt-6 text-sm uppercase">
                Student Point of Contacts (POC)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Mentor</label>
                    <input
                        className={getInputClass('mentor')}
                        value={newStudent.mentor ?? ''}
                        onChange={set('mentor')}
                        disabled={readOnly}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Advisor</label>
                    <input
                        className={getInputClass('advisor')}
                        value={newStudent.advisor ?? ''}
                        onChange={set('advisor')}
                        disabled={readOnly}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Coordinator</label>
                    <input
                        className={getInputClass('coordinator')}
                        value={newStudent.coordinator ?? ''}
                        onChange={set('coordinator')}
                        disabled={readOnly}
                    />
                </div>
            </div>
        </div>
    );
};