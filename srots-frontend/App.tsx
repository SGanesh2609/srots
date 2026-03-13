import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Layout } from './components/colleges/shared/ui/Layout';
import { AdminPortal } from './pages/srots-user/AdminPortal';
import { CPUserPortal } from './pages/cp-user/CPUserPortal';
import { StudentPortal } from './pages/student/StudentPortal';
import { Role, User, Student } from './types';
import {
  Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck,
  UserCheck, GraduationCap, Terminal, Zap, ArrowLeft, Send, CheckCircle,
  Clock, XCircle, AlertCircle, CreditCard, Star, Upload, Diamond,
} from 'lucide-react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { login, logout, updateUser, isTokenExpired } from './store/slices/authSlice';
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

const UPI_QR_IMAGE_PATH = '/PaymentScanner.jpeg';
const UPI_ID            = '63095225692@ybl';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE-LEVEL ROUTING COMPONENTS
//
// These MUST live outside the App render function so React never sees a new
// component type on re-render (which would unmount/remount the whole subtree
// and cause state loss + visual flicker on every parent re-render).
//
// Each portal route component:
//   • Reads `view` from useParams — survives browser refresh at any URL
//   • Reads `user` from Redux — single source of truth
//   • Dispatches updateUser directly — no prop-drilling through App
//   • Receives only `onLogout` from App (needed to clear App's premium state)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ProtectedRoute — guards a route by role.
 * Reads auth state from Redux directly (stable, no App closure needed).
 * On fail → redirects to /login with `state.from` so we can return after login.
 */
const ProtectedRoute: React.FC<{
  children:     JSX.Element;
  allowedRoles?: Role[];
}> = ({ children, allowedRoles }) => {
  const location  = useLocation();
  const { user, isAuthenticated } = useAppSelector(s => s.auth);
  const token = localStorage.getItem('SROTS_AUTH_TOKEN');

  if (!user || !token || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

/** Admin / SROTS-Dev portal route — reads :view param from URL */
const AdminRoute: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { view = 'profile' }  = useParams<{ view: string }>();
  const { user }              = useAppSelector(s => s.auth);
  const dispatch              = useAppDispatch();
  const navigate              = useNavigate();
  if (!user) return null;
  return (
    <Layout user={user} currentView={view} onLogout={onLogout}
      onNavigate={v => navigate(`/admin/${v}`)}>
      <AdminPortal view={view} user={user}
        onUpdateUser={u => dispatch(updateUser(u))} />
    </Layout>
  );
};

/** CP Head / Staff portal route — reads :view param from URL */
const CPRoute: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { view = 'jobs' }     = useParams<{ view: string }>();
  const { user }              = useAppSelector(s => s.auth);
  const dispatch              = useAppDispatch();
  const navigate              = useNavigate();
  if (!user) return null;
  return (
    <Layout user={user} currentView={view} onLogout={onLogout}
      onNavigate={v => navigate(`/cp/${v}`)}>
      <CPUserPortal view={view} user={user}
        onUpdateUser={u => dispatch(updateUser(u))} />
    </Layout>
  );
};

/** Student portal route — reads :view param from URL */
const StudentRoute: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { view = 'jobs' }     = useParams<{ view: string }>();
  const { user }              = useAppSelector(s => s.auth);
  const dispatch              = useAppDispatch();
  const navigate              = useNavigate();
  if (!user) return null;
  return (
    <Layout user={user} currentView={view} onLogout={onLogout}
      onNavigate={v => navigate(`/student/${v}`)}>
      <StudentPortal view={view} student={user as Student}
        onUpdateUser={u => dispatch(updateUser(u))} />
    </Layout>
  );
};

