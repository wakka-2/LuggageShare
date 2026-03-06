import { useCallback } from 'react';
import { useRouter } from 'expo-router';

/**
 * Reliable back navigation that falls back to the home tab
 * when there is no history (e.g. page refresh, direct URL on web).
 */
export function useGoBack() {
  const router = useRouter();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  }, [router]);
}
