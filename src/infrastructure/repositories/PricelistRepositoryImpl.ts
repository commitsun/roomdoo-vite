import type { Pricelist } from '@/domain/entities/Pricelist';
import type { PricelistRepository } from '@/domain/repositories/PricelistRepository';
import { api } from '@/infrastructure/http/axios';

export class PricelistRepositoryImpl implements PricelistRepository {
  async fetchPricelists(): Promise<Pricelist[]> {
    return api.get('/pricelists').then((response) => response.data);
  }
}
