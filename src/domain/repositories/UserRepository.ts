import type { User } from '@/domain/entities/User';

export interface UserRepository {
  login(user: string, password: string): Promise<void>;
  fetchUser(): Promise<User>;
  fetchAvailabilityRuleFields(): Promise<string[]>;
  requestChangePassword(email: string): Promise<void>;
  resetPassword(password: string, token: string): Promise<void>;
  refreshToken(): Promise<void>;
}
