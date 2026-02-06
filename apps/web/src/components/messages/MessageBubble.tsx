'use client';

import { Message } from '@/lib/types/message';

interface MessageBubbleProps {
  message: Message;
  isFromCurrentUser: boolean;
}

export function MessageBubble({ message, isFromCurrentUser }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${isFromCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isFromCurrentUser && (
          <span className="text-xs text-gray-500 mb-1 px-1">{message.senderNameAr}</span>
        )}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isFromCurrentUser
              ? 'bg-primary-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.contentAr || message.content}
          </p>
          <div
            className={`text-xs mt-1 ${
              isFromCurrentUser ? 'text-primary-100' : 'text-gray-500'
            }`}
          >
            {formatTime(message.timestamp)}
            {isFromCurrentUser && (
              <span className="ms-1">{message.isRead ? '✓✓' : '✓'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
