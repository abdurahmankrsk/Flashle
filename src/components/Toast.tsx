import React, { useEffect } from 'react';
import { FlashEmblem } from './FlashEmblem';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 2500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
      <div className="bg-[#10121d] border-2 border-[#dc2626]/70 text-white font-tech font-bold uppercase tracking-wider px-4 py-2.5 rounded-[6px] shadow-2xl shadow-black/80 flex items-center gap-2.5 backdrop-blur-md text-xs sm:text-sm">
        <FlashEmblem size={22} variant="emblem" />
        <span>{message}</span>
      </div>
    </div>
  );
};
