'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plane,
  Calendar,
  Weight,
  Tag,
  BadgeCheck,
  FileText,
  MessageSquare,
  Tag as PriceTag,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useFlight, useCancelFlight } from '@/hooks/useFlights';
import { useFlightOffers } from '@/hooks/useOffers';
import type { ApiOffer } from '@/hooks/useOffers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const offerStatusConfig = {
  pending: { label: 'Pending', bg: 'bg-v2-amber/10', text: 'text-v2-amber', icon: Clock },
  accepted: { label: 'Accepted', bg: 'bg-v2-mint/10', text: 'text-v2-mint', icon: CheckCircle },
  rejected: {
    label: 'Rejected',
    bg: 'bg-v2-secondary/10',
    text: 'text-v2-secondary',
    icon: XCircle,
  },
  withdrawn: {
    label: 'Withdrawn',
    bg: 'bg-v2-text-muted/10',
    text: 'text-v2-text-muted',
    icon: XCircle,
  },
  expired: {
    label: 'Expired',
    bg: 'bg-v2-text-muted/10',
    text: 'text-v2-text-muted',
    icon: XCircle,
  },
};

function OfferRow({ offer, t }: { offer: ApiOffer; t: (k: string) => string }) {
  const cfg = offerStatusConfig[offer.status] || offerStatusConfig.pending;
  const StatusIcon = cfg.icon;
  const senderName = offer.sender?.name || 'Sender';

  return (
    <Link
      href={`/offers/${offer.id}`}
      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-v2-primary/5 transition-colors group"
    >
      {offer.sender?.avatarUrl ? (
        <img
          src={offer.sender.avatarUrl}
          alt={senderName}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center text-xs font-bold text-v2-primary flex-shrink-0">
          {senderName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-v2-text truncate">{senderName}</span>
          {offer.sender?.isVerified && (
            <BadgeCheck className="w-3.5 h-3.5 text-v2-primary flex-shrink-0" />
          )}
        </div>
        <span className="text-xs text-v2-text-muted">
          {offer.offeredWeight} kg · {offer.offeredPrice} {offer.currency}
        </span>
      </div>

      <span
        className={`${cfg.bg} ${cfg.text} px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 flex-shrink-0`}
      >
        <StatusIcon className="w-3 h-3" />
        {cfg.label}
      </span>

      <Link
        href={`/offers/${offer.id}`}
        onClick={(e) => e.stopPropagation()}
        className="w-8 h-8 rounded-full bg-v2-primary/10 flex items-center justify-center flex-shrink-0 hover:bg-v2-primary/20 transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5 text-v2-primary" />
      </Link>
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm space-y-4">
        <div className="flex justify-between">
          <div className="h-6 w-20 bg-v2-primary/10 rounded-full" />
          <div className="h-6 w-20 bg-v2-primary/10 rounded-full" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-10 w-16 bg-v2-primary/10 rounded" />
          <div className="flex-1 mx-8 h-1 bg-v2-primary/10 rounded" />
          <div className="h-10 w-16 bg-v2-primary/10 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-v2-primary/10 rounded-full" />
          <div className="h-8 w-24 bg-v2-primary/10 rounded-full" />
          <div className="h-8 w-20 bg-v2-primary/10 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-28" />
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm h-28" />
      </div>
    </div>
  );
}

export default function FlightDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t, lang } = useLanguage();
  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';

  const { data: flight, isLoading } = useFlight(id);
  const isOwner = isAuthenticated && user?.id && flight?.posterId === user.id;
  const { data: offers } = useFlightOffers(isOwner ? id : null);
  const cancelFlight = useCancelFlight();

  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [offersExpanded, setOffersExpanded] = useState(true);

  async function handleCancel() {
    if (!id) return;
    try {
      await cancelFlight.mutateAsync(id);
      router.back();
    } catch {
      // error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col blob-background">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <DetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex flex-col blob-background">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-v2-text-muted text-lg">
              {t('flight.notFound') || 'Flight not found'}
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-v2-primary font-semibold hover:underline"
            >
              {t('common.goHome') || 'Go Home'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const fromCode = flight.departureCode || flight.departureCity.slice(0, 3).toUpperCase();
  const toCode = flight.arrivalCode || flight.arrivalCity.slice(0, 3).toUpperCase();
  const remaining = Number(flight.remainingWeight);
  const total = Number(flight.totalWeight);
  const capacityPercent = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const offerCount = flight._count?.offers ?? offers?.length ?? 0;
  const pendingOffers = offers?.filter((o) => o.status === 'pending') ?? [];

  const flightStatusMap: Record<string, { label: string; bg: string; text: string }> = {
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
  const flightStatus = flightStatusMap[flight.status] || flightStatusMap.active;

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 pb-28">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-v2-text-soft text-sm font-medium mb-5 hover:text-v2-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t('common.back') || 'Back'}
        </button>

        {/* Main route card */}
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-md mb-4">
          {/* Status row */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`${flightStatus.bg} ${flightStatus.text} px-3 py-1 rounded-full text-xs font-bold`}
            >
              {flightStatus.label}
            </span>
            <span className="text-xs text-v2-text-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(flight.departureDate, dateLocale)}
            </span>
          </div>

          {/* Route line */}
          <div className="flex items-center justify-between mb-1">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-v2-text">{fromCode}</p>
            </div>
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="w-3 h-3 rounded-full bg-v2-mint flex-shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-2" />
              <Plane className="w-5 h-5 text-v2-primary -rotate-90 rtl:rotate-90 flex-shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-2" />
              <div className="w-3 h-3 rounded-full bg-v2-secondary flex-shrink-0" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-v2-text">{toCode}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-v2-text-soft">{flight.departureCity}</p>
            <p className="text-sm text-v2-text-soft">{flight.arrivalCity}</p>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-v2-bg px-3 py-1.5 rounded-full text-xs font-medium text-v2-text-soft flex items-center gap-1.5">
              <Weight className="w-3.5 h-3.5" />
              {remaining} / {total} kg {t('flight.remaining') || 'remaining'}
            </span>
            <span className="bg-v2-bg px-3 py-1.5 rounded-full text-xs font-medium text-v2-text-soft flex items-center gap-1.5">
              <PriceTag className="w-3.5 h-3.5" />
              {flight.pricePerKg} {flight.currency}/kg
            </span>
            {flight.flightNumber && (
              <span className="bg-v2-bg px-3 py-1.5 rounded-full text-xs font-medium text-v2-text-soft flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" />
                {flight.flightNumber}
              </span>
            )}
          </div>
        </div>

        {/* Capacity bar */}
        <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-v2-text">
              {t('flight.capacity') || 'Capacity'}
            </span>
            <span className="text-xs text-v2-text-muted">
              {Math.round(capacityPercent)}% {t('flight.used') || 'used'}
            </span>
          </div>
          <div className="w-full h-2.5 bg-v2-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${capacityPercent}%`,
                backgroundColor: capacityPercent >= 90 ? '#FF6B9D' : '#7B5EA7',
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-v2-text-muted">
              {total - remaining} kg {t('flight.booked') || 'booked'}
            </span>
            <span className="text-xs text-v2-text-muted">
              {remaining} kg {t('flight.free') || 'free'}
            </span>
          </div>
        </div>

        {/* Notes */}
        {flight.notes && (
          <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-4 flex gap-3">
            <FileText className="w-4 h-4 text-v2-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-v2-text-soft leading-relaxed">{flight.notes}</p>
          </div>
        )}

        {/* Poster info */}
        {!isOwner && (
          <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-4">
            <p className="text-xs font-bold text-v2-text-muted uppercase tracking-wide mb-3">
              {t('flight.traveler') || 'Traveler'}
            </p>
            <div className="flex items-center gap-3">
              {flight.poster?.avatarUrl ? (
                <img
                  src={flight.poster.avatarUrl}
                  alt={flight.poster.name}
                  className="w-11 h-11 rounded-full object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-v2-primary/10 flex items-center justify-center text-sm font-bold text-v2-primary">
                  {flight.poster?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-v2-text">{flight.poster?.name}</span>
                  {flight.poster?.isVerified && <BadgeCheck className="w-4 h-4 text-v2-primary" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Offers section — poster only */}
        {isOwner && (
          <div className="bg-white rounded-[22px] shadow-bubble-sm mb-4 overflow-hidden">
            <button
              type="button"
              onClick={() => setOffersExpanded(!offersExpanded)}
              className="w-full flex items-center justify-between p-5 hover:bg-v2-primary/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-v2-text">{t('flight.offers') || 'Offers'}</span>
                <span className="bg-v2-primary/10 text-v2-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {offerCount}
                </span>
                {pendingOffers.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-v2-amber font-medium">
                    <span className="w-2 h-2 rounded-full bg-v2-amber animate-pulse" />
                    {pendingOffers.length} {t('offer.pending') || 'pending'}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-v2-text-muted transition-transform ${offersExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {offersExpanded && (
              <div className="px-3 pb-3 border-t border-v2-primary/10">
                {(offers ?? []).length === 0 ? (
                  <p className="text-center text-sm text-v2-text-muted py-4">
                    {t('flight.noOffersYet') || 'No offers yet'}
                  </p>
                ) : (
                  (offers ?? []).map((offer) => <OfferRow key={offer.id} offer={offer} t={t} />)
                )}
              </div>
            )}
          </div>
        )}

        {/* Cancel confirmation */}
        {cancelConfirm && isOwner && flight.status === 'active' && (
          <div className="bg-v2-secondary/10 border border-v2-secondary/20 rounded-[22px] p-5 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-v2-secondary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-v2-text mb-1">
                  {t('flight.cancelConfirm') || 'Cancel this flight?'}
                </p>
                <p className="text-sm text-v2-text-soft mb-3">
                  {t('flight.cancelWarning') ||
                    'All pending offers will be rejected. This cannot be undone.'}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelFlight.isPending}
                    className="px-4 py-2 rounded-full bg-v2-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {cancelFlight.isPending
                      ? t('common.loading') || '...'
                      : t('flight.confirmCancel') || 'Yes, cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCancelConfirm(false)}
                    className="px-4 py-2 rounded-full border border-v2-text-muted text-v2-text-soft text-sm font-semibold hover:bg-v2-bg transition-colors"
                  >
                    {t('common.keepIt') || 'Keep it'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-v2-primary/10 px-4 py-3 z-30">
        <div className="max-w-2xl mx-auto flex gap-3">
          {isOwner ? (
            <>
              <Link
                href={`/flights/${id}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-v2-primary/10 text-v2-primary text-sm font-semibold hover:bg-v2-primary/15 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                {t('flight.viewOffers') || 'View Offers'} ({offerCount})
              </Link>
              {flight.status === 'active' && (
                <button
                  type="button"
                  onClick={() => setCancelConfirm(!cancelConfirm)}
                  className="px-5 py-3 rounded-full border border-v2-secondary/30 text-v2-secondary text-sm font-semibold hover:bg-v2-secondary/5 transition-colors"
                >
                  {t('flight.cancel') || 'Cancel'}
                </button>
              )}
            </>
          ) : (
            <>
              {flight.status === 'active' && remaining > 0 && (
                <Link
                  href={`/flights/${id}/offer`}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full v2-gradient-primary text-white text-sm font-bold shadow-bubble-sm hover:opacity-90 transition-opacity"
                >
                  <Tag className="w-4 h-4" />
                  {t('offer.makeOffer') || 'Make an Offer'}
                </Link>
              )}
              {(flight.status !== 'active' || remaining === 0) && (
                <div className="flex-1 flex items-center justify-center py-3.5 rounded-full bg-v2-bg text-v2-text-muted text-sm font-medium">
                  {flight.status === 'full'
                    ? t('flight.full') || 'Flight Full'
                    : t('flight.unavailable') || 'Unavailable'}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
