import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mocked } from 'vitest';
import { UserService } from './UserService';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import type { User } from '@/domain/entities/User';

describe('UserService', () => {
  const mockUser: User = {
    id: '123',
    email: 'roomdoo@example.com',
    firstName: 'Roomdoo',
    lastName: 'Tester',
    defaultPropertyId: 'prop-001',
  };

  let userRepository: Mocked<UserRepository>;
  let service: UserService;

  beforeEach(() => {
    userRepository = {
      login: vi.fn(),
      getUser: vi.fn(),
      getAvailabilityRuleFields: vi.fn(),
    };
    service = new UserService(userRepository);
  });

  it('should return enriched user after successful login', async () => {
    userRepository.login.mockResolvedValue();
    userRepository.getUser.mockResolvedValue(mockUser);
    userRepository.getAvailabilityRuleFields.mockResolvedValue(['rule1', 'rule2']);

    const result = await service.loginAndGetUser('roomdoo@example.com', 'password');

    expect(userRepository.login).toHaveBeenCalledWith('roomdoo@example.com', 'password');
    expect(result).toEqual({
      ...mockUser,
      availabilityRuleFields: ['rule1', 'rule2'],
    });
  });

  it('should return null if getUser returns null', async () => {
    userRepository.login.mockResolvedValue();
    userRepository.getUser.mockResolvedValue(null);

    const result = await service.loginAndGetUser('roomdoo@example.com', 'password');

    expect(result).toBeNull();
    expect(userRepository.getAvailabilityRuleFields).not.toHaveBeenCalled();
  });

  it('should throw if login fails', async () => {
    userRepository.login.mockRejectedValue(new Error('Login failed'));

    await expect(service.loginAndGetUser('roomdoo@example.com', 'password')).rejects.toThrow(
      'Login failed'
    );
  });

  it('should throw if getAvailabilityRuleFields fails', async () => {
    userRepository.login.mockResolvedValue();
    userRepository.getUser.mockResolvedValue(mockUser);
    userRepository.getAvailabilityRuleFields.mockRejectedValue(new Error('Field error'));

    await expect(service.loginAndGetUser('roomdoo@example.com', 'password')).rejects.toThrow(
      'Field error'
    );
  });
});
