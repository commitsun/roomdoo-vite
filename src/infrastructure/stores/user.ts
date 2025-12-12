import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

import { i18n } from '@/infrastructure/plugins/i18n';
import { UsersRepositoryImpl } from '@/infrastructure/repositories/UserRepositoryImpl';
import type { User } from '@/domain/entities/User';
import { UserService } from '@/application/user/UserService';
import { CookieService } from '@/infrastructure/cookies/CookieService';

const userRepository = new UsersRepositoryImpl();
const userService = new UserService(userRepository);

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);

  const hydrateFromCookies = (): void => {
    if (user.value) {
      return;
    }
    const data = CookieService.getUserCookies();
    if (data) {
      user.value = data as User;
      i18n.global.locale.value = user.value.lang;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    user.value = await userService.loginAndGetUser(email, password);
    if (user.value) {
      CookieService.setUserCookies({
        id: user.value.id,
        email: user.value.email,
        firstName: user.value.firstName,
        defaultPmsProperty: user.value.defaultPmsProperty,
        lastName: user.value.lastName,
        lang: user.value.lang,
        lastName2: user.value.lastName2,
        phone: user.value.phone,
        avatar: user.value.avatar,
        login: user.value.login,
        availabilityRuleFields: user.value.availabilityRuleFields || [],
      });
      // change i18n locale
      i18n.global.locale.value = user.value.lang;
    }
  };

  const requestChangePassword = async (email: string): Promise<void> => {
    await userService.requestChangePassword(email);
  };

  const resetPassword = async (password: string, token: string): Promise<void> => {
    await userService.resetPassword(password, token);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    await userService.changePassword(currentPassword, newPassword);
  };

  const refreshToken = async (): Promise<void> => {
    await userService.refreshToken();
  };

  const updateUser = async (updatedUser: Partial<User>): Promise<void> => {
    await userService.updateUser(updatedUser);
    if (user.value) {
      user.value = { ...user.value, ...updatedUser };
      CookieService.setUserCookies({ ...user.value });
    }
  };

  const logout = (): void => {
    user.value = null;
    userService.logout();
  };

  return {
    user: readonly(user),
    refreshToken,
    login,
    requestChangePassword,
    resetPassword,
    changePassword,
    hydrateFromCookies,
    updateUser,
    logout,
  };
});
