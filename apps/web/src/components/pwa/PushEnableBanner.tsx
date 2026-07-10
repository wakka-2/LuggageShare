'use client';

import { useState } from 'react';
import { BellRing } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// Opt-in card for OS-level push (arrives when the tab is closed). Renders only
// when the browser supports push and the user hasn't subscribed yet.
export default function PushEnableBanner() {
  const { permission, isSubscribed, isLoading, subscribe, sendTest } = usePushNotifications();
  const [done, setDone] = useState(false);

  if (permission === 'unsupported' || isSubscribed || done) return null;

  const blocked = permission === 'denied';

  const handleEnable = async () => {
    const ok = await subscribe();
    if (ok) {
      await sendTest();
      setDone(true);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-white rounded-[22px] p-4 shadow-bubble-sm mb-4">
      <div className="w-11 h-11 rounded-full v2-gradient-primary flex items-center justify-center shadow-bubble-xs flex-shrink-0">
        <BellRing className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-v2-text">فعّل إشعارات الجهاز</p>
        <p className="text-sm text-v2-text-soft">
          {blocked
            ? 'الإشعارات محظورة من إعدادات المتصفح — فعّلها من هناك أولاً'
            : 'استقبل تنبيهات الحجوزات والرسائل حتى عندما يكون التطبيق مغلقاً'}
        </p>
      </div>
      {!blocked && (
        <button
          onClick={handleEnable}
          disabled={isLoading}
          className="px-4 py-2 rounded-full text-sm font-semibold bg-v2-primary text-white
            shadow-bubble-xs hover:shadow-bubble-sm transition-all disabled:opacity-50
            disabled:cursor-not-allowed flex-shrink-0"
        >
          {isLoading ? '...' : 'تفعيل'}
        </button>
      )}
    </div>
  );
}
