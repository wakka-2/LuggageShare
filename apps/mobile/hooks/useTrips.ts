import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface ApiTrip {
  id: string;
  posterId: string;
  departureCity: string;
  departureCode: string | null;
  arrivalCity: string;
  arrivalCode: string | null;
  departureDate: string;
  transportType: string;
  flightNumber: string | null;
  availableWeight: number;
  remainingWeight: number;
  suggestedPrice: number | null;
  currency: string;
  preferences: Record<string, unknown> | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  poster: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
    bio?: string;
    city?: string;
  };
  _count?: {
    offers: number;
    bookings: number;
  };
}

interface SearchParams {
  from?: string;
  to?: string;
  date?: string;
  minWeight?: number;
  transportType?: string;
}

interface CreateTripParams {
  departureCity: string;
  departureCode?: string;
  arrivalCity: string;
  arrivalCode?: string;
  departureDate: string;
  transportType?: string;
  flightNumber?: string;
  availableWeight: number;
  suggestedPrice?: number;
  currency?: string;
  preferences?: Record<string, unknown>;
  notes?: string;
}

export function useTrips(params: SearchParams = {}) {
  return useQuery<ApiTrip[]>({
    queryKey: ['trips', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.set('from', params.from);
      if (params.to) searchParams.set('to', params.to);
      if (params.date) searchParams.set('date', params.date);
      if (params.minWeight) searchParams.set('minWeight', String(params.minWeight));
      if (params.transportType) searchParams.set('transportType', params.transportType);

      const { data } = await apiClient.get(`/trips?${searchParams.toString()}`);
      return data.data ?? data;
    },
  });
}

export function useTrip(id: string | null) {
  return useQuery<ApiTrip>({
    queryKey: ['trip', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/trips/${id}`);
      return data.data ?? data;
    },
    enabled: !!id,
  });
}

export function useMyTrips(params: { page?: number; limit?: number } = {}) {
  return useQuery<ApiTrip[]>({
    queryKey: ['myTrips', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));

      const { data } = await apiClient.get(`/trips/my?${searchParams.toString()}`);
      return data.data ?? data;
    },
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateTripParams) => {
      const { data } = await apiClient.post('/trips', params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['myTrips'] });
    },
  });
}

export function useCancelTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/trips/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['myTrips'] });
    },
  });
}
