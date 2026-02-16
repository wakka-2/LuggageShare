import { api } from './client';
import type { Listing } from '../types/listing';

// API response shape (from NestJS)
interface ApiListing {
  id: string;
  carrierId: string;
  type: string;
  title: string | null;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  departureCity: string;
  departureCode: string | null;
  arrivalCity: string;
  arrivalCode: string | null;
  departureDate: string;
  flightNumber: string | null;
  availableWeight: number;
  neededWeight: number | null;
  currency: string;
  restrictions: Record<string, unknown> | null;
  handoffOptions: Record<string, unknown> | null;
  notes: string | null;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  pricing: { small: number; medium: number; large: number; negotiable: boolean };
  carrier?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
    rating?: number;
  };
}

// Transform API response to frontend Listing type
function transformListing(item: ApiListing): Listing {
  return {
    id: item.id,
    type: item.type as 'offer' | 'request',
    title: item.title || `${item.departureCity} → ${item.arrivalCity}`,
    titleAr: item.titleAr || item.title || `${item.departureCity} → ${item.arrivalCity}`,
    description: item.description || undefined,
    descriptionAr: item.descriptionAr || undefined,
    user: {
      id: item.carrier?.id || item.carrierId,
      name: item.carrier?.name || 'User',
      nameAr: item.carrier?.name || 'مستخدم',
      rating: item.carrier?.rating || 0,
      completedDeals: 0,
      isVerified: item.carrier?.isVerified || false,
      memberSince: '',
    },
    from: {
      city: item.departureCity,
      cityAr: item.departureCity,
      country: '',
      countryAr: '',
      code: item.departureCode || '',
    },
    to: {
      city: item.arrivalCity,
      cityAr: item.arrivalCity,
      country: '',
      countryAr: '',
      code: item.arrivalCode || '',
    },
    travelDate: item.departureDate,
    availableWeight: item.type === 'offer' ? item.availableWeight : undefined,
    neededWeight: item.type === 'request' ? (item.neededWeight ?? undefined) : undefined,
    pricing: {
      small: item.pricing.small,
      medium: item.pricing.medium,
      large: item.pricing.large,
      negotiable: item.pricing.negotiable,
    },
    restrictions: (item.restrictions as unknown as Listing['restrictions']) || { allowed: [], notAllowed: [] },
    handoffOptions: Array.isArray(item.handoffOptions)
      ? item.handoffOptions as Listing['handoffOptions']
      : [],
    status: item.status as Listing['status'],
    views: 0,
    createdAt: item.createdAt,
    expiresAt: item.expiresAt || item.departureDate,
  };
}

export interface ListingFilters {
  type?: 'offer' | 'request';
  from?: string;
  to?: string;
  date?: string;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export async function getListings(filters?: ListingFilters): Promise<Listing[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.set('type', filters.type);
  if (filters?.from) params.set('departureCity', filters.from);
  if (filters?.to) params.set('arrivalCity', filters.to);
  if (filters?.date) params.set('date', filters.date);
  if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice));

  const { data } = await api.get<ApiListing[]>(`/listings?${params.toString()}`);
  return data.map(transformListing);
}

export async function getListing(id: string): Promise<Listing> {
  const { data } = await api.get<ApiListing>(`/listings/${id}`);
  return transformListing(data);
}

export interface CreateListingPayload {
  type: string;
  departureCity: string;
  departureCode?: string;
  arrivalCity: string;
  arrivalCode?: string;
  departureDate: string;
  flightNumber?: string;
  availableWeight: number;
  priceSmall: number;
  priceMedium: number;
  priceLarge: number;
  negotiable?: boolean;
  title?: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  restrictions?: Record<string, unknown>;
  handoffOptions?: Record<string, unknown>;
  notes?: string;
}

export async function createListing(payload: CreateListingPayload): Promise<Listing> {
  const { data } = await api.post<ApiListing>('/listings', payload);
  return transformListing(data);
}

export async function updateListing(id: string, payload: Partial<CreateListingPayload>): Promise<Listing> {
  const { data } = await api.put<ApiListing>(`/listings/${id}`, payload);
  return transformListing(data);
}

export async function deleteListing(id: string): Promise<void> {
  await api.delete(`/listings/${id}`);
}
