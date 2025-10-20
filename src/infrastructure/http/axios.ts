import axios, {
  AxiosError,
  type AxiosInstance,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';

import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { useUserStore } from '@/infrastructure/stores/user';
import { useTextMessagesStore } from '../stores/textMessages';
import { useDynamicDialogsStore } from '../stores/dynamicDialogs';
import { t, i18n } from '@/infrastructure/plugins/i18n';
import router from '@/infrastructure/plugins/router';
import { InternalServerError } from '@/application/shared/InternalServerError';
import { UnknownError } from '@/application/shared/UnknownError';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let endPoint;
if (import.meta.env.DEV) {
  endPoint = '/pmsApi';
} else if (import.meta.env.MODE === 'staging') {
  endPoint = import.meta.env.ROOMDOO_API_URL + '/pmsApi';
} else {
  endPoint = `${window.location.href.split('.')[0]}.host.roomdoo.com/pmsApi`;
}

const api: AxiosInstance = axios.create({
  baseURL: endPoint,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const locale = i18n.global.locale.value.replace('-', '_');
  const headers = new AxiosHeaders(config.headers);
  headers.set('Accept-Language', locale);
  config.headers = headers;
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res, // Simply return response on success
  async (err: AxiosError) => {
    const originalRequest = err.config as CustomAxiosRequestConfig;
    if (
      err.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/login' &&
      originalRequest.url !== '/refresh-token' &&
      originalRequest.url !== '/user/change-password'
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
          t('error.sessionExpiredContent'),
        );
        useDynamicDialogsStore().closeAndUnregisterAllDynamicDialogs();
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
        useTextMessagesStore().addTextMessage(
          t('error.somethingWentWrong'),
          t('error.internalError'),
        );
        throw new InternalServerError();
      default:
        useTextMessagesStore().addTextMessage(
          t('error.somethingWentWrong'),
          t('error.unknownError'),
        );
        throw new UnknownError();
    }
  },
);

export { api };
