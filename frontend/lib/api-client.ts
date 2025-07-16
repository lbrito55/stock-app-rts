import axios from 'axios';
import Cookies from 'js-cookie';
import { StockQuoteResponse } from '@/types/stock';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7777';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const authApi = {
  signup: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/signup', { email, password });
    return response.data;
  },

  login: async (
    email: string,
    password: string,
    onSuccess: (token: string) => void
  ) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token } = response.data;

      // Remove the cookie setting from here - let the auth context handle it
      onSuccess(access_token);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  validateToken: async () => {
    const response = await apiClient.get('/auth/validate');
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
  },

  setupAuthInterceptor: (onUnauthorized: () => void) => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token is invalid/expired
          onUnauthorized();
        }
        return Promise.reject(error);
      }
    );

    // Return cleanup function
    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  },
};

export const stockApi = {
  getQuote: async (symbol: string): Promise<StockQuoteResponse> => {
    const response = await apiClient.get<StockQuoteResponse>(
      `/stocks/quote/${symbol}`
    );
    return response.data;
  },
};

export default apiClient;