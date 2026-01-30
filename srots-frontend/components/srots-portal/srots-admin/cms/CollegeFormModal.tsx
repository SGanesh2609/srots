import React, { useState, useEffect, useRef } from 'react';
// Fix: Import AddressFormData from types instead of AddressForm
import { College, AddressFormData } from '../../../../types';
import { Building, MapPin, UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from '../../../../components/common/Modal';
import { AddressForm } from '../../../../components/common/AddressForm';
import { ResourceService } from '../../../../services/resourceService';

interface CollegeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (collegeData: Partial<College>, logoFile?: File, addressData?: AddressFormData) => void;
    initialData?: College | null;
}

export const CollegeFormModal: React.FC<CollegeFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<Partial<College>>({
        name: '', code: '', email: '', phone: '', landline: '', type: 'Engineering'
    });
    
    const [addressForm, setAddressForm] = useState<AddressFormData>({
        addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | undefined>(undefined);
    const [isUploading, setIsUploading] = useState(false);
    const [errorList, setErrorList] = useState<string[]>([]); // New state for errors
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setErrorList([]); // Clear errors on open
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    code: initialData.code,
                    email: initialData.email,
                    phone: initialData.phone,
                    landline: initialData.landline || '',
                    type: initialData.type || 'Engineering'
                });
                setAddressForm({
                    addressLine1: initialData.address || '', 
                    addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
                });
                setLogoPreview(initialData.logo);
            } else {
                setFormData({ name: '', code: '', email: '', phone: '', landline: '', type: 'Engineering' });
                setAddressForm({ addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India' });
                setLogoPreview(null);
            }
            setLogoFile(undefined);
        }
    }, [isOpen, initialData]);

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setIsUploading(true);
            try {
                const previewUrl = await ResourceService.uploadFile(file);
                setLogoPreview(previewUrl);
            } catch {
                alert("Error previewing logo");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = () => {
        const missingFields: string[] = [];

        if (!formData.name?.trim()) missingFields.push("College Name");
        if (!formData.code?.trim()) missingFields.push("College Code");
        if (!formData.email?.trim()) missingFields.push("Official Email");
        if (!formData.phone?.trim()) missingFields.push("Mobile Number");
        
        // Address Validations
        if (!addressForm.addressLine1?.trim()) missingFields.push("Address Line 1");
        if (!addressForm.city?.trim()) missingFields.push("City / District");
        if (!addressForm.state?.trim()) missingFields.push("State");
        if (!addressForm.zip?.trim()) missingFields.push("Pincode");

        if (missingFields.length > 0) {
            setErrorList(missingFields);
            return;
        }

        onSave(formData, logoFile, addressForm);
        setErrorList([]);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit College' : 'Add New College'} maxWidth="max-w-lg">
            <div className="p-6 overflow-y-auto space-y-4 max-h-[80vh]">
                <div><label className="text-xs font-bold text-gray-500 uppercase">College Name <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Institute of Technology" /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">College Code <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. AITS" /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Type</label><select className="w-full border p-2 rounded bg-white text-gray-900" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option>Engineering</option><option>Management</option><option>Arts & Science</option><option>Medical</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Email <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Phone <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                </div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Landline</label><input className="w-full border p-2 rounded bg-white text-gray-900" value={formData.landline} onChange={e => setFormData({...formData, landline: e.target.value})} /></div>
                
                <div className="border-t pt-4">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><MapPin size={14}/> College Address <span className="text-red-500">*</span></label>
                    <AddressForm data={addressForm} onChange={setAddressForm} />
                </div>

                <div className="border-t pt-4">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">College Logo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border overflow-hidden">
                            {isUploading ? <Loader2 size={24} className="animate-spin text-blue-600"/> : logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" alt="Logo"/> : <Building size={24} className="text-gray-400"/>}
                        </div>
                        <div>
                            <button onClick={() => logoInputRef.current?.click()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-2"><UploadCloud size={14}/> Upload Logo</button>
                            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                            <p className="text-[10px] text-gray-400 mt-1">Recommended: 200x200px PNG</p>
                        </div>
                    </div>
                </div>

                {errorList.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-2">
                            <AlertCircle size={16} /> Please fill mandatory fields:
                        </div>
                        <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                            {errorList.map((err, idx) => <li key={idx}>{err}</li>)}
                        </ul>
                    </div>
                )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 flex-none">
                <button onClick={onClose} className="px-6 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">Save College</button>
            </div>
        </Modal>
    );
};