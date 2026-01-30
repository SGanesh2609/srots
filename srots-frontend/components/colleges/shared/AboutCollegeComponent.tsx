
import React, { useState, useEffect } from 'react';
import { User, College, Role } from '../../../types';
import { CollegeService } from '../../../services/collegeService';
import { CompanyService } from '../../../services/companyService';
import { Plus, Building, UserCheck, Clock, ShieldCheck, Sparkles } from 'lucide-react';
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
  const isEditor = user.role === Role.CPH && user.isCollegeHead;

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);

  useEffect(() => {
      refreshCollege();
  }, [user.collegeId]); 

  const refreshCollege = async () => {
      if (user.collegeId) {
          try {
              const col = await CollegeService.getCollegeById(user.collegeId);
              setCollege(col);
          } catch (e) {
              console.error("Failed to load college profile", e);
          }
      }
  };

  if (!college) return (
      <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <Building size={64} className="text-gray-200 mb-4" />
          <p className="text-lg font-medium text-gray-400">Institutional record not identified.</p>
      </div>
  );

  const handleLogoUpload = async (file: File) => {
      try {
          const newLogoUrl = await CompanyService.uploadFile(file);
          const updatedCollege = { ...college, logo: newLogoUrl };
          await CollegeService.updateCollege(updatedCollege, undefined, undefined, user.fullName);
          refreshCollege();
          alert("Institutional identity updated.");
      } catch (e) {
          alert("Update failed.");
      }
  };

  const handleUpdateSocials = async (links: any) => {
      const updatedCollege = { ...college, socialMedia: links };
      await CollegeService.updateCollege(updatedCollege, undefined, undefined, user.fullName);
      refreshCollege();
  };

  const handleSaveSection = async (data: { title: string, content: string, image: string }) => {
      let updatedSections = [...(college.aboutSections || [])];
      
      if (isAddingSection) {
          updatedSections.push({
              id: `sec_${Date.now()}`,
              title: data.title,
              content: data.content,
              image: data.image
          });
      } else if (editingSectionId) {
          updatedSections = updatedSections.map(s => 
              s.id === editingSectionId ? { ...s, ...data } : s
          );
      }

      await CollegeService.updateCollegeAbout(college.id, updatedSections, user.fullName);
      refreshCollege();
      setEditingSectionId(null);
      setIsAddingSection(false);
  };

  const confirmDeleteSection = async () => {
      if (deleteSectionId) {
          const updatedSections = college.aboutSections?.filter(s => s.id !== deleteSectionId) || [];
          await CollegeService.updateCollegeAbout(college.id, updatedSections, user.fullName);
          refreshCollege();
          setDeleteSectionId(null);
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 pb-20">
        <CollegeHero 
            college={college}
            isEditor={isEditor}
            onLogoUpload={handleLogoUpload}
            onUpdateSocials={handleUpdateSocials}
        />

        {isEditor && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-lg shadow-blue-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md text-white">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">Institutional CMS Active</p>
                        <p className="text-blue-100 text-[10px] uppercase font-black tracking-widest">Authorized Head Access</p>
                    </div>
                </div>
                {college.lastModifiedBy && (
                    <div className="flex items-center gap-4 text-white/80 text-[10px] font-bold uppercase tracking-tighter">
                        <span className="flex items-center gap-1.5"><UserCheck size={14}/> Modified by {college.lastModifiedBy}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14}/> {college.lastModifiedAt}</span>
                    </div>
                )}
            </div>
        )}

        <div className="flex justify-between items-end border-b-2 border-gray-100 pb-4">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    Campus Profile {isEditor && <Sparkles className="text-amber-400" size={24} />}
                </h2>
                <p className="text-sm text-gray-500 font-medium">Discover our vision, history, and placement achievements.</p>
            </div>
            {isEditor && !isAddingSection && (
                <button 
                    onClick={() => { setIsAddingSection(true); setEditingSectionId(null); }} 
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 text-sm"
                >
                    <Plus size={18}/> New Section
                </button>
            )}
        </div>

        <div className="space-y-12">
            {isAddingSection && (
                <AboutSectionForm 
                    onSave={handleSaveSection}
                    onCancel={() => setIsAddingSection(false)}
                    saveLabel="Publish to Profile"
                    isAdding={true}
                />
            )}

            <div className="grid grid-cols-1 gap-12">
                {college.aboutSections?.map(section => (
                    <div key={section.id} className="animate-in fade-in slide-in-from-bottom-4">
                        {editingSectionId === section.id ? (
                            <AboutSectionForm 
                                initialData={section}
                                onSave={handleSaveSection}
                                onCancel={() => setEditingSectionId(null)}
                                saveLabel="Update Section"
                            />
                        ) : (
                            <AboutSectionItem 
                                section={section}
                                isEditor={isEditor}
                                onEdit={() => { setEditingSectionId(section.id); setIsAddingSection(false); }}
                                onDelete={() => setDeleteSectionId(section.id)}
                            />
                        )}
                    </div>
                ))}
            </div>

            {(!college.aboutSections || college.aboutSections.length === 0) && !isAddingSection && (
                <div className="text-center py-24 text-gray-400 bg-white rounded-3xl border-4 border-dashed border-gray-50 shadow-inner">
                    <Building size={80} className="mx-auto mb-6 opacity-5"/>
                    <p className="text-xl font-bold text-gray-300">Your campus profile is empty.</p>
                    {isEditor && (
                        <div className="mt-4 max-w-sm mx-auto">
                            <button onClick={() => setIsAddingSection(true)} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 shadow-sm">Start Building Now</button>
                        </div>
                    )}
                </div>
            )}
        </div>

        <DeleteConfirmationModal
            isOpen={!!deleteSectionId}
            onClose={() => setDeleteSectionId(null)}
            onConfirm={confirmDeleteSection}
            title="Remove Section Permanently?"
            message="This content will be removed from the public college profile. This action is irreversible."
        />
    </div>
  );
};
