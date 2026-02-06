// import React, { useState, useEffect } from 'react';
// import { CompanyService } from '../../services/companyService';
// import { GlobalCompany, Role, User, AddressFormData } from '../../types';
// import { 
//   Search, 
//   ExternalLink, 
//   Edit2, 
//   Trash2, 
//   Building, 
//   Unlink, 
//   Plus, 
//   CheckCircle, 
//   Database, 
//   LayoutGrid,
//   Loader2
// } from 'lucide-react';
// import { Modal } from '../common/Modal';
// import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
// import { AddressForm } from '../common/AddressForm';

// interface CompaniesSectionProps {
//   user: User;
// }

// export const CompaniesSection: React.FC<CompaniesSectionProps> = ({ user }) => {
//   const isSrotsUser = user.role === Role.ADMIN || user.role === Role.SROTS_DEV;
//   const isCPH = user.role === Role.CPH;
//   const isStaffStudent = user.role === Role.STAFF || user.role === Role.STUDENT;
  
//   const [displayedCompanies, setDisplayedCompanies] = useState<GlobalCompany[]>([]);
//   const [search, setSearch] = useState('');
//   const [viewMode, setViewMode] = useState<'partners' | 'browse'>(isSrotsUser ? 'browse' : 'partners');
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, type: 'global' | 'link', id: string | null }>({ isOpen: false, type: 'global', id: null });
//   const [showCompanyModal, setShowCompanyModal] = useState(false);
//   const [editingCompany, setEditingCompany] = useState<GlobalCompany | null>(null);
//   const [companyForm, setCompanyForm] = useState<Partial<GlobalCompany>>({ name: '', website: '', description: '', headquarters: '' });
//   const [addressForm, setAddressForm] = useState<AddressFormData>({
//     addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
//   });

//   useEffect(() => {
//     refreshList();
//   }, [user.id, user.collegeId, user.role, search, viewMode]);

//   const refreshList = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const collegeId = user.collegeId || '';
//       console.log('Using collegeId:', collegeId); // Debug: check collegeId
//       let results: GlobalCompany[] = [];

//       if (isSrotsUser) {
//         results = await CompanyService.searchGlobalCompanies(search);
//       } else {
//         if (viewMode === 'partners') {
//           results = await CompanyService.searchCollegeCompanies(collegeId, search);
//         } else {
//           results = await CompanyService.searchGlobalCompanies(search, collegeId);
//         }
//       }

//       const safeResults = Array.isArray(results) ? results : [];
//       console.log('Fetched companies:', safeResults);
//       setDisplayedCompanies(safeResults);
//     } catch (err: any) {
//       console.error('Failed to load companies:', err);
//       setError(err.message || 'Failed to load companies');
//       setDisplayedCompanies([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLinkCompany = async (companyId: string) => {
//     if (user.collegeId) {
//       try {
//         await CompanyService.addCompanyToCollege(user.collegeId, companyId);
//         refreshList();
//       } catch (err) {
//         alert("Failed to add company to college");
//       }
//     }
//   };

//   const handleSaveCompany = async () => {
//     if (!companyForm.name?.trim()) return alert("Name is required");
//     const finalData = { ...companyForm, address: addressForm };
//     try {
//       if (editingCompany) {
//         await CompanyService.updateGlobalCompany({ ...editingCompany, ...finalData } as any);
//       } else {
//         await CompanyService.createGlobalCompany(finalData);
//       }
//       refreshList();
//       setShowCompanyModal(false);
//     } catch (error: any) {
//       alert(error.response?.data?.message || "Error saving company");
//     }
//   };

//   const confirmDelete = async () => {
//     if (deleteConfirmation.id) {
//       try {
//         if (deleteConfirmation.type === 'global') {
//           await CompanyService.deleteGlobalCompany(deleteConfirmation.id);
//         } else if (user.collegeId) {
//           await CompanyService.removeCompanyFromCollege(user.collegeId, deleteConfirmation.id);
//         }
//         refreshList();
//       } catch (err) {
//         alert("Failed to delete");
//       } finally {
//         setDeleteConfirmation({ isOpen: false, type: 'global', id: null });
//       }
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Loader2 className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="text-red-600 text-center p-8 font-bold">{error}</div>;
//   }

//   return (
//     <div className="space-y-6 animate-in fade-in">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">
//             {isSrotsUser ? 'Global Companies Master' : viewMode === 'partners' ? 'Partner Companies' : 'Global Directory'}
//           </h2>
//           <p className="text-sm text-gray-500">
//             {isSrotsUser ? 'Platform-wide corporate database.' : 'Discover and link hiring partners to your college.'}
//           </p>
//         </div>
//         {isSrotsUser && (
//           <button
//             onClick={() => { setEditingCompany(null); setCompanyForm({}); setShowCompanyModal(true); }}
//             className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
//           >
//             <Plus size={18} /> Add Global Master
//           </button>
//         )}
//       </div>

