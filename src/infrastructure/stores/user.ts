import { defineStore } from 'pinia';
import type { User } from '@/domain/entities/User';
import { ref } from 'vue';
import { UsersRepositoryImpl } from '../repositories/UserRepositoryImpl';
import { UserService } from '@/application/user/UserService';
import { CookieService } from '@/infrastructure/cookies/CookieService';

const userRepository = new UsersRepositoryImpl();
const userService = new UserService(userRepository);

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const isSessionExpired = ref(false);

  const login = async (email: string, password: string) => {
    user.value = await userService.loginAndGetUser(email, password);
    if (user.value) {
      CookieService.setUserCookies({
        id: user.value.id,
        email: user.value.email,
        firstName: user.value.firstName,
        defaultProperty: user.value.defaultProperty,
        lastName: user.value.lastName,
        lastName2: user.value.lastName2,
        phone: user.value.phone,
        avatar: user.value.avatar,
        availabilityRuleFields: user.value.availabilityRuleFields || [],
      });
    }
  };

  const logout = () => {
    user.value = null;
    CookieService.clearUserCookies();
  };

  const requestPassword = async (email: string) => {
    await userService.requestPassword(email);
  };

  const resetPassword = async ( password: string, token: string) => {
    await userService.resetPassword(password, token);
  }

  const recoverFromCookies = () => {
    const recoveredUser = CookieService.recoverUserFromCookies();
    if (recoveredUser) {
      user.value = recoveredUser;
    }
  };

  const refreshToken = async () => {
      await userService.refreshToken();
  }

  const setSessionExpired = (value: boolean) => {
    isSessionExpired.value = value;
  };


  return { user,isSessionExpired, login, logout, requestPassword, resetPassword, recoverFromCookies, refreshToken, setSessionExpired,  };
});
