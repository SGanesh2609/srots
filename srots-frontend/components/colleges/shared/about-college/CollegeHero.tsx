
// import React, { useRef, useState } from 'react';
// import { College } from '../../../../types';
// import { MapPin, Camera, Edit2, Globe, Linkedin, Instagram, Twitter, Youtube, Facebook, Clock } from 'lucide-react';
// import { SocialLinksEditor } from './SocialLinksEditor';

// /**
//  * Component Name: CollegeHero
//  * Directory: components/colleges/shared/about-college/CollegeHero.tsx
//  * 
//  * Functionality:
//  * - Displays the visual header of the About College page.
//  * - Shows College Logo (with upload capability for editors).
//  * - Shows College Name and Address with high contrast.
//  * - Renders Social Media icons row using a config map.
//  * - Toggles the SocialLinksEditor modal.
//  */

// interface CollegeHeroProps {
//     college: College;
//     isEditor: boolean;
//     onLogoUpload: (file: File) => void;
//     onUpdateSocials: (links: any) => void;
// }

// const SOCIAL_MEDIA_CONFIG = [
//     { key: 'website', Icon: Globe, colorClass: 'text-blue-600 hover:text-blue-700' },
//     { key: 'linkedin', Icon: Linkedin, colorClass: 'text-blue-700 hover:text-blue-800' },
//     { key: 'instagram', Icon: Instagram, colorClass: 'text-pink-600 hover:text-pink-700' },
//     { key: 'twitter', Icon: Twitter, colorClass: 'text-sky-500 hover:text-sky-600' },
//     { key: 'youtube', Icon: Youtube, colorClass: 'text-red-600 hover:text-red-700' },
//     { key: 'facebook', Icon: Facebook, colorClass: 'text-blue-800 hover:text-blue-900' }
// ];

// export const CollegeHero: React.FC<CollegeHeroProps> = ({ college, isEditor, onLogoUpload, onUpdateSocials }) => {
//     const [isEditingSocial, setIsEditingSocial] = useState(false);
//     const logoInputRef = useRef<HTMLInputElement>(null);

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             onLogoUpload(e.target.files[0]);
//         }
//     };

//     const handleSaveSocials = (links: any) => {
//         onUpdateSocials(links);
//         setIsEditingSocial(false);
//     };

//     return (
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden relative">
//             {/* Banner Area */}
//             <div className="h-40 bg-slate-100 relative overflow-hidden">
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent)]"></div>
//                 <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
//                 <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
//                 {isEditor && (
//                     <div className="absolute top-4 right-4 bg-slate-900/10 backdrop-blur-md text-slate-800 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-slate-200 shadow-sm z-10">
//                         Institutional Branding Mode
//                     </div>
//                 )}
//             </div>
            
//             {/* Main Info Strip */}
//             <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row items-end -mt-16 gap-6 relative">
//                 {/* Logo Section */}
//                 <div className="relative group shrink-0">
//                     <div className="w-36 h-36 rounded-2xl border-4 border-white shadow-2xl bg-white overflow-hidden p-4 flex items-center justify-center">
//                         <img src={college.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
//                     </div>
//                     {isEditor && (
//                         <>
//                             <div 
//                                 className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]"
//                                 onClick={() => logoInputRef.current?.click()}
//                             >
//                                 <Camera className="text-white" size={24} />
//                             </div>
//                             <input 
//                                 type="file" 
//                                 ref={logoInputRef} 
//                                 className="hidden" 
//                                 accept="image/*" 
//                                 onChange={handleFileChange}
//                             />
//                         </>
//                     )}
//                 </div>

//                 {/* Details Section */}
//                 <div className="flex-1 mb-2 space-y-2">
//                     <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">{college.name}</h1>
//                     <div className="flex items-center gap-2 text-slate-600 font-bold">
//                         <MapPin size={18} className="text-blue-600 shrink-0"/> 
//                         <span className="text-sm md:text-base leading-tight">{college.address}</span>
//                     </div>
//                     <div className="flex gap-2 mt-4">
//                         <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-md shadow-sm tracking-widest">{college.code}</span>
//                         <span className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase px-3 py-1 rounded-md border border-slate-200 tracking-widest">{college.type}</span>
//                     </div>
//                 </div>
                
//                 {/* Social Links Section */}
//                 <div className="mb-2 flex flex-col items-end gap-2 relative group/social">
//                     <div className="flex gap-2">
//                         {SOCIAL_MEDIA_CONFIG.map(({ key, Icon, colorClass }) => {
//                             // @ts-ignore
//                             const url = college.socialMedia?.[key];
//                             if (!url) return null;
//                             return (
//                                 <a 
//                                     key={key} 
//                                     href={url} 
//                                     target="_blank" 
//                                     rel="noreferrer"
//                                     className={`p-2.5 bg-white border border-slate-100 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 ${colorClass} shadow-sm`}
//                                 >
//                                     <Icon size={20}/>
//                                 </a>
//                             );
//                         })}
                        
//                         {isEditor && (
//                             <button 
//                                 onClick={() => setIsEditingSocial(true)} 
//                                 className="p-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white hover:border-blue-200 transition-all shadow-sm"
//                                 title="Manage Social Channels"
//                             >
//                                 <Edit2 size={20}/>
//                             </button>
//                         )}
//                     </div>
                    
