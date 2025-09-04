import { defineStore } from 'pinia';
import type { User } from '@/domain/entities/User';
import { readonly, ref } from 'vue';
import { UsersRepositoryImpl } from '../repositories/UserRepositoryImpl';
import { UserService } from '@/application/user/UserService';
import { CookieService } from '@/infrastructure/cookies/CookieService';

const userRepository = new UsersRepositoryImpl();
const userService = new UserService(userRepository);

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);

  const hydrateFromCookies = () => {
    if (user.value) return;
    const data = CookieService.getUserCookies();
    if (data) user.value = data as User;
  };

  const login = async (email: string, password: string) => {
    console.log('login called');
    user.value = await userService.loginAndGetUser(email, password);
    if (user.value) {
      CookieService.setUserCookies({
        id: user.value.id,
        email: user.value.email,
        firstName: user.value.firstName,
        defaultPmsProperty: user.value.defaultPmsProperty,
        lastName: user.value.lastName,
        languageId: user.value.languageId,
        lastName2: user.value.lastName2,
        phone: user.value.phone,
        avatar: user.value.avatar,
        availabilityRuleFields: user.value.availabilityRuleFields || [],
      });
    }
  };

  const requestChangePassword = async (email: string) => {
    await userService.requestChangePassword(email);
  };

  const resetPassword = async (password: string, token: string) => {
    await userService.resetPassword(password, token);
  };

  const refreshToken = async () => {
    await userService.refreshToken();
  };

  const updateUser = async (updatedUser: Partial<User>) => {
    await userService.updateUser(updatedUser);
    if (user.value) {
      user.value = { ...user.value, ...updatedUser };
      CookieService.setUserCookies(user.value);
    }
  };

  const logout = () => {
    user.value = null;
    userService.logout();
  };

  return {
    user: readonly(user),
    refreshToken,
    login,
    requestChangePassword,
    resetPassword,
    hydrateFromCookies,
    updateUser,
    logout,
  };
});
