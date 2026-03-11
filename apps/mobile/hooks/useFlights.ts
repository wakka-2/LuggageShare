import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface ApiFlight {
  id: string;
  posterId: string;
  departureCity: string;
  departureCode: string | null;
  arrivalCity: string;
  arrivalCode: string | null;
  departureDate: string;
  flightNumber: string | null;
  totalWeight: number;
  remainingWeight: number;
  pricePerKg: number;
  currency: string;
  notes: string | null;
  status: 'active' | 'full' | 'cancelled' | 'departed';
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
  };
}

export interface FlightSearchParams {
  from?: string;
  to?: string;
  date?: string;
  minWeight?: number;
  page?: number;
  limit?: number;
}

export interface CreateFlightParams {
  departureCity: string;
  departureCode?: string;
  arrivalCity: string;
  arrivalCode?: string;
  departureDate: string;
  flightNumber?: string;
  totalWeight: number;
  pricePerKg: number;
  currency?: string;
  notes?: string;
}

export function useFlights(params: FlightSearchParams = {}) {
  return useQuery<ApiFlight[]>({
    queryKey: ['flights', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.set('from', params.from);
      if (params.to) searchParams.set('to', params.to);
      if (params.date) searchParams.set('date', params.date);
      if (params.minWeight) searchParams.set('minWeight', String(params.minWeight));
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));

      const { data } = await apiClient.get(`/flights?${searchParams.toString()}`);
      return data.data ?? data;
    },
  });
}

export function useMyFlights() {
  return useQuery<ApiFlight[]>({
    queryKey: ['flights', 'my'],
    queryFn: async () => {
      const { data } = await apiClient.get('/flights/my');
      return data.data ?? data;
    },
  });
}

export function useFlight(id: string | null) {
  return useQuery<ApiFlight>({
    queryKey: ['flight', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/flights/${id}`);
      return data.data ?? data;
    },
    enabled: !!id,
  });
}

export function useCreateFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateFlightParams) => {
      const { data } = await apiClient.post('/flights', params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
    },
  });
}

export function useUpdateFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...params }: { id: string } & Partial<CreateFlightParams>) => {
      const { data } = await apiClient.patch(`/flights/${id}`, params);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
      queryClient.invalidateQueries({ queryKey: ['flight', variables.id] });
    },
  });
}

export function useCancelFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/flights/${id}/cancel`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
    },
  });
}
