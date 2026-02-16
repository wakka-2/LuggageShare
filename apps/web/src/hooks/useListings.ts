'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getListings, getListing, createListing, updateListing, deleteListing, type ListingFilters, type CreateListingPayload } from '@/lib/api/listings';
import { MOCK_LISTINGS } from '@/lib/data/mockListings';

export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => getListings(filters),
    placeholderData: MOCK_LISTINGS as ReturnType<typeof getListings> extends Promise<infer T> ? T : never,
    retry: 1,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id),
    placeholderData: () => {
      const mock = MOCK_LISTINGS.find((l) => l.id === id);
      return mock as Awaited<ReturnType<typeof getListing>> | undefined;
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateListingPayload) => createListing(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateListingPayload> }) =>
      updateListing(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
