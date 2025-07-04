import { ApiError, ForbiddenError, NotFoundError, UnauthorizedError } from '@/application/errors';
import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import { useNotificationStore } from '../stores/notification';

const endPoint = import.meta.env.DEV
  ? '/api'
  : `${window.location.href.split('.')[0]}.host.roomdoo.com/api`;

const api: AxiosInstance = axios.create({
  baseURL: endPoint,
});

const notificationStore = useNotificationStore();
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status;
    const msg = err.message || 'An error occurred';
    notificationStore.add(msg);
    if (status === 404) {
      throw new NotFoundError();
    } else if (status === 401) {
      throw new UnauthorizedError();
    } else if (status === 403) {
      throw new ForbiddenError();
    } else {
      throw new ApiError(status ?? 0);
    }
  }
);

export { api };
