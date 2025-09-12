import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { CountriesService } from '@/application/countries/CountriesService';
import { CountriesRepositoryImpl } from '@/infrastructure/repositories/CountriesRepositoryImpl';
import type { Country } from '@/domain/entities/Country';

const countriesRepository = new CountriesRepositoryImpl();

export const useCountriesStore = defineStore('countries', () => {
  const countriesService = new CountriesService(countriesRepository);
  const countries: Ref<Country[]> = ref([]);
  const fetchCountries = async () => {
    countries.value = await countriesService.fetchCountries();
  };
  return {
    countries: readonly(countries),
    fetchCountries,
  };
});
