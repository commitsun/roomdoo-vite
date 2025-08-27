import { dialogService } from '@/_legacy/services/DialogService';
import { useUserStore } from '@/infrastructure/stores/user';
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { App } from 'vue';
import { useDynamicDialogsStore } from '@/infrastructure/stores/dynamicDialogs';
import { t } from '@/ui/plugins/i18n';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const endPoint = import.meta.env.DEV
  ? '/api'
  : `${window.location.href.split('.')[0]}.host.roomdoo.com/api`;

const api: AxiosInstance = axios.create({
  baseURL: endPoint,
});
// Internal flag to track if the refresh token request is in progress
let isRefreshing = false;

// Queue to hold failed requests while token is being refreshed
let failedQueue: any[] = [];

// Process all requests in the queue after token refresh finishes
const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

const enqueueUntilRefresh = (originalRequest: CustomAxiosRequestConfig) =>
  new Promise((resolve, reject) => {
    failedQueue.push({
      resolve: () => resolve(api(originalRequest)),
      reject,
    });
  });

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/login' &&
      originalRequest.url !== '/refresh-token'
    ) {
      originalRequest._retry = true;

      // If refresh is in progress, queue this request
      if (isRefreshing) {
        return enqueueUntilRefresh(originalRequest);
      }

      isRefreshing = true;
      try {
        // Lazy import to avoid circular dependencies
        const { useUserStore } = await import('@/infrastructure/stores/user');
        await useUserStore().refreshToken();

        // Success: retry queued + current request
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        // --- session expired ---
        useUserStore().logout();
        processQueue(refreshError as AxiosError);
        dialogService.open({
          header: t('error.sessionExpiredTitle'),
          content: t('error.sessionExpiredContent'),
          btnAccept: t('error.accept'),
        });
        useDynamicDialogsStore().closeAndUnregisterAllDynamicDialogs();
        const { default: router } = await import('@/ui/plugins/router');
        const current = router.currentRoute.value;
        const redirect = current?.fullPath || '/';
        if (current?.name !== 'login') {
          // Use replace to avoid stacking broken history entries
          router.replace({ name: 'login', query: { redirect } });
        }
      } finally {
        isRefreshing = false;
      }
    }

    // --- Legacy error UI (kept) for non-refresh paths ---
    if (error.response) {
      const status = error.response.status;
      const data: any = (error.response as any).data;

      // Other 4xx (excluding 401 handled above)
      if (status >= 400 && status < 500 && status !== 401) {
        dialogService.open({
          header: t('error.somethingWentWrong'),
          content: data?.description || data?.message || t('error.requestError'),
          btnAccept: t('error.accept'),
        });
      }
      // 5xx
      else if (status >= 500) {
        dialogService.open({
          header: t('error.somethingWentWrong'),
          content: data?.description || t('error.internalError'),
          btnAccept: t('error.accept'),
        });
      }
    }
    return Promise.reject(error);
  }
);

export { api };

export default {
  install: (app: App) => {
    app.config.globalProperties.$axios = axios;
    app.config.globalProperties.$api = api;
  },
};
