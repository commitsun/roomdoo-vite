import axios, {
  AxiosError,
  type AxiosInstance,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';
import { InternalServerError } from '@/application/shared/InternalServerError';
import { UnknownError } from '@/application/shared/UnknownError';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { useUserStore } from '@/infrastructure/stores/user';
import { useTextMessagesStore } from '../stores/textMessages';
import { useDynamicDialogsStore } from '../stores/dynamicDialogs';
import { t, i18n } from '@/infrastructure/plugins/i18n';

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

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  let locale = i18n.global.locale.value;
  locale = locale.replace('-', '_');

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Accept-Language', locale);
  } else if (config.headers) {
    (config.headers as any)['Accept-Language'] = locale;
    config.headers = new AxiosHeaders(config.headers);
  } else {
    config.headers = new AxiosHeaders({ 'Accept-Language': locale });
  }

  return config;
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

    if (
      err.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/login' &&
      originalRequest.url !== '/refresh-token'
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              resolve(api(originalRequest));
            },
            reject: (error: AxiosError) => {
              reject(error);
            },
          });
        });
      }
      isRefreshing = true;
      try {
        await useUserStore().refreshToken();
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError: any) {
        useUserStore().logout();
        processQueue(refreshError as AxiosError);
        useTextMessagesStore().addTextMessage(
          t('error.sessionExpiredTitle'),
          t('error.sessionExpiredContent')
        );
        useDynamicDialogsStore().closeAndUnregisterAllDynamicDialogs();

        const { default: router } = await import('@/infrastructure/plugins/router');
        const current = router.currentRoute.value;
        const redirect = current?.fullPath || '/';
        if (current?.name !== 'login') {
          router.replace({ name: 'login', query: { redirect } });
        }

        throw new UnauthorizedError();
      } finally {
        isRefreshing = false;
      }
    }

    switch (err.response?.status) {
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
