
// import React, { useState } from 'react';
// import { WorkExperience, Student } from '../../../../types';
// import { Plus, Edit2, Trash2, Calendar, Briefcase } from 'lucide-react';
// import { Modal } from '../../../common/Modal';
// import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
// import { StudentService } from '../../../../services/studentService';

// interface ExperienceTabProps {
//     studentId: string;
//     experience: WorkExperience[];
//     onUpdate: (student: Student | null) => void;
// }

// export const ExperienceTab: React.FC<ExperienceTabProps> = ({ studentId, experience, onUpdate }) => {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingItem, setEditingItem] = useState<WorkExperience | null>(null);
//     const [deleteId, setDeleteId] = useState<string | null>(null);
    
//     const [formData, setFormData] = useState<Partial<WorkExperience>>({});
//     const [errors, setErrors] = useState<Record<string, boolean>>({});
//     const [generalError, setGeneralError] = useState('');

//     const openAdd = () => {
//         setEditingItem(null);
//         setFormData({ isCurrent: false });
//         setErrors({});
//         setGeneralError('');
//         setIsModalOpen(true);
//     };

//     const openEdit = (item: WorkExperience) => {
//         setEditingItem(item);
//         setFormData({ ...item });
//         setErrors({});
//         setGeneralError('');
//         setIsModalOpen(true);
//     };

//     const handleSave = async () => {
//         const newErrors: Record<string, boolean> = {};
//         const missingFields: string[] = [];
        
//         if (!formData.title?.trim()) { newErrors.title = true; missingFields.push('Job Title'); }
//         if (!formData.company?.trim()) { newErrors.company = true; missingFields.push('Company Name'); }
//         if (!formData.location?.trim()) { newErrors.location = true; missingFields.push('Location'); }
//         if (!formData.startDate) { newErrors.startDate = true; missingFields.push('Start Date'); }
//         if (!formData.isCurrent && !formData.endDate) { newErrors.endDate = true; missingFields.push('End Date'); }

//         if (missingFields.length > 0) {
//             setErrors(newErrors);
//             setGeneralError(`Please fill the missing fields: ${missingFields.join(', ')}`);
//             return;
//         }

//         const item: WorkExperience = {
//             id: editingItem ? editingItem.id : '', // Let backend generate if empty
//             title: formData.title!,
//             company: formData.company!,
//             location: formData.location!,
//             type: formData.type || 'Full-Time',
//             startDate: formData.startDate!,
//             endDate: formData.isCurrent ? '' : formData.endDate!,
//             isCurrent: formData.isCurrent || false,
//             salaryRange: formData.salaryRange
//         };

//         const updatedStudent = await StudentService.updateProfileSection(studentId, 'experience', item);
//         onUpdate(updatedStudent);
//         setIsModalOpen(false);
//     };

//     const handleDelete = async () => {
//         if (deleteId) {
//             const updatedStudent = await StudentService.updateProfileSection(studentId, 'experience', { id: deleteId }, true);
//             onUpdate(updatedStudent);
//             setDeleteId(null);
//         }
//     };

//     const handleChange = (field: string, value: any) => {
//         setFormData({ ...formData, [field]: value });
//         if (errors[field]) {
//             setErrors({ ...errors, [field]: false });
//             setGeneralError('');
//         }
//     };

//     return (
//         <div className="space-y-6 animate-in slide-in-from-right-2">
//             <div className="flex justify-end">
//                 <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
//                     <Plus size={16}/> Add Experience
//                 </button>
//             </div>

//             {experience.map((exp, idx) => (
//                 <div key={idx} className="bg-white p-6 rounded-xl border shadow-sm relative group">
//                     <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button onClick={() => openEdit(exp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
//                         <button onClick={() => setDeleteId(exp.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
//                     </div>
//                     <h3 className="font-bold text-lg text-gray-900">{exp.title}</h3>
//                     <p className="text-blue-600 font-medium">{exp.company}</p>
//                     <p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><Calendar size={14}/> {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</p>
//                     <p className="text-sm text-gray-500 mt-1">{exp.location} • {exp.type}</p>
//                 </div>
//             ))}

//             {experience.length === 0 && (
//                 <div className="text-center py-12 text-gray-400 bg-gray-50 border-2 border-dashed rounded-xl">
//                     <Briefcase size={40} className="mx-auto mb-2 opacity-20"/>
//                     <p>No work experience added yet.</p>
//                 </div>
//             )}

//             {/* MODAL */}
//             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Experience' : 'Add Experience'}>
//                 <div className="p-6 space-y-4">
//                     <div>
//                         <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.title ? 'border-red-500' : 'border-gray-300'}`} placeholder="Job Title *" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} />
//                     </div>
                    
//                     <div>
//                         <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.company ? 'border-red-500' : 'border-gray-300'}`} placeholder="Company Name *" value={formData.company || ''} onChange={e => handleChange('company', e.target.value)} />
//                     </div>

//                     <div>
//                         <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.location ? 'border-red-500' : 'border-gray-300'}`} placeholder="Location *" value={formData.location || ''} onChange={e => handleChange('location', e.target.value)} />
//                     </div>

//                     <select className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={formData.type || 'Full-Time'} onChange={e => handleChange('type', e.target.value)}>
//                         <option>Full-Time</option><option>Part-Time</option><option>Internship</option>
//                     </select>
                    
