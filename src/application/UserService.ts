import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import type { Id } from '@/domain/types/Id';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async doLogin(email: string, password: string) {
    await this.userRepository.login(email, password);
  }
  async getUser(): Promise<User | null> {
    return this.userRepository.getUser();
  }
  async getAvailabilityRuleFields(): Promise<string[]> {
    return this.userRepository.getAvailabilityRuleFields();
  }

  // vs

  async loginAndGetUser(email: string, password: string): Promise<User | null> {
    await this.userRepository.login(email, password);
    const user = await this.userRepository.getUser();
    if (!user) {
      return null;
    }
    const availabilityRuleFields = await this.userRepository.getAvailabilityRuleFields();
    return {
      ...user,
      availabilityRuleFields,
    };
  }
}
