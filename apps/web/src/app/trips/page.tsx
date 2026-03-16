'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plane,
  Package,
  Plus,
  Weight,
  Calendar,
  Users,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  BadgeCheck,
  MessageSquare,
  Tag,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useBookings } from '@/hooks/useBookings';
import { useMyListings } from '@/hooks/useListings';
import { useMyFlights } from '@/hooks/useFlights';
import { useMyOffers } from '@/hooks/useOffers';
import type { ApiBooking } from '@/hooks/useBookings';
import type { ApiListing } from '@/hooks/useListings';
import type { ApiFlight } from '@/hooks/useFlights';
import type { ApiOffer } from '@/hooks/useOffers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TripCardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

type MainTab = 'bookings' | 'flights' | 'offers';

/* ---------- Helpers ---------- */

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

const statusConfig = (t: (k: string) => string) => ({
  pending: {
    label: t('booking.pending'),
    icon: Clock,
    bg: 'bg-v2-amber/10',
    text: 'text-v2-amber',
    dot: 'bg-v2-amber',
  },
  accepted: {
    label: t('booking.statusAccepted'),
    icon: CheckCircle,
    bg: 'bg-v2-sky/10',
    text: 'text-v2-sky',
    dot: 'bg-v2-sky',
  },
  picked_up: {
    label: t('booking.statusPickedUp'),
    icon: Package,
    bg: 'bg-v2-primary/10',
    text: 'text-v2-primary',
    dot: 'bg-v2-primary',
  },
  in_transit: {
    label: t('booking.statusInTransit'),
    icon: Plane,
    bg: 'bg-v2-primary/10',
    text: 'text-v2-primary',
    dot: 'bg-v2-primary',
  },
  delivered: {
    label: t('booking.statusDelivered'),
    icon: CheckCircle,
    bg: 'bg-v2-mint/10',
    text: 'text-v2-mint',
    dot: 'bg-v2-mint',
  },
  cancelled: {
    label: t('booking.statusCancelled'),
    icon: XCircle,
    bg: 'bg-v2-secondary/10',
    text: 'text-v2-secondary',
    dot: 'bg-v2-secondary',
  },
  rejected: {
    label: t('booking.statusRejected'),
    icon: XCircle,
    bg: 'bg-v2-secondary/10',
    text: 'text-v2-secondary',
    dot: 'bg-v2-secondary',
  },
});

/* ---------- Mini Request Row (inside trip card) ---------- */

