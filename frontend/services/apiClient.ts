import axios from 'axios';

const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    'https://uptick-lms-backend.onrender.com/api',
  // withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if:
    // 1. Status is 401 (Unauthorized)
    // 2. User was previously authenticated (has token)
    // 3. Not on public pages (apply, auth)
    if (error.response?.status === 401) {
      const hasToken = localStorage.getItem('token');
      const isPublicPage =
        window.location.pathname.startsWith('/apply') ||
        window.location.pathname.startsWith('/auth');

      if (hasToken && !isPublicPage) {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
