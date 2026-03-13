import React, { useState, useRef, useEffect } from 'react';
import { User, Student, StudentProfile, AddressFormData } from '../../../../types';
import {
  Camera, Phone, MapPin, Edit2, Shield,
  User as UserIcon, AlertTriangle, FileText,
  Loader2, Lock, CheckCircle, XCircle,
} from 'lucide-react';
import { AddressForm } from '../../../common/AddressForm';
import { StudentService, StudentSelfUpdatePayload } from '../../../../services/studentService';
import { AuthService } from '../../../../services/authService';


// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error';
interface Toast { message: string; type: ToastType; }

interface ProfileTabProps {
  student: Student;
  profileData: StudentProfile;
  /**
   * NEW unified callback — called after every successful mutation with the
   * full refreshed Student object.
   * Optional for backward compat with parents that haven't been updated yet.
   */
  onUpdate?: (updatedStudent: Student) => void;
  /**
   * @deprecated Use onUpdate. Kept so parents that still pass this prop don't break.
   * Called with the updated StudentProfile section of the student.
   */
  onUpdateProfile?: (updates: Partial<StudentProfile>) => void;
  /**
   * @deprecated Use onUpdate. Kept so parents that still pass this prop don't break.
   * Called with the full updated Student (or User) object.
   */
  onUpdateUser?: (user: User) => void;
}

// ─── Toast notification ────────────────────────────────────────────────────────

