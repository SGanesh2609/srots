// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import {
//     X,
//     Diamond,
//     CreditCard,
//     CheckCircle2,
//     AlertCircle
// } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../../../store/store';
// import { PremiumService } from '../../../services/premiumService';
// import { AuthService } from '../../../services/authService';
// import { updateUser } from '../../../store/slices/authSlice';
// import { toast } from 'react-hot-toast';

// interface RenewalModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     // Optional admin-side props (used in ManagingStudentAccounts)
//     student?: { id: string; name: string } | null;
//     extensionMonths?: string;
//     setExtensionMonths?: (v: string) => void;
//     onConfirm?: () => void;
// }

// const RenewalModal: React.FC<RenewalModalProps> = ({ isOpen, onClose }) => {
//     const dispatch = useDispatch();
//     const { user } = useSelector((state: RootState) => state.auth);
//     const [selectedMonths, setSelectedMonths] = useState<number | null>(null);
//     const [utr, setUtr] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [step, setStep] = useState(1); // 1: Info/Select, 2: Payment, 3: Verification

//     if (!isOpen) return null;

//     const handleRenew = async () => {
//         if (!selectedMonths || !utr) return;

//         setIsSubmitting(true);
//         try {
//             const response = await PremiumService.subscribe({
//                 months: selectedMonths,
//                 utrNumber: utr.trim()
//             });

//             toast.success(response.message);

//             // Refresh Session
//             if (user) {
//                 const updatedUser = await AuthService.getFullProfile(user.id);
//                 dispatch(updateUser(updatedUser));
//             }

//             onClose();
//         } catch (error: any) {
//             toast.error(error.response?.data?.message || 'Failed to renew premium.');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const plans = [
//         { months: 3, price: 199 },
//         { months: 6, price: 349 },
//         { months: 12, price: 599 }
//     ];

//     return (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//             <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 onClick={onClose}
//                 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//             />

//             <motion.div
//                 initial={{ scale: 0.9, opacity: 0, y: 20 }}
//                 animate={{ scale: 1, opacity: 1, y: 0 }}
//                 className="relative w-full max-w-md bg-[#0A0A1F] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
//             >
//                 <div className="p-6 border-b border-white/10 flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                         <Diamond className="w-5 h-5 text-blue-400" />
//                         <h2 className="text-xl font-bold text-white">Extend Premium</h2>
//                     </div>
//                     <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
//                         <X className="w-5 h-5" />
//                     </button>
//                 </div>

//                 <div className="p-6">
//                     {step === 1 && (
//                         <div className="space-y-6">
//                             <p className="text-gray-400 text-sm">Choose a plan to extend your premium membership and keep your exclusive features active.</p>

//                             <div className="grid grid-cols-1 gap-3">
//                                 {plans.map((p) => (
//                                     <button
//                                         key={p.months}
//                                         onClick={() => setSelectedMonths(p.months)}
//                                         className={`p-4 rounded-xl border flex items-center justify-between transition-all ${selectedMonths === p.months
//                                             ? 'bg-blue-600/10 border-blue-500 text-white'
//                                             : 'bg-white/5 border-white/10 text-gray-400'
//                                             }`}
//                                     >
//                                         <div className="text-left">
//                                             <div className="font-bold">{p.months} Months</div>
//                                             <div className="text-xs text-gray-500">Full Access</div>
//                                         </div>
//                                         <div className="text-xl font-bold">₹{p.price}</div>
//                                     </button>
//                                 ))}
//                             </div>

//                             <button
//                                 disabled={!selectedMonths}
//                                 onClick={() => setStep(2)}
//                                 className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 Continue to Payment
//                             </button>
//                         </div>
//                     )}

//                     {step === 2 && (
//                         <div className="text-center">
//                             <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-lg shadow-blue-500/10">
//                                 <img
//                                     src="/qr.png"
//                                     alt="QR"
//                                     className="w-40 h-40"
//                                     onError={(e) => {
//                                         (e.target as HTMLImageElement).src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SROTS_PREMIUM_RENEWAL";
//                                     }}
//                                 />
//                             </div>
//                             <p className="text-gray-400 text-sm mb-6">Scan to pay for <strong>{selectedMonths} Months</strong> extension.</p>

