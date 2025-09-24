import type { Pricelist } from '@/domain/entities/Pricelist';
import type { PricelistRepository } from '@/domain/repositories/PricelistRepository';

export class PricelistService {
  constructor(private pricelistRepository: PricelistRepository) {}
  async fetchPricelists(): Promise<Pricelist[]> {
    const response = await this.pricelistRepository.fetchPricelists();
    return response;
  }
}
