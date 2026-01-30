
// import React, { useState, useRef, useEffect } from 'react';
// import { College, User } from '../../../../types';
// import { CollegeService } from '../../../../services/collegeService';
// import { ResourceService } from '../../../../services/resourceService';
// import { ToggleLeft, Camera, Building, Loader2, ArrowLeft } from 'lucide-react';
// import { GlobalStudentDirectory } from '../../../global/StudentDirectory';
// import { CPUsersData } from './CPUsersData';
// import { ManagingStudentAccounts } from '../../../global/ManagingStudentAccounts';

// /**
//  * Component Name: CollegeDetailView
//  * Directory: components/srots-portal/srots-admin/cms/CollegeDetailView.tsx
//  */

// interface CollegeDetailViewProps {
//     college: College;
//     onBack: () => void;
//     onRefresh: () => void;
//     currentUser: User;
// }

// export const CollegeDetailView: React.FC<CollegeDetailViewProps> = ({ college, onBack, onRefresh, currentUser }) => {
//     const [cmsTab, setCmsTab] = useState<'students' | 'cp_admin' | 'accounts'>('students');
//     const [stats, setStats] = useState({ studentCount: 0, cpCount: 0, totalJobs: 0, activeJobs: 0 });
//     const [isUploading, setIsUploading] = useState(false);
//     const logoInputRef = useRef<HTMLInputElement>(null);

//     useEffect(() => {
//         loadStats();
//     }, [college.id]);

//     const loadStats = async () => {
//         const data = await CollegeService.getCollegeStats(college.id);
//         setStats({
//             studentCount: data.studentCount,
//             cpCount: data.cpCount,
//             totalJobs: data.totalJobs,
//             activeJobs: data.activeJobs
//         });
//     };

//     const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             setIsUploading(true);
//             try {
//                 const file = e.target.files[0];
//                 const newLogoUrl = await ResourceService.uploadFile(file);
//                 const updatedCollege = { ...college, logo: newLogoUrl };
//                 await CollegeService.updateCollege(updatedCollege);
//                 onRefresh(); 
//             } catch (err) {
//                 console.error("Logo upload failed", err);
//                 alert("Failed to upload logo.");
//             } finally {
//                 setIsUploading(false);
//             }
//         }
//     };

//     return (
//         <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden animate-in fade-in slide-in-from-right-4">
//             {/* Header */}
//             <div className="p-6 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//                 <div className="flex items-center gap-4">
//                     <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
//                         <ArrowLeft size={20} />
//                     </button>
//                     <div className="relative group cursor-pointer" onClick={() => !isUploading && logoInputRef.current?.click()}>
//                         {isUploading ? (
//                             <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
//                                 <Loader2 className="animate-spin text-blue-600" size={24}/>
//                             </div>
//                         ) : (
//                             <img src={college.logo} alt={college.name} className="w-16 h-16 rounded-lg object-cover border border-gray-200 bg-white" />
//                         )}
//                         <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
//                             <Camera className="text-white" size={20} />
//                         </div>
//                         <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
//                     </div>
//                     <div>
//                         <h2 className="text-2xl font-bold text-gray-900">{college.name}</h2>
//                         <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
//                             <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-bold">{college.code}</span>
//                             <span className="flex items-center gap-1"><Building size={14}/> {college.type}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="flex gap-4 text-center">
//                     <div className="bg-white p-3 rounded-lg border shadow-sm min-w-[100px]">
//                         <p className="text-2xl font-bold text-blue-600">{stats.studentCount}</p>
//                         <p className="text-xs font-bold text-gray-400 uppercase">Students</p>
//                     </div>
//                     <div className="bg-white p-3 rounded-lg border shadow-sm min-w-[100px]">
//                         <p className="text-2xl font-bold text-purple-600">{stats.cpCount}</p>
//                         <p className="text-xs font-bold text-gray-400 uppercase">CP Users</p>
//                     </div>
//                     <div className="bg-white p-3 rounded-lg border shadow-sm min-w-[100px]">
//                         <p className="text-2xl font-bold text-green-600">{stats.activeJobs}</p>
//                         <p className="text-xs font-bold text-gray-400 uppercase">Active Jobs</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Navigation Tabs */}
//             <div className="flex border-b px-6 bg-white sticky top-0 z-10">
//                 <button 
//                     onClick={() => setCmsTab('students')} 
//                     className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${cmsTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
//                 >
//                     Student Directory
//                 </button>
//                 <button 
//                     onClick={() => setCmsTab('cp_admin')} 
//                     className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${cmsTab === 'cp_admin' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
//                 >
//                     CP Admins & Staff
//                 </button>
//                 <button 
//                     onClick={() => setCmsTab('accounts')} 
//                     className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${cmsTab === 'accounts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
//                 >
//                     Risk & Account Management
//                 </button>
//             </div>

