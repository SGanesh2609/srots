import React, { useState, useEffect } from 'react';
import { CollegeService } from '../../services/collegeService';
import { User, Role } from '../../types';

import { CompaniesSection } from '../../components/global/CompaniesSection';
import { FreeCoursesSection } from '../../components/global/FreeCoursesSection';
import { AboutCollegeComponent } from '../../components/colleges/shared/AboutCollegeComponent';
import { PostsSection } from '../../components/colleges/shared/posts/PostsSection';
import { AnalyticsDashboard } from '../../components/colleges/cp-portal/admin/AnalyticsDashboard';
import { JobsSection } from '../../components/colleges/cp-portal/jobs/JobsSection';
import { CalendarView } from '../../components/colleges/shared/CalendarView';
import { StudentDirectory } from '../../components/colleges/cp-portal/students/StudentDirectory';
import { CP_ProfileSection } from '../../components/colleges/cp-portal/CP_ProfileSection';
import { CPTeamManagement } from '../../components/global/CPTeamManagement';

interface CPUserPortalProps {
  view: string;
  user?: User;
  onUpdateUser?: (user: User) => void;
}

export const CPUserPortal: React.FC<CPUserPortalProps> = ({ view, user, onUpdateUser }) => {
  return (
    <>
      {/* Unknown view → default to jobs */}
      {!['jobs','calendar','companies','free-courses','students','posts','cms-college','profile','team','analytics'].includes(view) && <JobsSection user={user!} />}
      {view === 'jobs' && <JobsSection user={user!} />}
      {view === 'calendar' && <CalendarView user={user!} />}
      {view === 'companies' && <CompaniesSection user={user!} />}
      {view === 'free-courses' && <FreeCoursesSection user={user!} />}
      {view === 'students' && <StudentDirectory user={user!} />}
      {view === 'posts' && <PostsSection user={user!} />}
      {view === 'cms-college' && <AboutCollegeComponent user={user!} />}

      {view === 'profile' && user && (
        <CP_ProfileSection user={user} onUpdateUser={onUpdateUser} />
      )}

      {view === 'team' && (
        user?.role === Role.CPH
          ? <CPTeamManagement mode="cph" user={user} />
          : <div className="p-8 text-center bg-white rounded-xl border border-red-100 text-red-500 font-bold shadow-sm">Access Denied: Team management is reserved for the College Placement Head.</div>
      )}

      {view === 'analytics' && (
        user?.role === Role.CPH
          ? <AnalyticsDashboard />
          : <div className="p-8 text-center bg-white rounded-xl border border-red-100 text-red-500 font-bold shadow-sm">Access Denied: Analytics are restricted to the College Placement Head.</div>
      )}
    </>
  );
};