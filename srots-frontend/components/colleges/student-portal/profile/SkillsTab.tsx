
import React, { useState } from 'react';
import { Skill, Language, Student } from '../../../../types';
import { Plus, X, Award } from 'lucide-react';
import { Modal } from '../../../common/Modal';
import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
import { ProficiencySelector } from '../../../common/ProficiencySelector';
import { StudentService } from '../../../../services/studentService';

interface SkillsTabProps {
    studentId: string;
    skills: Skill[];
    languages: Language[];
    onUpdate: (student: Student | null) => void;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({ studentId, skills, languages, onUpdate }) => {
    const [modalType, setModalType] = useState<'skill' | 'language' | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [generalError, setGeneralError] = useState('');
    
    const [deleteInfo, setDeleteInfo] = useState<{ type: 'skill' | 'language', id: string } | null>(null);

    const openAdd = (type: 'skill' | 'language') => {
        setModalType(type);
        setEditingItem(null);
        setFormData({ proficiencyLevel: 1 });
        setErrors({});
        setGeneralError('');
    };

    const openEdit = (type: 'skill' | 'language', item: any) => {
        setModalType(type);
        setEditingItem(item);
        setErrors({});
        setGeneralError('');
        
        // Backend maps Enums to Numbers for UI, or UI calculates for display
        // Since DB stores String, we reverse map it here for the UI slider.
        // The SAVE operation will send the number back to Backend.
        let level = 1;
        if (type === 'skill') {
            const levels = ['Fundamental', 'Beginner', 'Intermediate', 'Advanced', 'Professional'];
            level = levels.indexOf(item.proficiency) + 1;
        } else {
            const levels = ['Fundamental', 'Elementary', 'Limited', 'Professional', 'Native'];
            level = levels.indexOf(item.proficiency) + 1;
        }
        setFormData({ ...item, proficiencyLevel: level });
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) {
            setErrors({ name: true });
            setGeneralError(`Please fill the missing fields: ${modalType === 'skill' ? 'Skill Name' : 'Language Name'}`);
            return;
        }

        let updatedStudent;
        
        // 3-Tier Sync: Delegate Logic to Backend specific handlers
        // Frontend sends raw form data (Name + Level Number)
        // Backend handles Mapping (Number -> Enum) and ID Generation
        
        if (modalType === 'skill') {
            updatedStudent = await StudentService.manageSkill(studentId, {
                id: editingItem ? editingItem.id : undefined,
                name: formData.name,
                proficiencyLevel: formData.proficiencyLevel || 1
            });
        } else {
            updatedStudent = await StudentService.manageLanguage(studentId, {
                id: editingItem ? editingItem.id : undefined,
                name: formData.name,
                proficiencyLevel: formData.proficiencyLevel || 1
            });
        }
        
        onUpdate(updatedStudent);
        setModalType(null);
    };

    const handleDelete = async () => {
        if (deleteInfo) {
            let updatedStudent;
            // Use specific delete handlers via the same Manage methods (passing isDelete=true)
            if (deleteInfo.type === 'skill') {
                updatedStudent = await StudentService.manageSkill(studentId, { id: deleteInfo.id } as any, true);
            } else {
                updatedStudent = await StudentService.manageLanguage(studentId, { id: deleteInfo.id } as any, true);
            }
            onUpdate(updatedStudent);
            setDeleteInfo(null);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-2">
            <div className="flex justify-end gap-2">
                <button onClick={() => openAdd('skill')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"><Plus size={16}/> Add Skill</button>
                <button onClick={() => openAdd('language')} className="flex items-center gap-2 px-4 py-2 bg-white border text-gray-700 rounded-lg font-bold hover:bg-gray-50"><Plus size={16}/> Add Language</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills List */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2"><Award size={18} className="text-blue-600"/> Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                            <div key={idx} className="bg-gray-50 px-3 py-1.5 rounded-lg border flex items-center gap-2 group cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => openEdit('skill', skill)}>
                                <div>
                                    <span className="font-bold text-gray-900 block text-sm">{skill.name}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">{skill.proficiency}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteInfo({type: 'skill', id: skill.id}); }} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={14}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Languages List */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                        {languages.map((lang, idx) => (
                            <div key={idx} className="bg-gray-50 px-3 py-1.5 rounded-lg border flex items-center gap-2 group cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => openEdit('language', lang)}>
                                <div>
                                    <span className="font-bold text-gray-900 block text-sm">{lang.name}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">{lang.proficiency}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteInfo({type: 'language', id: lang.id}); }} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={14}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            <Modal isOpen={!!modalType} onClose={() => setModalType(null)} title={`${editingItem ? 'Edit' : 'Add'} ${modalType === 'skill' ? 'Skill' : 'Language'}`}>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name *</label>
                        <input className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder={modalType === 'skill' ? 'e.g. React, Python' : 'e.g. English, Telugu'} value={formData.name || ''} onChange={e => { setFormData({...formData, name: e.target.value}); setErrors({}); setGeneralError(''); }} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Proficiency (1-5)</label>
                        <ProficiencySelector 
                            current={formData.proficiencyLevel || 1} 
                            onChange={(val) => setFormData({...formData, proficiencyLevel: val})}
                            labels={modalType === 'skill' ? ['Fundamental', 'Beginner', 'Intermediate', 'Advanced', 'Professional'] : ['Fundamental', 'Elementary', 'Limited', 'Professional', 'Native']}
                        />
                    </div>
                    
                    {generalError && (
                        <div className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded border border-red-100 text-center">
                            {generalError}
                        </div>
                    )}

                    <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Save</button>
                </div>
            </Modal>

            <DeleteConfirmationModal
                isOpen={!!deleteInfo}
                onClose={() => setDeleteInfo(null)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to remove this ${deleteInfo?.type}?`}
            />
        </div>
    );
};
