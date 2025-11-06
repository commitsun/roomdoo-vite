import type { SaleChannel } from '@/domain/entities/SaleChannel';

export interface SaleChannelsRepository {
  fetchSaleChannels(): Promise<SaleChannel[]>;
}
