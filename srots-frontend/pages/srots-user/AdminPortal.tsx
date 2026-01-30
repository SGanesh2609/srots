
import React from 'react';
import { User, Role } from '../../types';

import { UserProfile } from '../../components/srots-portal/shared/UserProfile';
import { SrotsTeam } from '../../components/srots-portal/shared/SrotsTeam';
import { CompaniesSection } from '../../components/global/CompaniesSection';
import { FreeCoursesSection } from '../../components/global/FreeCoursesSection';
import { AboutSrots } from '../../components/srots-portal/shared/AboutSrots';

import { AdminAnalytics } from '../../components/srots-portal/srots-admin/AdminAnalytics';
import { CMSManagement } from '../../components/srots-portal/srots-admin/cms/CMSManagement';

/**
 * Component Name: AdminPortal
 * Directory: pages/srots-user/AdminPortal.tsx
 */

interface AdminPortalProps {
  view: string;
  user?: User;
  onUpdateUser?: (user: User) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ view, user, onUpdateUser }) => {
  if (!user) return <div className="p-8 text-center text-gray-500">Loading Authenticated Profile...</div>;

  const isSrotsAuthority = user.role === Role.ADMIN || user.role === Role.SROTS_DEV;

  const renderContent = () => {
    switch (view) {
      case 'profile':
        return <UserProfile user={user} onUpdateUser={onUpdateUser} />;
      case 'srots-team':
        return <SrotsTeam user={user} />;
      case 'companies':
        return <CompaniesSection user={user} />;
      case 'free-courses':
        return <FreeCoursesSection user={user} />;
      case 'about-srots':
        return <AboutSrots user={user} />;

      // Shared Tier for Srots Authorities
      case 'cms':
        return isSrotsAuthority
            ? <CMSManagement user={user} /> 
            : <div className="p-12 text-center bg-white border border-red-100 rounded-2xl shadow-sm text-red-600 font-bold">Access Denied: You do not have CMS modification privileges.</div>;
      
      // Access updated: Allowed for both ADMIN and SROTS_DEV
      case 'analytics':
        return isSrotsAuthority 
            ? <AdminAnalytics /> 
            : <div className="p-12 text-center bg-white border border-red-100 rounded-2xl shadow-sm text-red-600 font-bold">Access Denied: Platform Analytics are restricted.</div>;

      default:
        return <UserProfile user={user} onUpdateUser={onUpdateUser} />;
    }
  };

  return <div className="w-full h-full">{renderContent()}</div>;
};
