// // src/components/colleges/shared/about-college/AboutCollegeComponent.tsx
// import React, { useState, useEffect } from 'react';
// import { User, College, Role, CollegeAboutSection } from '../../../types';
// import { CollegeService } from '../../../services/collegeService';
// import { Plus, Building, Loader2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
// import { DeleteConfirmationModal } from '../../common/DeleteConfirmationModal';

// // Sub-Components
// import { CollegeHero } from './about-college/CollegeHero';
// import { AboutSectionItem } from './about-college/AboutSectionItem';
// import { AboutSectionForm } from './about-college/AboutSectionForm';

// // Use correct backend port (match axios baseURL)
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

// interface AboutCollegeComponentProps {
//   user: User;
// }

// export const AboutCollegeComponent: React.FC<AboutCollegeComponentProps> = ({ user }) => {
//   const [college, setCollege] = useState<College | undefined>(undefined);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const isCPH = user.role === Role.CPH;

//   const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
//   const [isAddingSection, setIsAddingSection] = useState(false);
//   const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);

//   useEffect(() => {
//     refreshCollege();
//   }, [user.collegeId]);

//   const refreshCollege = async () => {
//     setIsLoading(true);
//     setError(null);
//     if (user.collegeId) {
//       try {
//         const col = await CollegeService.getCollegeById(user.collegeId);
//         setCollege(col);
//       } catch (e: any) {
//         console.error("Failed to load college profile", e);
//         setError(e.response?.data?.message || 'Failed to load college profile.');
//       } finally {
//         setIsLoading(false);
//       }
//     } else {
//       setError('No college associated with your account.');
//       setIsLoading(false);
//     }
//   };

//   const sections = college?.aboutSections || [];
//   const canAddMore = sections.length < 7;

//   // const handleLogoUpload = async (file: File) => {
//   //   if (!isCPH || !college?.id || !college?.code) return;
//   //   try {
//   //     const newUrl = await CollegeService.updateCollegeLogo(college.id, file);
//   //     setCollege(prev => prev ? { ...prev, logo: newUrl } : prev);
//   //   } catch (e: any) {
//   //     alert(e.response?.data?.message || "Logo update failed.");
//   //   }
//   // };

//   const handleLogoUpload = async (file: File) => {
//     if (!isCPH || !college?.id || !college?.code) return;
//     try {
//       const newUrl = await CollegeService.updateCollegeLogo(college.id, file);
//       // Prepend full URL before setting state
//       const fullUrl = newUrl.startsWith('http') ? newUrl : `${API_BASE_URL}${newUrl.startsWith('/') ? '' : '/'}${newUrl}`;
//       console.log('New logo full URL set in state:', fullUrl);
//       setCollege(prev => prev ? { ...prev, logo: fullUrl } : prev);
//     } catch (e: any) {
//       console.error('Logo upload error:', e);
//       alert(e.response?.data?.message || "Logo update failed.");
//     }
//    };

//   const handleUpdateSocials = async (links: Record<string, string>) => {
//     if (!isCPH || !college?.id) return;
//     try {
//       await CollegeService.updateSocialMedia(college.id, links);
//       refreshCollege(); // Reload to get updated audit
//     } catch (e: any) {
//       alert(e.response?.data?.message || "Social media update failed.");
//     }
//   };

//   // const handleSaveSection = async (data: { title: string; content: string; image?: string }) => {
//   //   if (!isCPH || !college?.id) return;
//   //   try {
//   //     if (isAddingSection) {
//   //       if (!canAddMore) return alert("Maximum 7 sections allowed.");
//   //       await CollegeService.addAboutSection(college.id, data);
//   //     } else if (editingSectionId) {
//   //       await CollegeService.updateAboutSection(college.id, editingSectionId, data);
//   //     }
//   //     refreshCollege();
//   //     setEditingSectionId(null);
//   //     setIsAddingSection(false);
//   //   } catch (e: any) {
//   //     alert(e.response?.data?.message || "Failed to save section.");
//   //   }
//   // };

