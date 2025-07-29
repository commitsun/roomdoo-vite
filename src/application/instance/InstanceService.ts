import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';

export class InstanceService {
  constructor(private instanceRepository: InstanceRepository) {}
  async fetchInstance() {
    const instance = await this.instanceRepository.fetchInstance();
    const languages = await this.instanceRepository.fetchLanguages();

    return {
      ...instance,
      languages,
    };
  }
}
