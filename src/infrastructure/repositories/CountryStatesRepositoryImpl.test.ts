import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CountryStatesRepositoryImpl } from './CountryStatesRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';
import type { CountryState } from '@/domain/entities/CountryState';

describe('CountryStatesRepositoryImpl', () => {
  let repo: CountryStatesRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new CountryStatesRepositoryImpl();
  });

  describe('fetchCountryStates', () => {
    it('returns country states data on success', async () => {
      const data: CountryState[] = [];
      vi.mocked(api.get).mockResolvedValue({ data });

      const result = await repo.fetchCountryStates();

      expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(api.get)).toHaveBeenCalledWith('/country-states');
      expect(result).toBe(data);
    });

    it('propagates axios errors', async () => {
      const err = new Error('axios fail');
      (api.get as any).mockRejectedValue(err);

      await expect(repo.fetchCountryStates()).rejects.toThrow(err);
    });
  });

  describe('fetchCountryStatesByCountryId', () => {
    it('returns country states data on success', async () => {
      const data: CountryState[] = [];
      vi.mocked(api.get).mockResolvedValue({ data });

      const result = await repo.fetchCountryStatesByCountryId(5);

      expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(api.get)).toHaveBeenCalledWith('/country-states?country=5');
      expect(result).toBe(data);
    });

    it('propagates axios errors', async () => {
      const err = new Error('axios fail');
      (api.get as any).mockRejectedValue(err);

      await expect(repo.fetchCountryStatesByCountryId(5)).rejects.toThrow(err);
    });
  });
});
