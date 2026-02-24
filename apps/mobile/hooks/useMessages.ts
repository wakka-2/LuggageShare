import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface ApiConversation {
  bookingId: string;
  otherUser: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  listing: {
    departureCity: string;
    arrivalCity: string;
  };
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
  return useQuery<ApiConversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/messages/conversations');
      return data;
    },
  });
}

export function useMessages(bookingId: string | null) {
  return useQuery<ApiMessage[]>({
    queryKey: ['messages', bookingId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/messages/conversations/${bookingId}`);
      return data;
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
