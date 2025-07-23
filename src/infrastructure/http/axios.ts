import axios, { AxiosError, type AxiosInstance } from 'axios';
import { HttpError } from './HttpError';
import { useUserStore } from '@/infrastructure/stores/user';

const endPoint = import.meta.env.DEV
  ? '/pmsApi'
  : `${window.location.href.split('.')[0]}.host.roomdoo.com/pmsApi`;

const api: AxiosInstance = axios.create({
  baseURL: endPoint,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status ?? 500;
    const originalRequest = err.config;
    console.error(originalRequest);
    const userStore = useUserStore();
    if (
      status === 401 &&
      originalRequest &&
      !(originalRequest as any)._retry &&
      !originalRequest.url?.includes('refresh-token') &&
      !originalRequest.url?.includes('login')
    ) {
      (originalRequest as any)._retry = true;

      try {
        await userStore.refreshToken();
        return api(originalRequest);
      } catch (refreshErr) {
        userStore.logout();
        userStore.setSessionExpired(true);
      }
    }

    throw new HttpError(status);
  }
);

export { api };
