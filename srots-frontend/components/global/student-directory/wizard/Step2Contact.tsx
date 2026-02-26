
// import React from 'react';
// import { Phone, User } from 'lucide-react';
// import { StudentProfile } from '../../../../types';

// /**
//  * Component Name: Step2Contact
//  * Directory: components/global/student-directory/wizard/Step2Contact.tsx
//  * 
//  * Functionality:
//  * - Form fields for student contact: Emails, Phones.
//  * - Parent details: Name, Occupation, Contact.
//  * 
//  * Used In: StudentFormWizard
//  */

// interface Step2ContactProps {
//     newStudent: Partial<StudentProfile>;
//     setNewStudent: React.Dispatch<React.SetStateAction<Partial<StudentProfile>>>;
// }

// export const Step2Contact: React.FC<Step2ContactProps> = ({ newStudent, setNewStudent }) => {
//     return (
//         <div className="space-y-6 animate-in slide-in-from-right-4">
//             <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 text-sm uppercase flex items-center gap-2"><Phone size={16}/> Student Contact Information</h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Institute Email</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.instituteEmail} onChange={e => setNewStudent({...newStudent, instituteEmail: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Alternative Email</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.alternativeEmail} onChange={e => setNewStudent({...newStudent, alternativeEmail: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Phone Number *</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">WhatsApp Number</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.whatsappNumber} onChange={e => setNewStudent({...newStudent, whatsappNumber: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Parent Phone</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.parentPhone} onChange={e => setNewStudent({...newStudent, parentPhone: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Parent Email</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.parentEmail} onChange={e => setNewStudent({...newStudent, parentEmail: e.target.value})} /></div>
//             </div>
//             <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 mt-6 text-sm uppercase flex items-center gap-2"><User size={16}/> Parents Details</h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Father Name</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.fatherName} onChange={e => setNewStudent({...newStudent, fatherName: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Father Occupation</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.fatherOccupation} onChange={e => setNewStudent({...newStudent, fatherOccupation: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Mother Name</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.motherName} onChange={e => setNewStudent({...newStudent, motherName: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Mother Occupation</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={newStudent.motherOccupation} onChange={e => setNewStudent({...newStudent, motherOccupation: e.target.value})} /></div>
//             </div>
//         </div>
//     );
// };


import React from 'react';
import { Phone, User } from 'lucide-react';
import { StudentProfile } from '../../../../types';

/**
 * Step2Contact
 * Path: src/components/global/student-directory/wizard/Step2Contact.tsx
 *
 * CHANGES:
 * - Added `readOnly?: boolean` to Step2ContactProps interface
 * - All inputs get `disabled={readOnly}`
 * - Input styling dims in readOnly mode (bg-gray-50)
 */

interface Step2ContactProps {
    newStudent: Partial<StudentProfile>;
    setNewStudent: React.Dispatch<React.SetStateAction<Partial<StudentProfile>>>;
    readOnly?: boolean;  // ← ADDED
}

export const Step2Contact: React.FC<Step2ContactProps> = ({
    newStudent, setNewStudent, readOnly = false
}) => {

    const inputClass =
        `w-full border p-2 rounded text-sm text-gray-900 transition-colors border-gray-200
        ${readOnly ? 'bg-gray-50 cursor-default' : 'bg-white focus:ring-2 focus:ring-indigo-100 outline-none'}`;

    const set = (key: keyof StudentProfile) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (readOnly) return;
            setNewStudent({ ...newStudent, [key]: e.target.value });
        };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 text-sm uppercase flex items-center gap-2">
                <Phone size={16} /> Student Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Institute Email</label>
                    <input className={inputClass} value={newStudent.instituteEmail ?? ''} onChange={set('instituteEmail')} disabled={readOnly} placeholder="college@example.edu" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Alternative Email</label>
                    <input className={inputClass} value={newStudent.alternativeEmail ?? ''} onChange={set('alternativeEmail')} disabled={readOnly} placeholder="personal@gmail.com" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Phone Number *</label>
                    <input className={inputClass} value={newStudent.phone ?? ''} onChange={set('phone')} disabled={readOnly} placeholder="+91 9XXXXXXXXX" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp Number</label>
                    <input className={inputClass} value={newStudent.whatsappNumber ?? ''} onChange={set('whatsappNumber')} disabled={readOnly} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Parent Phone</label>
                    <input className={inputClass} value={newStudent.parentPhone ?? ''} onChange={set('parentPhone')} disabled={readOnly} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Parent Email</label>
                    <input className={inputClass} value={newStudent.parentEmail ?? ''} onChange={set('parentEmail')} disabled={readOnly} />
                </div>
            </div>

            <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 mt-6 text-sm uppercase flex items-center gap-2">
                <User size={16} /> Parents Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Father Name</label>
                    <input className={inputClass} value={newStudent.fatherName ?? ''} onChange={set('fatherName')} disabled={readOnly} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Father Occupation</label>
                    <input className={inputClass} value={newStudent.fatherOccupation ?? ''} onChange={set('fatherOccupation')} disabled={readOnly} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Mother Name</label>
                    <input className={inputClass} value={newStudent.motherName ?? ''} onChange={set('motherName')} disabled={readOnly} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Mother Occupation</label>
                    <input className={inputClass} value={newStudent.motherOccupation ?? ''} onChange={set('motherOccupation')} disabled={readOnly} />
                </div>
            </div>
        </div>
    );
};