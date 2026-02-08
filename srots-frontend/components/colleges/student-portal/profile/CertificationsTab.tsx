
// import React, { useState } from 'react';
// import { Certification, Student } from '../../../../types';
// import { Plus, Edit2, Trash2, Link as LinkIcon, CheckCircle } from 'lucide-react';
// import { Modal } from '../../../common/Modal';
// import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
// import { StudentService } from '../../../../services/studentService';

// interface CertificationsTabProps {
//     studentId: string;
//     certifications: Certification[];
//     onUpdate: (student: Student | null) => void;
// }

// export const CertificationsTab: React.FC<CertificationsTabProps> = ({ studentId, certifications, onUpdate }) => {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingItem, setEditingItem] = useState<Certification | null>(null);
//     const [deleteId, setDeleteId] = useState<string | null>(null);
    
//     const [formData, setFormData] = useState<any>({});
//     const [errors, setErrors] = useState<Record<string, boolean>>({});
//     const [generalError, setGeneralError] = useState('');

//     const openAdd = () => {
//         setEditingItem(null);
//         setFormData({ hasExpiry: false, hasScore: false });
//         setErrors({});
//         setGeneralError('');
//         setIsModalOpen(true);
//     };

//     const openEdit = (item: Certification) => {
//         setEditingItem(item);
//         let form = { ...item } as any;
//         // Try to parse existing score if structured roughly
//         if (item.score && !form.obtainedScore) {
//              // Basic fallback if not structured
//              form.obtainedScore = item.score; 
//         }
//         setFormData(form);
//         setErrors({});
//         setGeneralError('');
//         setIsModalOpen(true);
//     };

//     const handleChange = (field: string, value: any) => {
//         setFormData({ ...formData, [field]: value });
//         if (errors[field]) {
//             setErrors({ ...errors, [field]: false });
//             setGeneralError(''); // Clear general error when user types to fix
//         }
//     };

//     const handleSave = async () => {
//         const newErrors: Record<string, boolean> = {};
//         const missingFields: string[] = [];

//         if (!formData.name?.trim()) { newErrors.name = true; missingFields.push('Certification Name'); }
//         if (!formData.organizer?.trim()) { newErrors.organizer = true; missingFields.push('Organizer'); }
//         if (!formData.issueDate) { newErrors.issueDate = true; missingFields.push('Issue Date'); }
        
//         if (formData.hasExpiry && !formData.expiryDate) {
//             newErrors.expiryDate = true;
//             missingFields.push('Expiry Date');
//         }
        
//         if (formData.hasScore) {
//             if (!formData.obtainedScore) { newErrors.obtainedScore = true; missingFields.push('Obtained Score'); }
//             if (!formData.maxScore) { newErrors.maxScore = true; missingFields.push('Max Score'); }
//         }

//         if (missingFields.length > 0) {
//             setErrors(newErrors);
//             setGeneralError(`Please fill the missing fields: ${missingFields.join(', ')}`);
//             return;
//         }

//         let scoreStr = undefined;
//         if (formData.hasScore) {
//             scoreStr = `${formData.scoreType || ''} ${formData.obtainedScore || ''}/${formData.maxScore || ''}`;
//         } else if (formData.score) {
//             scoreStr = formData.score; 
//         }

//         const item: Certification = {
//             id: editingItem ? editingItem.id : '',
//             name: formData.name,
//             organizer: formData.organizer,
//             credentialUrl: formData.credentialUrl || '',
//             issueDate: formData.issueDate,
//             hasExpiry: formData.hasExpiry,
//             expiryDate: formData.hasExpiry ? formData.expiryDate : undefined,
//             hasScore: formData.hasScore,
//             score: scoreStr,
//             licenseNumber: formData.licenseNumber
//         };

//         const updatedStudent = await StudentService.updateProfileSection(studentId, 'certifications', item);
//         onUpdate(updatedStudent);
//         setIsModalOpen(false);
//     };

