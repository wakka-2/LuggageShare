'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Mobile-only bottom sheet. On md+ screens it renders nothing — callers
 * should keep their existing desktop UI alongside this component.
 *
 * Dismisses on: overlay tap, ESC key, close button.
 * Locks body scroll while open on mobile.
 */
export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Hidden entirely on desktop — callers provide their own desktop UI
  return (
    <div className="md:hidden">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed bottom-0 start-0 end-0 z-50 bg-white rounded-t-[28px] shadow-bubble-lg
          transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-12 h-1 rounded-full bg-v2-text-muted/30" />
        </div>

        {/* Header (only when title provided) */}
        {title && (
          <div className="flex items-center justify-between px-5 py-2">
            <h2 className="font-semibold text-base text-v2-text">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-full text-v2-text-muted hover:bg-v2-primary/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className="px-5 overflow-y-auto"
          style={{
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            maxHeight: '80dvh',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
