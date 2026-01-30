
// import React, { useState } from 'react';
// // Fix: Import AddressFormData from types instead of AddressForm
// import { User, AddressFormData } from '../../../../types';
// import { MapPin, AlertCircle } from 'lucide-react';
// import { AddressForm } from '../../../common/AddressForm';
// import { Modal } from '../../../common/Modal';

// /**
//  * Component Name: TeamMemberFormModal
//  * Directory: components/srots-portal/shared/team/TeamMemberFormModal.tsx
//  * 
//  * Functionality:
//  * - A modal form to add a new Srots Developer account.
//  * - **UPDATE**: Added validation UI and asterisks.
//  */

// interface TeamMemberFormModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onSave: (data: { id: string, name: string, email: string, phone: string, department: string, address: AddressFormData }) => void;
// }

// export const TeamMemberFormModal: React.FC<TeamMemberFormModalProps> = ({ isOpen, onClose, onSave }) => {
//     const [devForm, setDevForm] = useState({
//         id: '', fullName: '', email: '', phone: '', department: 'Development', password: ''
//     });

//     const [addressForm, setAddressForm] = useState<AddressFormData>({
//         addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
//     });

//     const [errorList, setErrorList] = useState<string[]>([]);

//     const handleSubmit = () => {
//         const missing: string[] = [];
//         if (!devForm.id?.trim()) missing.push("Username / ID");
//         if (!devForm.fullName?.trim()) missing.push("Full Name");
//         if (!devForm.email?.trim()) missing.push("Email");
//         if (!devForm.phone?.trim()) missing.push("Phone");
//         if (!addressForm.addressLine1?.trim()) missing.push("Address Line 1");
//         if (!addressForm.city?.trim()) missing.push("City");
//         if (!addressForm.state?.trim()) missing.push("State");
//         if (!addressForm.zip?.trim()) missing.push("Zip Code");

//         if (missing.length > 0) {
//             setErrorList(missing);
//             return;
//         }

//         onSave({
//             id: devForm.id,
//             name: devForm.fullName,
//             email: devForm.email,
//             phone: devForm.phone,
//             department: devForm.department,
//             address: addressForm
//         });

//         setErrorList([]);
//         setDevForm({ id: '', fullName: '', email: '', phone: '', department: 'Development', password: '' });
//         setAddressForm({ addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India' });
//     };

//     return (
//         <Modal isOpen={isOpen} onClose={onClose} title="Create Srots Developer Account" maxWidth="max-w-lg">
//             <div className="p-6 overflow-y-auto space-y-4 max-h-[80vh]">
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Username / ID <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none" value={devForm.id} onChange={e => setDevForm({...devForm, id: e.target.value})} placeholder="e.g. dev_john" /></div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Full Name <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none" value={devForm.fullName} onChange={e => setDevForm({...devForm, fullName: e.target.value})} /></div>
//                 <div className="grid grid-cols-2 gap-4">
//                     <div><label className="text-xs font-bold text-gray-500 uppercase">Email <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none" value={devForm.email} onChange={e => setDevForm({...devForm, email: e.target.value})} /></div>
//                     <div><label className="text-xs font-bold text-gray-500 uppercase">Phone <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none" value={devForm.phone} onChange={e => setDevForm({...devForm, phone: e.target.value})} /></div>
//                 </div>
//                 <div><label className="text-xs font-bold text-gray-500 uppercase">Department</label><input className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none" value={devForm.department} onChange={e => setDevForm({...devForm, department: e.target.value})} /></div>
                
//                 <div className="border-t pt-4">
//                     <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><MapPin size={14}/> Address Details <span className="text-red-500">*</span></label>
//                     <AddressForm data={addressForm} onChange={setAddressForm} />
//                 </div>

//                 {/* INLINE ERROR MESSAGE */}
//                 {errorList.length > 0 && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in slide-in-from-top-2">
//                         <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-2">
//                             <AlertCircle size={16} /> Please fill the following mandatory fields:
//                         </div>
//                         <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
//                             {errorList.map((err, idx) => <li key={idx}>{err}</li>)}
//                         </ul>
//                     </div>
//                 )}
//             </div>
            
//             <div className="p-4 border-t bg-gray-50 flex-none">
//                 <button onClick={handleSubmit} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm">
//                     Create Developer Account
//                 </button>
//             </div>
//         </Modal>
//     );
// };


