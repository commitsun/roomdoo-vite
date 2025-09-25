import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { api } from '@/infrastructure/http/axios';
import { CookieService } from '../cookies/CookieService';

export class UsersRepositoryImpl implements UserRepository {
  async login(email: string, password: string): Promise<void> {
    await api.post('/login', { username: email, password });
  }

  async fetchUser(): Promise<User> {
    const response = await api.get('/user');
    const user = response.data;
    user.avatar = user.image;
    delete user.image;
    // TODO: request to back end team language when fetch user
    user.languageId = 1;
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
    // TODO: await api.patch('/user', user);
    CookieService.setUserCookies(user as User);
  }
  logout(): void {
    CookieService.clearUserCookies();
  }
}
