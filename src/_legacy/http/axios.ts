import { dialogService } from '@/_legacy/services/DialogService';
import axios, { type AxiosInstance } from 'axios';
import type { App } from 'vue';

const endPoint = import.meta.env.DEV
  ? '/api'
  : `${window.location.href.split('.')[0]}.host.roomdoo.com/api`;

// const endPoint = 'https://staging16.odoo.aldahotels.moduon.net/api';
const api: AxiosInstance = axios.create({
  baseURL: endPoint,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.config.url !== '/login') {
      console.error('Axios interceptor error:', error.response);
      if (error.response.status === 401) {
        dialogService.open({
          header: 'Sesión expirada',
          content: 'Debes iniciar sesión de nuevo',
          btnAccept: 'Aceptar',
          onAccept: () => (window.location.href = '/login'),
        });
      } else {
        dialogService.open({
          header: 'Algo ha ido mal',
          content: error.response.data.description,
          btnAccept: 'Aceptar',
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
