'use client';

import { MessageSquare } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ConversationCard from '@/components/messages/ConversationCard';
import { useConversations } from '@/hooks/useMessages';

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-white rounded-[22px] p-4 shadow-bubble-sm animate-pulse">
      {/* Avatar placeholder */}
      <div className="w-12 h-12 rounded-full bg-v2-primary/10 flex-shrink-0" />

      {/* Content placeholder */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 w-28 bg-v2-primary/10 rounded-full" />
          <div className="h-3 w-14 bg-v2-primary/5 rounded-full" />
        </div>
        <div className="h-3 w-full bg-v2-primary/5 rounded-full" />
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { data: conversations, isLoading } = useConversations();

  const hasConversations = conversations && conversations.length > 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {/* Page title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full v2-gradient-primary flex items-center justify-center shadow-bubble-xs">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-v2-text">الرسائل</h1>
              <p className="text-sm text-v2-text-soft">تواصل مع الناقلين والمرسلين</p>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <ConversationSkeleton key={i} />
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
              <h3 className="text-lg font-bold text-v2-text mb-2">لا توجد محادثات</h3>
              <p className="text-v2-text-soft">ستظهر محادثاتك هنا عند حجز خدمة</p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
