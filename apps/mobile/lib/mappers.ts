import { Listing } from '@/components/listings/types';
import { ApiListing } from '@/hooks/useListings';

/**
 * Maps an API listing response to the mobile Listing type used by UI components.
 * Provides sensible defaults for fields not yet returned by the API.
 */
export function mapApiListingToListing(api: ApiListing): Listing {
  const weight = Number(api.availableWeight);
  const pricePerKg = Number(api.pricePerKg);

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
      small: pricePerKg * 2,
      medium: pricePerKg * 5,
      large: pricePerKg * 10,
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
