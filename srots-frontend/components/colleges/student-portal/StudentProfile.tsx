
// import React, { useState } from 'react';
// import { User, Student, StudentProfile as IStudentProfile } from '../../../types';
// import { StudentService } from '../../../services/studentService';
// import { 
//   User as UserIcon, GraduationCap, FileText, Briefcase, Award, CheckCircle, BookOpen, Globe, Loader2
// } from 'lucide-react';

// // Imported Tab Components
// import { ProfileTab } from './profile/ProfileTab';
// import { AcademicsTab } from './profile/AcademicsTab';
// import { ResumesTab } from './profile/ResumesTab';
// import { ExperienceTab } from './profile/ExperienceTab';
// import { SkillsTab } from './profile/SkillsTab';
// import { ProjectsTab } from './profile/ProjectsTab';
// import { CertificationsTab } from './profile/CertificationsTab';
// import { PublicationsTab } from './profile/PublicationsTab';
// import { SocialTab } from './profile/SocialTab';

// interface StudentProfileProps {
//   student: Student;
//   onUpdateUser?: (user: User) => void;
// }

// export const StudentProfile: React.FC<StudentProfileProps> = ({ student, onUpdateUser }) => {
//   const [activeTab, setActiveTab] = useState<'profile' | 'academics' | 'resumes' | 'experience' | 'skills' | 'projects' | 'certifications' | 'publications' | 'social'>('profile');
//   const [loading, setLoading] = useState(false);

//   // Wrapper to update profile general details (handled by ProfileTab)
//   const handleUpdateProfile = async (updates: Partial<IStudentProfile>) => {
//     setLoading(true);
//     try {
//         // Backend Logic: Service merges the updates and returns the fresh entity
//         // 3-Tier Sync: Use StudentService
//         const updatedStudent = await StudentService.updateStudentProfile(student.id, updates);
        
//         if (onUpdateUser) onUpdateUser(updatedStudent);
//     } catch (error) {
//         console.error("Failed to update profile", error);
//         alert("Failed to save changes. Please try again.");
//     } finally {
//         setLoading(false);
//     }
//   };

//   // Helper to refresh student data from DB after a sub-component updates it via Service
//   const refreshStudentData = (updatedStudent: Student | null) => {
//       if (updatedStudent && onUpdateUser) {
//           onUpdateUser(updatedStudent);
//       }
//   };

//   const renderTabs = () => (
//       <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 border-b border-gray-200">
//           {[
//               { id: 'profile', label: 'Profile', icon: UserIcon },
//               { id: 'academics', label: 'Academics', icon: GraduationCap },
//               { id: 'resumes', label: 'Resumes', icon: FileText },
//               { id: 'experience', label: 'Experience', icon: Briefcase },
//               { id: 'skills', label: 'Skills', icon: Award },
//               { id: 'projects', label: 'Projects', icon: FileText },
//               { id: 'certifications', label: 'Certifications', icon: CheckCircle },
//               { id: 'publications', label: 'Publications', icon: BookOpen },
//               { id: 'social', label: 'Social Media', icon: Globe },
//           ].map(tab => (
//               <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as any)}
//                   className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
//               >
//                   <tab.icon size={16} /> {tab.label}
//               </button>
//           ))}
//       </div>
//   );

//   return (
//     <div className="max-w-5xl mx-auto p-4 md:p-6 pb-20 relative">
//         {/* Loading Overlay */}
//         {loading && (
//             <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
//                 <div className="bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-xl animate-in fade-in zoom-in">
//                     <Loader2 size={16} className="animate-spin" /> Saving Changes...
//                 </div>
//             </div>
//         )}

//         {renderTabs()}
        
//         {student.profile && (
//             <>
//                 {activeTab === 'profile' && (
//                     <ProfileTab 
//                         student={student}
//                         profileData={student.profile}
//                         onUpdateProfile={handleUpdateProfile}
//                         onUpdateUser={onUpdateUser || (() => {})}
//                     />
//                 )}
                
//                 {activeTab === 'academics' && <AcademicsTab profileData={student.profile} />}
                
//                 {activeTab === 'resumes' && (
//                     <ResumesTab 
//                         studentId={student.id}
//                         resumes={student.profile.resumes || []} 
//                         onUpdate={refreshStudentData}
//                     />
//                 )}
                
//                 {activeTab === 'experience' && (
//                     <ExperienceTab 
//                         studentId={student.id}
//                         experience={student.profile.experience || []}
//                         onUpdate={refreshStudentData}
//                     />
//                 )}
                
//                 {activeTab === 'skills' && (
//                     <SkillsTab 
//                         studentId={student.id}
//                         skills={student.profile.skills || []}
//                         languages={student.profile.languages || []}
//                         onUpdate={refreshStudentData}
//                     />
//                 )}
                
//                 {activeTab === 'projects' && (
//                     <ProjectsTab 
//                         studentId={student.id}
//                         projects={student.profile.projects || []}
//                         onUpdate={refreshStudentData}
//                     />
//                 )}
                
//                 {activeTab === 'certifications' && (
//                     <CertificationsTab 
//                         studentId={student.id}
//                         certifications={student.profile.certifications || []}
//                         onUpdate={refreshStudentData}
//                     />
//                 )}
                
