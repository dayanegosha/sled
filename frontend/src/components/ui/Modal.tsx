"use client";

import { useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
  /** @default true */
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
};

export default function Modal({
  open,
  onClose,
  children,
  title,
  closeOnBackdrop = true,
  showCloseButton,
}: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const showX = showCloseButton ?? !closeOnBackdrop;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === backdropRef.current) onClose?.();
      }}
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-white/12 bg-[#13151f] p-6 shadow-2xl">
        {showX && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        ) : null}
        {title && <h2 className={`mb-4 text-lg font-semibold ${showX ? 'pr-10' : ''}`}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
