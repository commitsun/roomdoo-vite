import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';

export class InstanceService {
  constructor(private instanceRepository: InstanceRepository) {}
  async getInstance() {
    const instance = await this.instanceRepository.getInstance();
    if (!instance) {
      return null;
    }
    const languages = await this.instanceRepository.getLanguages();
    return {
      ...instance,
      languages,
    };
  }
}
