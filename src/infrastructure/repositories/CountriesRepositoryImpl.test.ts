import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CountriesRepositoryImpl } from './CountriesRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';

describe('CountriesRepositoryImpl.fetchCountries', () => {
  let repo: CountriesRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new CountriesRepositoryImpl();
  });

  it('propagates axios errors', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchCountries()).rejects.toThrow(err);
  });
});
