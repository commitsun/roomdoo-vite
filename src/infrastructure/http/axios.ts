import axios, { AxiosError, type AxiosInstance } from 'axios';
import { InternalServerError } from '@/application/shared/InternalServerError';
import { UnknownError } from '@/application/shared/UnknownError';
import { BadRequestError } from '@/application/shared/BadRequestError';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { useUserStore } from '@/infrastructure/stores/user';
import { useNotificationStore } from '../stores/notification';
import type { InternalAxiosRequestConfig } from 'axios';
import { useRouter } from 'vue-router';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const endPoint = import.meta.env.DEV
  ? '/pmsApi'
  : `${window.location.href.split('.')[0]}.host.roomdoo.com/pmsApi`;

const api: AxiosInstance = axios.create({
  baseURL: endPoint,
  withCredentials: true,
});

// Internal flag to track if the refresh token request is in progress
let isRefreshing = false;

// Queue to hold failed requests while token is being refreshed
let failedQueue: any[] = [];

// Process all requests in the queue after token refresh finishes
const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error); // Reject the queued requests if refresh failed
    } else {
      prom.resolve(); // Resolve and retry the requests if refresh succeeded
    }
  });
  failedQueue = [];
};

// Axios response interceptor to handle errors
api.interceptors.response.use(
  (res) => res, // Simply return response on success
  async (err: AxiosError) => {
    const originalRequest = err.config as CustomAxiosRequestConfig;

    // Handle 401 Unauthorized errors
    if (
      err.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry && // Ensure this request hasn’t been retried yet
      originalRequest.url !== '/login' && // Don't retry login request
      originalRequest.url !== '/refresh-token' // Don’t retry refresh itself
      // TODO: Uncomment if /reset-password should also be excluded
      // originalRequest.url !== '/reset-password'
    ) {
      originalRequest._retry = true; // Mark the request as already retried

      if (isRefreshing) {
        // If a token refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              resolve(api(originalRequest)); // Retry request after refresh succeeds
            },
            reject: (error: AxiosError) => {
              reject(error); // Reject if refresh fails
            },
          });
        });
      }

      isRefreshing = true; // Set flag to indicate token refresh in progress

      try {
        await useUserStore().refreshToken(); // Attempt to refresh the session
        processQueue(null); // Success: retry all queued requests
        return api(originalRequest); // Retry the original request
      } catch (refreshError: any) {
        processQueue(refreshError as AxiosError); // Failure: reject all queued requests
        useNotificationStore().add('Session expired. Please log in again.');
        useRouter().push('/login');
      } finally {
        isRefreshing = false; // Reset flag regardless of outcome
      }
    }

    switch (err.response?.status) {
      case 400:
        throw new BadRequestError();
      case 401:
        throw new UnauthorizedError();
      case 500:
        throw new InternalServerError();
      default:
        throw new UnknownError();
    }
  }
);

export { api };
