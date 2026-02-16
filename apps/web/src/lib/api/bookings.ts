import { api } from './client';

export interface ApiBooking {
  id: string;
  bookingRef: string;
  listingId: string;
  senderId: string;
  carrierId: string;
  status: string;
  packageSize: string | null;
  totalWeight: number;
  totalPrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  listing?: {
    id: string;
    title: string | null;
    titleAr: string | null;
    departureCity: string;
    departureCode: string | null;
    arrivalCity: string;
    arrivalCode: string | null;
    departureDate: string;
  };
  sender?: { id: string; name: string; avatarUrl: string | null; phone: string | null };
  carrier?: { id: string; name: string; avatarUrl: string | null; phone: string | null };
  items?: Array<{
    id: string;
    name: string;
    description: string | null;
    weight: number;
    value: number;
  }>;
  conversation?: { id: string } | null;
}

// Transform to frontend-friendly shape
export function transformBooking(b: ApiBooking) {
  return {
    id: b.id,
    bookingRef: b.bookingRef,
    listingId: b.listingId,
    listingTitle: b.listing?.title || `${b.listing?.departureCity} → ${b.listing?.arrivalCity}`,
    listingTitleAr: b.listing?.titleAr || b.listing?.title || '',
    senderId: b.senderId,
    senderName: b.sender?.name || '',
    senderNameAr: b.sender?.name || '',
    carrierId: b.carrierId,
    carrierName: b.carrier?.name || '',
    carrierNameAr: b.carrier?.name || '',
    from: {
      city: b.listing?.departureCity || '',
      cityAr: b.listing?.departureCity || '',
      country: '',
      countryAr: '',
      code: b.listing?.departureCode || '',
    },
    to: {
      city: b.listing?.arrivalCity || '',
      cityAr: b.listing?.arrivalCity || '',
      country: '',
      countryAr: '',
      code: b.listing?.arrivalCode || '',
    },
    travelDate: b.listing?.departureDate || '',
    packageSize: (b.packageSize || 'medium') as 'small' | 'medium' | 'large',
    price: b.totalPrice,
    currency: b.currency,
    status: b.status,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    conversationId: b.conversation?.id || null,
    items: b.items || [],
  };
}

export type BookingView = ReturnType<typeof transformBooking>;

export async function getBookings(filter?: string): Promise<BookingView[]> {
  const params = filter ? `?status=${filter}` : '';
  const { data } = await api.get<ApiBooking[]>(`/bookings${params}`);
  return data.map(transformBooking);
}

export async function getBooking(id: string): Promise<BookingView> {
  const { data } = await api.get<ApiBooking>(`/bookings/${id}`);
  return transformBooking(data);
}

export interface CreateBookingPayload {
  listingId: string;
  packageSize: 'small' | 'medium' | 'large';
  totalWeight?: number;
  items?: Array<{ name: string; description?: string; weight: number; value: number }>;
  message?: string;
}

export async function createBooking(payload: CreateBookingPayload): Promise<BookingView> {
  const { data } = await api.post<ApiBooking>('/bookings', payload);
  return transformBooking(data);
}

export async function acceptBooking(id: string): Promise<BookingView> {
  const { data } = await api.put<ApiBooking>(`/bookings/${id}/accept`);
  return transformBooking(data);
}

export async function rejectBooking(id: string): Promise<BookingView> {
  const { data } = await api.put<ApiBooking>(`/bookings/${id}/reject`);
  return transformBooking(data);
}

export async function cancelBooking(id: string): Promise<BookingView> {
  const { data } = await api.put<ApiBooking>(`/bookings/${id}/cancel`);
  return transformBooking(data);
}
