import { defineStore } from 'pinia';

import { CountryStatesService } from '@/application/countryStates/CountryStatesService';
import { CountryStatesRepositoryImpl } from '@/infrastructure/repositories/CountryStatesRepositoryImpl';
import type { CountryState } from '@/domain/entities/CountryState';

const countryStatesRepository = new CountryStatesRepositoryImpl();

export const useCountryStatesStore = defineStore('countryStates', () => {
  const countryStatesService = new CountryStatesService(countryStatesRepository);
  const fetchCountryStates = async (): Promise<CountryState[]> => {
    return countryStatesService.fetchCountryStates();
  };

  const fetchCountryStatesByCountryId = async (countryId: number): Promise<CountryState[]> => {
    return countryStatesService.fetchCountryStatesByCountryId(countryId);
  };

  return {
    fetchCountryStates,
    fetchCountryStatesByCountryId,
  };
});
