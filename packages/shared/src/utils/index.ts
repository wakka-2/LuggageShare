import { BOOKING_STATUS_LABELS, LISTING_STATUS_LABELS, RATING_LABELS } from '../constants';
import type { BookingStatus, ListingStatus } from '../types';

// Format currency
export function formatCurrency(
  amount: number,
  currency: string = 'SAR',
  locale: string = 'ar-SA'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date
export function formatDate(
  date: string | Date,
  locale: string = 'ar-SA',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(
    new Date(date)
  );
}

// Format relative time
export function formatRelativeTime(
  date: string | Date,
  locale: string = 'ar-SA'
): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }
  if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  }
  if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  }
  if (diffInSeconds < 604800) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  }
  return formatDate(date, locale);
}

// Get booking status label
export function getBookingStatusLabel(
  status: BookingStatus,
  lang: 'ar' | 'en' = 'ar'
): string {
  return BOOKING_STATUS_LABELS[lang][status];
}

// Get listing status label
export function getListingStatusLabel(
  status: ListingStatus,
  lang: 'ar' | 'en' = 'ar'
): string {
  return LISTING_STATUS_LABELS[lang][status];
}

// Get rating label
export function getRatingLabel(
  rating: number,
  lang: 'ar' | 'en' = 'ar'
): string {
  const key = Math.min(5, Math.max(1, Math.round(rating))) as 1 | 2 | 3 | 4 | 5;
  return RATING_LABELS[lang][key];
}

// Get booking status color
export function getBookingStatusColor(status: BookingStatus): {
  bg: string;
  text: string;
} {
  const colors: Record<BookingStatus, { bg: string; text: string }> = {
    pending: { bg: '#FEF3C7', text: '#D97706' },
    accepted: { bg: '#D1FAE5', text: '#059669' },
    rejected: { bg: '#FEE2E2', text: '#DC2626' },
    picked_up: { bg: '#DBEAFE', text: '#2563EB' },
    in_transit: { bg: '#E0E7FF', text: '#4F46E5' },
    delivered: { bg: '#D1FAE5', text: '#059669' },
    cancelled: { bg: '#E5E7EB', text: '#6B7280' },
  };
  return colors[status];
}

// Generate initials from name
export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Calculate total weight from items
export function calculateTotalWeight(items: { weight: number }[]): number {
  return items.reduce((sum, item) => sum + item.weight, 0);
}

// Calculate total price
export function calculateTotalPrice(
  weight: number,
  pricePerKg: number
): number {
  return Math.round(weight * pricePerKg * 100) / 100;
}

// Validate weight is within limits
export function isValidWeight(weight: number, maxWeight: number = 30): boolean {
  return weight > 0 && weight <= maxWeight;
}

// Validate item value is within limits
export function isValidItemValue(
  value: number,
  maxValue: number = 500
): boolean {
  return value > 0 && value <= maxValue;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Generate route string
export function formatRoute(
  from: string,
  to: string,
  separator: string = '→'
): string {
  return `${from} ${separator} ${to}`;
}
