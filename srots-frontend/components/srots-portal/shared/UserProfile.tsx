
import React, { useState, useRef, useEffect } from 'react';
import { User, Role, AddressFormData } from '../../../types';
import { Camera, Mail, Phone, MapPin, Edit2, Shield, Loader2, Search } from 'lucide-react';
import { AddressForm } from '../../common/AddressForm';
import { AuthService } from '../../../services/authService';
import { CompanyService } from '../../../services/companyService';

interface UserProfileProps {
  user: User;
  onUpdateUser?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
  const [profileUser, setProfileUser] = useState<User>(user);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
      alternativeEmail: user.alternativeEmail || '',
      alternativePhone: user.alternativePhone || '',
  });
  
  const [addressForm, setAddressForm] = useState<AddressFormData>({
      addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      setProfileUser(user);
      setProfileForm({
        alternativeEmail: user.alternativeEmail || '',
        alternativePhone: user.alternativePhone || '',
      });
      setAddressForm({
          addressLine1: user.fullAddress || '', 
          addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
      });
  }, [user]);

  const handleSaveProfile = async () => {
      const updated = {
          ...profileUser,
          alternativeEmail: profileForm.alternativeEmail,
          alternativePhone: profileForm.alternativePhone,
      };
      
      try {
          // Persist to Backend via AuthService
          const result = await AuthService.updateUser(updated, addressForm);
          setProfileUser(result);
          if(onUpdateUser) onUpdateUser(result);
          setIsEditingProfile(false);
          alert("Profile updated successfully!");
      } catch (e) {
          alert("Failed to update profile.");
      }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setIsUploading(true);
          try {
              const file = e.target.files[0];
              const imageUrl = await CompanyService.uploadFile(file);
              const updated = { ...profileUser, avatar: imageUrl };
              
              // Persist to Backend
              const result = await AuthService.updateUser(updated);
              setProfileUser(result);
              if(onUpdateUser) onUpdateUser(result);
              alert("Profile picture updated successfully!");
          } catch(err) {
              alert("Failed to upload profile picture.");
          } finally {
              setIsUploading(false);
          }
      }
  };

  return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <input 
               type="file" 
               ref={fileInputRef} 
               style={{ display: 'none' }} 
               accept="image/*"
               onChange={handleProfileImageUpload}
           />

           <div className="bg-white rounded-xl shadow-sm border p-8 flex flex-col md:flex-row items-center gap-8">
               <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
                   {isUploading ? (
                       <div className="w-32 h-32 rounded-full border-4 border-gray-50 shadow-md flex items-center justify-center bg-gray-100">
                           <Loader2 className="animate-spin text-blue-600" size={32}/>
                       </div>
                   ) : (
                       <img 
                          src={profileUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.fullName)}&background=0D8ABC&color=fff`} 
                          alt="Profile" 
                          className="w-32 h-32 rounded-full border-4 border-gray-50 shadow-md object-cover"
                       />
                   )}
                   <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={24} />
                   </div>
                   <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
               </div>
               <div className="text-center md:text-left space-y-2">
                   <h1 className="text-3xl font-bold text-gray-900">{profileUser.fullName}</h1>
                   <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                       <span className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 bg-blue-100 text-blue-700">
                           <Shield size={14} /> {profileUser.role === Role.ADMIN ? 'Srots Admin' : 'Srots Dev'}
                       </span>
                   </div>
                   <p className="text-gray-500 max-w-md">
                       {profileUser.role === Role.ADMIN 
                         ? 'Root administrator for Sorts Platform. Managing global configurations, colleges, and system integrity.'
                         : 'System developer and maintainer for Sorts Platform.'}
                   </p>
               </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-xl shadow-sm border p-6">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                           <Mail size={20} className="text-blue-600" /> Personal Details
                       </h3>
                       {!isEditingProfile && (
                           <button onClick={() => setIsEditingProfile(true)} className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1">
                               <Edit2 size={14} /> Edit
                           </button>
                       )}
                   </div>
                   <div className="space-y-5">
                       <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Mail size={18} /></div>
                           <div className="overflow-hidden w-full">
                               <p className="text-xs text-gray-500 uppercase font-semibold">Communication Email <span className="text-xs text-gray-400 font-normal">(Fixed)</span></p>
                               <p className="text-gray-900 font-medium truncate">{profileUser.email}</p>
                           </div>
                       </div>
                       
                       <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Mail size={18} /></div>
                           <div className="overflow-hidden w-full">
                               <p className="text-xs text-gray-500 uppercase font-semibold">Alternative Email</p>
                               {isEditingProfile ? (
                                   <input 
                                       className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none" 
                                       value={profileForm.alternativeEmail} 
                                       onChange={e => setProfileForm({...profileForm, alternativeEmail: e.target.value})} 
                                       placeholder="e.g. personal@gmail.com"
                                   />
                               ) : (
                                   <p className="text-gray-900 font-medium truncate">{profileUser.alternativeEmail || 'Not Provided'}</p>
                               )}
                           </div>
                       </div>

                       <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0"><Phone size={18} /></div>
                           <div className="w-full">
                               <p className="text-xs text-gray-500 uppercase font-semibold">Primary Phone Number <span className="text-xs text-gray-400 font-normal">(Fixed)</span></p>
                               <p className="text-gray-900 font-medium">{profileUser.phone || 'Not Provided'}</p>
                           </div>
                       </div>

                       <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0"><Phone size={18} /></div>
                           <div className="w-full">
                               <p className="text-xs text-gray-500 uppercase font-semibold">Alternative Phone Number</p>
                               {isEditingProfile ? (
                                   <input 
                                       className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none" 
                                       value={profileForm.alternativePhone} 
                                       onChange={e => setProfileForm({...profileForm, alternativePhone: e.target.value})} 
                                       placeholder="e.g. 9876543210"
                                   />
                               ) : (
                                   <p className="text-gray-900 font-medium">{profileUser.alternativePhone || 'Not Provided'}</p>
                               )}
                           </div>
                       </div>

                       <div className="flex items-start gap-4">
                           <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0 mt-1"><MapPin size={18} /></div>
                           <div className="w-full">
                               <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                               {isEditingProfile ? (
                                   <div className="mt-2">
                                       <AddressForm data={addressForm} onChange={setAddressForm} />
                                   </div>
                               ) : (
                                   <p className="text-gray-900 font-medium whitespace-pre-wrap">{profileUser.fullAddress || 'Not Provided'}</p>
                               )}
                           </div>
                       </div>

                       {isEditingProfile && (
                           <div className="flex justify-end gap-2 pt-2">
                               <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                               <button onClick={handleSaveProfile} className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm">Save Changes</button>
                           </div>
                       )}
                   </div>
               </div>

               <div className="bg-white rounded-xl shadow-sm border p-6">
                   <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                       <Shield size={20} className="text-blue-600" /> Account Overview
                   </h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                          <span className="text-gray-600 font-medium">Username / User ID</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{profileUser.id}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                          <span className="text-gray-600 font-medium">Full Name</span>
                          <span className="font-medium text-gray-900">{profileUser.fullName}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                          <span className="text-gray-600 font-medium">Role</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">{profileUser.role === Role.ADMIN ? 'Srots Admin' : 'Srots Dev'}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                          <span className="text-gray-600 font-medium">Account Created</span>
                          <span className="font-medium text-gray-900">{profileUser.createdAt || 'Jan 2023'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                          <span className="text-gray-600 font-medium">Access Level</span>
                          <span className="font-medium text-green-600 text-sm">{profileUser.role === Role.ADMIN ? 'Full System Control' : 'Developer Access (No CMS/Analytics)'}</span>
                      </div>
                   </div>
               </div>
           </div>
      </div>
  );
};
