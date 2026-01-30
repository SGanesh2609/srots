
import React, { useState, useEffect } from 'react';
import { CollegeService } from '../../../../services/collegeService';
// Fix: Import AddressFormData from types instead of AddressForm
import { User, Role, AddressFormData } from '../../../../types';
import { 
  Download, UserPlus, Search, ToggleLeft, ToggleRight, Trash2, Info, MapPin, AlertCircle
} from 'lucide-react';
import { AddressForm } from '../../../../components/common/AddressForm';
import { Modal } from '../../../../components/common/Modal';
import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';

/**
 * Component Name: CPUsersData
 * Directory: components/srots-portal/srots-admin/cms/CPUsersData.tsx
 * 
 * Functionality:
 * - Managed by Srots Super Admin within CMS > College Detail view.
 * - **CRUD**: Create, Read, Update, Delete Campus Placement (CP) Head and Staff accounts.
 * - **RBAC Update**: Now uses explicit Role.CPH and Role.STAFF selection.
 */

interface CPUsersDataProps {
    collegeId: string;
    collegeCode: string;
    collegeName: string;
    onRefresh?: () => void;
    currentUser: User;
}

export const CPUsersData: React.FC<CPUsersDataProps> = ({ collegeId, collegeCode, collegeName, onRefresh, currentUser }) => {
    const [cpAdminList, setCpAdminList] = useState<User[]>([]);
    const [cpAdminSearch, setCpAdminSearch] = useState('');
    const [showCreateCPAdmin, setShowCreateCPAdmin] = useState(false);
    const [showEditCPAdmin, setShowEditCPAdmin] = useState(false);
    const [selectedCPAdmin, setSelectedCPAdmin] = useState<User | null>(null);
    const [cpAdminForm, setCpAdminForm] = useState({ 
        name: '', email: '', phone: '', department: '', role: Role.STAFF as Role, id: '', aadhaar: ''
    });
    
    const [addressForm, setAddressForm] = useState<AddressFormData>({
        addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
    });
    
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });
    const [formErrors, setFormErrors] = useState<string[]>([]);

    useEffect(() => {
        refreshList();
    }, [collegeId, cpAdminSearch]);

    const refreshList = async () => {
        const results = await CollegeService.searchCPUsers(collegeId, cpAdminSearch);
        setCpAdminList(results);
        if (onRefresh) onRefresh();
    };

    const handleDownloadCollegeData = () => {
        try {
            CollegeService.exportCPUsers(collegeId);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleCreateCPAdmin = async () => {
        const missingFields: string[] = [];
        if (!cpAdminForm.id?.trim()) missingFields.push("User ID");
        if (!cpAdminForm.name?.trim()) missingFields.push("Full Name");
        if (!cpAdminForm.email?.trim()) missingFields.push("Email");
        if (!cpAdminForm.phone?.trim()) missingFields.push("Phone");
        if (!cpAdminForm.department?.trim()) missingFields.push("Department");
        if (!cpAdminForm.aadhaar?.trim()) missingFields.push("Aadhaar Number");
        if (!addressForm.addressLine1?.trim()) missingFields.push("Address Line 1");
        if (!addressForm.city?.trim()) missingFields.push("City");
        if (!addressForm.state?.trim()) missingFields.push("State");
        if (!addressForm.zip?.trim()) missingFields.push("Zip Code");

        if (missingFields.length > 0) {
            setFormErrors(missingFields);
            return;
        }
        
        await CollegeService.createCPAdmin({
            id: cpAdminForm.id,
            // Note: service uses name for payload
            name: cpAdminForm.name,
            email: cpAdminForm.email,
            phone: cpAdminForm.phone,
            department: cpAdminForm.department,
            aadhaar: cpAdminForm.aadhaar,
            address: addressForm, 
            collegeId: collegeId,
            role: cpAdminForm.role,
            isCollegeHead: cpAdminForm.role === Role.CPH,
            createdBy: currentUser.id
        });
        
        refreshList();
        setShowCreateCPAdmin(false);
        resetCpAdminForm();
        alert(`Account Created Successfully!`);
    };

    const handleUpdateCPAdmin = async () => {
        if (!selectedCPAdmin) return;
        
        // Fix: Use 'fullName' instead of 'name' for type 'User'
        const updatedUser: User = { 
            ...selectedCPAdmin, 
            fullName: cpAdminForm.name, 
            email: cpAdminForm.email, 
            phone: cpAdminForm.phone, 
            department: cpAdminForm.department, 
            role: cpAdminForm.role,
            isCollegeHead: cpAdminForm.role === Role.CPH,
            id: cpAdminForm.id, 
            aadhaarNumber: cpAdminForm.aadhaar,
        };
        await CollegeService.updateCPAdmin(updatedUser, addressForm); 
        refreshList();
        setShowEditCPAdmin(false);
        setSelectedCPAdmin(null);
        resetCpAdminForm();
    };

    const resetCpAdminForm = () => {
        setCpAdminForm({ name: '', email: '', phone: '', department: '', role: Role.STAFF, id: '', aadhaar: '' });
        setAddressForm({ addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India' });
        setFormErrors([]);
    };
    
    const openEditCPAdmin = (cpUser: User) => {
        setSelectedCPAdmin(cpUser);
        setCpAdminForm({ 
            // Fix: Use cpUser.fullName instead of cpUser.name
            name: cpUser.fullName, 
            email: cpUser.email, 
            phone: cpUser.phone || '', 
            department: cpUser.department || '', 
            role: cpUser.role as Role, 
            id: cpUser.id, 
            aadhaar: cpUser.aadhaarNumber || ''
        });
        setAddressForm({
            addressLine1: cpUser.fullAddress || '', 
            addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
        });
        setFormErrors([]);
        setShowEditCPAdmin(true);
    };

    const handleToggleCPAdminAccess = async (cpUser: User) => {
        const updatedUser = { ...cpUser, isRestricted: !cpUser.isRestricted };
        await CollegeService.updateCPAdmin(updatedUser);
        refreshList();
    };

    const requestDeleteCPAdmin = (id: string) => {
        setDeleteConfirm({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.id) {
            await CollegeService.deleteCPAdmin(deleteConfirm.id);
            refreshList();
            setDeleteConfirm({ isOpen: false, id: null });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 animate-in fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">College Placement Users</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage Heads and Staff for {collegeCode}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <button onClick={handleDownloadCollegeData} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-bold shadow-sm transition-colors">
                        <Download size={16} /> <span className="whitespace-nowrap">Download List</span>
                    </button>
                    <button onClick={() => setShowCreateCPAdmin(true)} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm text-sm font-bold transition-colors">
                        <UserPlus size={16} /> <span className="whitespace-nowrap">Create CP Account</span>
                    </button>
                </div>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
                    placeholder="Search by Username, Full Name or Email..." 
                    value={cpAdminSearch} 
                    onChange={(e) => setCpAdminSearch(e.target.value)}
                />
            </div>

            <div className="border rounded-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-[25%]">Name</th>
                                <th className="px-6 py-4 w-[20%]">Details</th>
                                <th className="px-6 py-4 w-[15%]">Role</th>
                                <th className="px-6 py-4 w-[15%]">Status</th>
                                <th className="px-6 py-4 w-[25%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {cpAdminList.map((cp) => (
                                <tr key={cp.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => openEditCPAdmin(cp)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={cp.avatar} alt={cp.fullName} className="w-9 h-9 rounded-full bg-gray-200 border border-gray-100 shrink-0" />
                                            <div className="truncate max-w-[180px]">
                                                {/* Fix: Use cp.fullName instead of cp.name */}
                                                <span className="font-bold text-gray-900 block truncate" title={cp.fullName}>{cp.fullName}</span>
                                                <span className="text-xs text-gray-500 font-mono truncate block" title={cp.id}>{cp.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-xs space-y-1">
                                        <div className="truncate" title={cp.email}><span className="font-semibold">Email:</span> {cp.email}</div>
                                        <div><span className="font-semibold">Phone:</span> {cp.phone || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[10px] rounded-full border font-bold flex items-center gap-1 w-fit uppercase tracking-wide ${cp.role === Role.CPH ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {cp.role === Role.CPH ? 'CP Head' : 'Placement Staff'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[10px] rounded-full font-bold border uppercase tracking-wide ${!cp.isRestricted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {!cp.isRestricted ? 'Active' : 'Restricted'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleToggleCPAdminAccess(cp); }} 
                                                className={`p-1.5 rounded transition-colors border ${cp.isRestricted ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100' : 'text-red-500 bg-red-50 border-red-200 hover:bg-red-100'}`}
                                                title={cp.isRestricted ? "Activate" : "Restrict"}
                                            >
                                                {cp.isRestricted ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); requestDeleteCPAdmin(cp.id); }} 
                                                className="p-1.5 rounded text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors" 
                                                title="Delete Account"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={showCreateCPAdmin} onClose={() => { setShowCreateCPAdmin(false); resetCpAdminForm(); }} title="Create CP User Account">
                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">User ID <span className="text-red-500">*</span></label>
                            <input className="w-full border p-2 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none" value={cpAdminForm.id} onChange={e => setCpAdminForm({...cpAdminForm, id: e.target.value})} placeholder="e.g. cp_admin_01" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Account Role <span className="text-red-500">*</span></label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={cpAdminForm.role === Role.CPH} onChange={() => setCpAdminForm({...cpAdminForm, role: Role.CPH})} /> <span className="text-sm font-bold text-gray-700">CP Head (Admin)</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={cpAdminForm.role === Role.STAFF} onChange={() => setCpAdminForm({...cpAdminForm, role: Role.STAFF})} /> <span className="text-sm font-bold text-gray-700">Placement Staff (Execution)</span></label>
                            </div>
                        </div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Full Name <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={cpAdminForm.name} onChange={e => setCpAdminForm({...cpAdminForm, name: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Email <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={cpAdminForm.email} onChange={e => setCpAdminForm({...cpAdminForm, email: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Phone <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={cpAdminForm.phone} onChange={e => setCpAdminForm({...cpAdminForm, phone: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Department <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={cpAdminForm.department} onChange={e => setCpAdminForm({...cpAdminForm, department: e.target.value})} /></div>
                        <div className="col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Aadhaar Number <span className="text-red-500">*</span></label><input className="w-full border p-2 rounded bg-white text-gray-900" value={cpAdminForm.aadhaar} onChange={e => setCpAdminForm({...cpAdminForm, aadhaar: e.target.value})} placeholder="12 Digit UID" /></div>
                        <div className="col-span-2 border-t pt-2">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><MapPin size={14}/> Residential Address</label>
                            <AddressForm data={addressForm} onChange={setAddressForm} />
                        </div>
                    </div>
                    {formErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in slide-in-from-top-2">
                            <ul className="list-disc list-inside text-xs text-red-600">
                                {formErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                            </ul>
                        </div>
                    )}
                    <button onClick={handleCreateCPAdmin} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 mt-4">Create Account</button>
                </div>
            </Modal>

            <Modal isOpen={showEditCPAdmin} onClose={() => setShowEditCPAdmin(false)} title="Edit CP User Details">
                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">User ID</label>
                            <input className="w-full border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed" value={cpAdminForm.id} disabled />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Account Role</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={cpAdminForm.role === Role.CPH} onChange={() => setCpAdminForm({...cpAdminForm, role: Role.CPH})} /> <span className="text-sm font-bold text-gray-700">CP Head (Admin)</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={cpAdminForm.role === Role.STAFF} onChange={() => setCpAdminForm({...cpAdminForm, role: Role.STAFF})} /> <span className="text-sm font-bold text-gray-700">Placement Staff (Execution)</span></label>
                            </div>
                        </div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Full Name</label><input className="w-full border p-2 rounded bg-white text-gray-900" value={cpAdminForm.name} onChange={e => setCpAdminForm({...cpAdminForm, name: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Email</label><input className="w-full border p-2 rounded bg-white text-gray-900" value={cpAdminForm.email} onChange={e => setCpAdminForm({...cpAdminForm, email: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Phone</label><input className="w-full border p-2 rounded bg-white text-gray-900" value={cpAdminForm.phone} onChange={e => setCpAdminForm({...cpAdminForm, phone: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Department</label><input className="w-full border p-2 rounded bg-white text-gray-900" value={cpAdminForm.department} onChange={e => setCpAdminForm({...cpAdminForm, department: e.target.value})} /></div>
                        <div className="col-span-2 border-t pt-2">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><MapPin size={14}/> Residential Address</label>
                            <AddressForm data={addressForm} onChange={setAddressForm} />
                        </div>
                    </div>
                    <button onClick={handleUpdateCPAdmin} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 mt-4">Save Changes</button>
                </div>
            </Modal>

            <DeleteConfirmationModal isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, id: null })} onConfirm={confirmDelete} title="Delete User Account?" message="This action cannot be undone." />
        </div>
    );
};
