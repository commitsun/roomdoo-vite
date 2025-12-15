import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

import { ExtraFeaturesRepositoryImpl } from '@/infrastructure/repositories/ExtraFeaturesRepository';
import { ExtraFeatureService } from '@/application/extraFeatures/ExtraFeatureService';
import type { ExtraFeature } from '@/domain/entities/ExtraFeature';

const extraFeaturesRepository = new ExtraFeaturesRepositoryImpl();

export const useExtraFeatureStore = defineStore('extraFeature', () => {
  const extraFeatures = ref<ExtraFeature[]>([]);
  const extraFeatureService = new ExtraFeatureService(extraFeaturesRepository);
  const fetchExtraFeatures = async (): Promise<ExtraFeature[]> => {
    extraFeatures.value = await extraFeatureService.fetchExtraFeatures();
    return extraFeatures.value;
  };

  return {
    extraFeatures: readonly(extraFeatures),
    fetchExtraFeatures,
  };
});
