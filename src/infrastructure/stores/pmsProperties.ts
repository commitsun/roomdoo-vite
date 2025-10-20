import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { PmsPropertiesRepositoryImpl } from '@/infrastructure/repositories/PmsPropertiesRepositoryImpl';
import type { PmsProperty } from '@/domain/entities/PmsProperty';
import { PmsPropertiesService } from '@/application/pmsProperties/PmsPropertiesService';
import type { MenuLink } from '@/domain/entities/MenuLink';

const pmsPropertiesRepository = new PmsPropertiesRepositoryImpl();
const pmsPropertiesService = new PmsPropertiesService(pmsPropertiesRepository);

export const usePmsPropertiesStore = defineStore('pmsProperties', () => {
  const currentPmsPropertyId = ref<number | null>(null);
  const pmsProperties: Ref<PmsProperty[]> = ref([]);
  const pmsPropertyLinks = ref<MenuLink[]>([]);

  const fetchPmsProperties = async (): Promise<void> => {
    pmsProperties.value = await pmsPropertiesService.fetchPmsProperties();
  };

  const setCurrentPmsPropertyId = async (pmsPropertyId: number): Promise<void> => {
    currentPmsPropertyId.value = pmsPropertyId;
    pmsPropertyLinks.value = await pmsPropertiesService.fetchMenuLinks(pmsPropertyId);
  };

  const fetchPmsPropertyLink = async (pmsPropertyId: number, linkId: number): Promise<string> => {
    return pmsPropertiesService.fetchPmsPropertyLink(pmsPropertyId, linkId);
  };

  return {
    pmsProperties: readonly(pmsProperties),
    currentPmsPropertyId: readonly(currentPmsPropertyId),
    pmsPropertyLinks: readonly(pmsPropertyLinks),
    fetchPmsProperties,
    setCurrentPmsPropertyId,
    fetchPmsPropertyLink,
  };
});
