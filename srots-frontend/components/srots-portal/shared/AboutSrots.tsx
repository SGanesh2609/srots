
import React, { useRef, useState, useEffect } from 'react';
import { User, Role } from '../../../types';
import { Camera, Shield, Building, CheckCircle, Users, Clock, Download } from 'lucide-react';
import { CompanyService } from '../../../services/companyService';

interface AboutSrotsProps {
  user: User;
}

export const AboutSrots: React.FC<AboutSrotsProps> = ({ user }) => {
  const [stats, setStats] = useState({ colleges: 0, students: 0, jobs: 0 });

  useEffect(() => {
      const fetchAnalytics = async () => {
          try {
              const analytics = await CompanyService.getSystemAnalytics();
              if (analytics && analytics.stats) {
                  setStats({
                      colleges: analytics.stats.totalColleges || 0,
                      students: analytics.stats.activeStudents || 0,
                      jobs: analytics.stats.totalJobs || 0 
                  });
              }
          } catch (e) {
              console.error("Failed to load platform stats");
          }
      };
      fetchAnalytics();
  }, []);
  
  return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header Profile Card */}
          <div className="bg-white p-8 rounded-xl shadow-sm border flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0D8ABC&color=fff&size=128`} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-md object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold border-2 border-white uppercase tracking-wider">
                      {user.role === Role.ADMIN ? 'Admin' : 'Developer'}
                  </span>
              </div>
              <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                  <p className="text-gray-500 font-medium">Srots - Campus Placement Platform Authority</p>
                  <p className="text-xs text-gray-400 mt-1">Platform Version: 2.5.0-RBAC</p>
              </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Building className="text-blue-600" size={24} /> Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg italic">
                  "Empowering educational institutions with a secure, 100% white-labeled ecosystem for seamless student placements and corporate relations."
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                  { title: 'Zero Manual Entry', desc: 'Srots Admins create all accounts via secure bulk processing. No self-registration risk.', icon: Shield },
                  { title: 'White-Label Branding', desc: 'Every college gets its own theme, custom About page, and private social feed.', icon: Building },
                  { title: 'Eligibility Engine', desc: 'Smart filtering prevents ineligible students from applying to restrictive job roles.', icon: CheckCircle },
                  { title: '5-Tier Hierarchy', desc: 'Granular access from Super Admin to Student, ensuring data security at every layer.', icon: Users },
                  { title: 'Lifecycle Tracking', desc: 'Automated 18-month student premium access with grace period and renewal workflows.', icon: Clock },
                  { title: 'Enterprise Exports', desc: 'Generate placement-ready Excel sheets with embedded resume links and profile data.', icon: Download }
              ].map((feat, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                          <feat.icon size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{feat.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
                  </div>
              ))}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                  <p className="text-4xl font-extrabold text-blue-600 mb-1">{stats.colleges}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Institutes</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
                  <p className="text-4xl font-extrabold text-purple-600 mb-1">{stats.students}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Students</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm">
                  <p className="text-4xl font-extrabold text-green-600 mb-1">{stats.jobs}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Jobs Posted</p>
              </div>
          </div>
      </div>
  );
};
