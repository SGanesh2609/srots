import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

/**
 * Component: BulkUploadResultModal
 * Path: components/common/BulkUploadResultModal.tsx
 *
 * Shared modal to display results after a bulk upload (students, CP users, etc.).
 * Shows success count, failure count, and a list of error messages.
 */

interface BulkUploadResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  success: number;
  failed: number;
  errors: string[];
  entityLabel?: string; // e.g. "Students", "CP Users", "Team Members"
}

export const BulkUploadResultModal: React.FC<BulkUploadResultModalProps> = ({
  isOpen,
  onClose,
  success,
  failed,
  errors,
  entityLabel = 'Records',
}) => {
  const hasErrors = errors.length > 0;
  const allFailed = success === 0 && failed > 0;
  const allSuccess = failed === 0 && !hasErrors;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Upload Results"
      maxWidth="max-w-lg"
    >
      <div className="p-6 space-y-4">

        {/* Summary row */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            success > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <CheckCircle
              size={28}
              className={success > 0 ? 'text-green-500' : 'text-gray-300'}
            />
            <div>
              <p className="text-2xl font-bold text-gray-900">{success}</p>
              <p className="text-xs text-gray-500 font-medium">{entityLabel} Created</p>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            failed > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <XCircle
              size={28}
              className={failed > 0 ? 'text-red-500' : 'text-gray-300'}
            />
            <div>
              <p className="text-2xl font-bold text-gray-900">{failed}</p>
              <p className="text-xs text-gray-500 font-medium">Failed</p>
            </div>
          </div>
        </div>

        {/* Status message */}
        {allSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
            <CheckCircle size={16} />
            All {entityLabel.toLowerCase()} were created successfully!
          </div>
        )}

        {allFailed && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
            <XCircle size={16} />
            Upload failed — no records were created.
          </div>
        )}

        {/* Error list */}
        {hasErrors && (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <AlertCircle size={15} className="text-amber-500" />
              Errors ({errors.length})
            </p>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-red-100 bg-red-50 p-3 space-y-1">
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-red-700 font-mono leading-relaxed">
                  {i + 1}. {err}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Template hint */}
        <p className="text-xs text-gray-400 leading-relaxed">
          Tip: Use the <strong>Template</strong> button to download the correct Excel format before uploading.
          Rows with invalid data are skipped and counted as failed.
        </p>
      </div>

      <div className="p-4 border-t bg-gray-50 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    </Modal>
  );
};