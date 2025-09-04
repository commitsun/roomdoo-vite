import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';

export class UserService {
  constructor(private userRepository: UserRepository) {}
  async loginAndGetUser(email: string, password: string): Promise<User | null> {
    let user;
    let availabilityRuleFields;

    await this.userRepository.login(email, password);
    user = await this.userRepository.fetchUser();
    availabilityRuleFields = await this.userRepository.fetchAvailabilityRuleFields();

    const userWithFields = {
      ...user,
      availabilityRuleFields,
    };

    return userWithFields;
  }

  async requestChangePassword(email: string): Promise<void> {
    await this.userRepository.requestChangePassword(email);
  }

  async resetPassword(password: string, token: string): Promise<void> {
    await this.userRepository.resetPassword(password, token);
  }

  async refreshToken(): Promise<void> {
    await this.userRepository.refreshToken();
  }

  async updateUser(user: Partial<User>): Promise<void> {
    await this.userRepository.updateUser(user);
  }

  logout(): void {
    this.userRepository.logout();
  }
}
