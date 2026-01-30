
// import React from 'react';
// import { User, Role } from '../../../../types';
// import { Search, UserPlus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

// /**
//  * Component Name: TeamList
//  * Directory: components/srots-portal/shared/team/TeamList.tsx
//  * 
//  * Functionality:
//  * - Renders the list of internal Srots Developers.
//  * - **Updates**: Now purely presentational. Search queries bubble up to parent to call Backend.
//  * 
//  * Used In: SrotsTeam
//  */

// interface TeamListProps {
//     teamMembers: User[];
//     currentUserRole: Role;
//     searchQuery: string;
//     onSearchChange: (query: string) => void;
//     onAdd: () => void;
//     onToggleStatus: (member: User) => void;
//     onDelete: (id: string) => void;
// }

// export const TeamList: React.FC<TeamListProps> = ({ 
//     teamMembers, currentUserRole, searchQuery, onSearchChange, onAdd, onToggleStatus, onDelete 
// }) => {
    
//     return (
//         <div className="space-y-6">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                 <div>
//                     <h2 className="text-2xl font-bold text-gray-800">Srots Team</h2>
//                     <p className="text-sm text-gray-500 mt-1">Manage platform administrators and developers.</p>
//                 </div>
//                 {currentUserRole === Role.ADMIN && (
//                     <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors w-full sm:w-auto justify-center font-bold">
//                         <UserPlus size={16} /> Add Member
//                     </button>
//                 )}
//             </div>

