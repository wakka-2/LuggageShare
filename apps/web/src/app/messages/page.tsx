'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConversationCard } from '@/components/messages/ConversationCard';
import { MOCK_CONVERSATIONS } from '@/lib/data/mockConversations';
import { useConversations } from '@/hooks/useMessages';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { Conversation } from '@/lib/types/message';

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'in_transit' | 'delivered';

export default function MessagesPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();
  const { data: apiConversations } = useConversations();

  // Use API data when authenticated, fall back to mock data
  const conversations: Conversation[] = useMemo(() => {
    if (isAuthenticated && apiConversations) {
      return apiConversations.map((c) => ({
        id: c.id,
        bookingId: c.bookingId,
        listingTitle: c.listingTitle,
        listingTitleAr: c.listingTitleAr,
        from: c.from,
        to: c.to,
        otherUser: c.otherUser,
        lastMessage: c.lastMessage ? {
          content: c.lastMessage.content,
          timestamp: c.lastMessage.timestamp,
          isFromMe: c.lastMessage.isFromMe,
        } : undefined,
        unreadCount: c.unreadCount,
        bookingStatus: c.bookingStatus as Conversation['bookingStatus'],
        updatedAt: c.updatedAt,
      }));
    }
    return MOCK_CONVERSATIONS;
  }, [isAuthenticated, apiConversations]);

  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((conv) => conv.bookingStatus === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.otherUser.nameAr.toLowerCase().includes(query) ||
          conv.otherUser.name.toLowerCase().includes(query) ||
          conv.listingTitleAr.toLowerCase().includes(query) ||
          conv.from.cityAr.includes(query) ||
          conv.to.cityAr.includes(query)
      );
    }

    // Sort by updatedAt (most recent first)
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return filtered;
  }, [conversations, filterStatus, searchQuery]);

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const getFilterCount = (status: FilterStatus) => {
    if (status === 'all') return conversations.length;
    return conversations.filter((conv) => conv.bookingStatus === status).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الرسائل</h1>
          {totalUnread > 0 && (
            <p className="text-gray-600">
              لديك <span className="font-bold text-primary-600">{totalUnread}</span> رسائل غير مقروءة
            </p>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المحادثات..."
              className="w-full px-4 py-3 pe-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {(['all', 'pending', 'confirmed', 'in_transit', 'delivered'] as FilterStatus[]).map((status) => {
              const labels = {
                all: 'الكل',
                pending: 'قيد المراجعة',
                confirmed: 'مؤكد',
                in_transit: 'قيد التوصيل',
                delivered: 'تم التوصيل',
              };

              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {labels[status]} ({getFilterCount(status)})
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💬</div>
              {searchQuery ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
                  <p className="text-gray-600">لم نجد محادثات تطابق بحثك</p>
                </>
              ) : filterStatus !== 'all' ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد محادثات</h3>
                  <p className="text-gray-600">لا توجد محادثات بهذه الحالة</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد محادثات بعد</h3>
                  <p className="text-gray-600 mb-6">
                    ابدأ بحجز رحلة أو عرض مساحة متوفرة للبدء في المحادثات
                  </p>
                  <div className="flex gap-3 justify-center">
                    <a
                      href="/listings"
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                      تصفح الرحلات
                    </a>
                    <a
                      href="/create-listing"
                      className="bg-white text-primary-600 border border-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                    >
                      أضف رحلتك
                    </a>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConversations.map((conversation) => (
                <ConversationCard key={conversation.id} conversation={conversation} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
