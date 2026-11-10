import React, { useEffect } from 'react';
import { Undo2, X } from 'lucide-react';

interface UndoToastProps {
  isVisible: boolean;
  message: string;
  actionLabel: string;
  /** Milisegundos que permanece visible antes de auto-ocultarse. */
  durationMs?: number;
  onAction: () => void;
  onDismiss: () => void;
}

/**
 * Aviso flotante con una acción de "Deshacer".
 * Se auto-oculta tras `durationMs` para que la acción no quede pendiente
 * indefinidamente.
 */
export const UndoToast: React.FC<UndoToastProps> = ({
  isVisible,
  message,
  actionLabel,
  durationMs = 6000,
  onAction,
  onDismiss,
}) => {
  useEffect(() => {
    if (!isVisible) return;

    const timer = window.setTimeout(() => {
      onDismiss();
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [isVisible, durationMs, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0 z-[60] animate-in fade-in slide-in-from-bottom duration-200"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 bg-[#121c27] text-white pl-4 pr-2 py-2.5 rounded-2xl shadow-2xl border border-gray-700/40">
        <span className="text-xs font-semibold">{message}</span>
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-900 font-extrabold text-xs transition cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar aviso"
          className="w-6 h-6 rounded-lg hover:bg-white/10 text-gray-300 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
