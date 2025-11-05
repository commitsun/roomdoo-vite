import { CookieService } from '@/infrastructure/cookies/CookieService';
import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { api } from '@/infrastructure/http/axios';
import { i18n } from '@/infrastructure/plugins/i18n';
import { updatePrimevueLocale } from '@/infrastructure/plugins/primevue';

export class UsersRepositoryImpl implements UserRepository {
  async login(email: string, password: string): Promise<void> {
    await api.post('/login', { username: email, password });
  }

  async fetchUser(): Promise<User> {
    const response = await api.get('/user');
    const user = response.data;
    user.firstName = user.firstname;
    user.lastName = user.lastname;
    user.lastName2 = user.lastname2;
    user.avatar = user.image;
    user.lang = user.lang.replace('_', '-');
    return user;
  }

  async fetchAvailabilityRuleFields(): Promise<string[]> {
    const response = await api.get('/user/availability-rule-fields');
    return response.data.map((field: { name: string }) => field.name);
  }

  async requestChangePassword(email: string): Promise<void> {
    await api.post('/send-mail-reset-password', { email });
  }

  async resetPassword(password: string, token: string): Promise<void> {
    await api.patch('/reset-password', { newPassword: password, resetToken: token });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch('/user/change-password', { oldPassword: currentPassword, newPassword });
  }

  async refreshToken(): Promise<void> {
    await api.post('/refresh-token');
  }
  async updateUser(user: Partial<User>): Promise<void> {
    const payload: {
      firstname?: string;
      lastname?: string;
      lastname2?: string;
      login?: string;
      phone?: string;
      email?: string;
      lang?: string;
    } = {};
    if (user.firstName !== undefined) {
      payload.firstname = user.firstName;
    }
    if (user.lastName !== undefined) {
      payload.lastname = user.lastName;
    }
    if (user.lastName2 !== undefined) {
      payload.lastname2 = user.lastName2;
    }
    if (user.phone !== undefined) {
      payload.phone = user.phone;
    }
    if (user.email !== undefined) {
      payload.email = user.email;
    }
    if (user.lang !== undefined) {
      payload.lang = user.lang.replace('-', '_');
      i18n.global.locale.value = user.lang;
      updatePrimevueLocale(user.lang.substring(0, 2));
    }
    if (user.login !== undefined) {
      payload.login = user.login;
    }
    if (user.avatar !== undefined) {
      const res = await fetch(user.avatar);
      const blob = await res.blob();
      const ext = blob.type?.split('/')[1] ?? 'png';
      const file = new File([blob], `avatar.${ext}`, { type: blob.type || 'image/png' });
      const formData = new FormData();
      formData.append('image', file);
      await api.put('/user/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    await api.patch('/user', payload);
  }
  async fetchUserSchemas(): Promise<string[]> {
    const response = await api.get('/user/extra-features');
    return response.data;
  }
  logout(): void {
    CookieService.clearUserCookies();
  }
}
