import type { Instance } from '@/domain/entities/Instance';
import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';

import type { Language } from '@/domain/entities/Language';
import { api } from '@/infrastructure/http/axios';

export class InstanceRepositoryImpl implements InstanceRepository {
  getInstance(): Promise<Instance | undefined> {
    return api.get<Instance>('/instance').then((response) => response.data);
  }

  getLanguages(): Promise<Language[]> {
    return api.get<Language[]>('/languages').then((response) => response.data);
  }
}
