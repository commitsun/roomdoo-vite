import { describe, it, expect, vi, beforeEach } from 'vitest';

import { UserService } from './UserService';

import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import type { UserRepository } from '@/domain/repositories/UserRepository';

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
      changePassword: vi.fn(),
      updateUser: vi.fn(),
      logout: vi.fn(),
    };
    userService = new UserService(userRepoMock as UserRepository);
  });

  it('does login, fetch user, fetch fields and return merged user', async () => {
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
      lang: 'en_US',
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

  it('propagate error if login fails', async () => {
    userRepoMock.login.mockRejectedValue(new UnauthorizedError());

    await expect(userService.loginAndGetUser('fail@roomdoo.com', 'failpw')).rejects.toThrowError(
      UnauthorizedError,
    );
    expect(userRepoMock.login).toHaveBeenCalledWith('fail@roomdoo.com', 'failpw');
    expect(userRepoMock.fetchUser).not.toHaveBeenCalled();
    expect(userRepoMock.fetchAvailabilityRuleFields).not.toHaveBeenCalled();
  });

  it('call repo methods in order: login, fetchUser, fetchAvailabilityRuleFields (exact order)', async () => {
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

    expect(callOrder).toEqual(['login', 'fetchUser', 'fetchAvailabilityRuleFields']);
  });

  it('propagate error if fetchUser fails after login', async () => {
    userRepoMock.login.mockResolvedValue(undefined);
    userRepoMock.fetchUser.mockRejectedValue(new Error('boom'));
    userRepoMock.fetchAvailabilityRuleFields.mockResolvedValue([]);

    await expect(userService.loginAndGetUser('x@roomdoo.com', 'pw')).rejects.toThrow('boom');

    expect(userRepoMock.login).toHaveBeenCalled();
    expect(userRepoMock.fetchUser).toHaveBeenCalled();
    // Si falla fetchUser, no debe pedirse availabilityRuleFields
    expect(userRepoMock.fetchAvailabilityRuleFields).not.toHaveBeenCalled();
  });

  it('propagate error if fetchAvailabilityRuleFields fails after fetchUser', async () => {
    userRepoMock.login.mockResolvedValue(undefined);
    userRepoMock.fetchUser.mockResolvedValue({ id: 1, name: 'User' });
    userRepoMock.fetchAvailabilityRuleFields.mockRejectedValue(new Error('fields-error'));

    await expect(userService.loginAndGetUser('x@roomdoo.com', 'pw')).rejects.toThrow(
      'fields-error',
    );

    expect(userRepoMock.login).toHaveBeenCalled();
    expect(userRepoMock.fetchUser).toHaveBeenCalled();
    expect(userRepoMock.fetchAvailabilityRuleFields).toHaveBeenCalled();
  });

  it('call requestPassword with email', async () => {
    await userService.requestChangePassword('test@roomdoo.com');
    expect(userRepoMock.requestChangePassword).toHaveBeenCalledWith('test@roomdoo.com');
  });

  it('call resetPassword with password and token', async () => {
    await userService.resetPassword('newpass', 'token123');
    expect(userRepoMock.resetPassword).toHaveBeenCalledWith('newpass', 'token123');
  });

  it('propagate errors from resetPassword', async () => {
    userRepoMock.resetPassword.mockRejectedValue(new UnauthorizedError());
    await expect(userService.resetPassword('newpass', 'notValidToken')).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it('call refreshToken', async () => {
    await userService.refreshToken();
    expect(userRepoMock.refreshToken).toHaveBeenCalled();
  });

  it('propagate errors from refreshToken', async () => {
    userRepoMock.refreshToken.mockRejectedValue(new UnauthorizedError());
    await expect(userService.refreshToken()).rejects.toThrow(UnauthorizedError);
  });

  it('changePassword: calls repository with current and new passwords', async () => {
    userRepoMock.changePassword.mockResolvedValue(undefined);

    await userService.changePassword('old!', 'new!');

    expect(userRepoMock.changePassword).toHaveBeenCalledWith('old!', 'new!');
  });

  it('changePassword: propagates repository errors', async () => {
    userRepoMock.changePassword.mockRejectedValue(new UnauthorizedError());

    await expect(userService.changePassword('bad', 'worse')).rejects.toThrow(UnauthorizedError);
  });

  it('updateUser: calls repository with partial user payload', async () => {
    userRepoMock.updateUser.mockResolvedValue(undefined);
    const payload = { firstName: 'Ada', lastName: 'Lovelace' };

    await userService.updateUser(payload);

    expect(userRepoMock.updateUser).toHaveBeenCalledWith(payload);
  });

  it('updateUser: propagates repository errors', async () => {
    userRepoMock.updateUser.mockRejectedValue(new Error('update failed'));

    await expect(userService.updateUser({ firstName: 'Alan' })).rejects.toThrow('update failed');
  });

  it('logout: calls repository.logout synchronously', () => {
    userService.logout();
    expect(userRepoMock.logout).toHaveBeenCalled();
  });
});
