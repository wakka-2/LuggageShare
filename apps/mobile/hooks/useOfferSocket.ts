import { useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { tokenStorage } from '@/lib/storage';
import { subscribeToChat } from '@/lib/realtime';

/**
 * Offer-chat realtime, backed by Supabase Realtime broadcast (was Socket.io).
 * Same interface as before so the offer-chat screen needs no changes:
 *  - new messages arrive via a `newMessage` broadcast the API sends on POST
 *  - sendMessage persists over REST (which triggers that broadcast server-side)
 *  - typing is an ephemeral client-to-client broadcast
 */
export function useOfferSocket(offerId: string | undefined) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingEmit = useRef(0);
  const channelRef = useRef<ReturnType<typeof subscribeToChat> | null>(null);
  const senderIdRef = useRef<string>('');

  useEffect(() => {
    if (!offerId) return;
    let mounted = true;

    tokenStorage
      .getItem('auth_tokens')
      .then((json) => {
        try {
          senderIdRef.current = json ? (JSON.parse(json)?.user?.id ?? '') : '';
        } catch {
          senderIdRef.current = '';
        }
      })
      .catch(() => {
        senderIdRef.current = '';
      });

    const sub = subscribeToChat(`offer:${offerId}`, {
      onStatus: (subscribed) => mounted && setIsConnected(subscribed),
      onNewMessage: () => {
        queryClient.invalidateQueries({ queryKey: ['offerMessages', offerId] });
      },
      onTyping: () => {
        if (!mounted) return;
        setIsOtherTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => mounted && setIsOtherTyping(false), 3000);
      },
    });
    channelRef.current = sub;

    return () => {
      mounted = false;
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      sub.unsubscribe();
      channelRef.current = null;
    };
  }, [offerId, queryClient]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!offerId) return;
      // Persist via REST; the API broadcasts `newMessage` to subscribers.
      await apiClient.post(`/messages/offers/${offerId}`, { content });
      queryClient.invalidateQueries({ queryKey: ['offerMessages', offerId] });
    },
    [offerId, queryClient]
  );

  const sendTyping = useCallback(() => {
    if (!offerId) return;
    const now = Date.now();
    if (now - lastTypingEmit.current < 2000) return; // debounce
    lastTypingEmit.current = now;
    channelRef.current?.sendTyping(senderIdRef.current);
  }, [offerId]);

  return { isConnected, sendMessage, sendTyping, isOtherTyping };
}
