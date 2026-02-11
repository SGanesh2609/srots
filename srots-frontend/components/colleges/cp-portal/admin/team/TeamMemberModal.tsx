
import React, { useState, useEffect } from 'react';
// Fix: Import AddressFormData from types instead of AddressForm
import { User, AddressFormData } from '../../../../../types';
import { Info, MapPin, AlertCircle } from 'lucide-react';
import { Modal } from '../../../../common/Modal';
import { AddressForm } from '../../../../common/AddressForm';

/**
 * Component Name: TeamMemberModal
 * Directory: components/colleges/cp-portal/admin/team/TeamMemberModal.tsx
 * 
 * Functionality:
 * - Modal form to create or edit a CP Staff member (Sub-TPO).
 * - **UPDATE**: Added validation UI and asterisks.
 */

interface TeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { id: string, name: string, email: string, phone: string, department: string, aadhaar: string, address: AddressFormData }) => void;
    isEditing: boolean;
    initialData?: User | null;
}

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ 
    isOpen, onClose, onSave, isEditing, initialData 
}) => {
    const [form, setForm] = useState({ 
        id: '', fullName: '', email: '', phone: '', department: '', aadhaar: '' 
    });
    
    const [addressForm, setAddressForm] = useState<AddressFormData>({
        addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
    });

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setErrorMsg(null);
            if (isEditing && initialData) {
                setForm({
                    id: initialData.id,
                    fullName: initialData.fullName,
                    email: initialData.email,
                    phone: initialData.phone || '',
                    department: initialData.department || '',
                    aadhaar: initialData.aadhaarNumber || ''
                });
                setAddressForm({
                    addressLine1: initialData.fullAddress || '', 
                    addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
                });
            } else {
                // Reset for Create
                setForm({ id: '', fullName: '', email: '', phone: '', department: '', aadhaar: '' });
                setAddressForm({ addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India' });
            }
        }
    }, [isOpen, isEditing, initialData]);

    const handleSave = () => {
        if (!form.id || !form.fullName || !form.email) {
            setErrorMsg("User ID, Full Name, and Email are mandatory.");
            return;
        }
        
        // Address check (Basic)
        if (!addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.zip) {
            setErrorMsg("Address (Line 1, City, State, Zip) is required.");
            return;
        }

        onSave({ id: form.id, name: form.fullName, email: form.email, phone: form.phone, department: form.department, aadhaar: form.aadhaar, address: addressForm });
        setErrorMsg(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Team Member' : 'Add Team Member'} maxWidth="max-w-lg">
            <div className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                {!isEditing && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2">
                        <Info size={16} className="text-blue-600 mt-0.5 shrink-0"/>
                        <p className="text-xs text-blue-700">Password will be auto-generated: Username - Middle 4 Digits of Aadhaar.</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">User ID <span className="text-red-500">*</span></label>
                        <input 
                            className={`w-full border p-2 rounded bg-white text-gray-900 ${isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
                            value={form.id} 
                            onChange={e => { setForm({...form, id: e.target.value}); setErrorMsg(null); }} 
                            disabled={isEditing}
                            placeholder="e.g. cp_staff_01"
                        />
                    </div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Full Name <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={form.fullName} onChange={e => { setForm({...form, fullName: e.target.value}); setErrorMsg(null); }} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Primary Email <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={form.email} onChange={e => { setForm({...form, email: e.target.value}); setErrorMsg(null); }} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Primary Phone</label><input className="w-full border p-2 rounded bg-white text-gray-900" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Department</label><input className="w-full border p-2 rounded bg-white text-gray-900" value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Aadhaar Number (For Password Gen)</label>
                        <input className="w-full border p-2 rounded bg-white text-gray-900" value={form.aadhaar} onChange={e => setForm({...form, aadhaar: e.target.value})} placeholder="12 Digit UID" />
                    </div>
                    
                    <div className="col-span-2 border-t pt-2">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><MapPin size={14}/> Address Details <span className="text-red-500">*</span></label>
                        <AddressForm data={addressForm} onChange={setAddressForm} />
                    </div>
                </div>
                
                {/* Inline Error */}
                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                        <AlertCircle size={16}/> {errorMsg}
                    </div>
                )}

                <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
                    {isEditing ? 'Save Changes' : 'Create Account'}
                </button>
            </div>
        </Modal>
    );
};



// import React, { useState, useEffect } from 'react';
// // Fix: Import AddressFormData from types instead of AddressForm
// import { User, AddressFormData } from '../../../../../types';
// import { Info, MapPin, AlertCircle } from 'lucide-react';
// import { Modal } from '../../../../common/Modal';
// import { AddressForm } from '../../../../common/AddressForm';

// /**
//  * Component Name: TeamMemberModal
//  * Directory: components/colleges/cp-portal/admin/team/TeamMemberModal.tsx
//  * 
//  * Functionality:
//  * - Modal form to create or edit a CP Staff member (Sub-TPO).
//  * - **UPDATE**: Added validation UI and asterisks.
//  */

// interface TeamMemberModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onSave: (data: { id: string, name: string, email: string, phone: string, department: string, aadhaar: string, address: AddressFormData }) => void;
//     isEditing: boolean;
//     initialData?: User | null;
// }

// export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ 
//     isOpen, onClose, onSave, isEditing, initialData 
// }) => {
//     const [form, setForm] = useState({ 
//         id: '', fullName: '', email: '', phone: '', department: '', aadhaar: '' 
//     });
    
//     const [addressForm, setAddressForm] = useState<AddressFormData>({
//         addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
//     });

//     const [errorMsg, setErrorMsg] = useState<string | null>(null);

//     useEffect(() => {
//         if (isOpen) {
//             setErrorMsg(null);
//             if (isEditing && initialData) {
//                 setForm({
//                     id: initialData.id,
//                     fullName: initialData.fullName,
//                     email: initialData.email,
//                     phone: initialData.phone || '',
//                     department: initialData.department || '',
//                     aadhaar: initialData.aadhaarNumber || ''
//                 });
//                 setAddressForm({
//                     addressLine1: initialData.fullAddress || '', 
//                     addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
//                 });
//             } else {
//                 // Reset for Create
//                 setForm({ id: '', fullName: '', email: '', phone: '', department: '', aadhaar: '' });
//                 setAddressForm({ addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India' });
//             }
//         }
//     }, [isOpen, isEditing, initialData]);

//     const handleSave = () => {
//         if (!form.id || !form.fullName || !form.email) {
//             setErrorMsg("User ID, Full Name, and Email are mandatory.");
//             return;
//         }
        
//         // Address check (Basic)
//         if (!addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.zip) {
//             setErrorMsg("Address (Line 1, City, State, Zip) is required.");
//             return;
//         }

//         onSave({ id: form.id, name: form.fullName, email: form.email, phone: form.phone, department: form.department, aadhaar: form.aadhaar, address: addressForm });
//         setErrorMsg(null);
//     };

//     return (
//         <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Team Member' : 'Add Team Member'} maxWidth="max-w-lg">
//             <div className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
//                 {!isEditing && (
//                     <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2">
//                         <Info size={16} className="text-blue-600 mt-0.5 shrink-0"/>
//                         <p className="text-xs text-blue-700">Password will be auto-generated: Username - Middle 4 Digits of Aadhaar.</p>
//                     </div>
//                 )}

//                 <div className="grid grid-cols-2 gap-4">
//                     <div className="col-span-2">
//                         <label className="text-xs font-bold text-gray-500 uppercase">User ID <span className="text-red-500">*</span></label>
//                         <input 
//                             className={`w-full border p-2 rounded bg-white text-gray-900 ${isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
//                             value={form.id} 
//                             onChange={e => { setForm({...form, id: e.target.value}); setErrorMsg(null); }} 
//                             disabled={isEditing}
//                             placeholder="e.g. cp_staff_01"
//                         />
//                     </div>
//                     <div><label className="text-xs font-bold text-gray-500 uppercase">Full Name <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={form.fullName} onChange={e => { setForm({...form, fullName: e.target.value}); setErrorMsg(null); }} /></div>
//                     <div><label className="text-xs font-bold text-gray-500 uppercase">Primary Email <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={form.email} onChange={e => { setForm({...form, email: e.target.value}); setErrorMsg(null); }} /></div>
//                     <div><label className="text-xs font-bold text-gray-500 uppercase">Primary Phone</label><input className="w-full border p-2 rounded bg-white text-gray-900" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
//                     <div><label className="text-xs font-bold text-gray-500 uppercase">Department</label><input className="w-full border p-2 rounded bg-white text-gray-900" value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
//                     <div className="col-span-2">
//                         <label className="text-xs font-bold text-gray-500 uppercase">Aadhaar Number (For Password Gen)</label>
//                         <input className="w-full border p-2 rounded bg-white text-gray-900" value={form.aadhaar} onChange={e => setForm({...form, aadhaar: e.target.value})} placeholder="12 Digit UID" />
//                     </div>
                    
//                     <div className="col-span-2 border-t pt-2">
//                         <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><MapPin size={14}/> Address Details <span className="text-red-500">*</span></label>
//                         <AddressForm data={addressForm} onChange={setAddressForm} />
//                     </div>
//                 </div>
                
//                 {/* Inline Error */}
//                 {errorMsg && (
//                     <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
//                         <AlertCircle size={16}/> {errorMsg}
//                     </div>
//                 )}

//                 <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
//                     {isEditing ? 'Save Changes' : 'Create Account'}
//                 </button>
//             </div>
//         </Modal>
//     );
// };