'use client';

import { Suspense, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Inbox,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Plane,
  BadgeCheck,
  Users,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useBookings } from '@/hooks/useBookings';
import { useMyListings } from '@/hooks/useListings';
import type { ApiBooking } from '@/hooks/useBookings';
import type { ApiListing } from '@/hooks/useListings';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

/* ---------- Types ---------- */

type StatusFilter = 'all' | 'pending' | 'active' | 'completed' | 'cancelled';

const ACTIVE_STATUSES = ['accepted', 'picked_up', 'in_transit'] as const;
const COMPLETED_STATUSES = ['delivered'] as const;
const CANCELLED_STATUSES = ['cancelled', 'rejected'] as const;

/* ---------- Helpers ---------- */

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

function getStatusGroup(status: ApiBooking['status']): StatusFilter {
  if (status === 'pending') return 'pending';
  if ((ACTIVE_STATUSES as readonly string[]).includes(status)) return 'active';
  if ((COMPLETED_STATUSES as readonly string[]).includes(status)) return 'completed';
  if ((CANCELLED_STATUSES as readonly string[]).includes(status)) return 'cancelled';
  return 'all';
}

const statusConfig = (t: (k: string) => string) => ({
  pending: {
    label: t('booking.pending'),
    icon: Clock,
    bg: 'bg-v2-amber/10',
    text: 'text-v2-amber',
  },
  accepted: {
    label: t('booking.statusAccepted'),
    icon: CheckCircle,
    bg: 'bg-v2-sky/10',
    text: 'text-v2-sky',
  },
  picked_up: {
    label: t('booking.statusPickedUp'),
    icon: Package,
    bg: 'bg-v2-primary/10',
    text: 'text-v2-primary',
  },
  in_transit: {
    label: t('booking.statusInTransit'),
    icon: Plane,
    bg: 'bg-v2-primary/10',
    text: 'text-v2-primary',
  },
  delivered: {
    label: t('booking.statusDelivered'),
    icon: CheckCircle,
    bg: 'bg-v2-mint/10',
    text: 'text-v2-mint',
  },
  cancelled: {
    label: t('booking.statusCancelled'),
    icon: XCircle,
    bg: 'bg-v2-secondary/10',
    text: 'text-v2-secondary',
  },
  rejected: {
    label: t('booking.statusRejected'),
    icon: XCircle,
    bg: 'bg-v2-secondary/10',
    text: 'text-v2-secondary',
  },
});

/* ---------- Skeletons ---------- */

