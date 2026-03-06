import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface ApiRequest {
  id: string;
  posterId: string;
  departureCity: string;
  departureCode: string | null;
  arrivalCity: string;
  arrivalCode: string | null;
  neededByDate: string;
  weight: number;
  budget: number | null;
  currency: string;
  description: string | null;
  itemTypes: string[] | null;
  status: string;
  prohibitedItemsDeclared: boolean;
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
  maxWeight?: number;
}

interface CreateRequestParams {
  departureCity: string;
  departureCode?: string;
  arrivalCity: string;
  arrivalCode?: string;
  neededByDate: string;
  weight: number;
  budget?: number;
  currency?: string;
  description?: string;
  itemTypes?: string[];
  prohibitedItemsDeclared: boolean;
}

export function useRequests(params: SearchParams = {}) {
  return useQuery<ApiRequest[]>({
    queryKey: ['requests', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.set('from', params.from);
      if (params.to) searchParams.set('to', params.to);
      if (params.date) searchParams.set('date', params.date);
      if (params.maxWeight) searchParams.set('maxWeight', String(params.maxWeight));

      const { data } = await apiClient.get(`/requests?${searchParams.toString()}`);
      return data.data ?? data;
    },
  });
}

export function useRequest(id: string | null) {
  return useQuery<ApiRequest>({
    queryKey: ['request', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/requests/${id}`);
      return data.data ?? data;
    },
    enabled: !!id,
  });
}

export function useMyRequests(params: { page?: number; limit?: number } = {}) {
  return useQuery<ApiRequest[]>({
    queryKey: ['myRequests', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));

      const { data } = await apiClient.get(`/requests/my?${searchParams.toString()}`);
      return data.data ?? data;
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateRequestParams) => {
      const { data } = await apiClient.post('/requests', params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
    },
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/requests/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
    },
  });
}
