'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  markAsRead,
} from '@/lib/api/messages';
import { useAuth } from '@/lib/contexts/AuthContext';

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(user?.id || ''),
    enabled: !!user?.id,
    refetchInterval: 10000, // Poll every 10 seconds for new messages
    retry: 1,
  });
}

export function useMessages(conversationId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId, user?.id || ''),
    enabled: !!conversationId && !!user?.id,
    refetchInterval: 5000, // Poll every 5 seconds in active chat
    retry: 1,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      listingId,
      initialMessage,
    }: {
      userId: string;
      listingId?: string;
      initialMessage?: string;
    }) => createConversation(userId, listingId, initialMessage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkAsRead(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