//                     {/* Granular Audit for Social Links - Restricted to CPH */}
//                     {isEditor && college.socialMedia?.lastModifiedBy && (
//                         <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-tighter opacity-0 group-hover/social:opacity-100 transition-opacity">
//                             <Clock size={10}/> Links updated by: <span className="text-blue-500">{college.socialMedia.lastModifiedBy}</span>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Fixed Editor Modal */}
//             <SocialLinksEditor 
//                 isOpen={isEditingSocial}
//                 initialLinks={college.socialMedia} 
//                 onSave={handleSaveSocials} 
//                 onCancel={() => setIsEditingSocial(false)} 
//             />
//         </div>
//     );
// };


import React, { useRef, useState } from 'react';
import { College } from '../../../../types';
import { MapPin, Camera, Edit2, Globe, Linkedin, Instagram, Twitter, Youtube, Facebook, Clock } from 'lucide-react';
import { SocialLinksEditor } from './SocialLinksEditor';

// Backend base URL - MUST match axios baseURL port (8081)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

interface CollegeHeroProps {
  college: College;
  isEditor: boolean;
  onLogoUpload: (file: File) => void;
  onUpdateSocials: (links: any) => void;
}

const SOCIAL_MEDIA_CONFIG = [
  { key: 'website', Icon: Globe, colorClass: 'text-blue-600 hover:text-blue-700' },
  { key: 'linkedin', Icon: Linkedin, colorClass: 'text-blue-700 hover:text-blue-800' },
  { key: 'instagram', Icon: Instagram, colorClass: 'text-pink-600 hover:text-pink-700' },
  { key: 'twitter', Icon: Twitter, colorClass: 'text-sky-500 hover:text-sky-600' },
  { key: 'youtube', Icon: Youtube, colorClass: 'text-red-600 hover:text-red-700' },
  { key: 'facebook', Icon: Facebook, colorClass: 'text-blue-800 hover:text-blue-900' }
];

export const CollegeHero: React.FC<CollegeHeroProps> = ({ college, isEditor, onLogoUpload, onUpdateSocials }) => {
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onLogoUpload(e.target.files[0]);
    }
  };

  const handleSaveSocials = (links: any) => {
    onUpdateSocials(links);
    setIsEditingSocial(false);
  };

  const logoContent = () => {
    if (!college?.logo) {
      return <div className="text-gray-400 text-sm font-medium flex items-center justify-center h-full">No logo uploaded</div>;
    }

    if (logoFailed) {
      return <div className="text-red-500 text-sm font-medium flex items-center justify-center h-full">Logo failed to load</div>;
    }

    let src = college.logo;
    if (!src.startsWith('http')) {
      src = `${API_BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
    }

    return (
      <img
        src={src}
        alt={`${college.name || 'College'} Logo`}
        className="max-w-full max-h-full object-contain"
        onError={() => setLogoFailed(true)}
        onLoad={() => setLogoFailed(false)}
      />
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden relative">
      <div className="h-40 bg-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent)]"></div>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
        {isEditor && (
          <div className="absolute top-4 right-4 bg-slate-900/10 backdrop-blur-md text-slate-800 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-slate-200 shadow-sm z-10">
            Institutional Branding Mode
          </div>
        )}
      </div>

      <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row items-end -mt-16 gap-6 relative">
        <div className="relative group shrink-0">
          <div className="w-36 h-36 rounded-2xl border-4 border-white shadow-2xl bg-white overflow-hidden p-4 flex items-center justify-center">
            {logoContent()}
          </div>

          {isEditor && (
            <>
              <div
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]"
                onClick={() => logoInputRef.current?.click()}
              >
                <Camera className="text-white" size={24} />
              </div>
              <input
                type="file"
                ref={logoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        <div className="flex-1 mb-2 space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
            {college?.name || 'College Name'}
          </h1>
          <div className="flex items-center gap-2 text-slate-600 font-bold">
            <MapPin size={18} className="text-blue-600 shrink-0" />
            <span className="text-sm md:text-base leading-tight">{college?.address || 'No address'}</span>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-md shadow-sm tracking-widest">
              {college?.code || 'CODE'}
            </span>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase px-3 py-1 rounded-md border border-slate-200 tracking-widest">
              {college?.type || 'Type'}
            </span>
          </div>
        </div>

        <div className="mb-2 flex flex-col items-end gap-2 relative group/social">
          <div className="flex gap-2">
            {SOCIAL_MEDIA_CONFIG.map(({ key, Icon, colorClass }) => {
              const url = college?.socialMedia?.[key];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-2.5 bg-white border border-slate-100 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 ${colorClass} shadow-sm`}
                >
                  <Icon size={20} />
                </a>
              );
            })}
            {isEditor && (
              <button
                onClick={() => setIsEditingSocial(true)}
                className="p-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white hover:border-blue-200 transition-all shadow-sm"
                title="Manage Social Channels"
              >
                <Edit2 size={20} />
              </button>
            )}
          </div>

          {isEditor && college?.socialMedia?.lastModifiedBy && (
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-tighter opacity-0 group-hover/social:opacity-100 transition-opacity">
              <Clock size={10} /> Links updated by: <span className="text-blue-500">{college.socialMedia.lastModifiedBy}</span>
            </div>
          )}
        </div>
      </div>

      <SocialLinksEditor
        isOpen={isEditingSocial}
        initialLinks={college?.socialMedia}
        onSave={handleSaveSocials}
        onCancel={() => setIsEditingSocial(false)}
      />
    </div>
  );
};