import React, { useState, useEffect, useCallback } from 'react';
import {
  PremiumService,
  PaymentRecord,
  PaymentStatus,
  PagedResponse,
} from '../../../../services/premiumService';
import {
  CheckCircle, XCircle, Clock, Search, Eye, X,
  RefreshCw, IndianRupee, Calendar, User, Hash,
  AlertTriangle, Image,
} from 'lucide-react';
import TablePagination from '@mui/material/TablePagination';

interface PaymentManagementProps {
  collegeId: string;
  collegeName: string;
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const configs = {
    PENDING:  { color: 'bg-amber-100 text-amber-800 border-amber-200',  icon: <Clock size={12} />,       label: 'Pending' },
    VERIFIED: { color: 'bg-green-100 text-green-800 border-green-200',  icon: <CheckCircle size={12} />, label: 'Verified' },
    REJECTED: { color: 'bg-red-100   text-red-800   border-red-200',    icon: <XCircle size={12} />,     label: 'Rejected' },
  };
  const cfg = configs[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── Screenshot Modal ──────────────────────────────────────────────────────────
const ScreenshotModal: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
    <div className="relative max-w-3xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2">
        <X size={24} />
      </button>
      <img src={url} alt="Payment Screenshot" className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
    </div>
  </div>
);

// ─── Reject Dialog ─────────────────────────────────────────────────────────────
const RejectDialog: React.FC<{
  payment: PaymentRecord;
  onConfirm: (reason: string) => void;
  onClose: () => void;
  loading: boolean;
}> = ({ payment, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Reject Payment</h3>
            <p className="text-sm text-gray-500">UTR: {payment.utrNumber}</p>
          </div>
        </div>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Enter the reason for rejection (required)..."
          rows={4}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none resize-none mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <XCircle size={16} />}
            Reject Payment
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const PaymentManagement: React.FC<PaymentManagementProps> = ({ collegeId, collegeName }) => {
  const [data,           setData]           = useState<PagedResponse<PaymentRecord> | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [actionLoading,  setActionLoading]  = useState<string | null>(null);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [statusFilter,   setStatusFilter]   = useState<string>('');
  const [page,           setPage]           = useState(0);
  const [rowsPerPage,    setRowsPerPage]    = useState(10);
  const [screenshotUrl,  setScreenshotUrl]  = useState<string | null>(null);
  const [rejectTarget,   setRejectTarget]   = useState<PaymentRecord | null>(null);
  const [expandedRow,    setExpandedRow]    = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await PremiumService.getCollegePayments(
        collegeId,
        page,
        rowsPerPage,
        statusFilter as PaymentStatus || undefined,
        searchQuery || undefined,
      );
      setData(result);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    } finally {
      setLoading(false);
    }
  }, [collegeId, page, rowsPerPage, statusFilter, searchQuery]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // Debounce search
  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter]);

  const handleVerify = async (payment: PaymentRecord) => {
    if (!window.confirm(`Verify payment from ${payment.userFullName}?\nUTR: ${payment.utrNumber}\nAmount: ₹${payment.amount}`)) return;
    setActionLoading(payment.id);
    try {
      await PremiumService.verifyPayment(payment.id);
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget.id);
    try {
      await PremiumService.rejectPayment(rejectTarget.id, reason);
      setRejectTarget(null);
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  const summary = {
    total:    data?.totalElements || 0,
    pending:  data?.content.filter(p => p.status === 'PENDING').length  || 0,
    verified: data?.content.filter(p => p.status === 'VERIFIED').length || 0,
    rejected: data?.content.filter(p => p.status === 'REJECTED').length || 0,
  };

  return (
    <div className="space-y-5 animate-in fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Payment Management</h3>
          <p className="text-sm text-gray-500 mt-0.5">Review and verify premium payment submissions for {collegeName}.</p>
        </div>
        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-semibold shadow-sm"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by username or UTR number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-gray-700 min-w-[160px]"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">⏳ Pending</option>
          <option value="VERIFIED">✅ Verified</option>
          <option value="REJECTED">❌ Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Student', 'UTR Number', 'Plan', 'Amount', 'Status', 'Submitted', 'Screenshot', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex items-center justify-center gap-3 text-gray-400">
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : !data?.content.length ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <IndianRupee size={40} className="mx-auto mb-3 opacity-20" />
                    <p>No payment records found.</p>
                  </td>
                </tr>
              ) : (
                data.content.map(payment => (
                  <React.Fragment key={payment.id}>
                    <tr
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === payment.id ? null : payment.id)}
                    >
                      {/* Student */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {payment.userFullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 whitespace-nowrap">{payment.userFullName}</p>
                            <p className="text-xs text-gray-400">{payment.username}</p>
                          </div>
                        </div>
                      </td>
                      {/* UTR */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {payment.utrNumber}
                        </span>
                      </td>
                      {/* Plan */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{payment.premiumMonthsLabel}</td>
                      {/* Amount */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-900">₹{payment.amount}</span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={payment.status} />
                      </td>
                      {/* Submitted */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {new Date(payment.submittedAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      {/* Screenshot */}
                      <td className="px-4 py-3">
                        {payment.paymentScreenshotUrl ? (
                          <button
                            onClick={e => { e.stopPropagation(); setScreenshotUrl(payment.paymentScreenshotUrl!); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Image size={12} /> View
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">No file</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        {payment.status === 'PENDING' && (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleVerify(payment)}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              {actionLoading === payment.id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : <CheckCircle size={12} />}
                              Verify
                            </button>
                            <button
                              onClick={() => setRejectTarget(payment)}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                        {payment.status === 'VERIFIED' && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle size={12} /> Verified
                            {payment.verifiedByAdminName && (
                              <span className="text-gray-400 ml-1">by {payment.verifiedByAdminName}</span>
                            )}
                          </span>
                        )}
                        {payment.status === 'REJECTED' && (
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            <XCircle size={12} /> Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                    {/* Expanded row: rejection reason or verified dates */}
                    {expandedRow === payment.id && (
                      <tr className="bg-blue-50/40">
                        <td colSpan={8} className="px-6 py-3 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-6">
                            <span className="flex items-center gap-1.5"><User size={14} className="text-gray-400" /> User ID: <code className="font-mono text-xs">{payment.userId}</code></span>
                            {payment.verifiedAt && (
                              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" />
                                {payment.status === 'VERIFIED' ? 'Verified' : 'Acted'} at: {new Date(payment.verifiedAt).toLocaleString('en-IN')}
                              </span>
                            )}
                            {payment.rejectionReason && (
                              <span className="flex items-center gap-1.5 text-red-700"><AlertTriangle size={14} /> Reason: <b>{payment.rejectionReason}</b></span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(data?.totalElements ?? 0) > 0 && (
          <div className="border-t">
            <TablePagination
              component="div"
              count={data?.totalElements || 0}
              page={page}
              onPageChange={(_e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </div>
        )}
      </div>

      {/* Screenshot Modal */}
      {screenshotUrl && (
        <ScreenshotModal url={screenshotUrl} onClose={() => setScreenshotUrl(null)} />
      )}

      {/* Reject Dialog */}
      {rejectTarget && (
        <RejectDialog
          payment={rejectTarget}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
          loading={actionLoading === rejectTarget.id}
        />
      )}
    </div>
  );
};

export default PaymentManagement;