//             {/* Tab Content */}
//             <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
//                 {cmsTab === 'students' && (
//                     <GlobalStudentDirectory 
//                         collegeId={college.id} 
//                         isSrotsAdmin={true}
//                         onRefresh={loadStats} 
//                     />
//                 )}
//                 {cmsTab === 'cp_admin' && (
//                     <CPUsersData 
//                         collegeId={college.id} 
//                         collegeCode={college.code} 
//                         collegeName={college.name} 
//                         onRefresh={loadStats}
//                         currentUser={currentUser} 
//                     />
//                 )}
//                 {cmsTab === 'accounts' && (
//                     <ManagingStudentAccounts 
//                         collegeId={college.id} 
//                         onRefresh={loadStats}
//                         isSrotsAdmin={true}
//                     />
//                 )}
//             </div>
//         </div>
//     );
// };


import React, { useState, useRef, useEffect } from 'react';
import { College, User } from '../../../../types';
import { CollegeService } from '../../../../services/collegeService';
import { ResourceService } from '../../../../services/resourceService';
import { ToggleLeft, Camera, Building, Loader2, ArrowLeft } from 'lucide-react';
import { GlobalStudentDirectory } from '../../../global/StudentDirectory';
import { CPUsersData } from './CPUsersData';
import { ManagingStudentAccounts } from '../../../global/ManagingStudentAccounts';

interface CollegeDetailViewProps {
  college: College;
  onBack: () => void;
  onRefresh: () => void;
  currentUser: User;
}

export const CollegeDetailView: React.FC<CollegeDetailViewProps> = ({ college, onBack, onRefresh, currentUser }) => {
  const [cmsTab, setCmsTab] = useState<'students' | 'cp_admin' | 'accounts'>('students');
  const [stats, setStats] = useState({ studentCount: 0, cpCount: 0, totalJobs: 0, activeJobs: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStats();
  }, [college.id]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await CollegeService.getCollegeStats(college.id);
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIsUploading(true);
      try {
        const file = e.target.files[0];
        const newLogoUrl = await ResourceService.uploadFile(file);
        const updated = { ...college, logo: newLogoUrl };
        await CollegeService.updateCollege(updated);
        onRefresh();
      } catch (err) {
        alert("Logo upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden animate-in fade-in slide-in-from-right-4">
      {/* Header */}
      <div className="p-6 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div className="relative group cursor-pointer" onClick={() => !isUploading && logoInputRef.current?.click()}>
            {isUploading ? (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            ) : (
              <img
                src={college.logo || '/default-college-logo.png'}
                alt={college.name}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200 bg-white"
              />
            )}
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
              <Camera className="text-white" size={20} />
            </div>
            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{college.name}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-bold">{college.code}</span>
              <span className="flex items-center gap-1"><Building size={14} /> {college.type || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center min-w-[300px]">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            {loadingStats ? <Loader2 className="animate-spin mx-auto" /> : (
              <>
                <p className="text-3xl font-bold text-blue-600">{stats.studentCount}</p>
                <p className="text-xs font-bold text-gray-500 uppercase mt-1">Students</p>
              </>
            )}
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            {loadingStats ? <Loader2 className="animate-spin mx-auto" /> : (
              <>
                <p className="text-3xl font-bold text-purple-600">{stats.cpCount}</p>
                <p className="text-xs font-bold text-gray-500 uppercase mt-1">CP Users</p>
              </>
            )}
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            {loadingStats ? <Loader2 className="animate-spin mx-auto" /> : (
              <>
                <p className="text-3xl font-bold text-green-600">{stats.activeJobs}</p>
                <p className="text-xs font-bold text-gray-500 uppercase mt-1">Active Jobs</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-6 bg-white sticky top-0 z-10">
        <button
          onClick={() => setCmsTab('students')}
          className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
            cmsTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Student Directory
        </button>
        <button
          onClick={() => setCmsTab('cp_admin')}
          className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
            cmsTab === 'cp_admin' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          CP Admins & Staff
        </button>
        <button
          onClick={() => setCmsTab('accounts')}
          className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
            cmsTab === 'accounts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Risk & Account Management
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {cmsTab === 'students' && (
          <GlobalStudentDirectory
            collegeId={college.id}
            isSrotsAdmin={true}
            onRefresh={loadStats}
          />
        )}
        {cmsTab === 'cp_admin' && (
          <CPUsersData
            collegeId={college.id}
            collegeCode={college.code}
            collegeName={college.name}
            onRefresh={loadStats}
            currentUser={currentUser}
          />
        )}
        {cmsTab === 'accounts' && (
          <ManagingStudentAccounts
            collegeId={college.id}
            onRefresh={loadStats}
            isSrotsAdmin={true}
          />
        )}
      </div>
    </div>
  );
};