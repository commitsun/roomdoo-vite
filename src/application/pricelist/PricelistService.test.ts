import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PricelistService } from './PricelistService';

import type { Pricelist } from '@/domain/entities/Pricelist';
import type { PricelistRepository } from '@/domain/repositories/PricelistRepository';

describe('PricelistService.fetchPricelists', () => {
  let service: PricelistService;
  let repoMock: Partial<Record<keyof PricelistRepository, any>>;

  beforeEach(() => {
    repoMock = {
      fetchPricelists: vi.fn(),
    };
    service = new PricelistService(repoMock as PricelistRepository);
  });

  it('returns pricelists from repository', async () => {
    const pricelists: Pricelist[] = [
      { id: 1, name: 'Standard Pricelist' },
      { id: 2, name: 'Premium Pricelist' },
    ];
    repoMock.fetchPricelists.mockResolvedValue(pricelists);

    const result = await service.fetchPricelists();

    expect(repoMock.fetchPricelists).toHaveBeenCalled();
    expect(result).toBe(pricelists);
  });

  it('propagates repository errors', async () => {
    const err = new Error('network');
    repoMock.fetchPricelists.mockRejectedValue(err);

    await expect(service.fetchPricelists()).rejects.toThrow(err);
  });
});
