
// import React, { useState } from 'react';
// import { SocialLink, Student } from '../../../../types';
// import { Plus, Edit2, Trash2, Linkedin, Github, Globe } from 'lucide-react';
// import { Modal } from '../../../common/Modal';
// import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
// import { StudentService } from '../../../../services/studentService';

// interface SocialTabProps {
//     studentId: string;
//     socialLinks: SocialLink[];
//     onUpdate: (student: Student | null) => void;
// }

// export const SocialTab: React.FC<SocialTabProps> = ({ studentId, socialLinks, onUpdate }) => {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingItem, setEditingItem] = useState<SocialLink | null>(null);
//     const [deleteId, setDeleteId] = useState<string | null>(null);
//     const [formData, setFormData] = useState<Partial<SocialLink>>({});
//     const [errors, setErrors] = useState<Record<string, boolean>>({});
//     const [generalError, setGeneralError] = useState('');

//     const openAdd = () => {
//         setEditingItem(null);
//         setFormData({ platform: 'LinkedIn' });
//         setErrors({});
//         setGeneralError('');
//         setIsModalOpen(true);
//     };

//     const openEdit = (item: SocialLink) => {
//         setEditingItem(item);
//         setFormData({ ...item });
//         setErrors({});
//         setGeneralError('');
//         setIsModalOpen(true);
//     };

//     const handleSave = async () => {
//         const newErrors: Record<string, boolean> = {};
//         const missingFields: string[] = [];

//         if (!formData.url?.trim()) {
//             newErrors.url = true;
//             missingFields.push('Profile Link');
//         }

//         if (missingFields.length > 0) {
//             setErrors(newErrors);
//             setGeneralError(`Please fill the missing fields: ${missingFields.join(', ')}`);
//             return;
//         }

//         const item: SocialLink = {
//             id: editingItem ? editingItem.id : '',
//             platform: formData.platform || 'LinkedIn',
//             url: formData.url!
//         };

//         const updatedStudent = await StudentService.updateProfileSection(studentId, 'socialLinks', item);
//         onUpdate(updatedStudent);
//         setIsModalOpen(false);
//     };

//     const handleDelete = async () => {
//         if (deleteId) {
//             const updatedStudent = await StudentService.updateProfileSection(studentId, 'socialLinks', { id: deleteId }, true);
//             onUpdate(updatedStudent);
//             setDeleteId(null);
//         }
//     };

