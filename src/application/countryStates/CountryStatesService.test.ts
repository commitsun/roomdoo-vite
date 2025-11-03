import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CountryStatesService } from './CountryStatesService';

import type { CountryStatesRepository } from '@/domain/repositories/CountryStatesRepository';
import type { CountryState } from '@/domain/entities/CountryState';

describe('CountryStatesService.fetchCountryStates', () => {
  let service: CountryStatesService;
  let repoMock: Partial<Record<keyof CountryStatesRepository, any>>;

  beforeEach(() => {
    repoMock = {
      fetchCountryStates: vi.fn(),
      fetchCountryStatesByCountryId: vi.fn(),
    };
    service = new CountryStatesService(repoMock as CountryStatesRepository);
  });

  it('returns country states from repository', async () => {
    const countryStates: CountryState[] = [
      { id: 1, name: 'State1', country: { id: 1, name: 'Country1', code: 'C1' } },
    ];
    repoMock.fetchCountryStates.mockResolvedValue(countryStates);

    const result = await service.fetchCountryStates();

    expect(repoMock.fetchCountryStates).toHaveBeenCalled();
    expect(result).toBe(countryStates);
  });

  it('propagates repository errors', async () => {
    const err = new Error('network');
    repoMock.fetchCountryStates.mockRejectedValue(err);

    await expect(service.fetchCountryStates()).rejects.toThrow(err);
  });
});

describe('CountryStatesService.fetchCountryStatesByCountryId', () => {
  let service: CountryStatesService;
  let repoMock: Partial<Record<keyof CountryStatesRepository, any>>;

  beforeEach(() => {
    repoMock = {
      fetchCountryStates: vi.fn(),
      fetchCountryStatesByCountryId: vi.fn(),
    };
    service = new CountryStatesService(repoMock as CountryStatesRepository);
  });

  it('returns country states by country ID from repository', async () => {
    const countryStates: CountryState[] = [
      { id: 2, name: 'State2', country: { id: 2, name: 'Country2', code: 'C2' } },
    ];
    repoMock.fetchCountryStatesByCountryId.mockResolvedValue(countryStates);

    const result = await service.fetchCountryStatesByCountryId(2);

    expect(repoMock.fetchCountryStatesByCountryId).toHaveBeenCalledWith(2);
    expect(result).toBe(countryStates);
  });

  it('propagates repository errors', async () => {
    const err = new Error('network');
    repoMock.fetchCountryStatesByCountryId.mockRejectedValue(err);

    await expect(service.fetchCountryStatesByCountryId(2)).rejects.toThrow(err);
  });
});
