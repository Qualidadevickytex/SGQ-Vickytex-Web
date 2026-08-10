import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Excluir Permanentemente',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Error in confirm modal:', err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-amber-600 hover:bg-amber-500'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Excluindo...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
