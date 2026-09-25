import React from 'react';
import { ToastMsg } from '../types';

interface ToastContainerProps {
  toasts: ToastMsg[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto min-w-[300px] max-w-[420px] px-4 py-3 rounded-full font-mono-num text-[11px] tracking-wide border backdrop-blur-xl flex items-center justify-between gap-3 ${
            toast.type === 'info'
              ? 'bg-zinc-900/90 border-white/10 text-zinc-200'
              : toast.type === 'error'
              ? 'bg-red-950/80 border-red-800/40 text-red-300'
              : 'bg-[#FF6A00] text-black border-[#FF8A33] font-bold amber-glow'
          }`}
        >
          <span className="truncate">{toast.text}</span>
          <span className="text-[10px] opacity-60">Aries ↘</span>
        </div>
      ))}
    </div>
  );
};
