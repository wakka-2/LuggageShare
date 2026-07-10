'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'luggageshare_install_dismissed';

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY) === '1' || isStandalone()) return;
    setDismissed(false);

    if (isIos()) {
      setShowIosHint(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  if (dismissed || (!deferredPrompt && !showIosHint)) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:w-80 z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg p-4">
      <button
        onClick={dismiss}
        className="absolute top-2 left-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        aria-label="إغلاق"
      >
        <X className="w-4 h-4" />
      </button>

      {showIosHint ? (
        <div className="pr-2">
          <p className="font-semibold text-sm mb-1">ثبّت حصتي على شاشتك الرئيسية</p>
          <p className="text-sm text-neutral-500 flex items-center gap-1 flex-wrap">
            اضغط على زر المشاركة <Share className="w-4 h-4 inline" /> ثم اختر «إضافة إلى الشاشة
            الرئيسية»
          </p>
        </div>
      ) : (
        <div className="pr-2">
          <p className="font-semibold text-sm mb-1">ثبّت حصتي كتطبيق</p>
          <p className="text-sm text-neutral-500 mb-3">
            وصول أسرع من شاشتك الرئيسية، بدون فتح المتصفح
          </p>
          <button
            onClick={install}
            className="w-full flex items-center justify-center gap-2 bg-[#7C6AFF] text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            تثبيت التطبيق
          </button>
        </div>
      )}
    </div>
  );
}
