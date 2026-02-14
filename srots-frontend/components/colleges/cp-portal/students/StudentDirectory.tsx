// import React, { useState, useEffect } from 'react';
// import { User, College, Role } from '../../../../types';
// import { CollegeService } from '../../../../services/collegeService';
// import { ManagingStudentAccounts } from '../../../global/ManagingStudentAccounts';
// import { GlobalStudentDirectory } from '../../../global/StudentDirectory';
// import { CourseSpecification } from './CourseSpecification';
// // Added missing Shield icon import
// import { Shield } from 'lucide-react';

// /**
//  * Component Name: StudentDirectory
//  * Directory: components/colleges/cp-portal/students/StudentDirectory.tsx
//  * 
//  * Functionality:
//  * - High-level container for all student-related management.
//  * - 5-Role Sync Architecture:
//  *   1. STAFF Role: Can ONLY access the 'directory' (view/search students).
//  *   2. CPH Role: Can access 'directory', 'accounts' (renewals/deletions), and 'specifications' (branches).
//  */

// interface StudentDirectoryProps {
//   user: User;
// }

// export const StudentDirectory: React.FC<StudentDirectoryProps> = ({ user }) => {
//   const [studentSectionTab, setStudentSectionTab] = useState<'directory' | 'accounts' | 'specifications'>('directory');
//   const [collegeDetails, setCollegeDetails] = useState<College | undefined>(undefined);

//   // Sync Check: Confirm user is a College Head (CPH + isCollegeHead flag)
//   const isHead = user.role === Role.CPH && user.isCollegeHead;

//   useEffect(() => {
//       refreshData();
//   }, [user.collegeId]);

//   const refreshData = async () => {
//       if (user.collegeId) {
//           const details = await CollegeService.getCollegeById(user.collegeId);
//           setCollegeDetails(details);
//       }
//   };

//   return (
//     <div className="space-y-6">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div className="flex items-center gap-2">
//                 <h2 className="text-2xl font-bold text-gray-800">Student Database</h2>
//                 {!isHead && (
//                     <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-200 font-bold uppercase tracking-wider">
//                         Directory Only (Staff Access)
//                     </span>
//                 )}
//             </div>
            
//             {/* Sync Logic: Hide management tabs for non-CPH roles */}
//             {isHead && (
//                 <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200 self-start sm:self-auto gap-1 overflow-x-auto max-w-full no-scrollbar shadow-inner">
//                     <button onClick={() => setStudentSectionTab('directory')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${studentSectionTab === 'directory' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}>
//                         Student List
//                     </button>
//                     <button onClick={() => setStudentSectionTab('accounts')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${studentSectionTab === 'accounts' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}>
//                         Manage Accounts
//                     </button>
//                     <button onClick={() => setStudentSectionTab('specifications')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${studentSectionTab === 'specifications' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}>
//                         College Branches
//                     </button>
//                 </div>
//             )}
//         </div>

//         <div className="min-h-[500px]">
//             {/* Tab 1: Directory - Shared by CPH and STAFF */}
//             {studentSectionTab === 'directory' && (
//                 <GlobalStudentDirectory 
//                     collegeId={user.collegeId || ''} 
//                     isSrotsAdmin={false} 
//                     canManage={isHead} // Only head can add/edit/delete records manually
//                 />
//             )}

//             {/* Tab 2: Lifecycle - EXCLUSIVE to CPH */}
//             {studentSectionTab === 'accounts' && isHead && (
//                 <ManagingStudentAccounts 
//                     collegeId={user.collegeId || ''} 
//                     onRefresh={refreshData} 
//                     isSrotsAdmin={false}
//                 />
//             )}

//             {/* Tab 3: Config - EXCLUSIVE to CPH */}
//             {studentSectionTab === 'specifications' && isHead && (
//                 <CourseSpecification 
//                     collegeDetails={collegeDetails} 
//                     onRefresh={refreshData} 
//                 />
//             )}

//             {/* Role Guard: Visual feedback if staff somehow attempts to access hidden tabs */}
//             {!isHead && studentSectionTab !== 'directory' && (
//                 <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
//                     <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
//                         <Shield size={32}/>
//                     </div>
//                     <h3 className="font-bold text-gray-800 text-lg">Access Restricted</h3>
//                     <p className="text-gray-500 mt-2 max-w-xs mx-auto">Bulk account lifecycle management and college configuration are restricted to the College Placement Head.</p>
//                 </div>
//             )}
//         </div>
//     </div>
//   );
// };


