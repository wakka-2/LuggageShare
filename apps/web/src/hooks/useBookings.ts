'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBookings,
  getBooking,
  createBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  type CreateBookingPayload,
} from '@/lib/api/bookings';

export function useBookings(filter?: string) {
  return useQuery({
    queryKey: ['bookings', filter],
    queryFn: () => getBookings(filter),
    retry: 1,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBooking(id),
    enabled: !!id,
    retry: 1,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useAcceptBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}
