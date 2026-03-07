import Link from 'next/link';
import { Plane, Weight } from 'lucide-react';

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

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'معلق', bg: 'bg-v2-amber/15', text: 'text-v2-amber' },
  accepted: { label: 'مقبول', bg: 'bg-v2-sky/15', text: 'text-v2-sky' },
  picked_up: { label: 'تم الاستلام', bg: 'bg-v2-primary/15', text: 'text-v2-primary' },
  in_transit: { label: 'في الطريق', bg: 'bg-v2-primary/15', text: 'text-v2-primary' },
  delivered: { label: 'تم التوصيل', bg: 'bg-v2-mint/15', text: 'text-v2-mint' },
  cancelled: { label: 'ملغي', bg: 'bg-v2-secondary/15', text: 'text-v2-secondary' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
}

export default function BookingCard({ booking, userRole }: BookingCardProps) {
  const fromCode =
    booking.listing.departureCode || booking.listing.departureCity.slice(0, 3).toUpperCase();
  const toCode =
    booking.listing.arrivalCode || booking.listing.arrivalCity.slice(0, 3).toUpperCase();

  const status = statusConfig[booking.status] || statusConfig.pending;
  const otherParty = userRole === 'carrier' ? booking.sender?.name : booking.carrier?.name;

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
          {formatDate(booking.listing.departureDate)}
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
          {booking.totalWeight} kg
        </span>
        {booking.totalPrice != null && (
          <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft">
            {booking.totalPrice} ر.س
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-v2-primary/10 my-3" />

      {/* Footer: other party */}
      {otherParty && (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-v2-primary/10 flex items-center justify-center text-xs font-bold text-v2-primary">
            {otherParty.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-v2-text-soft">
            {userRole === 'carrier' ? 'المرسل' : 'الناقل'}: {otherParty}
          </span>
        </div>
      )}
    </Link>
  );
}
