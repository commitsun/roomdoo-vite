import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';
import type { PmsProperty } from '@/domain/entities/PmsProperty';
import { PmsPropertiesRepositoryImpl } from '../repositories/PmsPropertiesRepositoryImpl';
import { PmsPropertiesService } from '@/application/pmsProperties/PmsPropertiesService';
import type { MenuLink } from '@/domain/entities/MenuLink';

const pmsPropertiesRepository = new PmsPropertiesRepositoryImpl();
const pmsPropertiesService = new PmsPropertiesService(pmsPropertiesRepository);

export const usePmsPropertiesStore = defineStore('pmsProperties', () => {
  const currentPmsPropertyId = ref<number | null>(null);
  const pmsProperties: Ref<PmsProperty[]> = ref([]);
  const pmsPropertyLinks = ref<MenuLink[]>([]);

  const fetchPmsProperties = async () => {
    pmsProperties.value = await pmsPropertiesService.fetchPmsProperties();
  };

  const setCurrentPmsPropertyId = async (pmsPropertyId: number) => {
    currentPmsPropertyId.value = pmsPropertyId;
    pmsPropertyLinks.value = await pmsPropertiesService.fetchMenuLinks(pmsPropertyId);
  };

  const fetchPmsPropertyLink = async (pmsPropertyId: number, linkId: number) => {
    return await pmsPropertiesService.fetchPmsPropertyLink(pmsPropertyId, linkId);
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
