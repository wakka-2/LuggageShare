import { api } from './client';

export interface ApiConversation {
  id: string;
  listingId: string | null;
  bookingId: string | null;
  participant1Id: string;
  participant2Id: string;
  lastMessageAt: string | null;
  createdAt: string;
  listing?: {
    id: string;
    title: string | null;
    titleAr: string | null;
    departureCity: string;
    arrivalCity: string;
  } | null;
  booking?: { id: string; status: string } | null;
  otherUser?: { id: string; name: string; avatarUrl: string | null };
  lastMessage?: { content: string; createdAt: string; senderId: string } | null;
  unreadCount?: number;
}

export interface ApiMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  sender?: { id: string; name: string; avatarUrl: string | null };
}

export function transformConversation(c: ApiConversation, currentUserId: string) {
  return {
    id: c.id,
    bookingId: c.bookingId || '',
    listingId: c.listingId || undefined,
    listingTitle: c.listing?.title || `${c.listing?.departureCity || ''} → ${c.listing?.arrivalCity || ''}`,
    listingTitleAr: c.listing?.titleAr || c.listing?.title || '',
    from: {
      city: c.listing?.departureCity || '',
      cityAr: c.listing?.departureCity || '',
      code: '',
    },
    to: {
      city: c.listing?.arrivalCity || '',
      cityAr: c.listing?.arrivalCity || '',
      code: '',
    },
    otherUser: {
      id: c.otherUser?.id || (c.participant1Id === currentUserId ? c.participant2Id : c.participant1Id),
      name: c.otherUser?.name || 'User',
      nameAr: c.otherUser?.name || 'مستخدم',
      avatar: c.otherUser?.avatarUrl || undefined,
    },
    lastMessage: c.lastMessage
      ? {
          content: c.lastMessage.content,
          timestamp: c.lastMessage.createdAt,
          isFromMe: c.lastMessage.senderId === currentUserId,
        }
      : undefined,
    unreadCount: c.unreadCount || 0,
    bookingStatus: c.booking?.status || 'pending',
    updatedAt: c.lastMessageAt || c.createdAt,
  };
}

export type ConversationView = ReturnType<typeof transformConversation>;

export function transformMessage(m: ApiMessage, currentUserId: string) {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: m.sender?.name || '',
    senderNameAr: m.sender?.name || '',
    content: m.content,
    timestamp: m.createdAt,
    isRead: m.isRead,
    isFromMe: m.senderId === currentUserId,
  };
}

export type MessageView = ReturnType<typeof transformMessage>;

export async function getConversations(currentUserId: string): Promise<ConversationView[]> {
  const { data } = await api.get<ApiConversation[]>('/messages/conversations');
  return data.map((c) => transformConversation(c, currentUserId));
}

export async function getMessages(conversationId: string, currentUserId: string): Promise<MessageView[]> {
  const { data } = await api.get<ApiMessage[]>(`/messages/conversations/${conversationId}`);
  return data.map((m) => transformMessage(m, currentUserId));
}

export async function sendMessage(conversationId: string, content: string): Promise<ApiMessage> {
  const { data } = await api.post<ApiMessage>(`/messages/conversations/${conversationId}`, {
    content,
    messageType: 'text',
  });
  return data;
}

export async function createConversation(
  userId: string,
  listingId?: string,
  initialMessage?: string
): Promise<ApiConversation> {
  const { data } = await api.post<ApiConversation>('/messages/conversations', {
    userId,
    listingId,
    initialMessage,
  });
  return data;
}

export async function markAsRead(conversationId: string): Promise<void> {
  await api.post(`/messages/conversations/${conversationId}/read`);
}
