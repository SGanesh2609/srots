
import React, { useState, useEffect } from 'react';
import { CollegeService } from '../../../../services/collegeService';
import { CompanyService } from '../../../../services/companyService';
import { College, User, AddressFormData } from '../../../../types';
import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';
import { CollegeList } from './CollegeList';
import { CollegeFormModal } from './CollegeFormModal';
import { CollegeDetailView } from './CollegeDetailView';

interface CMSManagementProps {
    user: User;
}

export const CMSManagement: React.FC<CMSManagementProps> = ({ user }) => {
  const [collegesList, setCollegesList] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [deleteState, setDeleteState] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

  useEffect(() => { 
      refreshColleges(); 
  }, [searchQuery, selectedCollegeId]);

  const refreshColleges = async () => { 
      const results = await CollegeService.searchColleges(searchQuery);
      setCollegesList(results); 
  };

  const handleOpenAdd = () => { setEditingCollege(null); setShowFormModal(true); };
  const handleOpenEdit = (college: College) => { setEditingCollege(college); setShowFormModal(true); };

  const handleSaveCollege = async (data: Partial<College>, logoFile?: File, rawAddress?: AddressFormData) => {
      try {
          if (editingCollege) {
              const updatedCollege: College = { ...editingCollege, ...data as College };
              await CollegeService.updateCollege(updatedCollege, logoFile, rawAddress);
          } else {
              await CollegeService.createCollege(data, logoFile, rawAddress);
          }
          refreshColleges(); 
          setShowFormModal(false);
      } catch (error: any) {
          alert(error.response?.data?.message || "Failed to save college.");
      }
  };

  const requestDeleteCollege = (id: string) => { setDeleteState({ isOpen: true, id }); };
  const confirmDeleteCollege = async () => { 
      if (deleteState.id) { 
          await CollegeService.deleteCollege(deleteState.id); 
          refreshColleges(); 
          if (selectedCollegeId === deleteState.id) setSelectedCollegeId(null); 
          setDeleteState({ isOpen: false, id: null }); 
      } 
  };

  const selectedCollege = collegesList.find(c => c.id === selectedCollegeId);

  return (
      <>
          {!selectedCollege ? (
              <CollegeList 
                  colleges={collegesList} 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelect={setSelectedCollegeId} 
                  onAdd={handleOpenAdd} 
                  onEdit={handleOpenEdit} 
                  onDelete={requestDeleteCollege} 
              />
          ) : (
              <CollegeDetailView 
                  college={selectedCollege} 
                  onBack={() => setSelectedCollegeId(null)} 
                  onRefresh={refreshColleges} 
                  currentUser={user}
              />
          )}
          <CollegeFormModal isOpen={showFormModal} onClose={() => setShowFormModal(false)} onSave={handleSaveCollege} initialData={editingCollege} />
          <DeleteConfirmationModal isOpen={deleteState.isOpen} onClose={() => setDeleteState({isOpen: false, id: null})} onConfirm={confirmDeleteCollege} title="Delete College?" message="WARNING: This will permanently delete the College and all associated student data." />
      </>
  );
};
