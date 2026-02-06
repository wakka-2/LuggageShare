'use client';

import Link from 'next/link';
import { Conversation } from '@/lib/types/message';

interface ConversationCardProps {
  conversation: Conversation;
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const getStatusColor = (status: Conversation['bookingStatus']) => {
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

  const getStatusLabel = (status: Conversation['bookingStatus']) => {
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('ar-SA', {
        weekday: 'short',
      });
    } else {
      return date.toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="block bg-white hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0"
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg flex-shrink-0">
            {conversation.otherUser.nameAr.charAt(0)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{conversation.otherUser.nameAr}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>
                    {conversation.from.code} → {conversation.to.code}
                  </span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(conversation.bookingStatus)}`}>
                    {getStatusLabel(conversation.bookingStatus)}
                  </span>
                </div>
              </div>
              {conversation.lastMessage && (
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatTime(conversation.lastMessage.timestamp)}
                </span>
              )}
            </div>

            {/* Last Message */}
            {conversation.lastMessage && (
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm truncate flex-1 ${
                    conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {conversation.lastMessage.isFromMe && (
                    <span className="text-gray-400 me-1">أنت: </span>
                  )}
                  {conversation.lastMessage.contentAr || conversation.lastMessage.content}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="flex-shrink-0 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
