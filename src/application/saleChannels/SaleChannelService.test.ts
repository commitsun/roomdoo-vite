import { describe, it, expect, vi, beforeEach } from 'vitest';

import { SaleChannelService } from './SaleChannelService';

import type { SaleChannel } from '@/domain/entities/SaleChannel';
import type { SaleChannelsRepository } from '@/domain/repositories/SaleChannelsRepository';

describe('SaleChannelService.fetchSaleChannels', () => {
  let service: SaleChannelService;
  let repoMock: Partial<Record<keyof SaleChannelsRepository, any>>;

  beforeEach(() => {
    repoMock = {
      fetchSaleChannels: vi.fn(),
    };
    service = new SaleChannelService(repoMock as SaleChannelsRepository);
  });

  it('returns sale channels from repository', async () => {
    const saleChannels: SaleChannel[] = [
      { id: 1, name: 'Agency', type: 'indirect' },
      { id: 2, name: 'Phone', type: 'direct' },
    ];
    repoMock.fetchSaleChannels.mockResolvedValue(saleChannels);

    const result = await service.fetchSaleChannels();

    expect(repoMock.fetchSaleChannels).toHaveBeenCalled();
    expect(result).toBe(saleChannels);
  });

  it('propagates repository errors', async () => {
    const err = new Error('network');
    repoMock.fetchSaleChannels.mockRejectedValue(err);

    await expect(service.fetchSaleChannels()).rejects.toThrow(err);
  });
});
