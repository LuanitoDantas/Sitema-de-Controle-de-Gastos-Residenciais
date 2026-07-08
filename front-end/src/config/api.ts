import axios from 'axios';

/**
 * Base URL for all API requests. Set VITE_API_URL at build time to point at the
 * deployed backend (e.g. the Railway service URL); defaults to local dev.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

/**
 * Pre-configured Axios instance shared by all service modules.
 * All requests will be prefixed with API_BASE_URL and expect JSON.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