//     const handleDelete = async () => {
//         if (deleteId) {
//             const updatedStudent = await StudentService.updateProfileSection(studentId, 'certifications', { id: deleteId }, true);
//             onUpdate(updatedStudent);
//             setDeleteId(null);
//         }
//     };

//     return (
//         <div className="space-y-6 animate-in slide-in-from-right-2">
//             <div className="flex justify-end">
//                 <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"><Plus size={16}/> Add Certification</button>
//             </div>

//             {certifications.map((cert, idx) => (
//                 <div key={idx} className="bg-white p-6 rounded-xl border shadow-sm relative group flex justify-between items-start">
//                     <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button onClick={() => openEdit(cert)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
//                         <button onClick={() => setDeleteId(cert.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
//                     </div>
//                     <div>
//                         <h3 className="font-bold text-lg text-gray-900">{cert.name}</h3>
//                         <p className="text-sm text-gray-600">Issued by <span className="font-bold">{cert.organizer}</span></p>
//                         <p className="text-xs text-gray-500 mt-1">Issued: {cert.issueDate} {cert.hasExpiry ? `• Expires: ${cert.expiryDate}` : ''}</p>
//                         {(cert.hasScore || cert.score) && <p className="text-xs font-bold text-green-600 mt-2">Score: {cert.score}</p>}
//                         {cert.licenseNumber && <p className="text-xs text-gray-500 font-mono mt-1">License: {cert.licenseNumber}</p>}
//                     </div>
//                     {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="p-2 bg-gray-50 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"><LinkIcon size={20}/></a>}
//                 </div>
//             ))}

//             {certifications.length === 0 && (
//                 <div className="text-center py-12 text-gray-400 bg-gray-50 border-2 border-dashed rounded-xl">
//                     <CheckCircle size={40} className="mx-auto mb-2 opacity-20"/>
//                     <p>No certifications added yet.</p>
//                 </div>
//             )}

//             {/* MODAL */}
//             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Certification' : 'Add Certification'} maxWidth="max-w-lg">
//                 <div className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
//                     <div>
//                         <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Certification Name *</label>
//                         <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Organizer / Platform *</label>
//                         <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.organizer ? 'border-red-500' : 'border-gray-300'}`} value={formData.organizer || ''} onChange={e => handleChange('organizer', e.target.value)} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Credential URL</label>
//                         <input className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={formData.credentialUrl || ''} onChange={e => handleChange('credentialUrl', e.target.value)} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">License Number</label>
//                         <input className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={formData.licenseNumber || ''} onChange={e => handleChange('licenseNumber', e.target.value)} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Issue Date *</label>
//                         <input type="date" className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.issueDate ? 'border-red-500' : 'border-gray-300'}`} value={formData.issueDate || ''} onChange={e => handleChange('issueDate', e.target.value)} />
//                     </div>
                    
//                     <div className="border-t pt-2 space-y-2">
//                         <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.hasExpiry || false} onChange={e => { handleChange('hasExpiry', e.target.checked); if(!e.target.checked && errors.expiryDate) handleChange('expiryDate', undefined); }} /> <span className="text-sm font-bold text-gray-700">This certification has expiry date</span></label>
//                         {formData.hasExpiry && (
//                             <div>
//                                 <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Expiry Date *</label>
//                                 <input type="date" className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`} value={formData.expiryDate || ''} onChange={e => handleChange('expiryDate', e.target.value)} />
//                             </div>
//                         )}
//                     </div>

