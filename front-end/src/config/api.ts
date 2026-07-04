import axios from 'axios';

/** Base URL for all API requests. Change this to point at a different environment. */
export const API_BASE_URL = 'http://localhost:5000/api';

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
