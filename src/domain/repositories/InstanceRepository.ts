import type { Instance } from '@/domain/entities/Instance';
import type { Language } from '@/domain/entities/Language';

export interface InstanceRepository {
  fetchInstance(): Promise<Instance>;
  fetchLanguages(): Promise<Language[]>;
}
