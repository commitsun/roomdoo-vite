import type { Country } from '@/domain/entities/Country';
import type { CountriesRepository } from '@/domain/repositories/CountriesRepository';
import { api } from '@/infrastructure/http/axios';

export class CountriesRepositoryImpl implements CountriesRepository {
  async fetchCountries(): Promise<Country[]> {
    return api.get('/countries').then((response) => response.data);
  }
}