//                 {activeTab === 'publications' && (
//                     <PublicationsTab 
//                         studentId={student.id}
//                         publications={student.profile.publications || []}
//                         onUpdate={refreshStudentData}
//                     />
//                 )}
                
//                 {activeTab === 'social' && (
//                     <SocialTab 
//                         studentId={student.id}
//                         socialLinks={student.profile.socialLinks || []}
//                         onUpdate={refreshStudentData}
//                     />
//                 )}
//             </>
//         )}
//     </div>
//   );
// };


import React, { useState } from 'react';
import { User, Student, StudentProfile as IStudentProfile } from '../../../types';
import { StudentService } from '../../../services/studentService';
import { 
  User as UserIcon, GraduationCap, FileText, Briefcase, Award, CheckCircle, BookOpen, Globe, Loader2
} from 'lucide-react';

// Imported Tab Components
import { ProfileTab } from './profile/ProfileTab';
import { AcademicsTab } from './profile/AcademicsTab';
import { ResumesTab } from './profile/ResumesTab';
import { ExperienceTab } from './profile/ExperienceTab';
import { SkillsTab } from './profile/SkillsTab';
import { ProjectsTab } from './profile/ProjectsTab';
import { CertificationsTab } from './profile/CertificationsTab';
import { PublicationsTab } from './profile/PublicationsTab';
import { SocialTab } from './profile/SocialTab';

interface StudentProfileProps {
  student: Student;
  onUpdateUser?: (user: User) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ student, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'academics' | 'resumes' | 'experience' | 'skills' | 'projects' | 'certifications' | 'publications' | 'social'>('profile');
  const [loading, setLoading] = useState(false);

  // Wrapper to update profile general details (handled by ProfileTab)
  const handleUpdateProfile = async (updates: Partial<IStudentProfile>) => {
    setLoading(true);
    try {
        // Backend Logic: Service merges the updates and returns the fresh entity
        // 3-Tier Sync: Use StudentService
        const updatedStudent = await StudentService.updateStudentProfile(student.id, updates);
        
        if (onUpdateUser) onUpdateUser(updatedStudent);
    } catch (error) {
        console.error("Failed to update profile", error);
        alert("Failed to save changes. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  // Helper to refresh student data from DB after a sub-component updates it via Service
  const refreshStudentData = (updatedStudent: Student | null) => {
      if (updatedStudent && onUpdateUser) {
          onUpdateUser(updatedStudent);
      }
  };

  const renderTabs = () => (
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 border-b border-gray-200">
          {[
              { id: 'profile', label: 'Profile', icon: UserIcon },
              { id: 'academics', label: 'Academics', icon: GraduationCap },
              { id: 'resumes', label: 'Resumes', icon: FileText },
              { id: 'experience', label: 'Experience', icon: Briefcase },
              { id: 'skills', label: 'Skills', icon: Award },
              { id: 'projects', label: 'Projects', icon: FileText },
              { id: 'certifications', label: 'Certifications', icon: CheckCircle },
              { id: 'publications', label: 'Publications', icon: BookOpen },
              { id: 'social', label: 'Social Media', icon: Globe },
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                  <tab.icon size={16} /> {tab.label}
              </button>
          ))}
      </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-20 relative">
        {/* Loading Overlay */}
        {loading && (
            <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
                <div className="bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-xl animate-in fade-in zoom-in">
                    <Loader2 size={16} className="animate-spin" /> Saving Changes...
                </div>
            </div>
        )}

        {renderTabs()}
        
        {student.profile && (
            <>
                {activeTab === 'profile' && (
                    <ProfileTab 
                        student={student}
                        profileData={student.profile}
                        onUpdateProfile={handleUpdateProfile}
                        onUpdateUser={onUpdateUser || (() => {})}
                    />
                )}
                
                {activeTab === 'academics' && <AcademicsTab profileData={student.profile} />}
                
                {activeTab === 'resumes' && (
                    <ResumesTab 
                        studentId={student.id}
                        resumes={student.profile.resumes || []} 
                        onUpdate={refreshStudentData}
                    />
                )}
                
                {activeTab === 'experience' && (
                    <ExperienceTab 
                        studentId={student.id}
                        experience={student.profile.experience || []}
                        onUpdate={refreshStudentData}
                    />
                )}
                
                {activeTab === 'skills' && (
                    <SkillsTab 
                        studentId={student.id}
                        skills={student.profile.skills || []}
                        languages={student.profile.languages || []}
                        onUpdate={refreshStudentData}
                    />
                )}
                
                {activeTab === 'projects' && (
                    <ProjectsTab 
                        studentId={student.id}
                        projects={student.profile.projects || []}
                        onUpdate={refreshStudentData}
                    />
                )}
                
                {activeTab === 'certifications' && (
                    <CertificationsTab 
                        studentId={student.id}
                        certifications={student.profile.certifications || []}
                        onUpdate={refreshStudentData}
                    />
                )}
                
                {activeTab === 'publications' && (
                    <PublicationsTab 
                        studentId={student.id}
                        publications={student.profile.publications || []}
                        onUpdate={refreshStudentData}
                    />
                )}
                
                {activeTab === 'social' && (
                    <SocialTab 
                        studentId={student.id}
                        socialLinks={student.profile.socialLinks || []}
                        onUpdate={refreshStudentData}
                    />
                )}
            </>
        )}
    </div>
  );
};