import { Listing } from '@/components/listings/types';
import { ApiListing } from '@/hooks/useListings';
import type { User } from '@/providers/AuthProvider';

/**
 * Maps an API listing response to the mobile Listing type used by UI components.
 * Provides sensible defaults for fields not yet returned by the API.
 */
export function mapApiListingToListing(api: ApiListing): Listing {
  const weight = Number(api.availableWeight);
  const price = Number(api.price);

  return {
    id: api.id,
    type: 'offer',
    title: `${api.departureCity} → ${api.arrivalCity}`,
    titleAr: `${api.departureCity} → ${api.arrivalCity}`,
    description: api.notes || undefined,
    descriptionAr: api.notes || undefined,
    user: {
      id: api.carrier.id,
      name: api.carrier.name,
      nameAr: api.carrier.name,
      avatarUrl: api.carrier.avatarUrl || undefined,
      rating: 0,
      completedDeals: 0,
      isVerified: api.carrier.isVerified,
      memberSince: api.createdAt,
    },
    from: {
      city: api.departureCity,
      cityAr: api.departureCity,
      country: '',
      countryAr: '',
      code: api.departureCode || '',
    },
    to: {
      city: api.arrivalCity,
      cityAr: api.arrivalCity,
      country: '',
      countryAr: '',
      code: api.arrivalCode || '',
    },
    travelDate: api.departureDate,
    availableWeight: weight,
    pricing: {
      small: price,
      medium: price,
      large: price,
      negotiable: true,
    },
    restrictions: {
      allowed: ['electronics', 'documents', 'clothes', 'gifts'],
      notAllowed: ['liquids', 'batteries'],
    },
    handoffOptions: [],
    status: api.status as 'active' | 'booked' | 'completed' | 'expired',
    views: 0,
    createdAt: api.createdAt,
    expiresAt: api.departureDate,
  };
}

/** Token response returned by every /auth/* sign-in endpoint (after envelope unwrap). */
export interface ApiAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    isVerified?: boolean;
  };
}

/**
 * Maps an API auth response ({ user.name }) to the session shape the
 * AuthProvider stores ({ user.displayName }).
 */
export function mapAuthResponseToSession(api: ApiAuthResponse): {
  accessToken: string;
  refreshToken: string;
  user: User;
} {
  return {
    accessToken: api.accessToken,
    refreshToken: api.refreshToken,
    user: {
      id: api.user.id,
      email: api.user.email,
      displayName: api.user.name ?? null,
      avatarUrl: api.user.avatarUrl ?? null,
      isNewUser: false,
      profileComplete: true,
    },
  };
}

/** Extracts a human-readable message from an axios/API error (NestJS returns string or string[]). */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: any } })?.response?.data;
  // This API wraps errors as { error: { message, details: [{ message }] } }.
  const detail = data?.error?.details?.[0]?.message;
  if (typeof detail === 'string' && detail) return detail;
  const message = data?.error?.message ?? data?.message;
  if (Array.isArray(message) && message.length > 0) return String(message[0]);
  if (typeof message === 'string' && message.length > 0) return message;
  return fallback;
}
