
import type { ActionTree } from 'vuex';
import { api } from '@/_legacy/http/axios';
import { api as newApi } from '@/infrastructure/http/axios';
import type { CredentialsInterface } from '@/_legacy/interfaces/UserInterfaces';
import type { AxiosResponse } from 'axios';
import type { ApiRestErrorInterface } from '@/_legacy/interfaces/ApiRestErrorInterface';
import type {
  UserInfoInterface,
  UserNameInfoInterface,
} from '@/_legacy/interfaces/UserInfoInterface';
import type { StateInterface } from '../index';
import type { UserStateInterface } from '.';
import { dialogService } from '@/_legacy/services/DialogService';
import { deleteCookie, getAllCookies, getCookie, setCookie } from '@/_legacy/utils/cookies';
const COOKIE_PATH = '/';

const actions: ActionTree<UserStateInterface, StateInterface> = {
  async login(context, payload: CredentialsInterface): Promise<void> {
    return api
      .post('/login', {
        username: payload.email,
        password: payload.password,
      })
      .then((response: AxiosResponse<UserInfoInterface>) => {
        if (response.data && response.data.token) {
          if (!response.data.code) {
            const jwt = `Bearer ${response.data.token}`;
            (api.defaults.headers as any).common['Authorization'] = jwt;
            (newApi.defaults.headers as any).common['Authorization'] = jwt;
            context.commit('SET_CURRENT_USER', response.data);
            setCookie('jwt', jwt, { path: COOKIE_PATH });
            setCookie('expirationDate', response.data.expirationDate.toString(), { path: COOKIE_PATH });
            setCookie('defaultPropertyId', response.data.defaultPropertyId.toString(), { path: COOKIE_PATH });
            setCookie('userId', response.data.userId.toString(), { path: COOKIE_PATH });
            setCookie('userName', response.data.userName, { path: COOKIE_PATH });
            setCookie('userFirstName', response.data.userFirstName, { path: COOKIE_PATH });
            setCookie('userEmail', response.data.userEmail, { path: COOKIE_PATH });
            setCookie('userPhone', response.data.userPhone, { path: COOKIE_PATH });
            setCookie(
              'availabilityRuleFields',
              JSON.stringify(response.data.availabilityRuleFields), {
                path: COOKIE_PATH,
              }
            );
            setCookie('userImageUrl', response.data.userImageUrl, { path: COOKIE_PATH });
            localStorage.setItem('userImageBase64', response.data.userImageBase64 || '');
          }
        }
      })
      .catch((error: ApiRestErrorInterface) => {
        if (error.response.status === 401) {
          dialogService.open({
            header: 'Credenciales incorrectas',
            content: 'No se ha podido iniciar sesión.',
            btnAccept: 'Aceptar',
          });
        } else {
          dialogService.open({
            header: 'Error inesperado',
            content: 'Algo ha ido mal.',
            btnAccept: 'Aceptar',
          });
        }
      });
  },
  recoverCookies(context): void {
    const jwt = getCookie('jwt');
    const expirationDate = getCookie('expirationDate');
    const defaultPropertyId = getCookie('defaultPropertyId');
    const userId = getCookie('userId');
    const userName = getCookie('userName');
    const userFirstName = getCookie('userFirstName');
    const userEmail = getCookie('userEmail');
    const userPhone = getCookie('userPhone');
    const userImageBase64 = localStorage.getItem('userImageBase64');
    const availabilityRuleFields = JSON.parse(getCookie('availabilityRuleFields') || '[]');
    const userImageUrl = getCookie('userImageUrl');
    const allCookies = getAllCookies();

    if (jwt && expirationDate && defaultPropertyId && userId && userName && availabilityRuleFields) {
      const today = new Date();
      const expirationDateCookieValue = getCookie('expirationDate');
      if (
        expirationDateCookieValue &&
        parseInt(expirationDateCookieValue, 10) * 1000 >= today.getTime()
      ) {
        context.commit('SET_CURRENT_USER', {
          jwt,
          expirationDate,
          defaultPropertyId,
          userId,
          userName,
          userFirstName,
          userEmail,
          userPhone,
          userImageBase64,
          availabilityRuleFields,
          userImageUrl,
        });
        (api.defaults.headers as any).common['Authorization'] = jwt;
        (api.defaults.headers as any).common['Content-Type'] = 'application/json';
        (newApi.defaults.headers as any).common['Authorization'] = jwt;
        (newApi.defaults.headers as any).common['Content-Type'] = 'application/json';
      } else {
        context.commit('CLEAR_CURRENT_USER');
        void context.dispatch('properties/reset', {}, { root: true });
      }
    }
  },

  reset(context) {
    deleteCookie('jwt', { path: COOKIE_PATH });
    deleteCookie('userId', { path: COOKIE_PATH });
    deleteCookie('userName', { path: COOKIE_PATH });
    deleteCookie('userFirstName', { path: COOKIE_PATH });
    deleteCookie('userEmail', { path: COOKIE_PATH });
    deleteCookie('userPhone', { path: COOKIE_PATH });
    deleteCookie('defaultPropertyId', { path: COOKIE_PATH });
    deleteCookie('expirationDate', { path: COOKIE_PATH });
    deleteCookie('availabilityRuleFields', { path: COOKIE_PATH });
    deleteCookie('userImageUrl', { path: COOKIE_PATH });
    localStorage.removeItem('userImageBase64');
    context.commit('CLEAR_CURRENT_USER');
  },

  clearUser(context) {
    context.commit('CLEAR_CURRENT_USER');
  },

  async fetchUser(context, userId: number) {
    return api.get(`/users/${userId}`).then((response: AxiosResponse<UserInfoInterface>) => {
      if (response.data) {
        context.commit('SET_CURRENT_USER', response.data);
      }
    });
  },

  async updateUser(context, payload: UserInfoInterface) {
    return api.patch(`/users/p/${payload.userId}`, payload).then(() => {
      setCookie('expirationDate', payload.expirationDate.toString(), { path: COOKIE_PATH });
      setCookie('defaultPropertyId', payload.defaultPropertyId.toString(), { path: COOKIE_PATH });
      setCookie('userId', payload.userId.toString(), { path: COOKIE_PATH });
      setCookie('userName', payload.userName, { path: COOKIE_PATH });
      setCookie('userFirstName', payload.userFirstName, { path: COOKIE_PATH });
      setCookie('userEmail', payload.userEmail, { path: COOKIE_PATH });
      setCookie('userPhone', payload.userPhone, { path: COOKIE_PATH });
      setCookie('availabilityRuleFields', JSON.stringify(payload.availabilityRuleFields), { path: COOKIE_PATH });
      setCookie('userImageUrl', payload.userImageUrl, { path: COOKIE_PATH });
      localStorage.setItem('userImageBase64', payload.userImageBase64 || '');
    });
  },

  async changePassword(
    context,
    payload: { userId: number; password: string; newPassword: string }
  ) {
    return api
      .patch(`/users/p/${payload.userId}/change-password`, payload)
      .then(async (response: AxiosResponse<UserNameInfoInterface>) => {
        if (response.data.login) {
          await context.dispatch('reset');
          void context.dispatch(
            'user/login',
            {
              email: response.data.login,
              password: payload.newPassword,
            },
            { root: true }
          );
        }
      });
  },
  async resetPassword(context, payload: { password: string; resetToken: string }) {
    return api.post('/users/p/reset-password', payload);
  },

  sendMailToResetPassword(context, payload: { userEmail: string; url: string }) {
    return api.post('/users/send-mail-reset-password', payload);
  },

  async checkPasswordTokenExpiration(context, payload: { resetToken: string }) {
    return api.get(`/users/check-reset-password-token/${payload.resetToken}`);
  },
};

export default actions;
