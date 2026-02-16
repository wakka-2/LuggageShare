import { api } from './client';

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  city: string | null;
  isVerified: boolean;
  balance: number;
  isBalanceRestricted: boolean;
  createdAt: string;
  settings?: {
    language: string;
    currency: string;
    notifications: boolean;
  };
}

export function transformUser(u: ApiUser) {
  return {
    id: u.id,
    nameAr: u.name,
    nameEn: u.name,
    email: u.email,
    phone: u.phone || '',
    avatarUrl: u.avatarUrl || undefined,
    bio: u.bio || undefined,
    city: u.city || undefined,
    isVerified: u.isVerified,
    rating: 0,
    totalReviews: 0,
    completedTrips: 0,
    activeListings: 0,
    languages: [],
    memberSince: u.createdAt,
    balance: u.balance,
    isBalanceRestricted: u.isBalanceRestricted,
  };
}

export type UserView = ReturnType<typeof transformUser>;

export async function getMe(): Promise<UserView> {
  const { data } = await api.get<ApiUser>('/users/me');
  return transformUser(data);
}

export async function updateMe(payload: {
  name?: string;
  phone?: string;
  bio?: string;
  city?: string;
}): Promise<UserView> {
  const { data } = await api.put<ApiUser>('/users/me', payload);
  return transformUser(data);
}

export async function getUser(id: string): Promise<UserView> {
  const { data } = await api.get<ApiUser>(`/users/${id}`);
  return transformUser(data);
}