const ToastNotification: React.FC<{ toast: Toast | null }> = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-bold transition-all
      ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {toast.message}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const ProfileTab: React.FC<ProfileTabProps> = ({
  student,
  profileData,
  onUpdate,
  onUpdateProfile,
  onUpdateUser,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localData, setLocalData]   = useState<StudentProfile>(profileData);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving]     = useState<string | null>(null);
  const [toast, setToast]           = useState<Toast | null>(null);

  const [editMode, setEditMode] = useState({
    gaps: false, contact: false, moreInfo: false, address: false,
  });

  const [addrForms, setAddrForms] = useState<{
    current: AddressFormData;
    permanent: AddressFormData;
  }>({
    current:   { addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India' },
    permanent: { addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India' },
  });

  // Sync localData when parent re-renders profileData (e.g. after a save)
  useEffect(() => {
    setLocalData(profileData);
  }, [profileData]);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── propagateUpdate ─────────────────────────────────────────────────────────
  /**
   * After a successful API mutation, propagate the fresh Student object upward.
   *
   * IMPORTANT — only calls onUpdate and onUpdateUser, NOT onUpdateProfile.
   *
   * Why onUpdateProfile is intentionally excluded:
   *   The parent's handleUpdateProfile callback calls StudentService.updateStudentProfile()
   *   which hits PUT /students/profile (the legacy general-profile endpoint).
   *   That endpoint expects a StudentProfile entity shape — sending a full Student
   *   object to it returns 400. Since every save in ProfileTab already persists data
   *   via its own dedicated endpoint (PUT /address/:type, PATCH /self), triggering
   *   a second API call via onUpdateProfile is wrong and causes the 400 error seen
   *   in the console.
   *
   *   onUpdateProfile is kept in the props interface for backward compat with other
   *   parent components that may use it for local state-only updates, but ProfileTab
   *   must never call it after an API save.
   */
  const propagateUpdate = (updatedStudent: Student) => {
    if (updatedStudent.profile) {
      setLocalData(updatedStudent.profile);
    }
    if (typeof onUpdate === 'function')     onUpdate(updatedStudent);
    if (typeof onUpdateUser === 'function') onUpdateUser(updatedStudent as unknown as User);
    // NOTE: onUpdateProfile intentionally NOT called here — see comment above.
  };

  // ── Cancel edit — revert localData to last known good state ─────────────────
  const cancelEdit = (section: keyof typeof editMode) => {
    setLocalData(profileData);
    setEditMode(prev => ({ ...prev, [section]: false }));
  };

  // ─── Photo upload ────────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    try {
      const imageUrl = await AuthService.uploadAvatar(student.id, e.target.files[0], 'profiles');
      const updatedUser = { ...student, avatar: imageUrl, avatarUrl: imageUrl };
      await AuthService.updateUser(updatedUser);
      propagateUpdate(updatedUser as Student);
      showToast('Photo updated successfully', 'success');
    } catch {
      showToast('Photo upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Address ─────────────────────────────────────────────────────────────────
  /**
   * Initialise address edit forms from current localData.
   * Uses only the canonical AddressFormData fields:
   *   addressLine1, addressLine2, village, mandal, city, state, zip, country
   * These are the only fields the backend stores and returns. No legacy aliases.
   */
  const initAddressForms = () => {
    const curr = localData.currentAddress ?? {} as AddressFormData;
    const perm = localData.permanentAddress ?? {} as AddressFormData;
    setAddrForms({
      current: {
        addressLine1: curr.addressLine1 || '',
        addressLine2: curr.addressLine2 || '',
        village:      curr.village      || '',
        mandal:       curr.mandal       || '',
        city:         curr.city         || '',
        state:        curr.state        || '',
        zip:          curr.zip          || '',
        country:      curr.country      || 'India',
      },
      permanent: {
        addressLine1: perm.addressLine1 || '',
        addressLine2: perm.addressLine2 || '',
        village:      perm.village      || '',
        mandal:       perm.mandal       || '',
        city:         perm.city         || '',
        state:        perm.state        || '',
        zip:          perm.zip          || '',
        country:      perm.country      || 'India',
      },
    });
    setEditMode(prev => ({ ...prev, address: true }));
  };

  /**
   * Save both addresses.
   *
   * Sends TWO PUT requests sequentially:
   *   PUT /students/profile/address/current   { AddressFormData }
   *   PUT /students/profile/address/permanent { AddressFormData }
   *
   * Fields sent: { addressLine1, addressLine2, village, mandal, city, state, zip, country }
   * These match AddressFormData and backend AddressRequest DTO exactly.
   *
   * The second response (permanent) contains both addresses in the returned
   * Student360Response → we use it to propagate the full update.
   *
   * SECURITY: The backend validates addressType ("current" or "permanent").
   * The student's ID comes from the JWT — not the request body.
   */
  const saveAddresses = async () => {
    if (!addrForms.current.addressLine1 || !addrForms.current.city ||
        !addrForms.current.state || !addrForms.current.zip) {
      showToast('Current address is incomplete — Address Line 1, City, State and Zip are required.', 'error');
      return;
    }
    if (!addrForms.permanent.addressLine1 || !addrForms.permanent.city ||
        !addrForms.permanent.state || !addrForms.permanent.zip) {
      showToast('Permanent address is incomplete — Address Line 1, City, State and Zip are required.', 'error');
      return;
    }

    setIsSaving('address');
    try {
      // Save current address first (fire and forget — we only need the last response)
      await StudentService.updateStudentAddress(student.id, 'current', addrForms.current);
      // Save permanent address — use this response to update the whole UI
      const updatedStudent = await StudentService.updateStudentAddress(student.id, 'permanent', addrForms.permanent);
      propagateUpdate(updatedStudent);
      setEditMode(prev => ({ ...prev, address: false }));
      showToast('Addresses saved successfully', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save addresses.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(null);
    }
  };

  // ─── Contact Info ─────────────────────────────────────────────────────────────
  /**
   * Persists: communicationEmail, personalEmail, preferredContactMethod, linkedInProfile.
   *
   * Sends PATCH /students/profile/self with only the contact fields.
   * The backend StudentSelfUpdateRequest accepts all of these.
   *
   * NOTE: linkedInProfile is sent as-is. The backend maps it to
   * existing.setLinkedinProfile() (lowercase n in entity).
   * On the next getStudent360() call, mapStudent360ToStudent() normalises
   * linkedinProfile → linkedInProfile so the form stays in sync.
   */
  const saveContact = async () => {
    if (!localData.communicationEmail?.trim()) {
      showToast('Communication Email is required.', 'error');
      return;
    }
    if (!localData.personalEmail?.trim()) {
      showToast('Personal Email is required.', 'error');
      return;
    }

    setIsSaving('contact');
    try {
      const payload: StudentSelfUpdatePayload = {
        communicationEmail:     localData.communicationEmail,
        personalEmail:          localData.personalEmail,
        preferredContactMethod: localData.preferredContactMethod,
        linkedInProfile:        localData.linkedInProfile,
      };
      const updatedStudent = await StudentService.updateSelfProfile(student.id, payload);
      propagateUpdate(updatedStudent);
      setEditMode(prev => ({ ...prev, contact: false }));
      showToast('Contact info saved successfully', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save contact info.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(null);
    }
  };

  // ─── Education Gaps ───────────────────────────────────────────────────────────
  /**
   * Persists: gapInStudies, gapDuration, gapReason.
   * Sends PATCH /students/profile/self with only gap fields.
   */
  const saveGaps = async () => {
    if (localData.gapInStudies && !localData.gapDuration?.trim()) {
      showToast('Please provide the duration of your gap in studies.', 'error');
      return;
    }
    if (localData.gapInStudies && !localData.gapReason?.trim()) {
      showToast('Please provide the reason for your gap in studies.', 'error');
      return;
    }

    setIsSaving('gaps');
    try {
      const payload: StudentSelfUpdatePayload = {
        gapInStudies: localData.gapInStudies,
        gapDuration:  localData.gapDuration  || '',
        gapReason:    localData.gapReason    || '',
      };
      const updatedStudent = await StudentService.updateSelfProfile(student.id, payload);
      propagateUpdate(updatedStudent);
      setEditMode(prev => ({ ...prev, gaps: false }));
      showToast('Education gap info saved successfully', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save gap info.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(null);
    }
  };

  // ─── More Info ────────────────────────────────────────────────────────────────
  /**
   * Persists: drivingLicense, passportNumber, passportIssueDate, passportExpiryDate, dayScholar.
   *
   * passportIssueDate / passportExpiryDate are ISO-8601 date strings ("YYYY-MM-DD")
   * from the HTML date input. The backend StudentSelfUpdateRequest declares them
   * as LocalDate — Jackson deserialises ISO-8601 strings to LocalDate automatically
   * via jackson-datatype-jsr310 (bundled in Spring Boot).
   */
  const saveMoreInfo = async () => {
    setIsSaving('moreInfo');
    try {
      const payload: StudentSelfUpdatePayload = {
        drivingLicense:     localData.drivingLicense     || undefined,
        passportNumber:     localData.passportNumber     || undefined,
        passportIssueDate:  localData.passportIssueDate  || undefined,
        passportExpiryDate: localData.passportExpiryDate || undefined,
        dayScholar:         localData.dayScholar,
      };
      const updatedStudent = await StudentService.updateSelfProfile(student.id, payload);
      propagateUpdate(updatedStudent);
      setEditMode(prev => ({ ...prev, moreInfo: false }));
      showToast('More info saved successfully', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save info.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(null);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in slide-in-from-right-2">
      <ToastNotification toast={toast} />

      {/* ── Avatar + Name Banner ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row items-center gap-6">
        <div
          className="relative group cursor-pointer"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="w-24 h-24 rounded-full border-4 border-gray-50 flex items-center justify-center bg-gray-100">
              <Loader2 className="animate-spin text-blue-600" />
            </div>
          ) : (
            <img
              src={
                student.avatarUrl || student.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName || 'Student')}&background=6366f1&color=fff`
              }
              className="w-24 h-24 rounded-full border-4 border-gray-50 object-cover"
              alt="Profile"
            />
          )}
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={20} />
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900">{localData.fullName}</h2>
          <p className="text-gray-500 font-medium">
            {localData.rollNumber} • {localData.branch} • {localData.batch} Batch
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">{localData.course}</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">{localData.gender}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Official Record — READ ONLY ────────────────────────────────── */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <UserIcon size={16} /> About (Official Record)
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Row 1 */}
            <div>
              <label className="text-xs text-gray-500">Roll Number</label>
              <p className="font-bold">{localData.rollNumber || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Full Name</label>
              <p className="font-bold">{localData.fullName || '—'}</p>
            </div>
            {/* Row 2 */}
            <div>
              <label className="text-xs text-gray-500">Branch</label>
              <p className="font-bold">{localData.branch || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Course</label>
              <p className="font-bold">{localData.course || '—'}</p>
            </div>
            {/* Row 3 */}
            <div>
              <label className="text-xs text-gray-500">Passed Out Year</label>
              <p className="font-bold">{localData.batch || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Date of Birth</label>
              <p className="font-bold">{localData.dob || '—'}</p>
            </div>
            {/* Row 4 */}
            <div>
              <label className="text-xs text-gray-500">Nationality</label>
              <p className="font-bold">{localData.nationality || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Religion</label>
              <p className="font-bold">{localData.religion || '—'}</p>
            </div>
            {/* Row 5 */}
            <div>
              <label className="text-xs text-gray-500">Placement Cycle</label>
              <p className="font-bold">{localData.placementCycle || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Gender</label>
              <p className="font-bold">{localData.gender || '—'}</p>
            </div>
            {/* Row 6 — Aadhaar spans full width (12 digits need space) */}
            <div className="col-span-2 pt-1 border-t border-gray-100">
              <label className="text-xs text-gray-500">Aadhaar Number</label>
              {/*
                Triple-fallback for aadhaarNumber:
                  1. localData.aadhaarNumber  → from enrichedProfile (injected from User entity in studentService)
                  2. student.aadhaarNumber    → from ...data.user spread at Student root level (guaranteed present)
                  3. '—'                      → sentinel when genuinely not set in DB
                Why student.aadhaarNumber is the reliable fallback:
                  mapStudent360ToStudent returns { ...data.user, profile: enrichedProfile }
                  so student.aadhaarNumber = data.user.aadhaarNumber directly from the API.
                  Even if the enrichedProfile injection fails for any reason, this fallback
                  ensures the field shows if the data exists in the users table.
              */}
              <p className="font-bold font-mono text-gray-800 tracking-widest">
                {localData.aadhaarNumber || student.aadhaarNumber || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Point of Contact — READ ONLY ───────────────────────────────── */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Shield size={16} /> Student Point of Contact
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Mentor</span>
              <span className="font-bold">{localData.mentor || '—'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Advisor</span>
              <span className="font-bold">{localData.advisor || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Coordinator</span>
              <span className="font-bold">{localData.coordinator || '—'}</span>
            </div>
          </div>
        </div>

        {/* ── Education Gaps — STUDENT EDITABLE ─────────────────────────── */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
              <AlertTriangle size={16} /> Education Gaps
            </h3>
            {!editMode.gaps && (
              <button
                onClick={() => setEditMode(prev => ({ ...prev, gaps: true }))}
                className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>

          {editMode.gaps ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!localData.gapInStudies}
                  onChange={e => setLocalData(d => ({ ...d, gapInStudies: e.target.checked }))}
                />
                Any Gap in Studies?
              </label>
              {localData.gapInStudies && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-600">Duration <span className="text-red-500">*</span></label>
                    <input
                      className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 mt-1"
                      placeholder="e.g. 1 Year 3 Months"
                      value={localData.gapDuration || ''}
                      onChange={e => setLocalData(d => ({ ...d, gapDuration: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">Reason <span className="text-red-500">*</span></label>
                    <input
                      className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 mt-1"
                      placeholder="e.g. Health issues / Startup"
                      value={localData.gapReason || ''}
                      onChange={e => setLocalData(d => ({ ...d, gapReason: e.target.value }))}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => cancelEdit('gaps')}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveGaps}
                  disabled={isSaving === 'gaps'}
                  className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-60 flex items-center gap-1"
                >
                  {isSaving === 'gaps' && <Loader2 size={12} className="animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm space-y-1">
              <p>
                <span className="text-gray-500">Gap in Studies: </span>
                <span className={`font-bold ${localData.gapInStudies ? 'text-red-600' : 'text-green-600'}`}>
                  {localData.gapInStudies ? 'YES' : 'NO'}
                </span>
              </p>
              {localData.gapInStudies && (
                <>
                  <p><span className="text-gray-500">Duration: </span><span className="font-bold">{localData.gapDuration}</span></p>
                  <p><span className="text-gray-500">Reason: </span><span className="font-bold">{localData.gapReason}</span></p>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Contact Information — STUDENT EDITABLE (partial) ──────────── */}
        <div className="bg-white p-6 rounded-xl border shadow-sm row-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
              <Phone size={16} /> Contact Information
            </h3>
            {!editMode.contact && (
              <button
                onClick={() => setEditMode(prev => ({ ...prev, contact: true }))}
                className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>

          <div className="space-y-4 text-sm">
            {/* Locked / official — no edit button, no inputs */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Official / Locked</p>
                <Lock size={12} className="text-gray-400" />
              </div>
              <div className="space-y-2">
                <div><label className="text-xs text-gray-500">Institute Email</label><p className="font-bold">{localData.instituteEmail || '—'}</p></div>
                <div><label className="text-xs text-gray-500">Alternative Email</label><p className="font-bold">{localData.alternativeEmail || '—'}</p></div>
                <div><label className="text-xs text-gray-500">Phone</label><p className="font-bold">{localData.phone || '—'}</p></div>
                <div><label className="text-xs text-gray-500">WhatsApp</label><p className="font-bold">{localData.whatsappNumber || '—'}</p></div>
                <div><label className="text-xs text-gray-500">Parent Phone</label><p className="font-bold">{localData.parentPhone || '—'}</p></div>
                <div><label className="text-xs text-gray-500">Parent Email</label><p className="font-bold">{localData.parentEmail || '—'}</p></div>
              </div>
            </div>

            {/* Student editable */}
            <div className="p-1">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Student Editable</p>
              {editMode.contact ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold">Communication Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                      placeholder="your@email.com"
                      value={localData.communicationEmail || ''}
                      onChange={e => setLocalData(d => ({ ...d, communicationEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold">Personal Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                      placeholder="personal@email.com"
                      value={localData.personalEmail || ''}
                      onChange={e => setLocalData(d => ({ ...d, personalEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold">Preferred Contact Method</label>
                    <select
                      className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                      value={localData.preferredContactMethod || 'Email'}
                      onChange={e => setLocalData(d => ({ ...d, preferredContactMethod: e.target.value as any }))}
                    >
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="WhatsApp">WhatsApp</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold">LinkedIn URL</label>
                    <input
                      type="url"
                      className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={localData.linkedInProfile || ''}
                      onChange={e => setLocalData(d => ({ ...d, linkedInProfile: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => cancelEdit('contact')}
                      className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveContact}
                      disabled={isSaving === 'contact'}
                      className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-60 flex items-center gap-1"
                    >
                      {isSaving === 'contact' && <Loader2 size={12} className="animate-spin" />}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Communication Email</label>
                    <p className="font-bold">{localData.communicationEmail || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Personal Email</label>
                    <p className="font-bold">{localData.personalEmail || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Preferred Method</label>
                    <p className="font-bold">{localData.preferredContactMethod || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">LinkedIn</label>
                    {localData.linkedInProfile
                      ? <a href={localData.linkedInProfile} target="_blank" rel="noreferrer"
                           className="font-bold text-blue-600 hover:underline block truncate">
                          {localData.linkedInProfile}
                        </a>
                      : <p className="font-bold">—</p>
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── More Info — STUDENT EDITABLE ───────────────────────────────── */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
              <FileText size={16} /> More Info
            </h3>
            {!editMode.moreInfo && (
              <button
                onClick={() => setEditMode(prev => ({ ...prev, moreInfo: true }))}
                className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>

          {editMode.moreInfo ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <label className="text-xs font-bold">Driving License</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="License number"
                  value={localData.drivingLicense || ''}
                  onChange={e => setLocalData(d => ({ ...d, drivingLicense: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold">Passport Number</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Passport number"
                  value={localData.passportNumber || ''}
                  onChange={e => setLocalData(d => ({ ...d, passportNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold">Issue Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                  value={localData.passportIssueDate || ''}
                  onChange={e => setLocalData(d => ({ ...d, passportIssueDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold">Expiry Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                  value={localData.passportExpiryDate || ''}
                  onChange={e => setLocalData(d => ({ ...d, passportExpiryDate: e.target.value }))}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="day-scholar-cb"
                  checked={!!localData.dayScholar}
                  onChange={e => setLocalData(d => ({ ...d, dayScholar: e.target.checked }))}
                />
                <label htmlFor="day-scholar-cb" className="font-bold text-sm cursor-pointer">Day Scholar?</label>
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <button
                  onClick={() => cancelEdit('moreInfo')}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveMoreInfo}
                  disabled={isSaving === 'moreInfo'}
                  className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-60 flex items-center gap-1"
                >
                  {isSaving === 'moreInfo' && <Loader2 size={12} className="animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Driving License</label>
                <p className="font-bold font-mono">{localData.drivingLicense || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Passport Number</label>
                <p className="font-bold font-mono">{localData.passportNumber || 'N/A'}</p>
              </div>
              {localData.passportIssueDate && (
                <div>
                  <label className="text-xs text-gray-500">Issue Date</label>
                  <p className="font-bold">{localData.passportIssueDate}</p>
                </div>
              )}
              {localData.passportExpiryDate && (
                <div>
                  <label className="text-xs text-gray-500">Expiry Date</label>
                  <p className="font-bold">{localData.passportExpiryDate}</p>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500">Day Scholar</label>
                <p className="font-bold">{localData.dayScholar ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Address Details — STUDENT EDITABLE ────────────────────────── */}
        <div className="bg-white p-6 rounded-xl border shadow-sm md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
              <MapPin size={16} /> Address Details
            </h3>
            {!editMode.address && (
              <button onClick={initAddressForms} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded">
                <Edit2 size={16} />
              </button>
            )}
          </div>

          {editMode.address ? (
            <div className="space-y-6 relative">
              <AddressForm
                title="Current Address"
                data={addrForms.current}
                onChange={d => setAddrForms(prev => ({ ...prev, current: d }))}
              />
              <AddressForm
                title="Permanent Address"
                data={addrForms.permanent}
                onChange={d => setAddrForms(prev => ({ ...prev, permanent: d }))}
                onCopy={() => setAddrForms(prev => ({ ...prev, permanent: { ...prev.current } }))}
                copyLabel="Same as Current"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditMode(prev => ({ ...prev, address: false }))}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAddresses}
                  disabled={isSaving === 'address'}
                  className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-60 flex items-center gap-1"
                >
                  {isSaving === 'address' && <Loader2 size={12} className="animate-spin" />}
                  Save Addresses
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {/* Current */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h4 className="font-bold text-gray-400 text-xs uppercase mb-2">Current Address</h4>
                <p className="font-bold text-gray-800">
                  {localData.currentAddress?.addressLine1 || (localData.currentAddress as any)?.fullAddress || '—'}
                </p>
                {localData.currentAddress?.addressLine2 && (
                  <p className="text-gray-600 text-xs">{localData.currentAddress.addressLine2}</p>
                )}
                <p className="text-gray-500 mt-1">
                  {[
                    localData.currentAddress?.village,
                    localData.currentAddress?.mandal,
                    localData.currentAddress?.city,
                  ].filter(Boolean).join(', ')}
                </p>
                <p className="text-gray-500">
                  {[
                    localData.currentAddress?.state,
                    localData.currentAddress?.zip || (localData.currentAddress as any)?.pinCode,
                    localData.currentAddress?.country,
                  ].filter(Boolean).join(' — ')}
                </p>
              </div>
              {/* Permanent */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h4 className="font-bold text-gray-400 text-xs uppercase mb-2">Permanent Address</h4>
                <p className="font-bold text-gray-800">
                  {localData.permanentAddress?.addressLine1 || (localData.permanentAddress as any)?.fullAddress || '—'}
                </p>
                {localData.permanentAddress?.addressLine2 && (
                  <p className="text-gray-600 text-xs">{localData.permanentAddress.addressLine2}</p>
                )}
                <p className="text-gray-500 mt-1">
                  {[
                    localData.permanentAddress?.village,
                    localData.permanentAddress?.mandal,
                    localData.permanentAddress?.city,
                  ].filter(Boolean).join(', ')}
                </p>
                <p className="text-gray-500">
                  {[
                    localData.permanentAddress?.state,
                    localData.permanentAddress?.zip || (localData.permanentAddress as any)?.pinCode,
                    localData.permanentAddress?.country,
                  ].filter(Boolean).join(' — ')}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};