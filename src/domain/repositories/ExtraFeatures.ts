import type { ExtraFeature } from '@/domain/entities/ExtraFeature';

export interface ExtraFeaturesRepository {
  fetchExtraFeatures(): Promise<ExtraFeature[]>;
}
