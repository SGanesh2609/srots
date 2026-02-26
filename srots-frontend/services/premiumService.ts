import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentStatus     = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type PremiumMonthsKey  = 'FOUR_MONTHS' | 'SIX_MONTHS' | 'TWELVE_MONTHS';
export type PremiumAccessState = 'ACTIVE' | 'PENDING_VERIFICATION' | 'REJECTED' | 'EXPIRED';

export interface PremiumPlan {
  key:      PremiumMonthsKey;
  months:   number;
  label:    string;
  amount:   number;
  popular?: boolean;
}

// Plans must match backend PremiumMonths enum exactly:
//   FOUR_MONTHS   → 4 months  → ₹300
//   SIX_MONTHS    → 6 months  → ₹400  (popular)
//   TWELVE_MONTHS → 12 months → ₹700
export const PREMIUM_PLANS: PremiumPlan[] = [
  { key: 'FOUR_MONTHS',   months: 4,  label: '4 Months',  amount: 300 },
  { key: 'SIX_MONTHS',    months: 6,  label: '6 Months',  amount: 400, popular: true },
  { key: 'TWELVE_MONTHS', months: 12, label: '12 Months', amount: 700 },
];

export interface PaymentRecord {
  id:                   string;
  userId:               string;
  userFullName:         string;
  username:             string;
  collegeId:            string;
  collegeName:          string;
  utrNumber:            string;
  paymentScreenshotUrl: string | null;
  premiumMonths:        PremiumMonthsKey;
  premiumMonthsLabel:   string;
  premiumMonthsCount:   number;
  amount:               number;
  status:               PaymentStatus;
  submittedAt:          string;
  verifiedAt:           string | null;
  verifiedByAdminId:    string | null;
  verifiedByAdminName:  string | null;
  rejectionReason:      string | null;
}

export interface PremiumAccessStatus {
  accessState:     PremiumAccessState;
  message:         string;
  rejectionReason: string | null;
}

export interface PagedResponse<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  number:        number; // current page (0-indexed)
  size:          number;
}

// ─── Custom error thrown when backend returns HTTP 402 ────────────────────────
// The login thunk / handleLogin in App.tsx catches this to show the
// correct premium gate screen instead of a generic error message.

export class PremiumAccessError extends Error {
  constructor(public premiumStatus: PremiumAccessStatus) {
    super(premiumStatus.message);
    this.name = 'PremiumAccessError';
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const PremiumService = {

  /**
   * Student submits a new payment.
   * Sends multipart/form-data: all fields as strings + screenshot file.
   * Backend: POST /api/v1/premium-payments/submit
   */
  submitPayment: async (
    utrNumber:    string,
    premiumMonths: PremiumMonthsKey,
    amount:       number,
    username:     string,
    screenshot:   File,
  ): Promise<PaymentRecord> => {
    const form = new FormData();
    form.append('utrNumber',     utrNumber);
    form.append('premiumMonths', premiumMonths);
    form.append('amount',        String(amount));
    form.append('username',      username);
    form.append('screenshot',    screenshot);

    const response = await api.post('/premium-payments/submit', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Student: check own premium access state after login.
   * Backend: GET /api/v1/premium-payments/my-status
   */
  checkMyStatus: async (): Promise<PremiumAccessStatus> => {
    const response = await api.get('/premium-payments/my-status');
    return response.data;
  },

  /**
   * Admin/SROTS Dev: paginated payments list for a college.
   * Backend: GET /api/v1/premium-payments/college/{collegeId}
   */
  getCollegePayments: async (
    collegeId: string,
    page:      number = 0,
    size:      number = 10,
    status?:   PaymentStatus,
    query?:    string,
  ): Promise<PagedResponse<PaymentRecord>> => {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    if (query)  params.query  = query;

    const response = await api.get(`/premium-payments/college/${collegeId}`, { params });
    return response.data;
  },

  /**
   * Admin/SROTS Dev: approve a payment.
   * Backend: PUT /api/v1/premium-payments/{paymentId}/verify
   */
  verifyPayment: async (paymentId: string): Promise<PaymentRecord> => {
    const response = await api.put(`/premium-payments/${paymentId}/verify`);
    return response.data;
  },

  /**
   * Admin/SROTS Dev: reject a payment with reason.
   * Backend: PUT /api/v1/premium-payments/{paymentId}/reject
   */
  rejectPayment: async (paymentId: string, rejectionReason: string): Promise<PaymentRecord> => {
    const response = await api.put(`/premium-payments/${paymentId}/reject`, { rejectionReason });
    return response.data;
  },

  /**
   * Admin/SROTS Dev: emergency direct extension — NO payment verification.
   * Picks months (4, 6, or 12) and calls the backend directly.
   * If student already has active premium, months are STACKED on current end date.
   * Backend: POST /api/v1/premium-payments/direct-extension/{studentUserId}
   */
  grantDirectExtension: async (studentUserId: string, months: number): Promise<{ message: string }> => {
    const response = await api.post(`/premium-payments/direct-extension/${studentUserId}`, { months });
    return response.data;
  },

  /**
   * Helper: get expected amount in ₹ for a given plan key.
   */
  getExpectedAmount: (key: PremiumMonthsKey): number => {
    return PREMIUM_PLANS.find(p => p.key === key)?.amount ?? 0;
  },
};