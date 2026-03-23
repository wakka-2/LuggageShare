import { useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';

export function useOfferSocket(offerId: string | undefined) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingEmit = useRef(0);

  useEffect(() => {
    if (!offerId) return;

    let mounted = true;

    const setup = async () => {
      try {
        await connectSocket();
        const socket = getSocket();

        if (!mounted) return;
        setIsConnected(socket.connected);

        // Join the offer room
        socket.emit('joinOffer', { offerId });

        // Listen for new offer messages
        socket.on('newOfferMessage', () => {
          queryClient.invalidateQueries({ queryKey: ['offerMessages', offerId] });
        });

        // Listen for typing indicators
        socket.on('offerUserTyping', () => {
          if (!mounted) return;
          setIsOtherTyping(true);
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => {
            if (mounted) setIsOtherTyping(false);
          }, 3000);
        });

        socket.on('connect', () => mounted && setIsConnected(true));
        socket.on('disconnect', () => mounted && setIsConnected(false));
      } catch {
        // Socket connection failed — fall back silently
      }
    };

    setup();

    return () => {
      mounted = false;
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      const socket = getSocket();
      socket.emit('leaveOffer', { offerId });
      socket.off('newOfferMessage');
      socket.off('offerUserTyping');
      socket.off('connect');
      socket.off('disconnect');
      disconnectSocket();
    };
  }, [offerId, queryClient]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!offerId) return;
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('sendOfferMessage', { offerId, content });
      }
    },
    [offerId]
  );

  const sendTyping = useCallback(() => {
    if (!offerId) return;
    const now = Date.now();
    if (now - lastTypingEmit.current < 2000) return;
    lastTypingEmit.current = now;
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('offerTyping', { offerId });
    }
  }, [offerId]);

  return { isConnected, sendMessage, sendTyping, isOtherTyping };
}
