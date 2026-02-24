import { useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';

export function useSocket(bookingId: string | undefined) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingEmit = useRef(0);

  useEffect(() => {
    if (!bookingId) return;

    let mounted = true;

    const setup = async () => {
      try {
        await connectSocket();
        const socket = getSocket();

        if (!mounted) return;
        setIsConnected(socket.connected);

        // Join the booking room
        socket.emit('joinBooking', { bookingId });

        // Listen for new messages
        socket.on('newMessage', () => {
          queryClient.invalidateQueries({ queryKey: ['messages', bookingId] });
        });

        // Listen for typing indicators
        socket.on('userTyping', () => {
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
        // Socket connection failed — fall back to REST polling silently
      }
    };

    setup();

    return () => {
      mounted = false;
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      const socket = getSocket();
      socket.emit('leaveBooking', { bookingId });
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('connect');
      socket.off('disconnect');
      disconnectSocket();
    };
  }, [bookingId, queryClient]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!bookingId) return;
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('sendMessage', { bookingId, content });
      }
    },
    [bookingId]
  );

  const sendTyping = useCallback(() => {
    if (!bookingId) return;
    const now = Date.now();
    // Debounce: only emit once per 2 seconds
    if (now - lastTypingEmit.current < 2000) return;
    lastTypingEmit.current = now;
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('typing', { bookingId });
    }
  }, [bookingId]);

  return { isConnected, sendMessage, sendTyping, isOtherTyping };
}
