import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const tokensJson = await SecureStore.getItemAsync('auth_tokens');
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        if (tokens.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mutex for token refresh — prevents concurrent refresh requests
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const tokensJson = await SecureStore.getItemAsync('auth_tokens');
  if (!tokensJson) return null;

  const tokens = JSON.parse(tokensJson);
  const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
    refreshToken: tokens.refreshToken,
  });

  const newAccessToken = response.data.data?.accessToken ?? response.data.accessToken;
  if (!newAccessToken) return null;

  const newTokens = { ...tokens, accessToken: newAccessToken };
  await SecureStore.setItemAsync('auth_tokens', JSON.stringify(newTokens));
  return newAccessToken;
}

// Response interceptor: unwrap NestJS TransformInterceptor {data: T} envelope
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh with mutex
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use mutex: if a refresh is already in-flight, piggyback on it
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed — clear tokens, AuthProvider will handle redirect
        await SecureStore.deleteItemAsync('auth_tokens');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
