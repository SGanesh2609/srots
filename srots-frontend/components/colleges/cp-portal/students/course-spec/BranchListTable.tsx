import React from 'react';
import { Trash2, Edit3, BookOpen } from 'lucide-react';
import { Branch } from '../../../../../types';

interface BranchListTableProps {
    branches: Branch[];
    onDelete: (code: string) => void;
    onEdit: (branch: Branch) => void;
}

export const BranchListTable: React.FC<BranchListTableProps> = ({ branches, onDelete, onEdit }) => {
    return (
        <div className="border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Course / Branch Name</th>
                        <th className="px-6 py-4 w-40 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {branches.length > 0 ? branches.map((branch, idx) => (
                        <tr key={branch.code} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-800">{branch.name}</span>
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black border border-blue-200">
                                        {branch.code}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onEdit(branch)} 
                                        className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Edit Branch"
                                    >
                                        <Edit3 size={18}/>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(branch.code)} 
                                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Branch"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={2} className="px-6 py-20 text-center text-gray-400 bg-gray-50/50">
                                <BookOpen size={48} className="mx-auto mb-4 opacity-10"/>
                                <p className="font-medium">No branches configured yet.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};