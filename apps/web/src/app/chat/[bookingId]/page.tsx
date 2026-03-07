'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { Header } from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ChatBubble from '@/components/chat/ChatBubble';
import { useMessages, useSendMessage, useMarkAsRead } from '@/hooks/useMessages';
import { useSocket } from '@/hooks/useSocket';
import { useBooking } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Send, ArrowRight, Package, Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Status label mapping (Arabic)                                     */
/* ------------------------------------------------------------------ */
const STATUS_LABELS: Record<string, string> = {
  pending: 'في الانتظار',
  accepted: 'مقبول',
  rejected: 'مرفوض',
  picked_up: 'تم الاستلام',
  in_transit: 'قيد التوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-v2-amber/15 text-v2-amber',
  accepted: 'bg-v2-mint/15 text-v2-mint',
  rejected: 'bg-v2-secondary/15 text-v2-secondary',
  picked_up: 'bg-v2-sky/15 text-v2-sky',
  in_transit: 'bg-v2-primary/15 text-v2-primary',
  delivered: 'bg-v2-mint/15 text-v2-mint',
  cancelled: 'bg-v2-secondary/15 text-v2-secondary',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'short',
  });
}

/* ------------------------------------------------------------------ */
/*  Typing Indicator                                                  */
/* ------------------------------------------------------------------ */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-v2-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-xs text-v2-primary font-bold">...</span>
      </div>
      <div className="bg-white shadow-bubble-xs rounded-[18px] rounded-bl-[6px] px-4 py-3">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full bg-v2-text-muted animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-v2-text-muted animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-v2-text-muted animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Date Divider                                                      */
