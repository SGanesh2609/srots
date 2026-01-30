
import React from 'react';
import { User } from '../../../../../types';
import { Edit2, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

/**
 * Component Name: TeamTable
 * Directory: components/colleges/cp-portal/admin/team/TeamTable.tsx
 * 
 * Functionality:
 * - Renders a responsive table of team members.
 * - Shows Name, User ID (avatar), Contact info, Department, and Status.
 * - Provides actions: Edit, Toggle Access (Restrict/Activate), Delete.
 * 
 * Used In: ManageTeam
 */

interface TeamTableProps {
    staffList: User[];
    onEdit: (staff: User) => void;
    onToggleStatus: (id: string) => void;
    onDelete: (id: string) => void;
}

export const TeamTable: React.FC<TeamTableProps> = ({ staffList, onEdit, onToggleStatus, onDelete }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4 w-[25%]">Name</th>
                            <th className="px-6 py-4 w-[20%]">Contact</th>
                            <th className="px-6 py-4 w-[20%]">Department</th>
                            <th className="px-6 py-4 w-[15%]">Status</th>
                            <th className="px-6 py-4 w-[180px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {staffList.map(staff => (
                            <tr key={staff.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 truncate">
                                    <div className="flex items-center gap-3">
                                        {/* Fix: Use staff.fullName instead of staff.name */}
                                        <img src={staff.avatar} alt={staff.fullName} className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                                        <div className="truncate">
                                            {/* Fix: Use staff.fullName instead of staff.name */}
                                            <span className="font-bold text-gray-900 block truncate" title={staff.fullName}>{staff.fullName}</span>
                                            <span className="text-xs text-gray-500 truncate">{staff.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 truncate">
                                    <div className="truncate" title={staff.email}>{staff.email}</div>
                                    <div className="text-xs truncate">{staff.phone}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 truncate" title={staff.department}>{staff.department}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${!staff.isRestricted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {!staff.isRestricted ? 'Active' : 'Restricted'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => onEdit(staff)} 
                                            className="p-1.5 rounded text-blue-600 hover:bg-blue-50" 
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => onToggleStatus(staff.id)} 
                                            className={`p-1.5 rounded transition-colors ${!staff.isRestricted ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                                            title={!staff.isRestricted ? "Active - Click to Restrict" : "Restricted - Click to Activate"}
                                        >
                                            {!staff.isRestricted ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => onDelete(staff.id)} 
                                            className="p-1.5 rounded text-red-600 hover:bg-red-50" 
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {staffList.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    No team members found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
