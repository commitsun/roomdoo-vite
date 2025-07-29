import axios, { AxiosError, type AxiosInstance } from 'axios';
import { InternalServerError } from '@/application/shared/InternalServerError';
import { UnknownError } from '@/application/shared/UnknownError';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';

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
    switch (err.response?.status) {
      case 401: {
        throw new UnauthorizedError();
      }
      case 500: {
        throw new InternalServerError();
      }
      default: {
        throw new UnknownError();
      }
    }
  }
);

export { api };