import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { AddressForm } from '../../../common/AddressForm';
import { Modal } from '../../../common/Modal';
import { AddressFormData, User } from '../../../../types';

interface TeamMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    username: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    address: AddressFormData;
    aadhaarNumber: string;
  }, id?: string) => void;
  initialData?: User; // For edit mode
}

const defaultAddress: AddressFormData = {
  addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
};

export const TeamMemberFormModal: React.FC<TeamMemberFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [devForm, setDevForm] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    department: 'Development',
    aadhaarNumber: '',
    password: '', // unused
  });
  const [addressForm, setAddressForm] = useState<AddressFormData>(defaultAddress);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setIsEdit(true);
        setDevForm({
          username: initialData.username || initialData.userId || '',
          fullName: initialData.fullName || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          department: initialData.department || 'Development',
          aadhaarNumber: initialData.aadhaarNumber || '',
          password: '',
        });
        setAddressForm(initialData.address || defaultAddress);
      } else {
        setIsEdit(false);
        setDevForm({
          username: '',
          fullName: '',
          email: '',
          phone: '',
          department: 'Development',
          aadhaarNumber: '',
          password: '',
        });
        setAddressForm(defaultAddress);
      }
      setErrorList([]);
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    const missing: string[] = [];
    if (!devForm.username?.trim()) missing.push("Username");
    if (!devForm.fullName?.trim()) missing.push("Full Name");
    if (!devForm.email?.trim()) missing.push("Email");
    if (!devForm.phone?.trim()) missing.push("Phone");
    // Aadhaar required only for create (backend generates password from it)
    if (!isEdit && !devForm.aadhaarNumber?.trim()) missing.push("Aadhaar Number");
    else if (devForm.aadhaarNumber && !/^\d{12}$/.test(devForm.aadhaarNumber)) missing.push("Aadhaar must be exactly 12 digits");
    if (!addressForm.addressLine1?.trim()) missing.push("Address Line 1");
    if (!addressForm.city?.trim()) missing.push("City");
    if (!addressForm.state?.trim()) missing.push("State");
    if (!addressForm.zip?.trim()) missing.push("Zip Code");

    if (missing.length > 0) {
      setErrorList(missing);
      return;
    }

    const saveData = {
      username: devForm.username,
      name: devForm.fullName,
      email: devForm.email,
      phone: devForm.phone,
      department: devForm.department,
      address: addressForm,
      aadhaarNumber: devForm.aadhaarNumber,
    };

    onSave(saveData, isEdit ? initialData?.id : undefined);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Srots Developer Account" : "Create Srots Developer Account"} maxWidth="max-w-lg">
      <div className="p-6 overflow-y-auto space-y-4 max-h-[80vh]">
        {/* Username */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Username <span className="text-red-500">*</span></label>
          <input
            className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
            value={devForm.username}
            onChange={e => setDevForm({ ...devForm, username: e.target.value })}
            placeholder="e.g. dev_john"
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Full Name <span className="text-red-500">*</span></label>
          <input
            className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
            value={devForm.fullName}
            onChange={e => setDevForm({ ...devForm, fullName: e.target.value })}
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email <span className="text-red-500">*</span></label>
            <input
              className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
              value={devForm.email}
              onChange={e => setDevForm({ ...devForm, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Phone <span className="text-red-500">*</span></label>
            <input
              className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
              value={devForm.phone}
              onChange={e => setDevForm({ ...devForm, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Aadhaar - Required only for create */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Aadhaar Number { !isEdit && <span className="text-red-500">*</span> }</label>
          <input
            type="text"
            maxLength={12}
            className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
            value={devForm.aadhaarNumber}
            onChange={e => setDevForm({ ...devForm, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
            placeholder="Enter 12-digit Aadhaar"
          />
        </div>

        {/* Department */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
          <input
            className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
            value={devForm.department}
            onChange={e => setDevForm({ ...devForm, department: e.target.value })}
          />
        </div>

        {/* Address */}
        <div className="border-t pt-4">
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1">
            <MapPin size={14} /> Address Details <span className="text-red-500">*</span>
          </label>
          <AddressForm data={addressForm} onChange={setAddressForm} />
        </div>

        {/* Errors */}
        {errorList.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-2">
              <AlertCircle size={16} /> Please fill the following mandatory fields:
            </div>
            <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
              {errorList.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50 flex-none">
        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm"
        >
          {isEdit ? 'Update Developer Account' : 'Create Developer Account'}
        </button>
      </div>
    </Modal>
  );
};