//   const handleSaveSection = async (data: { title: string; content: string; imageUrl?: string }) => {  // Changed to imageUrl
//   if (!isCPH || !college?.id) return;
//   try {
//     console.log('Saving section with data:', data); // Debug: check imageUrl present
//     if (isAddingSection) {
//       if (!canAddMore) return alert("Maximum 7 sections allowed.");
//       await CollegeService.addAboutSection(college.id, data);
//     } else if (editingSectionId) {
//       await CollegeService.updateAboutSection(college.id, editingSectionId, data);
//     }
//     refreshCollege();
//     setEditingSectionId(null);
//     setIsAddingSection(false);
//   } catch (e: any) {
//     console.error('Save section error:', e);
//     alert(e.response?.data?.message || "Failed to save section.");
//   }
// };

//   const confirmDeleteSection = async () => {
//     if (!isCPH || !deleteSectionId || !college?.id) return;
//     try {
//       await CollegeService.deleteAboutSection(college.id, deleteSectionId);
//       refreshCollege();
//       setDeleteSectionId(null);
//     } catch (e: any) {
//       alert(e.response?.data?.message || "Failed to delete section.");
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-96">
//         <Loader2 className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   if (error || !college) {
//     return (
//       <div className="flex flex-col justify-center items-center h-96 text-red-600">
//         <AlertCircle size={48} className="mb-4" />
//         <p className="text-center font-bold">{error || 'College not found'}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 pb-20 px-4 md:px-0">
//       <CollegeHero
//         college={college}
//         isEditor={isCPH}
//         onLogoUpload={handleLogoUpload}
//         onUpdateSocials={handleUpdateSocials}
//       />

//       {isCPH && (
//         <div className="bg-white border-2 border-blue-600/20 px-6 py-4 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-xl shadow-blue-50 gap-4">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
//               <ShieldCheck size={24} />
//             </div>
//             <div>
//               <p className="text-gray-900 font-black text-sm uppercase tracking-tight leading-none mb-1">Campus Narrative CMS</p>
//               <p className="text-blue-600 text-[10px] uppercase font-black tracking-widest">Authorized Head: {user.fullName}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-8">
//             <div className="text-right">
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Layout Usage</p>
//               <p className={`text-sm font-black ${sections.length >= 7 ? 'text-red-600' : 'text-blue-600'}`}>
//                 {sections.length} / 7 Sections
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex justify-between items-end border-b-2 border-gray-100 pb-6">
//         <div>
//           <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
//             Campus Narrative {isCPH && <Sparkles className="text-amber-400" size={24} />}
//           </h2>
//           <p className="text-sm text-gray-500 font-medium">Institutional vision, recruitment history, and infrastructure highlights.</p>
//         </div>
//         {isCPH && !isAddingSection && (
//           <button
//             onClick={() => { setIsAddingSection(true); setEditingSectionId(null); }}
//             disabled={!canAddMore}
//             className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 text-xs shadow-xl ${canAddMore ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
//           >
//             <Plus size={18}/> {canAddMore ? 'Add New Section' : 'Limit Reached'}
//           </button>
//         )}
//       </div>

//       <div className="space-y-16">
//         {isAddingSection && (
//           <AboutSectionForm
//             onSave={handleSaveSection}
//             onCancel={() => setIsAddingSection(false)}
//             saveLabel="Publish Section"
//             isAdding={true}
//             collegeCode={college.code}
//           />
//         )}

//         <div className="grid grid-cols-1 gap-16">
//           {sections.map(section => (
//             <div key={section.id}>
//               {editingSectionId === section.id ? (
//                 <AboutSectionForm
//                   initialData={section}
//                   onSave={handleSaveSection}
//                   onCancel={() => setEditingSectionId(null)}
//                   saveLabel="Update Content"
//                   collegeCode={college.code}
//                 />
//               ) : (
//                 <AboutSectionItem
//                   section={section}
//                   isEditor={isCPH}
//                   onEdit={() => { setEditingSectionId(section.id); setIsAddingSection(false); }}
//                   onDelete={() => setDeleteSectionId(section.id)}
//                 />
//               )}
//             </div>
//           ))}
//         </div>

