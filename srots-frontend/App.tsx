import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/colleges/shared/ui/Layout';
import { AdminPortal } from './pages/srots-user/AdminPortal';
import { CPUserPortal } from './pages/cp-user/CPUserPortal';
import { StudentPortal } from './pages/student/StudentPortal';
import { Role, User } from './types';
import {
  Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck,
  UserCheck, GraduationCap, Terminal, Zap, ArrowLeft, Send, CheckCircle,
  Clock, XCircle, AlertCircle, CreditCard, Star, Upload, Diamond,
} from 'lucide-react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { login, logout, updateUser } from './store/slices/authSlice';
import { Modal } from './components/common/Modal';
import { AuthService } from './services/authService';
import {
  PremiumService,
  PremiumAccessError,
  PremiumAccessStatus,
  PremiumAccessState,
  PREMIUM_PLANS,
  PremiumMonthsKey,
} from './services/premiumService';

// ─── Replace these two constants with your actual UPI details ─────────────────
const UPI_QR_IMAGE_PATH = '/upi-scanner.png'; // path to your QR image in /public
const UPI_ID            = 'yourname@upi';     // your actual UPI ID

// ─────────────────────────────────────────────────────────────────────────────
// PremiumPaymentPage
// Shown when student's premium is EXPIRED or REJECTED.
// Has full payment form: plan selector + pricing table + QR + UTR + screenshot.
// ─────────────────────────────────────────────────────────────────────────────
const PremiumPaymentPage: React.FC<{
  accessState:      PremiumAccessState;
  message:          string;
  rejectionReason?: string | null;
  username:         string;
  onLogout:         () => void;
}> = ({ accessState, message, rejectionReason, username, onLogout }) => {

  const [selectedPlanKey,   setSelectedPlanKey]   = useState<PremiumMonthsKey | null>(null);
  const [utrNumber,         setUtrNumber]         = useState('');
  const [usernameField,     setUsernameField]     = useState(username);
  const [screenshot,        setScreenshot]        = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting,        setSubmitting]        = useState(false);
  const [submitted,         setSubmitted]         = useState(false);
  const [formError,         setFormError]         = useState('');

  const selectedPlan = PREMIUM_PLANS.find(p => p.key === selectedPlanKey) ?? null;

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = ev => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!selectedPlanKey || !selectedPlan) return setFormError('Please select a plan.');
    if (!utrNumber.trim())                 return setFormError('Please enter the UTR / Transaction ID.');
    if (!usernameField.trim())             return setFormError('Please confirm your username.');
    if (!screenshot)                       return setFormError('Please upload the payment screenshot.');

    setSubmitting(true);
    try {
      await PremiumService.submitPayment(
        utrNumber.trim(),
        selectedPlanKey,
        selectedPlan.amount,
        usernameField.trim(),
        screenshot,
      );
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen after submission ──────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Your payment is under review by the SROTS team. You'll receive an email once verified.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700">
            ⏳ Our team usually verifies within a few hours. Please wait for the email confirmation.
          </div>
          <button onClick={onLogout}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Payment form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Diamond size={14} /> SROTS Premium
          </div>
          <h1 className="text-3xl font-black text-gray-900">Renew Your Subscription</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Complete payment below to regain access to SROTS.</p>
        </div>

        {/* Status banner */}
        {accessState === 'REJECTED' ? (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
            <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-red-800">Previous Payment Rejected</p>
              <p className="text-sm text-red-700 mt-0.5">{message}</p>
              {rejectionReason && (
                <p className="text-sm text-red-600 font-semibold mt-1">Reason: {rejectionReason}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-blue-800">Premium Subscription Required</p>
              <p className="text-sm text-blue-700 mt-0.5">{message}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          {/* ── LEFT: Plan selector + QR ── */}
          <div className="space-y-5">

            {/* Plan selection */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star size={18} className="text-yellow-500" /> Choose Your Plan
              </h3>
              <div className="space-y-2.5">
                {PREMIUM_PLANS.map(plan => {
                  const isSelected = selectedPlanKey === plan.key;
                  return (
                    <button key={plan.key} onClick={() => setSelectedPlanKey(plan.key)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{plan.label}</span>
                          {plan.popular && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xl font-black ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                        ₹{plan.amount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Pricing table */}
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-black text-gray-500 uppercase">Plan</th>
                      <th className="text-right px-3 py-2 text-xs font-black text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {PREMIUM_PLANS.map(p => (
                      <tr key={p.key}>
                        <td className="px-3 py-2 text-gray-700">{p.label}</td>
                        <td className="px-3 py-2 text-right font-black text-gray-900">₹{p.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QR scanner */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-500" /> Scan & Pay
              </h3>
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 border-2 border-dashed border-blue-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img src={UPI_QR_IMAGE_PATH} alt="UPI QR Code" className="w-full h-full object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-700">UPI ID</p>
                <p className="text-blue-600 font-mono font-bold">{UPI_ID}</p>
                {selectedPlan && (
                  <div className="mt-3 w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-700">
                      Pay exactly{' '}
                      <span className="font-black text-blue-900 text-lg">₹{selectedPlan.amount}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Payment details form ── */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" /> Payment Details
            </h3>

            {/* UTR */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                UTR / Transaction ID <span className="text-red-500">*</span>
              </label>
              <input type="text" value={utrNumber} onChange={e => setUtrNumber(e.target.value)}
                placeholder="e.g. 425123456789"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow" />
              <p className="text-xs text-gray-400 mt-1">Found in your UPI app under transaction history.</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Your SROTS Username <span className="text-red-500">*</span>
              </label>
              <input type="text" value={usernameField} onChange={e => setUsernameField(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow" />
            </div>

            {/* Amount (read-only, driven by selected plan) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Amount (₹)</label>
              <input type="text" readOnly
                value={selectedPlan ? `₹${selectedPlan.amount}` : 'Select a plan first'}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm cursor-not-allowed" />
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Payment Screenshot <span className="text-red-500">*</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all overflow-hidden bg-gray-50">
                {screenshotPreview
                  ? <img src={screenshotPreview} alt="preview" className="w-full h-full object-contain" />
                  : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 p-4">
                      <Upload size={22} />
                      <span className="text-sm font-medium">Click to upload screenshot</span>
                      <span className="text-xs">PNG, JPG — max 5 MB</span>
                    </div>
                  )
                }
                <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
              </label>
              {screenshot && (
                <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                  <CheckCircle size={12} /> {screenshot.name}
                </p>
              )}
            </div>

            {/* Form error */}
            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <XCircle size={16} className="shrink-0" /> {formError}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit}
              disabled={submitting || !selectedPlanKey}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2">
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                : <><CreditCard size={16} /> Submit Payment</>
              }
            </button>

            <p className="text-xs text-gray-400 text-center">
              Payment will be reviewed by the SROTS team within a few hours.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={onLogout} className="text-sm text-gray-400 hover:text-gray-600 underline">
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PremiumPendingPage
// Shown when student has a payment that is PENDING_VERIFICATION.
// No form — they just have to wait.
// ─────────────────────────────────────────────────────────────────────────────
const PremiumPendingPage: React.FC<{
  message:  string;
  onLogout: () => void;
}> = ({ message, onLogout }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-lg border p-10 max-w-md w-full text-center">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
        <Clock className="text-amber-600" size={32} />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Under Review</h2>
      <p className="text-gray-500 mb-6">{message}</p>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700 text-left space-y-1">
        <p className="font-bold">⏳ What happens next?</p>
        <p>The SROTS team is reviewing your payment. You'll get an email once it's verified — usually within a few hours.</p>
      </div>
      <button onClick={onLogout}
        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">
        ← Back to Login
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// App — main component
// ─────────────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const dispatch    = useAppDispatch();
  const navigate    = useNavigate();
  const location    = useLocation();
  const { user: currentUser, loading: authLoading, error: authError } =
      useAppSelector(state => state.auth);

  // ── Login form state (unchanged from original) ────────────────────────────
  const [username,           setUsername]           = useState('');
  const [password,           setPassword]           = useState('');
  const [showPassword,       setShowPassword]       = useState(false);
  const [showForgotModal,    setShowForgotModal]    = useState(false);
  const [forgotEmail,        setForgotEmail]        = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotSuccess,      setForgotSuccess]      = useState(false);

  // ── Premium gate state — set when backend returns HTTP 402 ────────────────
  const [premiumStatus,   setPremiumStatus]   = useState<PremiumAccessStatus | null>(null);
  const [premiumUsername, setPremiumUsername] = useState('');

  // ── Force logout if token is missing ────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('SROTS_AUTH_TOKEN');
    if (!token && currentUser) {
      console.warn('No token found but user in Redux → forcing logout');
      dispatch(logout());
      navigate('/login', { replace: true });
    }
    if (token && !currentUser && !authLoading) {
      console.warn('Token exists but no user in Redux → redirect to login');
      navigate('/login', { replace: true });
    }
  }, [currentUser, authLoading, dispatch, navigate]);

  // ── Login handler — catches PremiumAccessError before Redux ────────────
  // We call AuthService.authenticateUser directly first so we can inspect the
  // 402 response and show the premium gate. If it succeeds (or throws any other
  // error), we fall through to the normal Redux dispatch which handles token
  // storage and state updates.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    // Clear any previous premium gate
    setPremiumStatus(null);
    setPremiumUsername('');

    try {
      // AuthService.authenticateUser should throw PremiumAccessError for HTTP 402.
      // See authService.ts: if (error.response?.status === 402) throw new PremiumAccessError(...)
      await AuthService.authenticateUser(username, password);
      // If we reach here, login succeeded — let Redux dispatch handle token/state
      dispatch(login({ username, password }) as any);
    } catch (err: any) {
      if (err instanceof PremiumAccessError) {
        // 402: student premium not active → show the correct gate screen
        setPremiumStatus(err.premiumStatus);
        setPremiumUsername(username);
        return;
      }
      // All other errors (wrong password, account locked, etc.) →
      // let Redux dispatch handle them so authError banner appears as normal
      dispatch(login({ username, password }) as any);
    }
  };

  const handleLogout = () => {
    setPremiumStatus(null);
    setPremiumUsername('');
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsForgotSubmitting(true);
    try {
      await AuthService.forgotPassword(forgotEmail);
      setForgotSuccess(true);
    } catch {
      alert('Failed to send reset link. Please check the email address.');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  // ── Quick login (keeps static credentials — no typing needed) ────────────
  const quickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setTimeout(() => dispatch(login({ username: u, password: p }) as any), 50);
  };

  const getDefaultDashboard = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
      case Role.SROTS_DEV: return '/admin/profile';
      case Role.STUDENT:   return '/student/jobs';
      case Role.CPH:
      case Role.STAFF:     return '/cp/jobs';
      default:             return '/login';
    }
  };

  const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: Role[] }) => {
    const token = localStorage.getItem('SROTS_AUTH_TOKEN');
    if (!currentUser || !token)                                       return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(currentUser.role))    return <Navigate to="/unauthorized" replace />;
    return children;
  };

  // ── Premium gate — shown BEFORE the login page when 402 received ─────────
  if (!currentUser && premiumStatus) {
    if (premiumStatus.accessState === 'PENDING_VERIFICATION') {
      return (
        <ErrorBoundary>
          <PremiumPendingPage message={premiumStatus.message} onLogout={handleLogout} />
        </ErrorBoundary>
      );
    }
    // EXPIRED or REJECTED → show full payment form
    return (
      <ErrorBoundary>
        <PremiumPaymentPage
          accessState={premiumStatus.accessState}
          message={premiumStatus.message}
          rejectionReason={premiumStatus.rejectionReason}
          username={premiumUsername}
          onLogout={handleLogout}
        />
      </ErrorBoundary>
    );
  }

  // ── Login page (no currentUser) ───────────────────────────────────────────
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
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Username or Institutional Email"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                    disabled={authLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-slate-500 uppercase">Secure Pin</label>
                  <button type="button"
                    onClick={() => { setShowForgotModal(true); setForgotSuccess(false); setForgotEmail(''); }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                    disabled={authLoading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs text-center font-bold border border-red-100 animate-in fade-in slide-in-from-top-1">
                  {authError}
                </div>
              )}

              <button type="submit" disabled={authLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                {authLoading ? <Loader2 size={20} className="animate-spin" /> : 'Authorize Access'}
              </button>
            </form>
          </div>

          {/* ── Quick login buttons (static credentials preserved exactly) ── */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-3">
            <button onClick={() => quickLogin('srots_admin', 'Srots_admin@8847')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-lg border border-blue-500 flex flex-col items-center gap-2 transition-all active:scale-95">
              <ShieldCheck size={24} />
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Super Admin</span>
            </button>
            <button onClick={() => quickLogin('DEV_Praveen', 'DEV_PRAVEEN@8847')}
              className="bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center gap-2 transition-all active:scale-95">
              <Terminal size={24} />
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Srots Dev</span>
            </button>
            <button onClick={() => quickLogin('SRM_CPADMIN_rajesh_tpo', 'SRM_CPADMIN_rajesh_tpo@5678')}
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-2xl shadow-lg border border-purple-500 flex flex-col items-center gap-2 transition-all active:scale-95">
              <UserCheck size={24} />
              <span className="text-[10px] font-black uppercase whitespace-nowrap">College Head</span>
            </button>
            <button onClick={() => quickLogin('SRM_CPSTAFF_kiran', 'SRM_CPSTAFF_KIRAN@3322')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-2xl shadow-lg border border-indigo-400 flex flex-col items-center gap-2 transition-all active:scale-95">
              <Zap size={24} />
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Staff</span>
            </button>
            <button onClick={() => quickLogin('SRM_21701A0501', 'SRM_21701A0501_9012')}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-2xl shadow-lg border border-green-500 flex flex-col items-center gap-2 transition-all active:scale-95">
              <GraduationCap size={24} />
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Student</span>
            </button>
          </div>

          {/* Forgot Password Modal (unchanged) */}
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
                  <button onClick={() => setShowForgotModal(false)}
                    className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">
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
                      <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                        placeholder="name@college.edu" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button type="submit" disabled={isForgotSubmitting}
                      className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                      {isForgotSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      Send Reset Link
                    </button>
                    <button type="button" onClick={() => setShowForgotModal(false)}
                      className="w-full py-3 bg-white text-gray-500 font-bold hover:text-gray-700 flex items-center justify-center gap-1 text-sm">
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

  // ── Logged-in: protected routes (unchanged from original) ────────────────
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultDashboard(currentUser.role)} replace />} />
        <Route path="/login" element={<Navigate to={getDefaultDashboard(currentUser.role)} replace />} />

        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={[Role.ADMIN, Role.SROTS_DEV]}>
            <Layout user={currentUser}
              onNavigate={view => navigate(`/admin/${view}`)}
              currentView={location.pathname.split('/').pop() || 'profile'}
              onLogout={handleLogout}>
              <AdminPortal
                view={location.pathname.split('/').pop() || 'profile'}
                user={currentUser}
                onUpdateUser={u => dispatch(updateUser(u))} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/cp/*" element={
          <ProtectedRoute allowedRoles={[Role.CPH, Role.STAFF]}>
            <Layout user={currentUser}
              onNavigate={view => navigate(`/cp/${view}`)}
              currentView={location.pathname.split('/').pop() || 'jobs'}
              onLogout={handleLogout}>
              <CPUserPortal
                view={location.pathname.split('/').pop() || 'jobs'}
                user={currentUser}
                onUpdateUser={u => dispatch(updateUser(u))} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={[Role.STUDENT]}>
            <Layout user={currentUser}
              onNavigate={view => navigate(`/student/${view}`)}
              currentView={location.pathname.split('/').pop() || 'jobs'}
              onLogout={handleLogout}>
              <StudentPortal
                view={location.pathname.split('/').pop() || 'jobs'}
                student={currentUser as any}
                onUpdateUser={u => dispatch(updateUser(u))} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/unauthorized" element={
          <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-red-600">
            Access Denied
          </div>
        } />
        <Route path="*" element={<Navigate to={getDefaultDashboard(currentUser.role)} replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;