// import React from 'react';
// import { Edit2, Trash2, Clock, UserCheck, Layout, Calendar, ShieldCheck } from 'lucide-react';
// import { CollegeAboutSection } from '../../../../types';

// /**
//  * Component Name: AboutSectionItem
//  * Directory: components/colleges/shared/about-college/AboutSectionItem.tsx
//  */

// interface AboutSectionItemProps {
//     section: CollegeAboutSection;
//     isEditor: boolean; // Strictly true only for CPH
//     onEdit: () => void;
//     onDelete: () => void;
// }

// export const AboutSectionItem: React.FC<AboutSectionItemProps> = ({ section, isEditor, onEdit, onDelete }) => {
//     return (
//         <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-gray-100 group relative hover:shadow-[0_40px_100px_-20px_rgba(37,99,235,0.08)] transition-all duration-700 flex flex-col">
//             {/* Admin Floating Controls */}
//             {isEditor && (
//                 <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 z-10">
//                     <div className="flex bg-white/95 backdrop-blur shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 rounded-3xl p-2 gap-1.5">
//                         <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-3.5 text-blue-600 hover:bg-blue-50 rounded-2xl transition-all hover:scale-105 active:scale-95" title="Modify Narrative"><Edit2 size={22}/></button>
//                         <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-3.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all hover:scale-105 active:scale-95" title="Remove Narrative"><Trash2 size={22}/></button>
//                     </div>
//                 </div>
//             )}
            
//             {/* Narrative Header */}
//             <div className="flex items-center gap-5 mb-10">
//                 <div className="p-3.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-2xl shadow-inner border border-blue-200/50">
//                     <Layout size={26}/>
//                 </div>
//                 <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter leading-none">{section.title}</h3>
//                 <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-600/20 via-blue-600/5 to-transparent rounded-full"></div>
//             </div>
            
//             {/* Main Content Layout */}
//             <div className="flex flex-col lg:flex-row gap-16 flex-1">
//                 <div className="flex-1 prose prose-slate prose-lg max-w-none text-slate-600 leading-[1.8] whitespace-pre-line font-medium text-lg md:text-xl">
//                     {section.content}
//                 </div>
//                 {section.image && (
//                     <div className="lg:w-[45%] shrink-0 relative group/img mt-6 lg:mt-0">
//                         <div className="absolute -inset-4 bg-blue-600/10 rounded-[3rem] blur-3xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-700"></div>
//                         <div className="relative z-10 overflow-hidden rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]">
//                              <img 
//                                 src={section.image} 
//                                 alt={section.title} 
//                                 className="w-full h-96 md:h-[30rem] object-cover hover:scale-110 transition-transform duration-[1.5s] ease-out block" 
//                              />
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* AUDIT SIGNATURE - STRICTLY FOR CPH ACCOUNTABILITY */}
//             {isEditor && (section.lastModifiedBy || section.lastModifiedAt) && (
//                 <div className="mt-14 pt-8 border-t border-slate-50 flex flex-wrap gap-6 items-center justify-between">
//                     <div className="flex flex-wrap gap-3">
//                         <div className="flex items-center gap-2.5 px-5 py-2.5 bg-blue-50/50 text-blue-900 rounded-2xl border border-blue-100 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
//                             <UserCheck size={16} className="text-blue-600"/>
//                             Last Modified By: <span className="text-blue-700 font-black">{section.lastModifiedBy || 'Institutional User'}</span>
//                         </div>
//                         {section.lastModifiedAt && (
//                             <div className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-50 text-slate-800 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
//                                 <Calendar size={16} className="text-slate-400"/>
//                                 Logged At: <span className="text-slate-900 font-mono">{section.lastModifiedAt}</span>
//                             </div>
//                         )}
//                     </div>
//                     <div className="hidden sm:flex items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest">
//                         <ShieldCheck size={12}/> Secure CMS Record: {section.id}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

import React, { useState } from 'react';
import { Edit2, Trash2, Clock, UserCheck, Calendar, ShieldCheck } from 'lucide-react';
import { CollegeAboutSection } from '../../../../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

interface AboutSectionItemProps {
  section: CollegeAboutSection;
  isEditor: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const AboutSectionItem: React.FC<AboutSectionItemProps> = ({ section, isEditor, onEdit, onDelete }) => {
  const [imageFailed, setImageFailed] = useState(false);

  const imageContent = () => {
    if (!section?.image) {
      return null; // No image, don't show anything
    }

    if (imageFailed) {
      return (
        <div className="w-full h-96 md:h-[30rem] bg-gray-100 flex items-center justify-center text-gray-500 text-sm rounded-lg">
          Unable to load image
        </div>
      );
    }

    let src = section.image;
    if (!src.startsWith('http')) {
      src = `${API_BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
    }

    return (
      <img
        src={src}
        alt={section.title}
        className="w-full h-96 md:h-[30rem] object-cover hover:scale-110 transition-transform duration-[1.5s] ease-out block"
        onError={() => setImageFailed(true)}
        onLoad={() => setImageFailed(false)}
      />
    );
  };

  return (
    <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-gray-100 group relative hover:shadow-[0_40px_100px_-20px_rgba(37,99,235,0.08)] transition-all duration-700 flex flex-col">
      {isEditor && (
        <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 z-10">
          <div className="flex bg-white/95 backdrop-blur shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 rounded-3xl p-2 gap-1.5">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-3.5 text-blue-600 hover:bg-blue-50 rounded-2xl transition-all hover:scale-105 active:scale-95" title="Modify Narrative">
              <Edit2 size={22} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-3.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all hover:scale-105 active:scale-95" title="Remove Narrative">
              <Trash2 size={22} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-5 mb-10">
        <div className="p-3.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-2xl shadow-inner border border-blue-200/50">
          <Calendar size={26} />
        </div>
        <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter leading-none">{section.title}</h3>
        <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-600/20 via-blue-600/5 to-transparent rounded-full"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 flex-1">
        <div className="flex-1 prose prose-slate prose-lg max-w-none text-slate-600 leading-[1.8] whitespace-pre-line font-medium text-lg md:text-xl">
          {section.content}
        </div>
        {section.image && (
          <div className="lg:w-[45%] shrink-0 relative group/img mt-6 lg:mt-0">
            <div className="absolute -inset-4 bg-blue-600/10 rounded-[3rem] blur-3xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-700"></div>
            <div className="relative z-10 overflow-hidden rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]">
              {imageContent()}
            </div>
          </div>
        )}
      </div>

      {isEditor && (section.lastModifiedBy || section.lastModifiedAt) && (
        <div className="mt-14 pt-8 border-t border-slate-50 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-blue-50/50 text-blue-900 rounded-2xl border border-blue-100 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
              <UserCheck size={16} className="text-blue-600"/>
              Last Modified By: <span className="text-blue-700 font-black">{section.lastModifiedBy || 'Institutional User'}</span>
            </div>
            {section.lastModifiedAt && (
              <div className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-50 text-slate-800 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                <Clock size={16} className="text-slate-400"/>
                Logged At: <span className="text-slate-900 font-mono">{section.lastModifiedAt}</span>
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest">
            <ShieldCheck size={12}/> Secure CMS Record: {section.id}
          </div>
        </div>
      )}
    </div>
  );
};