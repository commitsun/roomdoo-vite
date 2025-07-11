import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { HttpError } from '@/infrastructure/http/HttpError';
import { AppError } from './AppError';

export class UserService {
  constructor(private userRepository: UserRepository) {}
  async loginAndGetUser(email: string, password: string): Promise<User | null> {
    let user;
    let availabilityRuleFields;
    try {
      await this.userRepository.login(email, password);
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        throw new AppError('WRONG_CREDENTIALS');
      } else {
        throw new AppError('UNKNOWN_ERROR');
      }
    }
    try {
      user = await this.userRepository.fetchUser();
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        throw new AppError('USER_NOT_FOUND');
      } else {
        throw new AppError('UNKNOWN_ERROR');
      }
    }
    try {
      availabilityRuleFields = await this.userRepository.fetchAvailabilityRuleFields();
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        throw new AppError('AVAILABILITY_RULE_FIELDS_NOT_FOUND');
      } else {
        throw new AppError('UNKNOWN_ERROR');
      }
    }
    return {
      ...user,
      availabilityRuleFields,
    };
  }
}
