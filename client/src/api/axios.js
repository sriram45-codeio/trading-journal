import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || '/api';

// Auto-detect production Vercel environments and connect to the live Render backend URL
if (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')) {
  baseURL = 'https://trading-journal-xys2.onrender.com/api';
}

// Robust URL check: if configured with host but lacks '/api' suffix, append it.
if (baseURL && baseURL.startsWith('http')) {
  const trimmed = baseURL.replace(/\/+$/, '');
  if (!trimmed.endsWith('/api')) {
    baseURL = trimmed + '/api';
  }
}

const api = axios.create({
  baseURL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tj_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tj_token');
      localStorage.removeItem('tj_email');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