//                     <div className="grid grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Start Date *</label>
//                             <input type="date" className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`} value={formData.startDate || ''} onChange={e => handleChange('startDate', e.target.value)} />
//                         </div>
//                         <div>
//                             <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">End Date *</label>
//                             <input type="date" className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`} disabled={formData.isCurrent} value={formData.endDate || ''} onChange={e => handleChange('endDate', e.target.value)} />
//                         </div>
//                     </div>
//                     <label className="flex items-center gap-2 text-gray-700 font-bold text-sm">
//                         <input type="checkbox" checked={formData.isCurrent || false} onChange={e => { handleChange('isCurrent', e.target.checked); if(e.target.checked && errors.endDate) { const newErrs = {...errors}; delete newErrs.endDate; setErrors(newErrs); setGeneralError(''); } }} /> 
//                         Currently Working
//                     </label>
                    
//                     {generalError && (
//                         <div className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded border border-red-100 text-center">
//                             {generalError}
//                         </div>
//                     )}

//                     <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Save Experience</button>
//                 </div>
//             </Modal>

//             <DeleteConfirmationModal
//                 isOpen={deleteId !== null}
//                 onClose={() => setDeleteId(null)}
//                 onConfirm={handleDelete}
//                 title="Delete Experience?"
//                 message="Are you sure you want to remove this work experience?"
//             />
//         </div>
//     );
// };


import React, { useState } from 'react';
import { WorkExperience, Student } from '../../../../types';
import { Plus, Edit2, Trash2, Calendar, Briefcase } from 'lucide-react';
import { Modal } from '../../../common/Modal';
import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
import { StudentService } from '../../../../services/studentService';

interface ExperienceTabProps {
  studentId: string;
  experience: WorkExperience[];
  onUpdate: (student: Student | null) => void;
}

export const ExperienceTab: React.FC<ExperienceTabProps> = ({ studentId, experience, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkExperience | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<WorkExperience>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [generalError, setGeneralError] = useState('');

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ isCurrent: false });
    setErrors({});
    setGeneralError('');
    setIsModalOpen(true);
  };

  const openEdit = (item: WorkExperience) => {
    setEditingItem(item);
    setFormData({ ...item });
    setErrors({});
    setGeneralError('');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const newErrors: Record<string, boolean> = {};
    const missingFields: string[] = [];
    
    if (!formData.title?.trim()) { newErrors.title = true; missingFields.push('Job Title'); }
    if (!formData.company?.trim()) { newErrors.company = true; missingFields.push('Company Name'); }
    if (!formData.location?.trim()) { newErrors.location = true; missingFields.push('Location'); }
    if (!formData.startDate) { newErrors.startDate = true; missingFields.push('Start Date'); }
    if (!formData.isCurrent && !formData.endDate) { newErrors.endDate = true; missingFields.push('End Date'); }

    if (missingFields.length > 0) {
      setErrors(newErrors);
      setGeneralError(`Please fill the missing fields: ${missingFields.join(', ')}`);
      return;
    }

    const item: WorkExperience = {
      id: editingItem ? editingItem.id : '',
      title: formData.title!,
      company: formData.company!,
      location: formData.location!,
      type: formData.type || 'Full-Time',
      startDate: formData.startDate!,
      endDate: formData.isCurrent ? '' : formData.endDate!,
      isCurrent: formData.isCurrent || false,
      salaryRange: formData.salaryRange
    };

    const updatedStudent = await StudentService.manageExperience(studentId, item);
    onUpdate(updatedStudent);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      const updatedStudent = await StudentService.deleteExperience(studentId, deleteId);
      onUpdate(updatedStudent);
      setDeleteId(null);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: false });
      setGeneralError('');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-2">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"><Plus size={16}/> Add Experience</button>
      </div>

      {experience.map((exp, idx) => (
        <div key={idx} className="bg-white p-6 rounded-xl border shadow-sm relative group">
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => openEdit(exp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
            <button onClick={() => setDeleteId(exp.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
          </div>
          <h3 className="font-bold text-lg text-gray-900">{exp.title}</h3>
          <p className="text-blue-600 font-medium">{exp.company}</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><Calendar size={14}/> {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</p>
          <p className="text-sm text-gray-500 mt-1">{exp.location} • {exp.type}</p>
        </div>
      ))}

      {experience.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-gray-50 border-2 border-dashed rounded-xl">
          <Briefcase size={40} className="mx-auto mb-2 opacity-20"/>
          <p>No work experience added yet.</p>
        </div>
      )}

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Experience' : 'Add Experience'}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Job Title *</label>
            <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.title ? 'border-red-500' : 'border-gray-300'}`} value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Company Name *</label>
            <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.company ? 'border-red-500' : 'border-gray-300'}`} value={formData.company || ''} onChange={e => handleChange('company', e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Location *</label>
            <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.location ? 'border-red-500' : 'border-gray-300'}`} value={formData.location || ''} onChange={e => handleChange('location', e.target.value)} />
          </div>

          <select className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={formData.type || 'Full-Time'} onChange={e => handleChange('type', e.target.value)}>
            <option>Full-Time</option>
            <option>Part-Time</option>
            <option>Internship</option>
          </select>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Start Date *</label>
              <input type="date" className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`} value={formData.startDate || ''} onChange={e => handleChange('startDate', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">End Date *</label>
              <input type="date" className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`} disabled={formData.isCurrent} value={formData.endDate || ''} onChange={e => handleChange('endDate', e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-gray-700 font-bold text-sm">
            <input type="checkbox" checked={formData.isCurrent || false} onChange={e => { handleChange('isCurrent', e.target.checked); if(e.target.checked && errors.endDate) { const newErrs = {...errors}; delete newErrs.endDate; setErrors(newErrs); setGeneralError(''); } }} /> 
            Currently Working
          </label>
          
          {generalError && (
            <div className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded border border-red-100 text-center">
              {generalError}
            </div>
          )}

          <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Save Experience</button>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Experience?"
        message="Are you sure you want to remove this work experience?"
      />
    </div>
  );
};