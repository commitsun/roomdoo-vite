import { dialogService } from '@/_legacy/services/DialogService';
import axios, { AxiosError, type AxiosInstance } from 'axios';
import { useUserStore } from '@/infrastructure/stores/user';
import { HttpError } from '@/infrastructure/http/HttpError';

// Crear la instancia de Axios
const endPoint = import.meta.env.DEV
  ? '/api'
  : `${window.location.href.split('.')[0]}.host.roomdoo.com/api`;

const endPointV2 = import.meta.env.DEV
  ? '/pmsApi'
  : `${window.location.href.split('.')[0]}.host.roomdoo.com/pmsApi`;

  const apiV2: AxiosInstance = axios.create({
    baseURL: endPointV2,
    withCredentials: true,
  });


// const endPoint = 'https://staging16.odoo.aldahotels.moduon.net/api';
const api: AxiosInstance = axios.create({
  baseURL: endPoint,
});

// Configurar interceptores
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status ?? 500;
    const originalRequest = err.config;

    if (
      status === 401 &&
      originalRequest &&
      !(originalRequest as any)._retry &&
      !originalRequest.url?.includes('refresh-token') &&
      !originalRequest.url?.includes('login')
    ) {
      (originalRequest as any)._retry = true;

      try {
        await apiV2.get('/refresh-token');
        return api(originalRequest);
      } catch (refreshErr) {
        const userStore = useUserStore();
        userStore.logout();
        userStore.setSessionExpired(true);
        throw new HttpError(401);
      }
    } else {
        dialogService.open({
          header: 'Algo ha ido mal',
          content: typeof err.response?.data === 'object' && err.response?.data !== null && 'description' in err.response.data
            ? (err.response.data as { description?: string }).description ?? 'Ha ocurrido un error desconocido.'
            : 'Ha ocurrido un error desconocido.',
          btnAccept: 'Aceptar',
        });
      }
    return Promise.reject(err);
  }
);

// Exportar la instancia de Axios
export { api };
