import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CountriesService } from './CountriesService';
import type { CountriesRepository } from '@/domain/repositories/CountriesRepository';
import type { Country } from '@/domain/entities/Country';

describe('CountriesService.fetchCountries', () => {
  let service: CountriesService;
  let repoMock: Partial<Record<keyof CountriesRepository, any>>;

  beforeEach(() => {
    repoMock = { fetchCountries: vi.fn() };
    service = new CountriesService(repoMock as CountriesRepository);
  });

  it('returns countries from repository', async () => {
    const countries: Country[] = [{ id: 1, name: 'Spain', code: 'ES' }];
    repoMock.fetchCountries.mockResolvedValue(countries);

    const result = await service.fetchCountries();

    expect(repoMock.fetchCountries).toHaveBeenCalled();
    expect(result).toBe(countries);
  });

  it('propagates repository errors', async () => {
    const err = new Error('network');
    repoMock.fetchCountries.mockRejectedValue(err);

    await expect(service.fetchCountries()).rejects.toThrow(err);
  });
});