//     return (
//         <div className="space-y-6 animate-in slide-in-from-right-2">
//             <div className="flex justify-end">
//                 <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
//                     <Plus size={16}/> Add Link
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {socialLinks.map((link, idx) => (
//                     <div key={idx} className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between group relative">
//                         <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
//                                 {link.platform === 'LinkedIn' ? <Linkedin size={20}/> : 
//                                  link.platform === 'GitHub' ? <Github size={20}/> :
//                                  link.platform === 'Portfolio' ? <Globe size={20}/> : <Globe size={20}/>}
//                             </div>
//                             <div>
//                                 <p className="font-bold text-gray-900">{link.platform}</p>
//                                 <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate w-48 block">{link.url}</a>
//                             </div>
//                         </div>
//                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
//                             <button onClick={() => openEdit(link)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={14}/></button>
//                             <button onClick={() => setDeleteId(link.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={14}/></button>
//                         </div>
//                     </div>
//                 ))}
                
//                 {socialLinks.length === 0 && (
//                     <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 border-2 border-dashed rounded-xl">
//                         <Globe size={40} className="mx-auto mb-2 opacity-20"/>
//                         <p>No social links added yet.</p>
//                     </div>
//                 )}
//             </div>

//             {/* MODAL */}
//             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Link' : 'Add Link'}>
//                 <div className="p-6 space-y-4">
//                     <div>
//                         <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Platform Name</label>
//                         <select className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={formData.platform || 'LinkedIn'} onChange={e => setFormData({...formData, platform: e.target.value as any})}>
//                             <option>LinkedIn</option>
//                             <option>GitHub</option>
//                             <option>Portfolio</option>
//                             <option>YouTube</option>
//                             <option>Other</option>
//                         </select>
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Profile Link *</label>
//                         <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.url ? 'border-red-500' : 'border-gray-300'}`} placeholder="https://..." value={formData.url || ''} onChange={e => { setFormData({...formData, url: e.target.value}); setErrors({}); setGeneralError(''); }} />
//                     </div>
                    
//                     {generalError && (
//                         <div className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded border border-red-100 text-center">
//                             {generalError}
//                         </div>
//                     )}

//                     <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Save Link</button>
//                 </div>
//             </Modal>

//             <DeleteConfirmationModal
//                 isOpen={deleteId !== null}
//                 onClose={() => setDeleteId(null)}
//                 onConfirm={handleDelete}
//                 title="Delete Link?"
//                 message="Are you sure you want to remove this social link?"
//             />
//         </div>
//     );
// };


import React, { useState } from 'react';
import { SocialLink, Student } from '../../../../types';
import { Plus, Edit2, Trash2, Linkedin, Github, Globe } from 'lucide-react';
import { Modal } from '../../../common/Modal';
import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
import { StudentService } from '../../../../services/studentService';

interface SocialTabProps {
  studentId: string;
  socialLinks: SocialLink[];
  onUpdate: (student: Student | null) => void;
}

export const SocialTab: React.FC<SocialTabProps> = ({ studentId, socialLinks, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SocialLink | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SocialLink>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [generalError, setGeneralError] = useState('');

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ platform: 'LinkedIn' });
    setErrors({});
    setGeneralError('');
    setIsModalOpen(true);
  };

  const openEdit = (item: SocialLink) => {
    setEditingItem(item);
    setFormData({ ...item });
    setErrors({});
    setGeneralError('');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const newErrors: Record<string, boolean> = {};
    const missingFields: string[] = [];

    if (!formData.url?.trim()) {
      newErrors.url = true;
      missingFields.push('Profile Link');
    }

    if (missingFields.length > 0) {
      setErrors(newErrors);
      setGeneralError(`Please fill the missing fields: ${missingFields.join(', ')}`);
      return;
    }

    const item: SocialLink = {
      id: editingItem ? editingItem.id : '',
      platform: formData.platform || 'LinkedIn',
      url: formData.url!
    };

    const updatedStudent = await StudentService.manageSocialLink(studentId, item);
    onUpdate(updatedStudent);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      const updatedStudent = await StudentService.deleteSocialLink(studentId, deleteId);
      onUpdate(updatedStudent);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-2">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
          <Plus size={16}/> Add Link
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialLinks.map((link, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between group relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                {link.platform === 'LinkedIn' ? <Linkedin size={20}/> : 
                 link.platform === 'GitHub' ? <Github size={20}/> :
                 link.platform === 'Portfolio' ? <Globe size={20}/> : <Globe size={20}/>}
              </div>
              <div>
                <p className="font-bold text-gray-900">{link.platform}</p>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate w-48 block">{link.url}</a>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
              <button onClick={() => openEdit(link)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={14}/></button>
              <button onClick={() => setDeleteId(link.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
        
        {socialLinks.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 border-2 border-dashed rounded-xl">
            <Globe size={40} className="mx-auto mb-2 opacity-20"/>
            <p>No social links added yet.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Link' : 'Add Link'}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Platform Name</label>
            <select className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={formData.platform || 'LinkedIn'} onChange={e => setFormData({...formData, platform: e.target.value as any})}>
              <option>LinkedIn</option>
              <option>GitHub</option>
              <option>Portfolio</option>
              <option>YouTube</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Profile Link *</label>
            <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.url ? 'border-red-500' : 'border-gray-300'}`} placeholder="https://..." value={formData.url || ''} onChange={e => { setFormData({...formData, url: e.target.value}); setErrors({}); setGeneralError(''); }} />
          </div>
          
          {generalError && (
            <div className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded border border-red-100 text-center">
              {generalError}
            </div>
          )}

          <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Save Link</button>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Link?"
        message="Are you sure you want to remove this social link?"
      />
    </div>
  );
};