import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AddressService } from './AddressService';

import type { AddressRepository } from '@/domain/repositories/AddressRepository';
import type { Address } from '@/domain/entities/Address';

describe('AddressService.fetchAddressByZip', () => {
  let service: AddressService;
  let repoMock: Partial<Record<keyof AddressRepository, any>>;

  beforeEach(() => {
    repoMock = { fetchAddressByZip: vi.fn() };
    service = new AddressService(repoMock as AddressRepository);
  });

  it('returns addresses from repository', async () => {
    const addresses: Address[] = [
      {
        zip: '12345',
        city: 'Springfield',
        state: { id: 1, name: 'State1', country: { id: 1, name: 'Country1', code: 'C1' } },
        country: { id: 1, name: 'Country1', code: 'C1' },
      },
    ];
    repoMock.fetchAddressByZip.mockResolvedValue(addresses);

    const result = await service.fetchAddressByZip('12345');

    expect(repoMock.fetchAddressByZip).toHaveBeenCalledWith('12345');
    expect(result).toBe(addresses);
  });

  it('propagates repository errors', async () => {
    const err = new Error('network');
    repoMock.fetchAddressByZip.mockRejectedValue(err);

    await expect(service.fetchAddressByZip('12345')).rejects.toThrow(err);
  });
});
