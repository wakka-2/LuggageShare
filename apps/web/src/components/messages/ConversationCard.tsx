import Link from 'next/link';

interface ConversationCardProps {
  conversation: {
    bookingId: string;
    otherUser: { name: string; avatarUrl: string | null };
    lastMessage?: { content: string; createdAt: string } | null;
    unreadCount: number;
    listing?: { departureCity: string; arrivalCity: string };
    route?: string;
  };
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقائق`;
  if (diffHours < 24) return `منذ ${diffHours} ساعات`;
  if (diffDays < 7) return `منذ ${diffDays} أيام`;

  return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export default function ConversationCard({ conversation }: ConversationCardProps) {
  const { otherUser, lastMessage, unreadCount, listing } = conversation;

  return (
    <Link
      href={`/chat/${conversation.bookingId}`}
      className="flex items-center gap-3 bg-white rounded-[22px] p-4 shadow-bubble-sm hover:shadow-bubble-md transition-all"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {otherUser.avatarUrl ? (
          <img src={otherUser.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-v2-primary/10 flex items-center justify-center text-lg font-bold text-v2-primary">
            {getInitial(otherUser.name)}
          </div>
        )}

        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -left-1 rtl:-left-auto rtl:-right-1 w-5 h-5 rounded-full bg-v2-secondary flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">
              {unreadCount > 9 ? '+9' : unreadCount}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-sm font-bold text-v2-text truncate">{otherUser.name}</h3>
          {lastMessage && (
            <span className="text-[10px] text-v2-text-muted flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2">
              {formatRelativeTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        {/* Route info */}
        {listing && (
          <p className="text-[11px] text-v2-primary mb-0.5">
            {listing.departureCity} → {listing.arrivalCity}
          </p>
        )}

        {/* Last message preview */}
        {lastMessage && (
          <p className="text-xs text-v2-text-muted truncate">{lastMessage.content}</p>
        )}
      </div>
    </Link>
  );
}