//       {!isSrotsUser && !isStaffStudent && (
//         <div className="flex bg-gray-100 p-1 rounded-xl w-fit border shadow-inner">
//           <button
//             onClick={() => setViewMode('partners')}
//             className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'partners' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
//           >
//             <LayoutGrid size={14} /> My College Partners
//           </button>
//           <button
//             onClick={() => setViewMode('browse')}
//             className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'browse' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
//           >
//             <Database size={14} /> Browse Global Database
//           </button>
//         </div>
//       )}

//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//         <input
//           className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900 shadow-sm"
//           placeholder="Search by name, headquarters, or description..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {displayedCompanies.length === 0 ? (
//         <div className="text-center py-12 text-gray-500 italic">
//           No companies found. {search ? 'Try different search terms.' : 'Add some companies!'}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {displayedCompanies.map(company => {
//             const isLinked = (company as any).isLinked || (company as any).isSubscribed;
//             console.log(`Rendering company '${company.name}' | isSubscribed: ${company.isSubscribed} | isLinked: ${isLinked}`); // Debug per company
//             return (
//               <div
//                 key={company.id}
//                 className={`bg-white rounded-2xl border shadow-sm relative group hover:shadow-md transition-all overflow-hidden flex flex-col ${isLinked && viewMode === 'browse' ? 'ring-2 ring-green-100' : ''}`}
//               >
//                 {isLinked && viewMode === 'browse' && (
//                   <div className="absolute top-0 right-0 p-2 bg-green-500 text-white rounded-bl-xl shadow-sm z-10">
//                     <CheckCircle size={14} />
//                   </div>
//                 )}
//                 <div className="p-6 flex-1 flex flex-col">
//                   <div className="flex items-center gap-4 mb-4">
//                     <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-blue-600 text-xl border shadow-inner shrink-0 uppercase">
//                       {company.name?.[0] || '?'}
//                     </div>
//                     <div className="min-w-0">
//                       <h3 className="font-bold text-gray-900 truncate">{company.name}</h3>
//                       {company.website && (
//                         <a
//                           href={company.website}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
//                         >
//                           Visit Website <ExternalLink size={10} />
//                         </a>
//                       )}
//                     </div>
//                   </div>
//                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
//                     <Building size={10} /> HQ: {company.headquarters || 'Remote'}
//                   </p>
//                   <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[40px] flex-1">
//                     {company.description || 'No description available'}
//                   </p>
//                   <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
//                     {isSrotsUser ? (
//                       <div className="flex gap-2 w-full">
//                         <button
//                           onClick={() => { setEditingCompany(company); setCompanyForm(company); setShowCompanyModal(true); }}
//                           className="flex-1 flex justify-center py-2 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border transition-colors"
//                         >
//                           <Edit2 size={14} /> Edit
//                         </button>
//                         <button
//                           onClick={() => setDeleteConfirmation({ isOpen: true, type: 'global', id: company.id })}
//                           className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-transparent transition-colors"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     ) : isCPH ? (
//                       viewMode === 'partners' ? (
//                         <button
//                           onClick={() => setDeleteConfirmation({ isOpen: true, type: 'link', id: company.id })}
//                           className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
//                         >
//                           <Unlink size={14} /> Remove Reference
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => !isLinked && handleLinkCompany(company.id)}
//                           disabled={isLinked}
//                           className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${isLinked ? 'bg-green-50 text-green-700 cursor-not-allowed border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95'}`}
//                         >
//                           {isLinked ? (
//                             <>
//                               <CheckCircle size={14} /> Reference Added
//                             </>
//                           ) : (
//                             <>
//                               <Plus size={14} /> Add to College
//                             </>
//                           )}
//                         </button>
//                       )
//                     ) : (
//                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                         Authorized Hiring Partner
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//       <Modal isOpen={showCompanyModal} onClose={() => setShowCompanyModal(false)} title={editingCompany ? "Update Master Company" : "Register Global Master"} maxWidth="max-w-md">
//         <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
//           <div>
//             <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Company Name *</label>
//             <input
//               className="w-full p-2.5 border rounded-xl bg-gray-50"
//               value={companyForm.name || ''}
//               onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
//             />
//           </div>
//           <div>
//             <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Website</label>
//             <input
//               className="w-full p-2.5 border rounded-xl bg-gray-50"
//               placeholder="https://..."
//               value={companyForm.website || ''}
//               onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })}
//             />
//           </div>
//           <div>
//             <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Short Bio</label>
//             <textarea
//               className="w-full p-2.5 border rounded-xl bg-gray-50 resize-none"
//               rows={3}
//               value={companyForm.description || ''}
//               onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
//             />
//           </div>
//           <div className="border-t pt-4">
//             <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block">Global Headquarters</label>
//             <AddressForm data={addressForm} onChange={setAddressForm} />
//           </div>
//         </div>
//         <div className="p-4 bg-gray-50 border-t flex justify-end">
//           <button
//             onClick={handleSaveCompany}
//             className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
//           >
//             Save Global Record
//           </button>
//         </div>
//       </Modal>
//       <DeleteConfirmationModal
//         isOpen={deleteConfirmation.isOpen}
//         onClose={() => setDeleteConfirmation({ isOpen: false, type: 'global', id: null })}
//         onConfirm={confirmDelete}
//         title={deleteConfirmation.type === 'global' ? "Delete from Platform?" : "Remove reference?"}
//         message={deleteConfirmation.type === 'global' ? "This removes the company from ALL colleges." : "This removes the company from your college list."}
//       />
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { CompanyService } from '../../services/companyService';
import { GlobalCompany, Role, User, AddressFormData } from '../../types';
import { 
  Search, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Building, 
  Unlink, 
  Plus, 
  CheckCircle, 
  Database, 
  LayoutGrid,
  Loader2,
  AlertCircle  // NEW: Import for error icon
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { AddressForm } from '../common/AddressForm';

interface CompaniesSectionProps {
  user: User;
}

export const CompaniesSection: React.FC<CompaniesSectionProps> = ({ user }) => {
  const isSrotsUser = user.role === Role.ADMIN || user.role === Role.SROTS_DEV;
  const isCPH = user.role === Role.CPH;
  const isStaffStudent = user.role === Role.STAFF || user.role === Role.STUDENT;
  
  const [displayedCompanies, setDisplayedCompanies] = useState<GlobalCompany[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'partners' | 'browse'>(isSrotsUser ? 'browse' : 'partners');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, type: 'global' | 'link', id: string | null }>({ isOpen: false, type: 'global', id: null });
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<GlobalCompany | null>(null);
  const [companyForm, setCompanyForm] = useState<Partial<GlobalCompany>>({ name: '', website: '', description: '', headquarters: '' });
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
  });

  useEffect(() => {
    refreshList();
  }, [user.id, user.collegeId, user.role, search, viewMode]);

  const refreshList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const collegeId = user.collegeId || '';
      let results: GlobalCompany[] = [];

      if (isSrotsUser) {
        results = await CompanyService.searchGlobalCompanies(search);
      } else {
        if (viewMode === 'partners') {
          results = await CompanyService.searchCollegeCompanies(collegeId, search);
        } else {
          results = await CompanyService.searchGlobalCompanies(search, collegeId);
        }
      }

      const safeResults = Array.isArray(results) ? results : [];
      setDisplayedCompanies(safeResults);
    } catch (err: any) {
      console.error('Failed to load companies:', err);
      setError(err.message || 'Failed to load companies. Please check your connection and try again.');
      setDisplayedCompanies([]);  // Clear data on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkCompany = async (companyId: string) => {
    if (user.collegeId) {
      try {
        await CompanyService.addCompanyToCollege(user.collegeId, companyId);
        refreshList();
      } catch (err) {
        alert("Failed to add company to college");
      }
    }
  };

  const handleSaveCompany = async () => {
    if (!companyForm.name?.trim()) return alert("Name is required");
    const finalData = { ...companyForm, address: addressForm };
    try {
      if (editingCompany) {
        await CompanyService.updateGlobalCompany({ ...editingCompany, ...finalData } as any);
      } else {
        await CompanyService.createGlobalCompany(finalData);
      }
      refreshList();
      setShowCompanyModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Error saving company");
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.id) {
      try {
        if (deleteConfirmation.type === 'global') {
          await CompanyService.deleteGlobalCompany(deleteConfirmation.id);
        } else if (user.collegeId) {
          await CompanyService.removeCompanyFromCollege(user.collegeId, deleteConfirmation.id);
        }
        refreshList();
      } catch (err) {
        alert("Failed to delete");
      } finally {
        setDeleteConfirmation({ isOpen: false, type: 'global', id: null });
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Static Header - always shown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isSrotsUser ? 'Global Companies Master' : viewMode === 'partners' ? 'Partner Companies' : 'Global Directory'}
          </h2>
          <p className="text-sm text-gray-500">
            {isSrotsUser ? 'Platform-wide corporate database.' : 'Discover and link hiring partners to your college.'}
          </p>
        </div>
        {isSrotsUser && (
          <button
            onClick={() => { setEditingCompany(null); setCompanyForm({}); setShowCompanyModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <Plus size={18} /> Add Global Master
          </button>
        )}
      </div>

      {/* Static Tabs - always shown for non-Srots/non-staff/student */}
      {!isSrotsUser && !isStaffStudent && (
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit border shadow-inner">
          <button
            onClick={() => setViewMode('partners')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'partners' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid size={14} /> My College Partners
          </button>
          <button
            onClick={() => setViewMode('browse')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'browse' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Database size={14} /> Browse Global Database
          </button>
        </div>
      )}

      {/* Static Search Bar - always shown */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900 shadow-sm"
          placeholder="Search by name, headquarters, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Dynamic Content Area - shows loader, error, or data */}
      <div className="min-h-64">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-64 text-red-600">
            <AlertCircle size={48} className="mb-4" />
            <p className="text-center font-bold">{error}</p>
          </div>
        ) : displayedCompanies.length === 0 ? (
          <div className="text-center py-12 text-gray-500 italic">
            No companies found. {search ? 'Try different search terms.' : 'Add some companies!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCompanies.map(company => {
              const isLinked = (company as any).isLinked || (company as any).isSubscribed;
              return (
                <div
                  key={company.id}
                  className={`bg-white rounded-2xl border shadow-sm relative group hover:shadow-md transition-all overflow-hidden flex flex-col ${isLinked && viewMode === 'browse' ? 'ring-2 ring-green-100' : ''}`}
                >
                  {isLinked && viewMode === 'browse' && (
                    <div className="absolute top-0 right-0 p-2 bg-green-500 text-white rounded-bl-xl shadow-sm z-10">
                      <CheckCircle size={14} />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-blue-600 text-xl border shadow-inner shrink-0 uppercase">
                        {company.name?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{company.name}</h3>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            Visit Website <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Building size={10} /> HQ: {company.headquarters || 'Remote'}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[40px] flex-1">
                      {company.description || 'No description available'}
                    </p>
                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                      {isSrotsUser ? (
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => { setEditingCompany(company); setCompanyForm(company); setShowCompanyModal(true); }}
                            className="flex-1 flex justify-center py-2 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border transition-colors"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmation({ isOpen: true, type: 'global', id: company.id })}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-transparent transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : isCPH ? (
                        viewMode === 'partners' ? (
                          <button
                            onClick={() => setDeleteConfirmation({ isOpen: true, type: 'link', id: company.id })}
                            className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <Unlink size={14} /> Remove Reference
                          </button>
                        ) : (
                          <button
                            onClick={() => !isLinked && handleLinkCompany(company.id)}
                            disabled={isLinked}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${isLinked ? 'bg-green-50 text-green-700 cursor-not-allowed border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95'}`}
                          >
                            {isLinked ? (
                              <>
                                <CheckCircle size={14} /> Reference Added
                              </>
                            ) : (
                              <>
                                <Plus size={14} /> Add to College
                              </>
                            )}
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Authorized Hiring Partner
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals - always available */}
      <Modal isOpen={showCompanyModal} onClose={() => setShowCompanyModal(false)} title={editingCompany ? "Update Master Company" : "Register Global Master"} maxWidth="max-w-md">
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Company Name *</label>
            <input
              className="w-full p-2.5 border rounded-xl bg-gray-50"
              value={companyForm.name || ''}
              onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Website</label>
            <input
              className="w-full p-2.5 border rounded-xl bg-gray-50"
              placeholder="https://..."
              value={companyForm.website || ''}
              onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Short Bio</label>
            <textarea
              className="w-full p-2.5 border rounded-xl bg-gray-50 resize-none"
              rows={3}
              value={companyForm.description || ''}
              onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
            />
          </div>
          <div className="border-t pt-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block">Global Headquarters</label>
            <AddressForm data={addressForm} onChange={setAddressForm} />
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={handleSaveCompany}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            Save Global Record
          </button>
        </div>
      </Modal>
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, type: 'global', id: null })}
        onConfirm={confirmDelete}
        title={deleteConfirmation.type === 'global' ? "Delete from Platform?" : "Remove reference?"}
        message={deleteConfirmation.type === 'global' ? "This removes the company from ALL colleges." : "This removes the company from your college list."}
      />
    </div>
  );
};