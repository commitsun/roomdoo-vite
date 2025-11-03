import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PricelistRepositoryImpl } from './PricelistRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';

describe('PricelistRepositoryImpl.fetchPricelists', () => {
  let repo: PricelistRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PricelistRepositoryImpl();
  });

  it('propagates axios errors', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchPricelists()).rejects.toThrow(err);
  });
});
