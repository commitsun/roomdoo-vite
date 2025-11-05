import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';

export class UserService {
  constructor(private userRepository: UserRepository) {}
  async loginAndGetUser(email: string, password: string): Promise<User | null> {
    await this.userRepository.login(email, password);
    const user = await this.userRepository.fetchUser();
    const availabilityRuleFields = await this.userRepository.fetchAvailabilityRuleFields();

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

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.userRepository.changePassword(currentPassword, newPassword);
  }

  async refreshToken(): Promise<void> {
    await this.userRepository.refreshToken();
  }

  async updateUser(user: Partial<User>): Promise<void> {
    await this.userRepository.updateUser(user);
  }

  async fetchUserSchemas(): Promise<string[]> {
    return this.userRepository.fetchUserSchemas();
  }

  logout(): void {
    this.userRepository.logout();
  }
}
