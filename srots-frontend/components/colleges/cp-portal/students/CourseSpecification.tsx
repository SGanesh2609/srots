import React, { useState } from 'react';
import { College, Branch } from '../../../../types';
import { CollegeService } from '../../../../services/collegeService';
import { Settings, BookOpen } from 'lucide-react';
import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';
import { AddBranchForm } from './course-spec/AddBranchForm';
import { BranchListTable } from './course-spec/BranchListTable';

interface CourseSpecificationProps {
  collegeDetails: College | undefined;
  onRefresh: () => void;
}

export const CourseSpecification: React.FC<CourseSpecificationProps> = ({ collegeDetails, onRefresh }) => {
  const [deleteBranchCode, setDeleteBranchCode] = useState<string | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const getCollegeBranches = () => collegeDetails?.branches || [];

  const handleAddOrUpdateBranch = async (name: string, code: string) => {
    if (!collegeDetails) return;
    try {
      if (editingBranch) {
        // Update existing branch
        await CollegeService.updateCollegeBranch(collegeDetails.id, editingBranch.code, { 
            name, 
            code: code.toUpperCase() 
        });
        setEditingBranch(null);
      } else {
        // Add new branch
        await CollegeService.addCollegeBranch(collegeDetails.id, { 
            name, 
            code: code.toUpperCase() 
        });
      }
      onRefresh();
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const confirmDeleteBranch = async () => {
    if (deleteBranchCode && collegeDetails) {
      try {
        await CollegeService.removeCollegeBranch(collegeDetails.id, deleteBranchCode);
        onRefresh();
        setDeleteBranchCode(null);
      } catch (e: any) {
        alert("Delete failed: " + e.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Settings size={20} className="text-blue-600"/> 
            Manage Courses & Branches
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Define the official list of branches/courses offered by your college.
          </p>
        </div>

        <AddBranchForm 
          onAdd={handleAddOrUpdateBranch} 
          editData={editingBranch} 
          onCancel={() => setEditingBranch(null)} 
        />

        <BranchListTable 
          branches={getCollegeBranches()} 
          onDelete={setDeleteBranchCode} 
          onEdit={setEditingBranch}
        />
      </div>

      <DeleteConfirmationModal 
        isOpen={!!deleteBranchCode} 
        onClose={() => setDeleteBranchCode(null)} 
        onConfirm={confirmDeleteBranch} 
        title="Delete Branch?" 
        message={`Are you sure you want to delete branch ${deleteBranchCode}? This action cannot be undone.`} 
      />
    </div>
  );
};