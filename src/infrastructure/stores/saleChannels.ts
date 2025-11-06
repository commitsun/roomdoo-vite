import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { SaleChannelService } from '@/application/saleChannels/saleChannelService';
import { SaleChannelsRepositoryImpl } from '@/infrastructure/repositories/SaleChannelsRepositoryImpl';
import type { SaleChannel } from '@/domain/entities/SaleChannel';

const saleChannelsRepository = new SaleChannelsRepositoryImpl();

export const useSaleChannelsStore = defineStore('saleChannels', () => {
  const saleChannelService = new SaleChannelService(saleChannelsRepository);
  const saleChannels: Ref<SaleChannel[]> = ref([]);
  const fetchSaleChannels = async (): Promise<void> => {
    saleChannels.value = await saleChannelService.fetchSaleChannels();
  };
  return {
    saleChannels: readonly(saleChannels),
    fetchSaleChannels,
  };
});
