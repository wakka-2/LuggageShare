import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface ApiOffer {
  id: string;
  tripId: string | null;
  requestId: string | null;
  userId: string;
  offeredWeight: number;
  offeredPrice: number;
  currency: string;
  message: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  trip?: {
    id: string;
    departureCity: string;
    arrivalCity: string;
    departureDate: string;
    transportType: string;
  } | null;
  request?: {
    id: string;
    departureCity: string;
    arrivalCity: string;
    neededByDate: string;
    weight: number;
  } | null;
  booking?: {
    id: string;
    status: string;
  } | null;
}

interface CreateOfferParams {
  offeredWeight: number;
  offeredPrice: number;
  currency?: string;
  message?: string;
}

export function useTripOffers(tripId: string | null) {
  return useQuery<ApiOffer[]>({
    queryKey: ['tripOffers', tripId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/trips/${tripId}/offers`);
      return data.data ?? data;
    },
    enabled: !!tripId,
  });
}

export function useRequestOffers(requestId: string | null) {
  return useQuery<ApiOffer[]>({
    queryKey: ['requestOffers', requestId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/requests/${requestId}/offers`);
      return data.data ?? data;
    },
    enabled: !!requestId,
  });
}

export function useMyOffers(params: { page?: number; limit?: number } = {}) {
  return useQuery<ApiOffer[]>({
    queryKey: ['myOffers', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));

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

export function useCreateTripOffer(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateOfferParams) => {
      const { data } = await apiClient.post(`/trips/${tripId}/offers`, params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripOffers', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    },
  });
}

export function useCreateRequestOffer(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateOfferParams) => {
      const { data } = await apiClient.post(`/requests/${requestId}/offers`, params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestOffers', requestId] });
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      const { data } = await apiClient.post(`/offers/${offerId}/accept`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripOffers'] });
      queryClient.invalidateQueries({ queryKey: ['requestOffers'] });
      queryClient.invalidateQueries({ queryKey: ['myOffers'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      const { data } = await apiClient.post(`/offers/${offerId}/reject`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripOffers'] });
      queryClient.invalidateQueries({ queryKey: ['requestOffers'] });
      queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    },
  });
}

export function useWithdrawOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      const { data } = await apiClient.post(`/offers/${offerId}/withdraw`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    },
  });
}
