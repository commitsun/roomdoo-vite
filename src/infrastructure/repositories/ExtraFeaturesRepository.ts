import type { ExtraFeature } from '@/domain/entities/ExtraFeature';
import type { ExtraFeaturesRepository } from '@/domain/repositories/ExtraFeatures';
import { api } from '@/infrastructure/http/axios';

export class ExtraFeaturesRepositoryImpl implements ExtraFeaturesRepository {
  async fetchExtraFeatures(): Promise<ExtraFeature[]> {
    const extraFeatures: ExtraFeature[] = [];
    const userExtraFeaturesResponse = await api.get('/user/extra-features');
    userExtraFeaturesResponse.data.forEach((field: string) => {
      extraFeatures.push({ field: field, source: 'user' });
    });
    const contactExtraFeaturesResponse = await api.get('/contacts/extra-features');
    contactExtraFeaturesResponse.data.forEach((field: string) => {
      extraFeatures.push({ field: field, source: 'contact' });
    });
    return extraFeatures;
  }
}