//                             <div className="flex gap-3">
//                                 <button
//                                     onClick={() => setStep(1)}
//                                     className="flex-1 py-3 rounded-xl bg-white/5 text-white border border-white/10"
//                                 >
//                                     Back
//                                 </button>
//                                 <button
//                                     onClick={() => setStep(3)}
//                                     className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-bold"
//                                 >
//                                     Confirm Payment
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {step === 3 && (
//                         <div className="space-y-6">
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">UTR / Transaction ID</label>
//                                 <input
//                                     type="text"
//                                     value={utr}
//                                     onChange={(e) => setUtr(e.target.value)}
//                                     placeholder="Ex: 123456789012"
//                                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white tracking-widest uppercase"
//                                 />
//                             </div>

//                             <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 text-xs text-blue-300">
//                                 <AlertCircle className="w-4 h-4 shrink-0" />
//                                 <p>Activation will be instant upon submission. Please double check the UTR.</p>
//                             </div>

//                             <div className="flex gap-3 pt-4">
//                                 <button
//                                     disabled={isSubmitting}
//                                     onClick={() => setStep(2)}
//                                     className="flex-1 py-3 rounded-xl bg-white/5 text-white border border-white/10"
//                                 >
//                                     Back
//                                 </button>
//                                 <button
//                                     disabled={isSubmitting || utr.length < 10}
//                                     onClick={handleRenew}
//                                     className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
//                                 >
//                                     {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Extend Validity'}
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </motion.div>
//         </div>
//     );
// };

// export default RenewalModal;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Diamond,
    Crown,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Upload,
    Zap,
    Calendar,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { PremiumService, PREMIUM_PLANS, PremiumMonthsKey } from '../../../services/premiumService';
import { AuthService } from '../../../services/authService';
import { updateUser } from '../../../store/slices/authSlice';
import { toast } from 'react-hot-toast';

// ─── Props ────────────────────────────────────────────────────────────────────

interface RenewalModalProps {
    isOpen:   boolean;
    onClose:  () => void;
    /**
     * When provided the modal runs in ADMIN MODE:
     *  - Header shows "Direct Extension" with crown icon
     *  - No QR / UTR / screenshot steps
     *  - Clicking confirm calls PremiumService.grantDirectExtension() directly
     *  - student.id is the target student's userId
     */
    student?: { id: string; name: string } | null;
}

// ─── Plan display rows ────────────────────────────────────────────────────────
// Source of truth: must match backend PremiumMonths enum + getExpectedAmount()
// FOUR_MONTHS = 4 months = ₹300 | SIX_MONTHS = 6 months = ₹400 | TWELVE_MONTHS = 12 months = ₹700

const RenewalModal: React.FC<RenewalModalProps> = ({ isOpen, onClose, student }) => {

    const dispatch      = useDispatch();
    const { user }      = useSelector((state: RootState) => state.auth);

    const isAdminMode   = !!student; // admin direct-extension when student prop is present

    // ── Shared state ──────────────────────────────────────────────────────────
    const [selectedPlanKey, setSelectedPlanKey] = useState<PremiumMonthsKey | null>(null);
    const [isSubmitting,    setIsSubmitting]     = useState(false);

    // ── Student payment-flow state ─────────────────────────────────────────────
    // step 1 → pick plan | step 2 → QR/scan | step 3 → UTR + screenshot
    const [step,             setStep]            = useState<1 | 2 | 3>(1);
    const [utr,              setUtr]             = useState('');
    const [screenshot,       setScreenshot]      = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

    if (!isOpen) return null;

    const selectedPlan = PREMIUM_PLANS.find(p => p.key === selectedPlanKey) ?? null;

    const resetAndClose = () => {
        setSelectedPlanKey(null);
        setStep(1);
        setUtr('');
        setScreenshot(null);
        setScreenshotPreview(null);
        setIsSubmitting(false);
        onClose();
    };

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setScreenshot(file);
        const reader = new FileReader();
        reader.onload = ev => setScreenshotPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    // ── ADMIN MODE: direct extension via grantDirectExtension API ─────────────
    const handleDirectExtend = async () => {
        if (!selectedPlan || !student) return;
        setIsSubmitting(true);
        try {
            const result = await PremiumService.grantDirectExtension(student.id, selectedPlan.months);
            toast.success(result.message || `✅ Premium extended by ${selectedPlan.months} months for ${student.name}.`);
            resetAndClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Failed to extend premium.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── STUDENT MODE: submit payment form ────────────────────────────────────
    const handleStudentSubmit = async () => {
        if (!selectedPlan || !utr.trim() || !screenshot) return;
        setIsSubmitting(true);
        try {
            await PremiumService.submitPayment(
                utr.trim(),
                selectedPlan.key,
                selectedPlan.amount,
                user?.username ?? '',
                screenshot,
            );
            toast.success('Payment submitted! The SROTS team will verify it shortly.');
            // Refresh Redux user so premium state updates everywhere
            if (user) {
                const updated = await AuthService.getFullProfile(user.id);
                dispatch(updateUser(updated));
            }
            resetAndClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Step indicator (student mode only, shown on steps 2 & 3)
    // ─────────────────────────────────────────────────────────────────────────
    const StepDots = () => (
        <div className="flex items-center justify-center gap-2 mb-5">
            {([1, 2, 3] as const).map(s => (
                <React.Fragment key={s}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-200 ${
                        step === s ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/40' :
                        step  > s  ? 'bg-blue-600/30 text-blue-400' : 'bg-white/8 text-gray-600'
                    }`}>{s}</div>
                    {s < 3 && <div className={`h-px w-8 transition-colors ${step > s ? 'bg-blue-600/60' : 'bg-white/10'}`} />}
                </React.Fragment>
            ))}
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Step 1 (both modes): Plan selection
    // ─────────────────────────────────────────────────────────────────────────
    const PlanStep = () => (
        <div className="space-y-5">
            {isAdminMode ? (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Zap className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-purple-200 leading-snug">
                        Direct extension for <b className="text-white">{student!.name}</b>.
                        No payment or screenshot required — premium dates update immediately.
                    </p>
                </div>
            ) : (
                <p className="text-gray-400 text-sm leading-relaxed">
                    Choose a plan to renew your premium. You'll pay via UPI QR on the next step.
                </p>
            )}

            {/* Plan cards */}
            <div className="space-y-2.5">
                {PREMIUM_PLANS.map(plan => {
                    const isSelected = selectedPlanKey === plan.key;
                    return (
                        <button
                            key={plan.key}
                            onClick={() => setSelectedPlanKey(plan.key)}
                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all duration-150 text-left ${
                                isSelected
                                    ? 'bg-blue-600/15 border-blue-500 text-white'
                                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-blue-500/50 hover:bg-white/8'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Radio dot */}
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-600'
                                }`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <div>
                                    <div className="font-bold leading-tight">{plan.label}</div>
                                    {plan.popular && (
                                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                                            Most Popular
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Price or month count */}
                            <div className={`text-xl font-black transition-colors ${isSelected ? 'text-blue-400' : 'text-gray-300'}`}>
                                {isAdminMode ? `+${plan.months}mo` : `₹${plan.amount}`}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Pricing reference table — student mode only */}
            {!isAdminMode && (
                <div className="rounded-xl overflow-hidden border border-white/8 text-xs">
                    <div className="grid grid-cols-2 bg-white/5 px-3 py-2 font-black text-gray-500 uppercase tracking-wider">
                        <span>Plan</span><span className="text-right">Amount</span>
                    </div>
                    {PREMIUM_PLANS.map(p => (
                        <div key={p.key} className="grid grid-cols-2 px-3 py-2 border-t border-white/5 text-gray-400">
                            <span>{p.label}</span>
                            <span className="text-right font-black text-gray-200">₹{p.amount}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA */}
            <button
                disabled={!selectedPlanKey || isSubmitting}
                onClick={() => isAdminMode ? handleDirectExtend() : setStep(2)}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isAdminMode ? (
                    <><Zap className="w-4 h-4" /> Grant Extension Now</>
                ) : (
                    <><CreditCard className="w-4 h-4" /> Continue to Payment</>
                )}
            </button>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2 (student): QR code + confirm
    // ─────────────────────────────────────────────────────────────────────────
    const QRStep = () => (
        <div className="space-y-5">
            <div className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-2xl shadow-lg shadow-blue-600/10 mb-4">
                    <img
                        src="/qr.png"
                        alt="UPI QR Code"
                        className="w-44 h-44 object-contain"
                        onError={e => {
                            (e.target as HTMLImageElement).src =
                                `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SROTS_PREMIUM_${selectedPlan?.amount}`;
                        }}
                    />
                </div>
                <p className="text-sm text-gray-400 text-center">
                    Pay exactly{' '}
                    <span className="text-white font-black text-lg">₹{selectedPlan?.amount}</span>
                    {' '}for {selectedPlan?.months} months premium.
                </p>
                <div className="mt-3 w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-amber-300 font-semibold">
                        ⚠️ The payment amount must exactly match the plan price.
                    </p>
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold">
                    Back
                </button>
                <button onClick={() => setStep(3)}
                    className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all active:scale-[0.98]">
                    I've Paid → Enter UTR
                </button>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3 (student): UTR + screenshot upload + submit
    // ─────────────────────────────────────────────────────────────────────────
    const UTRStep = () => (
        <div className="space-y-5">

            {/* UTR input */}
            <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    UTR / Transaction ID <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={utr}
                    onChange={e => setUtr(e.target.value)}
                    placeholder="e.g. 425123456789"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white tracking-widest focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-700 transition-all"
                />
                <p className="text-xs text-gray-600 mt-1">Found in your UPI app under transaction history.</p>
            </div>

            {/* Screenshot upload */}
            <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    Payment Screenshot <span className="text-red-400">*</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-blue-500/60 hover:bg-white/3 transition-all overflow-hidden bg-white/3">
                    {screenshotPreview
                        ? <img src={screenshotPreview} alt="preview" className="w-full h-full object-contain" />
                        : (
                            <div className="flex flex-col items-center gap-2 text-gray-600 p-4">
                                <Upload size={22} />
                                <span className="text-xs font-semibold">Click to upload screenshot</span>
                                <span className="text-xs">PNG, JPG — max 5 MB</span>
                            </div>
                        )
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                </label>
                {screenshot && (
                    <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                        <CheckCircle2 size={12} /> {screenshot.name}
                    </p>
                )}
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Your payment will be reviewed by the SROTS team and you'll be notified by email.</p>
            </div>

            <div className="flex gap-3">
                <button onClick={() => setStep(2)} disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold">
                    Back
                </button>
                <button
                    onClick={handleStudentSubmit}
                    disabled={isSubmitting || utr.trim().length < 8 || !screenshot}
                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                    {isSubmitting
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : 'Submit Payment'
                    }
                </button>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={resetAndClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal card */}
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1,    opacity: 1, y: 0  }}
                exit={{    scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 22, stiffness: 320 }}
                className="relative w-full max-w-md bg-[#0A0A1F] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/60"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        {isAdminMode
                            ? <Crown className="w-5 h-5 text-purple-400" />
                            : <Diamond className="w-5 h-5 text-blue-400" />
                        }
                        <div>
                            <h2 className="text-lg font-black text-white leading-tight">
                                {isAdminMode ? 'Direct Premium Extension' : 'Renew Premium'}
                            </h2>
                            {isAdminMode && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Calendar className="w-3 h-3" />
                                    Admin bypass — no payment required
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={resetAndClose}
                        className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Step dots — only student mode, only steps 2 & 3 */}
                    {!isAdminMode && step > 1 && <StepDots />}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isAdminMode ? 'admin-plan' : `step-${step}`}
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0  }}
                            exit={{    opacity: 0, x: -18 }}
                            transition={{ duration: 0.16 }}
                        >
                            {/* Admin always stays on plan step */}
                            {(isAdminMode || step === 1) && <PlanStep />}
                            {!isAdminMode && step === 2    && <QRStep />}
                            {!isAdminMode && step === 3    && <UTRStep />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default RenewalModal;