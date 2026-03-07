'use client';

import { Plane, Calendar, Weight, BadgeCheck } from 'lucide-react';
import type { ApiListing } from '@/hooks/useListings';

interface TripCardProps {
  listing: ApiListing;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'غداً';
  if (diffDays > 1 && diffDays < 7) return `بعد ${diffDays} أيام`;

  return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export default function TripCard({ listing }: TripCardProps) {
  const fromCode = listing.departureCode || listing.departureCity.slice(0, 3).toUpperCase();
  const toCode = listing.arrivalCode || listing.arrivalCity.slice(0, 3).toUpperCase();

  return (
    <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm hover:shadow-bubble-md transition-all cursor-pointer group">
      {/* Header: Type badge + date */}
      <div className="flex items-center justify-between mb-4">
        <span className="bg-v2-primary/15 text-v2-primary px-3 py-1 rounded-full text-xs font-bold">
          عرض نقل
        </span>
        <span className="text-xs text-v2-text-muted flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(listing.departureDate)}
        </span>
      </div>

      {/* Route: FROM --- plane --- TO */}
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
        <p className="text-xs text-v2-text-soft">{listing.departureCity}</p>
        <p className="text-xs text-v2-text-soft">{listing.arrivalCity}</p>
      </div>

      {/* Meta chips */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft flex items-center gap-1">
          <Weight className="w-3 h-3" />
          {listing.availableWeight} kg
        </span>
        {listing.flightNumber && (
          <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft">
            {listing.flightNumber}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-v2-primary/10 my-3" />

      {/* Footer: Carrier info + Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-v2-primary/10 flex items-center justify-center text-sm font-bold text-v2-primary">
            {getInitial(listing.carrier.name)}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-v2-text">{listing.carrier.name}</p>
              {listing.carrier.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-v2-primary" />}
            </div>
          </div>
        </div>

        <div className="text-left">
          <p className="text-lg font-extrabold text-v2-text">{listing.price}</p>
          <p className="text-[10px] text-v2-text-muted">{listing.currency}/kg</p>
        </div>
      </div>
    </div>
  );
}
