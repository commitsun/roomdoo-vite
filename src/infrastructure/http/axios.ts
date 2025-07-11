import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import { HttpError } from './HttpError';

const endPoint = import.meta.env.DEV
  ? '/api'
  : `${window.location.href.split('.')[0]}.host.roomdoo.com/api`;

const api: AxiosInstance = axios.create({
  baseURL: endPoint,
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status ?? 500;
    const url = err.config?.url ?? 'unknown';
    const method = err.config?.method ?? 'get';
    throw new HttpError(status, url, method, err);
  }
);

export { api };
