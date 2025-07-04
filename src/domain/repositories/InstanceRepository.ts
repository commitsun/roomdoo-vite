import type { Instance } from '@/domain/entities/Instance';

export interface InstanceRepository {
  getInstance(): Promise<Instance | undefined>;
}
