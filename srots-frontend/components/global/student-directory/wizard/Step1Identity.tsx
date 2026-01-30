
import React from 'react';
import { Info, Shield } from 'lucide-react';
import { StudentProfile, College } from '../../../../types';

/**
 * Component Name: Step1Identity
 * Directory: components/global/student-directory/wizard/Step1Identity.tsx
 * 
 * Functionality:
 * - Form fields for basic student info: Roll No, Name, Branch, Batch, DOB, Gender.
 * - Identity fields: Aadhaar, Nationality, Religion.
 * - Point of Contact: Mentor, Advisor, Coordinator.
 * 
 * Used In: StudentFormWizard
 */

interface Step1IdentityProps {
    newStudent: Partial<StudentProfile>;
    setNewStudent: React.Dispatch<React.SetStateAction<Partial<StudentProfile>>>;
    isEditing: boolean;
    collegeDetails?: College;
    formErrors: Record<string, boolean>;
}

export const Step1Identity: React.FC<Step1IdentityProps> = ({ 
    newStudent, setNewStudent, isEditing, collegeDetails, formErrors 
}) => {
    const getInputClass = (fieldName: string) => `w-full border p-2 rounded text-sm bg-white text-gray-900 ${formErrors[fieldName] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`;

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                <Info size={20} className="text-blue-600 mt-0.5 shrink-0"/>
                <div>
                    <h4 className="font-bold text-blue-900 text-sm">Institutional Identity</h4>
                    <p className="text-xs text-blue-700 mt-1">These fields define the student's official record and cannot be edited by the student later.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div><label className="text-xs font-bold text-gray-500 uppercase">Roll Number *</label><input className={getInputClass('rollNumber')} value={newStudent.rollNumber} onChange={e => setNewStudent({...newStudent, rollNumber: e.target.value})} disabled={isEditing} placeholder="e.g. 20701A0501" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Full Name *</label><input className={getInputClass('fullName')} value={newStudent.fullName} onChange={e => setNewStudent({...newStudent, fullName: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Branch *</label>
                    <select className="w-full p-2 rounded bg-white text-gray-900 border text-sm" value={newStudent.branch} onChange={e => setNewStudent({...newStudent, branch: e.target.value})}>
                        <option value="">Select Branch</option>
                        {collegeDetails?.branches?.map(b => <option key={b.code} value={b.code}>{b.code}</option>)}
                    </select>
                </div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Course *</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.course} onChange={e => setNewStudent({...newStudent, course: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Passed Out Year *</label><input type="number" className={getInputClass('batch')} value={newStudent.batch} onChange={e => setNewStudent({...newStudent, batch: parseInt(e.target.value)})} /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Gender *</label><select className="w-full p-2 rounded bg-white text-gray-900 border text-sm" value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value as any})}><option>MALE</option><option>FEMALE</option></select></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Placement Cycle</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.placementCycle} onChange={e => setNewStudent({...newStudent, placementCycle: e.target.value})} placeholder="e.g. 2025-2026"/></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Birthday *</label><input type="date" className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.dob} onChange={e => setNewStudent({...newStudent, dob: e.target.value})} /></div>
            </div>
            <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 mt-6 text-sm uppercase flex items-center gap-2"><Shield size={16}/> Identity & Background (Official)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="text-xs font-bold text-gray-500 uppercase">Aadhaar Number</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.aadhaarNumber} onChange={e => setNewStudent({...newStudent, aadhaarNumber: e.target.value})} placeholder="12 Digit UID"/></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Nationality</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.nationality} onChange={e => setNewStudent({...newStudent, nationality: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Religion</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.religion} onChange={e => setNewStudent({...newStudent, religion: e.target.value})} /></div>
            </div>
            <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 mt-6 text-sm uppercase flex items-center gap-2">Student Point of Contacts (POC)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="text-xs font-bold text-gray-500 uppercase">Mentor</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.mentor} onChange={e => setNewStudent({...newStudent, mentor: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Advisor</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.advisor} onChange={e => setNewStudent({...newStudent, advisor: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Coordinator</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.coordinator} onChange={e => setNewStudent({...newStudent, coordinator: e.target.value})} /></div>
            </div>
        </div>
    );
};