function ReservationCardSkeleton() {
  return (
    <div className="bg-white rounded-[22px] p-4 shadow-bubble-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-v2-primary/10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-v2-primary/10 rounded-full" />
          <div className="h-3 w-48 bg-v2-primary/5 rounded-full" />
          <div className="h-3 w-24 bg-v2-primary/5 rounded-full" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-6 w-16 bg-v2-primary/5 rounded-full" />
          <div className="w-9 h-9 rounded-full bg-v2-primary/5" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Reservation Card ---------- */

function ReservationCard({
  booking,
  t,
  lang,
}: {
  booking: ApiBooking;
  t: (k: string) => string;
  lang: string;
}) {
  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const statuses = statusConfig(t);
  const cfg = statuses[booking.status as keyof typeof statuses] || statuses.pending;
  const StatusIcon = cfg.icon;
  const senderName = booking.sender?.name || 'Sender';
  const fromCode =
    booking.listing?.departureCode ||
    booking.listing?.departureCity?.slice(0, 3).toUpperCase() ||
    '???';
  const toCode =
    booking.listing?.arrivalCode ||
    booking.listing?.arrivalCity?.slice(0, 3).toUpperCase() ||
    '???';

  return (
    <Link
      href={`/booking/${booking.id}`}
      className="block bg-white rounded-[22px] p-4 shadow-bubble-sm hover:shadow-bubble-md transition-all group"
    >
      <div className="flex items-center gap-3">
        {/* Sender avatar */}
        {booking.sender?.avatarUrl ? (
          <img
            src={booking.sender.avatarUrl}
            alt={senderName}
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-v2-primary/10 flex items-center justify-center text-sm font-bold text-v2-primary flex-shrink-0">
            {senderName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-semibold text-v2-text truncate">{senderName}</span>
            {booking.sender?.isVerified && (
              <BadgeCheck className="w-4 h-4 text-v2-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-v2-text-soft">
            {booking.totalWeight} {t('home.kg')} · {booking.totalPrice} {t('common.sar')}
          </p>
          <p className="text-xs text-v2-text-muted flex items-center gap-1 mt-0.5">
            <Plane className="w-3 h-3 -rotate-90 rtl:rotate-90" />
            {fromCode} → {toCode} ·{' '}
            {formatDate(booking.listing?.departureDate || booking.createdAt, dateLocale)}
          </p>
        </div>

        {/* Status pill + chat */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`${cfg.bg} ${cfg.text} px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1`}
          >
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
          <Link
            href={`/chat/${booking.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center hover:bg-v2-primary/20 transition-colors"
            aria-label="Chat"
          >
            <MessageSquare className="w-4 h-4 text-v2-primary" />
          </Link>
        </div>
      </div>
    </Link>
  );
}

/* ---------- Inner Content (uses useSearchParams) ---------- */

function ReservationsContent() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const tripParam = searchParams.get('trip');

  const { data: apiBookings, isLoading: bookingsLoading } = useBookings();
  const { data: myListings, isLoading: listingsLoading } = useMyListings();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tripFilter, setTripFilter] = useState<string | null>(tripParam);

  const isLoading = bookingsLoading || listingsLoading;

  // All bookings where current user is the carrier
  const carrierBookings = useMemo(() => {
    if (!apiBookings || !user?.id) return [];
    return apiBookings.filter((b) => b.carrierId === user.id);
  }, [apiBookings, user?.id]);

  // Listings available for trip filter
  const listings = useMemo(() => myListings ?? [], [myListings]);

  // Count by status group
  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: carrierBookings.length,
      pending: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const b of carrierBookings) {
      const group = getStatusGroup(b.status);
      if (group !== 'all') counts[group]++;
    }
    return counts;
  }, [carrierBookings]);

  // Apply filters
  const filteredBookings = useMemo(() => {
    let result = carrierBookings;

    if (statusFilter !== 'all') {
      result = result.filter((b) => getStatusGroup(b.status) === statusFilter);
    }

    if (tripFilter) {
      result = result.filter((b) => b.listingId === tripFilter);
    }

    // Sort: pending first, then by date descending
    return result.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [carrierBookings, statusFilter, tripFilter]);

  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';

  /* ---------- Status filter config ---------- */

  const statusFilters: { key: StatusFilter; labelKey: string }[] = [
    { key: 'all', labelKey: 'reservations.all' },
    { key: 'pending', labelKey: 'reservations.pending' },
    { key: 'active', labelKey: 'reservations.active' },
    { key: 'completed', labelKey: 'reservations.completed' },
    { key: 'cancelled', labelKey: 'reservations.cancelled' },
  ];

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Page title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full v2-gradient-primary flex items-center justify-center shadow-bubble-xs">
            <Inbox className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-v2-text">{t('reservations.title')}</h1>
            <p className="text-sm text-v2-text-soft">{t('reservations.subtitle')}</p>
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
          {statusFilters.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                statusFilter === key
                  ? 'v2-gradient-primary text-white shadow-bubble-xs'
                  : 'bg-white shadow-bubble-xs text-v2-text-soft hover:text-v2-text'
              }`}
            >
              {t(labelKey)}
              <span
                className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                  statusFilter === key
                    ? 'bg-white/25 text-white'
                    : 'bg-v2-primary/10 text-v2-primary'
                }`}
              >
                {statusCounts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Trip filter pills */}
        {listings.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            <button
              type="button"
              onClick={() => setTripFilter(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all ${
                !tripFilter
                  ? 'bg-v2-primary/15 text-v2-primary border-v2-primary/30'
                  : 'bg-white border-v2-primary/10 text-v2-text-soft hover:text-v2-text'
              }`}
            >
              {t('reservations.allTrips')}
            </button>
            {listings.map((listing) => {
              const fromCode =
                listing.departureCode || listing.departureCity.slice(0, 3).toUpperCase();
              const toCode = listing.arrivalCode || listing.arrivalCity.slice(0, 3).toUpperCase();
              const isActive = tripFilter === listing.id;

              return (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => setTripFilter(isActive ? null : listing.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-v2-primary/15 text-v2-primary border-v2-primary/30'
                      : 'bg-white border-v2-primary/10 text-v2-text-soft hover:text-v2-text'
                  }`}
                >
                  <Plane className="w-3 h-3 -rotate-90 rtl:rotate-90" />
                  {fromCode} → {toCode} · {formatDate(listing.departureDate, dateLocale)}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <ReservationCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <ReservationCard key={booking.id} booking={booking} t={t} lang={lang} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-v2-primary" />
            </div>
            <h3 className="text-lg font-bold text-v2-text mb-2">
              {carrierBookings.length === 0
                ? t('reservations.empty')
                : t('reservations.emptyFiltered')}
            </h3>
            <p className="text-v2-text-soft max-w-sm mx-auto">
              {carrierBookings.length === 0
                ? t('reservations.emptyDesc')
                : t('reservations.emptyFiltered')}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ---------- Page (with Suspense boundary for useSearchParams) ---------- */

export default function ReservationsPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col blob-background">
            <Header />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-full v2-gradient-primary flex items-center justify-center shadow-bubble-xs">
                  <Inbox className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="h-7 w-40 bg-v2-primary/10 rounded-full animate-pulse" />
                  <div className="h-4 w-56 bg-v2-primary/5 rounded-full animate-pulse mt-1" />
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <ReservationCardSkeleton key={i} />
                ))}
              </div>
            </main>
            <Footer />
          </div>
        }
      >
        <ReservationsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
