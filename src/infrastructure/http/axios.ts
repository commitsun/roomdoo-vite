import {
  ApiError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '@/application/errors';
import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';

const endPoint = import.meta.env.DEV
  ? '/api'
  : `${window.location.href.split('.')[0]}.host.roomdoo.com/api`;

const api: AxiosInstance = axios.create({
  baseURL: endPoint,
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status;
    const msg = err.message || 'An error occurred';
    if (status === 404) {
      throw new NotFoundError();
    } else if (status === 401) {
      throw new UnauthorizedError();
    } else if (status === 403) {
      throw new ForbiddenError();
    } else if (status === 500) {
      throw new InternalServerError();
    } else {
      throw new ApiError(status ?? 0);
    }
  }
);

export { api };
