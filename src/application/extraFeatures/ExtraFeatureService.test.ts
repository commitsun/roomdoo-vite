import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ExtraFeatureService } from '@/application/extraFeatures/ExtraFeatureService';
import type { ExtraFeature } from '@/domain/entities/ExtraFeature';
import type { ExtraFeaturesRepository } from '@/domain/repositories/ExtraFeatures';

describe('ExtraFeatureService', () => {
  let repository: ExtraFeaturesRepository;
  let service: ExtraFeatureService;

  beforeEach(() => {
    repository = {
      fetchExtraFeatures: vi.fn(),
    };

    service = new ExtraFeatureService(repository);
  });

  it('fetches extra features from repository', async () => {
    const extras: ExtraFeature[] = [
      { field: 'customField1', source: 'sourceA' },
      { field: 'customField2', source: 'sourceB' },
    ];

    vi.mocked(repository.fetchExtraFeatures).mockResolvedValue(extras);

    const result = await service.fetchExtraFeatures();

    expect(repository.fetchExtraFeatures).toHaveBeenCalledTimes(1);
    expect(result).toEqual(extras);
  });

  it('propagates repository errors', async () => {
    const error = new Error('Repository failure');

    vi.mocked(repository.fetchExtraFeatures).mockRejectedValue(error);

    await expect(service.fetchExtraFeatures()).rejects.toThrow('Repository failure');
  });
});
