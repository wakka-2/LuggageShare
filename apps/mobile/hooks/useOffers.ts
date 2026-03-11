import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface ApiOffer {
  id: string;
  flightId: string;
  senderId: string;
  offeredWeight: number;
  offeredPrice: number;
  currency: string;
  note: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  flight: {
    id: string;
    departureCity: string;
    arrivalCity: string;
    departureDate?: string;
    poster?: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  };
  booking?: {
    id: string;
    status: string;
  } | null;
}

export interface CreateOfferParams {
  offeredWeight: number;
  offeredPrice: number;
  currency?: string;
  note?: string;
}

export function useFlightOffers(flightId: string | null) {
  return useQuery<ApiOffer[]>({
    queryKey: ['offers', 'flight', flightId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/flights/${flightId}/offers`);
      return data.data ?? data;
    },
    enabled: !!flightId,
  });
}

export function useMyOffers(params?: { page?: number; limit?: number }) {
  return useQuery<{
    data: ApiOffer[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>({
    queryKey: ['offers', 'my', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const { data } = await apiClient.get(`/offers/my?${searchParams.toString()}`);
      return data.data ?? data;
    },
  });
}

export function useOffer(id: string | null) {
  return useQuery<ApiOffer>({
    queryKey: ['offer', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/offers/${id}`);
      return data.data ?? data;
    },
    enabled: !!id,
  });
}

export function useCreateOffer(flightId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateOfferParams) => {
      const { data } = await apiClient.post(`/flights/${flightId}/offers`, params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', 'flight', flightId] });
      queryClient.invalidateQueries({ queryKey: ['offers', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['flight', flightId] });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      const { data } = await apiClient.patch(`/offers/${offerId}/accept`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['flights'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      const { data } = await apiClient.patch(`/offers/${offerId}/reject`);
      return data;
    },
    onSuccess: (_data, offerId) => {
      queryClient.invalidateQueries({ queryKey: ['offer', offerId] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

export function useWithdrawOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      const { data } = await apiClient.patch(`/offers/${offerId}/withdraw`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', 'my'] });
    },
  });
}
