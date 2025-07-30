import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { api } from '@/infrastructure/http/axios';

export class UsersRepositoryImpl implements UserRepository {
  async login(email: string, password: string): Promise<void> {
    await api.post('/login', { username: email, password });
  }

  async fetchUser(): Promise<User> {
    const response = await api.get('/user');
    const user = response.data;
    user.avatar = user.image;
    delete user.image;
    return user;
  }

  async fetchAvailabilityRuleFields(): Promise<string[]> {
    const response = await api.get('/user/availability-rule-fields');
    return response.data.map((field: { name: string }) => field.name);
  }

  async requestPassword(email: string): Promise<void> {
    await api.post('/send-mail-reset-password', { email });
  }

  async resetPassword(password: string, token: string): Promise<void> {
    await api.patch('/reset-password', { newPassword: password, resetToken: token });
  }
}
