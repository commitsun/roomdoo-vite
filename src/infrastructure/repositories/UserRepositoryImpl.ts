import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { api } from '@/infrastructure/http/axios';

export class UsersRepositoryImpl implements UserRepository {
  async login(email: string, password: string): Promise<void> {
    return await api.post('/api/login', { email, password });
  }
  async fetchUser(): Promise<User> {
    return await api.get(`/api/users/me`);
  }
  async fetchAvailabilityRuleFields(): Promise<string[]> {
    return await api.get(`/api/users/availability_rule_fields`);
  }
}
