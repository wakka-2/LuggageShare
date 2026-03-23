'use client';

import { useState } from 'react';

const IMAGE_PREFIX = '[image]';

interface ChatBubbleProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    sender?: { name: string; avatarUrl: string | null };
    createdAt: string;
  };
  isOwn: boolean;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function isImageMessage(content: string): boolean {
  return content.startsWith(IMAGE_PREFIX);
}

function getImageUrl(content: string): string {
  return content.slice(IMAGE_PREFIX.length).trim();
}

function ImagePreview({ src, isOwn }: { src: string; isOwn: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={`block overflow-hidden ${
          isOwn ? 'rounded-[18px] rounded-br-[6px]' : 'rounded-[18px] rounded-bl-[6px]'
        }`}
      >
        <img
          src={src}
          alt=""
          className="max-w-full max-h-[240px] object-cover rounded-inherit"
          loading="lazy"
        />
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setExpanded(false)}
        >
          <img
            src={src}
            alt=""
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

export default function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const isImage = isImageMessage(message.content);

  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar for other user */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-v2-primary/10 flex items-center justify-center text-sm font-bold text-v2-primary flex-shrink-0">
          {message.sender?.avatarUrl ? (
            <img
              src={message.sender.avatarUrl}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            getInitial(message.sender?.name || '؟')
          )}
        </div>
      )}

      {/* Bubble */}
      <div className="max-w-[75%] flex flex-col gap-1">
        {isImage ? (
          <ImagePreview src={getImageUrl(message.content)} isOwn={isOwn} />
        ) : (
          <div
            className={`px-4 py-2.5 ${
              isOwn
                ? 'v2-gradient-primary text-white rounded-[18px] rounded-br-[6px]'
                : 'bg-white shadow-bubble-xs text-v2-text rounded-[18px] rounded-bl-[6px]'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
        <span
          className={`text-[10px] text-v2-text-muted ${
            isOwn ? 'text-left rtl:text-right' : 'text-right rtl:text-left'
          }`}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

export { IMAGE_PREFIX };
