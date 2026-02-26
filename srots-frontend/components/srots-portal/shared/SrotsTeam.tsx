import React, { useState, useEffect } from 'react';
import { User, AddressFormData } from '../../../types';
import { DeleteConfirmationModal } from '../../common/DeleteConfirmationModal';
import { TeamList } from './team/TeamList';
import { TeamMemberFormModal } from './team/TeamMemberFormModal';
import { SrotsService } from '../../../services/srotsService';

interface SrotsTeamProps {
  user: User;
}

export const SrotsTeam: React.FC<SrotsTeamProps> = ({ user }) => {
  const [srotsTeam, setSrotsTeam] = useState<User[]>([]);
  const [teamSearch, setTeamSearch] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editMember, setEditMember] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    refreshList();
  }, [teamSearch]);

  const refreshList = async () => {
    const updatedList = await SrotsService.searchSrotsTeam(teamSearch);
    setSrotsTeam([...updatedList]);
  };

  const handleSave = async (data: {
    username: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    address: AddressFormData;
    aadhaarNumber: string;
  }, id?: string) => {
    try {
      if (id) {
        await SrotsService.updateSrotsUser(id, data);
      } else {
        await SrotsService.createSrotsUser(data);
      }
      refreshList();
      setShowMemberModal(false);
      setEditMember(null);
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${id ? 'update' : 'create'} developer account.`);
    }
  };

  const handleToggleDevAccess = async (dev: User) => {
    try {
      await SrotsService.toggleSrotsRestriction(dev.id, !dev.isRestricted);
      refreshList();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to toggle access.");
    }
  };

  const handleEdit = (member: User) => {
    setEditMember(member);
    setShowMemberModal(true);
  };

  const requestDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await SrotsService.deleteSrotsUser(deleteId);
        refreshList();
      } catch (error: any) {
        alert("Failed to delete.");
      }
      setDeleteId(null);
    }
  };

  return (
    <div className="animate-in fade-in">
      <TeamList
        teamMembers={srotsTeam}
        currentUserRole={user.role}
        searchQuery={teamSearch}
        onSearchChange={setTeamSearch}
        onAdd={() => { setEditMember(null); setShowMemberModal(true); }}
        onToggleStatus={handleToggleDevAccess}
        onDelete={requestDelete}
        onEdit={handleEdit} // NEW
      />
      <TeamMemberFormModal
        isOpen={showMemberModal}
        onClose={() => { setShowMemberModal(false); setEditMember(null); }}
        onSave={handleSave}
        initialData={editMember || undefined}
      />
      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Developer?"
        message="Are you sure you want to delete this Srots Dev account?"
      />
    </div>
  );
};