//         {sections.length === 0 && !isAddingSection && (
//           <div className="text-center py-32 text-gray-400 bg-white rounded-[3rem] border-4 border-dashed border-gray-50 shadow-inner">
//             <Building size={80} className="mx-auto mb-6 opacity-10"/>
//             <p className="text-2xl font-bold text-gray-300">The profile content is currently unpublished.</p>
//             {isCPH && (
//               <div className="mt-8 max-w-sm mx-auto">
//                 <button onClick={() => setIsAddingSection(true)} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all active:scale-95">Craft Your First Section</button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <DeleteConfirmationModal
//         isOpen={!!deleteSectionId}
//         onClose={() => setDeleteSectionId(null)}
//         onConfirm={confirmDeleteSection}
//         title="Delete Narrative Section?"
//         message="This section and its associated imagery will be permanently removed from the public campus profile."
//       />
//     </div>
//   );
// };

// src/components/colleges/shared/about-college/AboutCollegeComponent.tsx
import React, { useState, useEffect } from 'react';
import { User, College, Role, CollegeAboutSection } from '../../../types';
import { CollegeService } from '../../../services/collegeService';
import { Plus, Building, Loader2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { DeleteConfirmationModal } from '../../common/DeleteConfirmationModal';

// Sub-Components
import { CollegeHero } from './about-college/CollegeHero';
import { AboutSectionItem } from './about-college/AboutSectionItem';
import { AboutSectionForm } from './about-college/AboutSectionForm';

interface AboutCollegeComponentProps {
  user: User;
}

export const AboutCollegeComponent: React.FC<AboutCollegeComponentProps> = ({ user }) => {
  const [college, setCollege] = useState<College | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCPH = user.role === Role.CPH;

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);

  useEffect(() => {
    refreshCollege();
  }, [user.collegeId]);

  const refreshCollege = async () => {
    setIsLoading(true);
    setError(null);
    if (user.collegeId) {
      try {
        const col = await CollegeService.getCollegeById(user.collegeId);
        setCollege(col);
      } catch (e: any) {
        console.error("Failed to load college profile", e);
        setError(e.response?.data?.message || 'Failed to load college profile.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('No college associated with your account.');
      setIsLoading(false);
    }
  };

  const sections = college?.aboutSections || [];
  const canAddMore = sections.length < 7;

  const handleLogoUpload = async (file: File) => {
    if (!isCPH || !college?.id || !college?.code) return;
    try {
      const newUrl = await CollegeService.updateCollegeLogo(college.id, file);
      setCollege(prev => prev ? { ...prev, logo: newUrl } : prev);
    } catch (e: any) {
      alert(e.response?.data?.message || "Logo update failed.");
    }
  };

  const handleUpdateSocials = async (links: Record<string, string>) => {
    if (!isCPH || !college?.id) return;
    try {
      await CollegeService.updateSocialMedia(college.id, links);
      refreshCollege(); // Reload to get updated audit
    } catch (e: any) {
      alert(e.response?.data?.message || "Social media update failed.");
    }
  };

  const handleSaveSection = async (data: { title: string; content: string; imageUrl?: string }) => {
    if (!isCPH || !college?.id) return;
    try {
      console.log('Saving section with data:', data); // Debug: check imageUrl present
      if (isAddingSection) {
        if (!canAddMore) return alert("Maximum 7 sections allowed.");
        await CollegeService.addAboutSection(college.id, data);
      } else if (editingSectionId) {
        await CollegeService.updateAboutSection(college.id, editingSectionId, data);
      }
      refreshCollege();
      setEditingSectionId(null);
      setIsAddingSection(false);
    } catch (e: any) {
      console.error('Save section error:', e);
      alert(e.response?.data?.message || "Failed to save section.");
    }
  };

  const confirmDeleteSection = async () => {
    if (!isCPH || !deleteSectionId || !college?.id) return;
    try {
      await CollegeService.deleteAboutSection(college.id, deleteSectionId);
      refreshCollege();
      setDeleteSectionId(null);
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to delete section.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error || !college) {
    // Show static UI on error (top component with placeholder data)
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 pb-20 px-4 md:px-0">
        <CollegeHero
          college={{
            id: '',
            name: 'Your College',
            address: 'No address available',
            code: 'CODE',
            type: 'Type',
            email: '',
            phone: '',
            logo: '', // Blank logo
            socialMedia: {},
            aboutSections: [], // No sections
            studentCount: 0,
            cphCount: 0,
            activeJobs: 0
          }}
          isEditor={false} // Read-only for all on error
          onLogoUpload={() => {}}
          onUpdateSocials={() => {}}
        />
        <div className="flex flex-col justify-center items-center h-96 text-red-600">
          <AlertCircle size={48} className="mb-4" />
          <p className="text-center font-bold">{error || 'College not found'}</p>
          <p className="text-center text-gray-500 mt-2">Contact support if this persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 pb-20 px-4 md:px-0">
      <CollegeHero
        college={college}
        isEditor={isCPH} // Edit for CPH only
        onLogoUpload={handleLogoUpload}
        onUpdateSocials={handleUpdateSocials}
      />
      {isCPH && (
        <div className="bg-white border-2 border-blue-600/20 px-6 py-4 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-xl shadow-blue-50 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-gray-900 font-black text-sm uppercase tracking-tight leading-none mb-1">Campus Narrative CMS</p>
              <p className="text-blue-600 text-[10px] uppercase font-black tracking-widest">Authorized Head: {user.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Layout Usage</p>
              <p className={`text-sm font-black ${sections.length >= 7 ? 'text-red-600' : 'text-blue-600'}`}>
                {sections.length} / 7 Sections
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-end border-b-2 border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Campus Narrative {isCPH && <Sparkles className="text-amber-400" size={24} />}
          </h2>
          <p className="text-sm text-gray-500 font-medium">Institutional vision, recruitment history, and infrastructure highlights.</p>
        </div>
        {isCPH && !isAddingSection && (
          <button
            onClick={() => { setIsAddingSection(true); setEditingSectionId(null); }}
            disabled={!canAddMore}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 text-xs shadow-xl ${canAddMore ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
          >
            <Plus size={18}/> {canAddMore ? 'Add New Section' : 'Limit Reached'}
          </button>
        )}
      </div>
      <div className="space-y-16">
        {isAddingSection && (
          <AboutSectionForm
            onSave={handleSaveSection}
            onCancel={() => setIsAddingSection(false)}
            saveLabel="Publish Section"
            isAdding={true}
            collegeCode={college.code}
          />
        )}
        <div className="grid grid-cols-1 gap-16">
          {sections.map(section => (
            <div key={section.id}>
              {editingSectionId === section.id ? (
                <AboutSectionForm
                  initialData={section}
                  onSave={handleSaveSection}
                  onCancel={() => setEditingSectionId(null)}
                  saveLabel="Update Content"
                  collegeCode={college.code}
                />
              ) : (
                <AboutSectionItem
                  section={section}
                  isEditor={isCPH}
                  onEdit={() => { setEditingSectionId(section.id); setIsAddingSection(false); }}
                  onDelete={() => setDeleteSectionId(section.id)}
                />
              )}
            </div>
          ))}
        </div>
        {sections.length === 0 && !isAddingSection && (
          <div className="text-center py-32 text-gray-400 bg-white rounded-[3rem] border-4 border-dashed border-gray-50 shadow-inner">
            <Building size={80} className="mx-auto mb-6 opacity-10"/>
            <p className="text-2xl font-bold text-gray-300">The profile content is currently unpublished.</p>
            {isCPH && (
              <div className="mt-8 max-w-sm mx-auto">
                <button onClick={() => setIsAddingSection(true)} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all active:scale-95">Craft Your First Section</button>
              </div>
            )}
          </div>
        )}
      </div>
      <DeleteConfirmationModal
        isOpen={!!deleteSectionId}
        onClose={() => setDeleteSectionId(null)}
        onConfirm={confirmDeleteSection}
        title="Delete Narrative Section?"
        message="This section and its associated imagery will be permanently removed from the public campus profile."
      />
    </div>
  );
};