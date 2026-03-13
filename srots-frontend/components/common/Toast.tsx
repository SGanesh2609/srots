import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id:      string;
  message: string;
  type:    ToastType;
}

export interface ToastContextValue {
  success: (message: string) => void;
  error:   (message: string) => void;
  warning: (message: string) => void;
  info:    (message: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * useToast — call this anywhere inside <ToastProvider> to show notifications.
 *
 * Example:
 *   const toast = useToast();
 *   toast.success('Job saved successfully.');
 *   toast.error('Failed to load data. Please retry.');
 */
export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

// ── Style maps ────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
};

const CONTAINER_STYLES: Record<ToastType, string> = {
  success: 'bg-green-50  border-green-200',
  error:   'bg-red-50    border-red-200',
  warning: 'bg-amber-50  border-amber-200',
  info:    'bg-blue-50   border-blue-200',
};

const TEXT_STYLES: Record<ToastType, string> = {
  success: 'text-green-800',
  error:   'text-red-800',
  warning: 'text-amber-800',
  info:    'text-blue-800',
};

const ICON_STYLES: Record<ToastType, string> = {
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
};

// ── Provider ──────────────────────────────────────────────────────────────────

const TOAST_DURATION_MS = 4500;
const MAX_VISIBLE       = 5;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback(
    (message: string, type: ToastType) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts(prev => [...prev.slice(-(MAX_VISIBLE - 1)), { id, message, type }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    success: useCallback((m) => add(m, 'success'), [add]),
    error:   useCallback((m) => add(m, 'error'),   [add]),
    warning: useCallback((m) => add(m, 'warning'), [add]),
    info:    useCallback((m) => add(m, 'info'),     [add]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* ── Toast Container ─────────────────────────────────────────────────── */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none"
      >
        {toasts.map(toast => {
          const Icon = ICONS[toast.type];
          return (
            <div
              key={toast.id}
              role="alert"
              className={[
                'flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg',
                'pointer-events-auto',
                'animate-in slide-in-from-right-4 fade-in duration-300',
                CONTAINER_STYLES[toast.type],
              ].join(' ')}
            >
              <Icon size={18} className={`shrink-0 mt-0.5 ${ICON_STYLES[toast.type]}`} />
              <p className={`flex-1 text-sm font-medium leading-snug ${TEXT_STYLES[toast.type]}`}>
                {toast.message}
              </p>
              <button
                onClick={() => dismiss(toast.id)}
                className={`shrink-0 opacity-50 hover:opacity-100 transition-opacity ${TEXT_STYLES[toast.type]}`}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
