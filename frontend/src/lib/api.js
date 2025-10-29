import axios from 'axios';

// Central axios instance for the app
export const api = axios.create({
  baseURL: 'https://reelsthan.onrender.com',
  withCredentials: true,
});

export default api;
