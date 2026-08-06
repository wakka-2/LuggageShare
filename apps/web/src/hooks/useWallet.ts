import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string; // signup_bonus, referral_bonus, commission, topup, refund
  description: string | null;
  bookingId: string | null;
  createdAt: string;
}

export interface TopUpRequestRow {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'rejected';
  reference: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

export interface TopUpResult {
  id: string;
  amount: number;
  status: string;
  currency: string;
  payTo: { iban: string; bankName: string; accountName: string };
  instructions: string;
}

export function useWalletBalance() {
  return useQuery<WalletBalance>({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/balance');
      return data;
    },
  });
}

export function useTransactionHistory() {
  return useQuery<Transaction[]>({
    queryKey: ['wallet', 'history'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/history');
      return data;
    },
  });
}

export function useMyTopUps() {
  return useQuery<TopUpRequestRow[]>({
    queryKey: ['wallet', 'topups'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/topups');
      return data;
    },
  });
}

export function useRequestTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: { amount: number; reference?: string }) => {
      const { data } = await apiClient.post('/wallet/topup', request);
      return data as TopUpResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'topups'] });
    },
  });
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export function useAdminPendingTopUps() {
  return useQuery<TopUpRequestRow[]>({
    queryKey: ['wallet', 'admin', 'pending-topups'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/admin/topups/pending');
      return data;
    },
  });
}

export function useConfirmTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/wallet/admin/topups/${id}/confirm`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'admin', 'pending-topups'] });
    },
  });
}

export function useRejectTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await apiClient.post(`/wallet/admin/topups/${id}/reject`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'admin', 'pending-topups'] });
    },
  });
}
