import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CollegeService } from '../../../../services/collegeService';
import { College, User, AddressFormData } from '../../../../types';
import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';
import { CollegeList } from './CollegeList';
import { CollegeFormModal } from './CollegeFormModal';
import { CollegeDetailView } from './CollegeDetailView';

interface CMSManagementProps {
    user: User;
}

export const CMSManagement: React.FC<CMSManagementProps> = ({ user }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [collegesList, setCollegesList] = useState<College[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Restore selected college from URL on mount
    const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(
        searchParams.get('college')
    );
    // When deep-linked to a college that isn't on the current page, hold the fetched object
    const [deepLinkedCollege, setDeepLinkedCollege] = useState<College | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCollege, setEditingCollege] = useState<College | null>(null);
    const [deleteState, setDeleteState] = useState<{ isOpen: boolean, id: string | null, permanent?: boolean }>({ isOpen: false, id: null, permanent: false });

    const [includeInactive, setIncludeInactive] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        refreshColleges();
    }, [searchQuery, includeInactive, page, rowsPerPage, selectedCollegeId]);

    // When collegesList updates, try to resolve a deep-linked college ID that
    // isn't on the current paginated page by fetching it individually.
    useEffect(() => {
        if (!selectedCollegeId) { setDeepLinkedCollege(null); return; }
        if (collegesList.find(c => c.id === selectedCollegeId)) { setDeepLinkedCollege(null); return; }
        CollegeService.getCollegeById(selectedCollegeId)
            .then(college => { if (college) setDeepLinkedCollege(college); else handleSelectCollege(null); })
            .catch(() => handleSelectCollege(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collegesList, selectedCollegeId]);

    useEffect(() => {
        const maxPage = Math.max(0, Math.ceil(total / rowsPerPage) - 1);
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [total, rowsPerPage, page]);

    const refreshColleges = async () => { 
        const { colleges, total: totalElements } = await CollegeService.getColleges(searchQuery, page, rowsPerPage, includeInactive);
        setCollegesList(colleges); 
        setTotal(totalElements);
    };

    // Update both local state and URL when a college is selected / deselected
    const handleSelectCollege = (id: string | null) => {
        setSelectedCollegeId(id);
        if (id) {
            setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('college', id); p.delete('tab'); return p; }, { replace: true });
        } else {
            setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('college'); p.delete('tab'); return p; }, { replace: true });
        }
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
            alert(error.message || "Failed to save college.");
        }
    };

    const requestDeleteCollege = (id: string, permanent: boolean = false) => { 
        setDeleteState({ isOpen: true, id, permanent }); // Add permanent to state
    };

    const confirmDeleteCollege = async () => { 
        if (deleteState.id) { 
            await CollegeService.deleteCollege(deleteState.id, deleteState.permanent || false); 
            refreshColleges(); 
            if (selectedCollegeId === deleteState.id) handleSelectCollege(null);
            setDeleteState({ isOpen: false, id: null, permanent: false }); 
        } 
    };

    const handleToggleActive = async (id: string, active: boolean) => {
        if (active) {
            await CollegeService.activateCollege(id);
        } else {
            await CollegeService.deactivateCollege(id);
        }
        refreshColleges();
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const selectedCollege = collegesList.find(c => c.id === selectedCollegeId) || deepLinkedCollege || undefined;

    return (
      <>
          {!selectedCollege ? (
              <CollegeList 
                  colleges={collegesList} 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelect={handleSelectCollege}
                  onAdd={handleOpenAdd} 
                  onEdit={handleOpenEdit} 
                  onDelete={requestDeleteCollege}
                  onToggleActive={handleToggleActive} 
                  includeInactive={includeInactive}
                  onToggleInactive={setIncludeInactive}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  total={total}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
              />
          ) : (
              <CollegeDetailView
                  college={selectedCollege}
                  onBack={() => handleSelectCollege(null)}
                  onRefresh={refreshColleges}
                  currentUser={user}
              />
          )}
          <CollegeFormModal isOpen={showFormModal} onClose={() => setShowFormModal(false)} onSave={handleSaveCollege} initialData={editingCollege} />
          <DeleteConfirmationModal isOpen={deleteState.isOpen} onClose={() => setDeleteState({isOpen: false, id: null})} onConfirm={confirmDeleteCollege} title="Delete College?" message="WARNING: This will permanently delete the College and all associated student data." />
      </>
  );
};