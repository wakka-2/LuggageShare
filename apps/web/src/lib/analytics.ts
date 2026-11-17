/**
 * GA4 event tracking.
 *
 * Pageviews, sessions, traffic source and country are collected automatically by
 * the <GoogleAnalytics> component in the root layout — nothing here is needed for
 * those. This file is only for the marketplace funnel: did a new user actually
 * post a trip or book one, or just land and leave.
 *
 * No-ops when NEXT_PUBLIC_GA_ID is unset (local dev, preview deploys, and any
 * build made before the GA property exists), so call sites never need to guard.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

type GtagWindow = Window & {
  gtag?: (command: 'event', name: string, params?: Record<string, unknown>) => void;
};

/** The funnel worth watching: signup -> supply posted -> demand booked. */
export type AnalyticsEvent = 'sign_up' | 'listing_created' | 'booking_created';

export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}): void {
  if (!GA_ID || typeof window === 'undefined') return;
  const { gtag } = window as GtagWindow;
  // gtag is absent until the GA script loads; a dropped early event is fine.
  gtag?.('event', event, params);
}
