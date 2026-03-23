import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

export interface ApiListing {
  id: string;
  carrierId: string;
  departureCity: string;
  departureCode: string | null;
  arrivalCity: string;
  arrivalCode: string | null;
  departureDate: string;
  flightNumber: string | null;
  availableWeight: number;
  price: number;
  currency: string;
  preferences: Record<string, unknown> | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  carrier: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
}

interface SearchParams {
  from?: string;
  to?: string;
  date?: string;
  minWeight?: number;
  page?: number;
  limit?: number;
}

export interface CreateListingParams {
  departureCity: string;
  departureCode?: string;
  arrivalCity: string;
  arrivalCode?: string;
  departureDate: string;
  flightNumber?: string;
  availableWeight: number;
  price: number;
  currency?: string;
  preferences?: Record<string, unknown>;
  notes?: string;
}

export function useListing(id: string | null) {
  return useQuery<ApiListing>({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/listings/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useListings(params: SearchParams = {}) {
  return useQuery<ApiListing[]>({
    queryKey: ['listings', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.set('from', params.from);
      if (params.to) searchParams.set('to', params.to);
      if (params.date) searchParams.set('date', params.date);
      if (params.minWeight) searchParams.set('minWeight', String(params.minWeight));
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));

      const { data } = await apiClient.get(`/listings?${searchParams.toString()}`);
      // API returns paginated { data: [...], meta: {...} } — extract the array
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
  });
}

export function useMyListings() {
  const { isAuthenticated } = useAuth();
  return useQuery<(ApiListing & { _count?: { bookings: number } })[]>({
    queryKey: ['myListings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/listings/me');
      return data.data ?? data;
    },
    enabled: isAuthenticated,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateListingParams) => {
      const { data } = await apiClient.post('/listings', params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...params }: { id: string } & Partial<CreateListingParams>) => {
      const { data } = await apiClient.put(`/listings/${id}`, params);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', variables.id] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/listings/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}
