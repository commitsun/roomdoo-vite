import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';

const english: { code: string; name: string } = { code: 'en', name: 'English' };
const spanish: { code: string; name: string } = { code: 'es', name: 'Español' };

export const APP_LANGUAGES = [english, spanish];

export class InstanceService {
  constructor(private instanceRepository: InstanceRepository) {}
  async fetchInstance() {
    let [instance, languages] = await Promise.all([
      this.instanceRepository.fetchInstance(),
      this.instanceRepository.fetchLanguages(),
    ]);
    const appLanguageCodes = APP_LANGUAGES.map((lang) => lang.code);
    languages = languages.filter((lang) => appLanguageCodes.includes(lang.code));

    if (languages.length === 0) {
      languages = [english];
    }
    return {
      ...instance,
      languages,
    };
  }
}
