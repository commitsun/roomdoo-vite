import { describe, it, expect, vi, beforeEach } from 'vitest';

import { SaleChannelsRepositoryImpl } from './SaleChannelsRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';

describe('SaleChannelsRepositoryImpl.fetchSaleChannels', () => {
  let repo: SaleChannelsRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new SaleChannelsRepositoryImpl();
  });

  it('returns sale channels from the API', async () => {
    const saleChannels = [
      { id: 1, name: 'Agency', type: 'indirect' },
      { id: 2, name: 'Phone', type: 'direct' },
    ];
    (api.get as any).mockResolvedValue({ data: saleChannels });

    const result = await repo.fetchSaleChannels();

    expect(result).toEqual(saleChannels);
  });

  it('propagates axios errors', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchSaleChannels()).rejects.toThrow(err);
  });
});
