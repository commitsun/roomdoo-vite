import type { Instance } from '@/domain/entities/Instance';
import type { Language } from '@/domain/entities/Language';

export interface InstanceRepository {
  getInstance(): Promise<Instance | null>;
  getLanguages(): Promise<Language[]>;
}
