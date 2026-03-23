import Link from 'next/link';
import { BadgeCheck, Star, Plane, Package, MessageSquare, Pencil } from 'lucide-react';

interface ProfileHeaderProps {
  user: {
    name?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    isVerified?: boolean;
  };
  stats?: {
    totalTrips?: number;
    totalDeliveries?: number;
    averageRating?: number;
    totalReviews?: number;
  };
  showEdit?: boolean;
}

function getInitial(name: string | null | undefined): string {
  return (name || 'U').charAt(0).toUpperCase();
}

export default function ProfileHeader({ user, stats, showEdit }: ProfileHeaderProps) {
  const displayName = user.displayName || user.name || 'مستخدم';

  return (
    <div className="bg-white rounded-[22px] shadow-bubble-md p-6">
      <div className="flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-v2-primary/10 flex items-center justify-center text-2xl font-bold text-v2-primary">
              {getInitial(displayName)}
            </div>
          )}
        </div>

        {/* Name + verification */}
        <div className="flex items-center gap-1.5">
          <h2 className="text-xl font-bold text-v2-text">{displayName}</h2>
          {user.isVerified && <BadgeCheck className="w-5 h-5 text-v2-primary" />}
        </div>

        {/* Stats row */}
        {stats && (
          <div className="flex items-center gap-5 flex-wrap justify-center">
            {stats.totalTrips != null && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-v2-text">
                  <Plane className="w-4 h-4 text-v2-primary" />
                  <span className="text-lg font-bold">{stats.totalTrips}</span>
                </div>
                <span className="text-xs text-v2-text-muted">رحلة</span>
              </div>
            )}

            {stats.totalDeliveries != null && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-v2-text">
                  <Package className="w-4 h-4 text-v2-mint" />
                  <span className="text-lg font-bold">{stats.totalDeliveries}</span>
                </div>
                <span className="text-xs text-v2-text-muted">توصيل</span>
              </div>
            )}

            {stats.averageRating != null && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-v2-text">
                  <Star className="w-4 h-4 text-v2-amber fill-v2-amber" />
                  <span className="text-lg font-bold">{stats.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-v2-text-muted">تقييم</span>
              </div>
            )}

            {stats.totalReviews != null && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-v2-text">
                  <MessageSquare className="w-4 h-4 text-v2-sky" />
                  <span className="text-lg font-bold">{stats.totalReviews}</span>
                </div>
                <span className="text-xs text-v2-text-muted">تقييمات</span>
              </div>
            )}
          </div>
        )}

        {/* Edit button */}
        {showEdit && (
          <Link
            href="/profile/edit"
            className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-v2-primary/20 text-v2-primary hover:bg-v2-primary/5 transition-all text-sm font-medium"
          >
            <Pencil className="w-4 h-4" />
            تعديل الملف الشخصي
          </Link>
        )}
      </div>
    </div>
  );
}
