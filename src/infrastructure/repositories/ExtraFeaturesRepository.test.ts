import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ExtraFeaturesRepositoryImpl } from '@/infrastructure/repositories/ExtraFeaturesRepository';
import { api } from '@/infrastructure/http/axios';
import type { ExtraFeature } from '@/domain/entities/ExtraFeature';

vi.mock('@/infrastructure/http/axios', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('ExtraFeaturesRepositoryImpl', () => {
  let repository: ExtraFeaturesRepositoryImpl;

  beforeEach(() => {
    repository = new ExtraFeaturesRepositoryImpl();
    vi.clearAllMocks();
  });

  it('fetches and merges user and contact extra features', async () => {
    const userExtras = ['breakfast', 'parking'];
    const contactExtras = ['late_checkout'];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: userExtras })
      .mockResolvedValueOnce({ data: contactExtras });

    const result = await repository.fetchExtraFeatures();

    expect(api.get).toHaveBeenCalledTimes(2);
    expect(api.get).toHaveBeenNthCalledWith(1, '/user/extra-features');
    expect(api.get).toHaveBeenNthCalledWith(2, '/contacts/extra-features');

    const expected: ExtraFeature[] = [
      { field: 'breakfast', source: 'user' },
      { field: 'parking', source: 'user' },
      { field: 'late_checkout', source: 'contact' },
    ];

    expect(result).toEqual(expected);
  });

  it('returns empty array when both endpoints return empty lists', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [] });

    const result = await repository.fetchExtraFeatures();

    expect(api.get).toHaveBeenCalledTimes(2);
    expect(result).toEqual([]);
  });
});
