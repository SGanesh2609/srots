
// import React, { useState, useEffect } from 'react';
// import { CollegeService } from '../../services/collegeService';
// import { User, DashboardMetrics, Role } from '../../types';

// import { CompaniesSection } from '../../components/global/CompaniesSection';
// import { FreeCoursesSection } from '../../components/global/FreeCoursesSection';
// import { AboutCollegeComponent } from '../../components/colleges/shared/AboutCollegeComponent';
// import { PostsSection } from '../../components/colleges/shared/posts/PostsSection';
// import { AnalyticsDashboard } from '../../components/colleges/cp-portal/admin/AnalyticsDashboard';
// import { JobsSection } from '../../components/colleges/cp-portal/jobs/JobsSection';
// import { CalendarView } from '../../components/colleges/shared/CalendarView';
// import { StudentDirectory } from '../../components/colleges/cp-portal/students/StudentDirectory';
// import { CP_ProfileSection } from '../../components/colleges/cp-portal/CP_ProfileSection';
// import { ManageTeam } from '../../components/colleges/cp-portal/admin/ManageTeam';

// interface CPUserPortalProps {
//   view: string;
//   user?: User;
//   onUpdateUser?: (user: User) => void;
// }

// export const CPUserPortal: React.FC<CPUserPortalProps> = ({ view, user, onUpdateUser }) => {
//   const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

//   useEffect(() => {
//       // 5-Tier Sync: Only fetch metrics for Head role
//       if (view === 'analytics' && user?.collegeId && user.role === Role.CPH) {
//           const fetchMetrics = async () => {
//               try {
//                   const data = await CollegeService.getDashboardMetrics(user.collegeId!);
//                   setMetrics(data);
//               } catch (error) {
//                   console.error("Failed to fetch dashboard metrics", error);
//               }
//           };
//           fetchMetrics();
//       }
//   }, [view, user?.collegeId, user?.role]);

//   return (
//     <>
//       {view === 'jobs' && <JobsSection user={user!} />}
//       {view === 'calendar' && <CalendarView user={user!} />}
//       {view === 'companies' && <CompaniesSection user={user!} />}
//       {view === 'free-courses' && <FreeCoursesSection user={user!} />}
//       {view === 'students' && <StudentDirectory user={user!} />}
//       {view === 'posts' && <PostsSection user={user!} />}
//       {view === 'cms-college' && <AboutCollegeComponent user={user!} />}
      
//       {view === 'profile' && user && (
//           <CP_ProfileSection user={user} onUpdateUser={onUpdateUser} />
//       )}
      
//       {/* CPH Specific Guards */}
//       {view === 'team' && (
//           user?.role === Role.CPH 
//             ? <ManageTeam user={user} /> 
//             : <div className="p-8 text-center bg-white rounded-xl border border-red-100 text-red-500 font-bold shadow-sm">Access Denied: Team management is reserved for the College Placement Head.</div>
//       )}
      
//       {view === 'analytics' && (
//           user?.role === Role.CPH 
//             ? (metrics ? <AnalyticsDashboard metrics={metrics} /> : <div className="p-8 text-center text-gray-500">Loading placement data...</div>)
//             : <div className="p-8 text-center bg-white rounded-xl border border-red-100 text-red-500 font-bold shadow-sm">Access Denied: Analytics are restricted to the College Placement Head.</div>
//       )}
//     </>
//   );
// };


import React, { useState, useEffect } from 'react';
import { CollegeService } from '../../services/collegeService';
import { User, DashboardMetrics, Role } from '../../types';

import { CompaniesSection } from '../../components/global/CompaniesSection';
import { FreeCoursesSection } from '../../components/global/FreeCoursesSection';
import { AboutCollegeComponent } from '../../components/colleges/shared/AboutCollegeComponent';
import { PostsSection } from '../../components/colleges/shared/posts/PostsSection';
import { AnalyticsDashboard } from '../../components/colleges/cp-portal/admin/AnalyticsDashboard';
import { JobsSection } from '../../components/colleges/cp-portal/jobs/JobsSection';
import { CalendarView } from '../../components/colleges/shared/CalendarView';
import { StudentDirectory } from '../../components/colleges/cp-portal/students/StudentDirectory';
import { CP_ProfileSection } from '../../components/colleges/cp-portal/CP_ProfileSection';
import { ManageTeam } from '../../components/colleges/cp-portal/admin/ManageTeam';

interface CPUserPortalProps {
  view: string;
  user?: User;
  onUpdateUser?: (user: User) => void;
}

export const CPUserPortal: React.FC<CPUserPortalProps> = ({ view, user, onUpdateUser }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    if (view === 'analytics' && user?.collegeId && user.role === Role.CPH) {
      const fetchMetrics = async () => {
        try {
          // Real call (uncomment when backend ready)
          // const data = await CollegeService.getDashboardMetrics(user.collegeId!);
          // setMetrics(data);

          // Dummy data for now
          setMetrics({
            stats: {
              placedCount: 120,
              totalStudents: 450,
              activeJobs: 35,
              participatingCompanies: 85,
            },
            branchDistribution: [
              { name: 'CSE', count: 180 },
              { name: 'ECE', count: 120 },
              { name: 'MECH', count: 80 },
              { name: 'CIVIL', count: 70 },
            ],
            placementProgress: [
              { name: '2023', placed: 95 },
              { name: '2024', placed: 110 },
              { name: '2025', placed: 120 },
            ],
            jobTypeDistribution: [
              { name: 'Full-Time', value: 70 },
              { name: 'Internship', value: 20 },
              { name: 'Freelance', value: 10 },
            ],
            recentJobs: [], // Add dummy jobs if needed
          });
        } catch (error) {
          console.error("Failed to fetch dashboard metrics", error);
          // Dummy fallback
          setMetrics({
            stats: { placedCount: 0, totalStudents: 0, activeJobs: 0, participatingCompanies: 0 },
            branchDistribution: [],
            placementProgress: [],
            jobTypeDistribution: [],
            recentJobs: [],
          });
        }
      };
      fetchMetrics();
    }
  }, [view, user?.collegeId, user?.role]);

  return (
    <>
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
          ? <ManageTeam user={user} /> 
          : <div className="p-8 text-center bg-white rounded-xl border border-red-100 text-red-500 font-bold shadow-sm">Access Denied: Team management is reserved for the College Placement Head.</div>
      )}
      
      {view === 'analytics' && (
        user?.role === Role.CPH 
          ? (metrics ? <AnalyticsDashboard metrics={metrics} /> : <div className="p-8 text-center text-gray-500">Loading placement data...</div>)
          : <div className="p-8 text-center bg-white rounded-xl border border-red-100 text-red-500 font-bold shadow-sm">Access Denied: Analytics are restricted to the College Placement Head.</div>
      )}
    </>
  );
};