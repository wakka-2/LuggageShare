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
  type: string; // commission, top_up, refund
  description: string | null;
  bookingId: string | null;
  createdAt: string;
}

export function useWalletBalance() {
  return useQuery<WalletBalance>({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/balance');
      return data.data ?? data;
    },
  });
}

export function useTransactionHistory() {
  return useQuery<Transaction[]>({
    queryKey: ['wallet', 'history'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/history');
      return data.data ?? data;
    },
  });
}

export interface WithdrawalRequest {
  amount: number;
  iban: string;
  bankAccountName: string;
}

export function useWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: WithdrawalRequest) => {
      const { data } = await apiClient.post('/wallet/withdraw', request);
      return data.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}
