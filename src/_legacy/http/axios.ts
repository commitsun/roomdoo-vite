import { dialogService } from '@/_legacy/services/DialogService';
import axios, { type AxiosInstance } from 'axios';
import type { App } from 'vue';

// Crear la instancia de Axios
const endPoint = import.meta.env.DEV
  ? '/api'
  : `${window.location.href.split('.')[0]}.host.roomdoo.com/api`;

// const endPoint = 'https://staging16.odoo.aldahotels.moduon.net/api';
const api: AxiosInstance = axios.create({
  baseURL: endPoint,
});

// Configurar interceptores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.config.url !== '/login') {
      console.error('Axios interceptor error:', error.response);
      if (error.response.status === 401) {
        // 'Redirecting to login...';
        window.location.href = '/login';
        // Reemplaza con un router push si usas Vue Router
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

// Exportar la instancia de Axios
export { api };

// Crear el plugin para integrarlo globalmente
export default {
  install: (app: App) => {
    app.config.globalProperties.$axios = axios;
    app.config.globalProperties.$api = api;
  },
};
