import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersRepositoryImpl } from './UserRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';

describe('UsersRepositoryImpl', () => {
  let repo: UsersRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new UsersRepositoryImpl();
  });

  //login
  it('propagates axios errors in login', async () => {
    const err = new Error('axios fail');
    (api.post as any).mockRejectedValue(err);

    await expect(repo.login('admin', '123')).rejects.toThrow(err);
  });

  //fetchUser
  it('propagates axios errors in fetchUser', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchUser()).rejects.toThrow(err);
  });

  //fetchAvailabilityRuleFields
  it('propagates axios errors in fetchAvailabilityRuleFields', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchAvailabilityRuleFields()).rejects.toThrow(err);
  });

  //requestChangePassword
  it('propagates axios errors in requestChangePassword', async () => {
    const err = new Error('axios fail');
    (api.post as any).mockRejectedValue(err);

    await expect(repo.requestChangePassword('example@mail.com')).rejects.toThrow(err);
  });

  //resetPassword
  it('propagates axios errors in resetPassword', async () => {
    const err = new Error('axios fail');
    (api.patch as any).mockRejectedValue(err);

    await expect(repo.resetPassword('newPassword', 'token')).rejects.toThrow(err);
  });

  //refreshToken
  it('propagates axios errors in refreshToken', async () => {
    const err = new Error('axios fail');
    (api.post as any).mockRejectedValue(err);

    await expect(repo.refreshToken()).rejects.toThrow(err);
  });
});
