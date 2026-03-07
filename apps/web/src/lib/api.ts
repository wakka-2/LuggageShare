import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

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

export default apiClient;
