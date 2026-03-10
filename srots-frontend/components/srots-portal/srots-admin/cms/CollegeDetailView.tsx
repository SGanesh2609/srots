import React, { useState, useRef, useEffect } from 'react';
import { College, User } from '../../../../types';
import { CollegeService } from '../../../../services/collegeService';
import { ResourceService } from '../../../../services/resourceService';
import { Camera, Building, Loader2, ArrowLeft, CreditCard } from 'lucide-react';
import { CollegeLogo } from '../../../../components/common/CollegeLogo';
import { GlobalStudentDirectory } from '../../../global/StudentDirectory';
import { CPUsersData } from './CPUsersData';
import { ManagingStudentAccounts } from '../../../global/ManagingStudentAccounts';
import { PaymentManagement } from './PaymentManagement';

interface CollegeDetailViewProps {
  college: College;
  onBack: () => void;
  onRefresh: () => void;
  currentUser: User;
}

type CmsTab = 'students' | 'cp_admin' | 'accounts' | 'payments';

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ loading: boolean; value: number; label: string; color: string }> = ({
  loading, value, label, color,
}) => (
  <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center min-w-0">
    {loading ? (
      <Loader2 className="animate-spin text-gray-400" size={20} />
    ) : (
      <>
        <p className={`text-2xl sm:text-3xl font-bold ${color} leading-none`}>{value}</p>
        <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mt-1 text-center">{label}</p>
      </>
    )}
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export const CollegeDetailView: React.FC<CollegeDetailViewProps> = ({
  college, onBack, onRefresh, currentUser,
}) => {
  const [cmsTab, setCmsTab] = useState<CmsTab>('students');
  const [stats, setStats] = useState({ studentCount: 0, cpCount: 0, totalJobs: 0, activeJobs: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadStats(); }, [college.id]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await CollegeService.getCollegeStats(college.id);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIsUploading(true);
      try {
        const file = e.target.files[0];
        const newLogoUrl = await ResourceService.uploadFile(file);
        await CollegeService.updateCollege({ ...college, logo: newLogoUrl } as any);
        onRefresh();
      } catch {
        alert('Logo upload failed');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const tabs: { key: CmsTab; label: string; icon?: React.ReactNode }[] = [
    { key: 'students', label: 'Student Directory' },
    { key: 'cp_admin', label: 'CP Admins & Staff' },
    { key: 'accounts', label: 'Risk & Account Management' },
    { key: 'payments', label: 'Payment Management', icon: <CreditCard size={13} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden animate-in fade-in slide-in-from-right-4">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-6 border-b bg-gray-50">

        {/* Top row: back + logo + title */}
        <div className="flex items-start gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 shrink-0 mt-0.5"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Logo with upload overlay */}
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => !isUploading && logoInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            ) : (
              // CollegeLogo handles broken URLs — onError shows initial letter
              <CollegeLogo src={college.logoUrl} name={college.name} size="lg" />
            )}
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
              <Camera className="text-white" size={20} />
            </div>
          </div>
          <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />

          {/* College name + meta */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">{college.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 flex-wrap">
              <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-bold text-xs sm:text-sm">
                {college.code}
              </span>
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <Building size={13} /> {college.type || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row — always 3-column grid, responsive sizing */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
          <StatCard loading={loadingStats} value={stats.studentCount} label="Students"    color="text-blue-600"   />
          <StatCard loading={loadingStats} value={stats.cpCount}      label="CP Users"    color="text-purple-600" />
          <StatCard loading={loadingStats} value={stats.activeJobs}   label="Active Jobs" color="text-green-600"  />
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex border-b px-2 sm:px-6 bg-white sticky top-0 z-10 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setCmsTab(tab.key)}
            className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              cmsTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-6">
        {cmsTab === 'students' && (
          <GlobalStudentDirectory collegeId={college.id} isSrotsAdmin={true} onRefresh={loadStats} />
        )}
        {cmsTab === 'cp_admin' && (
          <CPUsersData
            collegeId={college.id}
            collegeCode={college.code}
            collegeName={college.name}
            onRefresh={loadStats}
            currentUser={currentUser}
          />
        )}
        {cmsTab === 'accounts' && (
          <ManagingStudentAccounts collegeId={college.id} onRefresh={loadStats} isSrotsAdmin={true} />
        )}
        {cmsTab === 'payments' && (
          <PaymentManagement collegeId={college.id} collegeName={college.name} />
        )}
      </div>
    </div>
  );
};