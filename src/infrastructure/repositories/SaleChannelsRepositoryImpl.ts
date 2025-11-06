import type { SaleChannel } from '@/domain/entities/SaleChannel';
import type { SaleChannelsRepository } from '@/domain/repositories/SaleChannelsRepository';
import { api } from '@/infrastructure/http/axios';

export class SaleChannelsRepositoryImpl implements SaleChannelsRepository {
  async fetchSaleChannels(): Promise<SaleChannel[]> {
    return api.get('/sale-channels').then((response) => response.data);
  }
}
