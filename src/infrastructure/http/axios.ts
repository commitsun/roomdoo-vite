import axios, { AxiosError, type AxiosInstance, AxiosHeaders } from 'axios';

import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { useTextMessagesStore } from '../stores/textMessages';
import { t, i18n } from '@/infrastructure/plugins/i18n';
import { InternalServerError } from '@/application/shared/InternalServerError';
import { UnknownError } from '@/application/shared/UnknownError';
import { BadRequestError } from '@/application/shared/BadRequestError';

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
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const locale = i18n.global.locale.value.replace('-', '_');
  const headers = new AxiosHeaders(config.headers);
  headers.set('Accept-Language', locale);
  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const errorDetail =
      err.response?.data && typeof err.response.data === 'object' && 'detail' in err.response.data
        ? (err.response.data as { detail?: string }).detail
        : undefined;

    switch (err.response?.status) {
      case 400:
        throw new BadRequestError(errorDetail);
      case 401:
        throw new UnauthorizedError(errorDetail);
      case 500:
        useTextMessagesStore().addTextMessage(
          t('error.somethingWentWrong'),
          t('error.internalError'),
        );
        throw new InternalServerError(errorDetail);
      default:
        throw new UnknownError(errorDetail);
    }
  },
);

export { api };
