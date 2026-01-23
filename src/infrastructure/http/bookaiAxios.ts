import axios, { type AxiosInstance, AxiosHeaders } from 'axios';

import { i18n } from '@/infrastructure/plugins/i18n';

// BookAI API endpoint configuration
// In development, use relative path to go through Vite proxy (avoids CORS)
// In production/staging, use full URL from environment
let bookaiEndpoint: string;

if (import.meta.env.DEV) {
  // Development: use Vite proxy
  bookaiEndpoint = '/api';
  console.log('[BookAI:config] Using Vite proxy for API requests');
} else {
  // Production/Staging: use full URL
  bookaiEndpoint = import.meta.env.ROOMDOO_BOOKAI_API_URL || '';
  if (!bookaiEndpoint) {
    console.warn('[BookAI:config] ROOMDOO_BOOKAI_API_URL is not configured');
  }
}

const bookaiApi: AxiosInstance = axios.create({
  baseURL: bookaiEndpoint,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor for Accept-Language header
bookaiApi.interceptors.request.use((config) => {
  const locale = i18n.global.locale.value.replace('-', '_');
  const headers = new AxiosHeaders(config.headers);
  headers.set('Accept-Language', locale);
  config.headers = headers;
  return config;
});

// Request interceptor for Bearer Token authentication
bookaiApi.interceptors.request.use((config) => {
  const token = import.meta.env.ROOMDOO_BOOKAI_API_TOKEN;

  if (token) {
    const headers = new AxiosHeaders(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  } else {
    console.warn('[BookAI:auth] ROOMDOO_BOOKAI_API_TOKEN is not configured');
  }

  return config;
});

export { bookaiApi };
