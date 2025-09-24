import type { Pricelist } from '@/domain/entities/Pricelist';

export interface PricelistRepository {
  fetchPricelists(): Promise<Pricelist[]>;
}
