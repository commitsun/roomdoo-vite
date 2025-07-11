import { describe, it, expect, vi } from 'vitest';
import { UserService } from './UserService';
import { AppError } from './AppError';
import { HttpError } from '@/infrastructure/http/HttpError';
import type { User } from '@/domain/entities/User';

// Mock realista del usuario conforme a la entidad
const mockUser = (): User => ({
  id: 'user-1',
  email: 'test@roomdoo.com',
  firstName: 'Test',
  lastName: 'User',
  defaultPropertyId: 'property-123',
  availabilityRuleFields: ['field-1'],
});

// Usamos vi.fn() directamente sin forzar a cumplir una interfaz
const createMockRepo = () => {
  return {
    login: vi.fn<() => Promise<void>>(),
    fetchUser: vi.fn<() => Promise<User>>(),
    fetchAvailabilityRuleFields: vi.fn<() => Promise<string[]>>(),
  };
};

describe('UserService', () => {
  const email = 'test@roomdoo.com';
  const password = '1234';
  const user = mockUser();
  const fields = ['rule-a', 'rule-b'];

  it('returns user with availabilityRuleFields on success', async () => {
    const repo = createMockRepo();
    repo.login.mockResolvedValue();
    repo.fetchUser.mockResolvedValue(user);
    repo.fetchAvailabilityRuleFields.mockResolvedValue(fields);

    const service = new UserService(repo);
    const result = await service.loginAndGetUser(email, password);

    expect(result).toEqual({ ...user, availabilityRuleFields: fields });
  });

  it('throws WRONG_CREDENTIALS if login fails with 401', async () => {
    const repo = createMockRepo();
    repo.login.mockRejectedValue(new HttpError(401, '/login', 'post', {}));

    const service = new UserService(repo);
    await expect(service.loginAndGetUser(email, password)).rejects.toMatchObject({
      code: 'WRONG_CREDENTIALS',
    });
  });

  it('throws USER_NOT_FOUND if fetchUser fails with 404', async () => {
    const repo = createMockRepo();
    repo.login.mockResolvedValue();
    repo.fetchUser.mockRejectedValue(new HttpError(404, '/me', 'get', {}));

    const service = new UserService(repo);
    await expect(service.loginAndGetUser(email, password)).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
  });

  it('throws AVAILABILITY_RULE_FIELDS_NOT_FOUND if fetchAvailabilityRuleFields fails with 404', async () => {
    const repo = createMockRepo();
    repo.login.mockResolvedValue();
    repo.fetchUser.mockResolvedValue(user);
    repo.fetchAvailabilityRuleFields.mockRejectedValue(new HttpError(404, '/fields', 'get', {}));

    const service = new UserService(repo);
    await expect(service.loginAndGetUser(email, password)).rejects.toMatchObject({
      code: 'AVAILABILITY_RULE_FIELDS_NOT_FOUND',
    });
  });

  it('throws UNKNOWN_ERROR on unexpected login error', async () => {
    const repo = createMockRepo();
    repo.login.mockRejectedValue(new Error('boom'));

    const service = new UserService(repo);
    await expect(service.loginAndGetUser(email, password)).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
    });
  });
});
