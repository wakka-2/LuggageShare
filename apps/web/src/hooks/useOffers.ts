import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

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
    city?: string | null;
  };
  flight: {
    id: string;
    departureCity: string;
    departureCode: string | null;
    arrivalCity: string;
    arrivalCode: string | null;
    departureDate: string;
    currency: string;
    status: string;
    poster: {
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

interface CreateOfferParams {
  offeredWeight: number;
  offeredPrice: number;
  currency?: string;
  note?: string;
}

interface MyOffersResponse {
  data: ApiOffer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useOffer(id: string | null) {
  return useQuery<ApiOffer>({
    queryKey: ['offer', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/offers/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useFlightOffers(flightId: string | null) {
  return useQuery<ApiOffer[]>({
    queryKey: ['flightOffers', flightId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/flights/${flightId}/offers`);
      return data.data ?? data;
    },
    enabled: !!flightId,
  });
}

export function useMyOffers(params?: { page?: number; limit?: number }) {
  const { isAuthenticated } = useAuth();
  return useQuery<MyOffersResponse>({
    queryKey: ['myOffers', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const { data } = await apiClient.get(`/offers/my?${searchParams.toString()}`);
      return data;
    },
    enabled: isAuthenticated,
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
      queryClient.invalidateQueries({ queryKey: ['flightOffers', flightId] });
      queryClient.invalidateQueries({ queryKey: ['myOffers'] });
      queryClient.invalidateQueries({ queryKey: ['flight', flightId] });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.put(`/offers/${id}/accept`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['offer', id] });
      queryClient.invalidateQueries({ queryKey: ['flightOffers'] });
      queryClient.invalidateQueries({ queryKey: ['myFlights'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.put(`/offers/${id}/reject`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['offer', id] });
      queryClient.invalidateQueries({ queryKey: ['flightOffers'] });
    },
  });
}

export function useWithdrawOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.put(`/offers/${id}/withdraw`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['offer', id] });
      queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    },
  });
}
