import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/colleges/shared/ui/Layout';
import { AdminPortal } from './pages/srots-user/AdminPortal';
import { CPUserPortal } from './pages/cp-user/CPUserPortal';
import { StudentPortal } from './pages/student/StudentPortal';
import { Role, User } from './types';
import { 
  Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, 
  UserCheck, GraduationCap, Terminal, Zap, ArrowLeft, Send, CheckCircle
} from 'lucide-react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { login, logout, updateUser } from './store/slices/authSlice';
import { Modal } from './components/common/Modal';
import { AuthService } from './services/authService';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, loading: authLoading, error: authError } = useAppSelector(state => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // ────────────────────────────────────────────────
  // Force logout + redirect if token is missing on mount/refresh
  // This prevents blank screen or stale protected pages
  // ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('SROTS_AUTH_TOKEN');
    
    // If no token but Redux thinks user is logged in → force logout
    if (!token && currentUser) {
      console.warn('No token found but user in Redux → forcing logout');
      dispatch(logout());
      navigate('/login', { replace: true });
    }
    
    // If token exists but no user in Redux → try to restore (optional)
    if (token && !currentUser && !authLoading) {
      console.warn('Token exists but no user in Redux → redirect to login to re-auth');
      navigate('/login', { replace: true });
    }
  }, [currentUser, authLoading, dispatch, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    dispatch(login({ username, password }) as any);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsForgotSubmitting(true);
    try {
      await AuthService.forgotPassword(forgotEmail);
      setForgotSuccess(true);
    } catch (err) {
      alert("Failed to send reset link. Please check the email address.");
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const quickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setTimeout(() => {
      dispatch(login({ username: u, password: p }) as any);
    }, 50);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  // Default dashboard per role
  const getDefaultDashboard = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
      case Role.SROTS_DEV:
        return '/admin/profile';
      case Role.STUDENT:
        return '/student/jobs';
      case Role.CPH:
      case Role.STAFF:
        return '/cp/jobs';
      default:
        return '/login';
    }
  };

  // Protected Route: checks BOTH user in Redux AND token in storage
  const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: Role[] }) => {
    const token = localStorage.getItem('SROTS_AUTH_TOKEN');

    if (!currentUser || !token) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  };

  // ────────────────────────────────────────────────
  // If no user → ALWAYS show login UI (prevents blank screen)
  // ────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 mb-8">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-black text-blue-600 tracking-tighter">Srots</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Campus Placement Engine</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Identity Access</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username or Institutional Email"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                    disabled={authLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-slate-500 uppercase">Secure Pin</label>
                  <button 
                    type="button"
                    onClick={() => { setShowForgotModal(true); setForgotSuccess(false); setForgotEmail(''); }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                    disabled={authLoading}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs text-center font-bold border border-red-100 animate-in fade-in slide-in-from-top-1">
                  {authError}
                </div>
              )}

              <button 
                type="submit"
                disabled={authLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                {authLoading ? <Loader2 size={20} className="animate-spin" /> : "Authorize Access"}
              </button>
            </form>
          </div>

          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-3">
            <button onClick={() => quickLogin('srots_admin', 'Srots_admin@8847')} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-lg border border-blue-500 flex flex-col items-center gap-2 transition-all active:scale-95">
              <ShieldCheck size={24} />
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Super Admin</span>
            </button>
            
            <button onClick={() => quickLogin('DEV_Praveen', 'DEV_PRAVEEN@8847')} className="bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center gap-2 transition-all active:scale-95">
              <Terminal size={24} />
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Srots Dev</span>
            </button>

            <button onClick={() => quickLogin('SRM_CPADMIN_rajesh_tpo', 'SRM_CPADMIN_rajesh_tpo@5678')} className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-2xl shadow-lg border border-purple-500 flex flex-col items-center gap-2 transition-all active:scale-95">
              <UserCheck size={24} />
              <span className="text-[10px] font-black uppercase whitespace-nowrap">College Head</span>
            </button>

            <button onClick={() => quickLogin('STAFF.78234', 'admin')} className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-2xl shadow-lg border border-indigo-400 flex flex-col items-center gap-2 transition-all active:scale-95">
              <Zap size={24} />
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Staff</span>
            </button>

            <button onClick={() => quickLogin('SRM_21701A0501', 'SRM_21701A0501_9012')} className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-2xl shadow-lg border border-green-500 flex flex-col items-center gap-2 transition-all active:scale-95">
              <GraduationCap size={24} />
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Student</span>
            </button>
          </div>
          
          <Modal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} title="Account Recovery" maxWidth="max-w-sm">
            <div className="p-8">
              {forgotSuccess ? (
                <div className="text-center space-y-4 animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Link Sent!</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We've sent a password reset link to <span className="font-bold text-gray-800">{forgotEmail}</span>. Please check your inbox.
                  </p>
                  <button onClick={() => setShowForgotModal(false)} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-6">
                  <div className="text-center mb-2">
                    <p className="text-sm text-gray-500">Enter your institutional email address to recover your account.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Registered Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500" size={18} />
                      <input 
                        type="email" 
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                        placeholder="name@college.edu"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      type="submit"
                      disabled={isForgotSubmitting}
                      className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      {isForgotSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      Send Reset Link
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="w-full py-3 bg-white text-gray-500 font-bold hover:text-gray-700 flex items-center justify-center gap-1 text-sm"
                    >
                      <ArrowLeft size={16} /> Back to Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Modal>
        </div>
      </ErrorBoundary>
    );
  }

  // ────────────────────────────────────────────────
  // Logged-in user → protected routes
  // ────────────────────────────────────────────────
  return (
    <ErrorBoundary>
      <Routes>
        {/* Root → go to dashboard */}
        <Route path="/" element={<Navigate to={getDefaultDashboard(currentUser.role)} replace />} />

        {/* Login → redirect to dashboard if logged in */}
        <Route path="/login" element={<Navigate to={getDefaultDashboard(currentUser.role)} replace />} />

        {/* Admin / SROTS_DEV */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={[Role.ADMIN, Role.SROTS_DEV]}>
            <Layout 
              user={currentUser} 
              onNavigate={(view) => navigate(`/admin/${view}`)} 
              currentView={location.pathname.split('/').pop() || 'profile'}
              onLogout={handleLogout}
            >
              <AdminPortal 
                view={location.pathname.split('/').pop() || 'profile'} 
                user={currentUser} 
                onUpdateUser={(u) => dispatch(updateUser(u))} 
              />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Student */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={[Role.STUDENT]}>
            <Layout 
              user={currentUser} 
              onNavigate={(view) => navigate(`/student/${view}`)} 
              currentView={location.pathname.split('/').pop() || 'jobs'}
              onLogout={handleLogout}
            >
              <StudentPortal 
                view={location.pathname.split('/').pop() || 'jobs'} 
                student={currentUser as any} 
                onUpdateUser={(u) => dispatch(updateUser(u))} 
              />
            </Layout>
          </ProtectedRoute>
        } />

        {/* CP / Staff */}
        <Route path="/cp/*" element={
          <ProtectedRoute allowedRoles={[Role.CPH, Role.STAFF]}>
            <Layout 
              user={currentUser} 
              onNavigate={(view) => navigate(`/cp/${view}`)} 
              currentView={location.pathname.split('/').pop() || 'jobs'}
              onLogout={handleLogout}
            >
              <CPUserPortal 
                view={location.pathname.split('/').pop() || 'jobs'} 
                user={currentUser} 
                onUpdateUser={(u) => dispatch(updateUser(u))} 
              />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center text-2xl font-bold text-red-600">Access Denied</div>} />
        <Route path="*" element={<Navigate to={getDefaultDashboard(currentUser.role)} replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;