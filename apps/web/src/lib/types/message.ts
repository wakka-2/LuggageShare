// Message and conversation types

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderNameAr: string;
  senderAvatar?: string;
  content: string;
  contentAr?: string;
  timestamp: string;
  isRead: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'other';
  url: string;
  name: string;
  size: number;
}

export interface Conversation {
  id: string;
  bookingId: string;
  listingTitle: string;
  listingTitleAr: string;

  // Route info
  from: {
    city: string;
    cityAr: string;
    code: string;
  };
  to: {
    city: string;
    cityAr: string;
    code: string;
  };

  // Other participant info
  otherUser: {
    id: string;
    name: string;
    nameAr: string;
    avatar?: string;
  };

  // Last message
  lastMessage?: {
    content: string;
    contentAr?: string;
    timestamp: string;
    isFromMe: boolean;
  };

  // Status
  unreadCount: number;
  bookingStatus: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled' | 'disputed';
  updatedAt: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  attachments?: File[];
}
