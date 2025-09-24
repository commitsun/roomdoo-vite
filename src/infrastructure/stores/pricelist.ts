import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { PricelistService } from '@/application/pricelist/PricelistService';
import { PricelistRepositoryImpl } from '@/infrastructure/repositories/PricelistRepositoryImpl';
import type { Pricelist } from '@/domain/entities/Pricelist';

const pricelistRepository = new PricelistRepositoryImpl();

export const usePricelistStore = defineStore('pricelist', () => {
  const pricelistService = new PricelistService(pricelistRepository);
  const pricelists: Ref<Pricelist[]> = ref([]);
  const fetchPricelists = async () => {
    pricelists.value = await pricelistService.fetchPricelists();
  };
  return {
    pricelists: readonly(pricelists),
    fetchPricelists,
  };
});
