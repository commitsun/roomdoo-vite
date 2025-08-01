import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';

export class UserService {
  constructor(private userRepository: UserRepository) {}
  async loginAndGetUser(email: string, password: string): Promise<User | null> {
    let user;
    let availabilityRuleFields;
    let loginData;

    loginData = await this.userRepository.login(email, password);

    user = await this.userRepository.fetchUser();

    availabilityRuleFields = await this.userRepository.fetchAvailabilityRuleFields();

    const userWithFields = {
      ...user,
      availabilityRuleFields,
    };

    return userWithFields;
  }

  async requestPassword(email: string): Promise<void> {
    await this.userRepository.requestPassword(email);
  }

  async resetPassword(password: string, token: string): Promise<void> {
    await this.userRepository.resetPassword(password, token);
  }

  async refreshToken(): Promise<void> {
    await this.userRepository.refreshToken();
  }
}
