import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

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
      return data.data ?? data;
    },
  });
}
