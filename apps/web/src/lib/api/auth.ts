import { api } from './client';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/google', { idToken });
  return data;
}

export async function loginWithApple(identityToken: string, fullName?: { givenName?: string; familyName?: string }): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/apple', { identityToken, fullName });
  return data;
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken: token });
  return data;
}