import React, { useState, useEffect } from 'react';
import { User, College, Role } from '../../../../types';
import { CollegeService } from '../../../../services/collegeService';
import { ManagingStudentAccounts } from '../../../global/ManagingStudentAccounts';
import { GlobalStudentDirectory } from '../../../global/StudentDirectory';
import { CourseSpecification } from './CourseSpecification';
import { Shield, Users, RefreshCw, BookOpen, Lock } from 'lucide-react';

/**
 * Component Name: StudentDirectory
 * Directory: components/colleges/cp-portal/students/StudentDirectory.tsx
 * 
 * Functionality:
 * - Central hub for student data management in the CP Portal.
 * - Restores 3-Tab workflow for CPH: Directory, Account Lifecycle, and Course Config.
 * - Restricts Staff to a Read-Only Directory view.
 */

interface StudentDirectoryProps {
  user: User;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'accounts' | 'specifications'>('directory');
  const [collegeDetails, setCollegeDetails] = useState<College | undefined>(undefined);

  // Role Logic
  const isCPH = user.role === Role.CPH;
  const isStaff = user.role === Role.STAFF;

  useEffect(() => {
      if (user.collegeId) {
          CollegeService.getCollegeById(user.collegeId).then(details => {
              setCollegeDetails(details);
          });
      }
  }, [user.collegeId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    Student Database {isStaff && <Lock className="text-amber-500" size={20} />}
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                    {isCPH 
                        ? 'Manage student account lifecycles, eligibility, and institutional course configurations.' 
                        : 'Search and view student profiles and placement readiness.'}
                </p>
            </div>
            
            {/* Tab Navigation - Only visible to CPH */}
            {isCPH && (
                <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
                    <button 
                        onClick={() => setActiveTab('directory')} 
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'directory' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users size={14}/> Student List
                    </button>
                    <button 
                        onClick={() => setActiveTab('accounts')} 
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'accounts' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <RefreshCw size={14}/> Accounts
                    </button>
                    <button 
                        onClick={() => setActiveTab('specifications')} 
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'specifications' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <BookOpen size={14}/> Branches
                    </button>
                </div>
            )}

            {/* Staff Badge */}
            {isStaff && (
                <div className="px-4 py-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-sm">
                    <Shield size={14} /> Staff Access (Read Only)
                </div>
            )}
        </div>

        <div className="min-h-[600px]">
            {/* View 1: Student List (Shared, but permissions differ) */}
            {activeTab === 'directory' && (
                <div className="space-y-4">
                    {isCPH && (
                        <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Shield size={20} />
                                </div>
                                <span className="text-sm font-bold uppercase tracking-tight">Admin Management Mode Active</span>
                            </div>
                            <span className="text-[10px] font-black opacity-80 uppercase">Head Privileges Enabled</span>
                        </div>
                    )}
                    <GlobalStudentDirectory 
                        collegeId={user.collegeId || ''} 
                        isSrotsAdmin={false} 
                        canManage={isCPH} // CPH can edit/add, Staff is Read-Only
                    />
                </div>
            )}

            {/* View 2: Account Lifecycle (CPH Only) */}
            {activeTab === 'accounts' && isCPH && (
                <ManagingStudentAccounts 
                    collegeId={user.collegeId || ''} 
                    isSrotsAdmin={false}
                />
            )}

            {/* View 3: College Configuration (CPH Only) */}
            {activeTab === 'specifications' && isCPH && (
                <CourseSpecification 
                    collegeDetails={collegeDetails} 
                    onRefresh={() => {
                        if (user.collegeId) {
                            CollegeService.getCollegeById(user.collegeId).then(setCollegeDetails);
                        }
                    }} 
                />
            )}

            {/* Permission Guard Fallback */}
            {isStaff && activeTab !== 'directory' && (
                <div className="flex flex-col items-center justify-center p-32 bg-white rounded-3xl border-4 border-dashed border-gray-50 text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <Lock size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Access Restricted</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto font-medium">
                        Advanced account operations and institutional configurations are reserved for the College Placement Head.
                    </p>
                    <button 
                        onClick={() => setActiveTab('directory')}
                        className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                    >
                        Return to Directory
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};