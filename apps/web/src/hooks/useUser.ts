'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateMe, getUser } from '@/lib/api/users';
import { getNotifications, markAllNotificationsAsRead } from '@/lib/api/notifications';
import { useAuth } from '@/lib/contexts/AuthContext';

export function useCurrentUser() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: getMe,
    enabled: isAuthenticated,
    retry: 1,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name?: string; phone?: string; bio?: string; city?: string }) =>
      updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
    enabled: !!id,
    retry: 1,
  });
}

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: isAuthenticated,
    refetchInterval: 30000, // Poll every 30 seconds
    retry: 1,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
