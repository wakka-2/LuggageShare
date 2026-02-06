'use client';

import { use, useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageInput } from '@/components/messages/MessageInput';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, addMockMessage } from '@/lib/data/mockConversations';
import Link from 'next/link';
import type { Message } from '@/lib/types/message';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const conversation = MOCK_CONVERSATIONS.find((c) => c.id === id);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[id] || []);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!conversation) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">المحادثة غير موجودة</h1>
            <Link href="/messages" className="text-primary-600 hover:text-primary-700">
              العودة للرسائل
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSendMessage = (content: string) => {
    // Add message from current user
    const newMessage = addMockMessage(id, {
      conversationId: id,
      senderId: 'current_user',
      senderName: 'Current User',
      senderNameAr: 'المستخدم الحالي',
      content,
      contentAr: content,
    });

    setMessages([...messages, newMessage]);

    // Simulate typing indicator
    setIsTyping(true);

    // Simulate response after 2 seconds
    setTimeout(() => {
      setIsTyping(false);

      // Simulate auto-reply (simple echo for demo)
      const autoReply = addMockMessage(id, {
        conversationId: id,
        senderId: conversation.otherUser.id,
        senderName: conversation.otherUser.name,
        senderNameAr: conversation.otherUser.nameAr,
        content: 'تم استلام رسالتك! سأرد عليك قريباً.',
        contentAr: 'تم استلام رسالتك! سأرد عليك قريباً.',
      });

      setMessages((prev) => [...prev, autoReply]);
    }, 2000);
  };

  const getStatusColor = (status: typeof conversation.bookingStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'disputed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: typeof conversation.bookingStatus) => {
    switch (status) {
      case 'pending':
        return 'قيد المراجعة';
      case 'confirmed':
        return 'مؤكد';
      case 'in_transit':
        return 'قيد التوصيل';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغي';
      case 'disputed':
        return 'متنازع عليه';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <Link
                href="/messages"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </Link>

              {/* User Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                  {conversation.otherUser.nameAr.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">
                    {conversation.otherUser.nameAr}
                  </h2>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.from.code} → {conversation.to.code}
                  </p>
                </div>
              </div>

              {/* View Booking Button */}
              <Link
                href={`/bookings/${conversation.bookingId}`}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm whitespace-nowrap"
              >
                عرض الحجز
              </Link>
            </div>
          </div>
        </div>

        {/* Booking Context Card */}
        <div className="bg-primary-50 border-b border-primary-100 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {conversation.listingTitleAr}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {conversation.from.cityAr} → {conversation.to.cityAr}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(conversation.bookingStatus)}`}
            >
              {getStatusLabel(conversation.bookingStatus)}
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isFromCurrentUser={message.senderId === 'current_user'}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[75%]">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ابدأ المحادثة</h3>
                <p className="text-gray-600 mb-4">
                  أرسل رسالة لبدء المحادثة مع {conversation.otherUser.nameAr}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <MessageInput onSend={handleSendMessage} />
      </main>
    </div>
  );
}
