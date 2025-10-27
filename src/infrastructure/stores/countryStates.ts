import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { CountryStatesService } from '@/application/countryStates/CountryStatesService';
import { CountryStatesRepositoryImpl } from '@/infrastructure/repositories/CountryStatesRepositoryImpl';
import type { CountryState } from '@/domain/entities/CountryState';

const countryStatesRepository = new CountryStatesRepositoryImpl();

export const useCountryStatesStore = defineStore('countryStates', () => {
  const countryStatesService = new CountryStatesService(countryStatesRepository);
  const countryStates: Ref<CountryState[]> = ref([]);
  const fetchCountryStates = async (): Promise<void> => {
    countryStates.value = await countryStatesService.fetchCountryStates();
  };

  const fetchCountryStatesByCountryId = async (countryId: number): Promise<void> => {
    countryStates.value = await countryStatesService.fetchCountryStatesByCountryId(countryId);
  };

  return {
    countryStates: readonly(countryStates),
    fetchCountryStates,
    fetchCountryStatesByCountryId,
  };
});