//                     <div className="border-t pt-2 space-y-2">
//                         <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.hasScore || false} onChange={e => { handleChange('hasScore', e.target.checked); if(!e.target.checked && (errors.obtainedScore || errors.maxScore)) { const nE = {...errors}; delete nE.obtainedScore; delete nE.maxScore; setErrors(nE); setGeneralError(''); } }} /> <span className="text-sm font-bold text-gray-700">This certification has score</span></label>
//                         {formData.hasScore && (
//                             <div className="flex gap-2">
//                                 <div className="flex-1">
//                                     <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Type</label>
//                                     <select className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.scoreType || 'Percentage'} onChange={e => handleChange('scoreType', e.target.value)}>
//                                         <option>Percentage</option>
//                                         <option>Score</option>
//                                         <option>Grade</option>
//                                         <option>Rank</option>
//                                     </select>
//                                 </div>
//                                 <div className="flex-1">
//                                     <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Obtained *</label>
//                                     <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.obtainedScore ? 'border-red-500' : 'border-gray-300'}`} value={formData.obtainedScore || ''} onChange={e => handleChange('obtainedScore', e.target.value)} />
//                                 </div>
//                                 <div className="flex-1">
//                                     <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Max Score *</label>
//                                     <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.maxScore ? 'border-red-500' : 'border-gray-300'}`} value={formData.maxScore || ''} onChange={e => handleChange('maxScore', e.target.value)} />
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {generalError && (
//                         <div className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded border border-red-100 text-center">
//                             {generalError}
//                         </div>
//                     )}

//                     <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Save Certification</button>
//                 </div>
//             </Modal>

//             <DeleteConfirmationModal
//                 isOpen={deleteId !== null}
//                 onClose={() => setDeleteId(null)}
//                 onConfirm={handleDelete}
//                 title="Delete Certification?"
//                 message="Are you sure you want to remove this certification?"
//             />
//         </div>
//     );
// };


import React, { useState } from 'react';
import { Certification, Student } from '../../../../types';
import { Plus, Edit2, Trash2, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { Modal } from '../../../common/Modal';
import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
import { StudentService } from '../../../../services/studentService';

interface CertificationsTabProps {
  studentId: string;
  certifications: Certification[];
  onUpdate: (student: Student | null) => void;
}

export const CertificationsTab: React.FC<CertificationsTabProps> = ({ studentId, certifications, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Certification | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [generalError, setGeneralError] = useState('');

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ hasExpiry: false, hasScore: false });
    setErrors({});
    setGeneralError('');
    setIsModalOpen(true);
  };

  const openEdit = (item: Certification) => {
    setEditingItem(item);
    let form = { ...item } as any;
    if (item.score && !form.obtainedScore) {
      form.obtainedScore = item.score; 
    }
    setFormData(form);
    setErrors({});
    setGeneralError('');
    setIsModalOpen(true);
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: false });
      setGeneralError(''); 
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, boolean> = {};
    const missingFields: string[] = [];

    if (!formData.name?.trim()) { newErrors.name = true; missingFields.push('Certification Name'); }
    if (!formData.organizer?.trim()) { newErrors.organizer = true; missingFields.push('Organizer'); }
    if (!formData.issueDate) { newErrors.issueDate = true; missingFields.push('Issue Date'); }
    
    if (formData.hasExpiry && !formData.expiryDate) {
      newErrors.expiryDate = true;
      missingFields.push('Expiry Date');
    }
    
    if (formData.hasScore) {
      if (!formData.obtainedScore) { newErrors.obtainedScore = true; missingFields.push('Obtained Score'); }
      if (!formData.maxScore) { newErrors.maxScore = true; missingFields.push('Max Score'); }
    }

    if (missingFields.length > 0) {
      setErrors(newErrors);
      setGeneralError(`Please fill the missing fields: ${missingFields.join(', ')}`);
      return;
    }

    let scoreStr = undefined;
    if (formData.hasScore) {
      scoreStr = `${formData.scoreType || ''} ${formData.obtainedScore || ''}/${formData.maxScore || ''}`;
    } else if (formData.score) {
      scoreStr = formData.score; 
    }

    const item: Certification = {
      id: editingItem ? editingItem.id : '',
      name: formData.name,
      organizer: formData.organizer,
      credentialUrl: formData.credentialUrl || '',
      issueDate: formData.issueDate,
      hasExpiry: formData.hasExpiry,
      expiryDate: formData.hasExpiry ? formData.expiryDate : undefined,
      hasScore: formData.hasScore,
      score: scoreStr,
      licenseNumber: formData.licenseNumber
    };

    const updatedStudent = await StudentService.manageCertification(studentId, item);
    onUpdate(updatedStudent);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      const updatedStudent = await StudentService.deleteCertification(studentId, deleteId);
      onUpdate(updatedStudent);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-2">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"><Plus size={16}/> Add Certification</button>
      </div>

      {certifications.map((cert, idx) => (
        <div key={idx} className="bg-white p-6 rounded-xl border shadow-sm relative group flex justify-between items-start">
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => openEdit(cert)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
            <button onClick={() => setDeleteId(cert.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{cert.name}</h3>
            <p className="text-sm text-gray-600">Issued by <span className="font-bold">{cert.organizer}</span></p>
            <p className="text-xs text-gray-500 mt-1">Issued: {cert.issueDate} {cert.hasExpiry ? `• Expires: ${cert.expiryDate}` : ''}</p>
            {(cert.hasScore || cert.score) && <p className="text-xs font-bold text-green-600 mt-2">Score: {cert.score}</p>}
            {cert.licenseNumber && <p className="text-xs text-gray-500 font-mono mt-1">License: {cert.licenseNumber}</p>}
          </div>
          {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="p-2 bg-gray-50 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"><LinkIcon size={20}/></a>}
        </div>
      ))}

      {certifications.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-gray-50 border-2 border-dashed rounded-xl">
          <CheckCircle size={40} className="mx-auto mb-2 opacity-20"/>
          <p>No certifications added yet.</p>
        </div>
      )}

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Certification' : 'Add Certification'} maxWidth="max-w-lg">
        <div className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Certification Name *</label>
            <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Organizer / Platform *</label>
            <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.organizer ? 'border-red-500' : 'border-gray-300'}`} value={formData.organizer || ''} onChange={e => handleChange('organizer', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Credential URL</label>
            <input className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={formData.credentialUrl || ''} onChange={e => handleChange('credentialUrl', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">License Number</label>
            <input className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={formData.licenseNumber || ''} onChange={e => handleChange('licenseNumber', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Issue Date *</label>
            <input type="date" className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.issueDate ? 'border-red-500' : 'border-gray-300'}`} value={formData.issueDate || ''} onChange={e => handleChange('issueDate', e.target.value)} />
          </div>
          
          <div className="border-t pt-2 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.hasExpiry || false} onChange={e => { handleChange('hasExpiry', e.target.checked); if(!e.target.checked && errors.expiryDate) handleChange('expiryDate', undefined); }} /> <span className="text-sm font-bold text-gray-700">This certification has expiry date</span></label>
            {formData.hasExpiry && (
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Expiry Date *</label>
                <input type="date" className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`} value={formData.expiryDate || ''} onChange={e => handleChange('expiryDate', e.target.value)} />
              </div>
            )}
          </div>

          <div className="border-t pt-2 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.hasScore || false} onChange={e => { handleChange('hasScore', e.target.checked); if(!e.target.checked && (errors.obtainedScore || errors.maxScore)) { const nE = {...errors}; delete nE.obtainedScore; delete nE.maxScore; setErrors(nE); } }} /> <span className="text-sm font-bold text-gray-700">This certification has score</span></label>
            {formData.hasScore && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Type</label>
                  <select className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.scoreType || 'Percentage'} onChange={e => handleChange('scoreType', e.target.value)}>
                    <option>Percentage</option>
                    <option>Score</option>
                    <option>Grade</option>
                    <option>Rank</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Obtained *</label>
                  <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.obtainedScore ? 'border-red-500' : 'border-gray-300'}`} value={formData.obtainedScore || ''} onChange={e => handleChange('obtainedScore', e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Max Score *</label>
                  <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.maxScore ? 'border-red-500' : 'border-gray-300'}`} value={formData.maxScore || ''} onChange={e => handleChange('maxScore', e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {generalError && (
            <div className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded border border-red-100 text-center">
              {generalError}
            </div>
          )}

          <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Save Certification</button>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Certification?"
        message="Are you sure you want to remove this certification?"
      />
    </div>
  );
};