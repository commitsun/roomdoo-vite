import type { User } from '@/domain/entities/User';
import type { Id } from '../types/Id';

export interface UserRepository {
  login(user: string, password: string): Promise<void>;
  getUser(): Promise<User | null>;
  getAvailabilityRuleFields(): Promise<string[]>;
}
