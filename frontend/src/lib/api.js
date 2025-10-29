import axios from 'axios';

// Central axios instance for the app
export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

export default api;
