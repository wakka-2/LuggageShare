import { useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { subscribeToChat } from '@/lib/realtime';

/**
 * Booking-chat realtime, backed by Supabase Realtime broadcast (was Socket.io).
 * Same interface as before so consumers need no changes:
 *  - new messages arrive via a `newMessage` broadcast the API sends on POST
 *  - messages are sent over REST (which triggers that broadcast server-side)
 *  - typing is an ephemeral client-to-client broadcast
 */
export function useSocket(bookingId: string | undefined) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingEmit = useRef(0);
  const channelRef = useRef<ReturnType<typeof subscribeToChat> | null>(null);
  const senderIdRef = useRef<string>('');

  useEffect(() => {
    if (!bookingId) return;
    let mounted = true;

    // Best-effort read of the current user id for typing attribution.
    try {
      const tokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}');
      senderIdRef.current = tokens?.user?.id ?? '';
    } catch {
      senderIdRef.current = '';
    }

    const sub = subscribeToChat(`booking:${bookingId}`, {
      onStatus: (subscribed) => mounted && setIsConnected(subscribed),
      onNewMessage: () => {
        queryClient.invalidateQueries({ queryKey: ['messages', bookingId] });
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
  }, [bookingId, queryClient]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!bookingId) return;
      // Persist via REST; the API broadcasts `newMessage` to subscribers.
      await apiClient.post(`/messages/conversations/${bookingId}`, { content });
      queryClient.invalidateQueries({ queryKey: ['messages', bookingId] });
    },
    [bookingId, queryClient]
  );

  const sendTyping = useCallback(() => {
    if (!bookingId) return;
    const now = Date.now();
    if (now - lastTypingEmit.current < 2000) return; // debounce
    lastTypingEmit.current = now;
    channelRef.current?.sendTyping(senderIdRef.current);
  }, [bookingId]);

  return { isConnected, sendMessage, sendTyping, isOtherTyping };
}
