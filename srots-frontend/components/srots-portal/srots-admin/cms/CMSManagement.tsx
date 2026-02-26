
// import React, { useState, useEffect } from 'react';
// import { CollegeService } from '../../../../services/collegeService';
// import { CompanyService } from '../../../../services/companyService';
// import { College, User, AddressFormData } from '../../../../types';
// import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';
// import { CollegeList } from './CollegeList';
// import { CollegeFormModal } from './CollegeFormModal';
// import { CollegeDetailView } from './CollegeDetailView';

// interface CMSManagementProps {
//     user: User;
// }

// export const CMSManagement: React.FC<CMSManagementProps> = ({ user }) => {
//   const [collegesList, setCollegesList] = useState<College[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
  
//   const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
//   const [showFormModal, setShowFormModal] = useState(false);
//   const [editingCollege, setEditingCollege] = useState<College | null>(null);
//   const [deleteState, setDeleteState] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

//   useEffect(() => { 
//       refreshColleges(); 
//   }, [searchQuery, selectedCollegeId]);

//   const refreshColleges = async () => { 
//       const results = await CollegeService.searchColleges(searchQuery);
//       setCollegesList(results); 
//   };

//   const handleOpenAdd = () => { setEditingCollege(null); setShowFormModal(true); };
//   const handleOpenEdit = (college: College) => { setEditingCollege(college); setShowFormModal(true); };

//   const handleSaveCollege = async (data: Partial<College>, logoFile?: File, rawAddress?: AddressFormData) => {
//       try {
//           if (editingCollege) {
//               const updatedCollege: College = { ...editingCollege, ...data as College };
//               await CollegeService.updateCollege(updatedCollege, logoFile, rawAddress);
//           } else {
//               await CollegeService.createCollege(data, logoFile, rawAddress);
//           }
//           refreshColleges(); 
//           setShowFormModal(false);
//       } catch (error: any) {
//           alert(error.response?.data?.message || "Failed to save college.");
//       }
//   };

//   const requestDeleteCollege = (id: string) => { setDeleteState({ isOpen: true, id }); };
//   const confirmDeleteCollege = async () => { 
//       if (deleteState.id) { 
//           await CollegeService.deleteCollege(deleteState.id); 
//           refreshColleges(); 
//           if (selectedCollegeId === deleteState.id) setSelectedCollegeId(null); 
//           setDeleteState({ isOpen: false, id: null }); 
//       } 
//   };

//   const selectedCollege = collegesList.find(c => c.id === selectedCollegeId);

//   return (
//       <>
//           {!selectedCollege ? (
//               <CollegeList 
//                   colleges={collegesList} 
//                   searchQuery={searchQuery}
//                   onSearchChange={setSearchQuery}
//                   onSelect={setSelectedCollegeId} 
//                   onAdd={handleOpenAdd} 
//                   onEdit={handleOpenEdit} 
//                   onDelete={requestDeleteCollege} 
//               />
//           ) : (
//               <CollegeDetailView 
//                   college={selectedCollege} 
//                   onBack={() => setSelectedCollegeId(null)} 
//                   onRefresh={refreshColleges} 
//                   currentUser={user}
//               />
//           )}
//           <CollegeFormModal isOpen={showFormModal} onClose={() => setShowFormModal(false)} onSave={handleSaveCollege} initialData={editingCollege} />
//           <DeleteConfirmationModal isOpen={deleteState.isOpen} onClose={() => setDeleteState({isOpen: false, id: null})} onConfirm={confirmDeleteCollege} title="Delete College?" message="WARNING: This will permanently delete the College and all associated student data." />
//       </>
//   );
// };


import React, { useState, useEffect } from 'react';
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
    const [collegesList, setCollegesList] = useState<College[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCollege, setEditingCollege] = useState<College | null>(null);
    const [deleteState, setDeleteState] = useState<{ isOpen: boolean, id: string | null, permanent?: boolean }>({ isOpen: false, id: null, permanent: false });
  
    const [includeInactive, setIncludeInactive] = useState(true); // Changed default to true to show inactive colleges
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => { 
        refreshColleges(); 
    }, [searchQuery, includeInactive, page, rowsPerPage, selectedCollegeId]);

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
            if (selectedCollegeId === deleteState.id) setSelectedCollegeId(null); 
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