import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';
import { InstanceRepositoryImpl } from '../repositories/InstanceRepositoryImpl';
import { InstanceService } from '@/application/instance/InstanceService';
import type { Instance } from '@/domain/entities/Instance';

const instanceRepository = new InstanceRepositoryImpl();
const instanceService = new InstanceService(instanceRepository);

export const useInstanceStore = defineStore('instance', () => {
  const instance: Ref<Instance | null> = ref(null);

  async function fetchInstance() {
    instance.value = await instanceService.fetchInstance();
  }

  return { instance: readonly(instance), fetchInstance };
});
