import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_URL}/v1`,
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

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokensJson = await SecureStore.getItemAsync('auth_tokens');
        if (tokensJson) {
          const tokens = JSON.parse(tokensJson);

          // Try to refresh the token
          const response = await axios.post(`${API_URL}/v1/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });

          const newTokens = {
            ...tokens,
            accessToken: response.data.data.accessToken,
          };

          await SecureStore.setItemAsync('auth_tokens', JSON.stringify(newTokens));

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        await SecureStore.deleteItemAsync('auth_tokens');
        // Navigation will be handled by AuthProvider
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
