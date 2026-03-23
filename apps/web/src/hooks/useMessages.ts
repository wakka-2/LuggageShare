import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

export interface ApiConversation {
  bookingId: string;
  otherUser: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isMe: boolean;
  } | null;
  unreadCount: number;
  route: string;
}

export interface ApiMessage {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export function useConversations() {
  const { isAuthenticated } = useAuth();

  return useQuery<ApiConversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/messages/conversations');
      return data;
    },
    enabled: isAuthenticated,
  });
}

export function useUnreadMessagesCount() {
  const { data: conversations } = useConversations();
  return conversations?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) ?? 0;
}

export function useMessages(bookingId: string | null) {
  return useQuery<ApiMessage[]>({
    queryKey: ['messages', bookingId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/messages/conversations/${bookingId}`);
      // API returns { messages: [...], nextCursor: ... }
      return data.messages ?? data;
    },
    enabled: !!bookingId,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, content }: { bookingId: string; content: string }) => {
      const { data } = await apiClient.post(`/messages/conversations/${bookingId}`, { content });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await apiClient.post(`/messages/conversations/${bookingId}/read`);
      return data;
    },
    onSuccess: (_data, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
