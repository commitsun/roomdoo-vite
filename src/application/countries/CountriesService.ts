import type { Country } from '@/domain/entities/Country';
import type { CountriesRepository } from '@/domain/repositories/CountriesRepository';

export class CountriesService {
  constructor(private countriesRepository: CountriesRepository) {}
  async fetchCountries(): Promise<Country[]> {
    const response = await this.countriesRepository.fetchCountries();
    return response;
  }
}
