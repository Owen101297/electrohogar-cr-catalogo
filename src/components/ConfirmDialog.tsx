import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Diálogo de confirmación genérico para acciones destructivas.
 * No conoce el dominio: recibe el texto ya listo para mostrar.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-red-600 mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black font-['Montserrat',sans-serif] text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">{message}</p>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-200 bg-white border border-gray-200 font-semibold text-xs transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-md"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
