import React, { useState } from 'react';
import { Project, Student } from '../../../../types';
import { Plus, Edit2, Trash2, Globe, FileText, AlertTriangle } from 'lucide-react';
import { Modal } from '../../../common/Modal';
import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
import { StudentService } from '../../../../services/studentService';

/**
 * ProjectsTab
 * Path: components/colleges/student-portal/profile/ProjectsTab.tsx
 *
 * ─── FIXES ───────────────────────────────────────────────────────────────────
 * 1. MAX_PROJECTS = 4 enforced:
 *      - Add button disabled when limit reached
 *      - Warning banner shown when at limit
 *      - handleSave() guards against API call if limit reached (extra safety)
 *      - Badge shows X/4 in red when full
 * 2. Backend will also reject a 6th item; error is shown to user.
 */

const MAX_PROJECTS = 4;

interface ProjectsTabProps {
    studentId: string;
    projects: Project[];
    onUpdate: (student: Student | null) => void;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ studentId, projects, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Project | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Project>>({});
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [generalError, setGeneralError] = useState('');
    const [saving, setSaving] = useState(false);

    const atLimit = projects.length >= MAX_PROJECTS;
    const isEditing = editingItem !== null;

    const openAdd = () => {
        if (atLimit) return;
        setEditingItem(null);
        setFormData({ isCurrent: false });
        setErrors({});
        setGeneralError('');
        setIsModalOpen(true);
    };

    const openEdit = (item: Project) => {
        setEditingItem(item);
        setFormData({ ...item });
        setErrors({});
        setGeneralError('');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        // Frontend guard: prevent adding beyond limit
        if (!isEditing && atLimit) {
            setGeneralError(`You can only add up to ${MAX_PROJECTS} projects. Please delete an existing one first.`);
            return;
        }

        const newErrors: Record<string, boolean> = {};
        const missingFields: string[] = [];

        if (!formData.title?.trim())       { newErrors.title = true;       missingFields.push('Project Title'); }
        if (!formData.domain?.trim())      { newErrors.domain = true;      missingFields.push('Project Domain'); }
        if (!formData.techUsed?.trim())    { newErrors.techUsed = true;    missingFields.push('Tech Used'); }
        if (!formData.startDate)           { newErrors.startDate = true;   missingFields.push('Start Date'); }
        if (!formData.description?.trim()) { newErrors.description = true; missingFields.push('Description'); }
        if (!formData.isCurrent && !formData.endDate) {
            newErrors.endDate = true;
            missingFields.push('End Date');
        }

        if (missingFields.length > 0) {
            setErrors(newErrors);
            setGeneralError(`Please fill the missing fields: ${missingFields.join(', ')}`);
            return;
        }

        const item: Project = {
            id:          editingItem ? editingItem.id : '',
            title:       formData.title!,
            domain:      formData.domain!,
            techUsed:    formData.techUsed!,
            startDate:   formData.startDate!,
            endDate:     formData.isCurrent ? '' : formData.endDate!,
            isCurrent:   formData.isCurrent ?? false,
            description: formData.description!,
            link:        formData.link ?? '',
        };

        setSaving(true);
        try {
            const updatedStudent = await StudentService.manageProject(studentId, item);
            onUpdate(updatedStudent);
            setIsModalOpen(false);
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to save project. Please try again.';
            setGeneralError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteId) {
            const updatedStudent = await StudentService.deleteProject(studentId, deleteId);
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

            {/* Header row with limit badge and Add button */}
            <div className="flex items-center justify-between">
                <div
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                        atLimit
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : 'bg-blue-50 border-blue-100 text-blue-700'
                    }`}
                >
                    {projects.length}/{MAX_PROJECTS} Projects
                </div>
                <button
                    onClick={openAdd}
                    disabled={atLimit}
                    title={atLimit ? `Maximum ${MAX_PROJECTS} projects allowed` : 'Add a new project'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                        atLimit
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    <Plus size={16} /> Add Project
                </button>
            </div>

            {/* Limit-reached warning */}
            {atLimit && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                    <p>
                        You've reached the maximum of <span className="font-bold">{MAX_PROJECTS} projects</span>.
                        Delete an existing one to add a new project.
                    </p>
                </div>
            )}

            {/* Project cards */}
            {projects.map((proj, idx) => (
                <div key={proj.id ?? idx} className="bg-white p-6 rounded-xl border shadow-sm relative group">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(proj)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDeleteId(proj.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{proj.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-3">
                        <span className="font-bold text-gray-700">{proj.domain}</span> • {proj.techUsed}
                    </p>
                    <p className="text-xs text-gray-400 mb-2 font-mono">
                        {proj.startDate} - {proj.isCurrent ? 'Present' : proj.endDate}
                    </p>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{proj.description}</p>
                    {proj.link && (
                        <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                            <Globe size={12} /> View Project
                        </a>
                    )}
                </div>
            ))}

            {projects.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-gray-50 border-2 border-dashed rounded-xl">
                    <FileText size={40} className="mx-auto mb-2 opacity-20" />
                    <p>No projects added yet.</p>
                </div>
            )}

            {/* Add / Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Project' : 'Add Project'}
                maxWidth="max-w-lg"
            >
                <div className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Project Title *</label>
                        <input
                            className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.title ?? ''}
                            onChange={e => handleChange('title', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Project Domain *</label>
                        <input
                            className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.domain ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g. Web Dev, AI/ML"
                            value={formData.domain ?? ''}
                            onChange={e => handleChange('domain', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Tech Used *</label>
                        <input
                            className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.techUsed ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g. React, Node.js"
                            value={formData.techUsed ?? ''}
                            onChange={e => handleChange('techUsed', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Start Date *</label>
                            <input
                                type="month"
                                className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.startDate ?? ''}
                                onChange={e => handleChange('startDate', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">End Date *</label>
                            <input
                                type="month"
                                disabled={formData.isCurrent}
                                className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.endDate ?? ''}
                                onChange={e => handleChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded border border-gray-200">
                        <input
                            type="checkbox"
                            checked={formData.isCurrent ?? false}
                            onChange={e => {
                                handleChange('isCurrent', e.target.checked);
                                if (e.target.checked && errors.endDate) {
                                    const newErrs = { ...errors };
                                    delete newErrs.endDate;
                                    setErrors(newErrs);
                                    setGeneralError('');
                                }
                            }}
                        />
                        <span className="text-sm font-bold text-gray-700">I am currently working on this</span>
                    </label>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Description *</label>
                        <textarea
                            rows={3}
                            className={`w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.description ?? ''}
                            onChange={e => handleChange('description', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Project Link</label>
                        <input
                            className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                            value={formData.link ?? ''}
                            onChange={e => handleChange('link', e.target.value)}
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
                        {saving ? 'Saving...' : 'Save Project'}
                    </button>
                </div>
            </Modal>

            <DeleteConfirmationModal
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Project?"
                message="Are you sure you want to remove this project?"
            />
        </div>
    );
};