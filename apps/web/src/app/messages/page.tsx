'use client';

import { MessageSquare } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/providers/LanguageProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ConversationCard from '@/components/messages/ConversationCard';
import { useConversations } from '@/hooks/useMessages';
import { ConversationCardSkeleton } from '@/components/common/Skeleton';

export default function MessagesPage() {
  const { t } = useLanguage();
  const { data: conversations, isLoading } = useConversations();

  const hasConversations = conversations && conversations.length > 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {/* Page title */}
          <div className="sticky top-[var(--header-height,64px)] z-10 md:static -mx-4 px-4 py-3 md:mx-0 md:px-0 md:py-0 bg-v2-bg/95 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-11 h-11 rounded-full v2-gradient-primary flex items-center justify-center shadow-bubble-xs">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-v2-text">{t('messages.title')}</h1>
              <p className="text-sm text-v2-text-soft">{t('wp.messagesSubtitle')}</p>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <ConversationCardSkeleton key={i} />
              ))}
            </div>
          ) : hasConversations ? (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <ConversationCard key={conversation.bookingId} conversation={conversation} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-v2-primary" />
              </div>
              <h3 className="text-lg font-bold text-v2-text mb-2">
                {t('messages.noConversations')}
              </h3>
              <p className="text-v2-text-soft">{t('messages.startConversation')}</p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
