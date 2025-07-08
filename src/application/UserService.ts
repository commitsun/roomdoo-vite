import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';

export class UserService {
  constructor(private userRepository: UserRepository) {}
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
