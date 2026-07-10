'use client';

import { useCallback, useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { urlBase64ToUint8Array } from '@/lib/push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type PushPermission = NotificationPermission | 'unsupported';

// OS-level push subscription. Separate from useNotifications (the in-app list) —
// this manages the browser's PushManager subscription and registers it with the
// backend so notifications arrive even when no tab is open.
export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setIsSubscribed(Boolean(sub)))
      .catch(() => undefined);
  }, []);

  const subscribe = useCallback(async () => {
    if (!VAPID_PUBLIC_KEY || permission === 'unsupported') return false;

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return false;

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      }

      await apiClient.post('/notifications/register-token', {
        token: JSON.stringify(subscription),
        platform: 'web',
      });

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [permission]);

  const sendTest = useCallback(async () => {
    await apiClient.post('/notifications/test');
  }, []);

  return { permission, isSubscribed, isLoading, subscribe, sendTest };
}
