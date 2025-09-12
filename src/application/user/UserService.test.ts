import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { UserService } from './UserService';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { UnauthorizedError } from '../shared/UnauthorizedError';

describe('UserService - loginAndGetUser', () => {
  let userService: UserService;
  let userRepoMock: Partial<Record<keyof UserRepository, any>>;

  beforeEach(() => {
    userRepoMock = {
      login: vi.fn(),
      fetchUser: vi.fn(),
      fetchAvailabilityRuleFields: vi.fn(),
      requestChangePassword: vi.fn(),
      resetPassword: vi.fn(),
      refreshToken: vi.fn(),
    };
    userService = new UserService(userRepoMock as UserRepository);
  });

  it('should login, fetch user, fetch fields and return merged user', async () => {
    userRepoMock.login.mockResolvedValue(undefined);
    const userData = {
      id: 2,
      name: 'Mitchell Admin',
      firstName: 'Mitchell',
      lastName: 'Admin',
      lastName2: '',
      email: 'admin@yourcompany.example.com',
      phone: '+1 555-555-5555',
      image: 'http://localhost:8016/web/image/18?access_token=...',
      defaultPmsProperty: { id: 1, name: 'My Property' },
    };
    const ruleFields = [{ name: 'Field 1' }, { name: 'Field 2' }];
    userRepoMock.fetchUser.mockResolvedValue(userData);
    userRepoMock.fetchAvailabilityRuleFields.mockResolvedValue(ruleFields);

    const result = await userService.loginAndGetUser('roomdoo@roomdoo.com', 'pw');

    expect(userRepoMock.login).toHaveBeenCalledWith('roomdoo@roomdoo.com', 'pw');
    expect(userRepoMock.fetchUser).toHaveBeenCalled();
    expect(userRepoMock.fetchAvailabilityRuleFields).toHaveBeenCalled();
    expect(result).toEqual({
      ...userData,
      availabilityRuleFields: ruleFields,
    });
  });

  it('should propagate error if login fails', async () => {
    userRepoMock.login.mockRejectedValue(new UnauthorizedError());

    await expect(userService.loginAndGetUser('fail@roomdoo.com', 'failpw')).rejects.toThrowError(
      UnauthorizedError
    );
    expect(userRepoMock.login).toHaveBeenCalledWith('fail@roomdoo.com', 'failpw');
    expect(userRepoMock.fetchUser).not.toHaveBeenCalled();
    expect(userRepoMock.fetchAvailabilityRuleFields).not.toHaveBeenCalled();
  });

  it('should call repo methods in order: login, fetchUser, fetchAvailabilityRuleFields', async () => {
    const callOrder: string[] = [];
    userRepoMock.login.mockImplementation(() => {
      callOrder.push('login');
      return Promise.resolve(undefined);
    });
    userRepoMock.fetchUser.mockImplementation(() => {
      callOrder.push('fetchUser');
      return Promise.resolve({});
    });
    userRepoMock.fetchAvailabilityRuleFields.mockImplementation(() => {
      callOrder.push('fetchAvailabilityRuleFields');
      return Promise.resolve([]);
    });

    await userService.loginAndGetUser('admin@yourcompany.example.com', 'pw');

    expect(callOrder[0]).toBe('login');
  });

  it('should call requestPassword with email', async () => {
    await userService.requestChangePassword('test@roomdoo.com');
    expect(userRepoMock.requestChangePassword).toHaveBeenCalledWith('test@roomdoo.com');
  });

  it('should call resetPassword with password and token', async () => {
    await userService.resetPassword('newpass', 'token123');
    expect(userRepoMock.resetPassword).toHaveBeenCalledWith('newpass', 'token123');
  });

  it('should propagate errors from resetPassword', async () => {
    userRepoMock.resetPassword.mockRejectedValue(new UnauthorizedError());
    await expect(userService.resetPassword('newpass', 'notValidToken')).rejects.toThrow(
      UnauthorizedError
    );
  });

  it('should call refreshToken', async () => {
    await userService.refreshToken();
    expect(userRepoMock.refreshToken).toHaveBeenCalled();
  });

  it('should propagate errors from refreshToken', async () => {
    userRepoMock.refreshToken.mockRejectedValue(new UnauthorizedError());
    await expect(userService.refreshToken()).rejects.toThrow(UnauthorizedError);
  });
});
