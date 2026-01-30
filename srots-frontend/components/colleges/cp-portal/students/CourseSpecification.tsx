
import React, { useState } from 'react';
import { College } from '../../../../types';
import { CollegeService } from '../../../../services/collegeService';
import { Settings } from 'lucide-react';
import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';
import { AddBranchForm } from './course-spec/AddBranchForm';
import { BranchListTable } from './course-spec/BranchListTable';

interface CourseSpecificationProps {
  collegeDetails: College | undefined;
  onRefresh: () => void;
}

export const CourseSpecification: React.FC<CourseSpecificationProps> = ({ collegeDetails, onRefresh }) => {
  const [deleteBranchCode, setDeleteBranchCode] = useState<string | null>(null);

  const getCollegeBranches = () => collegeDetails?.branches || [];

  const handleAddBranch = async (name: string, code: string) => {
      if (!collegeDetails) return;
      try {
          await CollegeService.addCollegeBranch(collegeDetails.id, { name, code: code.toUpperCase() });
          onRefresh();
      } catch (e: any) {
          alert(e.message);
      }
  };

  const requestDeleteBranch = (branchCodeToDelete: string) => {
      setDeleteBranchCode(branchCodeToDelete);
  };

  const confirmDeleteBranch = async () => {
      if (deleteBranchCode && collegeDetails) {
          await CollegeService.removeCollegeBranch(collegeDetails.id, deleteBranchCode);
          onRefresh();
          setDeleteBranchCode(null);
      }
  };

  return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><Settings size={20} className="text-blue-600"/> Manage Courses & Branches</h3>
                      <p className="text-sm text-gray-500 mt-1">Define the official list of branches/courses offered by your college.</p>
                  </div>
              </div>
              <AddBranchForm onAdd={handleAddBranch} />
              <BranchListTable branches={getCollegeBranches()} onDelete={requestDeleteBranch} />
          </div>
          <DeleteConfirmationModal isOpen={!!deleteBranchCode} onClose={() => setDeleteBranchCode(null)} onConfirm={confirmDeleteBranch} title="Delete Branch?" message={`Are you sure you want to delete branch ${deleteBranchCode}?`} />
      </div>
  );
};
