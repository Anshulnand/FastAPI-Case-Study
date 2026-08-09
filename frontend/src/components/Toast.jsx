import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border ${
        isSuccess
          ? 'bg-slate-900/90 text-emerald-300 border-emerald-500/40'
          : 'bg-slate-900/90 text-rose-300 border-rose-500/40'
      }`}>
        {isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
        <span className="text-xs font-semibold">{toast.message}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
