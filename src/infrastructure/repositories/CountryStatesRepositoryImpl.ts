import type { CountryState } from '@/domain/entities/CountryState';
import type { CountryStatesRepository } from '@/domain/repositories/CountryStatesRepository';
import { api } from '@/infrastructure/http/axios';

export class CountryStatesRepositoryImpl implements CountryStatesRepository {
  async fetchCountryStates(): Promise<CountryState[]> {
    return api.get('/country-states').then((response) => response.data);
  }
}
