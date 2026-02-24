import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { id: string; name: string; avatarUrl: string | null };
  reviewee: { id: string; name: string; avatarUrl: string | null };
}

export interface ReviewWithBooking extends Review {
  booking: {
    id: string;
    listing: { departureCity: string; arrivalCity: string };
  };
}

export function useBookingReview(bookingId: string | null) {
  return useQuery<Review | null>({
    queryKey: ['review', 'booking', bookingId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/reviews/booking/${bookingId}`);
      return data.data ?? data;
    },
    enabled: !!bookingId,
  });
}

export function useUserReviews(userId: string | null) {
  return useQuery<ReviewWithBooking[]>({
    queryKey: ['reviews', 'user', userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/reviews/user/${userId}`);
      return data.data ?? data;
    },
    enabled: !!userId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { bookingId: string; rating: number; comment?: string }) => {
      const { data } = await apiClient.post(`/reviews/booking/${payload.bookingId}`, {
        rating: payload.rating,
        comment: payload.comment,
      });
      return data.data ?? data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review', 'booking', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
