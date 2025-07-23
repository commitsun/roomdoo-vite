import type { Instance } from '@/domain/entities/Instance';
import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';

import type { Language } from '@/domain/entities/Language';
import { api } from '@/infrastructure/http/axios';

export class InstanceRepositoryImpl implements InstanceRepository {
  async fetchInstance(): Promise<Instance> {
    const response = await api.get<Instance>('/instance');
    return response.data;
  }

  async fetchLanguages(): Promise<Language[]> {
    const response = await api.get<Language[]>('/languages');
    return response.data;
  }
}
