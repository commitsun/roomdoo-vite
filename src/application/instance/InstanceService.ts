import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';

export class InstanceService {
  constructor(private instanceRepository: InstanceRepository) {}
  fetchInstance() {
    return Promise.all([
      this.instanceRepository.fetchInstance(),
      this.instanceRepository.fetchLanguages(),
    ]).then(([instance, languages]) => {
      return {
        ...instance,
        languages,
      };
    });
  }
}
