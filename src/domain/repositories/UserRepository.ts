import type { User } from '@/domain/entities/User';

export interface UserRepository {
  login(user: string, password: string): Promise<void>;
  fetchUser(): Promise<User>;
  fetchAvailabilityRuleFields(): Promise<string[]>;
}
