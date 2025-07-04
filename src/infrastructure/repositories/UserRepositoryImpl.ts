import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { api } from '@/infrastructure/http/axios';

export class UsersRepositoryImpl implements UserRepository {
  async login(email: string, password: string): Promise<void> {
    const response = await api.post('/api/login', { email, password });
    if (response.status !== 200) {
      throw new Error('Login failed');
    }
    return response.data;
  }
  async getUser(): Promise<User | null> {
    const response = await api.get(`/api/users/me`);
    if (response.status !== 200) {
      throw new Error('User not found');
    }
    return response.data;
  }
  async getAvailabilityRuleFields(): Promise<string[]> {
    const response = await api.get(`/api/users/availability-rule-fields`);
    if (response.status !== 200) {
      throw new Error('Failed to fetch availability rule fields');
    }
    return response.data;
  }
}
