import type { CountryState } from '@/domain/entities/CountryState';
import type { CountryStatesRepository } from '@/domain/repositories/CountryStatesRepository';

export class CountryStatesService {
  constructor(private countryStatesRepository: CountryStatesRepository) {}
  async fetchCountryStates(): Promise<CountryState[]> {
    const response = await this.countryStatesRepository.fetchCountryStates();
    return response;
  }
}
