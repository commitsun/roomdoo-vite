import { dialogService } from '@/_legacy/services/DialogService';
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { App } from 'vue';
import { t } from '@/infrastructure/plugins/i18n';


let endPoint;
if (import.meta.env.DEV) {
  endPoint = '/api';
} else if (import.meta.env.MODE === 'staging') {
  endPoint = import.meta.env.ROOMDOO_API_URL + '/api';
} else {
  endPoint = `${window.location.href.split('.')[0]}.host.roomdoo.com/api`;
}

const api: AxiosInstance = axios.create({
  baseURL: endPoint,
  withCredentials: false,
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
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
