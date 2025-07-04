import { defineStore } from 'pinia';
import { InstanceRepositoryImpl } from '../repositories/InstanceRepositoryImpl';
import { InstanceService } from '@/application/InstanceService';

const instanceRepository = new InstanceRepositoryImpl();
const instanceService = new InstanceService(instanceRepository);

export const useInstanceStore = defineStore('instance', {
  state: () => ({}),
  actions: {
    getInstance: async () => {
      return await instanceService.getInstance();
    },
  },
});
