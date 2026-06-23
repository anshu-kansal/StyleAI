import axios from 'axios';
import { store } from '../app/store';
import { logout, setCredentials } from '../features/auth/authSlice';
import { API_BASE_URL } from '../constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Essential for sending/receiving HTTP-Only cookies (like refresh token)
});

// Request interceptor to attach Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic token refresh on 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request has not been retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;

      try {
        // Request a new access token using the HTTP-Only refresh cookie
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { token, user } = response.data.data;

        // Dispatch updated credentials to Redux Store
        store.dispatch(setCredentials({ user, token }));

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token invalid/expired, clear auth state
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
export { axiosInstance };
