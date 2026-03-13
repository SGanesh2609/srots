import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CompanyService } from '../../services/companyService';
import { GlobalCompany, Role, User, AddressFormData } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../common/Toast';
import {
  Search,
  Edit2,
  Trash2,
  Building,
  Unlink,
  Plus,
  CheckCircle,
  Database,
  LayoutGrid,
  Loader2,
  AlertCircle,
  X,
  Globe,
  MapPin,
} from 'lucide-react';
import { Pagination } from '../common/Pagination';
import { Modal } from '../common/Modal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { AddressForm } from '../common/AddressForm';

interface CompaniesSectionProps {
  user: User;
}

const PAGE_SIZE = 12;

export const CompaniesSection: React.FC<CompaniesSectionProps> = ({ user }) => {
  const toast = useToast();
  const isSrotsUser = user.role === Role.ADMIN || user.role === Role.SROTS_DEV;
  const isCPH = user.role === Role.CPH;
  const isStaffStudent = user.role === Role.STAFF || user.role === Role.STUDENT;

  const [displayedCompanies, setDisplayedCompanies] = useState<GlobalCompany[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [searchParams, setSearchParams] = useSearchParams();
  const abortRef = useRef<AbortController | null>(null);

  const [viewMode, setViewMode] = useState<'partners' | 'browse'>(() => {
    const v = searchParams.get('cview') as 'partners' | 'browse';
    if (isSrotsUser) return 'browse';
    return v === 'browse' ? 'browse' : 'partners';
  });

  const handleViewMode = (mode: 'partners' | 'browse') => {
    setCurrentPage(0);
    setViewMode(mode);
    setSearchParams(prev => { const p = new URLSearchParams(prev); if (mode !== 'partners') p.set('cview', mode); else p.delete('cview'); return p; }, { replace: true });
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, type: 'global' | 'link', id: string | null }>({ isOpen: false, type: 'global', id: null });
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<GlobalCompany | null>(null);
  const [detailCompany, setDetailCompany] = useState<GlobalCompany | null>(null);
  const [companyForm, setCompanyForm] = useState<Partial<GlobalCompany>>({ name: '', website: '', description: '', headquarters: '' });
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India'
  });

  // Reset page when search (debounced) or view changes
  useEffect(() => { setCurrentPage(0); }, [debouncedSearch, viewMode]);

  const refreshList = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    try {
      const collegeId = user.collegeId || '';
      let result: { companies: GlobalCompany[]; totalPages: number; totalElements: number };

      if (isSrotsUser) {
        result = await CompanyService.searchGlobalCompanies(debouncedSearch, undefined, currentPage, PAGE_SIZE);
      } else if (viewMode === 'partners') {
        result = await CompanyService.searchCollegeCompanies(collegeId, debouncedSearch, currentPage, PAGE_SIZE);
      } else {
        result = await CompanyService.searchGlobalCompanies(debouncedSearch, collegeId, currentPage, PAGE_SIZE);
      }

      setDisplayedCompanies(result.companies);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error('Failed to load companies:', err);
      setError('Failed to load companies. Please check your connection and try again.');
      setDisplayedCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [user.id, user.collegeId, user.role, debouncedSearch, viewMode, currentPage, isSrotsUser]);

  useEffect(() => {
    refreshList();
    return () => { abortRef.current?.abort(); };
  }, [refreshList]);

  const handleLinkCompany = async (companyId: string) => {
    if (user.collegeId) {
      try {
        await CompanyService.addCompanyToCollege(user.collegeId, companyId);
        toast.success('Company added to your college.');
        refreshList();
      } catch (err) {
        toast.error('Failed to add company to college. Please try again.');
      }
    }
  };

  const handleSaveCompany = async () => {
    if (!companyForm.name?.trim()) {
      toast.warning('Company name is required.');
      return;
    }
    // Map frontend `logo` field → backend `logoUrl` field in request
    const finalData = { ...companyForm, logoUrl: companyForm.logo || '', address: addressForm };
    try {
      if (editingCompany) {
        await CompanyService.updateGlobalCompany({ ...editingCompany, ...finalData } as GlobalCompany);
      } else {
        await CompanyService.createGlobalCompany(finalData);
      }
      toast.success(editingCompany ? 'Company updated successfully.' : 'Company created successfully.');
      refreshList();
      setShowCompanyModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving company. Please try again.');
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
        toast.success('Removed successfully.');
        refreshList();
      } catch (err) {
        toast.error('Failed to remove. Please try again.');
      } finally {
        setDeleteConfirmation({ isOpen: false, type: 'global', id: null });
      }
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in">
      {/* Compact header row */}
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-sm font-bold text-gray-700 shrink-0">
          {isSrotsUser ? 'Global Companies' : viewMode === 'partners' ? 'Partner Companies' : 'Global Directory'}
        </h2>

        {/* View mode toggle — CPH only */}
        {!isSrotsUser && !isStaffStudent && (
          <div className="flex bg-gray-100 p-0.5 rounded-lg border shrink-0">
            <button
              onClick={() => handleViewMode('partners')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${viewMode === 'partners' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid size={11} /> Partners
            </button>
            <button
              onClick={() => handleViewMode('browse')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${viewMode === 'browse' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Database size={11} /> Browse
            </button>
          </div>
        )}

        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            className="w-full pl-7 pr-3 py-1.5 border rounded-lg text-xs focus:ring-1 focus:ring-blue-200 outline-none bg-gray-50 text-gray-900 border-gray-200 placeholder:text-gray-400"
            placeholder="Search by name, headquarters…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isSrotsUser && (
          <button
            onClick={() => { setEditingCompany(null); setCompanyForm({}); setShowCompanyModal(true); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all text-xs shrink-0"
          >
            <Plus size={12} /> Add
          </button>
        )}
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
            <button
              onClick={refreshList}
              className="mt-4 px-4 py-2 text-sm font-bold bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : displayedCompanies.length === 0 ? (
          <div className="text-center py-12 text-gray-500 italic">
            No companies found. {search ? 'Try different search terms.' : 'Add some companies!'}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {displayedCompanies.map(company => {
              const isLinked = company.isSubscribed;
              return (
                <div
                  key={company.id}
                  className={`bg-white rounded-xl border shadow-sm relative hover:shadow-md transition-all overflow-hidden flex flex-col ${isLinked && viewMode === 'browse' ? 'ring-2 ring-green-100' : ''}`}
                >
                  {isLinked && viewMode === 'browse' && (
                    <div className="absolute top-0 right-0 p-1 bg-green-500 text-white rounded-bl-lg z-10">
                      <CheckCircle size={10} />
                    </div>
                  )}
                  <div className="p-3 flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {company.logo && company.logo.startsWith('http') ? (
                        <img src={company.logo} alt={company.name} className="w-8 h-8 rounded-lg object-cover border shrink-0" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center font-bold text-blue-600 text-sm border shrink-0 uppercase">
                          {company.name?.[0] || '?'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-xs truncate leading-tight">{company.name}</h3>
                        <p className="text-[10px] text-gray-400 flex items-center gap-0.5 truncate">
                          <Building size={8} /> {company.headquarters || 'Remote'}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {company.description || 'No description'}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDetailCompany(company); }}
                      className="text-[10px] text-blue-500 hover:text-blue-700 font-semibold text-left"
                    >
                      See more →
                    </button>
                    <div className="pt-2 border-t border-gray-50 mt-auto">
                      {isSrotsUser ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingCompany(company); setCompanyForm(company); setShowCompanyModal(true); }}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border transition-colors"
                          >
                            <Edit2 size={10} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmation({ isOpen: true, type: 'global', id: company.id })}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg border border-transparent transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : isCPH ? (
                        viewMode === 'partners' ? (
                          <button
                            onClick={() => setDeleteConfirmation({ isOpen: true, type: 'link', id: company.id })}
                            className="w-full py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <Unlink size={10} /> Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => !isLinked && handleLinkCompany(company.id)}
                            disabled={isLinked}
                            className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${isLinked ? 'bg-green-50 text-green-700 cursor-not-allowed border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
                          >
                            {isLinked ? <><CheckCircle size={10} /> Added</> : <><Plus size={10} /> Add</>}
                          </button>
                        )
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          Hiring Partner
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

      {/* Pagination */}
      {!isLoading && !error && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="companies"
        />
      )}

      {/* Company Detail Modal */}
      {detailCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDetailCompany(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start gap-4 p-6 border-b">
              {detailCompany.logo && detailCompany.logo.startsWith('http') ? (
                <img src={detailCompany.logo} alt={detailCompany.name} className="w-14 h-14 rounded-xl object-cover border shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-700 text-2xl border shrink-0 uppercase">
                  {detailCompany.name?.[0] || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{detailCompany.name}</h2>
                {detailCompany.headquarters && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={11} /> {detailCompany.headquarters}
                  </p>
                )}
              </div>
              <button onClick={() => setDetailCompany(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0">
                <X size={18} />
              </button>
            </div>
            {/* Body */}
            <div className="p-6 space-y-4">
              {detailCompany.description && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{detailCompany.description}</p>
                </div>
              )}
              {detailCompany.website && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Website</p>
                  <a href={detailCompany.website} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                    <Globe size={13} /> {detailCompany.website}
                  </a>
                </div>
              )}
              {detailCompany.fullAddress && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address</p>
                  <p className="text-sm text-gray-700">{detailCompany.fullAddress}</p>
                </div>
              )}
            </div>
            {/* Footer actions */}
            <div className="px-6 pb-6 flex gap-2">
              {isSrotsUser && (
                <button
                  onClick={() => { setDetailCompany(null); setEditingCompany(detailCompany); setCompanyForm(detailCompany); setShowCompanyModal(true); }}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit2 size={14} /> Edit
                </button>
              )}
              {isCPH && viewMode === 'browse' && (() => {
                const isLinked = detailCompany.isSubscribed;
                return (
                  <button
                    onClick={() => { if (!isLinked) { handleLinkCompany(detailCompany.id); setDetailCompany(null); } }}
                    disabled={isLinked}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${isLinked ? 'bg-green-50 text-green-700 border border-green-200 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {isLinked ? <><CheckCircle size={14} /> Already Added</> : <><Plus size={14} /> Add to College</>}
                  </button>
                );
              })()}
              <button onClick={() => setDetailCompany(null)} className="px-4 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Logo URL</label>
            <input
              className="w-full p-2.5 border rounded-xl bg-gray-50"
              placeholder="https://example.com/logo.png"
              value={companyForm.logo || ''}
              onChange={e => setCompanyForm({ ...companyForm, logo: e.target.value })}
            />
            {companyForm.logo && companyForm.logo.startsWith('http') && (
              <img src={companyForm.logo} alt="Preview" className="mt-2 h-10 w-10 rounded-lg object-cover border" />
            )}
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