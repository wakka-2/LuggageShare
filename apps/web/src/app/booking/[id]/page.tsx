'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plane,
  Calendar,
  Weight,
  DollarSign,
  ArrowRight,
  MessageSquare,
  BadgeCheck,
  FileText,
  Package,
  CreditCard,
  XCircle,
  CheckCircle,
  Truck,
  PackageCheck,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StatusTimeline from '@/components/common/StatusTimeline';
import StarRating from '@/components/common/StarRating';
import Modal from '@/components/common/Modal';
import {
  useBooking,
  useAcceptBooking,
  useRejectBooking,
  useMarkPickedUp,
  useMarkInTransit,
  useMarkDelivered,
  useCancelBooking,
} from '@/hooks/useBookings';
import { useBookingReview, useCreateReview } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/providers/LanguageProvider';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-v2-amber/15', text: 'text-v2-amber' },
  accepted: { bg: 'bg-v2-sky/15', text: 'text-v2-sky' },
  picked_up: { bg: 'bg-v2-primary/15', text: 'text-v2-primary' },
  in_transit: { bg: 'bg-v2-primary/15', text: 'text-v2-primary' },
  delivered: { bg: 'bg-v2-mint/15', text: 'text-v2-mint' },
  cancelled: { bg: 'bg-v2-secondary/15', text: 'text-v2-secondary' },
  rejected: { bg: 'bg-v2-secondary/15', text: 'text-v2-secondary' },
};

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function BookingDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Route card */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-32" />
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-32" />
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-24" />

      {/* People cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-20" />
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-20" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                             */
/* -------------------------------------------------------------------------- */

function BookingDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';

  // Status config (inside component to access t())
  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: t('booking.pending'), ...statusStyles.pending },
    accepted: { label: t('booking.statusAccepted'), ...statusStyles.accepted },
    picked_up: { label: t('booking.statusPickedUp'), ...statusStyles.picked_up },
    in_transit: { label: t('booking.statusInTransit'), ...statusStyles.in_transit },
    delivered: { label: t('booking.statusDelivered'), ...statusStyles.delivered },
    cancelled: { label: t('booking.statusCancelled'), ...statusStyles.cancelled },
    rejected: { label: t('booking.statusRejected'), ...statusStyles.rejected },
  };

  // Data fetching
  const { data: booking, isLoading, error } = useBooking(id ?? null);
  const { data: existingReview } = useBookingReview(booking?.status === 'delivered' ? id : null);

  // Mutations
  const acceptBooking = useAcceptBooking();
  const rejectBooking = useRejectBooking();
  const markPickedUp = useMarkPickedUp();
  const markInTransit = useMarkInTransit();
  const markDelivered = useMarkDelivered();
  const cancelBooking = useCancelBooking();
  const createReview = useCreateReview();

  // Local state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Derive user role
  const isCarrier = user?.id === booking?.carrierId;
  const isSender = user?.id === booking?.senderId;
  const status = booking?.status ?? '';

  // Status helpers
  const canCancel = status === 'pending' || status === 'accepted';
  const isPending = status === 'pending';
  const isAccepted = status === 'accepted';
  const isPickedUp = status === 'picked_up';
  const isInTransit = status === 'in_transit';
  const isDelivered = status === 'delivered';
  const isTerminal = status === 'delivered' || status === 'cancelled' || status === 'rejected';

  // Any mutation in progress
  const isMutating =
    acceptBooking.isPending ||
    rejectBooking.isPending ||
    markPickedUp.isPending ||
    markInTransit.isPending ||
    markDelivered.isPending ||
    cancelBooking.isPending ||
    createReview.isPending;

  /* ---- Handlers ---- */

  function handleAccept() {
    if (!id) return;
    acceptBooking.mutate(id);
  }

  function handleReject() {
    if (!id) return;
    rejectBooking.mutate(id, {
      onSuccess: () => setShowRejectModal(false),
    });
  }

  function handlePickedUp() {
    if (!id) return;
    markPickedUp.mutate(id);
  }

  function handleInTransit() {
    if (!id) return;
    markInTransit.mutate(id);
  }

  function handleDelivered() {
    if (!id) return;
    markDelivered.mutate(id);
  }

  function handleCancel() {
    if (!id) return;
    cancelBooking.mutate(id, {
      onSuccess: () => setShowCancelModal(false),
    });
  }

  function handleSubmitReview() {
    if (!id || reviewRating === 0) return;
    createReview.mutate(
      {
        bookingId: id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      },
      {
        onSuccess: () => setReviewSubmitted(true),
      }
    );
  }

  /* ---- Derived data ---- */

  const fromCode = booking
    ? booking.listing.departureCode || booking.listing.departureCity.slice(0, 3).toUpperCase()
    : '';
  const toCode = booking
    ? booking.listing.arrivalCode || booking.listing.arrivalCity.slice(0, 3).toUpperCase()
    : '';

  const statusStyle = statusConfig[status] || statusConfig.pending;

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-28" dir="rtl">
        {/* Back link */}
        <Link
          href="/trips"
          className="inline-flex items-center gap-1.5 text-v2-text-soft hover:text-v2-text mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          {t('wp.backToBookings')}
        </Link>

        {isLoading ? (
          <BookingDetailSkeleton />
        ) : error || !booking ? (
          /* ---- Error / Not Found ---- */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-v2-secondary/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-v2-secondary" />
            </div>
            <h2 className="text-lg font-bold text-v2-text mb-2">{t('wp.bookingNotFound')}</h2>
            <p className="text-v2-text-soft mb-4">{t('wp.bookingNotFoundDesc')}</p>
            <Link href="/trips" className="text-v2-primary font-semibold hover:underline">
              {t('wp.backToBookings')}
            </Link>
          </div>
        ) : (
          <>
            {/* ---- Status Badge + Booking ID ---- */}
            <div className="flex items-center justify-between mb-6">
              <span
                className={`${statusStyle.bg} ${statusStyle.text} px-4 py-1.5 rounded-full text-sm font-bold`}
              >
                {statusStyle.label}
              </span>
              <span className="text-xs text-v2-text-muted font-mono" dir="ltr">
                #{booking.id.slice(0, 8)}
              </span>
            </div>

            {/* ---- Route Card ---- */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-md mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-v2-text">{fromCode}</p>
                  <p className="text-sm text-v2-text-soft mt-1">{booking.listing.departureCity}</p>
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
                  <p className="text-sm text-v2-text-soft mt-1">{booking.listing.arrivalCity}</p>
                </div>
              </div>

              {/* Date pill */}
              <div className="border-t border-v2-primary/10 mt-4 pt-4 flex flex-wrap gap-2">
                <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(booking.listing.departureDate, dateLocale)}
                </span>
              </div>
            </div>

            {/* ---- Weight + Price Cards ---- */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm text-center">
                <div className="w-11 h-11 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Weight className="w-5 h-5 text-v2-primary" />
                </div>
                <p className="text-2xl font-extrabold text-v2-text">
                  {booking.totalWeight} {t('home.kg')}
                </p>
                <p className="text-sm text-v2-text-soft">{t('booking.weight')}</p>
              </div>
              <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm text-center">
                <div className="w-11 h-11 rounded-full bg-v2-amber/15 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-5 h-5 text-v2-amber" />
                </div>
                <p className="text-2xl font-extrabold text-v2-text">
                  {booking.totalPrice} {t('common.sar')}
                </p>
                <p className="text-sm text-v2-text-soft">{t('booking.total')}</p>
              </div>
            </div>

            {/* ---- Status Timeline ---- */}
            {!isTerminal || isDelivered ? (
              <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-6">
                <h3 className="font-semibold text-v2-text mb-4">{t('booking.statusTracking')}</h3>
                <StatusTimeline currentStatus={status} />
              </div>
            ) : null}

            {/* ---- Items Section ---- */}
            {booking.items && booking.items.length > 0 && (
              <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-6">
                <h3 className="font-semibold text-v2-text mb-4 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-v2-primary" />
                  {t('booking.items')} ({booking.items.length})
                </h3>
                <div className="space-y-3">
                  {booking.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-v2-bg rounded-2xl">
                      {item.imageUrls && item.imageUrls.length > 0 ? (
                        <img
                          src={item.imageUrls[0]}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-v2-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-v2-primary/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-v2-text text-sm">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-v2-text-soft mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-v2-text-muted">
                            {item.weight} {t('home.kg')}
                          </span>
                          {item.value > 0 && (
                            <span className="text-xs text-v2-text-muted">
                              {t('booking.itemValue')}: {item.value} {t('common.sar')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---- People: Carrier + Sender ---- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Carrier */}
              <Link
                href={`/profile/${booking.carrier.id}`}
                className="bg-white rounded-[22px] p-5 shadow-bubble-sm hover:shadow-bubble-md transition-all"
              >
                <h3 className="text-xs font-bold text-v2-text-muted uppercase mb-3">
                  {t('booking.carrier')}
                </h3>
                <div className="flex items-center gap-3">
                  {booking.carrier.avatarUrl ? (
                    <img
                      src={booking.carrier.avatarUrl}
                      alt={booking.carrier.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-v2-primary/10 flex items-center justify-center text-base font-bold text-v2-primary">
                      {getInitial(booking.carrier.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-v2-text truncate">{booking.carrier.name}</p>
                      {booking.carrier.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-v2-primary flex-shrink-0" />
                      )}
                    </div>
                    {isCarrier && (
                      <p className="text-xs text-v2-primary font-medium">{t('booking.you')}</p>
                    )}
                  </div>
                </div>
              </Link>

              {/* Sender */}
              <Link
                href={`/profile/${booking.sender.id}`}
                className="bg-white rounded-[22px] p-5 shadow-bubble-sm hover:shadow-bubble-md transition-all"
              >
                <h3 className="text-xs font-bold text-v2-text-muted uppercase mb-3">
                  {t('booking.sender')}
                </h3>
                <div className="flex items-center gap-3">
                  {booking.sender.avatarUrl ? (
                    <img
                      src={booking.sender.avatarUrl}
                      alt={booking.sender.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-v2-secondary/10 flex items-center justify-center text-base font-bold text-v2-secondary">
                      {getInitial(booking.sender.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-v2-text truncate">{booking.sender.name}</p>
                      {booking.sender.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-v2-primary flex-shrink-0" />
                      )}
                    </div>
                    {isSender && (
                      <p className="text-xs text-v2-primary font-medium">{t('booking.you')}</p>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* ---- Payment Status ---- */}
            {(isPending || isAccepted) && (
              <div className="bg-v2-amber/10 rounded-[22px] p-5 mb-6">
                <h3 className="font-semibold text-v2-text flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-4 h-4 text-v2-amber" />
                  {t('booking.payment')}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-v2-text-soft">
                    {booking.paymentStatus === 'confirmed'
                      ? t('booking.paymentConfirmed')
                      : booking.paymentProofUrl
                        ? t('booking.paymentAwaitingConfirmation')
                        : t('booking.paymentNotPaid')}
                  </p>
                  {isSender && !booking.paymentProofUrl && (
                    <Link
                      href={`/booking/${id}/payment`}
                      className="text-sm font-semibold text-v2-primary hover:underline"
                    >
                      {t('wp.submitPaymentProof')}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* ---- Booking Meta ---- */}
            <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-6">
              <h3 className="font-semibold text-v2-text mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-v2-primary" />
                {t('wp.bookingDetails')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-1">
                  <span className="text-v2-text-soft">{t('booking.bookingDate')}</span>
                  <span className="text-v2-text font-medium">
                    {formatShortDate(booking.createdAt, dateLocale)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-v2-text-soft">{t('booking.pricePerKg')}</span>
                  <span className="text-v2-text font-medium">
                    {booking.listing.price} {t('common.sar')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-v2-text-soft">{t('booking.currency')}</span>
                  <span className="text-v2-text font-medium">{booking.currency || 'SAR'}</span>
                </div>
              </div>
            </div>

            {/* ---- Review Section (Delivered only) ---- */}
            {isDelivered && (
              <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-6">
                <h3 className="font-semibold text-v2-text mb-4">{t('booking.review')}</h3>

                {existingReview || reviewSubmitted ? (
                  /* Show existing review */
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <StarRating rating={existingReview?.rating ?? reviewRating} size="md" />
                      <span className="text-sm text-v2-text-soft">
                        {existingReview?.rating ?? reviewRating} / 5
                      </span>
                    </div>
                    {(existingReview?.comment || reviewComment) && (
                      <p className="text-sm text-v2-text-soft bg-v2-bg rounded-2xl p-3">
                        {existingReview?.comment ?? reviewComment}
                      </p>
                    )}
                    {reviewSubmitted && !existingReview && (
                      <p className="text-sm text-v2-mint font-medium mt-2">
                        {t('booking.reviewSubmitSuccess')}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Review form */
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-v2-text-soft mb-2">
                        {t('booking.howWasExperience')}
                      </p>
                      <StarRating
                        rating={reviewRating}
                        size="lg"
                        interactive
                        onRate={setReviewRating}
                      />
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={t('booking.addComment')}
                      rows={3}
                      className="w-full bg-v2-bg border-0 rounded-2xl p-4 text-sm text-v2-text placeholder:text-v2-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-v2-primary/30"
                      dir="rtl"
                    />
                    <button
                      onClick={handleSubmitReview}
                      disabled={reviewRating === 0 || createReview.isPending}
                      className="w-full v2-gradient-primary text-white py-3 rounded-full font-semibold text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {createReview.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        t('booking.submitReview')
                      )}
                    </button>
                    {createReview.isError && (
                      <p className="text-sm text-v2-secondary text-center">
                        {t('booking.reviewSubmitError')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ---- Mutation Error ---- */}
            {(acceptBooking.isError ||
              rejectBooking.isError ||
              markPickedUp.isError ||
              markInTransit.isError ||
              markDelivered.isError ||
              cancelBooking.isError) && (
              <div className="bg-v2-secondary/10 rounded-[22px] p-4 mb-6 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-v2-secondary flex-shrink-0" />
                <p className="text-sm text-v2-secondary">{t('booking.bookingUpdateError')}</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* ---- Sticky Action Bar ---- */}
      {booking && !isLoading && !isTerminal && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-v2-primary/10 p-4 z-40">
          <div className="max-w-3xl mx-auto flex gap-3" dir="rtl">
            {/* Chat button */}
            <Link
              href={`/chat/${booking.id}`}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border-2 border-v2-primary text-v2-primary font-semibold hover:bg-v2-primary/5 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              {t('wp.chatWithParty')}
            </Link>

            {/* Carrier: Accept (pending) */}
            {isCarrier && isPending && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={isMutating}
                  className="flex-1 v2-gradient-primary text-white py-3 rounded-full font-semibold text-center hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {acceptBooking.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {t('booking.accept')}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isMutating}
                  className="px-5 py-3 rounded-full border-2 border-v2-secondary text-v2-secondary font-semibold hover:bg-v2-secondary/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  {t('booking.reject')}
                </button>
              </>
            )}

            {/* Carrier: Mark Picked Up (accepted) */}
            {isCarrier && isAccepted && (
              <button
                onClick={handlePickedUp}
                disabled={isMutating}
                className="flex-1 v2-gradient-primary text-white py-3 rounded-full font-semibold text-center hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {markPickedUp.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <PackageCheck className="w-5 h-5" />
                    {t('booking.markPickedUp')}
                  </>
                )}
              </button>
            )}

            {/* Carrier: Mark In Transit (picked_up) */}
            {isCarrier && isPickedUp && (
              <button
                onClick={handleInTransit}
                disabled={isMutating}
                className="flex-1 v2-gradient-primary text-white py-3 rounded-full font-semibold text-center hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {markInTransit.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Truck className="w-5 h-5" />
                    {t('booking.markInTransit')}
                  </>
                )}
              </button>
            )}

            {/* Carrier: Mark Delivered (in_transit) */}
            {isCarrier && isInTransit && (
              <button
                onClick={handleDelivered}
                disabled={isMutating}
                className="flex-1 v2-gradient-primary text-white py-3 rounded-full font-semibold text-center hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {markDelivered.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('booking.markDelivered')}
                  </>
                )}
              </button>
            )}

            {/* Cancel button (pending or accepted, either party) */}
            {canCancel && !isPending && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={isMutating}
                className="px-5 py-3 rounded-full border-2 border-v2-secondary text-v2-secondary font-semibold hover:bg-v2-secondary/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                {t('common.cancel')}
              </button>
            )}

            {/* Sender: Cancel when pending */}
            {isSender && isPending && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={isMutating}
                className="flex-1 px-5 py-3 rounded-full border-2 border-v2-secondary text-v2-secondary font-semibold hover:bg-v2-secondary/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                {t('booking.cancelBooking')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---- Delivered: Chat link at bottom ---- */}
      {booking && isDelivered && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-v2-primary/10 p-4 z-40">
          <div className="max-w-3xl mx-auto flex gap-3" dir="rtl">
            <Link
              href={`/chat/${booking.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full border-2 border-v2-primary text-v2-primary font-semibold hover:bg-v2-primary/5 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              {t('wp.chatWithParty')}
            </Link>
          </div>
        </div>
      )}

      {/* ---- Cancel Confirmation Modal ---- */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={t('booking.cancelBooking')}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-v2-secondary/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 text-v2-secondary" />
          </div>
          <p className="text-v2-text-soft mb-6">{t('booking.cancelConfirmMessage')}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 py-3 rounded-full border-2 border-v2-primary/20 text-v2-text font-semibold hover:bg-v2-bg transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelBooking.isPending}
              className="flex-1 py-3 rounded-full bg-v2-secondary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cancelBooking.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('booking.yesCancel')
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ---- Reject Confirmation Modal ---- */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title={t('booking.rejectBooking')}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-v2-secondary/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 text-v2-secondary" />
          </div>
          <p className="text-v2-text-soft mb-6">{t('booking.rejectConfirmMessage')}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRejectModal(false)}
              className="flex-1 py-3 rounded-full border-2 border-v2-primary/20 text-v2-text font-semibold hover:bg-v2-bg transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleReject}
              disabled={rejectBooking.isPending}
              className="flex-1 py-3 rounded-full bg-v2-secondary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {rejectBooking.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('booking.yesReject')
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Export with ProtectedRoute Wrapper                                     */
/* -------------------------------------------------------------------------- */

export default function BookingDetailPage() {
  return (
    <ProtectedRoute>
      <BookingDetailContent />
    </ProtectedRoute>
  );
}
