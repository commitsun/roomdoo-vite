import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PmsPropertiesRepositoryImpl } from './PmsPropertiesRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';

describe('PmsPropertiesRepositoryImpl', () => {
  let repo: PmsPropertiesRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PmsPropertiesRepositoryImpl();
  });

  it('propagates axios errors in fetchPmsProperties', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchPmsProperties()).rejects.toThrow(err);
  });
  it('propagates axios errors in fetchMenuLinks', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchMenuLinks(1)).rejects.toThrow(err);
  });
  it('propagates axios errors in fetchPmsPropertyLink', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchPmsPropertyLink(1, 1)).rejects.toThrow(err);
  });
});
