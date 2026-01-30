
import React from 'react';
import { Search, AlertTriangle, Trash2 } from 'lucide-react';

/**
 * Component Name: AtRiskStudentList
 * Directory: components/global/account-management/AtRiskStudentList.tsx
 * 
 * Functionality:
 * - Displays a table of students whose accounts are expiring soon, in grace period, or marked for deletion.
 * - Allows searching by name or ID.
 * - Provides action buttons for Renewal (Srots Admin only) or Deletion.
 * 
 * Used In: ManagingStudentAccounts
 */

interface AtRiskStudentListProps {
    students: any[];
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    isSrotsAdmin: boolean;
    onRenew: (student: any) => void;
    onDelete: (id: string) => void;
}

export const AtRiskStudentList: React.FC<AtRiskStudentListProps> = ({ 
    students, searchQuery, setSearchQuery, isSrotsAdmin, onRenew, onDelete 
}) => {
    // Note: Filtering logic moved to parent `ManagingStudentAccounts`

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="font-bold text-gray-700 flex items-center gap-2"><AlertTriangle size={18} className="text-orange-500"/> At-Risk Student Accounts</div>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search At-Risk Students..." 
                        className="pl-8 pr-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none w-full sm:w-64 bg-white text-gray-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-white text-gray-500 font-medium text-xs uppercase border-b">
                        <tr>
                            <th className="px-6 py-3">Roll Number</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Days to Expiry</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                         {students.map((stu) => (
                             <tr key={stu.id} className="hover:bg-gray-50">
                                 <td className="px-6 py-3 font-mono text-gray-900">{stu.id}</td>
                                 <td className="px-6 py-3 font-medium text-gray-900">{stu.name}</td>
                                 <td className="px-6 py-3 text-gray-500">{stu.email}</td>
                                 <td className="px-6 py-3 font-bold text-orange-600">{stu.expiryIn} Days</td>
                                 <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${stu.status === 'Grace Period' ? 'bg-orange-100 text-orange-700' : stu.status === 'Deleted' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{stu.status}</span></td>
                                 <td className="px-6 py-3 flex gap-2">
                                     {isSrotsAdmin && (
                                         <button onClick={(e) => { e.stopPropagation(); onRenew(stu); }} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded text-xs font-bold border border-blue-200">Renew</button>
                                     )}
                                     <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(stu.id); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded" title="Delete Account"><Trash2 size={16} className="pointer-events-none"/></button>
                                 </td>
                             </tr>
                         ))}
                         {students.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No accounts matching filters.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
