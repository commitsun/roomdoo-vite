import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstanceRepositoryImpl } from './InstanceRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';

describe('InstanceRepositoryImpl', () => {
  let repo: InstanceRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new InstanceRepositoryImpl();
  });

  it('propagates axios errors in fetchInstance', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchInstance()).rejects.toThrow(err);
  });
  it('propagates axios errors in fetchLanguages', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchLanguages()).rejects.toThrow(err);
  });
});
