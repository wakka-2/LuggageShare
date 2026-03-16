import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export type DisputeReason =
  | 'damaged_item'
  | 'missing_item'
  | 'wrong_item'
  | 'late_delivery'
  | 'no_delivery'
  | 'other';

export interface ApiDispute {
  id: string;
  bookingId: string;
  reporterId: string;
  reason: DisputeReason;
  description: string | null;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  reporter: { id: string; name: string; avatarUrl: string | null };
  booking: {
    id: string;
    listing: { departureCity: string; arrivalCity: string };
  };
}

interface CreateDisputeParams {
  reason: DisputeReason;
  description?: string;
}

export function useBookingDispute(bookingId: string | null) {
  return useQuery<ApiDispute | null>({
    queryKey: ['dispute', 'booking', bookingId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/disputes/booking/${bookingId}`);
      return data.data ?? data ?? null;
    },
    enabled: !!bookingId,
  });
}

export function useMyDisputes() {
  const { isAuthenticated } = useAuth();
  return useQuery<ApiDispute[]>({
    queryKey: ['disputes', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/disputes/me');
      return data.data ?? data ?? [];
    },
    enabled: isAuthenticated,
  });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, ...params }: CreateDisputeParams & { bookingId: string }) => {
      const { data } = await apiClient.post(`/disputes/booking/${bookingId}`, params);
      return data.data ?? data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dispute', 'booking', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['disputes', 'me'] });
    },
  });
}
