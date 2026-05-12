import { useEffect } from 'react';

interface ToastProps {
  message: string;
  icon?: string;
  visible: boolean;
  onHide?: () => void;
}

export function Toast({ message, icon, visible, onHide }: ToastProps) {
  useEffect(() => {
    if (!visible || !onHide) return;
    const timer = setTimeout(onHide, 2500);
    return () => clearTimeout(timer);
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div
      className="flex items-center gap-2.5 rounded-DEFAULT bg-fg px-4 py-3 text-sm text-bg"
      style={{
        animation: 'slideUp 0.3s ease',
      }}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {message}
    </div>
  );
}
