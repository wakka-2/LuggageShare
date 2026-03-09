'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plane,
  Calendar,
  Weight,
  DollarSign,
  BadgeCheck,
  FileText,
  MessageSquare,
  ArrowRight,
  Package,
  Pencil,
  Inbox,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useListing } from '@/hooks/useListings';
import { useListingBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/providers/LanguageProvider';
import { MOCK_LISTINGS } from '@/lib/mockListings';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

function formatDate(dateString: string, locale: string = 'ar-SA'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
        <div className="flex items-center justify-between">
          <div className="h-10 w-16 bg-v2-primary/10 rounded" />
          <div className="flex-1 mx-8 h-1 bg-v2-primary/10 rounded" />
          <div className="h-10 w-16 bg-v2-primary/10 rounded" />
        </div>
        <div className="mt-4 pt-4 border-t border-v2-primary/10 flex gap-3">
          <div className="h-8 w-32 bg-v2-primary/10 rounded-full" />
          <div className="h-8 w-24 bg-v2-primary/10 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-32" />
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-32" />
      </div>
      <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-24" />
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null;
  const { isAuthenticated, user } = useAuth();
  const { t, lang } = useLanguage();
  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';

  const { data: apiListing, isLoading, isError } = useListing(id);

  // Fetch bookings for this listing if the user is the carrier
  const isOwner = isAuthenticated && user?.id && apiListing?.carrierId === user.id;
  const { data: listingBookings } = useListingBookings(isOwner ? id : null, 3);

  const listing = useMemo(() => {
    if (apiListing) return apiListing;
    if (isError || (!isLoading && !apiListing)) {
      return MOCK_LISTINGS.find((l) => l.id === id) ?? null;
    }
    return null;
  }, [apiListing, isLoading, isError, id]);

  const fromCode = listing
    ? listing.departureCode || listing.departureCity.slice(0, 3).toUpperCase()
    : '';
  const toCode = listing
    ? listing.arrivalCode || listing.arrivalCity.slice(0, 3).toUpperCase()
    : '';

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-28">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-v2-text-soft hover:text-v2-text mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          {t('wp.back')}
        </Link>

        {isLoading ? (
          <DetailSkeleton />
        ) : !listing ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8 text-v2-primary" />
            </div>
            <h2 className="text-lg font-bold text-v2-text mb-2">{t('listing.notFound')}</h2>
            <p className="text-v2-text-soft mb-4">{t('wp.listingNotFoundDesc')}</p>
            <Link href="/" className="text-v2-primary font-semibold hover:underline">
              {t('wp.browseListings')}
            </Link>
          </div>
        ) : (
          <>
            {/* Route Card */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-md mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-v2-text">{fromCode}</p>
                  <p className="text-sm text-v2-text-soft mt-1">{listing.departureCity}</p>
                </div>

                <div className="flex-1 flex items-center justify-center px-6">
                  <div className="w-4 h-4 rounded-full bg-v2-mint flex-shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-2" />
                  <Plane className="w-6 h-6 text-v2-primary -rotate-90 rtl:rotate-90 flex-shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-2" />
                  <div className="w-4 h-4 rounded-full bg-v2-secondary flex-shrink-0" />
                </div>

                <div className="text-center">
                  <p className="text-3xl font-extrabold text-v2-text">{toCode}</p>
                  <p className="text-sm text-v2-text-soft mt-1">{listing.arrivalCity}</p>
                </div>
              </div>

              <div className="border-t border-v2-primary/10 mt-4 pt-4 flex flex-wrap gap-2">
                <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(listing.departureDate, dateLocale)}
                </span>
                {listing.flightNumber && (
                  <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft">
                    {listing.flightNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Stats: Weight + Price */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm text-center">
                <div className="w-11 h-11 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Weight className="w-5 h-5 text-v2-primary" />
                </div>
                <p className="text-2xl font-extrabold text-v2-text">{listing.availableWeight} kg</p>
                <p className="text-sm text-v2-text-soft">{t('listing.available')}</p>
              </div>
              <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm text-center">
                <div className="w-11 h-11 rounded-full bg-v2-amber/15 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-5 h-5 text-v2-amber" />
                </div>
                <p className="text-2xl font-extrabold text-v2-text">
                  {listing.price} {listing.currency}
                </p>
                <p className="text-sm text-v2-text-soft">{t('listing.pricePerKg')}</p>
              </div>
            </div>

            {/* Notes */}
            {listing.notes && (
              <div className="bg-v2-amber/10 rounded-[22px] p-5 mb-6">
                <h3 className="font-semibold text-v2-text flex items-center gap-1.5 mb-2">
                  <FileText className="w-4 h-4 text-v2-amber" />
                  {t('listing.notes')}
                </h3>
                <p className="text-v2-text-soft">{listing.notes}</p>
              </div>
            )}

            {/* Carrier Info */}
            <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-6">
              <h3 className="font-semibold text-v2-text mb-4">{t('listing.carrier')}</h3>
              <Link
                href={listing.carrier.id ? `/profile/${listing.carrier.id}` : '#'}
                className="flex items-center gap-3 hover:bg-v2-primary/5 -mx-2 px-2 py-2 rounded-2xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-v2-primary/10 flex items-center justify-center text-lg font-bold text-v2-primary">
                  {getInitial(listing.carrier.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-v2-text">{listing.carrier.name}</p>
                    {listing.carrier.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-v2-primary" />
                    )}
                  </div>
                  <p className="text-sm text-v2-primary">{t('wp.publicProfile')}</p>
                </div>
              </Link>
            </div>

            {/* Recent Requests — only shown to listing owner */}
            {isOwner && (
              <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-v2-text flex items-center gap-1.5">
                    <Inbox className="w-4 h-4 text-v2-primary" />
                    {t('listing.recentRequests')}
                  </h3>
                  {listingBookings && listingBookings.length >= 3 && (
                    <Link
                      href="/trips"
                      className="text-sm text-v2-primary font-semibold flex items-center gap-0.5 hover:underline"
                    >
                      {t('listing.showAllRequests')}
                      <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                  )}
                </div>

                {!listingBookings || listingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-v2-primary/5 flex items-center justify-center mx-auto mb-3">
                      <Package className="w-6 h-6 text-v2-primary/40" />
                    </div>
                    <p className="text-sm text-v2-text-soft">{t('listing.noRequestsYet')}</p>
                    <p className="text-xs text-v2-text-muted mt-1">
                      {t('listing.noRequestsYetDesc')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {listingBookings.map((booking) => {
                      const statusIcon =
                        booking.status === 'pending' ? (
                          <Clock className="w-3.5 h-3.5 text-v2-amber" />
                        ) : booking.status === 'accepted' ? (
                          <CheckCircle className="w-3.5 h-3.5 text-v2-mint" />
                        ) : booking.status === 'rejected' || booking.status === 'cancelled' ? (
                          <XCircle className="w-3.5 h-3.5 text-v2-secondary" />
                        ) : (
                          <Package className="w-3.5 h-3.5 text-v2-primary" />
                        );

                      const statusColor =
                        booking.status === 'pending'
                          ? 'bg-v2-amber/10 text-v2-amber'
                          : booking.status === 'accepted'
                            ? 'bg-v2-mint/10 text-v2-mint'
                            : booking.status === 'rejected' || booking.status === 'cancelled'
                              ? 'bg-v2-secondary/10 text-v2-secondary'
                              : 'bg-v2-primary/10 text-v2-primary';

                      return (
                        <Link
                          key={booking.id}
                          href={`/booking/${booking.id}`}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-v2-bg hover:bg-v2-primary/5 transition-colors group"
                        >
                          {/* Avatar */}
                          {booking.sender?.avatarUrl ? (
                            <img
                              src={booking.sender.avatarUrl}
                              alt={booking.sender.name}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-v2-primary/10 flex items-center justify-center text-sm font-bold text-v2-primary flex-shrink-0">
                              {booking.sender?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-v2-text text-sm truncate">
                                {booking.sender?.name || 'Sender'}
                              </p>
                              {booking.sender?.isVerified && (
                                <BadgeCheck className="w-3.5 h-3.5 text-v2-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-v2-text-muted mt-0.5">
                              {booking.totalWeight} {t('home.kg')} {t('listing.weightRequested')} ·{' '}
                              {booking.totalPrice} {t('common.sar')}
                            </p>
                          </div>

                          {/* Status */}
                          <span
                            className={`${statusColor} px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0`}
                          >
                            {statusIcon}
                            {booking.status}
                          </span>

                          <ChevronRight className="w-4 h-4 text-v2-text-muted group-hover:text-v2-primary transition-colors flex-shrink-0 rtl:rotate-180" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Sticky Action Bar */}
      {listing && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-v2-primary/10 p-4 z-40">
          <div className="max-w-3xl mx-auto flex gap-3">
            {isAuthenticated && user?.id === listing.carrierId ? (
              /* Owner viewing their own trip */
              <>
                <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-v2-mint/10 text-v2-mint text-sm font-semibold">
                  <Package className="w-4 h-4" />
                  {t('listing.yourTrip')}
                </div>
                <Link
                  href="/trips"
                  className="flex-1 v2-gradient-primary text-white py-3 rounded-full font-semibold text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Inbox className="w-5 h-5" />
                  {t('listing.viewRequests')}
                </Link>
              </>
            ) : isAuthenticated ? (
              /* Other user — can book */
              <Link
                href={`/booking/create?listingId=${id}`}
                className="flex-1 v2-gradient-primary text-white py-3 rounded-full font-semibold text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                {t('listing.sendRequest')}
              </Link>
            ) : (
              /* Not authenticated */
              <Link
                href="/auth/login"
                className="flex-1 v2-gradient-primary text-white py-3 rounded-full font-semibold text-center hover:opacity-90 transition-opacity"
              >
                {t('nav.signInToBook')}
              </Link>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
