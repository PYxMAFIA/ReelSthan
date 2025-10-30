import axios from 'axios';

// Central axios instance for the app
export const api = axios.create({
  baseURL: 'https://reelsthan.onrender.com/api',
  withCredentials: true,
});

export default api;
