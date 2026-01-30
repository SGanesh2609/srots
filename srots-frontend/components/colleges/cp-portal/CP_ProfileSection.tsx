
import React, { useState, useRef, useEffect } from 'react';
import { User, Role, AddressFormData } from '../../../types';
import { AuthService } from '../../../services/authService';
import { CollegeService } from '../../../services/collegeService';
import { CompanyService } from '../../../services/companyService';
import {
  Edit2, User as UserIcon, Phone, Mail, MapPin,
  Briefcase, GraduationCap, Camera, X,
  Building, Shield, CheckCircle, Lock, Loader2
} from 'lucide-react';
import { AddressForm } from '../../common/AddressForm';

interface CPProfileSectionProps {
    user: User;
    onUpdateUser?: (user: User) => void;
}

export const CP_ProfileSection: React.FC<CPProfileSectionProps> = ({ user, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [collegeName, setCollegeName] = useState('Campus Placement Portal');

    const [formData, setFormData] = useState({
        experience: '',
        education: '',
        bio: '',
        alternativeEmail: '',
        alternativePhone: '',
        department: ''
    });

    const [addressForm, setAddressForm] = useState<AddressFormData>({
        addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
    });

    useEffect(() => {
        setFormData({
            experience: user.experience || '',
            education: user.education || '',
            bio: user.bio || '',
            alternativeEmail: user.alternativeEmail || '',
            alternativePhone: user.alternativePhone || '',
            department: user.department || ''
        });
        
        // Try to parse full address back into form if possible, otherwise placeholder
        setAddressForm({
            addressLine1: user.fullAddress || '', 
            addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
        });
        
        if (user.collegeId) {
            const fetchCollege = async (id: string) => {
                const col = await CollegeService.getCollegeById(id);
                if (col) setCollegeName(col.name);
            };
            fetchCollege(user.collegeId);
        }
    }, [user]);

    const handleSave = async () => {
        if (onUpdateUser) {
            try {
                // AuthService.updateUser handles backend sync and returns updated user object
                const updatedUser = await AuthService.updateUser({
                    ...user,
                    ...formData
                }, addressForm);
                onUpdateUser(updatedUser);
                setIsEditing(false);
                alert("Profile updated successfully!");
            } catch (error) {
                alert("Failed to save changes.");
            }
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onUpdateUser) {
            setIsUploading(true);
            try {
                const file = e.target.files[0];
                const imageUrl = await CompanyService.uploadFile(file);
                const updatedUser = await AuthService.updateUser({ ...user, avatar: imageUrl });
                onUpdateUser(updatedUser);
            } catch (err) {
                alert("Upload failed");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const roleLabel = user.role === Role.CPH ? 'Placement Head' : 'Placement Staff';
    const roleBadgeColor = user.role === Role.CPH ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 p-6">

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative">
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-8 right-8 flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-sm"
                >
                    <Edit2 size={16} /> Edit Profile
                </button>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group shrink-0">
                        <div className="w-32 h-32 rounded-full bg-[#FFE0B2] flex items-center justify-center text-4xl font-medium text-gray-800 overflow-hidden border-4 border-white shadow-lg relative">
                            {isUploading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                                    <Loader2 className="animate-spin text-orange-600" size={32} />
                                </div>
                            ) : user.avatar && !user.avatar.includes('ui-avatars') ? (
                                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                         <div className={`absolute bottom-2 right-2 w-6 h-6 border-4 border-white rounded-full ${user.role === Role.CPH ? 'bg-purple-500' : 'bg-blue-500'}`}></div>

                        <button
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px]"
                        >
                            <Camera size={24} className="text-white" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
                    </div>

                    <div className="flex-1 pt-1 space-y-3">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`px-3 py-1 ${roleBadgeColor} text-xs font-bold rounded-full uppercase tracking-wide`}>
                                    {roleLabel}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg w-fit text-sm font-medium border border-gray-100">
                             <Building size={14} className="text-gray-400" />
                            {collegeName}
                        </div>

                        <p className="text-gray-500 italic leading-relaxed text-sm max-w-2xl">
                            {user.bio || "No biography added yet."}
                        </p>

                        <div className="flex flex-col gap-2 pt-2">
                             <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Briefcase size={16} className="text-gray-400" />
                                <span>{user.experience || "Experience not specified"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <GraduationCap size={16} className="text-gray-400" />
                                <span>{user.education || "Education not specified"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                        <Mail className="text-blue-600" size={20} />
                        <h3 className="text-lg font-bold text-gray-800">Contact Details</h3>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-4 tracking-wider">OFFICIAL (READ ONLY)</p>
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm border border-gray-100"><Mail size={14}/></div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Official Email</p>
                                            <p className="text-sm font-bold text-gray-800">{user.email}</p>
                                        </div>
                                    </div>
                                    <Lock size={14} className="text-gray-300" />
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-green-600 shadow-sm border border-gray-100"><Phone size={14}/></div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Official Phone</p>
                                            <p className="text-sm font-bold text-gray-800">{user.phone || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                    <Lock size={14} className="text-gray-300" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">PERSONAL & ADDRESS</p>
                                <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-blue-600 hover:text-blue-800">Edit</button>
                            </div>

                            <div className="space-y-4 pl-1">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Alternative Email</p>
                                    <p className="text-sm font-medium text-gray-800">{user.alternativeEmail || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Alternative Phone</p>
                                    <p className="text-sm font-medium text-gray-800">{user.alternativePhone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Residential Address</p>
                                    <p className="text-sm font-medium text-gray-800 whitespace-pre-line">{user.fullAddress || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                        <Shield className="text-blue-600" size={20} />
                        <h3 className="text-lg font-bold text-gray-800">Account Information</h3>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0">
                            <span className="text-gray-600 font-medium text-sm">User ID</span>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wide">
                                {user.id}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0">
                            <span className="text-gray-600 font-medium text-sm">Role Level</span>
                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${roleBadgeColor}`}>
                                {user.role === Role.CPH ? 'CP Head' : 'CP Staff'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0">
                            <span className="text-gray-600 font-medium text-sm">Department</span>
                            <span className="font-bold text-gray-800 text-sm">
                                {user.department || 'Placement Cell'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-gray-600 font-medium text-sm">Status</span>
                            <span className="text-green-600 font-bold flex items-center gap-1 text-sm bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                <CheckCircle size={14} /> Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-800">Edit Profile Details</h3>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-6">
                            
                            <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b pb-2">Professional Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio / Summary</label>
                                    <textarea 
                                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-gray-900 border-gray-200" 
                                        rows={3}
                                        value={formData.bio}
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                        placeholder="Describe your role..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Experience</label>
                                    <input 
                                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-gray-900 border-gray-200" 
                                        value={formData.experience}
                                        onChange={e => setFormData({...formData, experience: e.target.value})}
                                        placeholder="e.g. 10+ Years"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Education</label>
                                    <input 
                                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-gray-900 border-gray-200" 
                                        value={formData.education}
                                        onChange={e => setFormData({...formData, education: e.target.value})}
                                        placeholder="e.g. M.Tech"
                                    />
                                </div>
                            </div>

                            <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b pb-2 mt-4">Personal Contact Info</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alternative Email</label>
                                    <input 
                                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-gray-900 border-gray-200" 
                                        value={formData.alternativeEmail}
                                        onChange={e => setFormData({...formData, alternativeEmail: e.target.value})}
                                        placeholder="personal@gmail.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alternative Phone</label>
                                    <input 
                                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-gray-900 border-gray-200" 
                                        value={formData.alternativePhone}
                                        onChange={e => setFormData({...formData, alternativePhone: e.target.value})}
                                        placeholder="+91..."
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><MapPin size={14}/> Residential Address</label>
                                <AddressForm data={addressForm} onChange={setAddressForm} />
                            </div>

                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition-colors">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
