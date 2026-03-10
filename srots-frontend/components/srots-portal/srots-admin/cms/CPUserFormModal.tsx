import React, { useState, useEffect, useRef } from 'react';
import { User, AddressFormData, Role } from '../../../../types';
import { Info, MapPin, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Modal } from '../../../common/Modal';
import { AddressForm } from '../../../common/AddressForm';
import { CollegeService } from '../../../../services/collegeService';

/**
 * Component: CPUserFormModal
 * Path: components/colleges/cms/CPUserFormModal.tsx
 *
 * Modal form to create or edit a CP user (CPH / STAFF) from the SROTS Admin/Dev
 * CMS panel (CollegeDetailView → CPUsersData).
 *
 * Used in: CPUsersData
 */

// ── Types ──────────────────────────────────────────────────────────────────────

interface CPUserFormModalProps {
    isOpen:       boolean;
    onClose:      () => void;
    onSave:       (data: Partial<User> & Record<string, any>, userId?: string) => void;
    initialData?: User;
    collegeCode:  string;
    collegeName:  string;
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

// ── Helpers ────────────────────────────────────────────────────────────────────

const EMPTY_ADDRESS: AddressFormData = {
    addressLine1: '', addressLine2: '', village: '',
    mandal: '', city: '', state: '', zip: '', country: 'India',
};

function tryParseAddress(raw: any): AddressFormData | null {
    if (!raw) return null;
    try {
        const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return {
            addressLine1: obj.addressLine1 ?? '',
            addressLine2: obj.addressLine2 ?? '',
            village:      obj.village      ?? '',
            mandal:       obj.mandal       ?? '',
            city:         obj.city         ?? '',
            state:        obj.state        ?? '',
            zip:          obj.zip          ?? '',
            country:      obj.country      ?? 'India',
        };
    } catch {
        return null;
    }
}

/**
 * Normalise whatever the backend returns for role into either Role.CPH or Role.STAFF.
 * The backend may send the string "CPH" or "STAFF" which TypeScript won't accept
 * directly as the Role enum — this cast makes it safe.
 */
function toRole(raw: any): Role.CPH | Role.STAFF {
    if (raw === Role.CPH || raw === 'CPH') return Role.CPH;
    return Role.STAFF;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const CPUserFormModal: React.FC<CPUserFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    collegeCode,
    collegeName,
}) => {
    const isEdit = !!initialData;

    // ── Form state ─────────────────────────────────────────────────────────────
    const [usernameSuffix, setUsernameSuffix] = useState('');
    const [role,           setRole]           = useState<Role.CPH | Role.STAFF>(Role.STAFF);
    const [fullName,       setFullName]       = useState('');
    const [email,          setEmail]          = useState('');
    const [phone,          setPhone]          = useState('');
    const [department,     setDepartment]     = useState('');
    const [aadhaar,        setAadhaar]        = useState('');
    const [addressForm,    setAddressForm]    = useState<AddressFormData>({ ...EMPTY_ADDRESS });

    const [errors,         setErrors]         = useState<string[]>([]);
    const [isSaving,       setIsSaving]       = useState(false);

    // Username availability
    const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Populate on open ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        setErrors([]);
        setUsernameStatus('idle');

        if (initialData) {
            // Extract suffix: "JNTUH_CPADMIN_ravi" → "ravi"
            const existingUsername = (initialData as any).username ?? initialData.id ?? '';
            const parts  = existingUsername.split('_');
            const suffix = parts.length >= 3 ? parts.slice(2).join('_') : existingUsername;

            setUsernameSuffix(suffix);
            setRole(toRole(initialData.role));
            setFullName(initialData.fullName      ?? '');
            setEmail(initialData.email            ?? '');
            setPhone(initialData.phone            ?? '');
            setDepartment(initialData.department  ?? '');
            setAadhaar(initialData.aadhaarNumber  ?? '');

            const addr =
                tryParseAddress((initialData as any).address) ??
                tryParseAddress((initialData as any).addressJson) ??
                { ...EMPTY_ADDRESS };
            setAddressForm(addr);
        } else {
            setUsernameSuffix('');
            setRole(Role.STAFF);
            setFullName('');
            setEmail('');
            setPhone('');
            setDepartment('');
            setAadhaar('');
            setAddressForm({ ...EMPTY_ADDRESS });
        }
    }, [isOpen, initialData]);

    // ── Username availability check (debounced 600 ms, create mode only) ──────
    useEffect(() => {
        if (isEdit) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const suffix = usernameSuffix.trim();
        if (!suffix) { setUsernameStatus('idle'); return; }

        const typeStr   = role === Role.CPH ? 'CPADMIN' : 'CPSTAFF';
        const candidate = `${collegeCode}_${typeStr}_${suffix}`;

        setUsernameStatus('checking');
        debounceRef.current = setTimeout(async () => {
            try {
                const result = await CollegeService.checkUsernameAvailable(candidate);
                setUsernameStatus(result.available ? 'available' : 'taken');
            } catch {
                setUsernameStatus('error');
            }
        }, 600);

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [usernameSuffix, role, collegeCode, isEdit]);

    // ── Derived username preview ───────────────────────────────────────────────
    const usernamePreview = () => {
        const typeStr = role === Role.CPH ? 'CPADMIN' : 'CPSTAFF';
        const suffix  = usernameSuffix.trim() ||
            (aadhaar.length >= 4 ? aadhaar.slice(0, 4) : 'xxxx');
        return `${collegeCode}_${typeStr}_${suffix}`;
    };

    // ── Username status icon ───────────────────────────────────────────────────
    const StatusIcon = () => {
        if (isEdit) return null;
        if (usernameStatus === 'checking')  return <Loader      size={13} className="animate-spin text-gray-400" />;
        if (usernameStatus === 'available') return <CheckCircle size={13} className="text-green-500" />;
        if (usernameStatus === 'taken')     return <XCircle     size={13} className="text-red-500" />;
        return null;
    };

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = (): boolean => {
        const errs: string[] = [];
        if (!fullName.trim())   errs.push('Full Name is required');
        if (!email.trim())      errs.push('Email is required');
        if (!phone.trim())      errs.push('Phone is required');
        if (!department.trim()) errs.push('Department is required');

        const cleanAadhaar = aadhaar.replace(/\D/g, '');
        if (!cleanAadhaar)
            errs.push('Aadhaar Number is required');
        else if (cleanAadhaar.length !== 12)
            errs.push(`Aadhaar must be 12 digits (entered ${cleanAadhaar.length})`);

        if (!addressForm.addressLine1.trim()) errs.push('Address Line 1 is required');
        if (!addressForm.city.trim())         errs.push('City is required');
        if (!addressForm.state.trim())        errs.push('State is required');
        if (!addressForm.zip.trim())          errs.push('Zip Code is required');

        if (!isEdit && usernameStatus === 'taken')
            errs.push('Username already taken — choose a different suffix');

        setErrors(errs);
        return errs.length === 0;
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSaving(true);
        try {
            const payload: Partial<User> & Record<string, any> = {
                fullName:      fullName.trim(),
                email:         email.trim(),
                phone:         phone.trim(),
                department:    department.trim(),
                aadhaarNumber: aadhaar.replace(/\D/g, ''),
                role,                              // ← Role enum value, type-safe
                isCollegeHead: role === Role.CPH,
                address:       addressForm,
                username:      usernameSuffix.trim() || undefined,
            };
            await onSave(payload, isEdit ? initialData!.id : undefined);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? `Edit CP User` : `Create CP User — ${collegeName}`}
            maxWidth="max-w-lg"
        >
            <div className="p-6 overflow-y-auto space-y-5 max-h-[82vh]">

                {/* Info banner (create only) */}
                {!isEdit && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
                        <Info size={15} className="text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700">
                            Password is auto-generated from the username + Aadhaar digits and
                            emailed to the user on account creation.
                        </p>
                    </div>
                )}

                {/* Role selector */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                        Account Role <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                        {([
                            { value: Role.CPH,   label: 'CP Head',        sub: 'Admin rights'   },
                            { value: Role.STAFF, label: 'Placement Staff', sub: 'Execution only' },
                        ] as { value: Role.CPH | Role.STAFF; label: string; sub: string }[]).map(opt => (
                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="radio"
                                    checked={role === opt.value}
                                    onChange={() => setRole(opt.value)}
                                    disabled={isEdit}
                                    className="accent-blue-600"
                                />
                                <span className="text-sm font-semibold text-gray-700">
                                    {opt.label}{' '}
                                    <span className="text-xs text-gray-400 font-normal">({opt.sub})</span>
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
                            {isEdit
                                ? '(cannot change after creation)'
                                : '(optional — leave blank to auto-generate from Aadhaar)'}
                        </span>
                    </label>
                    <div className="mt-1 flex items-stretch">
                        {/* Prefix badge */}
                        <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-xs font-mono text-gray-500 whitespace-nowrap select-none">
                            {collegeCode}_{role === Role.CPH ? 'CPADMIN' : 'CPSTAFF'}_
                        </div>
                        {/* Suffix input */}
                        <div className="relative flex-1">
                            <input
                                className="w-full border border-gray-300 rounded-r-lg p-2 pr-8 bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                                value={usernameSuffix}
                                onChange={e =>
                                    setUsernameSuffix(
                                        e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
                                    )
                                }
                                placeholder="e.g. ravi or john"
                                disabled={isEdit}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <StatusIcon />
                            </div>
                        </div>
                    </div>
                    {/* Preview + availability message */}
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] text-gray-400">
                            Username:{' '}
                            <code className="font-mono text-indigo-600">{usernamePreview()}</code>
                        </p>
                        {!isEdit && usernameStatus === 'taken' && (
                            <p className="text-[11px] text-red-500 font-medium">Username already exists</p>
                        )}
                        {!isEdit && usernameStatus === 'available' && usernameSuffix && (
                            <p className="text-[11px] text-green-600 font-medium">Username available ✓</p>
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
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
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
                            value={email}
                            onChange={e => setEmail(e.target.value)}
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
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                            placeholder="Training & Placement"
                        />
                    </div>
                </div>

                {/* Aadhaar */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Aadhaar Number <span className="text-red-500">*</span>
                        <span className="ml-1 font-normal text-gray-400 normal-case">
                            (used to generate initial password)
                        </span>
                    </label>
                    <div className="relative mt-1">
                        <input
                            className="w-full border border-gray-300 p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono tracking-widest"
                            value={aadhaar}
                            onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                            placeholder="123456789012"
                            maxLength={12}
                            inputMode="numeric"
                            autoComplete="off"
                        />
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono ${
                            aadhaar.length === 12 ? 'text-green-500' : 'text-gray-400'
                        }`}>
                            {aadhaar.length}/12{aadhaar.length === 12 ? ' ✓' : ''}
                        </span>
                    </div>
                </div>

                {/* Address */}
                <div className="border-t pt-4">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1.5">
                        <MapPin size={12} /> Residential Address <span className="text-red-500">*</span>
                    </label>
                    <AddressForm data={addressForm} onChange={setAddressForm} />
                </div>

                {/* Error list */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3.5">
                        <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1.5">
                            <AlertCircle size={13} /> Please fix the following:
                        </p>
                        <ul className="list-disc list-inside space-y-0.5">
                            {errors.map((e, i) => (
                                <li key={i} className="text-xs text-red-600">{e}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || (!isEdit && usernameStatus === 'taken')}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSaving
                            ? (isEdit ? 'Saving…' : 'Creating…')
                            : (isEdit ? 'Save Changes' : 'Create Account')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};