import React, { useState } from 'react';
import { Publication, Student } from '../../../../types';
import { Plus, Edit2, Trash2, BookOpen, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { Modal } from '../../../common/Modal';
import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
import { StudentService } from '../../../../services/studentService';

/**
 * PublicationsTab
 * Path: components/colleges/student-portal/profile/PublicationsTab.tsx
 *
 * ─── FIXES ───────────────────────────────────────────────────────────────────
 * MAX_PUBLICATIONS = 4 enforced:
 *   - Add button disabled when limit reached
 *   - Warning banner when at limit
 *   - handleSave() guards against API call if adding beyond limit
 *   - Badge shows X/4
 */

const MAX_PUBLICATIONS = 4;

interface PublicationsTabProps {
    studentId: string;
    publications: Publication[];
    onUpdate: (student: Student | null) => void;
}

export const PublicationsTab: React.FC<PublicationsTabProps> = ({ studentId, publications, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Publication | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Publication>>({});
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [generalError, setGeneralError] = useState('');
    const [saving, setSaving] = useState(false);

    const atLimit  = publications.length >= MAX_PUBLICATIONS;
    const isEditing = editingItem !== null;

    const openAdd = () => {
        if (atLimit) return;
        setEditingItem(null);
        setFormData({});
        setErrors({});
        setGeneralError('');
        setIsModalOpen(true);
    };

    const openEdit = (item: Publication) => {
        setEditingItem(item);
        setFormData({ ...item });
        setErrors({});
        setGeneralError('');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!isEditing && atLimit) {
            setGeneralError(
                `You can only add up to ${MAX_PUBLICATIONS} publications. Please delete an existing one first.`
            );
            return;
        }

        const newErrors: Record<string, boolean> = {};
        const missingFields: string[] = [];

        if (!formData.title?.trim())     { newErrors.title = true;     missingFields.push('Title'); }
        if (!formData.publisher?.trim()) { newErrors.publisher = true; missingFields.push('Publisher'); }
        if (!formData.publishDate)       { newErrors.publishDate = true; missingFields.push('Publish Date'); }

        if (missingFields.length > 0) {
            setErrors(newErrors);
            setGeneralError(`Please fill the missing fields: ${missingFields.join(', ')}`);
            return;
        }

        const item: Publication = {
            id:          editingItem ? editingItem.id : '',
            title:       formData.title!,
            publisher:   formData.publisher!,
            url:         formData.url ?? '',
            publishDate: formData.publishDate!,
        };

        setSaving(true);
        try {
            const updatedStudent = await StudentService.managePublication(studentId, item);
            onUpdate(updatedStudent);
            setIsModalOpen(false);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.message ??
                'Failed to save publication. Please try again.';
            setGeneralError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteId) {
            const updatedStudent = await StudentService.deletePublication(studentId, deleteId);
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

            {/* Header row */}
            <div className="flex items-center justify-between">
                <div
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                        atLimit
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : 'bg-blue-50 border-blue-100 text-blue-700'
                    }`}
                >
                    {publications.length}/{MAX_PUBLICATIONS} Publications
                </div>
                <button
                    onClick={openAdd}
                    disabled={atLimit}
                    title={atLimit ? `Maximum ${MAX_PUBLICATIONS} publications allowed` : 'Add publication'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                        atLimit
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    <Plus size={16} /> Add Publication
                </button>
            </div>

            {atLimit && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                    <p>
                        You've reached the maximum of{' '}
                        <span className="font-bold">{MAX_PUBLICATIONS} publications</span>. Delete an existing
                        one to add a new entry.
                    </p>
                </div>
            )}

            {publications.map((pub, idx) => (
                <div key={pub.id ?? idx} className="bg-white p-6 rounded-xl border shadow-sm relative group flex justify-between items-start">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(pub)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDeleteId(pub.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{pub.title}</h3>
                        <p className="text-sm text-gray-600 font-medium">{pub.publisher}</p>
                        <p className="text-xs text-gray-500 mt-1">{pub.publishDate}</p>
                    </div>
                    {pub.url && (
                        <a
                            href={pub.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-gray-50 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            <LinkIcon size={20} />
                        </a>
                    )}
                </div>
            ))}

            {publications.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-gray-50 border-2 border-dashed rounded-xl">
                    <BookOpen size={40} className="mx-auto mb-2 opacity-20" />
                    <p>No publications added yet.</p>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Publication' : 'Add Publication'}
                maxWidth="max-w-lg"
            >
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Title *</label>
                        <input
                            className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.title ?? ''}
                            onChange={e => handleChange('title', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Publisher *</label>
                        <input
                            className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.publisher ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.publisher ?? ''}
                            onChange={e => handleChange('publisher', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Publication URL</label>
                        <input
                            className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                            value={formData.url ?? ''}
                            onChange={e => handleChange('url', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Publish Date *</label>
                        <input
                            type="date"
                            className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.publishDate ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.publishDate ?? ''}
                            onChange={e => handleChange('publishDate', e.target.value)}
                        />
                    </div>

                    {generalError && (
                        <div className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded border border-red-100 text-center">
                            {generalError}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save Publication'}
                    </button>
                </div>
            </Modal>

            <DeleteConfirmationModal
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Publication?"
                message="Are you sure you want to remove this publication?"
            />
        </div>
    );
};