import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';
import { AppError } from './AppError';

export class InstanceService {
  constructor(private instanceRepository: InstanceRepository) {}
  async fetchInstance() {
    let instance;
    let languages;
    try {
      instance = await this.instanceRepository.fetchInstance();
    } catch (err) {
      throw new AppError('INSTANCE_NOT_FOUND');
    }
    try {
      languages = await this.instanceRepository.fetchLanguages();
    } catch (err) {
      throw new AppError('UNKNOWN_ERROR');
    }
    return {
      ...instance,
      languages,
    };
  }
}
