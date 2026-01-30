
import React from 'react';
import { DashboardMetrics } from '../../../../types';
import { Briefcase, Users, Award, Building, Activity } from 'lucide-react';

// Sub-components
import { AnalyticsStatsGrid } from './analytics/AnalyticsStatsGrid';
import { AnalyticsChartsRow } from './analytics/AnalyticsChartsRow';
import { AnalyticsRecentJobs } from './analytics/AnalyticsRecentJobs';
import { AnalyticsJobTypePie } from './analytics/AnalyticsJobTypePie';

/**
 * Component Name: AnalyticsDashboard
 * Directory: components/colleges/cp-portal/admin/AnalyticsDashboard.tsx
 * 
 * Functionality:
 * - Provides visual insights into the placement process.
 * - **Metrics**: Receives calculated stats from parent (via DataService/Backend).
 * - **Charts**: Displays Student Distribution, Placement Progress, and Job Types.
 * - **Recent Activity**: Lists recent job postings.
 * 
 * Used In: CPUserPortal (Analytics View - Admin Only)
 */

interface AnalyticsDashboardProps {
  metrics: DashboardMetrics;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ metrics }) => {
  // Safety guard for malformed props
  const stats = metrics?.stats || { placedCount: 0, totalStudents: 0, activeJobs: 0, participatingCompanies: 0 };
  const branchDistribution = metrics?.branchDistribution || [];
  const placementProgress = metrics?.placementProgress || [];
  const jobTypeDistribution = metrics?.jobTypeDistribution || [];
  const recentJobs = metrics?.recentJobs || [];

  const statItems = [
      { label: 'Placed Students', value: (stats.placedCount || 0).toString(), change: 'Live', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Students', value: (stats.totalStudents || 0).toString(), change: 'Total', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Active Jobs', value: (stats.activeJobs || 0).toString(), change: 'Open', icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Participating Companies', value: (stats.participatingCompanies || 0).toString(), change: 'Active', icon: Building, color: 'text-orange-600', bg: 'bg-orange-50' }
  ];

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#10b981'];

  return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h2 className="text-2xl font-bold text-gray-800">Placement Analytics</h2>
                  <p className="text-sm text-gray-500">Real-time insights into campus recruitment performance.</p>
              </div>
              <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <Activity size={14}/> Live Data
                  </span>
              </div>
          </div>

          {/* Stats Grid */}
          <AnalyticsStatsGrid stats={statItems} />

          {/* Charts Row 1 */}
          <AnalyticsChartsRow branchData={branchDistribution} progressData={placementProgress} />

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnalyticsRecentJobs jobs={recentJobs} />
              <AnalyticsJobTypePie data={jobTypeDistribution} colors={COLORS} />
          </div>
      </div>
  );
};
