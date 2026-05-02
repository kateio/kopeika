import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

export interface ToastData {
  message: string;
  icon?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastContextValue {
  toast: ToastData | null;
  showToast: (data: ToastData) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hideToast = useCallback(() => {
    setToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const showToast = useCallback(
    (data: ToastData) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast(data);
      timerRef.current = setTimeout(hideToast, data.duration ?? 3000);
    },
    [hideToast],
  );

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-24 left-4 right-4 z-[200] flex justify-center">
          <div
            className="flex items-center gap-2.5 rounded-card px-4 py-3 text-sm shadow-lg"
            style={{
              background: '#1A1A1E',
              color: '#FAF8F4',
              animation: 'slideUp 0.3s ease',
              maxWidth: 360,
            }}
          >
            {toast.icon && <span className="text-lg">{toast.icon}</span>}
            <span className="flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick();
                  hideToast();
                }}
                className="shrink-0 border-none bg-transparent text-sm font-semibold"
                style={{ color: '#D4F26A', cursor: 'pointer' }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
