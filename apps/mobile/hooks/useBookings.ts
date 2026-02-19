import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface ApiBooking {
  id: string;
  listingId: string;
  senderId: string;
  carrierId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
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
    pricePerKg: number;
  };
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  carrier: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
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

interface CreateBookingParams {
  listingId: string;
  totalWeight: number;
  totalPrice: number;
  currency?: string;
}

export function useBookings() {
  return useQuery<ApiBooking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/bookings');
      return data;
    },
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