/** Unauthorized page — reusable, defined once */
const UnauthorizedPage: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center p-8 bg-gray-50">
    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
      <span className="text-4xl">🚫</span>
    </div>
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-500 text-sm max-w-sm">
        You don't have permission to access this page.
        Please contact your administrator if you believe this is a mistake.
      </p>
    </div>
    <button
      onClick={onGoBack}
      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-sm transition-colors"
    >
      Go to My Dashboard
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PremiumPaymentPage
//
// CHANGES FROM ORIGINAL (2 lines):
//   1. Added `userId` prop.
//   2. handleSubmit calls PremiumService.submitPaymentPublic(userId, ...) instead
//      of PremiumService.submitPayment(...).
//
// WHY:
//   The student reaches this page after a 402 login response — no JWT was issued.
//   localStorage has no SROTS_AUTH_TOKEN. The old submitPayment() called
//   POST /submit which requires a JWT → 403 Forbidden.
//
//   submitPaymentPublic() calls POST /public/submit (permitAll in SecurityConfig).
//   It sends userId as a multipart field so the backend can identify the student
//   without an Authorization header.
// ─────────────────────────────────────────────────────────────────────────────
const PremiumPaymentPage: React.FC<{
  accessState:      PremiumAccessState;
  message:          string;
  rejectionReason?: string | null;
  username:         string;
  userId:           string;   // ← NEW
  onLogout:         () => void;
}> = ({ accessState, message, rejectionReason, username, userId, onLogout }) => {

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
    if (!userId)                           return setFormError('Session error: missing user ID. Please go back and log in again.');

    setSubmitting(true);
    try {
      // ── Use submitPaymentPublic → POST /public/submit (no JWT required) ───
      await PremiumService.submitPaymentPublic(
        userId,               // ← from 402 response body, passed as prop from App.tsx
        utrNumber.trim(),
        selectedPlanKey,
        selectedPlan.amount,
        usernameField.trim(),
        screenshot,
      );
      setSubmitted(true);
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || err.message || 'Submission failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
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

        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Diamond size={14} /> SROTS Premium
          </div>
          <h1 className="text-3xl font-black text-gray-900">Renew Your Subscription</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Complete payment below to regain access to SROTS.</p>
        </div>

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

          {/* LEFT: Plan selector + QR */}
          <div className="space-y-5">
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

          {/* RIGHT: Payment details form */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" /> Payment Details
            </h3>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                UTR / Transaction ID <span className="text-red-500">*</span>
              </label>
              <input type="text" value={utrNumber} onChange={e => setUtrNumber(e.target.value)}
                placeholder="e.g. 425123456789"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow" />
              <p className="text-xs text-gray-400 mt-1">Found in your UPI app under transaction history.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Your SROTS Username <span className="text-red-500">*</span>
              </label>
              <input type="text" value={usernameField} onChange={e => setUsernameField(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Amount (₹)</label>
              <input type="text" readOnly
                value={selectedPlan ? `₹${selectedPlan.amount}` : 'Select a plan first'}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm cursor-not-allowed" />
            </div>

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

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <XCircle size={16} className="shrink-0" /> {formError}
              </div>
            )}

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
// PremiumPendingPage — unchanged from original
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
// App
//
// CHANGES FROM ORIGINAL (3 additions, all clearly marked ← NEW):
//   1. Added `premiumUserId` state (string).
//   2. In handleLogin: store `err.premiumStatus.userId` (from 402 body) into it.
//   3. In handleLogout: clear premiumUserId.
//   4. Pass `userId={premiumUserId}` prop to PremiumPaymentPage.
//
// Everything else is identical to the original.
// ─────────────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const dispatch    = useAppDispatch();
  const navigate    = useNavigate();
  const location    = useLocation();
  const { user: currentUser, loading: authLoading, error: authError } =
      useAppSelector(state => state.auth);

  const [username,           setUsername]           = useState('');
  const [password,           setPassword]           = useState('');
  const [showPassword,       setShowPassword]       = useState(false);
  const [showForgotModal,    setShowForgotModal]    = useState(false);
  const [forgotEmail,        setForgotEmail]        = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotSuccess,      setForgotSuccess]      = useState(false);

  const [premiumStatus,   setPremiumStatus]   = useState<PremiumAccessStatus | null>(null);
  const [premiumUsername, setPremiumUsername] = useState('');
  const [premiumUserId,   setPremiumUserId]   = useState('');  // ← NEW

  // ── Track previous user id to detect the null→user transition (just logged in).
  // Store only the id (string), not the full User object — avoids spurious
  // re-runs caused by Redux creating a new object reference on every state update.
  const prevUserRef = useRef<string | null>(currentUser?.id ?? null);

  // ── 1. Token/Redux mismatch guard ─────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('SROTS_AUTH_TOKEN');
    if (!token && currentUser) {
      // Redux has a user but token is gone (cleared externally) — force logout
      console.warn('[Auth] Token missing but Redux has user → forcing logout');
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  }, [currentUser, dispatch, navigate]);

  // ── 2. Listen for 401 session-expired events fired by api.ts ─────────────
  useEffect(() => {
    const handleSessionExpired = (e: Event) => {
      const from = (e as CustomEvent<{ from: string }>).detail?.from || '/';
      console.warn('[Auth] Session expired — redirecting to login. Will return to:', from);
      dispatch(logout());
      navigate('/login', { state: { from }, replace: true });
    };
    window.addEventListener('srots:auth:expired', handleSessionExpired);
    return () => window.removeEventListener('srots:auth:expired', handleSessionExpired);
  }, [dispatch, navigate]);

  // ── 2b. Proactive JWT expiry check — catches sessions that expire mid-use ─
  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem('SROTS_AUTH_TOKEN');
      if (token && isTokenExpired(token)) {
        console.info('[App] JWT expired mid-session — logging out');
        dispatch(logout());
      }
    };
    check(); // immediate check on mount
    const id = setInterval(check, 60_000); // then every 60 s
    return () => clearInterval(id);
  }, [dispatch]);

  // ── 3. Redirect to intended URL after successful login ───────────────────
  useEffect(() => {
    const wasLoggedOut = !prevUserRef.current;
    const isNowLoggedIn = !!currentUser;

    if (wasLoggedOut && isNowLoggedIn) {
      // User just logged in — go to where they were trying to reach, or default dashboard
      const rawFrom = (location.state as any)?.from as string | undefined;
      // Validate that `from` is an internal path to prevent open-redirect phishing
      const isInternalPath = (p: string) =>
        typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !p.includes('://');
      const destination = rawFrom && isInternalPath(rawFrom) && rawFrom !== '/login' && rawFrom !== '/'
        ? rawFrom
        : getDefaultDashboard(currentUser.role);
      navigate(destination, { replace: true });
    }

    prevUserRef.current = currentUser?.id ?? null;
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setPremiumStatus(null);
    setPremiumUsername('');
    setPremiumUserId('');  // ← NEW: clear on each login attempt

    try {
      await AuthService.authenticateUser(username, password);
      dispatch(login({ username, password }) as any);
    } catch (err: any) {
      if (err instanceof PremiumAccessError) {
        setPremiumStatus(err.premiumStatus);
        setPremiumUsername(username);
        // ← NEW: AuthController now includes userId in the 402 body.
        // err.premiumStatus.userId is typed as optional string on PremiumAccessStatus.
        // Log a warning if userId is missing — without it the payment submission
        // would fail silently because the backend requires a valid userId.
        const resolvedUserId = err.premiumStatus.userId;
        if (!resolvedUserId) {
          console.error('[App] 402 response missing userId — payment page cannot proceed', err.premiumStatus);
          return; // Don't show the payment page if we have no userId
        }
        setPremiumUserId(resolvedUserId);
        return;
      }
      dispatch(login({ username, password }) as any);
    }
  };

  const handleLogout = () => {
    setPremiumStatus(null);
    setPremiumUsername('');
    setPremiumUserId('');
    dispatch(logout());
    // Clear the prevUserRef so redirect-after-login effect doesn't fire on re-login
    prevUserRef.current = null;
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

  const quickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    // 50 ms: allows React to flush the setUsername/setPassword state updates
    // before the login thunk reads credentials — prevents stale-closure captures.
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

  // ── Premium gate ──────────────────────────────────────────────────────────
  if (!currentUser && premiumStatus) {
    if (premiumStatus.accessState === 'PENDING_VERIFICATION') {
      return (
        <ErrorBoundary>
          <PremiumPendingPage message={premiumStatus.message} onLogout={handleLogout} />
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary>
        <PremiumPaymentPage
          accessState={premiumStatus.accessState}
          message={premiumStatus.message}
          rejectionReason={premiumStatus.rejectionReason}
          username={premiumUsername}
          userId={premiumUserId}      // ← NEW prop
          onLogout={handleLogout}
        />
      </ErrorBoundary>
    );
  }

  // ── Login page ────────────────────────────────────────────────────────────
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

  // ── Authenticated routes ───────────────────────────────────────────────────
  return (
    <ErrorBoundary>
      <Routes>

        {/* ── Root & Login: already logged in → go to dashboard ── */}
        <Route path="/"      element={<Navigate to={getDefaultDashboard(currentUser.role)} replace />} />
        <Route path="/login" element={<Navigate to={getDefaultDashboard(currentUser.role)} replace />} />

        {/* ── Admin / SROTS-Dev Portal ─────────────────────────────────────────
            /admin              → /admin/profile (default view)
            /admin/:view        → explicit named view (survives refresh)
            /admin/*            → unknown deep path → /admin/profile
        ─────────────────────────────────────────────────────────────────────── */}
        <Route path="/admin"
          element={<Navigate to="/admin/profile" replace />} />

        <Route path="/admin/:view" element={
          <ProtectedRoute allowedRoles={[Role.ADMIN, Role.SROTS_DEV]}>
            <AdminRoute onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/admin/*"
          element={<Navigate to="/admin/profile" replace />} />

        {/* ── CP Head / Staff Portal ───────────────────────────────────────────
            /cp              → /cp/jobs (default view)
            /cp/:view        → explicit named view (survives refresh)
            /cp/*            → unknown deep path → /cp/jobs
        ─────────────────────────────────────────────────────────────────────── */}
        <Route path="/cp"
          element={<Navigate to="/cp/jobs" replace />} />

        <Route path="/cp/:view" element={
          <ProtectedRoute allowedRoles={[Role.CPH, Role.STAFF]}>
            <CPRoute onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/cp/*"
          element={<Navigate to="/cp/jobs" replace />} />

        {/* ── Student Portal ───────────────────────────────────────────────────
            /student              → /student/jobs (default view)
            /student/:view        → explicit named view (survives refresh)
            /student/*            → unknown deep path → /student/jobs
        ─────────────────────────────────────────────────────────────────────── */}
        <Route path="/student"
          element={<Navigate to="/student/jobs" replace />} />

        <Route path="/student/:view" element={
          <ProtectedRoute allowedRoles={[Role.STUDENT]}>
            <StudentRoute onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/student/*"
          element={<Navigate to="/student/jobs" replace />} />

        {/* ── Unauthorized ─────────────────────────────────────────────────── */}
        <Route path="/unauthorized"
          element={<UnauthorizedPage onGoBack={() => navigate(getDefaultDashboard(currentUser.role))} />} />

        {/* ── 404 catch-all → role-based dashboard ─────────────────────────── */}
        <Route path="*"
          element={<Navigate to={getDefaultDashboard(currentUser.role)} replace />} />

      </Routes>
    </ErrorBoundary>
  );
};

export default App;