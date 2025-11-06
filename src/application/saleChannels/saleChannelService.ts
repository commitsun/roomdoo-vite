import type { SaleChannel } from '@/domain/entities/SaleChannel';
import type { SaleChannelsRepository } from '@/domain/repositories/SaleChannelsRepository';

export class SaleChannelService {
  constructor(private saleChannelsRepository: SaleChannelsRepository) {}
  async fetchSaleChannels(): Promise<SaleChannel[]> {
    const response = await this.saleChannelsRepository.fetchSaleChannels();
    return response;
  }
}
