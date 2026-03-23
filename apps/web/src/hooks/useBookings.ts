import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

export interface ApiBooking {
  id: string;
  listingId: string;
  senderId: string;
  carrierId: string;
  status:
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';
  totalWeight: number;
  totalPrice: number;
  currency: string;
  cancelledBy: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    departureCity: string;
    departureCode: string | null;
    arrivalCity: string;
    arrivalCode: string | null;
    departureDate: string;
    price: number;
  };
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  paymentProofUrl: string | null;
  paymentStatus: string;
  carrier: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
    iban?: string | null;
    bankName?: string | null;
  };
  items: Array<{
    id: string;
    name: string;
    description: string | null;
    weight: number;
    value: number;
    imageUrls: string[];
  }>;
}

export interface BookingItemParam {
  name: string;
  description?: string;
  weight: number;
  value: number;
  imageUrls?: string[];
}

interface CreateBookingParams {
  listingId: string;
  totalWeight: number;
  items?: BookingItemParam[];
}

/**
 * Generate mock bookings for demo/offline mode.
 * Uses the logged-in user's ID so carrier/sender action buttons render properly.
 */
export function getMockBookings(userId: string): ApiBooking[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'mock-b1',
      listingId: '1',
      senderId: 'u4',
      carrierId: userId,
      status: 'pending',
      totalWeight: 3,
      totalPrice: 240,
      currency: 'SAR',
      cancelledBy: null,
      cancelledAt: null,
      paymentProofUrl: null,
      paymentStatus: 'unpaid',
      createdAt: now,
      updatedAt: now,
      listing: {
        id: '1',
        departureCity: 'Riyadh',
        departureCode: 'RUH',
        arrivalCity: 'Dubai',
        arrivalCode: 'DXB',
        departureDate: '2024-02-15T14:30:00Z',
        price: 80,
      },
      sender: { id: 'u4', name: 'Sara Al-Otaibi', avatarUrl: null, isVerified: true },
      carrier: { id: userId, name: 'You', avatarUrl: null, isVerified: true },
      items: [
        {
          id: 'mock-i1',
          name: 'iPhone 15 Pro',
          description: 'Brand new, sealed box',
          weight: 0.5,
          value: 4500,
          imageUrls: ['https://picsum.photos/seed/iphone/200/200'],
        },
        {
          id: 'mock-i2',
          name: 'Documents folder',
          description: 'University admission papers',
          weight: 0.3,
          value: 0,
          imageUrls: [],
        },
      ],
    },
    {
      id: 'mock-b2',
      listingId: '3',
      senderId: 'u5',
      carrierId: userId,
      status: 'accepted',
      totalWeight: 5,
      totalPrice: 250,
      currency: 'SAR',
      cancelledBy: null,
      cancelledAt: null,
      paymentProofUrl: null,
      paymentStatus: 'unpaid',
      createdAt: now,
      updatedAt: now,
      listing: {
        id: '3',
        departureCity: 'Riyadh',
        departureCode: 'RUH',
        arrivalCity: 'Amman',
        arrivalCode: 'AMM',
        departureDate: '2024-02-20T19:00:00Z',
        price: 50,
      },
      sender: { id: 'u5', name: 'Mohammed Al-Dosari', avatarUrl: null, isVerified: false },
      carrier: { id: userId, name: 'You', avatarUrl: null, isVerified: true },
      items: [
        {
          id: 'mock-i3',
          name: 'Arabic books',
          description: '3 textbooks for university',
          weight: 3,
          value: 150,
          imageUrls: ['https://picsum.photos/seed/books/200/200'],
        },
        {
          id: 'mock-i4',
          name: 'Perfume gift set',
          description: 'Oud collection, well-packaged',
          weight: 1.5,
          value: 400,
          imageUrls: [
            'https://picsum.photos/seed/perfume/200/200',
            'https://picsum.photos/seed/perfbox/200/200',
          ],
        },
      ],
    },
    {
      id: 'mock-b3',
      listingId: '2',
      senderId: userId,
      carrierId: 'u2',
      status: 'in_transit',
      totalWeight: 2,
      totalPrice: 120,
      currency: 'SAR',
      cancelledBy: null,
      cancelledAt: null,
      paymentProofUrl: null,
      paymentStatus: 'confirmed',
      createdAt: now,
      updatedAt: now,
      listing: {
        id: '2',
        departureCity: 'Jeddah',
        departureCode: 'JED',
        arrivalCity: 'Cairo',
        arrivalCode: 'CAI',
        departureDate: '2024-02-18T09:00:00Z',
        price: 60,
      },
      sender: { id: userId, name: 'You', avatarUrl: null, isVerified: true },
      carrier: { id: 'u2', name: 'Fatima Mohammed', avatarUrl: null, isVerified: true },
      items: [
        {
          id: 'mock-i5',
          name: 'Spice collection',
          description: 'Assorted Saudi spices',
          weight: 1,
          value: 80,
          imageUrls: ['https://picsum.photos/seed/spices/200/200'],
        },
        {
          id: 'mock-i6',
          name: 'Dates box',
          description: 'Premium Ajwa dates',
          weight: 1,
          value: 120,
          imageUrls: ['https://picsum.photos/seed/dates/200/200'],
        },
      ],
    },
    {
      id: 'mock-b4',
      listingId: '6',
      senderId: userId,
      carrierId: 'u6',
      status: 'delivered',
      totalWeight: 1,
      totalPrice: 30,
      currency: 'SAR',
      cancelledBy: null,
      cancelledAt: null,
      paymentProofUrl: null,
      paymentStatus: 'confirmed',
      createdAt: now,
      updatedAt: now,
      listing: {
        id: '6',
        departureCity: 'Dammam',
        departureCode: 'DMM',
        arrivalCity: 'Manama',
        arrivalCode: 'BAH',
        departureDate: '2024-02-14T10:00:00Z',
        price: 30,
      },
      sender: { id: userId, name: 'You', avatarUrl: null, isVerified: true },
      carrier: { id: 'u6', name: 'Omar Hassan', avatarUrl: null, isVerified: true },
      items: [
        {
          id: 'mock-i7',
          name: 'Chocolate box',
          description: 'Swiss chocolates gift',
          weight: 1,
          value: 200,
          imageUrls: ['https://picsum.photos/seed/chocolate/200/200'],
        },
      ],
    },
  ];
}

