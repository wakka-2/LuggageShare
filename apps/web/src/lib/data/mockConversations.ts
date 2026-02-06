import { Conversation, Message } from '../types/message';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    bookingId: 'b1',
    listingTitle: 'Trip to Dubai - 20kg Available',
    listingTitleAr: 'رحلة إلى دبي - 20 كيلو متاح',
    from: {
      city: 'Riyadh',
      cityAr: 'الرياض',
      code: 'RUH',
    },
    to: {
      city: 'Dubai',
      cityAr: 'دبي',
      code: 'DXB',
    },
    otherUser: {
      id: 'u1',
      name: 'Ahmed Al-Rashid',
      nameAr: 'أحمد الرشيد',
      avatar: undefined,
    },
    lastMessage: {
      content: 'Great! Thank you. Looking forward to it.',
      contentAr: 'رائع! شكراً لك. متطلع للقائك.',
      timestamp: '2024-02-10T11:00:00Z',
      isFromMe: true,
    },
    unreadCount: 0,
    bookingStatus: 'confirmed',
    updatedAt: '2024-02-10T11:00:00Z',
  },
  {
    id: 'conv2',
    bookingId: 'b2',
    listingTitle: 'Amman Weekly Trip - Large Capacity',
    listingTitleAr: 'رحلة عمان الأسبوعية - سعة كبيرة',
    from: {
      city: 'Riyadh',
      cityAr: 'الرياض',
      code: 'RUH',
    },
    to: {
      city: 'Amman',
      cityAr: 'عمان',
      code: 'AMM',
    },
    otherUser: {
      id: 'u3',
      name: 'Khalid Ibrahim',
      nameAr: 'خالد إبراهيم',
      avatar: undefined,
    },
    lastMessage: {
      content: 'I received your booking request. Will confirm soon!',
      contentAr: 'استلمت طلب الحجز. سأؤكد قريباً!',
      timestamp: '2024-02-13T15:00:00Z',
      isFromMe: false,
    },
    unreadCount: 1,
    bookingStatus: 'pending',
    updatedAt: '2024-02-13T15:00:00Z',
  },
  {
    id: 'conv3',
    bookingId: 'b3',
    listingTitle: 'Cairo Trip - Documents & Small Items',
    listingTitleAr: 'رحلة القاهرة - مستندات وأغراض صغيرة',
    from: {
      city: 'Jeddah',
      cityAr: 'جدة',
      code: 'JED',
    },
    to: {
      city: 'Cairo',
      cityAr: 'القاهرة',
      code: 'CAI',
    },
    otherUser: {
      id: 'u2',
      name: 'Fatima Mohammed',
      nameAr: 'فاطمة محمد',
      avatar: undefined,
    },
    lastMessage: {
      content: 'Package delivered successfully! Have a great day.',
      contentAr: 'تم توصيل الطرد بنجاح! يوم سعيد.',
      timestamp: '2024-01-26T08:00:00Z',
      isFromMe: false,
    },
    unreadCount: 0,
    bookingStatus: 'delivered',
    updatedAt: '2024-01-26T08:00:00Z',
  },
  {
    id: 'conv4',
    bookingId: 'b4',
    listingTitle: 'Istanbul Weekend Trip',
    listingTitleAr: 'رحلة نهاية الأسبوع لإسطنبول',
    from: {
      city: 'Dubai',
      cityAr: 'دبي',
      code: 'DXB',
    },
    to: {
      city: 'Istanbul',
      cityAr: 'إسطنبول',
      code: 'IST',
    },
    otherUser: {
      id: 'u4',
      name: 'Sarah Hassan',
      nameAr: 'سارة حسن',
      avatar: undefined,
    },
    lastMessage: {
      content: 'When can we meet for the handoff?',
      contentAr: 'متى يمكننا اللقاء لتسليم الطرد؟',
      timestamp: '2024-02-14T16:30:00Z',
      isFromMe: false,
    },
    unreadCount: 2,
    bookingStatus: 'confirmed',
    updatedAt: '2024-02-14T16:30:00Z',
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  conv1: [
    {
      id: 'm1',
      conversationId: 'conv1',
      senderId: 'u1',
      senderName: 'Ahmed Al-Rashid',
      senderNameAr: 'أحمد الرشيد',
      content: 'Hi! I confirmed your booking. See you at the mall!',
      contentAr: 'مرحباً! لقد أكدت حجزك. أراك في المول!',
      timestamp: '2024-02-10T10:30:00Z',
      isRead: true,
    },
    {
      id: 'm2',
      conversationId: 'conv1',
      senderId: 'current_user',
      senderName: 'Current User',
      senderNameAr: 'المستخدم الحالي',
      content: 'Great! Thank you. Looking forward to it.',
      contentAr: 'رائع! شكراً لك. متطلع للقائك.',
      timestamp: '2024-02-10T11:00:00Z',
      isRead: true,
    },
  ],
  conv2: [
    {
      id: 'm3',
      conversationId: 'conv2',
      senderId: 'current_user',
      senderName: 'Current User',
      senderNameAr: 'المستخدم الحالي',
      content: 'Hello, I would like to book space for important documents.',
      contentAr: 'مرحباً، أود حجز مساحة لمستندات مهمة.',
      timestamp: '2024-02-13T14:30:00Z',
      isRead: true,
    },
    {
      id: 'm4',
      conversationId: 'conv2',
      senderId: 'u3',
      senderName: 'Khalid Ibrahim',
      senderNameAr: 'خالد إبراهيم',
      content: 'I received your booking request. Will confirm soon!',
      contentAr: 'استلمت طلب الحجز. سأؤكد قريباً!',
      timestamp: '2024-02-13T15:00:00Z',
      isRead: false,
    },
  ],
  conv3: [
    {
      id: 'm5',
      conversationId: 'conv3',
      senderId: 'current_user',
      senderName: 'Current User',
      senderNameAr: 'المستخدم الحالي',
      content: 'Thank you so much for delivering safely!',
      contentAr: 'شكراً جزيلاً على التوصيل الآمن!',
      timestamp: '2024-01-26T07:30:00Z',
      isRead: true,
    },
    {
      id: 'm6',
      conversationId: 'conv3',
      senderId: 'u2',
      senderName: 'Fatima Mohammed',
      senderNameAr: 'فاطمة محمد',
      content: 'Package delivered successfully! Have a great day.',
      contentAr: 'تم توصيل الطرد بنجاح! يوم سعيد.',
      timestamp: '2024-01-26T08:00:00Z',
      isRead: true,
    },
  ],
  conv4: [
    {
      id: 'm7',
      conversationId: 'conv4',
      senderId: 'u4',
      senderName: 'Sarah Hassan',
      senderNameAr: 'سارة حسن',
      content: 'Hi! I accepted your booking.',
      contentAr: 'مرحباً! لقد قبلت حجزك.',
      timestamp: '2024-02-14T14:00:00Z',
      isRead: true,
    },
    {
      id: 'm8',
      conversationId: 'conv4',
      senderId: 'current_user',
      senderName: 'Current User',
      senderNameAr: 'المستخدم الحالي',
      content: 'Perfect! I will be ready.',
      contentAr: 'ممتاز! سأكون جاهزاً.',
      timestamp: '2024-02-14T15:00:00Z',
      isRead: true,
    },
    {
      id: 'm9',
      conversationId: 'conv4',
      senderId: 'u4',
      senderName: 'Sarah Hassan',
      senderNameAr: 'سارة حسن',
      content: 'When can we meet for the handoff?',
      contentAr: 'متى يمكننا اللقاء لتسليم الطرد؟',
      timestamp: '2024-02-14T16:30:00Z',
      isRead: false,
    },
    {
      id: 'm10',
      conversationId: 'conv4',
      senderId: 'u4',
      senderName: 'Sarah Hassan',
      senderNameAr: 'سارة حسن',
      content: 'I am flexible with the timing, just let me know.',
      contentAr: 'أنا مرنة مع الوقت، فقط أخبرني.',
      timestamp: '2024-02-14T16:32:00Z',
      isRead: false,
    },
  ],
};

// Helper function to add a new message to the mock data
export function addMockMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) {
  const newMessage: Message = {
    ...message,
    id: `m${Date.now()}`,
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  if (!MOCK_MESSAGES[conversationId]) {
    MOCK_MESSAGES[conversationId] = [];
  }

  MOCK_MESSAGES[conversationId].push(newMessage);

  // Update conversation's last message
  const conversation = MOCK_CONVERSATIONS.find((c) => c.id === conversationId);
  if (conversation) {
    conversation.lastMessage = {
      content: newMessage.content,
      contentAr: newMessage.contentAr,
      timestamp: newMessage.timestamp,
      isFromMe: newMessage.senderId === 'current_user',
    };
    conversation.updatedAt = newMessage.timestamp;
  }

  return newMessage;
}
