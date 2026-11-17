import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

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
  return useQuery<ApiConversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/messages/conversations');
      return data.data ?? data;
    },
  });
}

export function useMessages(bookingId: string | null) {
  return useQuery<ApiMessage[]>({
    queryKey: ['messages', bookingId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/messages/conversations/${bookingId}`);
      // API returns { messages: [...], nextCursor: ... }
      const result = data.data ?? data;
      return result.messages ?? result;
    },
    enabled: !!bookingId,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  type SendVars = { bookingId: string; content: string; sender?: ApiMessage['sender'] };

  return useMutation({
    mutationFn: async ({ bookingId, content }: SendVars) => {
      const { data } = await apiClient.post(`/messages/conversations/${bookingId}`, { content });
      return (data?.data ?? data) as ApiMessage;
    },
    // Show the message immediately instead of waiting for the next 5s poll.
    onMutate: async ({ bookingId, content, sender }: SendVars) => {
      if (!sender) return { tempId: null };
      const key = ['messages', bookingId];
      await queryClient.cancelQueries({ queryKey: key });
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData<ApiMessage[]>(key, (old = []) => [
        ...old,
        {
          id: tempId,
          bookingId,
          senderId: sender.id,
          content,
          isRead: false,
          createdAt: new Date().toISOString(),
          sender,
        },
      ]);
      return { tempId };
    },
    onSuccess: (saved, { bookingId }, ctx) => {
      if (saved?.id) {
        queryClient.setQueryData<ApiMessage[]>(['messages', bookingId], (old = []) => {
          const withoutTemp = old.filter((m) => m.id !== ctx?.tempId && m.id !== saved.id);
          return [...withoutTemp, saved];
        });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (_err, { bookingId }, ctx) => {
      if (ctx?.tempId) {
        queryClient.setQueryData<ApiMessage[]>(['messages', bookingId], (old = []) =>
          old.filter((m) => m.id !== ctx.tempId)
        );
      }
    },
    onSettled: (_d, _e, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', bookingId] });
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