export function useBookings() {
  const { isAuthenticated } = useAuth();
  return useQuery<ApiBooking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/bookings');
      return data.data ?? data;
    },
    enabled: isAuthenticated,
  });
}

export function useListingBookings(listingId: string | null, limit?: number) {
  return useQuery<ApiBooking[]>({
    queryKey: ['listingBookings', listingId, limit],
    queryFn: async () => {
      const params = limit ? `?limit=${limit}` : '';
      const { data } = await apiClient.get(`/bookings/by-listing/${listingId}${params}`);
      return Array.isArray(data) ? data : (data?.data ?? data);
    },
    enabled: !!listingId,
  });
}

export function useBooking(id: string | null) {
  return useQuery<ApiBooking>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/bookings/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateBookingParams) => {
      const { data } = await apiClient.post('/bookings', params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useAcceptBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.put(`/bookings/${id}/accept`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.put(`/bookings/${id}/reject`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useMarkPickedUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.put(`/bookings/${id}/pickup`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useMarkInTransit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.put(`/bookings/${id}/in-transit`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useMarkDelivered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.put(`/bookings/${id}/deliver`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.put(`/bookings/${id}/cancel`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.put(`/bookings/${id}/confirm-payment`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useSubmitPaymentProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      proofImageUrl,
    }: {
      bookingId: string;
      proofImageUrl: string;
    }) => {
      const { data } = await apiClient.post(`/bookings/${bookingId}/payment-proof`, {
        proofImageUrl,
      });
      return data;
    },
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
  });
}
