import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Refetch when a screen regains focus (tab switch, navigating back).
 *
 * Tab screens stay mounted, so React Query's refetch-on-mount never fires for
 * them; without this a booking accepted on the other side keeps showing
 * "Pending" until the cache goes stale. The first focus is skipped because the
 * query is already fetching on mount.
 */
export function useRefreshOnFocus(...refetchers: Array<() => unknown>) {
  const firstFocus = useRef(true);
  const latest = useRef(refetchers);
  latest.current = refetchers;

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      latest.current.forEach((refetch) => refetch());
    }, [])
  );
}
