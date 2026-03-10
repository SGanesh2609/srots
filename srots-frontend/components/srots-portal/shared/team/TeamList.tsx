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
  onEdit: (member: User) => void;
}

// ── Avatar with fallback ───────────────────────────────────────────────────────
// Mirrors the CPUserAvatar pattern in CPUsersData.tsx.
// Shows a coloured initial-letter circle when:
//   - avatar/avatarUrl is null, undefined or empty string
//   - image URL fails to load (broken link, ERR_NAME_NOT_RESOLVED, 404, CORS, etc.)
const TeamMemberAvatar: React.FC<{ user: User }> = ({ user }) => {
  const [failed, setFailed] = React.useState(false);

  // Support both possible field names returned by the backend
  const src = (user as any).avatarUrl || (user as any).avatar || undefined;
  const initial = (user.fullName?.trim()?.charAt(0) ?? '?').toUpperCase();

  const COLOURS = [
    'bg-violet-100 text-violet-700',
    'bg-indigo-100 text-indigo-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700',
  ];
  const colour = COLOURS[(initial.charCodeAt(0) || 0) % COLOURS.length];

  // Reset failed state when src changes (e.g. after avatar upload)
  React.useEffect(() => { setFailed(false); }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={user.fullName}
        className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm select-none ${colour}`}
      title={user.fullName}
    >
      {initial}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
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

      {/* Header */}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white text-gray-900 placeholder-gray-400"
          placeholder="Search by Username, Name or Email..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b">
              <tr>
                <th className="px-6 py-4 w-[30%]">Name</th>
                <th className="px-6 py-4 w-[25%]">Contact</th>
                <th className="px-6 py-4 w-[15%]">Role</th>
                <th className="px-6 py-4 w-[15%]">Status</th>
                {currentUserRole === Role.ADMIN && (
                  <th className="px-6 py-4 w-[15%] text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {teamMembers.map(dev => (
                <tr key={dev.id} className="hover:bg-gray-50/60 transition-colors group">

                  {/* Name + Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <TeamMemberAvatar user={dev} />
                      <div className="min-w-0">
                        <span
                          className="font-bold text-gray-900 block truncate max-w-[180px]"
                          title={dev.fullName}
                        >
                          {dev.fullName}
                        </span>
                        <span className="text-xs text-gray-400 font-mono block truncate max-w-[180px]">
                          {(dev as any).username || dev.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="truncate block font-medium text-sm max-w-[200px]"
                        title={dev.email}
                      >
                        {dev.email}
                      </span>
                      <span className="text-xs text-gray-400">{dev.phone || '—'}</span>
                    </div>
                  </td>

                  {/* Role badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                      dev.role === Role.ADMIN
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {dev.role === Role.ADMIN ? 'Admin' : 'Srots Dev'}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      !dev.isRestricted
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {!dev.isRestricted ? 'Active' : 'Restricted'}
                    </span>
                  </td>

                  {/* Actions — ADMIN only, fade in on row hover */}
                  {currentUserRole === Role.ADMIN && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">

                        {/* Toggle — only for non-ADMIN members */}
                        {dev.role !== Role.ADMIN && (
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onToggleStatus(dev); }}
                            className={`p-1.5 rounded-lg transition-colors border ${
                              dev.isRestricted
                                ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                                : 'text-amber-500 bg-amber-50 border-amber-200 hover:bg-amber-100'
                            }`}
                            title={dev.isRestricted ? 'Enable Access' : 'Restrict Access'}
                          >
                            {dev.isRestricted ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); onEdit(dev); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors"
                          title="Edit Account"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); onDelete(dev.id); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {teamMembers.length === 0 && (
                <tr>
                  <td colSpan={currentUserRole === Role.ADMIN ? 5 : 4} className="px-6 py-12 text-center text-gray-400 italic bg-gray-50/50">
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