import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from './env.js';

// Central axios instance for the app
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 15000, // 15 seconds timeout
});

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast if the component is handling the error
    const skipGlobalToast = error.config?.skipGlobalError;

    if (!skipGlobalToast) {
      // Check for timeout or network errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error('Request timed out. Server might be sleeping or busy.', {
          id: 'api-timeout', // Prevents duplicate toasts
          duration: 4000,
        });
      } else if (error.message === 'Network Error') {
        toast.error('Unable to reach the server. Please check your connection.', {
          id: 'api-network-error',
          duration: 4000,
        });
      } else if (error.response?.status === 500) {
        toast.error('Internal Server Error. Please try again later.', {
          id: 'api-server-error',
          duration: 4000,
        });
      } else if (error.response?.status === 503) {
        toast.error('Service temporarily unavailable. Please try again shortly.', {
          id: 'api-service-unavailable',
          duration: 4000,
        });
      } else if (error.response?.status === 401) {
        // Only show toast for non-auth routes
        const isAuthRoute = error.config?.url?.includes('/auth/');
        if (!isAuthRoute) {
          toast.error('Session expired. Please login again.', {
            id: 'api-unauthorized',
            duration: 3000,
          });
        }
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please slow down and try again.', {
          id: 'api-rate-limit',
          duration: 4000,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
