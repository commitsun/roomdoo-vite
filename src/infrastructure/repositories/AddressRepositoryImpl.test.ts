import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AddressRepositoryImpl } from './AddressRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';
import type { Address } from '@/domain/entities/Address';

describe('AddressRepositoryImpl.fetchAddressById', () => {
  let repo: AddressRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new AddressRepositoryImpl();
  });

  it('returns address data on success', async () => {
    const data: Address[] = [];
    vi.mocked(api.get).mockResolvedValue({ data });

    const result = await repo.fetchAddressByZip('12345');

    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.get)).toHaveBeenCalledWith('/zip-autocomplete', {
      params: { searchParam: '12345' },
    });
    expect(result).toBe(data);
  });

  it('propagates axios errors', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchAddressByZip('12345')).rejects.toThrow(err);
  });
});
