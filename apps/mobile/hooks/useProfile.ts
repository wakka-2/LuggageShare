import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  city: string | null;
  isVerified: boolean;
  provider: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalTrips: number;
    totalDeliveries: number;
    totalSent: number;
    averageRating: number;
    totalReviews: number;
  };
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  iban?: string;
  bankName?: string;
}

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/me');
      return data.data ?? data;
    },
  });
}

export function usePublicProfile(userId: string | null) {
  return useQuery<UserProfile>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/${userId}`);
      return data.data ?? data;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await apiClient.put('/users/me', payload);
      return data.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
