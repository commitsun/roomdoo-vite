import type { Instance } from '@/domain/entities/Instance';
import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';

import type { Language } from '@/domain/entities/Language';
import { api } from '@/infrastructure/http/axios';

export class InstanceRepositoryImpl implements InstanceRepository {
  fetchInstance(): Promise<Instance> {
    return api.get<Instance>('/instance/').then((response) => response.data);
  }

  fetchLanguages(): Promise<Language[]> {
    return api.get<Language[]>('/languages/').then((response) => response.data);
  }
}
