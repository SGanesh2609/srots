import React, { useState } from 'react';
import { User, Role } from '../../../../types';
import { Search, UserPlus, ToggleLeft, ToggleRight, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

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
  const [page, setPage] = useState(0);

  // Reset to page 0 when search changes
  React.useEffect(() => { setPage(0); }, [searchQuery, teamMembers.length]);

  const totalPages = Math.ceil(teamMembers.length / PAGE_SIZE);
  const pageMembers = teamMembers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">

      {/* Compact header row */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-gray-700 shrink-0">Srots Team</h2>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            className="w-full pl-7 pr-3 py-1.5 border rounded-lg text-xs focus:ring-1 focus:ring-blue-200 outline-none bg-gray-50 text-gray-900 border-gray-200 placeholder:text-gray-400 transition-all"
            placeholder="Search by username, name or email…"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        {currentUserRole === Role.ADMIN && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0 text-xs font-bold"
          >
            <UserPlus size={12} /> Add Member
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500 font-medium text-[10px] uppercase border-b">
              <tr>
                <th className="px-4 py-3 w-[30%]">Name</th>
                <th className="px-4 py-3 w-[25%]">Contact</th>
                <th className="px-4 py-3 w-[15%]">Role</th>
                <th className="px-4 py-3 w-[15%]">Status</th>
                {currentUserRole === Role.ADMIN && (
                  <th className="px-4 py-3 w-[15%] text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {pageMembers.map(dev => (
                <tr key={dev.id} className="hover:bg-gray-50/60 transition-colors">

                  {/* Name + Avatar */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <TeamMemberAvatar user={dev} />
                      <div className="min-w-0">
                        <span
                          className="font-bold text-gray-900 block truncate max-w-[160px] text-xs"
                          title={dev.fullName}
                        >
                          {dev.fullName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono block truncate max-w-[160px]">
                          {(dev as any).username || dev.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-2.5 text-gray-600">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="truncate block font-medium text-xs max-w-[180px]"
                        title={dev.email}
                      >
                        {dev.email}
                      </span>
                      <span className="text-[10px] text-gray-400">{dev.phone || '—'}</span>
                    </div>
                  </td>

                  {/* Role badge */}
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                      dev.role === Role.ADMIN
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {dev.role === Role.ADMIN ? 'Admin' : 'Srots Dev'}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      !dev.isRestricted
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {!dev.isRestricted ? 'Active' : 'Restricted'}
                    </span>
                  </td>

                  {/* Actions — ADMIN only */}
                  {currentUserRole === Role.ADMIN && (
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-1">

                        {/* Toggle — only for non-ADMIN members */}
                        {dev.role !== Role.ADMIN && (
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onToggleStatus(dev); }}
                            className={`p-1 rounded-lg transition-colors border ${
                              dev.isRestricted
                                ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                                : 'text-amber-500 bg-amber-50 border-amber-200 hover:bg-amber-100'
                            }`}
                            title={dev.isRestricted ? 'Enable Access' : 'Restrict Access'}
                          >
                            {dev.isRestricted ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); onEdit(dev); }}
                          className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors"
                          title="Edit Account"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); onDelete(dev.id); }}
                          className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {pageMembers.length === 0 && (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, teamMembers.length)} of {teamMembers.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${page === i ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1.5 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};