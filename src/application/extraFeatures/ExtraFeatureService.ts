import type { ExtraFeature } from '@/domain/entities/ExtraFeature';
import type { ExtraFeaturesRepository } from '@/domain/repositories/ExtraFeatures';

export class ExtraFeatureService {
  constructor(private extraFeaturesRepository: ExtraFeaturesRepository) {}
  async fetchExtraFeatures(): Promise<ExtraFeature[]> {
    return this.extraFeaturesRepository.fetchExtraFeatures();
  }
}
