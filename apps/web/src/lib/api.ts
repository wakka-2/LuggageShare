import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'auth_tokens';

const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const tokensJson = localStorage.getItem(TOKEN_KEY);
        if (tokensJson) {
          const tokens = JSON.parse(tokensJson);
          if (tokens.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          }
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unwrap NestJS TransformInterceptor { data: T } envelope
apiClient.interceptors.response.use(
  (response) => {
    if (response.data?.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// Mutex for token refresh
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const tokensJson = localStorage.getItem(TOKEN_KEY);
  if (!tokensJson) return null;

  const tokens = JSON.parse(tokensJson);
  const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
    refreshToken: tokens.refreshToken,
  });

  const newAccessToken = response.data.data?.accessToken ?? response.data.accessToken;
  if (!newAccessToken) return null;

  const newTokens = { ...tokens, accessToken: newAccessToken };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(newTokens));
  return newAccessToken;
}

// 401 response interceptor — auto-refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
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
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { API_URL };