function RequestRow({
  booking,
  t,
  statuses,
}: {
  booking: ApiBooking;
  t: (k: string) => string;
  statuses: ReturnType<typeof statusConfig>;
}) {
  const cfg = statuses[booking.status as keyof typeof statuses] || statuses.pending;
  const StatusIcon = cfg.icon;
  const senderName = booking.sender?.name || 'Sender';

  return (
    <Link
      href={`/booking/${booking.id}`}
      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-v2-primary/5 transition-colors group"
    >
      {/* Sender avatar */}
      {booking.sender?.avatarUrl ? (
        <img
          src={booking.sender.avatarUrl}
          alt={senderName}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center text-xs font-bold text-v2-primary flex-shrink-0">
          {senderName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Name + weight */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-v2-text truncate">{senderName}</span>
          {booking.sender?.isVerified && (
            <BadgeCheck className="w-3.5 h-3.5 text-v2-primary flex-shrink-0" />
          )}
        </div>
        <span className="text-xs text-v2-text-muted">
          {booking.totalWeight} {t('home.kg')} · {booking.totalPrice} {t('common.sar')}
        </span>
      </div>

      {/* Status pill */}
      <span
        className={`${cfg.bg} ${cfg.text} px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 flex-shrink-0`}
      >
        <StatusIcon className="w-3 h-3" />
        {cfg.label}
      </span>

      {/* Chat shortcut */}
      <Link
        href={`/chat/${booking.id}`}
        onClick={(e) => e.stopPropagation()}
        className="w-8 h-8 rounded-full bg-v2-primary/10 flex items-center justify-center flex-shrink-0 hover:bg-v2-primary/20 transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5 text-v2-primary" />
      </Link>
    </Link>
  );
}

/* ---------- Trip Card with Expandable Requests ---------- */

function TripCardWithRequests({
  listing,
  bookings,
  t,
  lang,
}: {
  listing: ApiListing & { _count?: { bookings: number } };
  bookings: ApiBooking[];
  t: (k: string) => string;
  lang: string;
}) {
  const [expanded, setExpanded] = useState(bookings.length > 0);
  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const fromCode = listing.departureCode || listing.departureCity.slice(0, 3).toUpperCase();
  const toCode = listing.arrivalCode || listing.arrivalCity.slice(0, 3).toUpperCase();
  const bookingCount = listing._count?.bookings ?? bookings.length;
  const statuses = statusConfig(t);

  const activeBookings = bookings.filter(
    (b) => !['cancelled', 'rejected', 'delivered'].includes(b.status)
  );
  const otherBookings = bookings.filter((b) =>
    ['cancelled', 'rejected', 'delivered'].includes(b.status)
  );

  const listingStatusMap: Record<string, { label: string; bg: string; text: string }> = {
    active: { label: t('wp.tripActive'), bg: 'bg-v2-mint/15', text: 'text-v2-mint' },
    completed: { label: t('wp.tripCompleted'), bg: 'bg-v2-sky/15', text: 'text-v2-sky' },
    cancelled: {
      label: t('wp.tripCancelled'),
      bg: 'bg-v2-secondary/15',
      text: 'text-v2-secondary',
    },
  };
  const listStatus = listingStatusMap[listing.status] || listingStatusMap.active;

  return (
    <div className="bg-white rounded-[22px] shadow-bubble-sm overflow-hidden">
      {/* Trip header — clickable to listing detail */}
      <Link
        href={`/listing/${listing.id}`}
        className="block p-5 hover:bg-v2-primary/[0.02] transition-colors"
      >
        {/* Top row: status + date + booking count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`${listStatus.bg} ${listStatus.text} px-3 py-1 rounded-full text-xs font-bold`}
            >
              {listStatus.label}
            </span>
            {bookingCount > 0 && (
              <span className="bg-v2-primary/10 px-2.5 py-1 rounded-full text-xs text-v2-primary font-semibold flex items-center gap-1">
                <Users className="w-3 h-3" />
                {bookingCount}
              </span>
            )}
          </div>
          <span className="text-xs text-v2-text-muted flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(listing.departureDate, dateLocale)}
          </span>
        </div>

        {/* Route line */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-xl font-extrabold text-v2-text">{fromCode}</p>
          <div className="flex-1 flex items-center justify-center px-3">
            <div className="w-3 h-3 rounded-full bg-v2-mint flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-1" />
            <Plane className="w-4 h-4 text-v2-primary -rotate-90 flex-shrink-0 rtl:rotate-90" />
            <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-1" />
            <div className="w-3 h-3 rounded-full bg-v2-secondary flex-shrink-0" />
          </div>
          <p className="text-xl font-extrabold text-v2-text">{toCode}</p>
        </div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-v2-text-soft">{listing.departureCity}</p>
          <p className="text-xs text-v2-text-soft">{listing.arrivalCity}</p>
        </div>

        {/* Meta chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft flex items-center gap-1">
            <Weight className="w-3 h-3" />
            {listing.availableWeight} {t('home.kg')}
          </span>
          <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft">
            {listing.price} {t('common.sar')}/{t('home.kg')}
          </span>
          {listing.flightNumber && (
            <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft">
              {listing.flightNumber}
            </span>
          )}
        </div>
      </Link>

      {/* Requests section */}
      {bookingCount > 0 && (
        <>
          {/* Expand/collapse toggle */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-3 border-t border-v2-primary/10 hover:bg-v2-primary/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              {/* Stacked avatars */}
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {bookings.slice(0, 3).map((b, i) =>
                  b.sender?.avatarUrl ? (
                    <img
                      key={b.id}
                      src={b.sender.avatarUrl}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover border-2 border-white"
                      style={{ zIndex: 3 - i }}
                    />
                  ) : (
                    <div
                      key={b.id}
                      className="w-7 h-7 rounded-full bg-v2-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-bold text-v2-primary"
                      style={{ zIndex: 3 - i }}
                    >
                      {b.sender?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )
                )}
                {bookingCount > 3 && (
                  <div className="w-7 h-7 rounded-full bg-v2-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-bold text-v2-primary">
                    +{bookingCount - 3}
                  </div>
                )}
              </div>
              <span className="text-sm font-semibold text-v2-text">
                {bookingCount}{' '}
                {bookingCount === 1 ? t('wp.bookingReceived') : t('wp.bookingsReceived')}
              </span>

              {/* Active count dot */}
              {activeBookings.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-v2-amber font-medium">
                  <span className="w-2 h-2 rounded-full bg-v2-amber animate-pulse" />
                  {activeBookings.length} {t('trips.active').toLowerCase()}
                </span>
              )}
            </div>

            <ChevronDown
              className={`w-5 h-5 text-v2-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Expanded request list */}
          {expanded && (
            <div className="px-3 pb-3">
              {/* Show up to 3 requests inline */}
              {activeBookings.slice(0, 3).map((booking) => (
                <RequestRow key={booking.id} booking={booking} t={t} statuses={statuses} />
              ))}

              {/* Past requests — only show if active didn't fill 3 slots */}
              {activeBookings.length < 3 && otherBookings.length > 0 && (
                <div
                  className={
                    activeBookings.length > 0 ? 'border-t border-v2-primary/5 pt-1 mt-1' : ''
                  }
                >
                  {otherBookings.slice(0, 3 - activeBookings.length).map((booking) => (
                    <RequestRow key={booking.id} booking={booking} t={t} statuses={statuses} />
                  ))}
                </div>
              )}

              {/* Link to reservations page when >3 total requests */}
              {bookingCount > 3 && (
                <Link
                  href={`/reservations?trip=${listing.id}`}
                  className="block text-center text-xs text-v2-primary font-semibold py-2.5 mt-1 rounded-xl hover:bg-v2-primary/5 transition-colors"
                >
                  {t('reservations.viewAll')} ({bookingCount})
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {/* No requests yet — subtle hint */}
      {bookingCount === 0 && (
        <div className="px-5 py-3 border-t border-v2-primary/10 text-center">
          <p className="text-xs text-v2-text-muted">{t('listing.noRequestsYet')}</p>
        </div>
      )}
    </div>
  );
}

/* ---------- Standalone Booking Card (for bookings where user is sender) ---------- */

function SenderBookingCard({
  booking,
  t,
  lang,
}: {
  booking: ApiBooking;
  t: (k: string) => string;
  lang: string;
}) {
  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const fromCode =
    booking.listing?.departureCode ||
    booking.listing?.departureCity?.slice(0, 3).toUpperCase() ||
    '???';
  const toCode =
    booking.listing?.arrivalCode ||
    booking.listing?.arrivalCity?.slice(0, 3).toUpperCase() ||
    '???';
  const statuses = statusConfig(t);
  const cfg = statuses[booking.status as keyof typeof statuses] || statuses.pending;
  const StatusIcon = cfg.icon;

  return (
    <Link
      href={`/booking/${booking.id}`}
      className="block bg-white rounded-[22px] p-4 shadow-bubble-sm hover:shadow-bubble-md transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Mini route */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-extrabold text-v2-text">{fromCode}</span>
          <Plane className="w-3.5 h-3.5 text-v2-primary/50 -rotate-90 rtl:rotate-90" />
          <span className="text-sm font-extrabold text-v2-text">{toCode}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-v2-primary/10 flex-shrink-0" />

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-v2-text-muted">
              {formatDate(booking.listing?.departureDate || booking.createdAt, dateLocale)}
            </span>
            <span className="text-xs text-v2-text-muted">·</span>
            <span className="text-xs text-v2-text-muted">
              {booking.totalWeight} {t('home.kg')}
            </span>
            <span className="text-xs text-v2-text-muted">·</span>
            <span className="text-xs text-v2-text-muted">
              {booking.totalPrice} {t('common.sar')}
            </span>
          </div>
          <p className="text-xs text-v2-text-soft truncate">
            {t('booking.carrier')}: {booking.carrier?.name || '—'}
          </p>
        </div>

        {/* Status */}
        <span
          className={`${cfg.bg} ${cfg.text} px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 flex-shrink-0`}
        >
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>
    </Link>
  );
}

/* ---------- Flight Card ---------- */

function FlightCard({
  flight,
  t,
  lang,
}: {
  flight: ApiFlight;
  t: (k: string) => string;
  lang: string;
}) {
  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const fromCode = flight.departureCode || flight.departureCity.slice(0, 3).toUpperCase();
  const toCode = flight.arrivalCode || flight.arrivalCity.slice(0, 3).toUpperCase();
  const offerCount = flight._count?.offers ?? 0;

  const statusMap: Record<string, { label: string; bg: string; text: string }> = {
    active: {
      label: t('flight.statusActive') || 'Active',
      bg: 'bg-v2-mint/15',
      text: 'text-v2-mint',
    },
    full: { label: t('flight.statusFull') || 'Full', bg: 'bg-v2-amber/15', text: 'text-v2-amber' },
    completed: {
      label: t('flight.statusCompleted') || 'Completed',
      bg: 'bg-v2-sky/15',
      text: 'text-v2-sky',
    },
    cancelled: {
      label: t('flight.statusCancelled') || 'Cancelled',
      bg: 'bg-v2-secondary/15',
      text: 'text-v2-secondary',
    },
  };
  const status = statusMap[flight.status] || statusMap.active;

  return (
    <Link
      href={`/flights/${flight.id}`}
      className="block bg-white rounded-[22px] p-5 shadow-bubble-sm hover:shadow-bubble-md transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-bold`}>
          {status.label}
        </span>
        <div className="flex items-center gap-2">
          {offerCount > 0 && (
            <span className="bg-v2-primary/10 text-v2-primary px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Users className="w-3 h-3" />
              {offerCount}
            </span>
          )}
          <span className="text-xs text-v2-text-muted flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(flight.departureDate).toLocaleDateString(dateLocale, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-1">
        <p className="text-xl font-extrabold text-v2-text">{fromCode}</p>
        <div className="flex-1 flex items-center justify-center px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-v2-mint flex-shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-1" />
          <Plane className="w-4 h-4 text-v2-primary -rotate-90 rtl:rotate-90 flex-shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-1" />
          <div className="w-2.5 h-2.5 rounded-full bg-v2-secondary flex-shrink-0" />
        </div>
        <p className="text-xl font-extrabold text-v2-text">{toCode}</p>
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-v2-text-soft">{flight.departureCity}</p>
        <p className="text-xs text-v2-text-soft">{flight.arrivalCity}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft flex items-center gap-1">
          <Weight className="w-3 h-3" />
          {Number(flight.remainingWeight)} / {Number(flight.totalWeight)} kg
        </span>
        <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft">
          {Number(flight.pricePerKg)} {flight.currency}/kg
        </span>
        {flight.flightNumber && (
          <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft">
            {flight.flightNumber}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ---------- Offer Card ---------- */

const OFFER_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-v2-amber/15', text: 'text-v2-amber', label: 'Pending' },
  accepted: { bg: 'bg-v2-mint/15', text: 'text-v2-mint', label: 'Accepted' },
  rejected: { bg: 'bg-v2-secondary/15', text: 'text-v2-secondary', label: 'Rejected' },
  withdrawn: { bg: 'bg-v2-text-muted/15', text: 'text-v2-text-muted', label: 'Withdrawn' },
  expired: { bg: 'bg-v2-text-muted/15', text: 'text-v2-text-muted', label: 'Expired' },
};

function OfferCard({
  offer,
  t,
  lang,
}: {
  offer: ApiOffer;
  t: (k: string) => string;
  lang: string;
}) {
  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const fromCode =
    offer.flight?.departureCode || offer.flight?.departureCity?.slice(0, 3).toUpperCase() || '---';
  const toCode =
    offer.flight?.arrivalCode || offer.flight?.arrivalCity?.slice(0, 3).toUpperCase() || '---';
  const cfg = OFFER_STATUS_COLORS[offer.status] || OFFER_STATUS_COLORS.pending;

  return (
    <Link
      href={`/offers/${offer.id}`}
      className="block bg-white rounded-[22px] p-4 shadow-bubble-sm hover:shadow-bubble-md transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Route */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-extrabold text-v2-text">{fromCode}</span>
          <Plane className="w-3.5 h-3.5 text-v2-primary/50 -rotate-90 rtl:rotate-90" />
          <span className="text-sm font-extrabold text-v2-text">{toCode}</span>
        </div>

        <div className="w-px h-8 bg-v2-primary/10 flex-shrink-0" />

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-v2-text-muted">
              {new Date(offer.flight?.departureDate || offer.createdAt).toLocaleDateString(
                dateLocale,
                { month: 'short', day: 'numeric' }
              )}
            </span>
            <span className="text-xs text-v2-text-muted">·</span>
            <span className="text-xs text-v2-text-muted">{offer.offeredWeight} kg</span>
            <span className="text-xs text-v2-text-muted">·</span>
            <span className="text-xs text-v2-text-muted">
              {offer.offeredPrice} {offer.currency}
            </span>
          </div>
          {offer.booking && (
            <span className="text-xs text-v2-primary font-semibold">
              {t('offer.bookingCreated') || 'Booking created'}
            </span>
          )}
        </div>

        {/* Status */}
        <span
          className={`${cfg.bg} ${cfg.text} px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0`}
        >
          {t(`offer.status.${offer.status}`) || cfg.label}
        </span>
      </div>
    </Link>
  );
}

/* ---------- Main Page ---------- */

export default function TripsPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [mainTab, setMainTab] = useState<MainTab>('bookings');

  const { data: apiBookings, isLoading: bookingsLoading } = useBookings();
  const { data: myListings, isLoading: listingsLoading } = useMyListings();
  const { data: myFlights, isLoading: flightsLoading } = useMyFlights();
  const { data: myOffersData, isLoading: offersLoading } = useMyOffers();

  const bookings = useMemo(() => apiBookings ?? [], [apiBookings]);
  const listings = useMemo(() => myListings ?? [], [myListings]);
  const flights = useMemo(() => myFlights ?? [], [myFlights]);
  const offers = useMemo(() => myOffersData?.data ?? [], [myOffersData]);

  // Group bookings by listing for the trip cards
  const bookingsByListing = useMemo(() => {
    const map: Record<string, ApiBooking[]> = {};
    for (const b of bookings) {
      if (b.listingId) {
        if (!map[b.listingId]) map[b.listingId] = [];
        map[b.listingId].push(b);
      }
    }
    return map;
  }, [bookings]);

  // Bookings where user is sender (not on their own listing)
  const senderBookings = useMemo(() => {
    return bookings.filter((b) => b.senderId === user?.id);
  }, [bookings, user?.id]);

  const isLoading =
    mainTab === 'bookings'
      ? listingsLoading || bookingsLoading
      : mainTab === 'flights'
        ? flightsLoading
        : offersLoading;

  const tabs: { id: MainTab; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'bookings',
      label: t('trips.bookingsTab') || 'Bookings',
      icon: <Package className="w-4 h-4" />,
      count: listings.length + senderBookings.length,
    },
    {
      id: 'flights',
      label: t('trips.flightsTab') || 'My Flights',
      icon: <Plane className="w-4 h-4" />,
      count: flights.length,
    },
    {
      id: 'offers',
      label: t('trips.offersTab') || 'My Offers',
      icon: <Tag className="w-4 h-4" />,
      count: offers.length,
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {/* Page title + CTA */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full v2-gradient-primary flex items-center justify-center shadow-bubble-xs">
                <Plane className="w-5 h-5 text-white -rotate-90 rtl:rotate-90" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-v2-text">{t('trips.title')}</h1>
                <p className="text-sm text-v2-text-soft">{t('wp.tripsSubtitle')}</p>
              </div>
            </div>
            <Link
              href={mainTab === 'flights' ? '/flights/create' : '/listing/create'}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full v2-gradient-primary text-white text-sm font-semibold shadow-bubble-xs hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              {mainTab === 'flights' ? t('flight.post') || 'Post Flight' : t('wp.addTrip')}
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 bg-white rounded-2xl p-1.5 shadow-bubble-xs mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMainTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  mainTab === tab.id
                    ? 'v2-gradient-primary text-white shadow-bubble-xs'
                    : 'text-v2-text-soft hover:bg-v2-bg'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      mainTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-v2-primary/10 text-v2-primary'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <TripCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* ============ Bookings Tab ============ */}
              {mainTab === 'bookings' && (
                <>
                  {listings.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-base font-bold text-v2-text mb-3 flex items-center gap-2">
                        <Plane className="w-4 h-4 text-v2-primary -rotate-90 rtl:rotate-90" />
                        {t('wp.myTripsTab')}
                        <span className="text-sm font-normal text-v2-text-muted">
                          ({listings.length})
                        </span>
                      </h2>
                      <div className="space-y-4">
                        {listings.map((listing) => (
                          <TripCardWithRequests
                            key={listing.id}
                            listing={listing}
                            bookings={bookingsByListing[listing.id] || []}
                            t={t}
                            lang={lang}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {senderBookings.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-base font-bold text-v2-text mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-v2-primary" />
                        {t('wp.requestsTab')}
                        <span className="text-sm font-normal text-v2-text-muted">
                          ({senderBookings.length})
                        </span>
                      </h2>
                      <div className="space-y-3">
                        {senderBookings.map((booking) => (
                          <SenderBookingCard key={booking.id} booking={booking} t={t} lang={lang} />
                        ))}
                      </div>
                    </div>
                  )}

                  {listings.length === 0 && senderBookings.length === 0 && (
                    <EmptyState
                      icon={<Plane className="w-9 h-9 text-v2-primary -rotate-90 rtl:rotate-90" />}
                      title={t('wp.noTrips')}
                      description={t('wp.noTripsDesc')}
                      action={{
                        label: t('wp.addTrip'),
                        href: '/listing/create',
                        icon: <Plus className="w-4 h-4" />,
                      }}
                    />
                  )}
                </>
              )}

              {/* ============ Flights Tab ============ */}
              {mainTab === 'flights' && (
                <>
                  {flights.length === 0 ? (
                    <EmptyState
                      icon={<Plane className="w-9 h-9 text-v2-primary -rotate-90 rtl:rotate-90" />}
                      title={t('flight.noFlights') || 'No flights yet'}
                      description={
                        t('flight.noFlightsDesc') ||
                        'Post a flight to start receiving offers from senders.'
                      }
                      action={{
                        label: t('flight.post') || 'Post a Flight',
                        href: '/flights/create',
                        icon: <Plus className="w-4 h-4" />,
                      }}
                    />
                  ) : (
                    <div className="space-y-4">
                      {flights.map((flight) => (
                        <FlightCard key={flight.id} flight={flight} t={t} lang={lang} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ============ Offers Tab ============ */}
              {mainTab === 'offers' && (
                <>
                  {offers.length === 0 ? (
                    <EmptyState
                      icon={<Tag className="w-9 h-9 text-v2-primary" />}
                      title={t('offer.noOffers') || 'No offers yet'}
                      description={
                        t('offer.noOffersDesc') ||
                        'Browse flights and make an offer to start shipping.'
                      }
                      action={{
                        label: t('common.browse') || 'Browse Flights',
                        href: '/',
                        icon: <Plane className="w-4 h-4 -rotate-90 rtl:rotate-90" />,
                      }}
                    />
                  ) : (
                    <div className="space-y-3">
                      {offers.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} t={t} lang={lang} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* FAB — mobile only */}
        <Link
          href={mainTab === 'flights' ? '/flights/create' : '/listing/create'}
          aria-label={mainTab === 'flights' ? t('flight.post') || 'Post Flight' : t('wp.addTrip')}
          className="md:hidden fixed bottom-[calc(var(--bottom-tab-height)+env(safe-area-inset-bottom,0px)+16px)] end-4 z-40 w-14 h-14 rounded-full v2-gradient-primary text-white shadow-bubble-md flex items-center justify-center hover:opacity-90 active:scale-[0.93] transition-all duration-150"
        >
          <Plus className="w-6 h-6" />
        </Link>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
