import React, { useState, useEffect } from 'react';
import { User, College, Role } from '../../../../types';
import { CollegeService } from '../../../../services/collegeService';
import { ManagingStudentAccounts } from '../../../global/ManagingStudentAccounts';
import { GlobalStudentDirectory } from '../../../global/StudentDirectory';
import { CourseSpecification } from './CourseSpecification';
// Added missing Shield icon import
import { Shield } from 'lucide-react';

/**
 * Component Name: StudentDirectory
 * Directory: components/colleges/cp-portal/students/StudentDirectory.tsx
 * 
 * Functionality:
 * - High-level container for all student-related management.
 * - 5-Role Sync Architecture:
 *   1. STAFF Role: Can ONLY access the 'directory' (view/search students).
 *   2. CPH Role: Can access 'directory', 'accounts' (renewals/deletions), and 'specifications' (branches).
 */

interface StudentDirectoryProps {
  user: User;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({ user }) => {
  const [studentSectionTab, setStudentSectionTab] = useState<'directory' | 'accounts' | 'specifications'>('directory');
  const [collegeDetails, setCollegeDetails] = useState<College | undefined>(undefined);

  // Sync Check: Confirm user is a College Head (CPH + isCollegeHead flag)
  const isHead = user.role === Role.CPH && user.isCollegeHead;

  useEffect(() => {
      refreshData();
  }, [user.collegeId]);

  const refreshData = async () => {
      if (user.collegeId) {
          const details = await CollegeService.getCollegeById(user.collegeId);
          setCollegeDetails(details);
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800">Student Database</h2>
                {!isHead && (
                    <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-200 font-bold uppercase tracking-wider">
                        Directory Only (Staff Access)
                    </span>
                )}
            </div>
            
            {/* Sync Logic: Hide management tabs for non-CPH roles */}
            {isHead && (
                <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200 self-start sm:self-auto gap-1 overflow-x-auto max-w-full no-scrollbar shadow-inner">
                    <button onClick={() => setStudentSectionTab('directory')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${studentSectionTab === 'directory' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}>
                        Student List
                    </button>
                    <button onClick={() => setStudentSectionTab('accounts')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${studentSectionTab === 'accounts' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}>
                        Manage Accounts
                    </button>
                    <button onClick={() => setStudentSectionTab('specifications')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${studentSectionTab === 'specifications' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}>
                        College Branches
                    </button>
                </div>
            )}
        </div>

        <div className="min-h-[500px]">
            {/* Tab 1: Directory - Shared by CPH and STAFF */}
            {studentSectionTab === 'directory' && (
                <GlobalStudentDirectory 
                    collegeId={user.collegeId || ''} 
                    isSrotsAdmin={false} 
                    canManage={isHead} // Only head can add/edit/delete records manually
                />
            )}

            {/* Tab 2: Lifecycle - EXCLUSIVE to CPH */}
            {studentSectionTab === 'accounts' && isHead && (
                <ManagingStudentAccounts 
                    collegeId={user.collegeId || ''} 
                    onRefresh={refreshData} 
                    isSrotsAdmin={false}
                />
            )}

            {/* Tab 3: Config - EXCLUSIVE to CPH */}
            {studentSectionTab === 'specifications' && isHead && (
                <CourseSpecification 
                    collegeDetails={collegeDetails} 
                    onRefresh={refreshData} 
                />
            )}

            {/* Role Guard: Visual feedback if staff somehow attempts to access hidden tabs */}
            {!isHead && studentSectionTab !== 'directory' && (
                <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32}/>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">Access Restricted</h3>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto">Bulk account lifecycle management and college configuration are restricted to the College Placement Head.</p>
                </div>
            )}
        </div>
    </div>
  );
};