//             <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                 <input 
//                     className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white text-gray-900 placeholder-gray-400" 
//                     placeholder="Search by Username, Name or Email..." 
//                     value={searchQuery}
//                     onChange={(e) => onSearchChange(e.target.value)}
//                 />
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left min-w-[800px]">
//                         <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b">
//                             <tr>
//                                 <th className="px-6 py-4 w-[30%]">Name</th>
//                                 <th className="px-6 py-4 w-[25%]">Contact</th>
//                                 <th className="px-6 py-4 w-[15%]">Role</th>
//                                 <th className="px-6 py-4 w-[15%]">Status</th>
//                                 {currentUserRole === Role.ADMIN && <th className="px-6 py-4 w-[15%] text-right">Actions</th>}
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100 text-sm">
//                             {teamMembers.map(dev => (
//                                 <tr key={dev.id} className="hover:bg-gray-50 transition-colors">
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center gap-3">
//                                             <img src={dev.avatar} alt={dev.fullName} className="w-10 h-10 rounded-full bg-gray-200 border border-gray-100 shrink-0 object-cover" />
//                                             <div className="truncate max-w-[200px]">
//                                                 <span className="font-bold text-gray-900 block truncate" title={dev.fullName}>{dev.fullName}</span>
//                                                 <span className="text-xs text-gray-500 font-mono truncate">{dev.userId || dev.id}</span>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4 text-gray-600">
//                                         <div className="flex flex-col gap-0.5">
//                                             <span className="truncate block font-medium" title={dev.email}>{dev.email}</span>
//                                             <span className="text-xs text-gray-400">{dev.phone}</span>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${dev.role === Role.ADMIN ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
//                                             {dev.role === Role.ADMIN ? 'Admin' : 'Srots Dev'}
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${!dev.isRestricted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
//                                             {!dev.isRestricted ? 'Active' : 'Restricted'}
//                                         </span>
//                                     </td>
//                                     {currentUserRole === Role.ADMIN && (
//                                         <td className="px-6 py-4 text-right">
//                                             <div className="flex justify-end gap-2">
//                                                 <button 
//                                                     type="button"
//                                                     onClick={(e) => { e.stopPropagation(); onToggleStatus(dev); }}
//                                                     className={`p-1.5 rounded transition-colors border ${dev.isRestricted ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100' : 'text-red-500 bg-red-50 border-red-200 hover:bg-red-100'}`}
//                                                     title={dev.isRestricted ? "Enable Access" : "Restrict Access"}
//                                                 >
//                                                     {dev.isRestricted ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
//                                                 </button>
//                                                 <button 
//                                                     type="button"
//                                                     onClick={(e) => { e.stopPropagation(); onDelete(dev.id); }} 
//                                                     className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors" 
//                                                     title="Delete Account"
//                                                 >
//                                                     <Trash2 size={18} />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     )}
//                                 </tr>
//                             ))}
//                             {teamMembers.length === 0 && (
//                                 <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic bg-gray-50/50">No team members found matching your search.</td></tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };


// team/TeamList.tsx (updated with edit button)
import React from 'react';
import { User, Role } from '../../../../types';
import { Search, UserPlus, ToggleLeft, ToggleRight, Trash2, Pencil } from 'lucide-react';

interface TeamListProps {
  teamMembers: User[];
  currentUserRole: Role;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: () => void;
  onToggleStatus: (member: User) => void;
  onDelete: (id: string) => void;
  onEdit: (member: User) => void; // NEW
}

export const TeamList: React.FC<TeamListProps> = ({
  teamMembers,
  currentUserRole,
  searchQuery,
  onSearchChange,
  onAdd,
  onToggleStatus,
  onDelete,
  onEdit,
}) => {
  return (
    <div className="space-y-6">
      {/* Header and search same */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Srots Team</h2>
          <p className="text-sm text-gray-500 mt-1">Manage platform administrators and developers.</p>
        </div>
        {currentUserRole === Role.ADMIN && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors w-full sm:w-auto justify-center font-bold"
          >
            <UserPlus size={16} /> Add Member
          </button>
        )}
      </div>
      {/* Search input same */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white text-gray-900 placeholder-gray-400"
          placeholder="Search by Username, Name or Email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b">
              <tr>
                <th className="px-6 py-4 w-[30%]">Name</th>
                <th className="px-6 py-4 w-[25%]">Contact</th>
                <th className="px-6 py-4 w-[15%]">Role</th>
                <th className="px-6 py-4 w-[15%]">Status</th>
                {currentUserRole === Role.ADMIN && <th className="px-6 py-4 w-[15%] text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {teamMembers.map((dev) => (
                <tr key={dev.id} className="hover:bg-gray-50 transition-colors">
                  {/* Name, Contact, Role, Status same */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={dev.avatar}
                        alt={dev.fullName}
                        className="w-10 h-10 rounded-full bg-gray-200 border border-gray-100 shrink-0 object-cover"
                      />
                      <div className="truncate max-w-[200px]">
                        <span className="font-bold text-gray-900 block truncate" title={dev.fullName}>
                          {dev.fullName}
                        </span>
                        <span className="text-xs text-gray-500 font-mono truncate">{dev.username || dev.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex flex-col gap-0.5">
                      <span className="truncate block font-medium" title={dev.email}>
                        {dev.email}
                      </span>
                      <span className="text-xs text-gray-400">{dev.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        dev.role === Role.ADMIN
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {dev.role === Role.ADMIN ? 'Admin' : 'Srots Dev'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        !dev.isRestricted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {!dev.isRestricted ? 'Active' : 'Restricted'}
                    </span>
                  </td>
                  {currentUserRole === Role.ADMIN && (
                    <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                        {/* Toggle */}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onToggleStatus(dev); }}
                            className={`p-1.5 rounded transition-colors border ${dev.isRestricted ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100' : 'text-red-500 bg-red-50 border-red-200 hover:bg-red-100'}`}
                            title={dev.isRestricted ? "Enable Access" : "Restrict Access"}
                        >
                            {dev.isRestricted ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                        </button>
                        {/* NEW: Edit Button */}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onEdit(dev); }}
                            className="p-1.5 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                            title="Edit Account"
                        >
                            <Pencil size={18} />
                        </button>
                        {/* Delete */}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete(dev.id); }}
                            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
                            title="Delete Account"
                        >
                            <Trash2 size={18} />
                        </button>
                        </div>
                    </td>
                    )}
                </tr>
              ))}
              {teamMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic bg-gray-50/50">
                    No team members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};