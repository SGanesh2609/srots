
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CollegeService } from '../../../../services/collegeService';
import { User, Role, AddressFormData } from '../../../../types';
import {
    Download, UserPlus, Search, ToggleLeft, ToggleRight,
    Trash2, MapPin, Edit2, RefreshCw, CheckCircle, XCircle,
    Loader, Users, Archive,
} from 'lucide-react';
import { AddressForm } from '../../../../components/common/AddressForm';
import { Modal } from '../../../../components/common/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CPUsersDataProps {
    collegeId:   string;
    collegeCode: string;
    collegeName: string;
    onRefresh?:  () => void;
    currentUser: User;
}

type StatusFilter = 'active' | 'soft_deleted';

interface FormState {
    id:             string;
    usernameSuffix: string;
    name:           string;
    email:          string;
    phone:          string;
    department:     string;
    aadhaar:        string;
    role:           Role;
}

interface FormFieldsProps {
    form:           FormState;
    setForm:        React.Dispatch<React.SetStateAction<FormState>>;
    addressForm:    AddressFormData;
    setAddressForm: React.Dispatch<React.SetStateAction<AddressFormData>>;
    collegeCode:    string;
    isEdit:         boolean;
    usernameStatus: 'idle' | 'checking' | 'available' | 'taken' | 'error';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_ADDRESS: AddressFormData = {
    addressLine1: '', addressLine2: '', village: '',
    mandal: '', city: '', state: '', zip: '', country: 'India',
};

const EMPTY_FORM: FormState = {
    id: '', usernameSuffix: '', name: '', email: '',
    phone: '', department: '', aadhaar: '', role: Role.STAFF,
};

// ─── Avatar component ─────────────────────────────────────────────────────────

const CPUserAvatar: React.FC<{ user: User }> = ({ user }) => {
    const [failed, setFailed] = React.useState(false);
    const a   = user as any;
    const src = a.avatarUrl || a.avatar || undefined;
    const initial = user.fullName?.charAt(0)?.toUpperCase() ?? '?';
    const colours = [
        'bg-violet-100 text-violet-700', 'bg-indigo-100 text-indigo-700',
        'bg-blue-100 text-blue-700',     'bg-emerald-100 text-emerald-700',
        'bg-amber-100 text-amber-700',   'bg-rose-100 text-rose-700',
    ];
    const colour = colours[(initial.charCodeAt(0) || 0) % colours.length];

    if (src && !failed) {
        return (
            <img src={src} alt={user.fullName}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100"
                onError={() => setFailed(true)} />
        );
    }
    return (
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${colour}`}>
            {initial}
        </div>
    );
};


function tryParseAddress(json: string | null | undefined): AddressFormData | null {
    if (!json) return null;
    try {
        const parsed = typeof json === 'string' ? JSON.parse(json) : json;
        // Merge with defaults so any missing field is an empty string, not undefined
        return {
            addressLine1: parsed.addressLine1 ?? '',
            addressLine2: parsed.addressLine2 ?? '',
            village:      parsed.village      ?? '',
            mandal:       parsed.mandal       ?? '',
            city:         parsed.city         ?? '',
            state:        parsed.state        ?? '',
            zip:          parsed.zip          ?? '',
            country:      parsed.country      ?? 'India',
        };
    } catch {
        return null;
    }
}



const CPFormFields: React.FC<FormFieldsProps> = ({
    form, setForm, addressForm, setAddressForm,
    collegeCode, isEdit, usernameStatus,
}) => {
    const computedPreview = () => {
        const suffix  = form.usernameSuffix.trim() ||
            (form.aadhaar.length >= 4 ? form.aadhaar.slice(0, 4) : 'xxxx');
        const typeStr = form.role === Role.CPH ? 'CPADMIN' : 'CPSTAFF';
        return `${collegeCode}_${typeStr}_${suffix}`;
    };

    const usernameStatusIcon = () => {
        if (isEdit) return null;
        switch (usernameStatus) {
            case 'checking':   return <Loader size={14} className="animate-spin text-gray-400" />;
            case 'available':  return <CheckCircle size={14} className="text-green-500" />;
            case 'taken':      return <XCircle size={14} className="text-red-500" />;
            default:           return null;
        }
    };

    return (
        <div className="space-y-4">

            {/* Role */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                    Account Role <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                    {[
                        { value: Role.CPH,   label: 'CP Head',         sub: 'Admin rights',   accent: 'accent-purple-600' },
                        { value: Role.STAFF, label: 'Placement Staff', sub: 'Execution only', accent: 'accent-blue-600'   },
                    ].map(opt => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="radio"
                                checked={form.role === opt.value}
                                onChange={() => setForm(f => ({ ...f, role: opt.value }))}
                                className={opt.accent}
                            />
                            <span className="text-sm font-semibold text-gray-700">
                                {opt.label} <span className="text-xs text-gray-400 font-normal">({opt.sub})</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Username suffix */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                    Username Suffix
                    <span className="ml-1 font-normal text-gray-400 normal-case">
                        {isEdit ? '(cannot change after creation)' : '(optional — leave blank to auto-generate)'}
                    </span>
                </label>
                <div className="mt-1 flex gap-0 items-stretch">
                    <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-xs font-mono text-gray-500 whitespace-nowrap select-none">
                        {collegeCode}_{form.role === Role.CPH ? 'CPADMIN' : 'CPSTAFF'}_
                    </div>
                    <div className="relative flex-1">
                        <input
                            className="w-full border border-gray-300 rounded-r-lg p-2 pr-8 bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                            value={form.usernameSuffix}
                            onChange={e => setForm(f => ({
                                ...f,
                                usernameSuffix: e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase(),
                            }))}
                            placeholder="e.g. ravi or john"
                            disabled={isEdit}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {usernameStatusIcon()}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-gray-400">
                        Username: <code className="font-mono text-indigo-600">{computedPreview()}</code>
                    </p>
                    {!isEdit && usernameStatus === 'taken' && (
                        <p className="text-[11px] text-red-500 font-medium">Username already exists</p>
                    )}
                    {!isEdit && usernameStatus === 'available' && form.usernameSuffix && (
                        <p className="text-[11px] text-green-600 font-medium">Username available</p>
                    )}
                </div>
            </div>

            {/* Full Name + Email */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        className="w-full border border-gray-300 p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none text-sm mt-1"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Full legal name"
                        autoComplete="off"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        className="w-full border border-gray-300 p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none text-sm mt-1"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="user@college.edu"
                        autoComplete="off"
                    />
                </div>

                {/* Phone + Department */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        className="w-full border border-gray-300 p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none text-sm mt-1"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        placeholder="10-digit mobile"
                        maxLength={10}
                        inputMode="numeric"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Department <span className="text-red-500">*</span>
                    </label>
                    <input
                        className="w-full border border-gray-300 p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none text-sm mt-1"
                        value={form.department}
                        onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                        placeholder="Training & Placement"
                    />
                </div>
            </div>

            {/* Aadhaar */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                    Aadhaar Number <span className="text-red-500">*</span>
                    <span className="ml-1 font-normal text-gray-400 normal-case">(used to generate initial password)</span>
                </label>
                <div className="relative mt-1">
                    <input
                        className="w-full border border-gray-300 p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono tracking-widest"
                        value={form.aadhaar}
                        onChange={e => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                            setForm(f => ({ ...f, aadhaar: digits }));
                        }}
                        placeholder="123456789012"
                        maxLength={12}
                        inputMode="numeric"
                        autoComplete="off"
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono ${
                        form.aadhaar.length === 12 ? 'text-green-500' : 'text-gray-400'
                    }`}>
                        {form.aadhaar.length}/12{form.aadhaar.length === 12 ? ' ✓' : ''}
                    </span>
                </div>
            </div>

            {/* Address */}
            <div className="border-t pt-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1.5">
                    <MapPin size={12} /> Residential Address
                </label>
                <AddressForm data={addressForm} onChange={setAddressForm} />
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const CPUsersData: React.FC<CPUsersDataProps> = ({
    collegeId, collegeCode, collegeName, onRefresh, currentUser,
}) => {
    const [cpAdminList,   setCpAdminList]   = useState<User[]>([]);
    const [search,        setSearch]        = useState('');
    const [statusFilter,  setStatusFilter]  = useState<StatusFilter>('active');

    const [showCreate,   setShowCreate]   = useState(false);
    const [showEdit,     setShowEdit]     = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [form,        setForm]        = useState<FormState>({ ...EMPTY_FORM });
    const [addressForm, setAddressForm] = useState<AddressFormData>({ ...EMPTY_ADDRESS });

    // Username availability check
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
    const usernameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Delete modal
    const [deleteTarget,    setDeleteTarget]    = useState<{ id: string; name: string } | null>(null);
    const [deleteMode,      setDeleteMode]      = useState<'soft' | 'hard'>('soft');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting,      setIsDeleting]      = useState(false);

    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [isSaving,   setIsSaving]   = useState(false);

    // ── Fetch list ─────────────────────────────────────────────────────────────

    const refreshList = useCallback(async () => {
        try {
            const results = await CollegeService.searchCPUsers(collegeId, search, statusFilter);
            setCpAdminList(results);
            onRefresh?.();
        } catch (err) {
            console.error('[CPUsersData] refreshList failed:', err);
        }
    }, [collegeId, search, statusFilter]);

    useEffect(() => { refreshList(); }, [refreshList]);

    // ── Username availability check (debounced 600ms) ─────────────────────────

    useEffect(() => {
        if (showEdit) return;                    // no check in edit mode
        if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current);

        const suffix   = form.usernameSuffix.trim();
        const typeStr  = form.role === Role.CPH ? 'CPADMIN' : 'CPSTAFF';
        const fullName = `${collegeCode}_${typeStr}_${suffix}`;

        if (!suffix) {
            setUsernameStatus('idle');
            return;
        }

        setUsernameStatus('checking');
        usernameCheckTimer.current = setTimeout(async () => {
            try {
                const result = await CollegeService.checkUsernameAvailable(fullName);
                setUsernameStatus(result.available ? 'available' : 'taken');
            } catch {
                setUsernameStatus('error');
            }
        }, 600);

        return () => {
            if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current);
        };
    }, [form.usernameSuffix, form.role, collegeCode, showEdit]);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const computedUsername = () => {
        const suffix  = form.usernameSuffix.trim() ||
            (form.aadhaar.length >= 4 ? form.aadhaar.slice(0, 4) : 'xxxx');
        const typeStr = form.role === Role.CPH ? 'CPADMIN' : 'CPSTAFF';
        return `${collegeCode}_${typeStr}_${suffix}`;
    };

    const validate = (): boolean => {
        const errors: string[] = [];

        if (!form.name.trim())       errors.push('Full Name is required');
        if (!form.email.trim())      errors.push('Email is required');
        if (!form.phone.trim())      errors.push('Phone is required');
        if (!form.department.trim()) errors.push('Department is required');

        const cleanAadhaar = form.aadhaar.replace(/\D/g, '');
        if (!cleanAadhaar)              errors.push('Aadhaar Number is required');
        else if (cleanAadhaar.length !== 12) errors.push(`Aadhaar must be 12 digits (entered ${cleanAadhaar.length})`);

        if (!addressForm.addressLine1.trim()) errors.push('Address Line 1 is required');
        if (!addressForm.city.trim())         errors.push('City is required');
        if (!addressForm.state.trim())        errors.push('State is required');
        if (!addressForm.zip.trim())          errors.push('Zip Code is required');

        if (usernameStatus === 'taken') errors.push('Username already exists — choose a different suffix');

        setFormErrors(errors);
        return errors.length === 0;
    };

    const resetForm = () => {
        setForm({ ...EMPTY_FORM });
        setAddressForm({ ...EMPTY_ADDRESS });
        setFormErrors([]);
        setUsernameStatus('idle');
    };

    const closeCreate = () => { setShowCreate(false); resetForm(); };
    const closeEdit   = () => { setShowEdit(false);   resetForm(); setSelectedUser(null); };

    // ── Create ──────────────────────────────────────────────────────────────────

    const handleCreate = async () => {
        if (!validate()) return;

        const cleanAadhaar = form.aadhaar.replace(/\D/g, '');

        setIsSaving(true);
        try {
            await CollegeService.createCPAdmin({
                username:      form.usernameSuffix.trim() || undefined,
                name:          form.name.trim(),
                email:         form.email.trim(),
                phone:         form.phone.trim(),
                department:    form.department.trim(),
                aadhaar:       cleanAadhaar,
                address:       addressForm,
                collegeId,
                role:          form.role,
                isCollegeHead: form.role === Role.CPH,
            });
            await refreshList();
            setShowCreate(false);
            resetForm();
            alert(`Account created!\nUsername: ${computedUsername()}\nCredentials emailed to the user.`);
        } catch (err: any) {
            const raw = err?.response?.data;
            const msg = (typeof raw === 'string' ? raw : raw?.message) || err?.message || 'Failed to create account';
            setFormErrors([msg]);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Edit ────────────────────────────────────────────────────────────────────

    const openEdit = (cp: User) => {
        setSelectedUser(cp);

        // ── Username suffix extraction ────────────────────────────────────────
        // Username pattern: COLLEGE_CPADMIN_suffix or COLLEGE_CPSTAFF_suffix
        // Split on '_' and take everything from index 2 onward as the suffix.
        // e.g. "JNTUH_CPADMIN_ravi" → parts = ["JNTUH","CPADMIN","ravi"] → suffix = "ravi"
        const existingUsername = (cp as any).username ?? cp.id ?? '';
        const parts  = existingUsername.split('_');
        const suffix = parts.length >= 3 ? parts.slice(2).join('_') : existingUsername;

        setForm({
            id:             cp.id,
            usernameSuffix: suffix,
            name:           cp.fullName      ?? '',
            email:          cp.email         ?? '',
            phone:          cp.phone         ?? '',
            department:     cp.department    ?? '',
            aadhaar:        cp.aadhaarNumber ?? '',
            role:           cp.role as Role,
        });

        // ── Address population — THE FIX ─────────────────────────────────────
        // User.java stores address as a JSON string in the `addressJson` column.
        // Jackson exposes it in the API response as:
        //   { "addressJson": "{\"city\":\"Hyderabad\",...}" }   ← raw string
        // NOT as:
        //   { "address": { "city": "Hyderabad", ... } }        ← object (absent on User)
        //
        // Previously: setAddressForm((cp as any).address ?? EMPTY_ADDRESS)
        //   → (cp as any).address is always undefined → blank form every time
        //
        // Now: try address object first (future-proof), then parse addressJson string.
        const addr =
            tryParseAddress((cp as any).address) ??      // nested object (if ever present)
            tryParseAddress((cp as any).addressJson) ??  // raw JSON string from entity
            { ...EMPTY_ADDRESS };                        // safe blank fallback

        setAddressForm(addr);
        setFormErrors([]);
        setShowEdit(true);
    };

    const handleUpdate = async () => {
        if (!selectedUser) return;
        if (!validate()) return;

        const cleanAadhaar = form.aadhaar.replace(/\D/g, '');

        setIsSaving(true);
        try {
            const updated: User = {
                ...selectedUser,
                fullName:      form.name.trim(),
                email:         form.email.trim(),
                phone:         form.phone.trim(),
                department:    form.department.trim(),
                role:          form.role,
                isCollegeHead: form.role === Role.CPH,
                aadhaarNumber: cleanAadhaar,
            };
            await CollegeService.updateCPAdmin(updated, addressForm);
            await refreshList();
            closeEdit();
        } catch (err: any) {
            const raw = err?.response?.data;
            const msg = (typeof raw === 'string' ? raw : raw?.message) || err?.message || 'Failed to update';
            setFormErrors([msg]);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Delete ──────────────────────────────────────────────────────────────────

    const requestDelete = (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        setDeleteTarget({ id, name });
        setDeleteMode('soft');
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await CollegeService.deleteCPAdmin(deleteTarget.id, deleteMode === 'hard');
            await refreshList();
        } catch (err: any) {
            alert('Delete failed: ' + (err?.response?.data?.message || err?.message));
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setDeleteTarget(null);
        }
    };

    const handleRestore = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await CollegeService.restoreCPAdmin(id);
            await refreshList();
        } catch (err: any) {
            alert('Restore failed: ' + (err?.message || 'Unknown error'));
        }
    };

    // ── Restriction ─────────────────────────────────────────────────────────────

    const handleToggleRestriction = async (cp: User) => {
        try {
            await CollegeService.toggleRestriction(cp.id, !cp.isRestricted);
            await refreshList();
        } catch (err: any) {
            alert('Toggle restriction failed: ' + (err?.message || 'Unknown error'));
        }
    };

    // ── Error box ───────────────────────────────────────────────────────────────

    const ErrorBox = () => formErrors.length > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3.5">
            <p className="text-xs font-bold text-red-700 mb-1">Please fix the following:</p>
            <ul className="list-disc list-inside space-y-0.5">
                {formErrors.map((e, i) => <li key={i} className="text-xs text-red-600">{e}</li>)}
            </ul>
        </div>
    ) : null;

    // ── Status tab counts ────────────────────────────────────────────────────────

    const activeCount     = cpAdminList.filter(u => !(u as any).isDeleted).length;
    const softDeletedCount = cpAdminList.filter(u => (u as any).isDeleted).length;

    const displayList = statusFilter === 'active'
        ? cpAdminList.filter(u => !(u as any).isDeleted)
        : cpAdminList.filter(u => (u as any).isDeleted);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 animate-in fade-in">

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">College Placement Users</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Manage Heads and Staff for {collegeCode}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => CollegeService.exportCPUsers(collegeId)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-bold shadow-sm transition-colors"
                    >
                        <Download size={15} /> Download List
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowCreate(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm text-sm font-bold transition-colors"
                    >
                        <UserPlus size={15} /> Create CP Account
                    </button>
                </div>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
                {([
                    { value: 'active',       label: 'Active',       icon: Users,   count: activeCount      },
                    { value: 'soft_deleted', label: 'Soft Deleted', icon: Archive, count: softDeletedCount },
                ] as { value: StatusFilter; label: string; icon: any; count: number }[]).map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setStatusFilter(tab.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            statusFilter === tab.value
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <tab.icon size={12} />
                        {tab.label}
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            statusFilter === tab.value ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900"
                    placeholder="Search by name, email or username..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[760px] text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                            <tr>
                                <th className="px-5 py-3 font-semibold">User</th>
                                <th className="px-5 py-3 font-semibold">Contact</th>
                                <th className="px-5 py-3 font-semibold">Role</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {displayList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-14 text-gray-400 text-sm">
                                        {statusFilter === 'soft_deleted'
                                            ? 'No soft-deleted users found'
                                            : `No active CP users found for ${collegeCode}`}
                                    </td>
                                </tr>
                            ) : displayList.map(cp => {
                                const isSoftDeleted = !!(cp as any).isDeleted;
                                return (
                                    <tr key={cp.id}
                                        className={`hover:bg-gray-50/60 transition-colors group ${isSoftDeleted ? 'opacity-70 bg-amber-50/30' : ''}`}
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <CPUserAvatar user={cp} />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{cp.fullName}</p>
                                                    <p className="text-[11px] text-gray-400 font-mono truncate">
                                                        {(cp as any).username ?? cp.id}
                                                    </p>
                                                    {isSoftDeleted && (
                                                        <span className="inline-block text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold mt-0.5">
                                                            Soft Deleted{(cp as any).deletedAt ? ` · ${new Date((cp as any).deletedAt).toLocaleDateString()}` : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-600 space-y-0.5">
                                            <div className="truncate max-w-[200px]" title={cp.email}>{cp.email}</div>
                                            <div className="text-gray-400">{cp.phone || '—'}</div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 text-[10px] rounded-full font-bold uppercase tracking-wide border ${
                                                cp.role === Role.CPH
                                                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {cp.role === Role.CPH ? 'CP Head' : 'Placement Staff'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {!isSoftDeleted && (
                                                <span className={`px-2.5 py-1 text-[10px] rounded-full font-bold uppercase tracking-wide border ${
                                                    !cp.isRestricted
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                    {cp.isRestricted ? 'Restricted' : 'Active'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isSoftDeleted && (
                                                    <>
                                                        <button
                                                            title="Edit"
                                                            onClick={e => { e.stopPropagation(); openEdit(cp); }}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                        >
                                                            <Edit2 size={15} />
                                                        </button>
                                                        <button
                                                            title={cp.isRestricted ? 'Activate' : 'Restrict'}
                                                            onClick={e => { e.stopPropagation(); handleToggleRestriction(cp); }}
                                                            className={`p-1.5 rounded-lg transition-colors ${
                                                                cp.isRestricted
                                                                    ? 'text-green-600 hover:bg-green-50'
                                                                    : 'text-amber-500 hover:bg-amber-50'
                                                            }`}
                                                        >
                                                            {cp.isRestricted ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
                                                        </button>
                                                    </>
                                                )}
                                                {isSoftDeleted && (
                                                    <button
                                                        title="Restore account"
                                                        onClick={e => handleRestore(e, cp.id)}
                                                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                                                    >
                                                        <RefreshCw size={15} />
                                                    </button>
                                                )}
                                                <button
                                                    title="Delete"
                                                    onClick={e => requestDelete(e, cp.id, cp.fullName)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Create Modal ──────────────────────────────────────────────────── */}
            <Modal isOpen={showCreate} onClose={closeCreate} title="Create CP User Account">
                <div className="p-6 space-y-5 max-h-[84vh] overflow-y-auto">
                    <CPFormFields
                        form={form} setForm={setForm}
                        addressForm={addressForm} setAddressForm={setAddressForm}
                        collegeCode={collegeCode} isEdit={false}
                        usernameStatus={usernameStatus}
                    />
                    <ErrorBox />
                    <div className="flex gap-3 pt-1">
                        <button onClick={closeCreate}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleCreate} disabled={isSaving || usernameStatus === 'taken'}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {isSaving ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Edit Modal ────────────────────────────────────────────────────── */}
            <Modal isOpen={showEdit} onClose={closeEdit} title="Edit CP User">
                <div className="p-6 space-y-5 max-h-[84vh] overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">System User ID</label>
                        <input className="w-full border p-2 rounded-lg bg-gray-100 text-gray-400 text-sm mt-1 cursor-not-allowed font-mono"
                            value={form.id} disabled />
                    </div>
                    <CPFormFields
                        form={form} setForm={setForm}
                        addressForm={addressForm} setAddressForm={setAddressForm}
                        collegeCode={collegeCode} isEdit={true}
                        usernameStatus={usernameStatus}
                    />
                    <ErrorBox />
                    <div className="flex gap-3 pt-1">
                        <button onClick={closeEdit}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleUpdate} disabled={isSaving}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Soft / Hard Delete Modal ───────────────────────────────────────── */}
            {showDeleteModal && deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <Trash2 className="text-red-600" size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Delete CP Account</h3>
                                <p className="text-sm text-gray-500 mt-0.5 truncate max-w-[280px]">{deleteTarget.name}</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-sm font-semibold text-gray-700">Choose deletion type:</p>
                            {[
                                {
                                    value: 'soft' as const,
                                    title: 'Soft Delete',
                                    badge: 'Recommended',
                                    badgeClass: 'bg-amber-100 text-amber-700',
                                    borderClass: deleteMode === 'soft' ? 'border-amber-400 bg-amber-50' : 'border-gray-200',
                                    desc: 'Account hidden but data preserved for 90 days. Can be restored.',
                                    titleClass: 'text-gray-800',
                                    accent: 'accent-amber-500',
                                },
                                {
                                    value: 'hard' as const,
                                    title: 'Hard Delete',
                                    badge: 'Irreversible',
                                    badgeClass: 'bg-red-100 text-red-700',
                                    borderClass: deleteMode === 'hard' ? 'border-red-400 bg-red-50' : 'border-gray-200',
                                    desc: 'Permanently destroys all account data. Requires ADMIN role.',
                                    titleClass: 'text-red-700',
                                    accent: 'accent-red-500',
                                },
                            ].map(opt => (
                                <label key={opt.value}
                                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${opt.borderClass} hover:border-gray-300`}>
                                    <input type="radio" name="delMode" value={opt.value}
                                        checked={deleteMode === opt.value}
                                        onChange={() => setDeleteMode(opt.value)}
                                        className={`mt-0.5 ${opt.accent}`} />
                                    <div>
                                        <p className={`font-bold text-sm flex items-center gap-2 ${opt.titleClass}`}>
                                            {opt.title}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${opt.badgeClass}`}>
                                                {opt.badge}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                                    </div>
                                </label>
                            ))}
                            {deleteMode === 'hard' && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-xs text-red-700 font-medium">⚠️ This cannot be undone. All data will be permanently destroyed.</p>
                                </div>
                            )}
                        </div>
                        <div className="px-6 pb-6 flex gap-3 justify-end">
                            <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                                disabled={isDeleting}
                                className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} disabled={isDeleting}
                                className={`px-5 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2 disabled:opacity-60 ${
                                    deleteMode === 'hard' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
                                }`}>
                                {isDeleting && (
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                )}
                                {isDeleting ? 'Deleting...' : deleteMode === 'hard' ? 'Permanently Delete' : 'Soft Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};