/* ------------------------------------------------------------------ */
function DateDivider({ date }: { date: string }) {
  const formatted = new Date(date).toLocaleDateString('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-v2-primary/10" />
      <span className="text-xs text-v2-text-muted font-medium px-3 py-1 bg-v2-bg rounded-full">
        {formatted}
      </span>
      <div className="flex-1 h-px bg-v2-primary/10" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Chat Page                                                    */
/* ------------------------------------------------------------------ */
export default function ChatPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;

  const { user } = useAuth();
  const { data: messages, isLoading: messagesLoading } = useMessages(bookingId ?? null);
  const { data: booking, isLoading: bookingLoading } = useBooking(bookingId ?? null);
  const {
    isConnected,
    sendMessage: socketSendMessage,
    sendTyping,
    isOtherTyping,
  } = useSocket(bookingId);
  const sendMsgMutation = useSendMessage();
  const markAsRead = useMarkAsRead();

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---- Determine the other user in the conversation ---- */
  const otherUser = booking
    ? user?.id === booking.senderId
      ? booking.carrier
      : booking.sender
    : null;

  /* ---- Mark messages as read on mount ---- */
  useEffect(() => {
    if (bookingId) {
      markAsRead.mutate(bookingId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  /* ---- Auto-scroll to bottom on new messages ---- */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages, scrollToBottom]);

  // Also scroll on typing indicator
  useEffect(() => {
    if (isOtherTyping) {
      scrollToBottom('smooth');
    }
  }, [isOtherTyping, scrollToBottom]);

  // Initial scroll (instant, not smooth)
  useEffect(() => {
    if (messages && messages.length > 0) {
      // Small delay to allow DOM rendering
      const timer = setTimeout(() => scrollToBottom('instant'), 100);
      return () => clearTimeout(timer);
    }
  }, [messagesLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Handle typing indicator ---- */
  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      sendTyping();
    },
    [sendTyping]
  );

  /* ---- Handle send ---- */
  const handleSend = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const content = inputValue.trim();
      if (!content || !bookingId || isSending) return;

      setIsSending(true);
      setInputValue('');

      try {
        // Send via WebSocket for real-time delivery
        socketSendMessage(content);
        // Persist via REST mutation
        await sendMsgMutation.mutateAsync({ bookingId, content });
      } catch {
        // If REST fails, the socket send may have still worked.
        // Message will appear on next poll cycle from useMessages refetchInterval.
      } finally {
        setIsSending(false);
        inputRef.current?.focus();
      }
    },
    [inputValue, bookingId, isSending, socketSendMessage, sendMsgMutation]
  );

  /* ---- Handle Enter key ---- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  /* ---- Group messages by date for date dividers ---- */
  function getDateKey(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-CA'); // YYYY-MM-DD
  }

  /* ---- Render ---- */
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-v2-bg">
        {/* ============ App Header ============ */}
        <Header />

        {/* ============ Chat Container ============ */}
        <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto overflow-hidden">
          {/* ---- Chat Header ---- */}
          <div className="bg-white shadow-bubble-sm px-4 py-3 flex items-center gap-3 z-10">
            {/* Back button */}
            <Link
              href="/messages"
              className="w-10 h-10 rounded-full flex items-center justify-center text-v2-text-soft hover:bg-v2-primary/5 hover:text-v2-primary transition-all flex-shrink-0"
              aria-label="العودة للرسائل"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Other user info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar */}
              {bookingLoading ? (
                <div className="w-10 h-10 rounded-full bg-v2-primary/10 animate-pulse flex-shrink-0" />
              ) : otherUser?.avatarUrl ? (
                <img
                  src={otherUser.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-v2-primary/10 flex items-center justify-center text-base font-bold text-v2-primary flex-shrink-0">
                  {otherUser ? getInitial(otherUser.name) : '؟'}
                </div>
              )}

              {/* Name + Route */}
              <div className="flex-1 min-w-0">
                {bookingLoading ? (
                  <div className="space-y-1.5">
                    <div className="h-4 w-24 bg-v2-primary/10 rounded-full animate-pulse" />
                    <div className="h-3 w-36 bg-v2-primary/5 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <>
                    <h2 className="font-bold text-v2-text truncate text-sm">
                      {otherUser?.name || 'مستخدم'}
                    </h2>
                    {booking?.listing && (
                      <p className="text-xs text-v2-text-muted flex items-center gap-1 truncate">
                        <Package className="w-3 h-3 flex-shrink-0" />
                        <span>
                          {booking.listing.departureCity} &larr; {booking.listing.arrivalCity}
                        </span>
                        <span className="mx-1">-</span>
                        <span>{formatDate(booking.listing.departureDate)}</span>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Status badge + connection indicator */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {booking && (
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    STATUS_COLORS[booking.status] || 'bg-v2-primary/10 text-v2-primary'
                  }`}
                >
                  {STATUS_LABELS[booking.status] || booking.status}
                </span>
              )}
              <div className="flex items-center gap-1.5" title={isConnected ? 'متصل' : 'غير متصل'}>
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isConnected ? 'bg-v2-mint' : 'bg-v2-text-muted'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ---- Messages Area ---- */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            dir="rtl"
          >
            {messagesLoading ? (
              /* Loading skeleton */
              <div className="flex flex-col gap-4 py-8">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex items-end gap-2 ${
                      i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-v2-primary/10 animate-pulse flex-shrink-0" />
                    <div
                      className={`rounded-[18px] animate-pulse ${
                        i % 2 === 0 ? 'bg-v2-primary/15' : 'bg-white shadow-bubble-xs'
                      }`}
                      style={{
                        width: `${40 + Math.random() * 35}%`,
                        height: `${36 + Math.random() * 24}px`,
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : !messages || messages.length === 0 ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center h-full py-20">
                <div className="w-20 h-20 rounded-full bg-v2-primary/10 flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-v2-primary" />
                </div>
                <h3 className="text-lg font-bold text-v2-text mb-1">ابدأ المحادثة</h3>
                <p className="text-sm text-v2-text-muted text-center max-w-[240px]">
                  أرسل رسالة للتنسيق حول تفاصيل الشحنة
                </p>
              </div>
            ) : (
              /* Message list with date dividers */
              (() => {
                let lastDateKey = '';
                return messages.map((msg) => {
                  const dateKey = getDateKey(msg.createdAt);
                  const showDivider = dateKey !== lastDateKey;
                  lastDateKey = dateKey;

                  const isOwn = msg.senderId === user?.id;

                  return (
                    <div key={msg.id}>
                      {showDivider && <DateDivider date={msg.createdAt} />}
                      <ChatBubble
                        message={{
                          id: msg.id,
                          content: msg.content,
                          senderId: msg.senderId,
                          sender: msg.sender
                            ? { name: msg.sender.name, avatarUrl: msg.sender.avatarUrl }
                            : undefined,
                          createdAt: msg.createdAt,
                        }}
                        isOwn={isOwn}
                      />
                    </div>
                  );
                });
              })()
            )}

            {/* Typing indicator */}
            {isOtherTyping && <TypingIndicator />}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* ---- Input Area ---- */}
          <div className="bg-white border-t border-v2-primary/10 px-4 py-3">
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 max-w-3xl mx-auto"
              dir="rtl"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك..."
                className="flex-1 bg-v2-bg border border-v2-primary/10 rounded-full px-5 py-2.5 text-sm text-v2-text placeholder:text-v2-text-muted focus:outline-none focus:border-v2-primary/30 focus:ring-2 focus:ring-v2-primary/10 transition-all"
                aria-label="اكتب رسالتك"
                autoComplete="off"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isSending}
                className="w-10 h-10 rounded-full v2-gradient-primary flex items-center justify-center text-white shadow-bubble-xs hover:shadow-bubble-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                aria-label="إرسال"
              >
                {isSending ? (
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                ) : (
                  <Send className="w-[18px] h-[18px] rtl:rotate-180" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
