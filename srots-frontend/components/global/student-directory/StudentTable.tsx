
import React from 'react';
import { Student } from '../../../types';
import { Edit2, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

/**
 * Component Name: StudentTable
 * Directory: components/global/student-directory/StudentTable.tsx
 * 
 * Functionality:
 * - Displays a responsive table of students.
 * - Shows Roll No, Name, Branch, Email, and Status.
 * - Provides actions: Edit, Toggle Restriction (Srots Admin only), Delete.
 * 
 * Used In: StudentList
 */

interface StudentTableProps {
    students: Student[];
    canManage: boolean;
    isSrotsAdmin: boolean;
    onEdit: (e: React.MouseEvent, student: Student) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onToggleRestriction: (e: React.MouseEvent, id: string) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({ 
    students, canManage, isSrotsAdmin, onEdit, onDelete, onToggleRestriction 
}) => {
    const showActions = canManage || isSrotsAdmin;

    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto border-t border-gray-100">
                <table className="w-full text-left table-fixed min-w-[900px]">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 w-[20%]">Name</th>
                            <th className="px-4 py-3 w-[15%]">Roll No</th>
                            <th className="px-4 py-3 w-[10%]">Branch</th>
                            <th className="px-4 py-3 w-[25%]">Email</th>
                            <th className="px-4 py-3 w-[15%]">Status</th>
                            {showActions && <th className="px-4 py-3 w-[15%] text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-bold truncate text-gray-900" title={student.fullName}>{student.fullName}</td>
                                <td className="px-4 py-3 font-mono text-gray-600 truncate" title={student.profile?.rollNumber || 'N/A'}>
                                    {student.profile?.rollNumber || 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 font-medium">
                                        {student.profile?.branch || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 truncate" title={student.email}>{student.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold whitespace-nowrap ${!student.isRestricted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {!student.isRestricted ? 'Active' : 'Restricted'}
                                    </span>
                                </td>
                                {showActions && (
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {canManage && <button onClick={(e) => onEdit(e, student)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"><Edit2 size={16}/></button>}
                                            {isSrotsAdmin && <button onClick={(e) => onToggleRestriction(e, student.id)} className={`p-1.5 rounded transition-colors ${!student.isRestricted ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}>{!student.isRestricted ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}</button>}
                                            {canManage && <button onClick={(e) => onDelete(e, student.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 size={16}/></button>}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                    No students found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
