import React, { useState } from 'react';
import {
  PremiumService,
  PREMIUM_PLANS,
  PremiumMonthsKey,
  PremiumAccessState,
} from '../services/premiumService';
import {
  CheckCircle, Clock, XCircle, CreditCard, Upload,
  AlertCircle, Star, Zap, Shield,
} from 'lucide-react';

interface PremiumPaymentPageProps {
  accessState: PremiumAccessState;
  message: string;
  rejectionReason?: string | null;
  username: string;           // pre-fill the username field
  onLogout: () => void;
}

// ─── UPI Scanner placeholder (replace src with your actual QR image) ──────────
const UPI_QR_IMAGE = '/upi-scanner.png'; // ← Replace with your scanner image path
const UPI_ID       = 'yourname@upi';     // ← Replace with your actual UPI ID

export const PremiumPaymentPage: React.FC<PremiumPaymentPageProps> = ({
  accessState, message, rejectionReason, username, onLogout,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PremiumMonthsKey | null>(null);
  const [utrNumber,    setUtrNumber]    = useState('');
  const [usernameField, setUsernameField] = useState(username);
  const [screenshot,   setScreenshot]   = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [error,        setError]        = useState('');

  const selectedPlanData = PREMIUM_PLANS.find(p => p.key === selectedPlan);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = ev => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError('');
    if (!selectedPlan)         return setError('Please select a plan.');
    if (!utrNumber.trim())     return setError('Please enter the UTR / Transaction ID.');
    if (!usernameField.trim()) return setError('Please confirm your username.');
    if (!screenshot)           return setError('Please upload the payment screenshot.');

    setSubmitting(true);
    try {
      await PremiumService.submitPayment(
        utrNumber.trim(),
        selectedPlan,
        selectedPlanData!.amount,
        usernameField.trim(),
        screenshot,
      );
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Status Banner ───────────────────────────────────────────────────────────
  const StatusBanner = () => {
    if (accessState === 'PENDING_VERIFICATION') {
      return (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
          <Clock className="text-amber-500 mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-semibold text-amber-800">Payment Under Review</p>
            <p className="text-sm text-amber-700 mt-0.5">{message}</p>
          </div>
        </div>
      );
    }
    if (accessState === 'REJECTED') {
      return (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <XCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-semibold text-red-800">Previous Payment Rejected</p>
            <p className="text-sm text-red-700 mt-0.5">{message}</p>
            {rejectionReason && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                Reason: {rejectionReason}
              </p>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
        <AlertCircle className="text-blue-500 mt-0.5 shrink-0" size={20} />
        <div>
          <p className="font-semibold text-blue-800">Premium Subscription Required</p>
          <p className="text-sm text-blue-700 mt-0.5">{message}</p>
        </div>
      </div>
    );
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Your payment is under review by the SROTS team. You will receive an email once it is verified.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-700">
            ⏳ Please wait while our team reviews your payment. This usually takes a few hours.
          </div>
          <button
            onClick={onLogout}
            className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── PENDING: Don't show form, only show status ──────────────────────────────
  if (accessState === 'PENDING_VERIFICATION') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="text-amber-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Under Review</h2>
          <p className="text-gray-500 mb-6">{message}</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-700">
            Our team is reviewing your payment. You will receive an email confirmation once verified.
          </div>
          <button
            onClick={onLogout}
            className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Full Payment Form (EXPIRED or REJECTED) ─────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Zap size={14} /> SROTS Premium Access
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Renew Your Premium</h1>
          <p className="text-gray-500 mt-2">Complete your payment to continue accessing SROTS.</p>
        </div>

        <StatusBanner />

        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT: Plan selection + QR */}
          <div className="space-y-6">

            {/* Plans */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star size={18} className="text-yellow-500" /> Choose Your Plan
              </h3>
              <div className="space-y-3">
                {PREMIUM_PLANS.map(plan => (
                  <button
                    key={plan.key}
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      selectedPlan === plan.key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === plan.key ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                      }`}>
                        {selectedPlan === plan.key && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">{plan.label}</span>
                      {plan.popular && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                          Popular
                        </span>
                      )}
                    </div>
                    <span className={`text-lg font-bold ${
                      selectedPlan === plan.key ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      ₹{plan.amount}
                    </span>
                  </button>
                ))}
              </div>

              {/* Price summary table */}
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Plan</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {PREMIUM_PLANS.map(plan => (
                      <tr key={plan.key} className="bg-white">
                        <td className="px-3 py-2 text-gray-700">{plan.label}</td>
                        <td className="px-3 py-2 text-right font-bold text-gray-900">₹{plan.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* UPI QR Scanner */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-500" /> Scan & Pay
              </h3>
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 border-2 border-dashed border-blue-300 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={UPI_QR_IMAGE}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
                    }}
                  />
                  <div className="text-center text-gray-400 p-4 hidden">
                    <CreditCard size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">QR Code will appear here</p>
                    <p className="text-xs text-gray-300">(Replace /upi-scanner.png)</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-semibold text-gray-700">UPI ID</p>
                  <p className="text-blue-600 font-mono font-bold">{UPI_ID}</p>
                </div>
                {selectedPlanData && (
                  <div className="mt-3 w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-700">
                      Pay exactly <span className="font-bold text-blue-900 text-lg">₹{selectedPlanData.amount}</span> for {selectedPlanData.label}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Payment details form */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Shield size={18} className="text-green-500" /> Payment Details
            </h3>

            <div className="space-y-5">
              {/* UTR Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  UTR / Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={e => setUtrNumber(e.target.value)}
                  placeholder="e.g. 425123456789"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Find this in your UPI app under transaction history.
                </p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Your Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={usernameField}
                  onChange={e => setUsernameField(e.target.value)}
                  placeholder="Your SROTS username"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              {/* Amount (auto-filled, read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Amount Paid (₹)
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedPlanData ? `₹${selectedPlanData.amount}` : 'Select a plan first'}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Payment Screenshot <span className="text-red-500">*</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50 overflow-hidden">
                  {screenshotPreview ? (
                    <img
                      src={screenshotPreview}
                      alt="preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 p-4">
                      <Upload size={24} />
                      <span className="text-sm font-medium">Click to upload screenshot</span>
                      <span className="text-xs">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshotChange}
                  />
                </label>
                {screenshot && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle size={12} /> {screenshot.name}
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <XCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedPlan}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Submit Payment
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Your payment will be verified by the SROTS team within a few hours.
                You will receive an email confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Logout link */}
        <div className="text-center mt-6">
          <button
            onClick={onLogout}
            className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumPaymentPage;