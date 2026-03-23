'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  ArrowLeft,
  Plane,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useOffer, useAcceptOffer, useRejectOffer, useWithdrawOffer } from '@/hooks/useOffers';
import { getSocket, connectSocket } from '@/lib/socket';
import { Header } from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ChatBubble from '@/components/chat/ChatBubble';
import apiClient from '@/lib/api';

/* ─────────────────────────────── Types ──────────────────────────────── */
interface OfferMessage {
  id: string;
  offerId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

/* ─────────────────────────────── Local Hooks ───────────────────────── */
function useOfferMessages(offerId: string | null) {
  return useQuery<OfferMessage[]>({
    queryKey: ['offerMessages', offerId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/messages/offers/${offerId}`);
      return data.data ?? data;
    },
    enabled: !!offerId,
    refetchInterval: 5000,
  });
}

function useSendOfferMessage(offerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await apiClient.post(`/messages/offers/${offerId}`, { content });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offerMessages', offerId] });
    },
  });
}

/* ─────────────────────────────── Helpers ───────────────────────────── */
const OFFER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-v2-amber/15 text-v2-amber',
  accepted: 'bg-v2-mint/15 text-v2-mint',
  rejected: 'bg-v2-secondary/15 text-v2-secondary',
  withdrawn: 'bg-v2-text-muted/15 text-v2-text-muted',
  expired: 'bg-v2-text-muted/15 text-v2-text-muted',
};

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-v2-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-xs text-v2-primary font-bold">...</span>
      </div>
      <div className="bg-white shadow-bubble-xs rounded-[18px] rounded-bl-[6px] px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-2 h-2 rounded-full bg-v2-text-muted animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Page ──────────────────────────────── */
export default function OfferChatPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';

  const { data: offer, isLoading: offerLoading } = useOffer(id || null);
  const { data: messages, isLoading: messagesLoading } = useOfferMessages(id || null);
  const sendMessage = useSendOfferMessage(id);
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();
  const withdrawOffer = useWithdrawOffer();
  const [isConnected, setIsConnected] = useState(false);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | 'withdraw' | null>(null);

  // Connect socket on mount
  useEffect(() => {
    let mounted = true;
    connectSocket()
      .then(() => {
        if (!mounted) return;
        setIsConnected(true);
        const s = getSocket();
        s.on('connect', () => {
          if (mounted) setIsConnected(true);
        });
        s.on('disconnect', () => {
          if (mounted) setIsConnected(false);
        });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join offer room via socket
  useEffect(() => {
    if (!isConnected || !id) return;
    const s = getSocket();
    s.emit('joinOffer', { offerId: id });
    return () => {
      s.emit('leaveOffer', { offerId: id });
    };
  }, [isConnected, id]);

  // Listen for socket messages
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!isConnected) return;
    const s = getSocket();
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['offerMessages', id] });
    };
    const typingHandler = ({ senderId }: { senderId: string }) => {
      if (senderId !== user?.id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };
    s.on('newOfferMessage', handler);
    s.on('offerUserTyping', typingHandler);
    return () => {
      s.off('newOfferMessage', handler);
      s.off('offerUserTyping', typingHandler);
    };
  }, [isConnected, id, user?.id, queryClient]);

  // Emit typing event
  const emitTyping = useCallback(() => {
    if (isConnected) {
      getSocket().emit('offerTyping', { offerId: id });
    }
  }, [isConnected, id]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');

    if (isConnected) {
      getSocket().emit('sendOfferMessage', { offerId: id, content: text });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['offerMessages', id] });
      }, 500);
    } else {
      await sendMessage.mutateAsync(text);
    }
  }

  async function handleAccept() {
    if (!id) return;
    await acceptOffer.mutateAsync(id);
    router.push('/trips');
  }

  async function handleReject() {
    if (!id) return;
    await rejectOffer.mutateAsync(id);
    setConfirmAction(null);
  }

  async function handleWithdraw() {
    if (!id) return;
    await withdrawOffer.mutateAsync(id);
    setConfirmAction(null);
    router.back();
  }

  if (offerLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col blob-background">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-v2-primary animate-spin" />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!offer) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col blob-background">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <p className="text-v2-text-muted mb-4">{t('offer.notFound') || 'Offer not found'}</p>
              <button
                type="button"
                onClick={() => router.back()}
                className="text-v2-primary font-semibold hover:underline"
              >
                {t('common.back') || 'Go back'}
              </button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const isPoster = user?.id === offer.flight?.poster?.id;
  const isSender = user?.id === offer.senderId;
  const isPending = offer.status === 'pending';
  const statusColor = OFFER_STATUS_COLORS[offer.status] || OFFER_STATUS_COLORS.pending;
  const fromCode =
    offer.flight?.departureCode || offer.flight?.departureCity?.slice(0, 3).toUpperCase() || '---';
  const toCode =
    offer.flight?.arrivalCode || offer.flight?.arrivalCity?.slice(0, 3).toUpperCase() || '---';

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-v2-bg">
        <Header />

        {/* Chat container */}
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full overflow-hidden">
          {/* Offer header */}
          <div className="bg-white border-b border-v2-primary/10 px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-8 h-8 rounded-full bg-v2-bg flex items-center justify-center hover:bg-v2-primary/10 transition-colors"
                aria-label={t('common.back') || 'Back'}
              >
                <ArrowLeft className="w-4 h-4 text-v2-text-soft rtl:rotate-180" />
              </button>

              {/* Route summary */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-v2-text">{fromCode}</span>
                  <Plane className="w-3.5 h-3.5 text-v2-primary/50 -rotate-90 rtl:rotate-90 flex-shrink-0" />
                  <span className="font-bold text-v2-text">{toCode}</span>
                  <span
                    className={`${statusColor} px-2 py-0.5 rounded-full text-[10px] font-bold capitalize`}
                  >
                    {offer.status}
                  </span>
                </div>
                <p className="text-xs text-v2-text-muted">
                  {offer.offeredWeight} kg · {offer.offeredPrice} {offer.currency}
                </p>
              </div>

              {/* Link to flight */}
              <Link
                href={`/flights/${offer.flightId}`}
                className="text-xs text-v2-primary font-semibold hover:underline flex-shrink-0"
              >
                {t('offer.viewFlight') || 'Flight'}
              </Link>
            </div>
          </div>

          {/* Action strip — only for pending offers */}
          {isPending && (isPoster || isSender) && (
            <div className="bg-v2-bg/80 border-b border-v2-primary/10 px-4 py-2.5 flex-shrink-0">
              {isPoster && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmAction('accept')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-v2-mint text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {t('offer.accept') || 'Accept'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction('reject')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-v2-secondary text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {t('offer.reject') || 'Reject'}
                  </button>
                  <div className="flex items-center gap-2 ms-auto text-xs text-v2-text-muted">
                    <span>{offer.offeredWeight} kg</span>
                    <span>·</span>
                    <span>
                      {offer.offeredPrice} {offer.currency}
                    </span>
                  </div>
                </div>
              )}

              {isSender && !isPoster && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-v2-text-muted">
                    <Clock className="w-3.5 h-3.5 text-v2-amber" />
                    <span>{t('offer.awaitingResponse') || 'Awaiting traveler response'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmAction('withdraw')}
                    className="ms-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-v2-text-muted/30 text-v2-text-soft text-xs font-semibold hover:bg-v2-bg transition-colors"
                  >
                    {t('offer.withdraw') || 'Withdraw'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Confirmation dialogs */}
          {confirmAction && (
            <div className="bg-v2-secondary/10 border-b border-v2-secondary/20 px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-v2-secondary flex-shrink-0" />
                <p className="text-sm text-v2-text flex-1">
                  {confirmAction === 'accept' &&
                    (t('offer.acceptConfirm') || 'Accept this offer and create a booking?')}
                  {confirmAction === 'reject' && (t('offer.rejectConfirm') || 'Reject this offer?')}
                  {confirmAction === 'withdraw' &&
                    (t('offer.withdrawConfirm') || 'Withdraw your offer?')}
                </p>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmAction === 'accept') handleAccept();
                      else if (confirmAction === 'reject') handleReject();
                      else handleWithdraw();
                    }}
                    disabled={
                      acceptOffer.isPending || rejectOffer.isPending || withdrawOffer.isPending
                    }
                    className="px-3 py-1.5 rounded-full bg-v2-secondary text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {t('common.confirm') || 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="px-3 py-1.5 rounded-full border border-v2-text-muted/30 text-v2-text-soft text-xs font-semibold"
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {/* Offer note + item photos as initial message */}
            {(offer.note || (offer.imageUrls && offer.imageUrls.length > 0)) &&
              (messages ?? []).length === 0 && (
                <div className="flex justify-center">
                  <div className="bg-v2-primary/10 rounded-[18px] px-4 py-3 max-w-[80%]">
                    {offer.note && (
                      <>
                        <p className="text-xs text-v2-primary font-semibold mb-1">
                          {t('offer.senderNote') || 'Sender note'}
                        </p>
                        <p className="text-sm text-v2-text">{offer.note}</p>
                      </>
                    )}
                    {offer.imageUrls && offer.imageUrls.length > 0 && (
                      <div className={`flex gap-2 ${offer.note ? 'mt-2' : ''}`}>
                        {offer.imageUrls.map((url: string) => (
                          <img
                            key={url}
                            src={url}
                            alt="Item"
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            {messagesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-v2-primary animate-spin" />
              </div>
            ) : (messages ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-14 h-14 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <Plane className="w-6 h-6 text-v2-primary -rotate-90 rtl:rotate-90" />
                </div>
                <p className="text-sm text-v2-text-soft text-center max-w-xs">
                  {t('offer.chatEmpty') ||
                    'No messages yet. Start negotiating with the other party.'}
                </p>
              </div>
            ) : (
              (messages ?? []).map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={{
                    id: msg.id,
                    content: msg.content,
                    senderId: msg.senderId,
                    createdAt: msg.createdAt,
                    sender: msg.sender,
                  }}
                  isOwn={msg.senderId === user?.id}
                />
              ))
            )}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-v2-primary/10 px-4 py-3 flex-shrink-0">
            {!isPending ? (
              <div className="flex items-center gap-2 text-xs text-v2-text-muted py-1.5 justify-center">
                <XCircle className="w-4 h-4" />
                <span>
                  {t('offer.closed') || `This offer is ${offer.status}. Chat is read-only.`}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    emitTyping();
                  }}
                  placeholder={t('chat.messagePlaceholder') || 'Type a message…'}
                  className="flex-1 px-4 py-2.5 rounded-full border-2 border-v2-primary/15 bg-v2-bg text-v2-text text-sm focus:outline-none focus:border-v2-primary transition-colors"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sendMessage.isPending}
                  className="w-10 h-10 rounded-full v2-gradient-primary text-white flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40"
                  aria-label={t('chat.send') || 'Send'}
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
