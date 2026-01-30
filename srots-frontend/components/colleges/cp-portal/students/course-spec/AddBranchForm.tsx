
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

/**
 * Component Name: AddBranchForm
 * Directory: components/colleges/cp-portal/students/course-spec/AddBranchForm.tsx
 * 
 * Functionality:
 * - Input fields for Full Branch Name and Short Code.
 * - Button to add the new branch.
 * 
 * Used In: CourseSpecification
 */

interface AddBranchFormProps {
    onAdd: (name: string, code: string) => void;
}

export const AddBranchForm: React.FC<AddBranchFormProps> = ({ onAdd }) => {
    const [newBranchName, setNewBranchName] = useState('');
    const [newBranchCode, setNewBranchCode] = useState('');

    const handleAdd = () => {
        if (newBranchName.trim() && newBranchCode.trim()) {
            onAdd(newBranchName, newBranchCode);
            setNewBranchName('');
            setNewBranchCode('');
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 max-w-2xl flex flex-col sm:flex-row gap-2">
                <input 
                    className="flex-1 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900" 
                    placeholder="Full Course Name (e.g. Computer Science & Engineering)" 
                    value={newBranchName}
                    onChange={e => setNewBranchName(e.target.value)}
                />
                <input 
                    className="w-full sm:w-32 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900" 
                    placeholder="Short Code (CSE)" 
                    value={newBranchCode}
                    onChange={e => setNewBranchCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
                <button onClick={handleAdd} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm mt-2 sm:mt-0">
                    <Plus size={18}/> Add
                </button>
            </div>
        </div>
    );
};
