import axios from 'axios';
import toast from 'react-hot-toast';

// Central axios instance for the app
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://reelsthan.onrender.com/api',
  withCredentials: true,
  timeout: 15000, // 15 seconds timeout
});

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for timeout or network errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      toast.error('Request timed out. Server might be sleeping or busy.', {
        id: 'api-timeout' // Prevents duplicate toasts
      });
    } else if (error.message === 'Network Error') {
      toast.error('Unable to reach the server. Please check your connection.', {
        id: 'api-network-error'
      });
    } else if (error.response?.status === 500) {
      toast.error('Internal Server Error. Please try again later.', {
        id: 'api-server-error'
      });
    }

    return Promise.reject(error);
  }
);

export default api;
