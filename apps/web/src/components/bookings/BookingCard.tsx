'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plane, Weight, XCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useCancelBooking } from '@/hooks/useBookings';

interface BookingCardProps {
  booking: {
    id: string;
    listing: {
      departureCity: string;
      departureCode?: string | null;
      arrivalCity: string;
      arrivalCode?: string | null;
      departureDate: string;
    };
    status: string;
    totalWeight: number;
    totalPrice?: number | null;
    carrier?: { name: string };
    sender?: { name: string };
  };
  userRole: 'carrier' | 'sender';
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export default function BookingCard({ booking, userRole }: BookingCardProps) {
  const { t, lang } = useLanguage();
  const cancelBooking = useCancelBooking();
  const [showConfirm, setShowConfirm] = useState(false);

  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: t('booking.pending'), bg: 'bg-v2-amber/15', text: 'text-v2-amber' },
    accepted: { label: t('booking.statusAccepted'), bg: 'bg-v2-sky/15', text: 'text-v2-sky' },
    picked_up: {
      label: t('booking.statusPickedUp'),
      bg: 'bg-v2-primary/15',
      text: 'text-v2-primary',
    },
    in_transit: {
      label: t('booking.statusInTransit'),
      bg: 'bg-v2-primary/15',
      text: 'text-v2-primary',
    },
    delivered: { label: t('booking.statusDelivered'), bg: 'bg-v2-mint/15', text: 'text-v2-mint' },
    cancelled: {
      label: t('booking.statusCancelled'),
      bg: 'bg-v2-secondary/15',
      text: 'text-v2-secondary',
    },
    rejected: {
      label: t('booking.statusRejected'),
      bg: 'bg-v2-secondary/15',
      text: 'text-v2-secondary',
    },
  };

  const fromCode =
    booking.listing.departureCode || booking.listing.departureCity.slice(0, 3).toUpperCase();
  const toCode =
    booking.listing.arrivalCode || booking.listing.arrivalCity.slice(0, 3).toUpperCase();

  const status = statusConfig[booking.status] || statusConfig.pending;
  const otherParty = userRole === 'carrier' ? booking.sender?.name : booking.carrier?.name;
  const isPending = booking.status === 'pending';

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (showConfirm) {
      cancelBooking.mutate(booking.id, {
        onSuccess: () => setShowConfirm(false),
      });
    } else {
      setShowConfirm(true);
    }
  }

  function handleCancelDismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  }

  return (
    <Link
      href={`/booking/${booking.id}`}
      className="block bg-white rounded-[22px] p-5 shadow-bubble-sm hover:shadow-bubble-md transition-all"
    >
      {/* Top: status badge + date */}
      <div className="flex items-center justify-between mb-4">
        <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-bold`}>
          {status.label}
        </span>
        <span className="text-xs text-v2-text-muted">
          {formatDate(booking.listing.departureDate, dateLocale)}
        </span>
      </div>

      {/* Route */}
      <div className="flex items-center justify-between mb-1">
        <div className="text-center">
          <p className="text-xl font-extrabold text-v2-text">{fromCode}</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-3">
          <div className="w-3 h-3 rounded-full bg-v2-mint flex-shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-1" />
          <Plane className="w-4 h-4 text-v2-primary -rotate-90 flex-shrink-0 rtl:rotate-90" />
          <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-1" />
          <div className="w-3 h-3 rounded-full bg-v2-secondary flex-shrink-0" />
        </div>

        <div className="text-center">
          <p className="text-xl font-extrabold text-v2-text">{toCode}</p>
        </div>
      </div>

      {/* City names */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-v2-text-soft">{booking.listing.departureCity}</p>
        <p className="text-xs text-v2-text-soft">{booking.listing.arrivalCity}</p>
      </div>

      {/* Meta chips */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft flex items-center gap-1">
          <Weight className="w-3 h-3" />
          {booking.totalWeight} {t('home.kg')}
        </span>
        {booking.totalPrice != null && (
          <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft">
            {booking.totalPrice} {t('common.sar')}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-v2-primary/10 my-3" />

      {/* Footer: other party + cancel */}
      <div className="flex items-center justify-between">
        {otherParty ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-v2-primary/10 flex items-center justify-center text-xs font-bold text-v2-primary">
              {otherParty.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-v2-text-soft">
              {userRole === 'carrier' ? t('booking.sender') : t('booking.carrier')}: {otherParty}
            </span>
          </div>
        ) : (
          <div />
        )}

        {/* Cancel button for pending bookings */}
        {isPending && (
          <div className="flex items-center gap-2">
            {showConfirm ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelDismiss}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-v2-text-soft border border-v2-primary/20 hover:bg-v2-bg transition-all"
                >
                  {t('booking.no')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelBooking.isPending}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-v2-secondary hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  {cancelBooking.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    t('booking.yesCancel')
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-v2-secondary border border-v2-secondary/30 hover:bg-v2-secondary/5 transition-all flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                {t('common.cancel')}
              </button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
